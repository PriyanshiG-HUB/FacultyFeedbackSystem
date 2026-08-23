<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedbackResponseResource;
use App\Models\FeedbackResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeedbackModerationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FeedbackResponse::with([
            'feedbackForm.teachingAssignment.subject',
            'feedbackForm.teachingAssignment.faculty',
            'feedbackForm.teachingAssignment.batch',
            'feedbackForm.teachingAssignment.division',
            'feedbackForm.teachingAssignment.section',
            'student',
            'answers.question',
            'answers.selectedOption',
        ]);

        if ($request->has('department_id')) {
            $deptId = $request->get('department_id');
            $query->whereHas('feedbackForm.teachingAssignment.batch', function ($q) use ($deptId) {
                $q->where('department_id', $deptId);
            });
        }

        if ($request->has('faculty_id')) {
            $facId = $request->get('faculty_id');
            $query->whereHas('feedbackForm.teachingAssignment', function ($q) use ($facId) {
                $q->where('faculty_id', $facId);
            });
        }

        if ($request->has('is_excluded')) {
            $query->where('is_excluded', $request->boolean('is_excluded'));
        }

        $responses = $query->latest('submitted_at')->get();

        return response()->json([
            'data' => FeedbackResponseResource::collection($responses)
        ], Response::HTTP_OK);
    }

    public function exclude(Request $request, FeedbackResponse $response): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:255']
        ]);

        $user = $request->user();

        $response->update([
            'is_excluded' => true,
            'excluded_by_user_account_id' => $user->id,
            'excluded_reason' => $request->get('reason'),
            'excluded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Feedback response excluded from aggregated reports successfully',
            'data' => new FeedbackResponseResource($response->fresh())
        ], Response::HTTP_OK);
    }

    public function restore(Request $request, FeedbackResponse $response): JsonResponse
    {
        $response->update([
            'is_excluded' => false,
            'excluded_by_user_account_id' => null,
            'excluded_reason' => null,
            'excluded_at' => null,
        ]);

        return response()->json([
            'message' => 'Feedback response restored to reports successfully',
            'data' => new FeedbackResponseResource($response->fresh())
        ], Response::HTTP_OK);
    }
}
