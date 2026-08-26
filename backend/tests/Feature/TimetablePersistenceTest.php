<?php

namespace Tests\Feature;

use App\Models\TeachingAssignment;
use App\Models\Timetable;
use App\Models\UserAccount;
use App\Models\Faculty;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TimetablePersistenceTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear timetables to ensure clean state
        Timetable::query()->delete();
        
        // Manual cleanup to ensure no constraint violations between tests
        \App\Models\TeachingAssignment::where('id', '>', 5)->delete(); // Keep seeded ones
        \App\Models\Section::where('section_code', 'like', '%Test%')->delete();
        \App\Models\Division::where('division_code', 'like', '%Test%')->delete();
    }

    public function test_admin_can_create_timetable()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $assignment = TeachingAssignment::first();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'room' => 'Room A',
            'status' => 'ACTIVE'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('timetables', [
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Monday',
            'room' => 'Room A'
        ]);
    }

    public function test_timetable_detects_faculty_conflict()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $assignment = TeachingAssignment::first();

        Timetable::create([
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Tuesday',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'room' => 'Room B'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment->id, // Same faculty/assignment
            'day' => 'Tuesday',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'room' => 'Room C'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['faculty']);
    }

    public function test_adjacent_time_slots_allowed()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $assignment = TeachingAssignment::first();

        Timetable::create([
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Wednesday',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'room' => 'Room D'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Wednesday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room E'
        ]);

        $response->assertStatus(201);
    }

    public function test_room_conflict_is_case_insensitive_and_trimmed()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $assignment1 = TeachingAssignment::first();
        
        // Create a second teaching assignment with a different faculty
        $faculty2 = Faculty::where('id', '!=', $assignment1->faculty_id)->first();
        $assignment2 = TeachingAssignment::create([
            'subject_id' => $assignment1->subject_id,
            'faculty_id' => $faculty2->id,
            'batch_id' => $assignment1->batch_id,
            'division_id' => null,
            'section_id' => null,
            'academic_year_id' => $assignment1->academic_year_id,
            'semester_id' => $assignment1->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $assignment1->id,
            'day' => 'Thursday',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'room' => 'Room 101'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment2->id,
            'day' => 'Thursday',
            'start_time' => '09:30',
            'end_time' => '10:30',
            'room' => ' room 101 ' // Case insensitive and spaces
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['room']);
    }

    public function test_inactive_timetable_does_not_block_scheduling()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $assignment = TeachingAssignment::first();

        Timetable::create([
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Friday',
            'start_time' => '09:00',
            'end_time' => '11:00',
            'room' => 'Room F',
            'status' => 'INACTIVE'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Friday',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'room' => 'Room F',
            'status' => 'ACTIVE'
        ]);

        $response->assertStatus(201);
    }

    public function test_update_self_conflict()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $assignment = TeachingAssignment::first();

        $timetable = Timetable::create([
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'room' => 'Room X',
            'status' => 'ACTIVE'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson('/api/timetables/' . $timetable->id, [
            'teaching_assignment_id' => $assignment->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'room' => 'Room X',
            'status' => 'ACTIVE'
        ]);

        $response->assertStatus(200);
    }

    public function test_same_section_conflict()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $section = \App\Models\Section::first();
        $division = $section->division;
        
        $assignment1 = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'asc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'asc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => $section->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);
        
        $assignment2 = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'desc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'desc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => $section->id, // Same Section
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $assignment1->id,
            'day' => 'Monday',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'room' => 'Room 1'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment2->id,
            'day' => 'Monday',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'room' => 'Room 2'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['section']);
    }

    public function test_division_vs_section_conflict()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $section = \App\Models\Section::first();
        $division = $section->division;

        // Division-wide assignment
        $divisionAssignment = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'asc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'asc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id, // Same Division
            'section_id' => null, // Entire division
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        $sectionAssignment = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'desc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'desc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => $section->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $divisionAssignment->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 1'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $sectionAssignment->id,
            'day' => 'Monday',
            'start_time' => '10:30', // Overlaps
            'end_time' => '11:30',
            'room' => 'Room 2'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['division']);
    }

    public function test_batch_vs_division_conflict()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $division = \App\Models\Division::first();

        // Batch-wide assignment
        $batchAssignment = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'asc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'asc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => null, // Entire batch
            'section_id' => null,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        $divisionAssignment = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'desc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'desc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => null,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $batchAssignment->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 1'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $divisionAssignment->id,
            'day' => 'Monday',
            'start_time' => '10:30',
            'end_time' => '11:30',
            'room' => 'Room 2'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['batch']);
    }

    public function test_batch_vs_section_conflict()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        $section = \App\Models\Section::first();
        $division = $section->division;

        // Batch-wide assignment
        $batchAssignment = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'asc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'asc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => null, // Entire batch
            'section_id' => null,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        $sectionAssignment = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'desc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'desc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => $section->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $batchAssignment->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 1'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $sectionAssignment->id,
            'day' => 'Monday',
            'start_time' => '10:30',
            'end_time' => '11:30',
            'room' => 'Room 2'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['batch']);
    }

    public function test_different_divisions_allowed()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        
        $division1 = \App\Models\Division::first();
        // Create a second valid division for the same batch
        $division2 = \App\Models\Division::create([
            'department_id' => $division1->department_id,
            'batch_id' => $division1->batch_id,
            'semester_id' => $division1->semester_id,
            'division_code' => 'Div 2 Test',
            'status' => 'ACTIVE'
        ]);

        $assignment1 = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'asc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'asc')->first()->id,
            'batch_id' => $division1->batch_id,
            'division_id' => $division1->id,
            'section_id' => null,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division1->semester_id,
            'status' => 'ACTIVE'
        ]);

        $assignment2 = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'desc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'desc')->first()->id,
            'batch_id' => $division2->batch_id,
            'division_id' => $division2->id, // Different division ID
            'section_id' => null,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division2->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $assignment1->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 1'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment2->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 2'
        ]);

        $response->assertStatus(201);
    }

    public function test_different_sections_allowed()
    {
        $admin = UserAccount::where('role', 'SUPER_ADMIN')->first();
        
        $section1 = \App\Models\Section::first();
        $division = $section1->division;
        
        // Create a second section in the same division
        $section2 = \App\Models\Section::create([
            'division_id' => $division->id,
            'section_code' => 'Sec 2 Test',
            'status' => 'ACTIVE'
        ]);
        
        $assignment1 = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'asc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'asc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => $section1->id,
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        $assignment2 = TeachingAssignment::create([
            'subject_id' => \App\Models\Subject::orderBy('id', 'desc')->first()->id,
            'faculty_id' => \App\Models\Faculty::orderBy('id', 'desc')->first()->id,
            'batch_id' => $division->batch_id,
            'division_id' => $division->id,
            'section_id' => $section2->id, // Different section ID
            'academic_year_id' => \App\Models\AcademicYear::first()->id,
            'semester_id' => $division->semester_id,
            'status' => 'ACTIVE'
        ]);

        Timetable::create([
            'teaching_assignment_id' => $assignment1->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 1'
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/timetables', [
            'teaching_assignment_id' => $assignment2->id,
            'day' => 'Monday',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'room' => 'Room 2'
        ]);

        $response->assertStatus(201);
    }
}

