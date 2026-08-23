<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedbackFormResource;
use App\Models\FeedbackResponse;
use App\Services\StudentEligibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentDashboardController extends Controller
{
    protected StudentEligibilityService $eligibilityService;

    public function __construct(StudentEligibilityService $eligibilityService)
    {
        $this->eligibilityService = $eligibilityService;
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'User account is not associated with a student profile.'
            ], Response::HTTP_FORBIDDEN);
        }

        $student->load(['department', 'batch', 'division', 'section']);

        $eligibleForms = $this->eligibilityService->getEligibleFormsForStudent($student);
        $submittedCount = FeedbackResponse::where('student_id', $student->id)->count();

        return response()->json([
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'roll_no' => $student->roll_no,
                    'full_name' => $student->full_name,
                    'department' => $student->department?->department_name,
                    'batch' => $student->batch?->batch_title,
                    'division' => $student->division?->division_code,
                    'section' => $student->section?->section_code,
                ],
                'stats' => [
                    'eligible_forms_count' => $eligibleForms->count(),
                    'submitted_count' => $submittedCount,
                ],
                'pending_forms' => FeedbackFormResource::collection($eligibleForms),
            ]
        ], Response::HTTP_OK);
    }
}
