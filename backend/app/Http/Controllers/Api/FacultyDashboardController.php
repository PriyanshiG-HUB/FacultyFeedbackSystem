<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedbackFormResource;
use App\Http\Resources\TeachingAssignmentResource;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackResponse;
use App\Models\TeachingAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class FacultyDashboardController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $faculty = $user->faculty;

        if (!$faculty) {
            return response()->json([
                'message' => 'User account is not linked to a faculty profile.'
            ], Response::HTTP_FORBIDDEN);
        }

        $assignmentsCount = TeachingAssignment::where('faculty_id', $faculty->id)->count();

        $formIds = FeedbackForm::whereHas('teachingAssignment', function ($q) use ($faculty) {
            $q->where('faculty_id', $faculty->id);
        })->pluck('id');

        $totalResponses = FeedbackResponse::whereIn('feedback_form_id', $formIds)
            ->where('is_excluded', false)
            ->count();

        $avgRating = FeedbackAnswer::whereHas('response', function ($q) use ($formIds) {
            $q->whereIn('feedback_form_id', $formIds)->where('is_excluded', false);
        })
        ->whereNotNull('rating_value')
        ->avg('rating_value');

        return response()->json([
            'data' => [
                'faculty' => [
                    'id' => $faculty->id,
                    'name' => $faculty->full_name,
                    'department' => $faculty->department?->department_name,
                    'designation' => $faculty->designation?->designation_name,
                ],
                'stats' => [
                    'total_teaching_assignments' => $assignmentsCount,
                    'total_feedback_responses' => $totalResponses,
                    'average_rating' => round($avgRating ?? 0, 2),
                ],
            ]
        ], Response::HTTP_OK);
    }

    public function teachingAssignments(Request $request): JsonResponse
    {
        $user = $request->user();
        $faculty = $user->faculty;

        if (!$faculty) {
            return response()->json([
                'message' => 'User account is not linked to a faculty profile.'
            ], Response::HTTP_FORBIDDEN);
        }

        $assignments = TeachingAssignment::with([
            'subject',
            'batch',
            'division',
            'section',
            'academicYear',
            'semester',
        ])->where('faculty_id', $faculty->id)->get();

        return response()->json([
            'data' => TeachingAssignmentResource::collection($assignments)
        ], Response::HTTP_OK);
    }

    public function feedbackForms(Request $request): JsonResponse
    {
        $user = $request->user();
        $faculty = $user->faculty;

        if (!$faculty) {
            return response()->json([
                'message' => 'User account is not linked to a faculty profile.'
            ], Response::HTTP_FORBIDDEN);
        }

        $forms = FeedbackForm::with([
            'teachingAssignment.subject',
            'teachingAssignment.batch',
            'questions.category',
        ])->whereHas('teachingAssignment', function ($q) use ($faculty) {
            $q->where('faculty_id', $faculty->id);
        })->get();

        return response()->json([
            'data' => FeedbackFormResource::collection($forms)
        ], Response::HTTP_OK);
    }
}
