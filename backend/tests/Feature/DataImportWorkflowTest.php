<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Faculty;
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
                    'full_name' => 'John Doe',
                    'email' => 'invalid-email',
                    'department_code' => 'NON_EXISTENT_DEPT',
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
