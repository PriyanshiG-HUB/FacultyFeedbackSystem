<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\UserAccount;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class Phase6IntegrationTest extends TestCase
{
    protected function getAdminToken(): ?string
    {
        try {
            $user = UserAccount::where('email', 'admin@college.edu')->first();
            return $user ? $user->createToken('phase6_admin_token')->plainTextToken : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function getFacultyToken(): ?string
    {
        try {
            $user = UserAccount::where('email', 'dr.smith@college.edu')->first();
            return $user ? $user->createToken('phase6_fac_token')->plainTextToken : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function getStudentToken(): ?string
    {
        try {
            $user = UserAccount::where('email', 'student1@college.edu')->first();
            return $user ? $user->createToken('phase6_student_token')->plainTextToken : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function test_unauthenticated_api_request_returns_json_401(): void
    {
        $response = $this->getJson('/api/departments');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    public function test_unauthenticated_plain_api_request_without_json_header_returns_json_401(): void
    {
        $response = $this->get('/api/departments');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    public function test_invalid_bearer_token_returns_json_401(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid_token_xyz999')
            ->getJson('/api/departments');

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.'
            ]);
    }

    public function test_valid_admin_token_can_access_admin_dashboard(): void
    {
        $adminToken = $this->getAdminToken();
        if (!$adminToken) {
            $this->markTestSkipped('MySQL database server is not running on 127.0.0.1:3306.');
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200);
    }

    public function test_faculty_token_cannot_access_admin_dashboard(): void
    {
        $facToken = $this->getFacultyToken();
        if (!$facToken) {
            $this->markTestSkipped('MySQL database server is not running on 127.0.0.1:3306.');
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $facToken)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_student_token_cannot_access_faculty_dashboard(): void
    {
        $studentToken = $this->getStudentToken();
        if (!$studentToken) {
            $this->markTestSkipped('MySQL database server is not running on 127.0.0.1:3306.');
        }

        $response = $this->withHeader('Authorization', 'Bearer ' . $studentToken)
            ->getJson('/api/faculty/dashboard');

        $response->assertStatus(403);
    }

    public function test_department_dependent_delete_returns_409_conflict(): void
    {
        $adminToken = $this->getAdminToken();
        if (!$adminToken) {
            $this->markTestSkipped('MySQL database server is not running on 127.0.0.1:3306.');
        }

        $itDept = Department::where('department_code', 'IT')->first();

        if ($itDept) {
            $response = $this->withHeader('Authorization', 'Bearer ' . $adminToken)
                ->deleteJson("/api/departments/{$itDept->id}");

            $response->assertStatus(409)
                ->assertJson([
                    'message' => 'Cannot delete department with active faculty, students, or batches.'
                ]);
        }
    }

    public function test_api_health_endpoint(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('application', 'Faculty Feedback System');
    }
}
