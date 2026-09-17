<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FeedbackQuestionCategoryResource;
use App\Models\FeedbackQuestionCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeedbackQuestionCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = FeedbackQuestionCategory::orderBy('display_order')->get();

        return response()->json([
            'data' => FeedbackQuestionCategoryResource::collection($categories)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_name' => ['required', 'string', 'max:100', 'unique:feedback_question_category,category_name'],
            'display_order' => ['nullable', 'integer'],
        ]);

        $category = FeedbackQuestionCategory::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => new FeedbackQuestionCategoryResource($category)
        ], Response::HTTP_CREATED);
    }

    public function destroy(FeedbackQuestionCategory $feedbackQuestionCategory): JsonResponse
    {
        if ($feedbackQuestionCategory->questions()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category referenced by questions.'
            ], Response::HTTP_CONFLICT);
        }

        $feedbackQuestionCategory->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ], Response::HTTP_OK);
    }
}
