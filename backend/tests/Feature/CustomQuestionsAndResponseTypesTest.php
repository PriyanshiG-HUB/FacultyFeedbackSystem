<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\CustomFeedbackQuestion;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Faculty;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackResponse;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CustomQuestionsAndResponseTypesTest extends TestCase
{
    use RefreshDatabase;

    protected UserAccount $adminUser;
    protected UserAccount $studentUser;
    protected Student $student;
    protected TeachingAssignment $assignment;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Admin User
        $this->adminUser = UserAccount::create([
            'email' => 'admin_test_' . uniqid() . '@college.edu',
            'password_hash' => bcrypt('password'),
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);

        // 2. Department & Designation
        $dept = Department::firstOrCreate([
            'department_code' => 'IT_TEST',
        ], [
            'department_name' => 'Information Technology',
            'status' => 'ACTIVE',
        ]);

        $desig = Designation::firstOrCreate([
            'designation_name' => 'Professor',
        ], [
            'status' => 'ACTIVE',
        ]);

        // 3. Faculty
        $facUser = UserAccount::create([
            'email' => 'faculty_test_' . uniqid() . '@college.edu',
            'password_hash' => bcrypt('password'),
            'role' => 'FACULTY',
            'status' => 'ACTIVE',
        ]);

        $faculty = Faculty::create([
            'user_account_id' => $facUser->id,
            'full_name' => 'Dr. Jane Smith',
            'email' => $facUser->email,
            'department_id' => $dept->id,
            'designation_id' => $desig->id,
            'status' => 'ACTIVE',
        ]);

        // 4. Academic Year & Semester
        $ay = AcademicYear::firstOrCreate([
            'year_code' => '2025-2026',
        ], [
            'start_date' => '2025-06-01',
            'end_date' => '2026-05-31',
            'status' => 'ACTIVE',
        ]);

        Semester::firstOrCreate(['id' => 5], ['semester_no' => 5, 'term' => 'ODD']);

        // 5. Batch & Student
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
            'email' => 'student_test_' . uniqid() . '@college.edu',
            'password_hash' => bcrypt('password'),
            'role' => 'STUDENT',
            'status' => 'ACTIVE',
        ]);

        $this->student = Student::create([
            'user_account_id' => $this->studentUser->id,
            'roll_no' => '22IT' . rand(100, 999),
            'full_name' => 'Test Student',
            'email' => $this->studentUser->email,
            'department_id' => $dept->id,
            'batch_id' => $batch->id,
            'status' => 'ACTIVE',
        ]);

        // 6. Subject & Assignment
        $subject = Subject::create([
            'subject_code' => 'IT501_' . uniqid(),
            'subject_name' => 'Software Engineering',
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
            'academic_year_id' => $ay->id,
            'semester_id' => 5,
            'status' => 'ACTIVE',
        ]);
    }

    #[Test]
    public function it_can_validate_custom_question_csv_import_with_errors()
    {
        $csvContent = "question,category,question_type\n";
        $csvContent .= ",\"Teaching Quality\",\"RATING\"\n"; // Empty question
        $csvContent .= "\"How clearly are concepts explained?\",\"Teaching Quality\",\"INVALID_TYPE\"\n"; // Invalid type

        $file = UploadedFile::fake()->createWithContent('invalid_questions.csv', $csvContent);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/custom-feedback-questions/validate', [
                'file' => $file,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => false,
            'total_rows' => 2,
            'valid_rows_count' => 0,
            'invalid_rows_count' => 2,
        ]);
    }

    #[Test]
    public function it_can_import_valid_custom_questions_csv()
    {
        $csvContent = "question,category,question_type\n";
        $csvContent .= "\"What did you like about the teaching methodology?\",\"Teaching Methodology\",\"TEXT\"\n";
        $csvContent .= "\"Rate the lab guidance and share your remarks.\",\"Lab Guidance\",\"BOTH\"\n";

        $file = UploadedFile::fake()->createWithContent('valid_questions.csv', $csvContent);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/custom-feedback-questions/import', [
                'file' => $file,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('custom_feedback_questions', [
            'question' => 'What did you like about the teaching methodology?',
            'question_type' => 'TEXT',
        ]);
        $this->assertDatabaseHas('custom_feedback_questions', [
            'question' => 'Rate the lab guidance and share your remarks.',
            'question_type' => 'BOTH',
        ]);
    }

    #[Test]
    public function it_creates_feedback_form_with_custom_questions_and_both_response_type()
    {
        $payload = [
            'teaching_assignment_id' => $this->assignment->id,
            'title' => 'Custom Both Form',
            'question_source' => 'CUSTOM',
            'response_type' => 'BOTH',
            'is_published' => true,
            'questions' => [
                [
                    'question_text' => 'Rate faculty punctuality.',
                    'question_type' => 'RATING',
                    'is_required' => true,
                ],
                [
                    'question_text' => 'What improvements would you suggest?',
                    'question_type' => 'TEXT',
                    'is_required' => true,
                ],
            ],
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/feedback-forms', $payload);

        $response->assertStatus(201);
        $formId = $response->json('data.id');

        $this->assertDatabaseHas('feedback_form', [
            'id' => $formId,
            'question_source' => 'CUSTOM',
            'response_type' => 'BOTH',
        ]);

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $formId,
            'question_text' => 'Rate faculty punctuality.',
            'question_type' => 'RATING',
        ]);

        $this->assertDatabaseHas('feedback_question', [
            'feedback_form_id' => $formId,
            'question_text' => 'What improvements would you suggest?',
            'question_type' => 'TEXT',
        ]);
    }

    #[Test]
    public function student_can_submit_feedback_for_text_and_both_questions_and_report_ignores_text_for_rating_avg()
    {
        $form = FeedbackForm::create([
            'form_code' => 'FF-TEST-' . uniqid(),
            'title' => 'Software Eng Feedback',
            'teaching_assignment_id' => $this->assignment->id,
            'is_published' => true,
            'status' => 'PUBLISHED',
            'question_source' => 'CUSTOM',
            'response_type' => 'BOTH',
        ]);

        $q1 = FeedbackQuestion::create([
            'feedback_form_id' => $form->id,
            'question_text' => 'Subject depth and clarity',
            'question_type' => 'RATING',
            'max_rating' => 5,
        ]);

        $q2 = FeedbackQuestion::create([
            'feedback_form_id' => $form->id,
            'question_text' => 'Detailed comments on lab sessions',
            'question_type' => 'TEXT',
            'max_rating' => 5,
        ]);

        // Student submits answers
        $submitPayload = [
            'overall_remark' => 'Overall good teaching',
            'answers' => [
                [
                    'question_id' => $q1->id,
                    'rating_value' => 5,
                ],
                [
                    'question_id' => $q2->id,
                    'rating_value' => null,
                    'text_value' => 'Lab experiments were very well demonstrated with step-by-step guidance.',
                ],
            ],
        ];

        $subResponse = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/student/feedback-forms/{$form->id}/submit", $submitPayload);

        $subResponse->assertStatus(201);

        $this->assertDatabaseHas('feedback_answer', [
            'question_id' => $q1->id,
            'rating_value' => 5,
        ]);

        $this->assertDatabaseHas('feedback_answer', [
            'question_id' => $q2->id,
            'text_value' => 'Lab experiments were very well demonstrated with step-by-step guidance.',
        ]);

        // Check report generation
        $reportResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson("/api/faculty-reports/report?faculty_id={$this->assignment->faculty_id}&teaching_assignment_id={$this->assignment->id}");

        $reportResponse->assertStatus(200);
        $data = $reportResponse->json('data');

        // Overall average should equal 5.0 (ignoring null rating for q2)
        $this->assertEquals(5.0, $data['overall_average']);
        $this->assertEquals(100.0, $data['overall_percentage']);

        // Comments should include text answer from q2
        $allComments = [];
        foreach ($data['comment_cards'] as $card) {
            foreach ($card['comments'] as $c) {
                $allComments[] = $c;
            }
        }

        $this->assertContains('Lab experiments were very well demonstrated with step-by-step guidance.', $allComments);
    }
}
