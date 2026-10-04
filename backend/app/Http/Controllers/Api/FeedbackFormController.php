<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FeedbackForm\StoreFeedbackFormRequest;
use App\Http\Resources\FeedbackFormResource;
use App\Models\FeedbackForm;
use App\Models\TeachingAssignment;
use App\Services\FeedbackPublishingService;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class FeedbackFormController extends Controller
{
    use AuthorizesDepartmentScope;

    protected FeedbackPublishingService $publishingService;

    public function __construct(FeedbackPublishingService $publishingService)
    {
        $this->publishingService = $publishingService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = FeedbackForm::with([
            'teachingAssignment.subject.department',
            'teachingAssignment.faculty',
            'teachingAssignment.batch.department',
            'teachingAssignment.division',
            'teachingAssignment.section',
            'teachingAssignment.academicYear',
            'teachingAssignment.semester',
            'questions.options',
            'questions.category',
        ]);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->whereHas('teachingAssignment.batch', function ($q) use ($hodDeptId) {
                $q->where('department_id', $hodDeptId);
            });
        }

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
        $validated = $request->validated();

        if (!empty($validated['teaching_assignment_ids']) && is_array($validated['teaching_assignment_ids'])) {
            $forms = $this->publishingService->createFormsBulk($validated, $user);
            return response()->json([
                'message' => count($forms) . ' Feedback Form(s) created successfully',
                'data' => FeedbackFormResource::collection($forms)
            ], Response::HTTP_CREATED);
        }

        $ta = TeachingAssignment::with('subject')->findOrFail($validated['teaching_assignment_id']);
        if ($ta->subject) {
            $this->validateDepartmentAccess($request, $ta->subject->department_id);
        }

        $form = $this->publishingService->createForm($validated, $user);

        return response()->json([
            'message' => 'Feedback form created successfully',
            'data' => new FeedbackFormResource($form)
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, FeedbackForm $feedbackForm): JsonResponse
    {
        $feedbackForm->loadMissing('teachingAssignment.subject');
        if ($feedbackForm->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $feedbackForm->teachingAssignment->subject->department_id);
        }

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

    public function destroy(Request $request, FeedbackForm $feedbackForm): JsonResponse
    {
        $feedbackForm->loadMissing('teachingAssignment.subject');
        if ($feedbackForm->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $feedbackForm->teachingAssignment->subject->department_id);
        }

        if ($feedbackForm->responses()->exists()) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete feedback form with submitted student responses.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($feedbackForm) {
                foreach ($feedbackForm->responses as $r) {
                    $r->feedbackAnswers()->delete();
                    $r->delete();
                }
                foreach ($feedbackForm->questions as $q) {
                    $q->options()->delete();
                    $q->delete();
                }
                $feedbackForm->delete();
            });

            return response()->json([
                'message' => 'Feedback form and all associated responses deleted successfully'
            ], Response::HTTP_OK);
        }

        DB::transaction(function () use ($feedbackForm) {
            foreach ($feedbackForm->questions as $q) {
                $q->options()->delete();
                $q->delete();
            }
            $feedbackForm->delete();
        });

        return response()->json([
            'message' => 'Feedback form deleted successfully'
        ], Response::HTTP_OK);
    }

    public function publish(Request $request, FeedbackForm $feedbackForm): JsonResponse
    {
        $feedbackForm->loadMissing('teachingAssignment.subject');
        if ($feedbackForm->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $feedbackForm->teachingAssignment->subject->department_id);
        }

        $publishedForm = $this->publishingService->publishForm($feedbackForm);

        return response()->json([
            'message' => 'Feedback form published successfully',
            'data' => new FeedbackFormResource($publishedForm)
        ], Response::HTTP_OK);
    }

    public function unpublish(Request $request, FeedbackForm $feedbackForm): JsonResponse
    {
        $feedbackForm->loadMissing('teachingAssignment.subject');
        if ($feedbackForm->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $feedbackForm->teachingAssignment->subject->department_id);
        }

        $unpublishedForm = $this->publishingService->unpublishForm($feedbackForm);

        return response()->json([
            'message' => 'Feedback form unpublished successfully',
            'data' => new FeedbackFormResource($unpublishedForm)
        ], Response::HTTP_OK);
    }
}
