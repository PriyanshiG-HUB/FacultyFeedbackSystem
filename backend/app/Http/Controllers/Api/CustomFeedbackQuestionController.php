<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomFeedbackQuestion;
use App\Services\CustomQuestionImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomFeedbackQuestionController extends Controller
{
    protected CustomQuestionImportService $importService;

    public function __construct(CustomQuestionImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Get list of custom feedback questions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CustomFeedbackQuestion::with('categoryRef')
            ->orderBy('created_at', 'desc');

        if ($request->has('category')) {
            $query->where('category', $request->get('category'));
        }

        if ($request->has('question_type')) {
            $query->where('question_type', strtoupper($request->get('question_type')));
        }

        $questions = $query->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
        ], Response::HTTP_OK);
    }

    /**
     * Validate an uploaded CSV/XLSX file or dataset rows.
     */
    public function validateImport(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['nullable', 'file', 'mimes:csv,txt,xlsx,xls', 'max:10240'],
            'rows' => ['nullable', 'array'],
        ]);

        $rows = [];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $rows = $this->importService->parseFile($file->getRealPath(), $file->getClientOriginalName());
        } elseif ($request->has('rows')) {
            $rows = $request->input('rows');
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Either an uploaded CSV/Excel file or array of rows is required.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $report = $this->importService->validateQuestions($rows);

        return response()->json($report, Response::HTTP_OK);
    }

    /**
     * Import custom questions from uploaded CSV/XLSX file into database table.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['nullable', 'file', 'mimes:csv,txt,xlsx,xls', 'max:10240'],
            'rows' => ['nullable', 'array'],
            'questions' => ['nullable', 'array'],
        ]);

        $parsedQuestions = [];

        if ($request->has('questions') && is_array($request->input('questions'))) {
            $parsedQuestions = $request->input('questions');
        } else {
            $rows = [];
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $rows = $this->importService->parseFile($file->getRealPath(), $file->getClientOriginalName());
            } elseif ($request->has('rows')) {
                $rows = $request->input('rows');
            }

            $report = $this->importService->validateQuestions($rows);
            if (!$report['success']) {
                return response()->json($report, Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $parsedQuestions = $report['parsed_questions'];
        }

        $user = $request->user();
        $storedRecords = $this->importService->storeCustomQuestions($parsedQuestions, $user?->id);

        return response()->json([
            'success' => true,
            'message' => count($storedRecords) . ' custom question(s) successfully imported and stored.',
            'data' => $storedRecords,
        ], Response::HTTP_CREATED);
    }

    /**
     * Create a single custom question manually.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:feedback_question_category,id'],
            'question_type' => ['nullable', 'string', 'in:RATING,TEXT,BOTH,MCQ'],
            'options' => ['nullable', 'array'],
        ]);

        $user = $request->user();

        $question = CustomFeedbackQuestion::create([
            'question' => $validated['question'],
            'category' => $validated['category'] ?? 'General',
            'category_id' => $validated['category_id'] ?? null,
            'question_type' => strtoupper($validated['question_type'] ?? 'RATING'),
            'options' => $validated['options'] ?? null,
            'created_by_user_account_id' => $user?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Custom question created successfully.',
            'data' => $question,
        ], Response::HTTP_CREATED);
    }

    /**
     * Delete a custom question.
     */
    public function destroy(CustomFeedbackQuestion $customFeedbackQuestion): JsonResponse
    {
        $customFeedbackQuestion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Custom question deleted successfully.',
        ], Response::HTTP_OK);
    }

    /**
     * Download sample CSV template for custom question import.
     */
    public function template()
    {
        $csvContent = "question,category,question_type,options\n";
        $csvContent .= "\"How clearly does the faculty explain core subject concepts?\",\"Clarity of Teaching\",\"RATING\",\"\"\n";
        $csvContent .= "\"What specific teaching methods helped you understand the topics better?\",\"Teaching Methodology\",\"TEXT\",\"\"\n";
        $csvContent .= "\"Rate the practical lab guidance and share your suggestions.\",\"Practical Guidance\",\"BOTH\",\"\"\n";

        return response($csvContent, Response::HTTP_OK, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="custom_questions_import_template.csv"',
        ]);
    }
}
