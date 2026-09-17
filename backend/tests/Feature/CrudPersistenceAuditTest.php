<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Division;
use App\Models\Faculty;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\UserAccount;
use Tests\TestCase;

class CrudPersistenceAuditTest extends TestCase
{
    protected string $token;
    protected UserAccount $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminUser = UserAccount::where('email', 'admin@college.edu')->first();
        $this->token = $this->adminUser->createToken('test_audit_token')->plainTextToken;
    }

    protected function authedRequest(string $method, string $uri, array $data = [])
    {
        return $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->json($method, $uri, $data);
    }

    /**
     * 1. SUBJECTS CRUD PERSISTENCE AUDIT
     */
    public function test_subjects_crud_persistence(): void
    {
        // GET
        $getRes = $this->authedRequest('GET', '/api/subjects');
        $getRes->assertStatus(200);

        // POST (Create)
        $uniqueCode = 'AUDIT-SUB-' . rand(1000, 9999);
        $postRes = $this->authedRequest('POST', '/api/subjects', [
            'subject_code' => $uniqueCode,
            'subject_name' => 'Automated Audit Subject',
            'department_id' => 2,
            'semester_id' => 7,
            'course_type' => 'CORE',
            'credits' => 4.0,
            'status' => 'ACTIVE',
        ]);
        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Confirm Database Record
        $this->assertDatabaseHas('subject', [
            'id' => $createdId,
            'subject_code' => $uniqueCode,
            'subject_name' => 'Automated Audit Subject',
        ]);

        // Re-GET (Survives reload)
        $verifyGet = $this->authedRequest('GET', '/api/subjects');
        $verifyGet->assertStatus(200);
        $codes = collect($verifyGet->json('data'))->pluck('subject_code')->all();
        $this->assertContains($uniqueCode, $codes);

        // Clean up
        $this->authedRequest('DELETE', "/api/subjects/{$createdId}")->assertStatus(200);
        $this->assertDatabaseMissing('subject', ['id' => $createdId]);
    }

    /**
     * 2. DIVISIONS CRUD PERSISTENCE AUDIT
     */
    public function test_divisions_crud_persistence(): void
    {
        // GET
        $getRes = $this->authedRequest('GET', '/api/divisions');
        $getRes->assertStatus(200);

        // POST (Create)
        $uniqueDivCode = 'Div-' . rand(10, 99);
        $postRes = $this->authedRequest('POST', '/api/divisions', [
            'department_id' => 2,
            'batch_id' => 1,
            'semester_id' => 7,
            'division_code' => $uniqueDivCode,
            'status' => 'ACTIVE',
        ]);
        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Confirm Database Record
        $this->assertDatabaseHas('division', [
            'id' => $createdId,
            'division_code' => $uniqueDivCode,
        ]);

        // Re-GET
        $verifyGet = $this->authedRequest('GET', '/api/divisions');
        $verifyGet->assertStatus(200);
        $codes = collect($verifyGet->json('data'))->pluck('division_code')->all();
        $this->assertContains($uniqueDivCode, $codes);

        // Clean up
        $this->authedRequest('DELETE', "/api/divisions/{$createdId}")->assertStatus(200);
        $this->assertDatabaseMissing('division', ['id' => $createdId]);
    }

    /**
     * 3. SECTIONS CRUD PERSISTENCE AUDIT
     */
    public function test_sections_crud_persistence(): void
    {
        // GET
        $getRes = $this->authedRequest('GET', '/api/sections');
        $getRes->assertStatus(200);

        // POST (Create)
        $uniqueSecCode = 'SEC-' . rand(10, 99);
        $postRes = $this->authedRequest('POST', '/api/sections', [
            'division_id' => 1,
            'section_code' => $uniqueSecCode,
            'status' => 'ACTIVE',
        ]);
        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Confirm Database Record
        $this->assertDatabaseHas('section', [
            'id' => $createdId,
            'section_code' => $uniqueSecCode,
        ]);

        // Re-GET
        $verifyGet = $this->authedRequest('GET', '/api/sections');
        $verifyGet->assertStatus(200);
        $codes = collect($verifyGet->json('data'))->pluck('section_code')->all();
        $this->assertContains($uniqueSecCode, $codes);

        // Clean up
        $this->authedRequest('DELETE', "/api/sections/{$createdId}")->assertStatus(200);
        $this->assertDatabaseMissing('section', ['id' => $createdId]);
    }

    /**
     * 4. BATCHES CRUD PERSISTENCE AUDIT
     */
    public function test_batches_crud_persistence(): void
    {
        // GET
        $getRes = $this->authedRequest('GET', '/api/batches');
        $getRes->assertStatus(200);

        // POST (Create)
        $uniqueTitle = 'Batch-Audit-' . rand(100, 999);
        $postRes = $this->authedRequest('POST', '/api/batches', [
            'department_id' => 2,
            'program_name' => 'B.Tech IT',
            'batch_title' => $uniqueTitle,
            'admission_year' => 2024,
            'graduation_year' => 2028,
            'current_semester_id' => 3,
            'status' => 'ACTIVE',
        ]);
        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Confirm Database Record
        $this->assertDatabaseHas('batch', [
            'id' => $createdId,
            'batch_title' => $uniqueTitle,
        ]);

        // Re-GET
        $verifyGet = $this->authedRequest('GET', '/api/batches');
        $verifyGet->assertStatus(200);
        $titles = collect($verifyGet->json('data'))->pluck('batch_title')->all();
        $this->assertContains($uniqueTitle, $titles);

        // Clean up
        $this->authedRequest('DELETE', "/api/batches/{$createdId}")->assertStatus(200);
        $this->assertDatabaseMissing('batch', ['id' => $createdId]);
    }

    /**
     * 5. ACADEMIC YEARS CRUD PERSISTENCE AUDIT
     */
    public function test_academic_years_crud_persistence(): void
    {
        // GET
        $getRes = $this->authedRequest('GET', '/api/academic-years');
        $getRes->assertStatus(200);

        // POST (Create)
        $uniqueYear = 'AY-' . rand(2030, 2040) . '-' . rand(2041, 2050);
        $postRes = $this->authedRequest('POST', '/api/academic-years', [
            'year_code' => $uniqueYear,
            'start_date' => '2030-07-01',
            'end_date' => '2031-06-30',
            'status' => 'ACTIVE',
        ]);
        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Confirm Database Record
        $this->assertDatabaseHas('academic_year', [
            'id' => $createdId,
            'year_code' => $uniqueYear,
        ]);

        // Re-GET
        $verifyGet = $this->authedRequest('GET', '/api/academic-years');
        $verifyGet->assertStatus(200);
        $years = collect($verifyGet->json('data'))->pluck('year_code')->all();
        $this->assertContains($uniqueYear, $years);

        // Clean up
        $this->authedRequest('DELETE', "/api/academic-years/{$createdId}")->assertStatus(200);
        $this->assertDatabaseMissing('academic_year', ['id' => $createdId]);
    }

    /**
     * 6. STUDENTS CRUD PERSISTENCE AUDIT
     */
    public function test_students_crud_persistence(): void
    {
        // GET
        $getRes = $this->authedRequest('GET', '/api/students');
        $getRes->assertStatus(200);

        // POST (Create)
        $uniqueRoll = 'AUDIT-' . rand(10000, 99999);
        $uniqueEmail = 'student.audit.' . rand(1000, 9999) . '@college.edu';
        $postRes = $this->authedRequest('POST', '/api/students', [
            'roll_no' => $uniqueRoll,
            'full_name' => 'Audit Test Student',
            'email' => $uniqueEmail,
            'mobile' => '9998887776',
            'department_id' => 2,
            'batch_id' => 1,
            'division_id' => 1,
            'section_id' => 1,
            'status' => 'ACTIVE',
        ]);
        $postRes->assertStatus(201);
        $createdId = $postRes->json('data.id');

        // Confirm Database Record
        $this->assertDatabaseHas('student', [
            'id' => $createdId,
            'roll_no' => $uniqueRoll,
            'email' => $uniqueEmail,
        ]);

        // PUT (Update)
        $putRes = $this->authedRequest('PUT', "/api/students/{$createdId}", [
            'full_name' => 'Audit Student Renamed',
            'email' => $uniqueEmail,
            'department_id' => 2,
            'batch_id' => 1,
            'division_id' => 1,
            'status' => 'ACTIVE',
        ]);
        $putRes->assertStatus(200);

        $this->assertDatabaseHas('student', [
            'id' => $createdId,
            'full_name' => 'Audit Student Renamed',
        ]);

        // Re-GET
        $verifyGet = $this->authedRequest('GET', '/api/students');
        $verifyGet->assertStatus(200);
        $rolls = collect($verifyGet->json('data'))->pluck('roll_no')->all();
        $this->assertContains($uniqueRoll, $rolls);

        // Clean up
        $this->authedRequest('DELETE', "/api/students/{$createdId}")->assertStatus(200);
        $this->assertDatabaseMissing('student', ['id' => $createdId]);
    }

    /**
     * 7. DEPARTMENTS & FACULTY PERSISTENCE
     */
    public function test_departments_and_faculty_persistence(): void
    {
        // Departments GET
        $this->authedRequest('GET', '/api/departments')->assertStatus(200);

        // Faculty GET
        $this->authedRequest('GET', '/api/faculty')->assertStatus(200);

        // Faculty POST (Create)
        $uniqueFacEmail = 'faculty.audit.' . rand(1000, 9999) . '@college.edu';
        $facPost = $this->authedRequest('POST', '/api/faculty', [
            'full_name' => 'Dr. Audit Professor',
            'email' => $uniqueFacEmail,
            'department_id' => 2,
            'designation_id' => 1,
            'status' => 'ACTIVE',
        ]);
        $facPost->assertStatus(201);
        $facId = $facPost->json('data.id');

        $this->assertDatabaseHas('faculty', [
            'id' => $facId,
            'email' => $uniqueFacEmail,
        ]);

        // Clean up
        $this->authedRequest('DELETE', "/api/faculty/{$facId}")->assertStatus(200);
        $this->assertDatabaseMissing('faculty', ['id' => $facId]);
    }
}
