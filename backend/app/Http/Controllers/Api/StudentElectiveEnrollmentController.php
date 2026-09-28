<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentElectiveEnrollmentResource;
use App\Models\StudentElectiveEnrollment;
use App\Models\SubjectOffering;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StudentElectiveEnrollmentController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = StudentElectiveEnrollment::with(['student', 'subjectOffering.subject']);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->whereHas('subjectOffering.subject', function ($q) use ($hodDeptId) {
                $q->where('department_id', $hodDeptId);
            });
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->get('student_id'));
        }
        if ($request->has('subject_offering_id')) {
            $query->where('subject_offering_id', $request->get('subject_offering_id'));
        }

        $enrollments = $query->get();

        return response()->json([
            'data' => StudentElectiveEnrollmentResource::collection($enrollments)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:student,id'],
            'subject_offering_id' => ['required', 'integer', 'exists:subject_offering,id'],
            'status' => ['nullable', 'in:ENROLLED,DROPPED'],
        ]);

        $offering = SubjectOffering::with('subject')->findOrFail($validated['subject_offering_id']);
        if ($offering->subject) {
            $this->validateDepartmentAccess($request, $offering->subject->department_id);
        }

        $exists = StudentElectiveEnrollment::where('student_id', $validated['student_id'])
            ->where('subject_offering_id', $validated['subject_offering_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Student is already enrolled in this subject offering.'
            ], Response::HTTP_CONFLICT);
        }

        $validated['enrolled_at'] = now();
        $enrollment = StudentElectiveEnrollment::create($validated);

        return response()->json([
            'message' => 'Elective enrollment created successfully',
            'data' => new StudentElectiveEnrollmentResource($enrollment->load(['student', 'subjectOffering.subject']))
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $enrollment = StudentElectiveEnrollment::with('subjectOffering.subject')->findOrFail($id);
        if ($enrollment->subjectOffering?->subject) {
            $this->validateDepartmentAccess($request, $enrollment->subjectOffering->subject->department_id);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:ENROLLED,DROPPED'],
        ]);

        $enrollment->update($validated);

        return response()->json([
            'message' => 'Elective enrollment updated successfully',
            'data' => new StudentElectiveEnrollmentResource($enrollment->fresh(['student', 'subjectOffering.subject']))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $enrollment = StudentElectiveEnrollment::with('subjectOffering.subject')->findOrFail($id);
        if ($enrollment->subjectOffering?->subject) {
            $this->validateDepartmentAccess($request, $enrollment->subjectOffering->subject->department_id);
        }

        $enrollment->delete();

        return response()->json([
            'message' => 'Elective enrollment removed successfully'
        ], Response::HTTP_OK);
    }

    public function studentEnrollments(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'message' => 'User account is not linked to a student profile.'
            ], Response::HTTP_NOT_FOUND);
        }

        $enrollments = StudentElectiveEnrollment::with(['subjectOffering.subject', 'subjectOffering.batch'])
            ->where('student_id', $student->id)
            ->get();

        return response()->json([
            'data' => StudentElectiveEnrollmentResource::collection($enrollments)
        ], Response::HTTP_OK);
    }
}
