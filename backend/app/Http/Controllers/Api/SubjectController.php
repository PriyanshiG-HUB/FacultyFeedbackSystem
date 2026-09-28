<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class SubjectController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Subject::with(['department', 'semester'])->latest('id');

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->where('department_id', $hodDeptId);
        } elseif ($request->has('department_id')) {
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

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            if ((int)$validated['department_id'] !== $hodDeptId) {
                abort(Response::HTTP_FORBIDDEN, 'Forbidden: You cannot create subjects for another department.');
            }
        }

        $subject = Subject::create($validated);

        return response()->json([
            'message' => 'Subject created successfully',
            'data' => new SubjectResource($subject->load(['department', 'semester']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Subject $subject): JsonResponse
    {
        $this->validateDepartmentAccess($request, $subject->department_id);

        return response()->json([
            'data' => new SubjectResource($subject->load(['department', 'semester']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $this->validateDepartmentAccess($request, $subject->department_id);

        $validated = $request->validate([
            'subject_code' => ['sometimes', 'required', 'string', 'max:20', 'unique:subject,subject_code,' . $subject->id],
            'subject_name' => ['sometimes', 'required', 'string', 'max:250'],
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'semester_id' => ['sometimes', 'required', 'integer', 'exists:semester,id'],
            'course_type' => ['sometimes', 'required', 'in:CORE,ELECTIVE'],
            'credits' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        if (isset($validated['department_id'])) {
            $this->validateDepartmentAccess($request, (int)$validated['department_id']);
        }

        $subject->update($validated);

        return response()->json([
            'message' => 'Subject updated successfully',
            'data' => new SubjectResource($subject->fresh(['department', 'semester']))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Subject $subject): JsonResponse
    {
        $this->validateDepartmentAccess($request, $subject->department_id);

        $hasDependencies = $subject->teachingAssignments()->exists() || $subject->subjectOfferings()->exists();

        if ($hasDependencies) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete subject with active teaching assignments or offerings.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($subject) {
                // 1. Cascade delete subject offerings and elective enrollments
                foreach ($subject->subjectOfferings as $offering) {
                    $offering->electiveEnrollments()->delete();
                    $offering->delete();
                }

                // 2. Cascade delete teaching assignments, timetables, and feedback forms
                foreach ($subject->teachingAssignments as $assignment) {
                    $forms = \App\Models\FeedbackForm::where('teaching_assignment_id', $assignment->id)->get();
                    foreach ($forms as $form) {
                        foreach ($form->responses as $resp) {
                            $resp->answers()->delete();
                            $resp->delete();
                        }
                        foreach ($form->questions as $q) {
                            $q->options()->delete();
                            $q->delete();
                        }
                        $form->delete();
                    }
                    \App\Models\Timetable::where('teaching_assignment_id', $assignment->id)->delete();
                    $assignment->delete();
                }

                // 3. Delete the subject itself
                $subject->delete();
            });

            return response()->json([
                'message' => 'Subject and all associated records deleted successfully'
            ], Response::HTTP_OK);
        }

        $subject->delete();

        return response()->json([
            'message' => 'Subject deleted successfully'
        ], Response::HTTP_OK);
    }
}
