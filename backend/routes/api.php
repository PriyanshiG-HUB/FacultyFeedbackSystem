<?php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\DataImportController;
use App\Http\Controllers\Api\DataImportLogController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DesignationController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\FacultyDashboardController;
use App\Http\Controllers\Api\FeedbackFormController;
use App\Http\Controllers\Api\FeedbackModerationController;
use App\Http\Controllers\Api\FeedbackQuestionCategoryController;
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

// 3. Authenticated Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Faculty Scope Routes (placed before apiResource('faculty'))
    Route::middleware(CheckRole::class . ':FACULTY')->group(function () {
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
    Route::middleware(CheckRole::class . ':ADMIN,SUPER_ADMIN')->group(function () {
        // Dashboard
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'dashboard']);

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
        Route::apiResource('subject-offerings', SubjectOfferingController::class)->only(['index', 'store', 'show', 'destroy']);
        Route::apiResource('elective-enrollments', StudentElectiveEnrollmentController::class)->only(['index', 'store', 'destroy']);

        // Teaching Assignments & Timetables
        Route::apiResource('teaching-assignments', TeachingAssignmentController::class);
        Route::apiResource('timetables', TimetableController::class);

        // Feedback Question Categories & Forms Lifecycle
        Route::apiResource('feedback-question-categories', FeedbackQuestionCategoryController::class)->only(['index', 'store', 'destroy']);
        Route::apiResource('feedback-forms', FeedbackFormController::class);
        Route::post('/feedback-forms/{feedbackForm}/publish', [FeedbackFormController::class, 'publish']);
        Route::post('/feedback-forms/{feedbackForm}/unpublish', [FeedbackFormController::class, 'unpublish']);

        // Feedback Moderation / Exclusion
        Route::get('/feedback/moderation', [FeedbackModerationController::class, 'index']);
        Route::post('/feedback/responses/{response}/exclude', [FeedbackModerationController::class, 'exclude']);
        Route::post('/feedback/responses/{response}/restore', [FeedbackModerationController::class, 'restore']);

        // Reporting, System Settings & Import Logging
        Route::apiResource('reports', ReportController::class);
        Route::get('/system-settings', [SystemSettingsController::class, 'show']);
        Route::put('/system-settings/{systemSettings}', [SystemSettingsController::class, 'update']);
        Route::put('/system-settings', [SystemSettingsController::class, 'update']);
        Route::apiResource('data-import-logs', DataImportLogController::class)->only(['index', 'show', 'store']);
        Route::get('/data-imports/datasets', [DataImportController::class, 'getDatasets']);
        Route::get('/data-imports/template/{datasetKey}', [DataImportController::class, 'downloadTemplate']);
        Route::post('/data-imports/validate', [DataImportController::class, 'validateFile']);
        Route::post('/data-imports/execute', [DataImportController::class, 'executeImport']);
    });
});
