<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\UserAccount;
use Tests\TestCase;

class DepartmentEndpointTest extends TestCase
{
    protected string $token;
    protected UserAccount $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = UserAccount::where('email', 'admin@college.edu')->first();
        $this->token = $this->admin->createToken('dept_test_token')->plainTextToken;
    }

    /**
     * 1. Direct GET /api/departments test
     */
    public function test_get_departments_endpoint(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/departments');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'department_code',
                    'department_name',
                    'hod_faculty_id',
                    'status',
                    'created_at',
                    'updated_at',
                    'hod_faculty',
                    'faculty_count',
                ]
            ]
        ]);
    }

    /**
     * 2. Direct POST /api/departments test with valid payload
     */
    public function test_create_department_with_valid_payload(): void
    {
        $uniqueCode = 'AI' . rand(10, 99);
        $uniqueName = 'Artificial Intelligence & Data Science ' . rand(10, 99);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/departments', [
                'department_code' => $uniqueCode,
                'department_name' => $uniqueName,
                'status' => 'ACTIVE',
            ]);

        $response->assertStatus(201);
        $createdId = $response->json('data.id');

        // Confirm insertion in MySQL
        $this->assertDatabaseHas('department', [
            'id' => $createdId,
            'department_code' => $uniqueCode,
            'department_name' => $uniqueName,
        ]);

        // Verify GET returns the newly created department
        $getRes = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->getJson('/api/departments');

        $getRes->assertStatus(200);
        $codes = collect($getRes->json('data'))->pluck('department_code')->all();
        $this->assertContains($uniqueCode, $codes);

        // Clean up
        $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->deleteJson("/api/departments/{$createdId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('department', ['id' => $createdId]);
    }

    /**
     * 3. Duplicate HOD validation returns 422 instead of 500 error
     */
    public function test_duplicate_hod_returns_422_validation_error(): void
    {
        // Faculty 1 is already HOD of department 2 (IT)
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/departments', [
                'department_code' => 'DUPHOD',
                'department_name' => 'Duplicate HOD Test',
                'hod_faculty_id' => 1,
                'status' => 'ACTIVE',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['hod_faculty_id']);
        $this->assertEquals(
            'The selected faculty member is already appointed as HOD of another department.',
            $response->json('errors.hod_faculty_id.0')
        );
    }

    /**
     * 4. Duplicate department_code returns 422 instead of 500
     */
    public function test_duplicate_department_code_returns_422(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/departments', [
                'department_code' => 'IT', // Already exists
                'department_name' => 'Another IT Department',
                'status' => 'ACTIVE',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['department_code']);
    }
}
