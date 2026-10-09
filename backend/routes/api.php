<?php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\DataImportController;
use App\Http\Controllers\Api\DataImportLogController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DesignationController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\FacultyDashboardController;
use App\Http\Controllers\Api\FacultyReportController;
use App\Http\Controllers\Api\FeedbackFormController;
use App\Http\Controllers\Api\FeedbackModerationController;
use App\Http\Controllers\Api\FeedbackQuestionCategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentDashboardController;
use App\Http\Controllers\Api\StudentElectiveEnrollmentController;
use App\Http\Controllers\Api\StudentFeedbackController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\SubjectOfferingController;
use App\Http\Controllers\Api\SystemSettingsController;
use App\Http\Controllers\Api\TeachingAssignmentController;
use App\Http\Controllers\Api\TimetableController;
use App\Http\Middleware\CheckRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Faculty Feedback Management System
|--------------------------------------------------------------------------
*/

// 1. Health Check & Infrastructure
Route::get('/health', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Throwable $e) {
        $dbStatus = 'disconnected';
    }

    return response()->json([
        'status' => 'ok',
        'application' => 'Faculty Feedback System',
        'database' => $dbStatus,
        'timestamp' => now()->toIso8601String(),
    ]);
});

// 2. Authentication (Public)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// 3. Authenticated Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // Faculty Reports (Accessible to ADMIN, SUPER_ADMIN, FACULTY, HOD)
    Route::middleware(CheckRole::class . ':ADMIN,SUPER_ADMIN,FACULTY,HOD')->group(function () {
        Route::get('/faculty-reports/faculty-list', [FacultyReportController::class, 'getFacultyList']);
        Route::get('/faculty-reports/assignments', [FacultyReportController::class, 'getFacultyAssignments']);
        Route::get('/faculty-reports/report', [FacultyReportController::class, 'generateReport']);
    });

    // Faculty Scope Routes (placed before apiResource('faculty'))
    Route::middleware(CheckRole::class . ':FACULTY,HOD')->group(function () {
        Route::get('/faculty/dashboard', [FacultyDashboardController::class, 'dashboard']);
        Route::get('/faculty/teaching-assignments', [FacultyDashboardController::class, 'teachingAssignments']);
        Route::get('/faculty/feedback-forms', [FacultyDashboardController::class, 'feedbackForms']);
    });

    // Student Scope Routes (placed before apiResource('students'))
    Route::middleware(CheckRole::class . ':STUDENT')->group(function () {
        Route::get('/student/dashboard', [StudentDashboardController::class, 'dashboard']);
        Route::get('/student/feedback-forms', [StudentFeedbackController::class, 'eligibleForms']);
        Route::post('/student/feedback-forms/{form}/submit', [StudentFeedbackController::class, 'submit']);
        Route::get('/student/elective-enrollments', [StudentElectiveEnrollmentController::class, 'studentEnrollments']);
    });

    // Admin & HOD Scope Routes
    Route::middleware(CheckRole::class . ':ADMIN,SUPER_ADMIN,HOD')->group(function () {
        // Dashboard
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'dashboard']);
        Route::get('/analytics', [AnalyticsController::class, 'index']);

        // Academic Hierarchy CRUD
        Route::apiResource('departments', DepartmentController::class);
        Route::get('/departments/{department}/batches', [DepartmentController::class, 'batches']);
        Route::get('/departments/{department}/faculty', [DepartmentController::class, 'faculty']);
        Route::get('/departments/{department}/subjects', [DepartmentController::class, 'subjects']);

        Route::get('/designations', [DesignationController::class, 'index']);

        Route::apiResource('faculty', FacultyController::class);
        Route::apiResource('academic-years', AcademicYearController::class);
        Route::get('/semesters', [SemesterController::class, 'index']);

        Route::apiResource('batches', BatchController::class);
        Route::get('/batches/{batch}/divisions', [BatchController::class, 'divisions']);

        Route::apiResource('divisions', DivisionController::class);
        Route::get('/divisions/{division}/sections', [DivisionController::class, 'sections']);

        Route::apiResource('sections', SectionController::class);
        Route::apiResource('students', StudentController::class);

        // Subject & Offering Management
        Route::apiResource('subjects', SubjectController::class);
        Route::apiResource('subject-offerings', SubjectOfferingController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::apiResource('elective-enrollments', StudentElectiveEnrollmentController::class)->only(['index', 'store', 'update', 'destroy']);

        // Teaching Assignments & Timetables
        Route::apiResource('teaching-assignments', TeachingAssignmentController::class);
        Route::apiResource('timetables', TimetableController::class);

        // Feedback Forms Lifecycle & Reporting
        Route::apiResource('feedback-forms', FeedbackFormController::class);
        Route::post('/feedback-forms/bulk-publish', [FeedbackFormController::class, 'bulkPublish']);
        Route::post('/feedback-forms/{feedbackForm}/publish', [FeedbackFormController::class, 'publish']);
        Route::post('/feedback-forms/{feedbackForm}/unpublish', [FeedbackFormController::class, 'unpublish']);
        Route::apiResource('reports', ReportController::class);

        // Question Bank & Categories
        Route::apiResource('feedback-question-categories', FeedbackQuestionCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/custom-feedback-questions/template', [\App\Http\Controllers\Api\CustomFeedbackQuestionController::class, 'template']);
        Route::post('/custom-feedback-questions/validate', [\App\Http\Controllers\Api\CustomFeedbackQuestionController::class, 'validateImport']);
        Route::post('/custom-feedback-questions/import', [\App\Http\Controllers\Api\CustomFeedbackQuestionController::class, 'import']);
        Route::apiResource('custom-feedback-questions', \App\Http\Controllers\Api\CustomFeedbackQuestionController::class)->only(['index', 'store', 'destroy']);

        // Feedback Moderation / Exclusion (Accessible to ADMIN, SUPER_ADMIN, HOD)
        Route::get('/feedback/moderation', [FeedbackModerationController::class, 'index']);
        Route::post('/feedback/responses/{response}/exclude', [FeedbackModerationController::class, 'exclude']);
        Route::post('/feedback/responses/{response}/restore', [FeedbackModerationController::class, 'restore']);

        // System Settings & Data Imports (Accessible to ADMIN, SUPER_ADMIN, HOD)
        Route::get('/system-settings', [SystemSettingsController::class, 'show']);
        Route::put('/system-settings/{systemSettings}', [SystemSettingsController::class, 'update']);
        Route::put('/system-settings', [SystemSettingsController::class, 'update']);
        Route::apiResource('data-import-logs', DataImportLogController::class)->only(['index', 'show', 'store']);
        Route::get('/data-imports/datasets', [DataImportController::class, 'getDatasets']);
        Route::get('/data-imports/template/{datasetKey}', [DataImportController::class, 'downloadTemplate']);
        Route::match(['get', 'post'], '/data-imports/validate', [DataImportController::class, 'validateFile']);
        Route::match(['get', 'post'], '/data-imports/execute', [DataImportController::class, 'executeImport']);
    });
});


