<?php

namespace App\Services\Import;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\DataImportLog;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Division;
use App\Models\Faculty;
use App\Models\FeedbackQuestionCategory;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\StudentElectiveEnrollment;
use App\Models\Subject;
use App\Models\SubjectOffering;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatasetImportRegistry
{
    /**
     * Get definitions for all 13 importable system datasets.
     */
    public static function getDatasets(): array
    {
        return [
            'department' => [
                'key' => 'department',
                'name' => 'Departments',
                'description' => 'Import academic departments and departmental details.',
                'table' => 'department',
                'model' => Department::class,
                'dependencies' => [],
                'dependency_notice' => null,
                'excluded_columns' => ['id', 'created_at', 'updated_at', 'hod_faculty_id'],
                'columns' => [
                    ['name' => 'department_code', 'required' => true, 'type' => 'Text', 'description' => 'Unique short department code (e.g. IT, CE, CSE)', 'example' => 'IT'],
                    ['name' => 'department_name', 'required' => true, 'type' => 'Text', 'description' => 'Full official department name', 'example' => 'Information Technology'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE (Default: ACTIVE)', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['department_code' => 'IT', 'department_name' => 'Information Technology', 'status' => 'ACTIVE'],
                    ['department_code' => 'CE', 'department_name' => 'Computer Engineering', 'status' => 'ACTIVE'],
                ],
            ],

            'designation' => [
                'key' => 'designation',
                'name' => 'Designations',
                'description' => 'Import faculty academic designations and positions.',
                'table' => 'designation',
                'model' => Designation::class,
                'dependencies' => [],
                'dependency_notice' => null,
                'excluded_columns' => ['id'],
                'columns' => [
                    ['name' => 'designation_name', 'required' => true, 'type' => 'Text', 'description' => 'Faculty rank or title', 'example' => 'Assistant Professor'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE (Default: ACTIVE)', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['designation_name' => 'Assistant Professor', 'status' => 'ACTIVE'],
                    ['designation_name' => 'Associate Professor', 'status' => 'ACTIVE'],
                    ['designation_name' => 'Professor & HOD', 'status' => 'ACTIVE'],
                ],
            ],

            'academic_year' => [
                'key' => 'academic_year',
                'name' => 'Academic Years',
                'description' => 'Import academic calendar session terms.',
                'table' => 'academic_year',
                'model' => AcademicYear::class,
                'dependencies' => [],
                'dependency_notice' => null,
                'excluded_columns' => ['id'],
                'columns' => [
                    ['name' => 'year_code', 'required' => true, 'type' => 'Text', 'description' => 'Unique academic year identifier (e.g. 2026-2027)', 'example' => '2026-2027'],
                    ['name' => 'start_date', 'required' => false, 'type' => 'Date', 'description' => 'Start date (YYYY-MM-DD)', 'example' => '2026-07-01'],
                    ['name' => 'end_date', 'required' => false, 'type' => 'Date', 'description' => 'End date (YYYY-MM-DD)', 'example' => '2027-06-30'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'PLANNED, ACTIVE, or CLOSED (Default: PLANNED)', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['year_code' => '2026-2027', 'start_date' => '2026-07-01', 'end_date' => '2027-06-30', 'status' => 'ACTIVE'],
                    ['year_code' => '2027-2028', 'start_date' => '2027-07-01', 'end_date' => '2028-06-30', 'status' => 'PLANNED'],
                ],
            ],

            'faculty' => [
                'key' => 'faculty',
                'name' => 'Faculty',
                'description' => 'Import faculty members and their departmental affiliations.',
                'table' => 'faculty',
                'model' => Faculty::class,
                'dependencies' => ['Departments', 'Designations'],
                'dependency_notice' => 'Before importing Faculty: Make sure the required Departments and Designations already exist in the system.',
                'excluded_columns' => ['id', 'user_account_id', 'department_id', 'designation_id', 'created_at', 'updated_at'],
                'columns' => [
                    ['name' => 'full_name', 'required' => true, 'type' => 'Text', 'description' => 'Full name of faculty member', 'example' => 'Dr. Robert Vance'],
                    ['name' => 'email', 'required' => true, 'type' => 'Email', 'description' => 'Faculty email address (used for portal login)', 'example' => 'robert.vance@college.edu'],
                    ['name' => 'department_code', 'required' => true, 'type' => 'Text', 'description' => 'Department code (must exist in system)', 'example' => 'IT'],
                    ['name' => 'designation_name', 'required' => false, 'type' => 'Text', 'description' => 'Faculty designation (must exist in system)', 'example' => 'Professor & HOD'],
                    ['name' => 'mobile', 'required' => false, 'type' => 'Text', 'description' => 'Mobile phone number', 'example' => '+91 9876543210'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE (Default: ACTIVE)', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['full_name' => 'Dr. Robert Vance', 'email' => 'robert.vance@college.edu', 'department_code' => 'IT', 'designation_name' => 'Professor & HOD', 'mobile' => '9876543210', 'status' => 'ACTIVE'],
                    ['full_name' => 'Prof. Sarah Jenkins', 'email' => 'sarah.jenkins@college.edu', 'department_code' => 'IT', 'designation_name' => 'Assistant Professor', 'mobile' => '9876543211', 'status' => 'ACTIVE'],
                ],
            ],

            'batch' => [
                'key' => 'batch',
                'name' => 'Batches',
                'description' => 'Import student academic program cohorts / batches.',
                'table' => 'batch',
                'model' => Batch::class,
                'dependencies' => ['Departments', 'Semesters'],
                'dependency_notice' => 'Before importing Batches: Make sure the target Departments already exist in the system.',
                'excluded_columns' => ['id', 'department_id', 'current_semester_id', 'created_at', 'updated_at'],
                'columns' => [
                    ['name' => 'department_code', 'required' => true, 'type' => 'Text', 'description' => 'Department code', 'example' => 'IT'],
                    ['name' => 'program_name', 'required' => true, 'type' => 'Text', 'description' => 'Degree program name (e.g. B.Tech)', 'example' => 'B.Tech IT'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Unique title for cohort', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'admission_year', 'required' => true, 'type' => 'Number', 'description' => 'Year of admission (e.g. 2023)', 'example' => '2023'],
                    ['name' => 'graduation_year', 'required' => true, 'type' => 'Number', 'description' => 'Expected graduation year (e.g. 2027)', 'example' => '2027'],
                    ['name' => 'current_semester_no', 'required' => false, 'type' => 'Number', 'description' => 'Current active semester number (1-8)', 'example' => '7'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE, GRADUATED, or DISCONTINUED', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['department_code' => 'IT', 'program_name' => 'B.Tech IT', 'batch_title' => '2023-2027 B.Tech IT', 'admission_year' => '2023', 'graduation_year' => '2027', 'current_semester_no' => '7', 'status' => 'ACTIVE'],
                    ['department_code' => 'CE', 'program_name' => 'B.Tech CE', 'batch_title' => '2023-2027 B.Tech CE', 'admission_year' => '2023', 'graduation_year' => '2027', 'current_semester_no' => '7', 'status' => 'ACTIVE'],
                ],
            ],

            'division' => [
                'key' => 'division',
                'name' => 'Divisions',
                'description' => 'Import class divisions for student cohorts.',
                'table' => 'division',
                'model' => Division::class,
                'dependencies' => ['Departments', 'Batches', 'Semesters'],
                'dependency_notice' => 'Before importing Divisions: Make sure the required Departments and Batches exist.',
                'excluded_columns' => ['id', 'department_id', 'batch_id', 'semester_id'],
                'columns' => [
                    ['name' => 'department_code', 'required' => true, 'type' => 'Text', 'description' => 'Department code', 'example' => 'IT'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Batch title', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'semester_no', 'required' => true, 'type' => 'Number', 'description' => 'Semester number (1-8)', 'example' => '7'],
                    ['name' => 'division_code', 'required' => true, 'type' => 'Text', 'description' => 'Division identifier (e.g. IT-1, Div-A)', 'example' => 'IT-1'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['department_code' => 'IT', 'batch_title' => '2023-2027 B.Tech IT', 'semester_no' => '7', 'division_code' => 'IT-1', 'status' => 'ACTIVE'],
                    ['department_code' => 'IT', 'batch_title' => '2023-2027 B.Tech IT', 'semester_no' => '7', 'division_code' => 'IT-2', 'status' => 'ACTIVE'],
                ],
            ],

            'section' => [
                'key' => 'section',
                'name' => 'Sections',
                'description' => 'Import division sections or practical lab batches.',
                'table' => 'section',
                'model' => Section::class,
                'dependencies' => ['Divisions'],
                'dependency_notice' => 'Before importing Sections: Make sure the parent Divisions already exist.',
                'excluded_columns' => ['id', 'division_id'],
                'columns' => [
                    ['name' => 'division_code', 'required' => true, 'type' => 'Text', 'description' => 'Parent division code (e.g. IT-1)', 'example' => 'IT-1'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Batch title for division lookup', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'section_code', 'required' => true, 'type' => 'Text', 'description' => 'Section code (e.g. A, B, Sec-1)', 'example' => 'A'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['division_code' => 'IT-1', 'batch_title' => '2023-2027 B.Tech IT', 'section_code' => 'A', 'status' => 'ACTIVE'],
                    ['division_code' => 'IT-1', 'batch_title' => '2023-2027 B.Tech IT', 'section_code' => 'B', 'status' => 'ACTIVE'],
                ],
            ],

            'student' => [
                'key' => 'student',
                'name' => 'Students',
                'description' => 'Import student rosters with complete cohort hierarchy.',
                'table' => 'student',
                'model' => Student::class,
                'dependencies' => ['Departments', 'Batches', 'Divisions', 'Sections'],
                'dependency_notice' => 'Before importing Students: Make sure the required Departments, Batches, Divisions, and Sections exist in the system.',
                'excluded_columns' => ['id', 'user_account_id', 'department_id', 'batch_id', 'division_id', 'section_id', 'created_at', 'updated_at'],
                'columns' => [
                    ['name' => 'roll_no', 'required' => true, 'type' => 'Text', 'description' => 'Unique student roll number', 'example' => '22IT001'],
                    ['name' => 'full_name', 'required' => true, 'type' => 'Text', 'description' => 'Full name of student', 'example' => 'Alexander Wright'],
                    ['name' => 'department_code', 'required' => true, 'type' => 'Text', 'description' => 'Department code', 'example' => 'IT'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Batch title', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'division_code', 'required' => true, 'type' => 'Text', 'description' => 'Division code', 'example' => 'IT-1'],
                    ['name' => 'section_code', 'required' => true, 'type' => 'Text', 'description' => 'Section code', 'example' => 'A'],
                    ['name' => 'enrollment_no', 'required' => false, 'type' => 'Text', 'description' => 'University enrollment number', 'example' => 'EN2022001'],
                    ['name' => 'email', 'required' => false, 'type' => 'Email', 'description' => 'Student email address', 'example' => '22it001@student.college.edu'],
                    ['name' => 'mobile', 'required' => false, 'type' => 'Text', 'description' => 'Mobile number', 'example' => '+91 9876500001'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE, INACTIVE, GRADUATED, or WITHDRAWN', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['roll_no' => '22IT001', 'full_name' => 'Alexander Wright', 'department_code' => 'IT', 'batch_title' => '2023-2027 B.Tech IT', 'division_code' => 'IT-1', 'section_code' => 'A', 'enrollment_no' => 'EN2022001', 'email' => '22it001@student.college.edu', 'mobile' => '9876500001', 'status' => 'ACTIVE'],
                    ['roll_no' => '22IT002', 'full_name' => 'Sophia Martinez', 'department_code' => 'IT', 'batch_title' => '2023-2027 B.Tech IT', 'division_code' => 'IT-1', 'section_code' => 'A', 'enrollment_no' => 'EN2022002', 'email' => '22it002@student.college.edu', 'mobile' => '9876500002', 'status' => 'ACTIVE'],
                ],
            ],

            'subject' => [
                'key' => 'subject',
                'name' => 'Subjects / Courses',
                'description' => 'Import curriculum subjects and courses.',
                'table' => 'subject',
                'model' => Subject::class,
                'dependencies' => ['Departments', 'Semesters'],
                'dependency_notice' => 'Before importing Subjects: Make sure target Departments exist.',
                'excluded_columns' => ['id', 'department_id', 'semester_id', 'created_at', 'updated_at'],
                'columns' => [
                    ['name' => 'subject_code', 'required' => true, 'type' => 'Text', 'description' => 'Unique subject code (e.g. IT701)', 'example' => 'IT701'],
                    ['name' => 'subject_name', 'required' => true, 'type' => 'Text', 'description' => 'Full subject / course name', 'example' => 'Cloud Computing & DevOps'],
                    ['name' => 'department_code', 'required' => true, 'type' => 'Text', 'description' => 'Offering department code', 'example' => 'IT'],
                    ['name' => 'semester_no', 'required' => true, 'type' => 'Number', 'description' => 'Semester number (1-8)', 'example' => '7'],
                    ['name' => 'course_type', 'required' => false, 'type' => 'Enum', 'description' => 'CORE or ELECTIVE (Default: CORE)', 'example' => 'CORE'],
                    ['name' => 'credits', 'required' => false, 'type' => 'Number', 'description' => 'Course credit weight (e.g. 4.0)', 'example' => '4.0'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['subject_code' => 'IT701', 'subject_name' => 'Cloud Computing & DevOps', 'department_code' => 'IT', 'semester_no' => '7', 'course_type' => 'CORE', 'credits' => '4.0', 'status' => 'ACTIVE'],
                    ['subject_code' => 'IT702', 'subject_name' => 'Information & Cyber Security', 'department_code' => 'IT', 'semester_no' => '7', 'course_type' => 'CORE', 'credits' => '4.0', 'status' => 'ACTIVE'],
                ],
            ],

            'subject_offering' => [
                'key' => 'subject_offering',
                'name' => 'Subject Offerings (Electives)',
                'description' => 'Import elective course offerings for student batches.',
                'table' => 'subject_offering',
                'model' => SubjectOffering::class,
                'dependencies' => ['Subjects', 'Batches', 'Academic Years'],
                'dependency_notice' => 'Before importing Elective Offerings: Ensure the Subject is set as ELECTIVE and the Batch and Academic Year exist.',
                'excluded_columns' => ['id', 'subject_id', 'batch_id', 'academic_year_id'],
                'columns' => [
                    ['name' => 'subject_code', 'required' => true, 'type' => 'Text', 'description' => 'Elective subject code', 'example' => 'IT705'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Target batch title', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'year_code', 'required' => true, 'type' => 'Text', 'description' => 'Academic year code', 'example' => '2026-2027'],
                    ['name' => 'enrollment_capacity', 'required' => true, 'type' => 'Number', 'description' => 'Maximum student capacity', 'example' => '60'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'OPEN or CLOSED', 'example' => 'OPEN'],
                ],
                'sample_rows' => [
                    ['subject_code' => 'IT705', 'batch_title' => '2023-2027 B.Tech IT', 'year_code' => '2026-2027', 'enrollment_capacity' => '60', 'status' => 'OPEN'],
                ],
            ],

            'teaching_assignment' => [
                'key' => 'teaching_assignment',
                'name' => 'Faculty-Course Assignments',
                'description' => 'Import teaching allocations mapping Faculty to Subjects and Classes.',
                'table' => 'teaching_assignment',
                'model' => TeachingAssignment::class,
                'dependencies' => ['Faculty', 'Subjects', 'Batches', 'Academic Years', 'Semesters'],
                'dependency_notice' => 'Before importing Teaching Assignments: Make sure Faculty, Subjects, Batches, and Academic Years exist.',
                'excluded_columns' => ['id', 'subject_id', 'faculty_id', 'batch_id', 'division_id', 'section_id', 'academic_year_id', 'semester_id', 'created_at', 'updated_at'],
                'columns' => [
                    ['name' => 'subject_code', 'required' => true, 'type' => 'Text', 'description' => 'Subject code', 'example' => 'IT701'],
                    ['name' => 'faculty_email', 'required' => true, 'type' => 'Email', 'description' => 'Faculty email address', 'example' => 'robert.vance@college.edu'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Batch title', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'year_code', 'required' => true, 'type' => 'Text', 'description' => 'Academic year code', 'example' => '2026-2027'],
                    ['name' => 'semester_no', 'required' => true, 'type' => 'Number', 'description' => 'Semester number (1-8)', 'example' => '7'],
                    ['name' => 'division_code', 'required' => false, 'type' => 'Text', 'description' => 'Optional division code', 'example' => 'IT-1'],
                    ['name' => 'section_code', 'required' => false, 'type' => 'Text', 'description' => 'Optional section code', 'example' => 'A'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ACTIVE or INACTIVE', 'example' => 'ACTIVE'],
                ],
                'sample_rows' => [
                    ['subject_code' => 'IT701', 'faculty_email' => 'robert.vance@college.edu', 'batch_title' => '2023-2027 B.Tech IT', 'year_code' => '2026-2027', 'semester_no' => '7', 'division_code' => 'IT-1', 'section_code' => 'A', 'status' => 'ACTIVE'],
                ],
            ],

            'student_elective_enrollment' => [
                'key' => 'student_elective_enrollment',
                'name' => 'Student Elective Enrollments',
                'description' => 'Import student elective course enrollments.',
                'table' => 'student_elective_enrollment',
                'model' => StudentElectiveEnrollment::class,
                'dependencies' => ['Students', 'Subject Offerings'],
                'dependency_notice' => 'Before importing Elective Enrollments: Ensure the Student and Subject Offering exist.',
                'excluded_columns' => ['id', 'student_id', 'subject_offering_id', 'enrolled_at'],
                'columns' => [
                    ['name' => 'roll_no', 'required' => true, 'type' => 'Text', 'description' => 'Student roll number', 'example' => '22IT001'],
                    ['name' => 'subject_code', 'required' => true, 'type' => 'Text', 'description' => 'Elective subject code', 'example' => 'IT705'],
                    ['name' => 'batch_title', 'required' => true, 'type' => 'Text', 'description' => 'Offering batch title', 'example' => '2023-2027 B.Tech IT'],
                    ['name' => 'year_code', 'required' => true, 'type' => 'Text', 'description' => 'Academic year code', 'example' => '2026-2027'],
                    ['name' => 'status', 'required' => false, 'type' => 'Enum', 'description' => 'ENROLLED or DROPPED', 'example' => 'ENROLLED'],
                ],
                'sample_rows' => [
                    ['roll_no' => '22IT001', 'subject_code' => 'IT705', 'batch_title' => '2023-2027 B.Tech IT', 'year_code' => '2026-2027', 'status' => 'ENROLLED'],
                ],
            ],

            'feedback_question_category' => [
                'key' => 'feedback_question_category',
                'name' => 'Feedback Question Categories',
                'description' => 'Import categories for organizing feedback evaluation questions.',
                'table' => 'feedback_question_category',
                'model' => FeedbackQuestionCategory::class,
                'dependencies' => [],
                'dependency_notice' => null,
                'excluded_columns' => ['id'],
                'columns' => [
                    ['name' => 'category_name', 'required' => true, 'type' => 'Text', 'description' => 'Category display title', 'example' => 'Teaching & Pedagogy Delivery'],
                    ['name' => 'display_order', 'required' => false, 'type' => 'Number', 'description' => 'Display sequence order number', 'example' => '1'],
                ],
                'sample_rows' => [
                    ['category_name' => 'Teaching & Pedagogy Delivery', 'display_order' => '1'],
                    ['category_name' => 'Course Content & Syllabus Coverage', 'display_order' => '2'],
                ],
            ],
        ];
    }

    /**
     * Generate CSV template string for a specific dataset.
     */
    public static function generateCsvTemplate(string $datasetKey): string
    {
        $datasets = self::getDatasets();
        if (!isset($datasets[$datasetKey])) {
            throw new \InvalidArgumentException("Invalid dataset key: {$datasetKey}");
        }

        $def = $datasets[$datasetKey];
        $headers = array_map(fn($col) => $col['name'], $def['columns']);
        
        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers);
        foreach ($def['sample_rows'] as $row) {
            $line = [];
            foreach ($headers as $h) {
                $line[] = $row[$h] ?? '';
            }
            fputcsv($output, $line);
        }
        rewind($output);
        $csvString = stream_get_contents($output);
        fclose($output);

        return $csvString;
    }

    /**
     * Validate data rows against dataset schema and database constraints.
     */
    public static function validate(string $datasetKey, array $rows): array
    {
        $datasets = self::getDatasets();
        if (!isset($datasets[$datasetKey])) {
            return [
                'success' => false,
                'message' => "Unknown dataset: {$datasetKey}",
                'total_rows' => 0,
                'valid_rows_count' => 0,
                'invalid_rows_count' => 0,
                'errors' => [],
                'preview_rows' => [],
            ];
        }

        $def = $datasets[$datasetKey];
        $columnsSpec = collect($def['columns'])->keyBy('name');

        $errors = [];
        $previewRows = [];
        $validCount = 0;
        $invalidCount = 0;

        // Tracks within-file uniqueness
        $seenKeys = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1; // 1-based row indexing
            $rowErrors = [];

            // 1. Check required fields
            foreach ($def['columns'] as $col) {
                $colName = $col['name'];
                $val = isset($row[$colName]) ? trim((string)$row[$colName]) : '';

                if ($col['required'] && $val === '') {
                    $rowErrors[] = [
                        'row' => $rowNumber,
                        'column' => $colName,
                        'error' => "Field '{$colName}' is required.",
                        'value' => $val,
                    ];
                } elseif ($val !== '') {
                    // Type validations
                    if ($col['type'] === 'Email' && !filter_var($val, FILTER_VALIDATE_EMAIL)) {
                        $rowErrors[] = [
                            'row' => $rowNumber,
                            'column' => $colName,
                            'error' => "Invalid email address format.",
                            'value' => $val,
                        ];
                    } elseif ($col['type'] === 'Number' && !is_numeric($val)) {
                        $rowErrors[] = [
                            'row' => $rowNumber,
                            'column' => $colName,
                            'error' => "Field '{$colName}' must be a valid number.",
                            'value' => $val,
                        ];
                    }
                }
            }

            // 2. Dataset-specific foreign key and database lookups
            if (empty($rowErrors)) {
                $fkErrors = self::validateForeignKeys($datasetKey, $row, $rowNumber);
                $rowErrors = array_merge($rowErrors, $fkErrors);
            }

            // 3. Check within-file duplicate key
            $uniqueKeyVal = self::getUniqueKeyValue($datasetKey, $row);
            if ($uniqueKeyVal !== null) {
                if (isset($seenKeys[$uniqueKeyVal])) {
                    $rowErrors[] = [
                        'row' => $rowNumber,
                        'column' => 'duplicate_check',
                        'error' => "Duplicate record found within the file for key '{$uniqueKeyVal}'.",
                        'value' => $uniqueKeyVal,
                    ];
                } else {
                    $seenKeys[$uniqueKeyVal] = true;
                }
            }

            $isValid = empty($rowErrors);
            if ($isValid) {
                $validCount++;
            } else {
                $invalidCount++;
                foreach ($rowErrors as $err) {
                    $errors[] = $err;
                }
            }

            $previewRows[] = [
                'row' => $rowNumber,
                'data' => $row,
                'isValid' => $isValid,
                'status' => $isValid ? 'Valid' : ($rowErrors[0]['error'] ?? 'Invalid'),
            ];
        }

        return [
            'success' => true,
            'dataset' => $def['name'],
            'total_rows' => count($rows),
            'valid_rows_count' => $validCount,
            'invalid_rows_count' => $invalidCount,
            'errors' => $errors,
            'preview_rows' => array_slice($previewRows, 0, 50),
        ];
    }

    /**
     * Validate foreign key existence for a given dataset row.
     */
    private static function validateForeignKeys(string $datasetKey, array $row, int $rowNumber): array
    {
        $errors = [];

        switch ($datasetKey) {
            case 'faculty':
                if (!empty($row['department_code'])) {
                    $deptExists = Department::where('department_code', trim($row['department_code']))->exists();
                    if (!$deptExists) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'department_code',
                            'error' => "Department '{$row['department_code']}' does not exist.",
                            'value' => $row['department_code'],
                        ];
                    }
                }
                if (!empty($row['designation_name'])) {
                    $desigExists = Designation::where('designation_name', trim($row['designation_name']))->exists();
                    if (!$desigExists) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'designation_name',
                            'error' => "Designation '{$row['designation_name']}' does not exist.",
                            'value' => $row['designation_name'],
                        ];
                    }
                }
                break;

            case 'batch':
                if (!empty($row['department_code'])) {
                    $deptExists = Department::where('department_code', trim($row['department_code']))->exists();
                    if (!$deptExists) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'department_code',
                            'error' => "Department '{$row['department_code']}' does not exist.",
                            'value' => $row['department_code'],
                        ];
                    }
                }
                break;

            case 'division':
                if (!empty($row['batch_title'])) {
                    $batchExists = Batch::where('batch_title', trim($row['batch_title']))->exists();
                    if (!$batchExists) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'batch_title',
                            'error' => "Batch '{$row['batch_title']}' does not exist.",
                            'value' => $row['batch_title'],
                        ];
                    }
                }
                break;

            case 'section':
                if (!empty($row['division_code'])) {
                    $divExists = Division::where('division_code', trim($row['division_code']))->exists();
                    if (!$divExists) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'division_code',
                            'error' => "Division '{$row['division_code']}' does not exist.",
                            'value' => $row['division_code'],
                        ];
                    }
                }
                break;

            case 'student':
                if (!empty($row['department_code'])) {
                    if (!Department::where('department_code', trim($row['department_code']))->exists()) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'department_code',
                            'error' => "Department '{$row['department_code']}' does not exist.",
                            'value' => $row['department_code'],
                        ];
                    }
                }
                if (!empty($row['batch_title'])) {
                    if (!Batch::where('batch_title', trim($row['batch_title']))->exists()) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'batch_title',
                            'error' => "Batch '{$row['batch_title']}' does not exist.",
                            'value' => $row['batch_title'],
                        ];
                    }
                }
                break;

            case 'subject':
                if (!empty($row['department_code'])) {
                    if (!Department::where('department_code', trim($row['department_code']))->exists()) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'department_code',
                            'error' => "Department '{$row['department_code']}' does not exist.",
                            'value' => $row['department_code'],
                        ];
                    }
                }
                break;

            case 'teaching_assignment':
                if (!empty($row['subject_code'])) {
                    if (!Subject::where('subject_code', trim($row['subject_code']))->exists()) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'subject_code',
                            'error' => "Subject '{$row['subject_code']}' does not exist.",
                            'value' => $row['subject_code'],
                        ];
                    }
                }
                if (!empty($row['faculty_email'])) {
                    if (!Faculty::where('email', trim($row['faculty_email']))->exists()) {
                        $errors[] = [
                            'row' => $rowNumber,
                            'column' => 'faculty_email',
                            'error' => "Faculty with email '{$row['faculty_email']}' does not exist.",
                            'value' => $row['faculty_email'],
                        ];
                    }
                }
                break;
        }

        return $errors;
    }

    /**
     * Get unique key string for in-file duplicate check.
     */
    private static function getUniqueKeyValue(string $datasetKey, array $row): ?string
    {
        return match ($datasetKey) {
            'department' => $row['department_code'] ?? null,
            'designation' => $row['designation_name'] ?? null,
            'academic_year' => $row['year_code'] ?? null,
            'faculty' => $row['email'] ?? null,
            'batch' => $row['batch_title'] ?? null,
            'division' => isset($row['batch_title'], $row['division_code']) ? "{$row['batch_title']}_{$row['division_code']}" : null,
            'section' => isset($row['division_code'], $row['section_code']) ? "{$row['division_code']}_{$row['section_code']}" : null,
            'student' => $row['roll_no'] ?? null,
            'subject' => $row['subject_code'] ?? null,
            'feedback_question_category' => $row['category_name'] ?? null,
            default => null,
        };
    }

    /**
     * Execute transactional database import for pre-validated data.
     */
    public static function executeImport(string $datasetKey, array $rows, int $userId, string $fileName): array
    {
        $datasets = self::getDatasets();
        if (!isset($datasets[$datasetKey])) {
            throw new \InvalidArgumentException("Invalid dataset: {$datasetKey}");
        }

        $importedCount = 0;
        $skippedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($rows as $row) {
                $imported = self::importSingleRow($datasetKey, $row);
                if ($imported) {
                    $importedCount++;
                } else {
                    $skippedCount++;
                }
            }

            // Create Data Import Log Record
            $log = DataImportLog::create([
                'file_name' => $fileName,
                'import_type' => self::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $userId,
                'record_count' => $importedCount,
                'status' => 'SUCCESS',
                'error_log' => $skippedCount > 0 ? "Skipped {$skippedCount} invalid rows." : null,
                'uploaded_at' => now(),
            ]);

            DB::commit();

            return [
                'success' => true,
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
                'log_id' => $log->id,
                'message' => "Successfully imported {$importedCount} records for {$datasets[$datasetKey]['name']}.",
            ];
        } catch (\Throwable $e) {
            DB::rollBack();

            DataImportLog::create([
                'file_name' => $fileName,
                'import_type' => self::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $userId,
                'record_count' => 0,
                'status' => 'FAILED',
                'error_log' => $e->getMessage(),
                'uploaded_at' => now(),
            ]);

            throw $e;
        }
    }

    /**
     * Insert/update a single entity row in database.
     */
    private static function importSingleRow(string $datasetKey, array $row): bool
    {
        switch ($datasetKey) {
            case 'department':
                Department::updateOrCreate(
                    ['department_code' => trim($row['department_code'])],
                    [
                        'department_name' => trim($row['department_name']),
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'designation':
                Designation::updateOrCreate(
                    ['designation_name' => trim($row['designation_name'])],
                    [
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'academic_year':
                AcademicYear::updateOrCreate(
                    ['year_code' => trim($row['year_code'])],
                    [
                        'start_date' => !empty($row['start_date']) ? trim($row['start_date']) : null,
                        'end_date' => !empty($row['end_date']) ? trim($row['end_date']) : null,
                        'status' => in_array(strtoupper(trim($row['status'] ?? '')), ['PLANNED', 'ACTIVE', 'CLOSED']) ? strtoupper(trim($row['status'])) : 'PLANNED',
                    ]
                );
                return true;

            case 'faculty':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                if (!$dept) return false;

                $desigName = !empty($row['designation_name']) ? trim($row['designation_name']) : 'Assistant Professor';
                $desig = Designation::firstOrCreate(
                    ['designation_name' => $desigName],
                    ['status' => 'ACTIVE']
                );

                // Provision User Account if not exists
                $email = trim($row['email']);
                $user = UserAccount::where('email', $email)->first();
                if (!$user) {
                    $user = UserAccount::create([
                        'email' => $email,
                        'password_hash' => Hash::make('Faculty@123'),
                        'role' => 'FACULTY',
                        'status' => 'ACTIVE',
                    ]);
                }

                Faculty::updateOrCreate(
                    ['email' => $email],
                    [
                        'user_account_id' => $user->id,
                        'full_name' => trim($row['full_name']),
                        'mobile' => !empty($row['mobile']) ? trim($row['mobile']) : null,
                        'department_id' => $dept->id,
                        'designation_id' => $desig ? $desig->id : null,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'batch':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                if (!$dept) return false;

                $sem = !empty($row['current_semester_no']) ? Semester::where('semester_no', (int)$row['current_semester_no'])->first() : null;

                Batch::updateOrCreate(
                    ['batch_title' => trim($row['batch_title'])],
                    [
                        'department_id' => $dept->id,
                        'program_name' => trim($row['program_name']),
                        'admission_year' => (int)$row['admission_year'],
                        'graduation_year' => (int)$row['graduation_year'],
                        'current_semester_id' => $sem ? $sem->id : null,
                        'status' => in_array(strtoupper(trim($row['status'] ?? '')), ['ACTIVE', 'GRADUATED', 'DISCONTINUED']) ? strtoupper(trim($row['status'])) : 'ACTIVE',
                    ]
                );
                return true;

            case 'division':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                $batch = Batch::where('batch_title', trim($row['batch_title']))->first();
                $sem = Semester::where('semester_no', (int)$row['semester_no'])->first();

                if (!$dept || !$batch || !$sem) return false;

                Division::updateOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'semester_id' => $sem->id,
                        'division_code' => trim($row['division_code']),
                    ],
                    [
                        'department_id' => $dept->id,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'section':
                $division = Division::where('division_code', trim($row['division_code']))->first();
                if (!$division) return false;

                Section::updateOrCreate(
                    [
                        'division_id' => $division->id,
                        'section_code' => trim($row['section_code']),
                    ],
                    [
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'student':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                $batch = Batch::where('batch_title', trim($row['batch_title']))->first();

                if (!$dept || !$batch) return false;

                $div = null;
                if (!empty($row['division_code'])) {
                    $divCode = trim($row['division_code']);
                    $div = Division::firstOrCreate(
                        ['batch_id' => $batch->id, 'division_code' => $divCode],
                        [
                            'department_id' => $dept->id,
                            'semester_id' => $batch->current_semester_id ?? 1,
                            'status' => 'ACTIVE',
                        ]
                    );
                }

                $sec = null;
                if (!empty($row['section_code']) && $div) {
                    $secCode = trim($row['section_code']);
                    $sec = Section::firstOrCreate(
                        ['division_id' => $div->id, 'section_code' => $secCode],
                        ['status' => 'ACTIVE']
                    );
                }

                $rollNo = trim($row['roll_no']);
                $email = !empty($row['email']) ? trim($row['email']) : strtolower($rollNo) . '@student.college.edu';

                $user = UserAccount::where('email', $email)->first();
                if (!$user) {
                    $user = UserAccount::create([
                        'email' => $email,
                        'password_hash' => Hash::make('Student@123'),
                        'role' => 'STUDENT',
                        'status' => 'ACTIVE',
                    ]);
                }

                Student::updateOrCreate(
                    ['roll_no' => $rollNo],
                    [
                        'user_account_id' => $user->id,
                        'enrollment_no' => !empty($row['enrollment_no']) ? trim($row['enrollment_no']) : null,
                        'full_name' => trim($row['full_name']),
                        'email' => $email,
                        'mobile' => !empty($row['mobile']) ? trim($row['mobile']) : null,
                        'department_id' => $dept->id,
                        'batch_id' => $batch->id,
                        'division_id' => $div ? $div->id : null,
                        'section_id' => $sec ? $sec->id : null,
                        'status' => in_array(strtoupper(trim($row['status'] ?? '')), ['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN']) ? strtoupper(trim($row['status'])) : 'ACTIVE',
                    ]
                );
                return true;

            case 'subject':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                $sem = Semester::where('semester_no', (int)$row['semester_no'])->first();
                if (!$dept || !$sem) return false;

                Subject::updateOrCreate(
                    ['subject_code' => trim($row['subject_code'])],
                    [
                        'subject_name' => trim($row['subject_name']),
                        'department_id' => $dept->id,
                        'semester_id' => $sem->id,
                        'course_type' => strtoupper(trim($row['course_type'] ?? 'CORE')) === 'ELECTIVE' ? 'ELECTIVE' : 'CORE',
                        'credits' => isset($row['credits']) ? (float)$row['credits'] : 4.0,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'subject_offering':
                $subject = Subject::where('subject_code', trim($row['subject_code']))->first();
                $batch = Batch::where('batch_title', trim($row['batch_title']))->first();
                $year = AcademicYear::where('year_code', trim($row['year_code']))->first();

                if (!$subject || !$batch || !$year) return false;

                SubjectOffering::updateOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'batch_id' => $batch->id,
                        'academic_year_id' => $year->id,
                    ],
                    [
                        'enrollment_capacity' => (int)($row['enrollment_capacity'] ?? 60),
                        'status' => strtoupper(trim($row['status'] ?? 'OPEN')) === 'CLOSED' ? 'CLOSED' : 'OPEN',
                    ]
                );
                return true;

            case 'teaching_assignment':
                $subject = Subject::where('subject_code', trim($row['subject_code']))->first();
                $faculty = Faculty::where('email', trim($row['faculty_email']))->first();
                $batch = Batch::where('batch_title', trim($row['batch_title']))->first();
                $year = AcademicYear::where('year_code', trim($row['year_code']))->first();
                $sem = Semester::where('semester_no', (int)$row['semester_no'])->first();

                if (!$subject || !$faculty || !$batch || !$year || !$sem) return false;

                $div = !empty($row['division_code']) ? Division::where('division_code', trim($row['division_code']))->first() : null;
                $sec = !empty($row['section_code']) ? Section::where('section_code', trim($row['section_code']))->first() : null;

                TeachingAssignment::updateOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'faculty_id' => $faculty->id,
                        'batch_id' => $batch->id,
                        'academic_year_id' => $year->id,
                    ],
                    [
                        'division_id' => $div ? $div->id : null,
                        'section_id' => $sec ? $sec->id : null,
                        'semester_id' => $sem->id,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'student_elective_enrollment':
                $student = Student::where('roll_no', trim($row['roll_no']))->first();
                $subject = Subject::where('subject_code', trim($row['subject_code']))->first();
                $batch = Batch::where('batch_title', trim($row['batch_title']))->first();
                $year = AcademicYear::where('year_code', trim($row['year_code']))->first();

                if (!$student || !$subject || !$batch || !$year) return false;

                $offering = SubjectOffering::where('subject_id', $subject->id)
                    ->where('batch_id', $batch->id)
                    ->where('academic_year_id', $year->id)
                    ->first();

                if (!$offering) return false;

                StudentElectiveEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'subject_offering_id' => $offering->id,
                    ],
                    [
                        'status' => strtoupper(trim($row['status'] ?? 'ENROLLED')) === 'DROPPED' ? 'DROPPED' : 'ENROLLED',
                    ]
                );
                return true;

            case 'feedback_question_category':
                FeedbackQuestionCategory::updateOrCreate(
                    ['category_name' => trim($row['category_name'])],
                    [
                        'display_order' => (int)($row['display_order'] ?? 1),
                    ]
                );
                return true;

            default:
                return false;
        }
    }

    private static function mapDatasetToImportType(string $datasetKey): string
    {
        return strtoupper($datasetKey);
    }
}
