<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Faculty;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackResponse;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class FacultyReportTest extends TestCase
{
    use DatabaseTransactions;

    protected UserAccount $adminUser;
    protected UserAccount $hodUser;
    protected Department $deptIT;
    protected Department $deptCSE;
    protected Faculty $facultyIT;
    protected Faculty $facultyCSE;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Admin User
        $this->adminUser = UserAccount::updateOrCreate(
            ['email' => 'superadmin@college.edu'],
            [
                'password_hash' => bcrypt('password123'),
                'role' => 'SUPER_ADMIN',
                'status' => 'ACTIVE',
            ]
        );

        // 2. Departments
        $this->deptIT = Department::updateOrCreate(
            ['department_code' => 'IT_DEPT'],
            [
                'department_name' => 'Information Technology',
                'status' => 'ACTIVE',
            ]
        );

        $this->deptCSE = Department::updateOrCreate(
            ['department_code' => 'CSE_DEPT'],
            [
                'department_name' => 'Computer Science & Engineering',
                'status' => 'ACTIVE',
            ]
        );

        $desg = Designation::firstOrCreate(
            ['designation_name' => 'Associate Professor'],
            ['status' => 'ACTIVE']
        );

        // 3. Faculty IT (HOD User)
        $userIT = UserAccount::create([
            'email' => 'sagar.patel@college.edu',
            'password_hash' => bcrypt('password123'),
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $this->facultyIT = Faculty::create([
            'user_account_id' => $userIT->id,
            'full_name' => 'SAGAR PATEL',
            'email' => 'sagar.patel@college.edu',
            'department_id' => $this->deptIT->id,
            'designation_id' => $desg->id,
            'status' => 'ACTIVE',
        ]);

        // Assign IT Faculty as HOD
        $this->deptIT->update(['hod_faculty_id' => $this->facultyIT->id]);
        $this->hodUser = $userIT;

        // 4. Faculty CSE
        $userCSE = UserAccount::create([
            'email' => 'jane.smith@college.edu',
            'password_hash' => bcrypt('password123'),
            'role' => 'FACULTY',
            'status' => 'ACTIVE',
        ]);

        $this->facultyCSE = Faculty::create([
            'user_account_id' => $userCSE->id,
            'full_name' => 'JANE SMITH',
            'email' => 'jane.smith@college.edu',
            'department_id' => $this->deptCSE->id,
            'designation_id' => $desg->id,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_admin_can_retrieve_faculty_list_across_departments(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/faculty-reports/faculty-list');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $facultyNames = collect($response->json('data'))->pluck('full_name')->toArray();
        $this->assertContains('SAGAR PATEL', $facultyNames);
        $this->assertContains('JANE SMITH', $facultyNames);
    }

    public function test_hod_user_can_only_retrieve_faculty_in_their_department(): void
    {
        $response = $this->actingAs($this->hodUser, 'sanctum')
            ->getJson('/api/faculty-reports/faculty-list');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $facultyNames = collect($response->json('data'))->pluck('full_name')->toArray();
        $this->assertContains('SAGAR PATEL', $facultyNames);
        $this->assertNotContains('JANE SMITH', $facultyNames);
    }

    public function test_can_retrieve_teaching_assignments_for_faculty(): void
    {
        $year = AcademicYear::firstOrCreate(
            ['year_code' => '2025-2026'],
            [
                'title' => 'Academic Year 2025-2026',
                'start_date' => '2025-07-01',
                'end_date' => '2026-06-30',
                'status' => 'ACTIVE',
            ]
        );

        $sem = Semester::firstOrCreate(
            ['id' => 5],
            ['semester_no' => 5, 'term' => 'ODD']
        );

        $batch = Batch::create([
            'department_id' => $this->deptIT->id,
            'program_name' => 'B.Tech',
            'batch_title' => '2023-2027',
            'admission_year' => 2023,
            'graduation_year' => 2027,
            'current_semester_id' => 5,
            'status' => 'ACTIVE',
        ]);

        $subject = Subject::create([
            'subject_code' => 'IT501',
            'subject_name' => 'MOBILE APPLICATION DEVELOPMENT',
            'department_id' => $this->deptIT->id,
            'semester_id' => $sem->id,
            'course_type' => 'CORE',
            'credits' => 4.0,
            'status' => 'ACTIVE',
        ]);

        $assignment = TeachingAssignment::create([
            'subject_id' => $subject->id,
            'faculty_id' => $this->facultyIT->id,
            'batch_id' => $batch->id,
            'academic_year_id' => $year->id,
            'semester_id' => $sem->id,
            'status' => 'ACTIVE',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/faculty-reports/assignments?faculty_id=' . $this->facultyIT->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $subjectCodes = collect($response->json('data'))->pluck('subject_code')->toArray();
        $this->assertContains('IT501', $subjectCodes);
    }

    public function test_generates_faculty_performance_report_with_actual_feedback_data(): void
    {
        $year = AcademicYear::firstOrCreate(
            ['year_code' => '2025-2026'],
            [
                'title' => 'Academic Year 2025-2026',
                'start_date' => '2025-07-01',
                'end_date' => '2026-06-30',
                'status' => 'ACTIVE',
            ]
        );

        $sem = Semester::firstOrCreate(
            ['id' => 6],
            ['semester_no' => 6, 'term' => 'EVEN']
        );

        $batch = Batch::create([
            'department_id' => $this->deptIT->id,
            'program_name' => 'B.Tech',
            'batch_title' => '2023-2027',
            'admission_year' => 2023,
            'graduation_year' => 2027,
            'current_semester_id' => 6,
            'status' => 'ACTIVE',
        ]);

        $subject = Subject::create([
            'subject_code' => 'IT601',
            'subject_name' => 'CLOUD COMPUTING',
            'department_id' => $this->deptIT->id,
            'semester_id' => $sem->id,
            'course_type' => 'CORE',
            'credits' => 4.0,
            'status' => 'ACTIVE',
        ]);

        $assignment = TeachingAssignment::create([
            'subject_id' => $subject->id,
            'faculty_id' => $this->facultyIT->id,
            'batch_id' => $batch->id,
            'academic_year_id' => $year->id,
            'semester_id' => $sem->id,
            'status' => 'ACTIVE',
        ]);

        $form = FeedbackForm::create([
            'form_code' => 'FORM_IT601_2025',
            'title' => 'Cloud Computing Feedback',
            'teaching_assignment_id' => $assignment->id,
            'is_published' => true,
            'status' => 'PUBLISHED',
        ]);

        $q1 = FeedbackQuestion::create([
            'feedback_form_id' => $form->id,
            'question_text' => 'Instructor was an effective lecturer.',
            'question_type' => 'RATING',
            'display_order' => 1,
        ]);

        $q2 = FeedbackQuestion::create([
            'feedback_form_id' => $form->id,
            'question_text' => 'Presentations were clear and organized.',
            'question_type' => 'RATING',
            'display_order' => 2,
        ]);

        // Create 2 Feedback Responses
        $resp1 = FeedbackResponse::create([
            'feedback_form_id' => $form->id,
            'overall_remark' => 'Great teaching style!',
            'is_excluded' => false,
        ]);

        $resp2 = FeedbackResponse::create([
            'feedback_form_id' => $form->id,
            'overall_remark' => 'Very approachable instructor.',
            'is_excluded' => false,
        ]);

        // Add Answers: resp1 gives 5, 5; resp2 gives 4, 4
        FeedbackAnswer::create(['response_id' => $resp1->id, 'question_id' => $q1->id, 'rating_value' => 5]);
        FeedbackAnswer::create(['response_id' => $resp1->id, 'question_id' => $q2->id, 'rating_value' => 5]);
        FeedbackAnswer::create(['response_id' => $resp2->id, 'question_id' => $q1->id, 'rating_value' => 4]);
        FeedbackAnswer::create(['response_id' => $resp2->id, 'question_id' => $q2->id, 'rating_value' => 4]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/faculty-reports/report?faculty_id={$this->facultyIT->id}&teaching_assignment_id={$assignment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'faculty' => [
                        'full_name' => 'SAGAR PATEL',
                        'department_code' => 'IT_DEPT',
                    ],
                    'subject' => [
                        'subject_code' => 'IT601',
                    ],
                    'total_responses' => 2,
                    'overall_average' => 4.5,
                    'overall_percentage' => 90,
                ],
            ]);

        $this->assertNotEmpty($response->json('data.question_statistics'));
        $this->assertNotEmpty($response->json('data.comment_cards'));
    }
}
