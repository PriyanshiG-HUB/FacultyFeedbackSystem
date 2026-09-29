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

    public function test_create_department_with_new_hod_faculty_details()
    {
        $code = 'ME' . rand(100, 999);
        $email = 'hod.me.' . uniqid() . '@test.com';

        $response = $this->actingAs($this->adminUser)->postJson('/api/departments', [
            'department_code' => $code,
            'department_name' => 'Mechanical Engineering',
            'status' => 'ACTIVE',
            'hod_full_name' => 'Dr. James Watt',
            'hod_email' => $email,
            'hod_mobile' => '9988776655',
        ]);

        $response->assertStatus(201);
        $deptId = $response->json('data.id');
        $hodFacultyId = $response->json('data.hod_faculty_id');

        $this->assertNotNull($hodFacultyId);

        // Verify Faculty record was created and assigned to the department
        $this->assertDatabaseHas('faculty', [
            'id' => $hodFacultyId,
            'full_name' => 'Dr. James Watt',
            'email' => $email,
            'department_id' => $deptId,
        ]);

        // Verify Faculty appears in existing faculty list endpoint
        $facResponse = $this->actingAs($this->adminUser)->getJson('/api/faculty');
        $facResponse->assertStatus(200);
        $facResponse->assertJsonFragment([
            'id' => $hodFacultyId,
            'full_name' => 'Dr. James Watt',
        ]);
    }

    public function test_update_department_changing_hod_preserves_previous_faculty()
    {
        $department = $this->createDept();
        $oldHod = $this->createFaculty($department->id);
        $department->update(['hod_faculty_id' => $oldHod->id]);

        $newEmail = 'newhod.' . uniqid() . '@test.com';

        // Update department with a new HOD
        $response = $this->actingAs($this->adminUser)->putJson("/api/departments/{$department->id}", [
            'department_name' => $department->department_name,
            'department_code' => $department->department_code,
            'hod_full_name' => 'Dr. New HOD',
            'hod_email' => $newEmail,
        ]);

        $response->assertStatus(200);
        $newHodId = $response->json('data.hod_faculty_id');
        $this->assertNotEquals($oldHod->id, $newHodId);

        // Verify old faculty record is preserved in faculty table
        $this->assertDatabaseHas('faculty', [
            'id' => $oldHod->id,
            'full_name' => $oldHod->full_name,
        ]);

        // Verify new faculty record was created and assigned as HOD
        $this->assertDatabaseHas('faculty', [
            'id' => $newHodId,
            'full_name' => 'Dr. New HOD',
            'email' => $newEmail,
            'department_id' => $department->id,
        ]);

        $this->assertDatabaseHas('department', [
            'id' => $department->id,
            'hod_faculty_id' => $newHodId,
        ]);
    }

    public function test_hod_department_creation_login_and_portal_access()
    {
        $code = 'CSE' . rand(100, 999);
        $email = 'hod.cse.' . uniqid() . '@college.edu';
        $password = 'password123';

        // 1. Admin creates Department and registers HOD
        $createRes = $this->actingAs($this->adminUser)->postJson('/api/departments', [
            'department_code' => $code,
            'department_name' => 'Computer Science & Engineering',
            'status' => 'ACTIVE',
            'hod_full_name' => 'Dr. Alan Turing',
            'hod_email' => $email,
            'hod_password' => $password,
        ]);

        $createRes->assertStatus(201);
        $deptId = $createRes->json('data.id');

        // 2. HOD logs in with email & default password
        $loginRes = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => $password,
        ]);

        $loginRes->assertStatus(200);
        $loginRes->assertJsonPath('user.role', 'HOD');
        $loginRes->assertJsonPath('user.is_hod', true);
        $loginRes->assertJsonPath('user.hod_department_code', $code);

        $hodToken = $loginRes->json('token');
        $this->assertNotEmpty($hodToken);

        // Clear prior actingAs authentication guard so Sanctum Bearer token is used
        auth()->forgetGuards();

        // 3. HOD accesses dashboard scoped to their department
        $dashRes = $this->withHeader('Authorization', 'Bearer ' . $hodToken)
            ->getJson('/api/admin/dashboard');

        $dashRes->assertStatus(200);
        $dashRes->assertJsonPath('department_info.code', $code);
        $dashRes->assertJsonPath('department_info.name', 'Computer Science & Engineering');

        // 4. HOD queries departments list — scoped only to their department
        $deptRes = $this->withHeader('Authorization', 'Bearer ' . $hodToken)
            ->getJson('/api/departments');

        $deptRes->assertStatus(200);
        $deptCodes = collect($deptRes->json('data'))->pluck('department_code')->all();
        $this->assertEquals([$code], $deptCodes);
    }
}
