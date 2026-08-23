<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\SystemSettings;
use App\Models\UserAccount;
use Tests\TestCase;

class ReportingAndSettingsTest extends TestCase
{
    protected function getAdminToken(): string
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        return $user->createToken('test_token')->plainTextToken;
    }

    public function test_admin_can_fetch_and_update_system_settings(): void
    {
        $token = $this->getAdminToken();

        $getResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/system-settings');

        $getResponse->assertStatus(200);

        $settingsId = $getResponse->json('data.id');

        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/system-settings/{$settingsId}", [
                'min_responses_threshold' => 15,
                'enforce_anonymous_submissions' => true,
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.min_responses_threshold', 15);
    }

    public function test_admin_can_create_report(): void
    {
        $token = $this->getAdminToken();
        $ay = AcademicYear::first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/reports', [
                'title' => 'Semester 7 IT Department Feedback Summary',
                'academic_year_id' => $ay->id,
                'term' => 'ODD',
                'sample_size' => 50,
                'is_published' => true,
                'status' => 'PUBLISHED',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Semester 7 IT Department Feedback Summary');
    }
}
