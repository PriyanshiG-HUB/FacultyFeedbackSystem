<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectOfferingResource;
use App\Models\Subject;
use App\Models\SubjectOffering;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SubjectOfferingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SubjectOffering::with(['subject.department', 'subject.semester', 'batch.department', 'academicYear'])
            ->withCount('electiveEnrollments')
            ->latest('id');

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

    public function show(SubjectOffering $subjectOffering): JsonResponse
    {
        return response()->json([
            'data' => new SubjectOfferingResource($subjectOffering->load(['subject.department', 'subject.semester', 'batch.department', 'academicYear'])->loadCount('electiveEnrollments'))
        ], Response::HTTP_OK);
    }

    public function destroy(SubjectOffering $subjectOffering): JsonResponse
    {
        if ($subjectOffering->electiveEnrollments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete subject offering with enrolled students.'
            ], Response::HTTP_CONFLICT);
        }

        $subjectOffering->delete();

        return response()->json([
            'message' => 'Subject offering deleted successfully'
        ], Response::HTTP_OK);
    }
}
