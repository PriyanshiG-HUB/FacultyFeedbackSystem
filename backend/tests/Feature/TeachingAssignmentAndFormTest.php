<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Faculty;
use App\Models\FeedbackForm;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Tests\TestCase;

class TeachingAssignmentAndFormTest extends TestCase
{
    protected function getAdminToken(): string
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        return $user->createToken('test_token')->plainTextToken;
    }

    public function test_create_teaching_assignment_case_1_entire_batch(): void
    {
        $token = $this->getAdminToken();

        $fac = Faculty::first();
        $batch = Batch::first();
        $ay = AcademicYear::first();
        $sem = Semester::find(7);

        $code = 'TEST-SUB-' . rand(100, 999);
        $subject = Subject::create([
            'subject_code' => $code,
            'subject_name' => 'Unique Test Subject',
            'department_id' => $batch->department_id,
            'semester_id' => $sem->id,
            'course_type' => 'CORE',
            'credits' => 3.0,
            'status' => 'ACTIVE',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/teaching-assignments', [
                'subject_id' => $subject->id,
                'faculty_id' => $fac->id,
                'batch_id' => $batch->id,
                'academic_year_id' => $ay->id,
                'semester_id' => $sem->id,
                'division_id' => null,
                'section_id' => null,
                'status' => 'ACTIVE',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.scope', 'BATCH');
    }

    public function test_form_publishing_lifecycle(): void
    {
        $token = $this->getAdminToken();
        $ta = TeachingAssignment::first();
        $uniqueCode = 'FF-LIFECYCLE-' . uniqid();

        // 1. Create Form
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/feedback-forms', [
                'teaching_assignment_id' => $ta->id,
                'title' => 'Lifecycle Test Form',
                'form_code' => $uniqueCode,
                'window_start_date' => '2026-08-01',
                'window_end_date' => '2026-12-31',
                'is_anonymous' => true,
                'questions' => [
                    [
                        'question_text' => 'Rate course content delivery',
                        'question_type' => 'RATING',
                        'display_order' => 1,
                        'is_required' => true,
                        'max_rating' => 5,
                    ]
                ]
            ]);

        $createResponse->assertStatus(201);
        $formId = $createResponse->json('data.id');

        // 2. Publish Form
        $publishResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/feedback-forms/{$formId}/publish");

        $publishResponse->assertStatus(200)
            ->assertJsonPath('data.is_published', true);

        // 3. Unpublish Form
        $unpublishResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/feedback-forms/{$formId}/unpublish");

        $unpublishResponse->assertStatus(200)
            ->assertJsonPath('data.is_published', false);
    }
}
