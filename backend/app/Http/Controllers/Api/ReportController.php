<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Report::with(['department', 'academicYear', 'generatedByUserAccount']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }
        if ($request->has('academic_year_id')) {
            $query->where('academic_year_id', $request->get('academic_year_id'));
        }

        $reports = $query->get();

        return response()->json([
            'data' => ReportResource::collection($reports)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:250'],
            'department_id' => ['nullable', 'integer', 'exists:department,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_year,id'],
            'term' => ['nullable', 'in:ODD,EVEN'],
            'sample_size' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['nullable', 'boolean'],
            'pdf_file_path' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:DRAFT,PUBLISHED'],
        ]);

        $validated['generated_by_user_account_id'] = $request->user()->id;
        $validated['generated_at'] = now();

        $report = Report::create($validated);

        return response()->json([
            'message' => 'Report created successfully',
            'data' => new ReportResource($report->load(['department', 'academicYear', 'generatedByUserAccount']))
        ], Response::HTTP_CREATED);
    }

    public function show(Report $report): JsonResponse
    {
        return response()->json([
            'data' => new ReportResource($report->load(['department', 'academicYear', 'generatedByUserAccount']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Report $report): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:250'],
            'department_id' => ['nullable', 'integer', 'exists:department,id'],
            'academic_year_id' => ['sometimes', 'required', 'integer', 'exists:academic_year,id'],
            'term' => ['nullable', 'in:ODD,EVEN'],
            'sample_size' => ['nullable', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
            'pdf_file_path' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:DRAFT,PUBLISHED'],
        ]);

        $report->update($validated);

        return response()->json([
            'message' => 'Report updated successfully',
            'data' => new ReportResource($report->fresh(['department', 'academicYear', 'generatedByUserAccount']))
        ], Response::HTTP_OK);
    }

    public function destroy(Report $report): JsonResponse
    {
        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ], Response::HTTP_OK);
    }
}
