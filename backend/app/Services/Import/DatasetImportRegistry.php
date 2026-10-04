<?php

namespace App\Services\Import;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\DataImportLog;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Division;
use App\Models\Faculty;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
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
            'designation' => [
                'key' => 'designation',
                'name' => 'Designations',
                'title' => 'Designations',
                'description' => 'Import faculty designations and positions',
                'table' => 'designation',
                'dependencies' => [],
                'excluded_columns' => ['id'],
                'columns' => ['designation_name', 'status'],
                'headers' => ['designation_name', 'status'],
                'required' => ['designation_name'],
                'sample' => ['designation_name' => 'Assistant Professor', 'status' => 'ACTIVE'],
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
            'feedback_question' => [
                'key' => 'feedback_question',
                'name' => 'Feedback Questions',
                'title' => 'Feedback Questions',
                'description' => 'Import feedback questions for evaluation forms',
                'table' => 'feedback_question',
                'dependencies' => ['feedback_form', 'feedback_question_category'],
                'excluded_columns' => ['id', 'created_at', 'updated_at'],
                'columns' => ['feedback_form_id', 'category_id', 'question_text', 'question_type', 'is_required', 'max_rating', 'display_order'],
                'headers' => ['feedback_form_id', 'category_id', 'question_text', 'question_type', 'is_required', 'max_rating', 'display_order'],
                'required' => ['feedback_form_id', 'question_text'],
                'sample' => [
                    'feedback_form_id' => '1',
                    'category_id' => '1',
                    'question_text' => 'Does the faculty arrive on time for lectures?',
                    'question_type' => 'RATING',
                    'is_required' => '1',
                    'max_rating' => '5',
                    'display_order' => '1',
                ],
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

    public static function normalizeRowKeys(array $row): array
    {
        $normalized = [];
        $aliasMap = [
            'batch' => 'batch_title',
            'batch_name' => 'batch_title',
            'cohort' => 'batch_title',
            'batch_code' => 'batch_title',
            'start' => 'start_year',
            'admission_year' => 'start_year',
            'end' => 'end_year',
            'graduation_year' => 'end_year',
            'current_semester' => 'current_semester_no',
            'current_semester_id' => 'current_semester_no',
            'semester' => 'current_semester_no',
            'semester_num' => 'current_semester_no',

            'dept' => 'department_code',
            'dept_code' => 'department_code',
            'department' => 'department_code',
            'department_title' => 'department_name',
            'dept_name' => 'department_name',

            'designation_title' => 'designation_name',
            'role' => 'designation_name',
            'rank' => 'designation_name',

            'year' => 'year_code',
            'academic_year' => 'year_code',
            'session' => 'year_code',
            'academic_session' => 'year_code',

            'semester_number' => 'semester_no',
            'sem' => 'semester_no',
            'sem_no' => 'semester_no',

            'div' => 'division_code',
            'division' => 'division_code',
            'sec' => 'section_code',
            'section' => 'section_code',

            'name' => 'full_name',
            'student_name' => 'full_name',
            'faculty_name' => 'full_name',
            'user_name' => 'full_name',
            'email_address' => 'email',
            'mail' => 'email',
            'faculty_mail' => 'faculty_email',
            'roll' => 'roll_no',
            'roll_number' => 'roll_no',
            'student_id' => 'roll_no',
            'enrollment' => 'enrollment_no',
            'enrollment_number' => 'enrollment_no',
            'phone' => 'mobile',
            'phone_number' => 'mobile',
            'contact' => 'mobile',

            'subject' => 'subject_code',
            'course' => 'subject_code',
            'course_code' => 'subject_code',
            'subject_title' => 'subject_name',
            'course_name' => 'subject_name',

            'category' => 'category_name',
            'category_title' => 'category_name',

            'form_id' => 'feedback_form_id',
            'form' => 'feedback_form_id',
            'form_code' => 'feedback_form_id',
            'question' => 'question_text',
            'text' => 'question_text',
            'prompt' => 'question_text',
            'type' => 'question_type',
            'required' => 'is_required',
            'rating_max' => 'max_rating',
            'order' => 'display_order',
            'sequence' => 'display_order',
        ];

        foreach ($row as $key => $value) {
            $cleanKey = strtolower(trim(preg_replace('/[\s-]+/', '_', (string)$key)));
            $cleanKey = trim(preg_replace('/[^a-z0-9_]/', '', $cleanKey), '_');

            $finalKey = $aliasMap[$cleanKey] ?? $cleanKey;
            $normalized[$finalKey] = is_string($value) ? trim($value) : $value;
        }

        return $normalized;
    }

    public static function validate(string $datasetKey, array $rows): array
    {
        $rows = array_map([static::class, 'normalizeRowKeys'], $rows);
        $datasets = static::getDatasets();
        if (!isset($datasets[$datasetKey])) {
            return [
                'success' => false,
                'dataset' => $datasetKey,
                'total_rows' => count($rows),
                'valid_rows_count' => 0,
                'invalid_rows_count' => count($rows),
                'errors' => [
                    [
                        'row' => 0,
                        'column' => 'dataset_key',
                        'error' => "Dataset configuration key '{$datasetKey}' is invalid.",
                        'value' => $datasetKey,
                    ]
                ],
                'preview_rows' => [],
                'valid_rows' => [],
            ];
        }

        $config = $datasets[$datasetKey];
        $required = $config['required'];
        $errors = [];
        $previewRows = [];
        $validRows = [];
        $seenKeys = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 1;
            $rowErrors = [];
            $rowValid = true;

            foreach ($required as $field) {
                if (!isset($row[$field]) || trim((string)$row[$field]) === '') {
                    $rowValid = false;
                    $rowErrors[] = [
                        'row' => $rowNum,
                        'column' => $field,
                        'error' => "Required field '{$field}' is missing or empty.",
                        'value' => $row[$field] ?? null,
                    ];
                }
            }

            // Check duplicate in same file if unique key applies
            $uniqueKey = static::getUniqueKeyValue($datasetKey, $row);
            if ($uniqueKey !== null && $rowValid) {
                if (isset($seenKeys[$uniqueKey])) {
                    $rowValid = false;
                    $rowErrors[] = [
                        'row' => $rowNum,
                        'column' => 'reference_key',
                        'error' => "Duplicate row found for reference key '{$uniqueKey}' (matches Row #" . ($seenKeys[$uniqueKey] + 1) . ").",
                        'value' => $uniqueKey,
                    ];
                } else {
                    $seenKeys[$uniqueKey] = $index;
                }
            }

            if ($datasetKey === 'feedback_question' && $rowValid) {
                $formVal = trim((string)($row['feedback_form_id'] ?? $row['form_code'] ?? ''));
                if ($formVal !== '') {
                    $formExists = is_numeric($formVal)
                        ? FeedbackForm::where('id', (int)$formVal)->exists()
                        : FeedbackForm::where('form_code', $formVal)->exists();

                    if (!$formExists) {
                        $rowValid = false;
                        $rowErrors[] = [
                            'row' => $rowNum,
                            'column' => 'feedback_form_id',
                            'error' => "Feedback Form '{$formVal}' does not exist in the database.",
                            'value' => $formVal,
                        ];
                    }
                }

                if (!empty($row['category_id'])) {
                    $catVal = trim((string)$row['category_id']);
                    if (is_numeric($catVal)) {
                        $catExists = FeedbackQuestionCategory::where('id', (int)$catVal)->exists();
                        if (!$catExists) {
                            $rowValid = false;
                            $rowErrors[] = [
                                'row' => $rowNum,
                                'column' => 'category_id',
                                'error' => "Question Category ID '{$catVal}' does not exist in the database.",
                                'value' => $catVal,
                            ];
                        }
                    }
                }
            }

            foreach ($rowErrors as $err) {
                $errors[] = $err;
            }

            if ($rowValid) {
                $validRows[] = $row;
            }

            $previewRows[] = [
                'row' => $rowNum,
                'data' => $row,
                'isValid' => $rowValid,
                'status' => $rowValid ? 'Valid' : ($rowErrors[0]['error'] ?? 'Invalid Data'),
            ];
        }

        return [
            'success' => true,
            'dataset' => $datasetKey,
            'total_rows' => count($rows),
            'valid_rows_count' => count($validRows),
            'invalid_rows_count' => count($rows) - count($validRows),
            'errors' => $errors,
            'preview_rows' => $previewRows,
            'valid_rows' => $validRows,
        ];
    }

    public static function executeImport(string $datasetKey, array $rows, int $importedByUserId, ?string $fileName = null): array
    {
        $rows = array_map([static::class, 'normalizeRowKeys'], $rows);
        $validation = static::validate($datasetKey, $rows);

        $logFileName = $fileName ?: "import_{$datasetKey}_" . time() . ".csv";

        if ($validation['valid_rows_count'] === 0 || count($rows) === 0) {
            $formattedErrorLogs = array_map(function ($e) {
                return is_array($e) ? "Row #{$e['row']} [{$e['column']}]: {$e['error']}" : (string)$e;
            }, $validation['errors']);

            $errorLogStr = implode("\n", $formattedErrorLogs);
            DataImportLog::create([
                'file_name' => $logFileName,
                'import_type' => static::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $importedByUserId,
                'record_count' => 0,
                'status' => 'FAILED',
                'error_log' => $errorLogStr ?: 'No valid rows found in import file.',
            ]);

            return [
                'success' => false,
                'message' => 'Import failed: None of the record(s) could be imported due to invalid or missing database references.',
                'imported_count' => 0,
                'errors' => $validation['errors'],
            ];
        }

        $rowsToImport = !empty($validation['valid_rows']) ? $validation['valid_rows'] : $rows;
        $successCount = 0;
        $importErrors = $validation['errors'];

        try {
            DB::transaction(function () use ($datasetKey, $rowsToImport, &$successCount, &$importErrors) {
                if ($datasetKey === 'student') {
                    $successCount = static::importStudentsBulk($rowsToImport, $importErrors);
                } elseif ($datasetKey === 'faculty') {
                    $successCount = static::importFacultyBulk($rowsToImport, $importErrors);
                } elseif ($datasetKey === 'feedback_question') {
                    $successCount = static::importFeedbackQuestionsBulk($rowsToImport, $importErrors);
                } else {
                    foreach ($rowsToImport as $index => $row) {
                        $rowNum = $index + 1;
                        $imported = static::importSingleRow($datasetKey, $row);
                        if ($imported) {
                            $successCount++;
                        } else {
                            $importErrors[] = [
                                'row' => $rowNum,
                                'column' => 'import',
                                'error' => "Row #{$rowNum}: Failed to import or resolve database references.",
                                'value' => null,
                            ];
                        }
                    }
                }

                if ($successCount === 0 && empty($importErrors)) {
                    throw new \RuntimeException('None of the record(s) could be imported due to invalid or missing database references.');
                }
            });

            $formattedErrorLogs = array_map(function ($e) {
                return is_array($e) ? "Row #{$e['row']} [{$e['column']}]: {$e['error']}" : (string)$e;
            }, $importErrors);

            $log = DataImportLog::create([
                'file_name' => $logFileName,
                'import_type' => static::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $importedByUserId,
                'record_count' => $successCount,
                'status' => 'SUCCESS',
                'error_log' => !empty($importErrors) ? implode("\n", $formattedErrorLogs) : null,
            ]);

            return [
                'success' => true,
                'message' => "Successfully imported {$successCount} record(s).",
                'imported_count' => $successCount,
                'log_id' => $log->id,
                'errors' => $importErrors,
            ];
        } catch (Throwable $e) {
            $formattedErrorLogs = array_map(function ($e) {
                return is_array($e) ? "Row #{$e['row']} [{$e['column']}]: {$e['error']}" : (string)$e;
            }, $importErrors);

            DataImportLog::create([
                'file_name' => $logFileName,
                'import_type' => static::mapDatasetToImportType($datasetKey),
                'uploaded_by_user_account_id' => $importedByUserId,
                'record_count' => 0,
                'status' => 'FAILED',
                'error_log' => $e->getMessage() . (!empty($importErrors) ? "\n" . implode("\n", $formattedErrorLogs) : ''),
            ]);

            return [
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'imported_count' => 0,
                'errors' => !empty($importErrors) ? $importErrors : [[
                    'row' => 0,
                    'column' => 'server',
                    'error' => $e->getMessage(),
                    'value' => null,
                ]],
            ];
        }
    }

    private static function importStudentsBulk(array $rows, array &$importErrors): int
    {
        if (empty($rows)) {
            return 0;
        }

        $now = now()->toDateTimeString();
        $defaultPasswordHash = Hash::make('studentit');

        // Pre-fetch reference maps
        $departmentsMap = Department::all()->keyBy(fn($d) => strtoupper(trim($d->department_code)));
        $defaultSem = Semester::firstOrCreate(['id' => 1], ['semester_no' => 1, 'term' => 'ODD']);
        $batchesMap = Batch::all()->keyBy(fn($b) => $b->department_id . '_' . strtoupper(trim($b->batch_title)));
        $divisionsMap = Division::all()->keyBy(fn($d) => $d->batch_id . '_' . strtoupper(trim($d->division_code)));
        $sectionsMap = Section::all()->keyBy(fn($s) => $s->division_id . '_' . strtoupper(trim($s->section_code)));

        // Phase 1: Auto-provision missing Departments, Batches, Divisions, Sections
        foreach ($rows as $row) {
            $deptCode = strtoupper(trim($row['department_code'] ?? ''));
            if ($deptCode !== '' && !$departmentsMap->has($deptCode)) {
                $dept = Department::create([
                    'department_code' => $deptCode,
                    'department_name' => $deptCode . ' Department',
                    'status' => 'ACTIVE',
                ]);
                $departmentsMap->put($deptCode, $dept);
            }
        }

        foreach ($rows as $row) {
            $deptCode = strtoupper(trim($row['department_code'] ?? ''));
            $dept = $departmentsMap->get($deptCode);
            if (!$dept) {
                continue;
            }

            $batchTitle = trim($row['batch_title'] ?? '');
            if ($batchTitle !== '') {
                $batchKey = $dept->id . '_' . strtoupper($batchTitle);
                if (!$batchesMap->has($batchKey)) {
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $dept->id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => $defaultSem->id,
                        'status' => 'ACTIVE',
                    ]);
                    $batchesMap->put($batchKey, $batch);
                }

                $batch = $batchesMap->get($batchKey);
                $divCode = strtoupper(trim($row['division_code'] ?? ''));
                if ($divCode !== '' && $batch) {
                    $divKey = $batch->id . '_' . $divCode;
                    if (!$divisionsMap->has($divKey)) {
                        $div = Division::create([
                            'batch_id' => $batch->id,
                            'division_code' => trim($row['division_code']),
                            'department_id' => $dept->id,
                            'semester_id' => $batch->current_semester_id ?? $defaultSem->id,
                            'status' => 'ACTIVE',
                        ]);
                        $divisionsMap->put($divKey, $div);
                    }

                    $div = $divisionsMap->get($divKey);
                    $secCode = strtoupper(trim($row['section_code'] ?? ''));
                    if ($secCode !== '' && $div) {
                        $secKey = $div->id . '_' . $secCode;
                        if (!$sectionsMap->has($secKey)) {
                            $sec = Section::create([
                                'division_id' => $div->id,
                                'section_code' => trim($row['section_code']),
                                'status' => 'ACTIVE',
                            ]);
                            $sectionsMap->put($secKey, $sec);
                        }
                    }
                }
            }
        }

        // Phase 2: Process student data items & collect email / roll_no lists
        $emails = [];
        $rollNos = [];
        $processed = [];

        foreach ($rows as $index => $row) {
            $rollNo = trim($row['roll_no'] ?? '');
            if ($rollNo === '') {
                continue;
            }

            $deptCode = strtoupper(trim($row['department_code'] ?? ''));
            $dept = $departmentsMap->get($deptCode);

            $batchTitle = trim($row['batch_title'] ?? '');
            $batch = $dept ? $batchesMap->get($dept->id . '_' . strtoupper($batchTitle)) : null;

            if (!$dept || !$batch) {
                $importErrors[] = [
                    'row' => $index + 1,
                    'column' => 'department_code/batch_title',
                    'error' => "Row #" . ($index + 1) . ": Could not resolve department '{$deptCode}' or batch '{$batchTitle}'.",
                    'value' => null,
                ];
                continue;
            }

            $div = null;
            if (!empty($row['division_code'])) {
                $divKey = $batch->id . '_' . strtoupper(trim($row['division_code']));
                $div = $divisionsMap->get($divKey);
            }

            $sec = null;
            if (!empty($row['section_code']) && $div) {
                $secKey = $div->id . '_' . strtoupper(trim($row['section_code']));
                $sec = $sectionsMap->get($secKey);
            }

            $email = strtolower($rollNo) . '@college.edu';
            $statusStr = strtoupper(trim($row['status'] ?? 'ACTIVE'));
            $status = in_array($statusStr, ['ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN']) ? $statusStr : 'ACTIVE';

            $emails[strtolower($email)] = $email;
            $rollNos[strtoupper($rollNo)] = $rollNo;

            $processed[] = [
                'rowNum' => $index + 1,
                'roll_no' => $rollNo,
                'enrollment_no' => !empty($row['enrollment_no']) ? trim($row['enrollment_no']) : null,
                'full_name' => trim($row['full_name']),
                'email' => $email,
                'mobile' => !empty($row['mobile']) ? trim($row['mobile']) : null,
                'department_id' => $dept->id,
                'batch_id' => $batch->id,
                'division_id' => $div ? $div->id : null,
                'section_id' => $sec ? $sec->id : null,
                'status' => $status,
            ];
        }

        if (empty($processed)) {
            return 0;
        }

        // Phase 3: Bulk provision UserAccounts
        $existingUsersMap = UserAccount::whereIn('email', array_values($emails))->get()->keyBy(fn($u) => strtolower($u->email));

        $newUsersToInsert = [];
        foreach ($processed as $item) {
            $em = strtolower($item['email']);
            if (!$existingUsersMap->has($em) && !isset($newUsersToInsert[$em])) {
                $newUsersToInsert[$em] = [
                    'email' => $item['email'],
                    'password_hash' => $defaultPasswordHash,
                    'role' => 'STUDENT',
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            } elseif ($existingUsersMap->has($em)) {
                $existingUser = $existingUsersMap->get($em);
                if ($existingUser) {
                    $existingUser->update([
                        'password_hash' => $defaultPasswordHash,
                        'role' => 'STUDENT',
                        'status' => 'ACTIVE',
                    ]);
                }
            }
        }

        if (!empty($newUsersToInsert)) {
            foreach (array_chunk(array_values($newUsersToInsert), 200) as $chunk) {
                UserAccount::insert($chunk);
            }
            $existingUsersMap = UserAccount::whereIn('email', array_values($emails))->get()->keyBy(fn($u) => strtolower($u->email));
        }

        // Phase 4: Bulk Upsert/Update Students
        $existingStudentsMap = Student::whereIn('roll_no', array_values($rollNos))->get()->keyBy(fn($s) => strtoupper(trim($s->roll_no)));

        $studentsToInsert = [];
        $pendingInsertRolls = [];
        $successCount = 0;

        foreach ($processed as $item) {
            $user = $existingUsersMap->get(strtolower($item['email']));
            if (!$user) {
                $importErrors[] = [
                    'row' => $item['rowNum'],
                    'column' => 'email',
                    'error' => "Row #{$item['rowNum']}: User account could not be created or retrieved for '{$item['email']}'.",
                    'value' => $item['email'],
                ];
                continue;
            }

            $rollKey = strtoupper(trim($item['roll_no']));
            $existingStudent = $existingStudentsMap->get($rollKey);

            if ($existingStudent) {
                $existingStudent->update([
                    'user_account_id' => $user->id,
                    'enrollment_no' => $item['enrollment_no'],
                    'full_name' => $item['full_name'],
                    'email' => $item['email'],
                    'mobile' => $item['mobile'],
                    'department_id' => $item['department_id'],
                    'batch_id' => $item['batch_id'],
                    'division_id' => $item['division_id'],
                    'section_id' => $item['section_id'],
                    'status' => $item['status'],
                ]);
                $successCount++;
            } elseif (isset($pendingInsertRolls[$rollKey])) {
                $idx = $pendingInsertRolls[$rollKey];
                $studentsToInsert[$idx] = [
                    'user_account_id' => $user->id,
                    'roll_no' => $item['roll_no'],
                    'enrollment_no' => $item['enrollment_no'],
                    'full_name' => $item['full_name'],
                    'email' => $item['email'],
                    'mobile' => $item['mobile'],
                    'department_id' => $item['department_id'],
                    'batch_id' => $item['batch_id'],
                    'division_id' => $item['division_id'],
                    'section_id' => $item['section_id'],
                    'status' => $item['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            } else {
                $pendingInsertRolls[$rollKey] = count($studentsToInsert);
                $studentsToInsert[] = [
                    'user_account_id' => $user->id,
                    'roll_no' => $item['roll_no'],
                    'enrollment_no' => $item['enrollment_no'],
                    'full_name' => $item['full_name'],
                    'email' => $item['email'],
                    'mobile' => $item['mobile'],
                    'department_id' => $item['department_id'],
                    'batch_id' => $item['batch_id'],
                    'division_id' => $item['division_id'],
                    'section_id' => $item['section_id'],
                    'status' => $item['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($studentsToInsert)) {
            foreach (array_chunk($studentsToInsert, 200) as $chunk) {
                Student::insert($chunk);
                $successCount += count($chunk);
            }
        }

        return $successCount;
    }

    private static function importFacultyBulk(array $rows, array &$importErrors): int
    {
        if (empty($rows)) {
            return 0;
        }

        $now = now()->toDateTimeString();
        $defaultPasswordHash = Hash::make('Faculty@123');

        $departmentsMap = Department::all()->keyBy(fn($d) => strtoupper(trim($d->department_code)));
        $designationsMap = Designation::all()->keyBy(fn($d) => strtoupper(trim($d->designation_name)));

        foreach ($rows as $row) {
            $deptCode = strtoupper(trim($row['department_code'] ?? ''));
            if ($deptCode !== '' && !$departmentsMap->has($deptCode)) {
                $dept = Department::create([
                    'department_code' => $deptCode,
                    'department_name' => $deptCode . ' Department',
                    'status' => 'ACTIVE',
                ]);
                $departmentsMap->put($deptCode, $dept);
            }

            $desgName = trim($row['designation'] ?? 'Assistant Professor');
            $desgKey = strtoupper($desgName);
            if ($desgKey !== '' && !$designationsMap->has($desgKey)) {
                $desg = Designation::create([
                    'designation_name' => $desgName,
                    'status' => 'ACTIVE',
                ]);
                $designationsMap->put($desgKey, $desg);
            }
        }

        $emails = [];
        $processed = [];

        foreach ($rows as $index => $row) {
            $email = trim($row['email'] ?? '');
            if ($email === '') {
                continue;
            }

            $deptCode = strtoupper(trim($row['department_code'] ?? ''));
            $dept = $departmentsMap->get($deptCode);

            $desgName = trim($row['designation'] ?? 'Assistant Professor');
            $desg = $designationsMap->get(strtoupper($desgName));

            if (!$dept) {
                $importErrors[] = [
                    'row' => $index + 1,
                    'column' => 'department_code',
                    'error' => "Row #" . ($index + 1) . ": Could not resolve department '{$deptCode}'.",
                    'value' => null,
                ];
                continue;
            }

            $emails[strtolower($email)] = $email;
            $statusStr = strtoupper(trim($row['status'] ?? 'ACTIVE'));
            $status = $statusStr === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

            $processed[] = [
                'rowNum' => $index + 1,
                'full_name' => trim($row['full_name'] ?? ''),
                'email' => $email,
                'mobile' => !empty($row['mobile']) ? trim($row['mobile']) : null,
                'department_id' => $dept->id,
                'designation_id' => $desg ? $desg->id : 1,
                'status' => $status,
            ];
        }

        if (empty($processed)) {
            return 0;
        }

        $existingUsersMap = UserAccount::whereIn('email', array_values($emails))->get()->keyBy(fn($u) => strtolower($u->email));

        $newUsersToInsert = [];
        foreach ($processed as $item) {
            $em = strtolower($item['email']);
            if (!$existingUsersMap->has($em) && !isset($newUsersToInsert[$em])) {
                $newUsersToInsert[$em] = [
                    'email' => $item['email'],
                    'password_hash' => $defaultPasswordHash,
                    'role' => 'FACULTY',
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($newUsersToInsert)) {
            foreach (array_chunk(array_values($newUsersToInsert), 200) as $chunk) {
                UserAccount::insert($chunk);
            }
            $existingUsersMap = UserAccount::whereIn('email', array_values($emails))->get()->keyBy(fn($u) => strtolower($u->email));
        }

        $existingFacultiesMap = Faculty::whereIn('email', array_values($emails))->get()->keyBy(fn($f) => strtolower(trim($f->email)));

        $facultiesToInsert = [];
        $pendingInsertEmails = [];
        $successCount = 0;

        foreach ($processed as $item) {
            $user = $existingUsersMap->get(strtolower($item['email']));
            if (!$user) {
                continue;
            }

            $emKey = strtolower(trim($item['email']));
            $existingFaculty = $existingFacultiesMap->get($emKey);

            if ($existingFaculty) {
                $existingFaculty->update([
                    'user_account_id' => $user->id,
                    'full_name' => $item['full_name'],
                    'email' => $item['email'],
                    'mobile' => $item['mobile'],
                    'department_id' => $item['department_id'],
                    'designation_id' => $item['designation_id'],
                    'status' => $item['status'],
                ]);
                $successCount++;
            } elseif (isset($pendingInsertEmails[$emKey])) {
                $idx = $pendingInsertEmails[$emKey];
                $facultiesToInsert[$idx] = [
                    'user_account_id' => $user->id,
                    'full_name' => $item['full_name'],
                    'email' => $item['email'],
                    'mobile' => $item['mobile'],
                    'department_id' => $item['department_id'],
                    'designation_id' => $item['designation_id'],
                    'status' => $item['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            } else {
                $pendingInsertEmails[$emKey] = count($facultiesToInsert);
                $facultiesToInsert[] = [
                    'user_account_id' => $user->id,
                    'full_name' => $item['full_name'],
                    'email' => $item['email'],
                    'mobile' => $item['mobile'],
                    'department_id' => $item['department_id'],
                    'designation_id' => $item['designation_id'],
                    'status' => $item['status'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($facultiesToInsert)) {
            foreach (array_chunk($facultiesToInsert, 200) as $chunk) {
                Faculty::insert($chunk);
                $successCount += count($chunk);
            }
        }

        return $successCount;
    }

    private static function importFeedbackQuestionsBulk(array $rows, array &$importErrors): int
    {
        if (empty($rows)) {
            return 0;
        }

        $now = now()->toDateTimeString();

        $formsById = FeedbackForm::all()->keyBy('id');
        $formsByCode = FeedbackForm::all()->keyBy(fn($f) => strtoupper(trim($f->form_code)));

        $categoriesById = FeedbackQuestionCategory::all()->keyBy('id');
        $categoriesByName = FeedbackQuestionCategory::all()->keyBy(fn($c) => strtoupper(trim($c->category_name)));

        $successCount = 0;

        foreach ($rows as $index => $row) {
            $rowNum = $index + 1;
            $formVal = trim((string)($row['feedback_form_id'] ?? $row['form_code'] ?? ''));

            $form = is_numeric($formVal)
                ? $formsById->get((int)$formVal)
                : $formsByCode->get(strtoupper($formVal));

            if (!$form) {
                $importErrors[] = [
                    'row' => $rowNum,
                    'column' => 'feedback_form_id',
                    'error' => "Row #{$rowNum}: Target Feedback Form '{$formVal}' could not be found.",
                    'value' => $formVal,
                ];
                continue;
            }

            $catId = null;
            $catVal = trim((string)($row['category_id'] ?? $row['category_name'] ?? $row['category'] ?? ''));
            if ($catVal !== '') {
                if (is_numeric($catVal)) {
                    $cat = $categoriesById->get((int)$catVal);
                } else {
                    $catKey = strtoupper($catVal);
                    $cat = $categoriesByName->get($catKey);
                    if (!$cat) {
                        $cat = FeedbackQuestionCategory::create([
                            'category_name' => $catVal,
                            'display_order' => 1,
                        ]);
                        $categoriesById->put($cat->id, $cat);
                        $categoriesByName->put($catKey, $cat);
                    }
                }
                $catId = $cat?->id;
            }

            $qText = trim($row['question_text'] ?? '');
            if ($qText === '') {
                $importErrors[] = [
                    'row' => $rowNum,
                    'column' => 'question_text',
                    'error' => "Row #{$rowNum}: Question text is required.",
                    'value' => null,
                ];
                continue;
            }

            $qType = strtoupper(trim($row['question_type'] ?? 'RATING'));
            if (!in_array($qType, ['RATING', 'TEXT', 'CHOICE', 'DESCRIPTIVE'])) {
                $qType = 'RATING';
            }

            $reqVal = $row['is_required'] ?? true;
            $isRequired = in_array(strtolower(trim((string)$reqVal)), ['0', 'false', 'no', 'f'], true) ? 0 : 1;

            $maxRating = isset($row['max_rating']) && is_numeric($row['max_rating']) ? (int)$row['max_rating'] : 5;
            $dispOrder = isset($row['display_order']) && is_numeric($row['display_order']) ? (int)$row['display_order'] : 1;

            FeedbackQuestion::updateOrCreate(
                [
                    'feedback_form_id' => $form->id,
                    'question_text' => $qText,
                ],
                [
                    'category_id' => $catId,
                    'question_type' => $qType,
                    'is_required' => $isRequired,
                    'max_rating' => $maxRating,
                    'display_order' => $dispOrder,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
            $successCount++;
        }

        return $successCount;
    }

    private static function getUniqueKeyValue(string $datasetKey, array $row): ?string
    {
        return match ($datasetKey) {
            'department' => isset($row['department_code']) ? strtolower(trim($row['department_code'])) : null,
            'designation' => isset($row['designation_name']) ? strtolower(trim($row['designation_name'])) : null,
            'batch' => isset($row['batch_title'], $row['department_code'])
                ? strtolower(trim($row['department_code'])) . '|' . strtolower(trim($row['batch_title']))
                : (isset($row['batch_title']) ? strtolower(trim($row['batch_title'])) : null),
            'academic_year' => isset($row['year_code']) ? strtolower(trim($row['year_code'])) : null,
            'faculty' => isset($row['email']) ? strtolower(trim($row['email'])) : null,
            'student' => isset($row['roll_no']) ? strtolower(trim($row['roll_no'])) : null,
            'subject' => isset($row['subject_code']) ? strtolower(trim($row['subject_code'])) : null,
            'feedback_question_category' => isset($row['category_name']) ? strtolower(trim($row['category_name'])) : null,
            'feedback_question' => isset($row['feedback_form_id'], $row['question_text'])
                ? strtolower(trim($row['feedback_form_id'])) . '|' . strtolower(trim($row['question_text']))
                : (isset($row['form_code'], $row['question_text']) ? strtolower(trim($row['form_code'])) . '|' . strtolower(trim($row['question_text'])) : null),
            'teaching_assignment' => isset($row['subject_code'], $row['faculty_email'], $row['batch_title'], $row['year_code'])
                ? strtolower(trim($row['subject_code'])) . '|' . strtolower(trim($row['faculty_email'])) . '|' . strtolower(trim($row['batch_title'])) . '|' . strtolower(trim($row['year_code'])) . '|' . strtolower(trim($row['division_code'] ?? '')) . '|' . strtolower(trim($row['section_code'] ?? ''))
                : null,
            default => null,
        };
    }

    private static function parseBatchYears(string $batchTitle): array
    {
        preg_match_all('/\d{2,4}/', $batchTitle, $matches);
        $numbers = $matches[0] ?? [];

        $start = (int)date('Y');
        $end = $start + 4;

        if (count($numbers) >= 1) {
            $parsedStart = (int)$numbers[0];
            if ($parsedStart < 100) {
                $parsedStart += 2000;
            }
            $start = $parsedStart;
            $end = $start + 4;
        }

        if (count($numbers) >= 2) {
            $parsedEnd = (int)$numbers[1];
            if ($parsedEnd < 100) {
                $prefix = (int)floor($start / 100);
                $parsedEnd = ($prefix * 100) + $parsedEnd;
            }
            $end = $parsedEnd;
        }

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
                $deptCode = strtoupper(trim($row['department_code']));
                Department::updateOrCreate(
                    ['department_code' => $deptCode],
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

            case 'batch':
                $deptCode = strtoupper(trim($row['department_code']));
                $dept = Department::where('department_code', $deptCode)
                    ->orWhereRaw('LOWER(department_code) = ?', [strtolower($deptCode)])
                    ->first();

                if (!$dept) {
                    $dept = Department::create([
                        'department_code' => $deptCode,
                        'department_name' => $deptCode . ' Department',
                        'status' => 'ACTIVE',
                    ]);
                }

                [$startYear, $endYear] = static::parseBatchYears(trim($row['batch_title']));
                if (!empty($row['start_year'])) $startYear = (int)$row['start_year'];
                if (!empty($row['end_year'])) $endYear = (int)$row['end_year'];

                $semNo = isset($row['current_semester_no']) && is_numeric($row['current_semester_no'])
                    ? (int)$row['current_semester_no']
                    : (isset($row['semester_no']) && is_numeric($row['semester_no']) ? (int)$row['semester_no'] : 1);

                $sem = Semester::firstOrCreate(
                    ['id' => $semNo],
                    [
                        'semester_no' => $semNo,
                        'term' => ($semNo % 2 === 1) ? 'ODD' : 'EVEN',
                    ]
                );

                Batch::updateOrCreate(
                    [
                        'department_id' => $dept->id,
                        'batch_title' => trim($row['batch_title']),
                    ],
                    [
                        'program_name' => !empty($row['program_name']) ? trim($row['program_name']) : 'B.Tech',
                        'admission_year' => $startYear,
                        'graduation_year' => $endYear,
                        'current_semester_id' => $sem->id,
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

                $semNo = isset($row['semester_no']) && is_numeric($row['semester_no']) ? (int)$row['semester_no'] : 1;
                $sem = Semester::firstOrCreate(
                    ['id' => $semNo],
                    [
                        'semester_no' => $semNo,
                        'term' => ($semNo % 2 === 1) ? 'ODD' : 'EVEN',
                    ]
                );

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
                        'current_semester_id' => $sem->id,
                        'status' => 'ACTIVE',
                    ]);
                }

                Division::updateOrCreate(
                    ['batch_id' => $batch->id, 'division_code' => trim($row['division_code'])],
                    [
                        'department_id' => $dept->id,
                        'semester_id' => $sem->id,
                        'status' => strtoupper(trim($row['status'] ?? 'ACTIVE')) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    ]
                );
                return true;

            case 'section':
                $defaultSem = Semester::firstOrCreate(
                    ['id' => 1],
                    ['semester_no' => 1, 'term' => 'ODD']
                );

                $batchTitle = trim($row['batch_title']);
                $batch = Batch::where('batch_title', $batchTitle)->first();
                if (!$batch) {
                    $dept = Department::firstOrCreate(['department_code' => 'CSE'], ['department_name' => 'CSE Department', 'status' => 'ACTIVE']);
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $dept->id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => $defaultSem->id,
                        'status' => 'ACTIVE',
                    ]);
                }

                $divCode = trim($row['division_code']);
                $div = Division::where('batch_id', $batch->id)->where('division_code', $divCode)->first();
                if (!$div) {
                    $div = Division::create([
                        'batch_id' => $batch->id,
                        'division_code' => $divCode,
                        'department_id' => $batch->department_id,
                        'semester_id' => $batch->current_semester_id ?? $defaultSem->id,
                        'status' => 'ACTIVE',
                    ]);
                }

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
                $subjectCode = trim($row['subject_code']);
                $batchTitle = trim($row['batch_title']);
                $yearCode = trim($row['year_code']);

                $subject = Subject::where('subject_code', $subjectCode)->first();
                if (!$subject) {
                    $dept = Department::firstOrCreate(['department_code' => 'CSE'], ['department_name' => 'CSE Department', 'status' => 'ACTIVE']);
                    $subject = Subject::create([
                        'subject_code' => $subjectCode,
                        'subject_name' => $subjectCode . ' Subject',
                        'department_id' => $dept->id,
                        'semester_id' => 1,
                        'course_type' => 'ELECTIVE',
                        'credits' => 4.0,
                        'status' => 'ACTIVE',
                    ]);
                }

                $batch = Batch::where('batch_title', $batchTitle)->first();
                if (!$batch) {
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $subject->department_id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => 1,
                        'status' => 'ACTIVE',
                    ]);
                }

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

                $sem = Semester::firstOrCreate(
                    ['id' => $semNo],
                    [
                        'semester_no' => $semNo,
                        'term' => ($semNo % 2 === 1) ? 'ODD' : 'EVEN',
                    ]
                );

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
                $rollNo = trim($row['roll_no']);
                $subjectCode = trim($row['subject_code']);
                $batchTitle = trim($row['batch_title']);
                $yearCode = trim($row['year_code']);

                $student = Student::where('roll_no', $rollNo)->first();
                if (!$student) {
                    $dept = Department::firstOrCreate(['department_code' => 'CSE'], ['department_name' => 'CSE Department', 'status' => 'ACTIVE']);
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::firstOrCreate(
                        ['batch_title' => $batchTitle],
                        ['department_id' => $dept->id, 'program_name' => 'B.Tech', 'admission_year' => $startYr, 'graduation_year' => $endYr, 'current_semester_id' => 1, 'status' => 'ACTIVE']
                    );
                    $email = strtolower($rollNo) . '@student.college.edu';
                    $user = UserAccount::firstOrCreate(
                        ['email' => $email],
                        ['password_hash' => Hash::make('Student@123'), 'role' => 'STUDENT', 'status' => 'ACTIVE']
                    );
                    $student = Student::create([
                        'roll_no' => $rollNo,
                        'user_account_id' => $user->id,
                        'full_name' => $rollNo . ' Student',
                        'email' => $email,
                        'department_id' => $dept->id,
                        'batch_id' => $batch->id,
                        'status' => 'ACTIVE',
                    ]);
                }

                $subject = Subject::where('subject_code', $subjectCode)->first();
                if (!$subject) {
                    $subject = Subject::create([
                        'subject_code' => $subjectCode,
                        'subject_name' => $subjectCode . ' Subject',
                        'department_id' => $student->department_id,
                        'semester_id' => 1,
                        'course_type' => 'ELECTIVE',
                        'credits' => 4.0,
                        'status' => 'ACTIVE',
                    ]);
                }

                $batch = Batch::where('batch_title', $batchTitle)->first() ?: Student::find($student->id)?->batch;
                if (!$batch) {
                    [$startYr, $endYr] = static::parseBatchYears($batchTitle);
                    $batch = Batch::create([
                        'batch_title' => $batchTitle,
                        'department_id' => $student->department_id,
                        'program_name' => 'B.Tech',
                        'admission_year' => $startYr,
                        'graduation_year' => $endYr,
                        'current_semester_id' => 1,
                        'status' => 'ACTIVE',
                    ]);
                }

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

                $offering = SubjectOffering::firstOrCreate(
                    [
                        'subject_id' => $subject->id,
                        'batch_id' => $batch->id,
                        'academic_year_id' => $year->id,
                    ],
                    [
                        'enrollment_capacity' => 60,
                        'status' => 'OPEN',
                    ]
                );

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
            'designation' => 'DESIGNATION_LIST',
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
