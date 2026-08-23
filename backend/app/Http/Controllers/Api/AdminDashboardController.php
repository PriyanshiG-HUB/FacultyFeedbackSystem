<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackResponse;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminDashboardController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $totalDepartments = Department::count();
        $totalFaculty = Faculty::count();
        $totalStudents = Student::count();
        $totalFeedbackForms = FeedbackForm::count();
        $publishedForms = FeedbackForm::where('is_published', true)->count();
        $totalResponses = FeedbackResponse::where('is_excluded', false)->count();

        $avgRating = FeedbackAnswer::whereHas('response', function ($q) {
            $q->where('is_excluded', false);
        })->whereNotNull('rating_value')->avg('rating_value');

        return response()->json([
            'stats' => [
                'total_departments' => $totalDepartments,
                'total_faculty' => $totalFaculty,
                'total_students' => $totalStudents,
                'total_feedback_forms' => $totalFeedbackForms,
                'published_forms' => $publishedForms,
                'total_responses' => $totalResponses,
                'average_rating' => round($avgRating ?? 0, 2),
            ]
        ], Response::HTTP_OK);
    }
}
