<?php

namespace Tests\Feature;

use App\Models\UserAccount;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Batch;
use App\Models\Division;
use App\Models\Section;
use App\Models\Student;
use Tests\TestCase;

class AcademicHierarchyTest extends TestCase
{
    protected function getAdminToken(): string
    {
        $user = UserAccount::where('email', 'admin@college.edu')->first();
        return $user->createToken('test_token')->plainTextToken;
    }

    protected function getStudentToken(): string
    {
        $user = UserAccount::where('email', 'student1@college.edu')->first();
        return $user->createToken('test_token')->plainTextToken;
    }

    public function test_admin_can_list_departments(): void
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/departments');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_student_cannot_create_department(): void
    {
        $token = $this->getStudentToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/departments', [
                'department_code' => 'MECH',
                'department_name' => 'Mechanical Engg',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_create_and_delete_department(): void
    {
        $token = $this->getAdminToken();

        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/departments', [
                'department_code' => 'TEST_DEPT',
                'department_name' => 'Test Department',
                'status' => 'ACTIVE',
            ]);

        $createResponse->assertStatus(201);
        $deptId = $createResponse->json('data.id');

        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson("/api/departments/{$deptId}");

        $deleteResponse->assertStatus(200);
    }

    public function test_dependent_dropdown_routes(): void
    {
        $token = $this->getAdminToken();
        $dept = Department::where('department_code', 'IT')->first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/departments/{$dept->id}/batches");

        $response->assertStatus(200);
    }
}
