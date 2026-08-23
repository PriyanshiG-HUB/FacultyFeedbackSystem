<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AcademicYearResource;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AcademicYearController extends Controller
{
    public function index(): JsonResponse
    {
        $years = AcademicYear::all();

        return response()->json([
            'data' => AcademicYearResource::collection($years)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year_code' => ['required', 'string', 'max:20', 'unique:academic_year,year_code'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'in:PLANNED,ACTIVE,CLOSED'],
        ]);

        $year = AcademicYear::create($validated);

        return response()->json([
            'message' => 'Academic year created successfully',
            'data' => new AcademicYearResource($year)
        ], Response::HTTP_CREATED);
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        return response()->json([
            'data' => new AcademicYearResource($academicYear)
        ], Response::HTTP_OK);
    }

    public function update(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $validated = $request->validate([
            'year_code' => ['sometimes', 'required', 'string', 'max:20', 'unique:academic_year,year_code,' . $academicYear->id],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'in:PLANNED,ACTIVE,CLOSED'],
        ]);

        $academicYear->update($validated);

        return response()->json([
            'message' => 'Academic year updated successfully',
            'data' => new AcademicYearResource($academicYear->fresh())
        ], Response::HTTP_OK);
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        if ($academicYear->teachingAssignments()->exists() || $academicYear->subjectOfferings()->exists()) {
            return response()->json([
                'message' => 'Cannot delete academic year with active teaching assignments or offerings.'
            ], Response::HTTP_CONFLICT);
        }

        $academicYear->delete();

        return response()->json([
            'message' => 'Academic year deleted successfully'
        ], Response::HTTP_OK);
    }
}
