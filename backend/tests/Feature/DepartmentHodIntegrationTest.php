<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Designation;
use App\Models\Faculty;
use App\Models\UserAccount;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DepartmentHodIntegrationTest extends TestCase
{
    use DatabaseTransactions;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminUser = UserAccount::create([
            'email' => 'admin_test_'.uniqid().'@test.com',
            'password_hash' => 'hash',
            'role' => 'SUPER_ADMIN',
            'status' => 'ACTIVE'
        ]);
    }

    private function createDept() {
        return Department::create(['department_name' => 'Dept '.uniqid(), 'department_code' => 'D'.rand(1000,9999), 'status' => 'ACTIVE']);
    }

    private function createFaculty($deptId) {
        $facultyUser = UserAccount::create([
            'email' => 'faculty_test_'.uniqid().'@test.com',
            'password_hash' => 'hash',
            'role' => 'FACULTY',
            'status' => 'ACTIVE'
        ]);
        $designation = Designation::create(['designation_name' => 'Prof '.uniqid(), 'status' => 'ACTIVE']);
        return Faculty::create([
            'user_account_id' => $facultyUser->id,
            'department_id' => $deptId,
            'designation_id' => $designation->id,
            'full_name' => 'Dr. Test '.uniqid(),
            'email' => $facultyUser->email,
            'employee_code' => 'EMP'.uniqid(),
            'joining_date' => '2023-01-01',
            'status' => 'ACTIVE'
        ]);
    }

    public function test_create_department_without_hod()
    {
        $response = $this->actingAs($this->adminUser)->postJson('/api/departments', [
            'department_code' => 'TEST'.rand(10,99),
            'department_name' => 'Test Department',
            'status' => 'ACTIVE'
        ]);

        $response->assertStatus(201);
    }

    public function test_assign_valid_hod_and_refresh_persistence()
    {
        $department = $this->createDept();
        $faculty = $this->createFaculty($department->id);

        $response = $this->actingAs($this->adminUser)->putJson("/api/departments/{$department->id}", [
            'department_name' => 'Updated Dept',
            'department_code' => $department->department_code,
            'hod_faculty_id' => $faculty->id
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('department', [
            'id' => $department->id,
            'hod_faculty_id' => $faculty->id
        ]);

        $getResponse = $this->actingAs($this->adminUser)->getJson("/api/departments/{$department->id}");
        $getResponse->assertStatus(200);
        $getResponse->assertJsonPath('data.hod_faculty.full_name', $faculty->full_name);
    }

    public function test_reject_faculty_from_another_department()
    {
        $departmentCE = $this->createDept();
        $departmentIT = $this->createDept();
        
        $facultyIT = $this->createFaculty($departmentIT->id);

        $response = $this->actingAs($this->adminUser)->putJson("/api/departments/{$departmentCE->id}", [
            'department_name' => 'CE Dept',
            'department_code' => $departmentCE->department_code,
            'hod_faculty_id' => $facultyIT->id
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['hod_faculty_id']);
    }

    public function test_remove_hod()
    {
        $department = $this->createDept();
        $faculty = $this->createFaculty($department->id);

        $department->update(['hod_faculty_id' => $faculty->id]);

        $response = $this->actingAs($this->adminUser)->putJson("/api/departments/{$department->id}", [
            'department_name' => $department->department_name,
            'department_code' => $department->department_code,
            'hod_faculty_id' => null
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('department', [
            'id' => $department->id,
            'hod_faculty_id' => null
        ]);
    }

    public function test_faculty_api_filtering_by_department()
    {
        $department = $this->createDept();
        $faculty = $this->createFaculty($department->id);

        $response = $this->actingAs($this->adminUser)->getJson("/api/departments/{$department->id}/faculty");
        
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => $faculty->id,
            'full_name' => $faculty->full_name
        ]);
    }

    public function test_delete_assigned_hod_nullifies_department_reference()
    {
        $department = $this->createDept();
        $faculty = $this->createFaculty($department->id);

        $department->update(['hod_faculty_id' => $faculty->id]);

        $response = $this->actingAs($this->adminUser)->deleteJson("/api/faculty/{$faculty->id}");

        $response->assertStatus(200);
        
        $this->assertDatabaseMissing('faculty', [
            'id' => $faculty->id
        ]);
        
        $this->assertDatabaseHas('department', [
            'id' => $department->id,
            'hod_faculty_id' => null
        ]);
    }
}
