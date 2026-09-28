<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectOfferingResource;
use App\Models\Subject;
use App\Models\SubjectOffering;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class SubjectOfferingController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = SubjectOffering::with(['subject.department', 'subject.semester', 'batch.department', 'academicYear'])
            ->withCount('electiveEnrollments')
            ->latest('id');

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->whereHas('subject', function ($q) use ($hodDeptId) {
                $q->where('department_id', $hodDeptId);
            });
        } elseif ($request->has('department_id')) {
            $query->whereHas('subject', function ($q) use ($request) {
                $q->where('department_id', $request->get('department_id'));
            });
        }

        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->get('batch_id'));
        }
        if ($request->has('academic_year_id')) {
            $query->where('academic_year_id', $request->get('academic_year_id'));
        }
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->get('subject_id'));
        }

        $offerings = $query->get();

        return response()->json([
            'data' => SubjectOfferingResource::collection($offerings)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_id' => ['required', 'integer', 'exists:subject,id'],
            'batch_id' => ['required', 'integer', 'exists:batch,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_year,id'],
            'enrollment_capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:OPEN,CLOSED'],
        ]);

        $subject = Subject::findOrFail($validated['subject_id']);
        $this->validateDepartmentAccess($request, $subject->department_id);

        if ($subject->course_type !== 'ELECTIVE') {
            return response()->json([
                'message' => 'Subject offerings are only valid for ELECTIVE course type subjects.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $exists = SubjectOffering::where('subject_id', $validated['subject_id'])
            ->where('batch_id', $validated['batch_id'])
            ->where('academic_year_id', $validated['academic_year_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'A subject offering for this subject, batch, and academic year already exists.'
            ], Response::HTTP_CONFLICT);
        }

        $offering = SubjectOffering::create($validated);

        return response()->json([
            'message' => 'Subject offering created successfully',
            'data' => new SubjectOfferingResource($offering->load(['subject.department', 'subject.semester', 'batch.department', 'academicYear']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $subjectOffering = $id instanceof SubjectOffering ? $id : SubjectOffering::with('subject')->findOrFail($id);
        if ($subjectOffering->subject) {
            $this->validateDepartmentAccess($request, $subjectOffering->subject->department_id);
        }

        return response()->json([
            'data' => new SubjectOfferingResource($subjectOffering->load(['subject.department', 'subject.semester', 'batch.department', 'academicYear'])->loadCount('electiveEnrollments'))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $subjectOffering = $id instanceof SubjectOffering ? $id : SubjectOffering::with('subject')->findOrFail($id);
        if ($subjectOffering->subject) {
            $this->validateDepartmentAccess($request, $subjectOffering->subject->department_id);
        }

        $validated = $request->validate([
            'subject_id' => ['sometimes', 'integer', 'exists:subject,id'],
            'batch_id' => ['sometimes', 'integer', 'exists:batch,id'],
            'academic_year_id' => ['sometimes', 'integer', 'exists:academic_year,id'],
            'enrollment_capacity' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:OPEN,CLOSED'],
        ]);

        if (isset($validated['subject_id'])) {
            $subject = Subject::findOrFail($validated['subject_id']);
            $this->validateDepartmentAccess($request, $subject->department_id);
            if ($subject->course_type !== 'ELECTIVE') {
                return response()->json([
                    'message' => 'Subject offerings are only valid for ELECTIVE course type subjects.'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $subjectOffering->update($validated);

        return response()->json([
            'message' => 'Subject offering updated successfully',
            'data' => new SubjectOfferingResource($subjectOffering->fresh(['subject.department', 'subject.semester', 'batch.department', 'academicYear'])->loadCount('electiveEnrollments'))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $subjectOffering = $id instanceof SubjectOffering ? $id : SubjectOffering::with('subject')->findOrFail($id);
        if ($subjectOffering->subject) {
            $this->validateDepartmentAccess($request, $subjectOffering->subject->department_id);
        }

        if ($subjectOffering->electiveEnrollments()->exists()) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete subject offering with enrolled students.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($subjectOffering) {
                $subjectOffering->electiveEnrollments()->delete();
                $subjectOffering->delete();
            });

            return response()->json([
                'message' => 'Subject offering and all associated enrollments deleted successfully'
            ], Response::HTTP_OK);
        }

        $subjectOffering->delete();

        return response()->json([
            'message' => 'Subject offering deleted successfully'
        ], Response::HTTP_OK);
    }
}
