<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\UserAccount;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SubjectsSyncTest extends TestCase
{
    use DatabaseTransactions;

    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $admin = UserAccount::where('email', 'admin@college.edu')->first();
        $this->token = $admin->createToken('subjects_sync_test')->plainTextToken;

        Subject::updateOrCreate(
            ['subject_code' => 'CEUC301'],
            [
                'subject_name' => 'Big Data Analysis',
                'department_id' => 1,
                'semester_id' => 5,
                'course_type' => 'ELECTIVE',
                'credits' => 4.0,
                'status' => 'ACTIVE'
            ]
        );
    }

    public function test_get_subjects_returns_ceuc301_and_relationships(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/subjects');

        $response->assertStatus(200);

        // Verify CEUC301 exists in response
        $codes = collect($response->json('data'))->pluck('subject_code')->all();
        $this->assertContains('CEUC301', $codes);

        // Verify CEUC301 item has department and semester loaded
        $ceuc301 = collect($response->json('data'))->firstWhere('subject_code', 'CEUC301');
        $this->assertNotNull($ceuc301);
        $this->assertEquals('Big Data Analysis', $ceuc301['subject_name']);
        $this->assertEquals('ELECTIVE', $ceuc301['course_type']);
        $this->assertEquals(4.0, (float) $ceuc301['credits']);
        $this->assertNotNull($ceuc301['department']);
        $this->assertEquals('Computer Engineering', $ceuc301['department']['department_name']);
        $this->assertNotNull($ceuc301['semester']);
        $this->assertEquals(5, $ceuc301['semester']['semester_no']);
    }

    public function test_create_and_fetch_subject_lifecycle(): void
    {
        $code = 'TEST-SYNC-' . rand(100, 999);
        $postRes = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/subjects', [
                'subject_code' => $code,
                'subject_name' => 'Sync Verification Course',
                'department_id' => 1,
                'semester_id' => 5,
                'course_type' => 'ELECTIVE',
                'credits' => 4.0,
                'status' => 'ACTIVE',
            ]);

        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Verify GET immediately returns newly created subject first
        $getRes = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/subjects');

        $getRes->assertStatus(200);
        $firstItem = $getRes->json('data.0');
        $this->assertEquals($code, $firstItem['subject_code']);

        // Clean up test record
        $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->deleteJson("/api/subjects/{$createdId}")
            ->assertStatus(200);
    }
}
