<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Department;
use App\Models\Division;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\UserAccount;
use App\Services\Import\DatasetImportRegistry;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StudentCredentialsLoginTest extends TestCase
{
    public function test_student_auto_credentials_and_login_flow(): void
    {
        // 1. Ensure reference academic records exist
        $dept = Department::firstOrCreate(['department_code' => 'IT'], [
            'department_name' => 'Information Technology',
            'status' => 'ACTIVE',
        ]);

        $sem = Semester::firstOrCreate(['id' => 1], [
            'semester_no' => 1,
            'term' => 'ODD',
        ]);

        $batch = Batch::firstOrCreate(['batch_title' => '2024-28', 'department_id' => $dept->id], [
            'program_name' => 'B.Tech',
            'admission_year' => 2024,
            'graduation_year' => 2028,
            'current_semester_id' => $sem->id,
            'status' => 'ACTIVE',
        ]);

        $div = Division::firstOrCreate(['batch_id' => $batch->id, 'division_code' => '1'], [
            'department_id' => $dept->id,
            'semester_id' => $sem->id,
            'status' => 'ACTIVE',
        ]);

        $sec = Section::firstOrCreate(['division_id' => $div->id, 'section_code' => 'A1'], [
            'status' => 'ACTIVE',
        ]);

        $adminUser = UserAccount::where('role', 'SUPER_ADMIN')->first() ?: UserAccount::first();

        // 2. Import student batch including test IDs (24IT019, 24IT020, 24CSE001, 24CSE002)
        $importRows = [
            [
                'roll_no' => '24IT019',
                'full_name' => 'Test Student 24IT019',
                'department_code' => 'IT',
                'batch_title' => '2024-28',
                'division_code' => '1',
                'section_code' => 'A1',
            ],
            [
                'roll_no' => '24IT020',
                'full_name' => 'Test Student 24IT020',
                'department_code' => 'IT',
                'batch_title' => '2024-28',
                'division_code' => '1',
                'section_code' => 'A1',
            ],
            [
                'roll_no' => '24CSE001',
                'full_name' => 'Test Student 24CSE001',
                'department_code' => 'IT',
                'batch_title' => '2024-28',
                'division_code' => '1',
                'section_code' => 'A1',
            ],
            [
                'roll_no' => '24CSE002',
                'full_name' => 'Test Student 24CSE002',
                'department_code' => 'IT',
                'batch_title' => '2024-28',
                'division_code' => '1',
                'section_code' => 'A1',
            ],
        ];

        $importResult = DatasetImportRegistry::executeImport('student', $importRows, $adminUser->id, 'test_students.csv');
        $this->assertTrue($importResult['success']);

        $testStudentIds = ['24IT019', '24IT020', '24CSE001', '24CSE002'];

        foreach ($testStudentIds as $studentId) {
            $expectedEmail = strtolower($studentId) . '@college.edu';

            // Check student record in database
            $student = Student::where('roll_no', $studentId)->first();
            $this->assertNotNull($student, "Student {$studentId} should exist.");
            $this->assertEquals($expectedEmail, $student->email);
            $this->assertNotNull($student->user_account_id);

            // Check UserAccount record
            $userAccount = UserAccount::find($student->user_account_id);
            $this->assertNotNull($userAccount);
            $this->assertEquals($expectedEmail, strtolower($userAccount->email));
            $this->assertTrue(Hash::check('studentit', $userAccount->password_hash), "Password for {$studentId} should hash 'studentit'");

            // Test Login with full email: {student_id}@college.edu
            $emailLoginResponse = $this->postJson('/api/auth/login', [
                'email' => "{$studentId}@college.edu",
                'password' => 'studentit',
            ]);
            $emailLoginResponse->assertStatus(200)
                ->assertJsonPath('message', 'Login successful');

            // Test Login with lowercase email: strtolower({student_id})@college.edu
            $lowerEmailLoginResponse = $this->postJson('/api/auth/login', [
                'email' => $expectedEmail,
                'password' => 'studentit',
            ]);
            $lowerEmailLoginResponse->assertStatus(200)
                ->assertJsonPath('message', 'Login successful');

            // Test Login with student_id / roll_no directly: {student_id}
            $rollNoLoginResponse = $this->postJson('/api/auth/login', [
                'email' => $studentId,
                'password' => 'studentit',
            ]);
            $rollNoLoginResponse->assertStatus(200)
                ->assertJsonPath('message', 'Login successful');
        }

        // Test Re-import does not duplicate user accounts or students
        $reImportResult = DatasetImportRegistry::executeImport('student', $importRows, $adminUser->id, 'test_students_reimport.csv');
        $this->assertTrue($reImportResult['success']);

        foreach ($testStudentIds as $studentId) {
            $count = Student::where('roll_no', $studentId)->count();
            $this->assertEquals(1, $count, "Student {$studentId} should not have duplicate records.");
        }
    }
}
