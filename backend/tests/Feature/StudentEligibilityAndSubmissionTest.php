<?php

namespace Tests\Feature;

use App\Models\FeedbackForm;
use App\Models\FeedbackResponse;
use App\Models\Student;
use App\Models\UserAccount;
use Tests\TestCase;

class StudentEligibilityAndSubmissionTest extends TestCase
{
    public function test_student_can_fetch_eligible_forms(): void
    {
        $studentUser = UserAccount::where('email', 'student1@college.edu')->first();
        $token = $studentUser->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/student/feedback-forms');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_student_can_submit_feedback_form(): void
    {
        $studentUser = UserAccount::where('email', 'student1@college.edu')->first();
        $token = $studentUser->createToken('test_token')->plainTextToken;
        $student = $studentUser->student;

        $form = FeedbackForm::with('questions')->first();

        if (!$form || $form->questions->isEmpty()) {
            $this->markTestSkipped('No form or questions available to test submission.');
        }

        // Clean up prior test response if exists
        FeedbackResponse::where('feedback_form_id', $form->id)
            ->where('student_id', $student->id)
            ->delete();

        $question = $form->questions->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/student/feedback-forms/{$form->id}/submit", [
                'overall_remark' => 'Great teaching style!',
                'answers' => [
                    [
                        'question_id' => $question->id,
                        'rating_value' => 5,
                    ]
                ]
            ]);

        $response->assertStatus(201);
    }

    public function test_student_cannot_submit_duplicate_feedback(): void
    {
        $studentUser = UserAccount::where('email', 'student1@college.edu')->first();
        $token = $studentUser->createToken('test_token')->plainTextToken;

        $form = FeedbackForm::with('questions')->first();

        if (!$form || $form->questions->isEmpty()) {
            $this->markTestSkipped('No form or questions available to test submission.');
        }

        $question = $form->questions->first();

        // Second submission attempt should be rejected with validation error (422)
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/student/feedback-forms/{$form->id}/submit", [
                'overall_remark' => 'Duplicate attempt',
                'answers' => [
                    [
                        'question_id' => $question->id,
                        'rating_value' => 4,
                    ]
                ]
            ]);

        $response->assertStatus(422);
    }
}
