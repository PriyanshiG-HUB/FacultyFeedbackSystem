<?php

namespace Tests\Feature;

use App\Models\FeedbackForm;
use App\Models\FeedbackResponse;
use App\Models\UserAccount;
use Tests\TestCase;

class FeedbackModerationAndIsolationTest extends TestCase
{
    protected function getAdminToken(): string
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        return $user->createToken('test_token')->plainTextToken;
    }

    protected function getFacultyToken(): string
    {
        $user = UserAccount::where('email', 'dr.smith@college.edu')->first();
        return $user->createToken('test_token')->plainTextToken;
    }

    public function test_faculty_cannot_see_student_identity_on_anonymous_forms(): void
    {
        $facToken = $this->getFacultyToken();
        $form = FeedbackForm::where('is_anonymous', true)->first();

        if (!$form) {
            $this->markTestSkipped('No anonymous feedback form available.');
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $facToken)
            ->getJson('/api/faculty/feedback-forms');

        $response->assertStatus(200);
        // Verify student information is absent from response array for faculty
        $json = $response->json();
        $this->assertArrayNotHasKey('student', $json['data'][0] ?? []);
        $this->assertArrayNotHasKey('student_id', $json['data'][0] ?? []);
    }

    public function test_faculty_cannot_access_admin_moderation(): void
    {
        $facToken = $this->getFacultyToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $facToken)
            ->getJson('/api/feedback/moderation');

        $response->assertStatus(403);
    }

    public function test_admin_can_exclude_and_restore_feedback_response(): void
    {
        $adminToken = $this->getAdminToken();
        $studentUser = UserAccount::where('email', 'student1@college.edu')->first();
        $form = FeedbackForm::first();

        $resp = FeedbackResponse::firstOrCreate(
            ['feedback_form_id' => $form->id, 'student_id' => $studentUser->student->id],
            [
                'overall_remark' => 'Test comment for moderation',
                'is_excluded' => false,
                'submitted_at' => now(),
            ]
        );

        // Exclude
        $excludeResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson("/api/feedback/responses/{$resp->id}/exclude", [
                'reason' => 'Inappropriate language'
            ]);

        $excludeResponse->assertStatus(200)
            ->assertJsonPath('data.is_excluded', true);

        // Restore
        $restoreResponse = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->postJson("/api/feedback/responses/{$resp->id}/restore");

        $restoreResponse->assertStatus(200)
            ->assertJsonPath('data.is_excluded', false);
    }
}
