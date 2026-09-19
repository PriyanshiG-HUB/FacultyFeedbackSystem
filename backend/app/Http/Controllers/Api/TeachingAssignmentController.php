<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeachingAssignment\StoreTeachingAssignmentRequest;
use App\Http\Requests\TeachingAssignment\UpdateTeachingAssignmentRequest;
use App\Http\Resources\TeachingAssignmentResource;
use App\Models\Division;
use App\Models\Section;
use App\Models\TeachingAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TeachingAssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TeachingAssignment::with([
            'subject.department',
            'faculty',
            'batch.department',
            'division',
            'section',
            'academicYear',
            'semester',
        ]);

        if ($request->has('department_id')) {
            $deptId = $request->get('department_id');
            $query->whereHas('batch', function ($q) use ($deptId) {
                $q->where('department_id', $deptId);
            });
        }
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->get('batch_id'));
        }
        if ($request->has('division_id')) {
            $query->where('division_id', $request->get('division_id'));
        }
        if ($request->has('section_id')) {
            $query->where('section_id', $request->get('section_id'));
        }
        if ($request->has('faculty_id')) {
            $query->where('faculty_id', $request->get('faculty_id'));
        }
        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->get('semester_id'));
        }

        $assignments = $query->get();

        return response()->json([
            'data' => TeachingAssignmentResource::collection($assignments)
        ], Response::HTTP_OK);
    }

    public function store(StoreTeachingAssignmentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 1. Hierarchy Validation: If division_id is set, it must belong to batch_id & semester_id
        if (!empty($validated['division_id'])) {
            $division = Division::find($validated['division_id']);
            if (!$division || $division->batch_id != $validated['batch_id'] || $division->semester_id != $validated['semester_id']) {
                return response()->json([
                    'message' => 'Selected division does not belong to the chosen batch and semester.'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        // 2. Hierarchy Validation: If section_id is set, division_id must be set and section must belong to division
        if (!empty($validated['section_id'])) {
            if (empty($validated['division_id'])) {
                return response()->json([
                    'message' => 'A section assignment requires a valid division to be selected.'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $section = Section::find($validated['section_id']);
            if (!$section || $section->division_id != $validated['division_id']) {
                return response()->json([
                    'message' => 'Selected section does not belong to the chosen division.'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        // 3. Prevent duplicate teaching assignment
        $duplicate = TeachingAssignment::where('subject_id', $validated['subject_id'])
            ->where('faculty_id', $validated['faculty_id'])
            ->where('batch_id', $validated['batch_id'])
            ->where('academic_year_id', $validated['academic_year_id'])
            ->where(function ($q) use ($validated) {
                if (empty($validated['division_id'])) {
                    $q->whereNull('division_id');
                } else {
                    $q->where('division_id', $validated['division_id']);
                }
            })
            ->where(function ($q) use ($validated) {
                if (empty($validated['section_id'])) {
                    $q->whereNull('section_id');
                } else {
                    $q->where('section_id', $validated['section_id']);
                }
            })
            ->exists();

        if ($duplicate) {
            return response()->json([
                'message' => 'This teaching assignment combination already exists.'
            ], Response::HTTP_CONFLICT);
        }

        $assignment = TeachingAssignment::create($validated);

        return response()->json([
            'message' => 'Teaching assignment created successfully',
            'data' => new TeachingAssignmentResource($assignment->load([
                'subject',
                'faculty',
                'batch',
                'division',
                'section',
                'academicYear',
                'semester',
            ]))
        ], Response::HTTP_CREATED);
    }

    public function show(TeachingAssignment $teachingAssignment): JsonResponse
    {
        return response()->json([
            'data' => new TeachingAssignmentResource($teachingAssignment->load([
                'subject',
                'faculty',
                'batch',
                'division',
                'section',
                'academicYear',
                'semester',
            ]))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, TeachingAssignment $teachingAssignment): JsonResponse
    {
        $validated = $request->validate([
            'subject_id' => ['sometimes', 'required', 'integer', 'exists:subject,id'],
            'faculty_id' => ['sometimes', 'required', 'integer', 'exists:faculty,id'],
            'batch_id' => ['sometimes', 'required', 'integer', 'exists:batch,id'],
            'division_id' => ['nullable', 'integer', 'exists:division,id'],
            'section_id' => ['nullable', 'integer', 'exists:section,id'],
            'academic_year_id' => ['sometimes', 'required', 'integer', 'exists:academic_year,id'],
            'semester_id' => ['sometimes', 'required', 'integer', 'exists:semester,id'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        $teachingAssignment->update($validated);

        return response()->json([
            'message' => 'Teaching assignment updated successfully',
            'data' => new TeachingAssignmentResource($teachingAssignment->fresh([
                'subject',
                'faculty',
                'batch',
                'division',
                'section',
                'academicYear',
                'semester',
            ]))
        ], Response::HTTP_OK);
    }

    public function destroy(TeachingAssignment $teachingAssignment): JsonResponse
    {
        if ($teachingAssignment->feedbackForms()->exists()) {
            return response()->json([
                'message' => 'Cannot delete teaching assignment with associated feedback forms.'
            ], Response::HTTP_CONFLICT);
        }

        $teachingAssignment->delete();

        return response()->json([
            'message' => 'Teaching assignment deleted successfully'
        ], Response::HTTP_OK);
    }
}
