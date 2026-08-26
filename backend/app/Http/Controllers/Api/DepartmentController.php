<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Http\Resources\BatchResource;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\FacultyResource;
use App\Http\Resources\SubjectResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::with(['hodFaculty.designation'])->withCount(['faculty', 'students']);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('department_code', 'like', "%{$search}%")
                  ->orWhere('department_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $departments = $query->get();

        return response()->json([
            'data' => DepartmentResource::collection($departments)
        ], Response::HTTP_OK);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        return response()->json([
            'message' => 'Department created successfully',
            'data' => new DepartmentResource($department->load(['hodFaculty.designation']))
        ], Response::HTTP_CREATED);
    }

    public function show(Department $department): JsonResponse
    {
        $department->load(['hodFaculty.designation'])->loadCount(['faculty', 'students']);

        return response()->json([
            'data' => new DepartmentResource($department)
        ], Response::HTTP_OK);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());

        return response()->json([
            'message' => 'Department updated successfully',
            'data' => new DepartmentResource($department->fresh('hodFaculty'))
        ], Response::HTTP_OK);
    }

    public function destroy(Department $department): JsonResponse
    {
        if ($department->faculty()->exists() || $department->students()->exists() || $department->batches()->exists()) {
            return response()->json([
                'message' => 'Cannot delete department with active faculty, students, or batches.'
            ], Response::HTTP_CONFLICT);
        }

        $department->delete();

        return response()->json([
            'message' => 'Department deleted successfully'
        ], Response::HTTP_OK);
    }

    public function batches(Department $department): JsonResponse
    {
        $batches = $department->batches()->with('currentSemester')->get();

        return response()->json([
            'data' => BatchResource::collection($batches)
        ], Response::HTTP_OK);
    }

    public function faculty(Department $department): JsonResponse
    {
        $faculty = $department->faculty()->with(['designation'])->get();

        return response()->json([
            'data' => FacultyResource::collection($faculty)
        ], Response::HTTP_OK);
    }

    public function subjects(Department $department): JsonResponse
    {
        $subjects = $department->subjects()->with('semester')->get();

        return response()->json([
            'data' => SubjectResource::collection($subjects)
        ], Response::HTTP_OK);
    }
}
