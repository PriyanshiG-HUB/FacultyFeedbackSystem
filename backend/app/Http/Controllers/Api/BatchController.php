<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BatchResource;
use App\Http\Resources\DivisionResource;
use App\Models\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Batch::with(['department', 'currentSemester']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        $batches = $query->get();

        return response()->json([
            'data' => BatchResource::collection($batches)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'program_name' => ['required', 'string', 'max:100'],
            'batch_title' => ['required', 'string', 'max:150'],
            'admission_year' => ['required', 'integer'],
            'graduation_year' => ['required', 'integer', 'gte:admission_year'],
            'current_semester_id' => ['nullable', 'integer', 'exists:semester,id'],
            'status' => ['nullable', 'in:ACTIVE,GRADUATED,DISCONTINUED'],
        ]);

        $batch = Batch::create($validated);

        return response()->json([
            'message' => 'Batch created successfully',
            'data' => new BatchResource($batch->load(['department', 'currentSemester']))
        ], Response::HTTP_CREATED);
    }

    public function show(Batch $batch): JsonResponse
    {
        return response()->json([
            'data' => new BatchResource($batch->load(['department', 'currentSemester']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Batch $batch): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'program_name' => ['sometimes', 'required', 'string', 'max:100'],
            'batch_title' => ['sometimes', 'required', 'string', 'max:150'],
            'admission_year' => ['sometimes', 'required', 'integer'],
            'graduation_year' => ['sometimes', 'required', 'integer'],
            'current_semester_id' => ['nullable', 'integer', 'exists:semester,id'],
            'status' => ['sometimes', 'in:ACTIVE,GRADUATED,DISCONTINUED'],
        ]);

        $batch->update($validated);

        return response()->json([
            'message' => 'Batch updated successfully',
            'data' => new BatchResource($batch->fresh(['department', 'currentSemester']))
        ], Response::HTTP_OK);
    }

    public function destroy(Batch $batch): JsonResponse
    {
        if ($batch->divisions()->exists() || $batch->students()->exists()) {
            return response()->json([
                'message' => 'Cannot delete batch with active divisions or students.'
            ], Response::HTTP_CONFLICT);
        }

        $batch->delete();

        return response()->json([
            'message' => 'Batch deleted successfully'
        ], Response::HTTP_OK);
    }

    public function divisions(Batch $batch): JsonResponse
    {
        $divisions = $batch->divisions()->with(['department', 'semester', 'sections'])->get();

        return response()->json([
            'data' => DivisionResource::collection($divisions)
        ], Response::HTTP_OK);
    }
}
