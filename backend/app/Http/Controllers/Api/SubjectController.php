<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subject::with(['department', 'semester']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->get('semester_id'));
        }

        if ($request->has('course_type')) {
            $query->where('course_type', $request->get('course_type'));
        }

        $subjects = $query->get();

        return response()->json([
            'data' => SubjectResource::collection($subjects)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_code' => ['required', 'string', 'max:20', 'unique:subject,subject_code'],
            'subject_name' => ['required', 'string', 'max:250'],
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'semester_id' => ['required', 'integer', 'exists:semester,id'],
            'course_type' => ['required', 'in:CORE,ELECTIVE'],
            'credits' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ]);

        $subject = Subject::create($validated);

        return response()->json([
            'message' => 'Subject created successfully',
            'data' => new SubjectResource($subject->load(['department', 'semester']))
        ], Response::HTTP_CREATED);
    }

    public function show(Subject $subject): JsonResponse
    {
        return response()->json([
            'data' => new SubjectResource($subject->load(['department', 'semester']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $validated = $request->validate([
            'subject_code' => ['sometimes', 'required', 'string', 'max:20', 'unique:subject,subject_code,' . $subject->id],
            'subject_name' => ['sometimes', 'required', 'string', 'max:250'],
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'semester_id' => ['sometimes', 'required', 'integer', 'exists:semester,id'],
            'course_type' => ['sometimes', 'required', 'in:CORE,ELECTIVE'],
            'credits' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        $subject->update($validated);

        return response()->json([
            'message' => 'Subject updated successfully',
            'data' => new SubjectResource($subject->fresh(['department', 'semester']))
        ], Response::HTTP_OK);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        if ($subject->teachingAssignments()->exists() || $subject->subjectOfferings()->exists()) {
            return response()->json([
                'message' => 'Cannot delete subject with active teaching assignments or offerings.'
            ], Response::HTTP_CONFLICT);
        }

        $subject->delete();

        return response()->json([
            'message' => 'Subject deleted successfully'
        ], Response::HTTP_OK);
    }
}
