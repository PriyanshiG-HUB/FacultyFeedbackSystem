<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Division;
use App\Models\Faculty;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackResponse;
use App\Models\Report;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentElectiveEnrollment;
use App\Models\Subject;
use App\Models\SubjectOffering;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EndToEndFacultyFeedbackWorkflowTest extends TestCase
{
    protected string $adminToken;
    protected UserAccount $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminUser = UserAccount::where('email', 'admin@college.edu')->first();
        $this->adminToken = $this->adminUser->createToken('e2e_admin_token')->plainTextToken;
    }

    public function test_complete_faculty_feedback_system_workflow(): void
    {
        $uniqueSuffix = rand(1000, 9999);

        // -------------------------------------------------------------
        // STEP 1: Create Department
        // -------------------------------------------------------------
        Sanctum::actingAs($this->adminUser);
        $deptRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/departments', [
                'department_code' => 'E2E_' . $uniqueSuffix,
                'department_name' => 'E2E Department ' . $uniqueSuffix,
                'status' => 'ACTIVE',
            ]);
        $deptRes->assertStatus(201);
        $deptId = $deptRes->json('data.id');
        $this->assertDatabaseHas('department', ['id' => $deptId]);

        // -------------------------------------------------------------
        // STEP 2: Create Faculty Member
        // -------------------------------------------------------------
        $designation = Designation::first();
        $facRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/faculty', [
                'full_name' => 'Prof. E2E Faculty ' . $uniqueSuffix,
                'email' => "e2e_fac_{$uniqueSuffix}@college.edu",
                'department_id' => $deptId,
                'designation_id' => $designation->id,
                'role' => 'FACULTY',
                'status' => 'ACTIVE',
            ]);
        $facRes->assertStatus(201);
        $facultyId = $facRes->json('data.id');
        $this->assertDatabaseHas('faculty', ['id' => $facultyId, 'department_id' => $deptId]);

        // -------------------------------------------------------------
        // STEP 3: Create Graduation Batch
        // -------------------------------------------------------------
        $batchRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/batches', [
                'batch_title' => "B-{$uniqueSuffix}",
                'department_id' => $deptId,
                'program_name' => 'B.Tech E2E',
                'admission_year' => 2023,
                'graduation_year' => 2027,
                'current_semester_id' => 5,
                'status' => 'ACTIVE',
            ]);
        $batchRes->assertStatus(201);
        $batchId = $batchRes->json('data.id');
        $this->assertDatabaseHas('batch', ['id' => $batchId, 'department_id' => $deptId]);

        // -------------------------------------------------------------
        // STEP 4: Create Division
        // -------------------------------------------------------------
        $divRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/divisions', [
                'division_code' => "DIV-{$uniqueSuffix}",
                'department_id' => $deptId,
                'batch_id' => $batchId,
                'semester_id' => 5,
                'status' => 'ACTIVE',
            ]);
        $divRes->assertStatus(201);
        $divisionId = $divRes->json('data.id');
        $this->assertDatabaseHas('division', ['id' => $divisionId, 'batch_id' => $batchId]);

        // -------------------------------------------------------------
        // STEP 5: Create Section
        // -------------------------------------------------------------
        $secRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/sections', [
                'section_code' => "S1-{$uniqueSuffix}",
                'division_id' => $divisionId,
                'status' => 'ACTIVE',
            ]);
        $secRes->assertStatus(201);
        $sectionId = $secRes->json('data.id');
        $this->assertDatabaseHas('section', ['id' => $sectionId, 'division_id' => $divisionId]);

        // -------------------------------------------------------------
        // STEP 6: Create Student & User Account
        // -------------------------------------------------------------
        $studentRoll = "E2E{$uniqueSuffix}";
        $studentEmail = "e2e_student_{$uniqueSuffix}@college.edu";

        $stuRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/students', [
                'full_name' => "E2E Student {$uniqueSuffix}",
                'roll_no' => $studentRoll,
                'email' => $studentEmail,
                'department_id' => $deptId,
                'batch_id' => $batchId,
                'division_id' => $divisionId,
                'section_id' => $sectionId,
                'status' => 'ACTIVE',
            ]);
        $stuRes->assertStatus(201);
        $studentId = $stuRes->json('data.id');
        $this->assertDatabaseHas('student', [
            'id' => $studentId,
            'roll_no' => $studentRoll,
            'department_id' => $deptId,
            'batch_id' => $batchId,
            'division_id' => $divisionId,
            'section_id' => $sectionId,
        ]);

        $studentUser = UserAccount::where('email', $studentEmail)->first();
        $this->assertNotNull($studentUser);

        // -------------------------------------------------------------
        // STEP 7: Create Core & Elective Subjects
        // -------------------------------------------------------------
        $coreSubRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/subjects', [
                'subject_code' => "CORE{$uniqueSuffix}",
                'subject_name' => "Core Subject {$uniqueSuffix}",
                'department_id' => $deptId,
                'semester_id' => 5,
                'course_type' => 'CORE',
                'credits' => 4.0,
                'status' => 'ACTIVE',
            ]);
        $coreSubRes->assertStatus(201);
        $coreSubjectId = $coreSubRes->json('data.id');

        $elecSubRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/subjects', [
                'subject_code' => "ELEC{$uniqueSuffix}",
                'subject_name' => "Elective Subject {$uniqueSuffix}",
                'department_id' => $deptId,
                'semester_id' => 5,
                'course_type' => 'ELECTIVE',
                'credits' => 3.0,
                'status' => 'ACTIVE',
            ]);
        $elecSubRes->assertStatus(201);
        $elecSubjectId = $elecSubRes->json('data.id');

        // Verify GET /api/subjects?course_type=ELECTIVE returns elective subject
        $getElectives = $this->withHeader('Accept', 'application/json')
            ->getJson('/api/subjects?course_type=ELECTIVE');
        $getElectives->assertStatus(200);
        $this->assertContains("ELEC{$uniqueSuffix}", collect($getElectives->json('data'))->pluck('subject_code')->all());

        // -------------------------------------------------------------
        // STEP 8: Create Subject Offering for Elective Subject
        // -------------------------------------------------------------
        $academicYear = AcademicYear::first();
        $this->assertNotNull($academicYear);

        $offeringRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/subject-offerings', [
                'subject_id' => $elecSubjectId,
                'batch_id' => $batchId,
                'academic_year_id' => $academicYear->id,
                'enrollment_capacity' => 40,
                'status' => 'OPEN',
            ]);
        $offeringRes->assertStatus(201);
        $offeringId = $offeringRes->json('data.id');
        $this->assertDatabaseHas('subject_offering', ['id' => $offeringId, 'subject_id' => $elecSubjectId]);

        // -------------------------------------------------------------
        // STEP 9: Student Elective Enrollment
        // -------------------------------------------------------------
        $enrollRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/elective-enrollments', [
                'student_id' => $studentId,
                'subject_offering_id' => $offeringId,
                'status' => 'ENROLLED',
            ]);
        $enrollRes->assertStatus(201);
        $enrollmentId = $enrollRes->json('data.id');
        $this->assertDatabaseHas('student_elective_enrollment', ['id' => $enrollmentId, 'student_id' => $studentId]);

        // -------------------------------------------------------------
        // STEP 10: Create Teaching Assignment (Faculty -> Core Subject -> Division -> Section)
        // -------------------------------------------------------------
        $taRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/teaching-assignments', [
                'faculty_id' => $facultyId,
                'subject_id' => $coreSubjectId,
                'batch_id' => $batchId,
                'semester_id' => 5,
                'division_id' => $divisionId,
                'section_id' => $sectionId,
                'academic_year_id' => $academicYear->id,
                'status' => 'ACTIVE',
            ]);
        $taRes->assertStatus(201);
        $teachingAssignmentId = $taRes->json('data.id');
        $this->assertDatabaseHas('teaching_assignment', ['id' => $teachingAssignmentId, 'faculty_id' => $facultyId]);

        // -------------------------------------------------------------
        // STEP 11: Create & Publish Feedback Form
        // -------------------------------------------------------------
        $formRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/feedback-forms', [
                'title' => "Feedback Form {$uniqueSuffix}",
                'teaching_assignment_id' => $teachingAssignmentId,
                'academic_year_id' => $academicYear->id,
                'is_published' => true,
            ]);
        $formRes->assertStatus(201);
        $formId = $formRes->json('data.id');
        $this->assertDatabaseHas('feedback_form', ['id' => $formId, 'is_published' => 1]);

        // -------------------------------------------------------------
        // STEP 12: Student Eligible Forms Check (Authenticate as Student)
        // -------------------------------------------------------------
        Sanctum::actingAs($studentUser);

        $eligibleRes = $this->withHeader('Accept', 'application/json')
            ->getJson('/api/student/feedback-forms');
        $eligibleRes->assertStatus(200);
        $eligibleFormIds = collect($eligibleRes->json('data'))->pluck('id')->all();
        $this->assertContains($formId, $eligibleFormIds);

        // -------------------------------------------------------------
        // STEP 13: Student Submits Feedback
        // -------------------------------------------------------------
        $questions = FeedbackQuestion::where('feedback_form_id', $formId)->get();
        $this->assertNotEmpty($questions);

        $answersPayload = [];
        foreach ($questions as $q) {
            $answersPayload[] = [
                'question_id' => $q->id,
                'rating_value' => 5,
            ];
        }

        $submitRes = $this->withHeader('Accept', 'application/json')
            ->postJson("/api/student/feedback-forms/{$formId}/submit", [
                'overall_remark' => 'Excellent clarity and teaching methodology.',
                'answers' => $answersPayload,
            ]);
        $submitRes->assertStatus(201);
        $responseId = $submitRes->json('data.id');

        $this->assertDatabaseHas('feedback_response', [
            'id' => $responseId,
            'feedback_form_id' => $formId,
            'student_id' => $studentId,
        ]);
        $this->assertDatabaseHas('feedback_answer', [
            'response_id' => $responseId,
            'rating_value' => 5,
        ]);

        // -------------------------------------------------------------
        // STEP 14: Verify Duplicate Submission Is Blocked (HTTP 422)
        // -------------------------------------------------------------
        $dupSubmitRes = $this->withHeader('Accept', 'application/json')
            ->postJson("/api/student/feedback-forms/{$formId}/submit", [
                'overall_remark' => 'Trying duplicate submission',
                'answers' => $answersPayload,
            ]);
        $dupSubmitRes->assertStatus(422);

        // -------------------------------------------------------------
        // STEP 15: Verify Form Is No Longer In Pending Eligible List
        // -------------------------------------------------------------
        $afterSubmitEligible = $this->withHeader('Accept', 'application/json')
            ->getJson('/api/student/feedback-forms');
        $afterSubmitEligible->assertStatus(200);
        $remainingIds = collect($afterSubmitEligible->json('data'))->pluck('id')->all();
        $this->assertNotContains($formId, $remainingIds);

        // -------------------------------------------------------------
        // STEP 16: Create and Verify Evaluation Report (As Admin)
        // -------------------------------------------------------------
        Sanctum::actingAs($this->adminUser);

        $repRes = $this->withHeader('Accept', 'application/json')
            ->postJson('/api/reports', [
                'title' => "Accreditation Report {$uniqueSuffix}",
                'department_id' => $deptId,
                'academic_year_id' => $academicYear->id,
                'term' => 'ODD',
                'sample_size' => 1,
                'is_published' => true,
                'status' => 'PUBLISHED',
            ]);
        $repRes->assertStatus(201);
        $reportId = $repRes->json('data.id');
        $this->assertDatabaseHas('report', ['id' => $reportId, 'title' => "Accreditation Report {$uniqueSuffix}"]);

        // -------------------------------------------------------------
        // TEARDOWN / CLEANUP
        // -------------------------------------------------------------
        Report::destroy($reportId);
        FeedbackAnswer::where('response_id', $responseId)->delete();
        FeedbackResponse::destroy($responseId);
        FeedbackQuestion::where('feedback_form_id', $formId)->delete();
        FeedbackForm::destroy($formId);
        TeachingAssignment::destroy($teachingAssignmentId);
        StudentElectiveEnrollment::destroy($enrollmentId);
        SubjectOffering::destroy($offeringId);
        Subject::destroy($elecSubjectId);
        Subject::destroy($coreSubjectId);
        Student::destroy($studentId);
        $studentUser->tokens()->delete();
        $studentUser->delete();
        Section::destroy($sectionId);
        Division::destroy($divisionId);
        Batch::destroy($batchId);
        Faculty::destroy($facultyId);
        Department::destroy($deptId);
    }
}
