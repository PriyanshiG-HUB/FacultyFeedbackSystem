<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DivisionResource;
use App\Http\Resources\SectionResource;
use App\Models\Division;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DivisionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Division::with(['department', 'batch', 'semester']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->get('batch_id'));
        }

        $divisions = $query->get();

        return response()->json([
            'data' => DivisionResource::collection($divisions)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'batch_id' => ['required', 'integer', 'exists:batch,id'],
            'semester_id' => ['required', 'integer', 'exists:semester,id'],
            'division_code' => ['required', 'string', 'max:10'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ]);

        $division = Division::create($validated);

        return response()->json([
            'message' => 'Division created successfully',
            'data' => new DivisionResource($division->load(['department', 'batch', 'semester']))
        ], Response::HTTP_CREATED);
    }

    public function show(Division $division): JsonResponse
    {
        return response()->json([
            'data' => new DivisionResource($division->load(['department', 'batch', 'semester']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Division $division): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'batch_id' => ['sometimes', 'required', 'integer', 'exists:batch,id'],
            'semester_id' => ['sometimes', 'required', 'integer', 'exists:semester,id'],
            'division_code' => ['sometimes', 'required', 'string', 'max:10'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        $division->update($validated);

        return response()->json([
            'message' => 'Division updated successfully',
            'data' => new DivisionResource($division->fresh(['department', 'batch', 'semester']))
        ], Response::HTTP_OK);
    }

    public function destroy(Division $division): JsonResponse
    {
        if ($division->sections()->exists() || $division->students()->exists()) {
            return response()->json([
                'message' => 'Cannot delete division with active sections or students.'
            ], Response::HTTP_CONFLICT);
        }

        $division->delete();

        return response()->json([
            'message' => 'Division deleted successfully'
        ], Response::HTTP_OK);
    }

    public function sections(Division $division): JsonResponse
    {
        $sections = $division->sections()->get();

        return response()->json([
            'data' => SectionResource::collection($sections)
        ], Response::HTTP_OK);
    }
}
