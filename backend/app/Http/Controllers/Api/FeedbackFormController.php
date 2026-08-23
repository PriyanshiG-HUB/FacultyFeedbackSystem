<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FeedbackForm\StoreFeedbackFormRequest;
use App\Http\Resources\FeedbackFormResource;
use App\Models\FeedbackForm;
use App\Services\FeedbackPublishingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeedbackFormController extends Controller
{
    protected FeedbackPublishingService $publishingService;

    public function __construct(FeedbackPublishingService $publishingService)
    {
        $this->publishingService = $publishingService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = FeedbackForm::with([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section',
            'questions.options',
            'questions.category',
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }
        if ($request->has('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        $forms = $query->get();

        return response()->json([
            'data' => FeedbackFormResource::collection($forms)
        ], Response::HTTP_OK);
    }

    public function store(StoreFeedbackFormRequest $request): JsonResponse
    {
        $user = $request->user();
        $form = $this->publishingService->createForm($request->validated(), $user);

        return response()->json([
            'message' => 'Feedback form created successfully',
            'data' => new FeedbackFormResource($form)
        ], Response::HTTP_CREATED);
    }

    public function show(FeedbackForm $feedbackForm): JsonResponse
    {
        return response()->json([
            'data' => new FeedbackFormResource($feedbackForm->load([
                'teachingAssignment.subject',
                'teachingAssignment.faculty',
                'teachingAssignment.batch',
                'teachingAssignment.division',
                'teachingAssignment.section',
                'questions.options',
                'questions.category',
            ]))
        ], Response::HTTP_OK);
    }

    public function destroy(FeedbackForm $feedbackForm): JsonResponse
    {
        if ($feedbackForm->responses()->exists()) {
            return response()->json([
                'message' => 'Cannot delete feedback form with submitted student responses.'
            ], Response::HTTP_CONFLICT);
        }

        $feedbackForm->delete();

        return response()->json([
            'message' => 'Feedback form deleted successfully'
        ], Response::HTTP_OK);
    }

    public function publish(FeedbackForm $feedbackForm): JsonResponse
    {
        $publishedForm = $this->publishingService->publishForm($feedbackForm);

        return response()->json([
            'message' => 'Feedback form published successfully',
            'data' => new FeedbackFormResource($publishedForm)
        ], Response::HTTP_OK);
    }

    public function unpublish(FeedbackForm $feedbackForm): JsonResponse
    {
        $unpublishedForm = $this->publishingService->unpublishForm($feedbackForm);

        return response()->json([
            'message' => 'Feedback form unpublished successfully',
            'data' => new FeedbackFormResource($unpublishedForm)
        ], Response::HTTP_OK);
    }
}
