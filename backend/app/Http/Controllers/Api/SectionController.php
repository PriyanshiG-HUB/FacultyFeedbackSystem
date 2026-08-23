<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SectionResource;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Section::with(['division.department', 'division.batch', 'division.semester']);

        if ($request->has('division_id')) {
            $query->where('division_id', $request->get('division_id'));
        }

        $sections = $query->get();

        return response()->json([
            'data' => SectionResource::collection($sections)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'division_id' => ['required', 'integer', 'exists:division,id'],
            'section_code' => ['required', 'string', 'max:20'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ]);

        $section = Section::create($validated);

        return response()->json([
            'message' => 'Section created successfully',
            'data' => new SectionResource($section->load('division'))
        ], Response::HTTP_CREATED);
    }

    public function show(Section $section): JsonResponse
    {
        return response()->json([
            'data' => new SectionResource($section->load('division'))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Section $section): JsonResponse
    {
        $validated = $request->validate([
            'division_id' => ['sometimes', 'required', 'integer', 'exists:division,id'],
            'section_code' => ['sometimes', 'required', 'string', 'max:20'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        $section->update($validated);

        return response()->json([
            'message' => 'Section updated successfully',
            'data' => new SectionResource($section->fresh('division'))
        ], Response::HTTP_OK);
    }

    public function destroy(Section $section): JsonResponse
    {
        if ($section->students()->exists()) {
            return response()->json([
                'message' => 'Cannot delete section with active students.'
            ], Response::HTTP_CONFLICT);
        }

        $section->delete();

        return response()->json([
            'message' => 'Section deleted successfully'
        ], Response::HTTP_OK);
    }
}
