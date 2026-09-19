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
use Throwable;

class DatasetImportRegistry
{
    public static function getDatasets(): array
    {
        return [
            'department' => [
                'key' => 'department',
                'name' => 'Departments',
                'title' => 'Departments',
                'description' => 'Import academic departments',
                'table' => 'department',
                'dependencies' => [],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['department_code', 'department_name', 'status'],
                'headers' => ['department_code', 'department_name', 'status'],
                'required' => ['department_code', 'department_name'],
                'sample' => ['department_code' => 'CSE', 'department_name' => 'Computer Science & Engineering', 'status' => 'ACTIVE'],
            ],
            'batch' => [
                'key' => 'batch',
                'name' => 'Batches',
                'title' => 'Batches',
                'description' => 'Import graduation batches',
                'table' => 'batch',
                'dependencies' => ['department'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['batch_title', 'department_code', 'start_year', 'end_year', 'current_semester_no', 'status'],
                'headers' => ['batch_title', 'department_code', 'start_year', 'end_year', 'current_semester_no', 'status'],
                'required' => ['batch_title', 'department_code'],
                'sample' => ['batch_title' => '2024-2028', 'department_code' => 'CSE', 'start_year' => '2024', 'end_year' => '2028', 'current_semester_no' => '1', 'status' => 'ACTIVE'],
            ],
            'academic_year' => [
                'key' => 'academic_year',
                'name' => 'Academic Years',
                'title' => 'Academic Years',
                'description' => 'Import academic years',
                'table' => 'academic_year',
                'dependencies' => [],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['year_code', 'title', 'start_date', 'end_date', 'is_current', 'status'],
                'headers' => ['year_code', 'title', 'start_date', 'end_date', 'is_current', 'status'],
                'required' => ['year_code'],
                'sample' => ['year_code' => '2024-2025', 'title' => 'Academic Year 2024-2025', 'start_date' => '2024-07-01', 'end_date' => '2025-06-30', 'is_current' => '1', 'status' => 'ACTIVE'],
            ],
            'semester' => [
                'key' => 'semester',
                'name' => 'Semesters',
                'title' => 'Semesters',
                'description' => 'Import academic semesters',
                'table' => 'semester',
                'dependencies' => [],
                'excluded_columns' => [],
                'columns' => ['semester_no', 'term'],
                'headers' => ['semester_no', 'term'],
                'required' => ['semester_no'],
                'sample' => ['semester_no' => '1', 'term' => 'ODD'],
            ],
            'division' => [
                'key' => 'division',
                'name' => 'Divisions',
                'title' => 'Divisions',
                'description' => 'Import class divisions',
                'table' => 'division',
                'dependencies' => ['batch', 'department'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['division_code', 'batch_title', 'department_code', 'semester_no', 'status'],
                'headers' => ['division_code', 'batch_title', 'department_code', 'semester_no', 'status'],
                'required' => ['division_code', 'batch_title', 'department_code'],
                'sample' => ['division_code' => 'A', 'batch_title' => '2024-2028', 'department_code' => 'CSE', 'semester_no' => '1', 'status' => 'ACTIVE'],
            ],
            'section' => [
                'key' => 'section',
                'name' => 'Sections',
                'title' => 'Sections',
                'description' => 'Import division sections',
                'table' => 'section',
                'dependencies' => ['division'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['section_code', 'division_code', 'batch_title', 'status'],
                'headers' => ['section_code', 'division_code', 'batch_title', 'status'],
                'required' => ['section_code', 'division_code', 'batch_title'],
                'sample' => ['section_code' => 'S1', 'division_code' => 'A', 'batch_title' => '2024-2028', 'status' => 'ACTIVE'],
            ],
            'faculty' => [
                'key' => 'faculty',
                'name' => 'Faculty Members',
                'title' => 'Faculty Members',
                'description' => 'Import faculty profiles',
                'table' => 'faculty',
                'dependencies' => ['department'],
                'excluded_columns' => ['id', 'user_account_id', 'created_at', 'updated_at'],
                'columns' => ['full_name', 'email', 'mobile', 'department_code', 'designation', 'status'],
                'headers' => ['full_name', 'email', 'mobile', 'department_code', 'designation', 'status'],
                'required' => ['full_name', 'email', 'department_code'],
                'sample' => ['full_name' => 'Dr. Jane Smith', 'email' => 'jane.smith@college.edu', 'mobile' => '9876543210', 'department_code' => 'CSE', 'designation' => 'Professor', 'status' => 'ACTIVE'],
            ],
            'student' => [
                'key' => 'student',
                'name' => 'Students',
                'title' => 'Students',
                'description' => 'Import student rosters',
                'table' => 'student',
                'dependencies' => ['department', 'batch'],
                'excluded_columns' => ['id', 'user_account_id', 'created_at', 'updated_at'],
                'columns' => ['roll_no', 'enrollment_no', 'full_name', 'email', 'mobile', 'department_code', 'batch_title', 'division_code', 'section_code', 'status'],
                'headers' => ['roll_no', 'enrollment_no', 'full_name', 'email', 'mobile', 'department_code', 'batch_title', 'division_code', 'section_code', 'status'],
                'required' => ['roll_no', 'full_name', 'department_code', 'batch_title'],
                'sample' => ['roll_no' => 'CS2024001', 'enrollment_no' => 'EN2024001', 'full_name' => 'John Student', 'email' => 'john.student@college.edu', 'mobile' => '9876543211', 'department_code' => 'CSE', 'batch_title' => '2024-2028', 'division_code' => 'A', 'section_code' => 'S1', 'status' => 'ACTIVE'],
            ],
            'subject' => [
                'key' => 'subject',
                'name' => 'Subjects',
                'title' => 'Subjects',
                'description' => 'Import curriculum subjects',
                'table' => 'subject',
                'dependencies' => ['department', 'semester'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['subject_code', 'subject_name', 'department_code', 'semester_no', 'course_type', 'credits', 'status'],
                'headers' => ['subject_code', 'subject_name', 'department_code', 'semester_no', 'course_type', 'credits', 'status'],
                'required' => ['subject_code', 'subject_name', 'department_code', 'semester_no'],
                'sample' => ['subject_code' => 'CS501', 'subject_name' => 'Data Structures', 'department_code' => 'CSE', 'semester_no' => '5', 'course_type' => 'CORE', 'credits' => '4.0', 'status' => 'ACTIVE'],
            ],
            'subject_offering' => [
                'key' => 'subject_offering',
                'name' => 'Subject Offerings',
                'title' => 'Subject Offerings',
                'description' => 'Import subject offerings for academic years',
                'table' => 'subject_offering',
                'dependencies' => ['subject', 'batch', 'academic_year'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['subject_code', 'batch_title', 'year_code', 'enrollment_capacity', 'status'],
                'headers' => ['subject_code', 'batch_title', 'year_code', 'enrollment_capacity', 'status'],
                'required' => ['subject_code', 'batch_title', 'year_code'],
                'sample' => ['subject_code' => 'CS501', 'batch_title' => '2024-2028', 'year_code' => '2024-2025', 'enrollment_capacity' => '60', 'status' => 'OPEN'],
            ],
            'teaching_assignment' => [
                'key' => 'teaching_assignment',
                'name' => 'Teaching Assignments',
                'title' => 'Teaching Assignments',
                'description' => 'Import faculty session allocations and subject assignments',
                'table' => 'teaching_assignment',
                'dependencies' => ['subject', 'faculty', 'batch', 'academic_year', 'semester'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['subject_code', 'faculty_email', 'batch_title', 'year_code', 'semester_no', 'division_code', 'section_code', 'status'],
                'headers' => ['subject_code', 'faculty_email', 'batch_title', 'year_code', 'semester_no', 'division_code', 'section_code', 'status'],
                'required' => ['subject_code', 'faculty_email', 'batch_title', 'year_code', 'semester_no'],
                'sample' => ['subject_code' => 'CS501', 'faculty_email' => 'john.doe@college.edu', 'batch_title' => '2024-2028', 'year_code' => '2024-2025', 'semester_no' => '5', 'division_code' => 'A', 'section_code' => 'S1', 'status' => 'ACTIVE'],
            ],
            'student_elective_enrollment' => [
                'key' => 'student_elective_enrollment',
                'name' => 'Student Elective Enrollments',
                'title' => 'Student Elective Enrollments',
                'description' => 'Import student elective course enrollments',
                'table' => 'student_elective_enrollment',
                'dependencies' => ['student', 'subject_offering'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['roll_no', 'subject_code', 'batch_title', 'year_code', 'status'],
                'headers' => ['roll_no', 'subject_code', 'batch_title', 'year_code', 'status'],
                'required' => ['roll_no', 'subject_code', 'batch_title', 'year_code'],
                'sample' => ['roll_no' => 'CS2024001', 'subject_code' => 'CS501', 'batch_title' => '2024-2028', 'year_code' => '2024-2025', 'status' => 'ENROLLED'],
            ],
            'feedback_question_category' => [
                'key' => 'feedback_question_category',
                'name' => 'Question Categories',
                'title' => 'Question Categories',
                'description' => 'Import feedback question categories',
                'table' => 'feedback_question_category',
                'dependencies' => [],
                'excluded_columns' => ['id'],
                'columns' => ['category_name', 'display_order'],
                'headers' => ['category_name', 'display_order'],
                'required' => ['category_name'],
                'sample' => ['category_name' => 'Teaching Quality', 'display_order' => '1'],
            ],
        ];
    }

    public static function generateCsvTemplate(string $datasetKey): string
    {
        $datasets = static::getDatasets();
        if (!isset($datasets[$datasetKey])) {
            throw new \InvalidArgumentException("Dataset '{$datasetKey}' does not exist.");
        }

        $config = $datasets[$datasetKey];
        $headers = $config['headers'];
        $sample = $config['sample'];

        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers);
        fputcsv($output, array_map(fn($h) => $sample[$h] ?? '', $headers));
        rewind($output);

        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    public static function validate(string $datasetKey, array $rows): array
    {
        $datasets = static::getDatasets();
        if (!isset($datasets[$datasetKey])) {
            return [
                'success' => false,
                'total_rows' => count($rows),
                'valid_rows' => 0,
                'valid_rows_count' => 0,
                'invalid_rows_count' => count($rows),
                'errors' => ["Dataset configuration key '{$datasetKey}' is invalid."],
            ];
        }

        $config = $datasets[$datasetKey];
        $required = $config['required'];
        $errors = [];
        $validRows = 0;
        $seenKeys = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 1;
            $missing = [];

            foreach ($required as $field) {
                if (!isset($row[$field]) || trim((string)$row[$field]) === '') {
                    $missing[] = $field;
                }
            }

            if (!empty($missing)) {
                $errors[] = "Row #{$rowNum}: Missing required field(s): " . implode(', ', $missing);
                continue;
            }

            // Check duplicate in same file if unique key applies
            $uniqueKey = static::getUniqueKeyValue($datasetKey, $row);
            if ($uniqueKey !== null) {
                if (isset($seenKeys[$uniqueKey])) {
                    $errors[] = "Row #{$rowNum}: Duplicate row found for reference key '{$uniqueKey}' (matches Row #" . ($seenKeys[$uniqueKey] + 1) . ").";
                    continue;
                }
                $seenKeys[$uniqueKey] = $index;
            }

            $validRows++;
        }

        return [
            'success' => true,
            'total_rows' => count($rows),
            'valid_rows' => $validRows,
            'valid_rows_count' => $validRows,
            'invalid_rows_count' => count($rows) - $validRows,
            'errors' => $errors,
        ];
    }

    public static function executeImport(string $datasetKey, array $rows, int $importedByUserId, ?string $fileName = null): array
    {
        $validation = static::validate($datasetKey, $rows);

        $logFileName = $fileName ?: "import_{$datasetKey}_" . time() . ".csv";

        if ($validation['valid_rows'] === 0 || count($rows) === 0) {
            $errorLog = implode("\n", $validation['errors']);
            DataImportLog::create([
                'file_name' => $logFileName,
                'import_type' => static::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $importedByUserId,
                'record_count' => 0,
                'status' => 'FAILED',
                'error_log' => $errorLog ?: 'No valid rows found in import file.',
            ]);

            return [
                'success' => false,
                'message' => 'Import failed: None of the record(s) could be imported due to invalid or missing database references.',
                'imported_count' => 0,
                'errors' => $validation['errors'],
            ];
        }

        $successCount = 0;
        $importErrors = $validation['errors'];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $row) {
                $rowNum = $index + 1;
                $imported = static::importSingleRow($datasetKey, $row);
                if ($imported) {
                    $successCount++;
                } else {
                    $importErrors[] = "Row #{$rowNum}: Failed to import or resolve database references.";
                }
            }

            if ($successCount === 0) {
                DB::rollBack();
                DataImportLog::create([
                    'file_name' => $logFileName,
                    'import_type' => static::mapDatasetToImportType($datasetKey),
                    'uploaded_by_user_account_id' => $importedByUserId,
                    'record_count' => 0,
                    'status' => 'FAILED',
                    'error_log' => implode("\n", $importErrors),
                ]);

                return [
                    'success' => false,
                    'message' => 'Import failed: None of the record(s) could be imported due to invalid or missing database references.',
                    'imported_count' => 0,
                    'errors' => $importErrors,
                ];
            }

            DB::commit();

            DataImportLog::create([
                'file_name' => $logFileName,
                'import_type' => static::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $importedByUserId,
                'record_count' => $successCount,
                'status' => 'SUCCESS',
                'error_log' => !empty($importErrors) ? implode("\n", $importErrors) : null,
            ]);

            return [
                'success' => true,
                'message' => "Successfully imported {$successCount} record(s).",
                'imported_count' => $successCount,
                'errors' => $importErrors,
            ];
        } catch (Throwable $e) {
            DB::rollBack();

            DataImportLog::create([
                'file_name' => $logFileName,
                'import_type' => static::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $importedByUserId,
                'record_count' => 0,
                'status' => 'FAILED',
                'error_log' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'A server error occurred during import execution: ' . $e->getMessage(),
                'imported_count' => 0,
                'errors' => [$e->getMessage()],
            ];
        }
    }

    private static function getUniqueKeyValue(string $datasetKey, array $row): ?string
    {
        return match ($datasetKey) {
            'department' => isset($row['department_code']) ? strtolower(trim($row['department_code'])) : null,
            'batch' => isset($row['batch_title']) ? strtolower(trim($row['batch_title'])) : null,
            'academic_year' => isset($row['year_code']) ? strtolower(trim($row['year_code'])) : null,
            'faculty' => isset($row['email']) ? strtolower(trim($row['email'])) : null,
            'student' => isset($row['roll_no']) ? strtolower(trim($row['roll_no'])) : null,
            'subject' => isset($row['subject_code']) ? strtolower(trim($row['subject_code'])) : null,
            'feedback_question_category' => isset($row['category_name']) ? strtolower(trim($row['category_name'])) : null,
            'teaching_assignment' => isset($row['subject_code'], $row['faculty_email'], $row['batch_title'], $row['year_code'])
                ? strtolower(trim($row['subject_code'])) . '|' . strtolower(trim($row['faculty_email'])) . '|' . strtolower(trim($row['batch_title'])) . '|' . strtolower(trim($row['year_code'])) . '|' . strtolower(trim($row['division_code'] ?? '')) . '|' . strtolower(trim($row['section_code'] ?? ''))
                : null,
            default => null,
        };
    }

    private static function parseBatchYears(string $batchTitle): array
    {
        $parts = explode('-', $batchTitle);
        $start = isset($parts[0]) && is_numeric(trim($parts[0])) ? (int)trim($parts[0]) : (int)date('Y');
        $end = isset($parts[1]) && is_numeric(trim($parts[1])) ? (int)trim($parts[1]) : $start + 4;
        return [$start, $end];
    }

    private static function parseAcademicDates(string $yearCode): array
    {
        $parts = explode('-', $yearCode);
        $startYear = isset($parts[0]) && is_numeric(trim($parts[0])) ? (int)trim($parts[0]) : (int)date('Y');
        $endYear = isset($parts[1]) && is_numeric(trim($parts[1])) ? (int)trim($parts[1]) : $startYear + 1;
        return ["{$startYear}-07-01", "{$endYear}-06-30"];
    }

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

            case 'batch':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                if (!$dept) {
                    $dept = Department::create([
                        'department_code' => trim($row['department_code']),
                        'department_name' => trim($row['department_code']) . ' Department',
                        'status' => 'ACTIVE',
                    ]);
                }

                [$startYear, $endYear] = static::parseBatchYears(trim($row['batch_title']));
                if (!empty($row['start_year'])) $startYear = (int)$row['start_year'];
                if (!empty($row['end_year'])) $endYear = (int)$row['end_year'];

                Batch::updateOrCreate(
                    ['batch_title' => trim($row['batch_title'])],
                    [
                        'department_id' => $dept->id,
                        'program_name' => !empty($row['program_name']) ? trim($row['program_name']) : 'B.Tech',
                        'admission_year' => $startYear,
                        'graduation_year' => $endYear,
                        'current_semester_id' => isset($row['current_semester_no']) ? (int)$row['current_semester_no'] : 1,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'academic_year':
                $yearCode = trim($row['year_code']);
                [$startDate, $endDate] = static::parseAcademicDates($yearCode);
                if (!empty($row['start_date'])) $startDate = trim($row['start_date']);
                if (!empty($row['end_date'])) $endDate = trim($row['end_date']);

                AcademicYear::updateOrCreate(
                    ['year_code' => $yearCode],
                    [
                        'title' => !empty($row['title']) ? trim($row['title']) : "Academic Year {$yearCode}",
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'semester':
                $semNo = (int)$row['semester_no'];
                Semester::firstOrCreate(
                    ['id' => $semNo],
                    [
                        'semester_no' => $semNo,
                        'term' => strtoupper(trim($row['term'] ?? 'ODD')) === 'EVEN' ? 'EVEN' : 'ODD',
                    ]
                );
                return true;

            case 'division':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                if (!$dept) {
                    $dept = Department::create([
                        'department_code' => trim($row['department_code']),
                        'department_name' => trim($row['department_code']) . ' Department',
                        'status' => 'ACTIVE',
                    ]);
                }

                $batchTitle = trim($row['batch_title']);
                $batch = Batch::where('batch_title', $batchTitle)->first();
                if (!$batch) {
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $dept->id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => 1,
                        'status' => 'ACTIVE',
                    ]);
                }

                $semNo = isset($row['semester_no']) ? (int)$row['semester_no'] : 1;

                Division::updateOrCreate(
                    ['batch_id' => $batch->id, 'division_code' => trim($row['division_code'])],
                    [
                        'department_id' => $dept->id,
                        'semester_id' => $semNo,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'section':
                $batchTitle = trim($row['batch_title']);
                $batch = Batch::where('batch_title', $batchTitle)->first();
                if (!$batch) return false;

                $div = Division::where('batch_id', $batch->id)->where('division_code', trim($row['division_code']))->first();
                if (!$div) return false;

                Section::updateOrCreate(
                    ['division_id' => $div->id, 'section_code' => trim($row['section_code'])],
                    [
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'faculty':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                if (!$dept) {
                    $dept = Department::create([
                        'department_code' => trim($row['department_code']),
                        'department_name' => trim($row['department_code']) . ' Department',
                        'status' => 'ACTIVE',
                    ]);
                }

                $designationName = !empty($row['designation']) ? trim($row['designation']) : 'Assistant Professor';
                $desg = Designation::firstOrCreate(
                    ['designation_name' => $designationName],
                    ['status' => 'ACTIVE']
                );

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
                        'email' => $email,
                        'mobile' => !empty($row['mobile']) ? trim($row['mobile']) : null,
                        'department_id' => $dept->id,
                        'designation_id' => $desg->id,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'student':
                $dept = Department::where('department_code', trim($row['department_code']))->first();
                if (!$dept) {
                    $dept = Department::create([
                        'department_code' => trim($row['department_code']),
                        'department_name' => trim($row['department_code']) . ' Department',
                        'status' => 'ACTIVE',
                    ]);
                }

                $batchTitle = trim($row['batch_title']);
                $batch = Batch::where('batch_title', $batchTitle)->first();
                if (!$batch) {
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $dept->id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => 1,
                        'status' => 'ACTIVE',
                    ]);
                }

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
                if (!$dept) {
                    $dept = Department::create([
                        'department_code' => trim($row['department_code']),
                        'department_name' => trim($row['department_code']) . ' Department',
                        'status' => 'ACTIVE',
                    ]);
                }

                $semNo = (int)$row['semester_no'];
                $sem = Semester::firstOrCreate(
                    ['id' => $semNo],
                    [
                        'semester_no' => $semNo,
                        'term' => ($semNo % 2 === 1) ? 'ODD' : 'EVEN',
                    ]
                );

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
                $subjectCode = trim($row['subject_code']);
                $facultyEmail = trim($row['faculty_email']);
                $batchTitle = trim($row['batch_title']);
                $yearCode = trim($row['year_code']);
                $semNo = (int)$row['semester_no'];

                // Auto-provision or find Academic Year
                $year = AcademicYear::where('year_code', $yearCode)->first();
                if (!$year) {
                    [$startDate, $endDate] = static::parseAcademicDates($yearCode);
                    $year = AcademicYear::create([
                        'year_code' => $yearCode,
                        'title' => 'Academic Year ' . $yearCode,
                        'start_date' => $startDate,
                        'end_date' => $endDate,
                        'status' => 'ACTIVE',
                    ]);
                }

                // Auto-provision or find Semester
                $sem = Semester::firstOrCreate(
                    ['id' => $semNo],
                    [
                        'semester_no' => $semNo,
                        'term' => ($semNo % 2 === 1) ? 'ODD' : 'EVEN',
                    ]
                );

                // Auto-provision or find Faculty
                $faculty = Faculty::where('email', $facultyEmail)->first();
                if (!$faculty) {
                    $user = UserAccount::where('email', $facultyEmail)->first();
                    if (!$user) {
                        $user = UserAccount::create([
                            'email' => $facultyEmail,
                            'password_hash' => Hash::make('Faculty@123'),
                            'role' => 'FACULTY',
                            'status' => 'ACTIVE',
                        ]);
                    }
                    $defaultDept = Department::first();
                    if (!$defaultDept) {
                        $defaultDept = Department::create([
                            'department_code' => 'CSE',
                            'department_name' => 'Computer Science & Engineering',
                            'status' => 'ACTIVE',
                        ]);
                    }
                    $desg = Designation::firstOrCreate(
                        ['designation_name' => 'Assistant Professor'],
                        ['status' => 'ACTIVE']
                    );
                    $name = explode('@', $facultyEmail)[0];
                    $name = ucwords(str_replace(['.', '_', '-'], ' ', $name));
                    $faculty = Faculty::create([
                        'user_account_id' => $user->id,
                        'full_name' => $name,
                        'email' => $facultyEmail,
                        'department_id' => $defaultDept->id,
                        'designation_id' => $desg->id,
                        'status' => 'ACTIVE',
                    ]);
                }

                // Auto-provision or find Batch
                $batch = Batch::where('batch_title', $batchTitle)->first();
                if (!$batch) {
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $faculty->department_id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => $sem->id,
                        'status' => 'ACTIVE',
                    ]);
                }

                // Auto-provision or find Subject
                $subject = Subject::where('subject_code', $subjectCode)->first();
                if (!$subject) {
                    $subject = Subject::create([
                        'subject_code' => $subjectCode,
                        'subject_name' => $subjectCode . ' Subject',
                        'department_id' => $faculty->department_id,
                        'semester_id' => $sem->id,
                        'course_type' => 'CORE',
                        'credits' => 4.0,
                        'status' => 'ACTIVE',
                    ]);
                }

                // Handle Division
                $div = null;
                if (!empty($row['division_code'])) {
                    $divCode = trim($row['division_code']);
                    $div = Division::firstOrCreate(
                        ['batch_id' => $batch->id, 'division_code' => $divCode],
                        [
                            'department_id' => $faculty->department_id,
                            'semester_id' => $sem->id,
                            'status' => 'ACTIVE',
                        ]
                    );
                }

                // Handle Section
                $sec = null;
                if (!empty($row['section_code'])) {
                    $secCode = trim($row['section_code']);
                    if ($div) {
                        $sec = Section::firstOrCreate(
                            ['division_id' => $div->id, 'section_code' => $secCode],
                            ['status' => 'ACTIVE']
                        );
                    }
                }

                TeachingAssignment::updateOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'faculty_id' => $faculty->id,
                        'batch_id' => $batch->id,
                        'academic_year_id' => $year->id,
                        'division_id' => $div ? $div->id : null,
                        'section_id' => $sec ? $sec->id : null,
                    ],
                    [
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
        return match ($datasetKey) {
            'teaching_assignment' => 'FACULTY_SESSION_MAPPING',
            'student' => 'STUDENT_ROSTER',
            'faculty' => 'FACULTY_LIST',
            'subject' => 'SUBJECT_LIST',
            'department' => 'DEPARTMENT_LIST',
            'batch' => 'BATCH_LIST',
            'academic_year' => 'ACADEMIC_YEAR_LIST',
            'semester' => 'SEMESTER_LIST',
            'division' => 'DIVISION_LIST',
            'section' => 'SECTION_LIST',
            'subject_offering' => 'SUBJECT_OFFERING_LIST',
            'student_elective_enrollment' => 'ELECTIVE_ENROLLMENT',
            'feedback_question_category' => 'QUESTION_CATEGORY',
            default => strtoupper($datasetKey),
        };
    }
}
