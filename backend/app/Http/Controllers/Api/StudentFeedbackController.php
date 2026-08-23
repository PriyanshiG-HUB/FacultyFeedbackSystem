<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FeedbackSubmission\SubmitFeedbackRequest;
use App\Http\Resources\FeedbackFormResource;
use App\Http\Resources\FeedbackResponseResource;
use App\Models\FeedbackForm;
use App\Services\FeedbackSubmissionService;
use App\Services\StudentEligibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentFeedbackController extends Controller
{
    protected StudentEligibilityService $eligibilityService;
    protected FeedbackSubmissionService $submissionService;

    public function __construct(
        StudentEligibilityService $eligibilityService,
        FeedbackSubmissionService $submissionService
    ) {
        $this->eligibilityService = $eligibilityService;
        $this->submissionService = $submissionService;
    }

    /**
     * Get list of feedback forms eligible for the authenticated student.
     */
    public function eligibleForms(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'User account is not associated with a student profile.'
            ], Response::HTTP_FORBIDDEN);
        }

        $forms = $this->eligibilityService->getEligibleFormsForStudent($student);

        return response()->json([
            'data' => FeedbackFormResource::collection($forms)
        ], Response::HTTP_OK);
    }

    /**
     * Submit feedback for a specific form.
     */
    public function submit(SubmitFeedbackRequest $request, FeedbackForm $form): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'User account is not associated with a student profile.'
            ], Response::HTTP_FORBIDDEN);
        }

        $response = $this->submissionService->submitFeedback($student, $form, $request->validated());

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'data' => new FeedbackResponseResource($response)
        ], Response::HTTP_CREATED);
    }
}
