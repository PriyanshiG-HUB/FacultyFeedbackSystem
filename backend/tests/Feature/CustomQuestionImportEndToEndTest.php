<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\CustomFeedbackQuestion;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Faculty;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CustomQuestionImportEndToEndTest extends TestCase
{
    use RefreshDatabase;

    protected UserAccount $adminUser;
    protected UserAccount $studentUser;
    protected Student $student;
    protected TeachingAssignment $assignment;
    protected AcademicYear $academicYear;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = UserAccount::create([
            'email' => 'admin_e2e_' . uniqid() . '@college.edu',
            'password_hash' => bcrypt('password'),
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        $dept = Department::firstOrCreate([
            'department_code' => 'IT_E2E',
        ], [
            'department_name' => 'Information Technology',
            'status' => 'ACTIVE',
        ]);

        $desig = Designation::firstOrCreate([
            'designation_name' => 'Associate Professor',
        ], [
            'status' => 'ACTIVE',
        ]);

        $facUser = UserAccount::create([
            'email' => 'faculty_e2e_' . uniqid() . '@college.edu',
            'password_hash' => bcrypt('password'),
            'role' => 'FACULTY',
            'status' => 'ACTIVE',
        ]);

        $faculty = Faculty::create([
            'user_account_id' => $facUser->id,
            'full_name' => 'Dr. Alan Turing',
            'email' => $facUser->email,
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'status' => 'ACTIVE',
        ]);

        $this->academicYear = AcademicYear::firstOrCreate([
            'year_code' => '2025-2026',
        ], [
            'start_date' => '2025-06-01',
            'end_date' => '2026-05-31',
            'status' => 'ACTIVE',
        ]);

        Semester::firstOrCreate(['id' => 5], ['semester_no' => 5, 'term' => 'ODD']);

        $batch = Batch::create([
            'department_id' => $dept->id,
            'batch_title' => '2022-2026',
            'program_name' => 'B.Tech IT',
            'admission_year' => 2022,
            'graduation_year' => 2026,
            'current_semester_id' => 5,
            'status' => 'ACTIVE',
        ]);

        $this->studentUser = UserAccount::create([
            'email' => 'student_e2e_' . uniqid() . '@college.edu',
            'password_hash' => bcrypt('password'),
            'role' => 'STUDENT',
            'status' => 'ACTIVE',
        ]);

        $this->student = Student::create([
            'user_account_id' => $this->studentUser->id,
            'roll_no' => '22IT888',
            'full_name' => 'E2E Student',
            'email' => $this->studentUser->email,
            'department_id' => $dept->id,
            'batch_id' => $batch->id,
            'status' => 'ACTIVE',
        ]);

        $subject = Subject::create([
            'subject_code' => 'IT505_E2E',
            'subject_name' => 'Database Management Systems',
            'department_id' => $dept->id,
            'semester_id' => 5,
            'course_type' => 'CORE',
            'credits' => 4.0,
            'status' => 'ACTIVE',
        ]);

        $this->assignment = TeachingAssignment::create([
            'subject_id' => $subject->id,
            'faculty_id' => $faculty->id,
            'batch_id' => $batch->id,
            'academic_year_id' => $this->academicYear->id,
            'semester_id' => 5,
            'status' => 'ACTIVE',
        ]);
    }

    #[Test]
    public function template_endpoint_returns_custom_question_csv_template_without_question_type()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/custom-feedback-questions/template');

        $response->assertStatus(200);
        $content = $response->getContent();
        $this->assertStringContainsString('question,category,options,is_required', $content);
        $this->assertStringNotContainsString('question_type', $content);
        $this->assertStringContainsString('Explains concepts clearly', $content);
    }

    #[Test]
    public function end_to_end_custom_question_validation_without_question_type_column()
    {
        // Upload valid CSV file without question_type column
        $csvContent = "question,category,options,is_required\n";
        $csvContent .= "\"Explains concepts clearly\",\"Teaching\",\"\",1\n";
        $csvContent .= "\"Provides useful examples\",\"Teaching\",\"\",1\n";
        $csvContent .= "\"Overall feedback and suggestions\",\"General\",\"\",0\n";

        $file = UploadedFile::fake()->createWithContent('custom_questions_no_type.csv', $csvContent);

        $valRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/custom-feedback-questions/validate', [
                'file' => $file,
            ]);

        $valRes->assertStatus(200);
        $valRes->assertJson([
            'success' => true,
            'total_rows' => 3,
            'valid_rows_count' => 3,
            'invalid_rows_count' => 0,
        ]);
    }

    #[Test]
    public function creates_feedback_form_for_all_three_response_types()
    {
        $questionsData = [
            ['question_text' => 'Explains concepts clearly', 'category' => 'Teaching'],
            ['question_text' => 'Provides useful examples', 'category' => 'Teaching'],
        ];

        // 1. RATING Based Form
        $ratingRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/feedback-forms', [
                'teaching_assignment_id' => $this->assignment->id,
                'academic_year_id' => $this->academicYear->id,
                'title' => 'Rating Form',
                'question_source' => 'CUSTOM',
                'response_type' => 'RATING',
                'is_published' => true,
                'questions' => $questionsData,
            ]);
        $ratingRes->assertStatus(201);
        $ratingFormId = $ratingRes->json('data.id');

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $ratingFormId,
            'question_text' => 'Explains concepts clearly',
            'question_type' => 'RATING',
        ]);

        // 2. TEXT Based Form
        $textRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/feedback-forms', [
                'teaching_assignment_id' => $this->assignment->id,
                'academic_year_id' => $this->academicYear->id,
                'title' => 'Text Form',
                'question_source' => 'CUSTOM',
                'response_type' => 'TEXT',
                'is_published' => true,
                'questions' => $questionsData,
            ]);
        $textRes->assertStatus(201);
        $textFormId = $textRes->json('data.id');

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $textFormId,
            'question_text' => 'Explains concepts clearly',
            'question_type' => 'TEXT',
        ]);

        // 3. BOTH Form
        $bothRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/feedback-forms', [
                'teaching_assignment_id' => $this->assignment->id,
                'academic_year_id' => $this->academicYear->id,
                'title' => 'Both Form',
                'question_source' => 'CUSTOM',
                'response_type' => 'BOTH',
                'is_published' => true,
                'questions' => $questionsData,
            ]);
        $bothRes->assertStatus(201);
        $bothFormId = $bothRes->json('data.id');
        $this->assertDatabaseHas('feedback_form', [
            'id' => $bothFormId,
            'response_type' => 'BOTH',
        ]);

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $bothFormId,
            'question_text' => 'Explains concepts clearly',
        ]);
    }

    #[Test]
    public function validation_returns_meaningful_error_when_no_file_uploaded()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/custom-feedback-questions/validate', []);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'No custom question file was uploaded.',
            'errors' => ['No custom question file was uploaded.'],
        ]);
    }

    #[Test]
    public function validation_returns_meaningful_error_when_unsupported_file_uploaded()
    {
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/custom-feedback-questions/validate', [
                'file' => $file,
            ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Only CSV and XLSX files are supported.',
            'errors' => ['Only CSV and XLSX files are supported.'],
        ]);
    }

    #[Test]
    public function validation_returns_meaningful_error_when_required_column_missing()
    {
        $csvContent = "invalid_col1,invalid_col2\nval1,val2\n";
        $file = UploadedFile::fake()->createWithContent('missing_col.csv', $csvContent);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/custom-feedback-questions/validate', [
                'file' => $file,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => false,
            'message' => "Missing required column: 'question'",
        ]);
    }
}
