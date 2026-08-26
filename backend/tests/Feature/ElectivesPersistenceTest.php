<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Student;
use App\Models\StudentElectiveEnrollment;
use App\Models\Subject;
use App\Models\SubjectOffering;
use App\Models\UserAccount;
use Tests\TestCase;

class ElectivesPersistenceTest extends TestCase
{
    protected string $token;
    protected UserAccount $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = UserAccount::where('email', 'admin@college.edu')->first();
        $this->token = $this->admin->createToken('electives_test_token')->plainTextToken;
    }

    public function test_elective_subjects_and_offerings_lifecycle(): void
    {
        // 1. Verify GET /api/subjects?course_type=ELECTIVE returns CEUC301 and CEUC303
        $subjectsRes = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/subjects?course_type=ELECTIVE');

        $subjectsRes->assertStatus(200);
        $codes = collect($subjectsRes->json('data'))->pluck('subject_code')->all();
        $this->assertContains('CEUC301', $codes);
        $this->assertContains('CEUC303', $codes);

        $ceuc301 = Subject::where('subject_code', 'CEUC301')->first();
        $this->assertNotNull($ceuc301);

        $batch = Batch::first();
        $this->assertNotNull($batch);

        $academicYear = AcademicYear::first();
        $this->assertNotNull($academicYear);

        $student = Student::first();
        $this->assertNotNull($student);

        // 2. Create Subject Offering for CEUC301
        $postOffering = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/subject-offerings', [
                'subject_id' => $ceuc301->id,
                'batch_id' => $batch->id,
                'academic_year_id' => $academicYear->id,
                'enrollment_capacity' => 60,
                'status' => 'OPEN',
            ]);

        $postOffering->assertStatus(201);
        $offeringId = $postOffering->json('data.id');

        $this->assertDatabaseHas('subject_offering', [
            'id' => $offeringId,
            'subject_id' => $ceuc301->id,
            'batch_id' => $batch->id,
            'enrollment_capacity' => 60,
        ]);

        // 3. Verify GET /api/subject-offerings returns the offering
        $getOfferings = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/subject-offerings');

        $getOfferings->assertStatus(200);
        $offeringIds = collect($getOfferings->json('data'))->pluck('id')->all();
        $this->assertContains($offeringId, $offeringIds);

        // 4. Enroll Student in Offering
        $enrollRes = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/elective-enrollments', [
                'student_id' => $student->id,
                'subject_offering_id' => $offeringId,
                'status' => 'ENROLLED',
            ]);

        $enrollRes->assertStatus(201);
        $enrollmentId = $enrollRes->json('data.id');

        $this->assertDatabaseHas('student_elective_enrollment', [
            'id' => $enrollmentId,
            'student_id' => $student->id,
            'subject_offering_id' => $offeringId,
        ]);

        // 5. Remove Student Enrollment
        $dropRes = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->deleteJson("/api/elective-enrollments/{$enrollmentId}");

        $dropRes->assertStatus(200);
        $this->assertDatabaseMissing('student_elective_enrollment', ['id' => $enrollmentId]);

        // 6. Delete Subject Offering
        $delOffering = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->deleteJson("/api/subject-offerings/{$offeringId}");

        $delOffering->assertStatus(200);
        $this->assertDatabaseMissing('subject_offering', ['id' => $offeringId]);
    }
}
