<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Department;
use App\Models\Division;
use App\Models\Faculty;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class DataImportWorkflowTest extends TestCase
{
    use DatabaseTransactions;

    protected UserAccount $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = UserAccount::updateOrCreate(
            ['email' => 'admin@college.edu'],
            [
                'password_hash' => bcrypt('password123'),
                'role' => 'SUPER_ADMIN',
                'status' => 'ACTIVE',
            ]
        );
    }

    public function test_can_retrieve_importable_datasets_list(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/data-imports/datasets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['key', 'name', 'description', 'table', 'dependencies', 'excluded_columns', 'columns']
                ]
            ]);

        $this->assertGreaterThanOrEqual(13, count($response->json('data')));
    }

    public function test_can_download_csv_template(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->get('/api/data-imports/template/faculty');

        $response->assertStatus(200);
        $this->assertStringContainsString('full_name', $response->getContent());
        $this->assertStringContainsString('department_code', $response->getContent());
    }

    public function test_validates_required_fields_and_foreign_keys(): void
    {
        $payload = [
            'dataset_key' => 'faculty',
            'rows' => [
                [
                    'full_name' => '',
                    'email' => '',
                    'department_code' => '',
                ]
            ]
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/validate', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'valid_rows_count' => 0,
                'invalid_rows_count' => 1,
            ]);

        $this->assertNotEmpty($response->json('errors'));
    }

    public function test_executes_transactional_bulk_import_and_provisions_user_account(): void
    {
        Department::updateOrCreate(
            ['department_code' => 'IT'],
            [
                'department_name' => 'Information Technology',
                'status' => 'ACTIVE',
            ]
        );

        $payload = [
            'dataset_key' => 'faculty',
            'rows' => [
                [
                    'employee_code' => 'EMP999',
                    'full_name' => 'Dr. Alan Turing',
                    'email' => 'alan.turing@college.edu',
                    'department_code' => 'IT',
                    'status' => 'ACTIVE',
                ]
            ],
            'file_name' => 'faculty_import_test.csv'
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/execute', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'imported_count' => 1,
            ]);

        $this->assertDatabaseHas('faculty', [
            'email' => 'alan.turing@college.edu',
            'full_name' => 'Dr. Alan Turing',
        ]);

        $this->assertDatabaseHas('user_account', [
            'email' => 'alan.turing@college.edu',
            'role' => 'FACULTY',
        ]);

        $this->assertDatabaseHas('data_import_log', [
            'file_name' => 'faculty_import_test.csv',
            'record_count' => 1,
            'status' => 'SUCCESS',
        ]);
    }

    public function test_teaching_assignment_import_auto_provisions_and_persists_records(): void
    {
        $payload = [
            'dataset_key' => 'teaching_assignment',
            'rows' => [
                [
                    'subject_code' => 'CS999',
                    'faculty_email' => 'prof.test@college.edu',
                    'batch_title' => '2024-2028',
                    'year_code' => '2024-2025',
                    'semester_no' => '5',
                    'division_code' => 'A',
                    'section_code' => 'S1',
                    'status' => 'ACTIVE',
                ],
                [
                    'subject_code' => 'CS999',
                    'faculty_email' => 'prof.test@college.edu',
                    'batch_title' => '2024-2028',
                    'year_code' => '2024-2025',
                    'semester_no' => '5',
                    'division_code' => 'B',
                    'section_code' => 'S2',
                    'status' => 'ACTIVE',
                ],
            ],
            'file_name' => 'teaching_assignment_import_test.csv'
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/execute', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'imported_count' => 2,
            ]);

        $subject = Subject::where('subject_code', 'CS999')->first();
        $faculty = Faculty::where('email', 'prof.test@college.edu')->first();
        $batch = Batch::where('batch_title', '2024-2028')->first();
        $year = AcademicYear::where('year_code', '2024-2025')->first();

        $this->assertNotNull($subject);
        $this->assertNotNull($faculty);
        $this->assertNotNull($batch);
        $this->assertNotNull($year);

        $this->assertEquals(2, TeachingAssignment::where('subject_id', $subject->id)
            ->where('faculty_id', $faculty->id)
            ->where('batch_id', $batch->id)
            ->where('academic_year_id', $year->id)
            ->count());
    }

    public function test_get_method_on_execute_route_returns_405_json_response(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/data-imports/execute');

        $response->assertStatus(405)
            ->assertJson([
                'success' => false,
            ]);
    }
}
