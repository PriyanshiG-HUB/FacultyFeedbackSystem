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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataImportWorkflowTest extends TestCase
{
    use RefreshDatabase;

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

    public function test_batch_dataset_import_inserts_records_into_batch_table(): void
    {
        $payload = [
            'dataset_key' => 'batch',
            'rows' => [
                [
                    'batch_title' => '2025-2029',
                    'department_code' => 'CSE',
                    'start_year' => '2025',
                    'end_year' => '2029',
                    'current_semester_no' => '1',
                    'status' => 'ACTIVE',
                ]
            ],
            'file_name' => 'batch_import_test.csv'
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/execute', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'imported_count' => 1,
            ]);

        $this->assertDatabaseHas('batch', [
            'batch_title' => '2025-2029',
            'admission_year' => 2025,
            'graduation_year' => 2029,
        ]);
    }

    public function test_csv_file_import_with_headers_with_spaces_and_aliases_inserts_data(): void
    {
        $csvContent = "Batch Title,Department Code,Start Year,End Year,Current Semester No,Status\n2026-2030,IT,2026,2030,2,ACTIVE";
        $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('batches_with_spaces.csv', $csvContent);

        $validateResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/validate', [
                'dataset_key' => 'batch',
                'file' => $file,
            ]);

        $validateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'valid_rows_count' => 1,
            ]);

        $executePayload = [
            'dataset_key' => 'batch',
            'rows' => $validateResponse->json('valid_rows'),
            'file_name' => 'batches_with_spaces.csv',
        ];

        $executeResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/execute', $executePayload);

        $executeResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'imported_count' => 1,
            ]);

        $this->assertDatabaseHas('batch', [
            'batch_title' => '2026-2030',
        ]);
    }

    public function test_student_bulk_import_imports_576_records_successfully(): void
    {
        $rows = [];
        for ($i = 1; $i <= 576; $i++) {
            $pad = str_pad($i, 4, '0', STR_PAD_LEFT);
            $rows[] = [
                'roll_no' => "CS2026{$pad}",
                'enrollment_no' => "EN2026{$pad}",
                'full_name' => "Student Test {$i}",
                'email' => "student{$pad}@college.edu",
                'mobile' => "980000{$pad}",
                'department_code' => 'CSE',
                'batch_title' => '2026-2030',
                'division_code' => 'A',
                'section_code' => 'S1',
                'status' => 'ACTIVE',
            ];
        }

        $payload = [
            'dataset_key' => 'student',
            'rows' => $rows,
            'file_name' => '576_students_test.csv',
        ];

        $startTime = microtime(true);
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/execute', $payload);
        $duration = microtime(true) - $startTime;

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'imported_count' => 576,
            ]);

        $this->assertLessThan(5.0, $duration, "Importing 576 students took too long ({$duration}s)");

        $this->assertDatabaseHas('student', [
            'roll_no' => 'CS20260001',
            'email' => 'student0001@college.edu',
        ]);
        $this->assertDatabaseHas('student', [
            'roll_no' => 'CS20260576',
            'email' => 'student0576@college.edu',
        ]);
        $this->assertEquals(576, \App\Models\Student::where('roll_no', 'LIKE', 'CS2026%')->count());
    }

    public function test_feedback_question_import_validates_invalid_form_foreign_key(): void
    {
        $payload = [
            'dataset_key' => 'feedback_question',
            'rows' => [
                [
                    'feedback_form_id' => '99999',
                    'question_text' => 'Does the faculty explain concepts clearly?',
                    'category_name' => 'Teaching Quality',
                ]
            ],
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/validate', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'valid_rows_count' => 0,
                'invalid_rows_count' => 1,
            ]);

        $this->assertStringContainsString("Feedback Form '99999' does not exist", json_encode($response->json('errors')));
    }

    public function test_feedback_question_import_persists_records_into_feedback_question_table(): void
    {
        $dept = Department::firstOrCreate(['department_code' => 'CSE'], ['department_name' => 'CSE Dept', 'status' => 'ACTIVE']);
        $year = AcademicYear::firstOrCreate(['year_code' => '2024-2025'], ['title' => '2024-2025', 'start_date' => '2024-07-01', 'end_date' => '2025-06-30', 'status' => 'ACTIVE']);
        $sem = Semester::firstOrCreate(['id' => 1], ['semester_no' => 1, 'term' => 'ODD']);
        $batch = Batch::firstOrCreate(['batch_title' => '2024-2028'], ['department_id' => $dept->id, 'program_name' => 'B.Tech', 'admission_year' => 2024, 'graduation_year' => 2028, 'current_semester_id' => 1, 'status' => 'ACTIVE']);
        $subject = Subject::firstOrCreate(['subject_code' => 'CS101'], ['subject_name' => 'Intro to CS', 'department_id' => $dept->id, 'semester_id' => 1, 'course_type' => 'CORE', 'credits' => 4.0, 'status' => 'ACTIVE']);
        
        $user = UserAccount::firstOrCreate(['email' => 'prof.fq@college.edu'], ['password_hash' => bcrypt('secret'), 'role' => 'FACULTY', 'status' => 'ACTIVE']);
        $desg = \App\Models\Designation::firstOrCreate(['designation_name' => 'Assistant Professor']);
        $faculty = Faculty::firstOrCreate(['email' => 'prof.fq@college.edu'], ['user_account_id' => $user->id, 'full_name' => 'Prof FQ', 'email' => 'prof.fq@college.edu', 'department_id' => $dept->id, 'designation_id' => $desg->id, 'status' => 'ACTIVE']);
        
        $assignment = TeachingAssignment::firstOrCreate([
            'subject_id' => $subject->id,
            'faculty_id' => $faculty->id,
            'batch_id' => $batch->id,
            'academic_year_id' => $year->id,
            'semester_id' => 1,
        ]);

        $form = \App\Models\FeedbackForm::create([
            'form_code' => 'FORM_TEST_101',
            'title' => 'Mid Term Feedback Form',
            'teaching_assignment_id' => $assignment->id,
            'status' => 'ACTIVE',
        ]);

        $payload = [
            'dataset_key' => 'feedback_question',
            'rows' => [
                [
                    'feedback_form_id' => $form->id,
                    'category_name' => 'Teaching Quality',
                    'question_text' => 'Does the faculty arrive on time for lectures?',
                    'question_type' => 'RATING',
                    'is_required' => '1',
                    'max_rating' => '5',
                    'display_order' => '1',
                ],
                [
                    'form_code' => 'FORM_TEST_101',
                    'category_name' => 'Course Material',
                    'question_text' => 'How clear are the subject concepts explained?',
                    'question_type' => 'RATING',
                    'is_required' => '1',
                    'max_rating' => '5',
                    'display_order' => '2',
                ],
            ],
            'file_name' => 'feedback_questions_test.csv',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/data-imports/execute', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'imported_count' => 2,
            ]);

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $form->id,
            'question_text' => 'Does the faculty arrive on time for lectures?',
            'question_type' => 'RATING',
        ]);

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $form->id,
            'question_text' => 'How clear are the subject concepts explained?',
            'question_type' => 'RATING',
        ]);
    }
}
