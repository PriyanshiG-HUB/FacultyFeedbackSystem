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
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Department::with(['hodFaculty.designation'])->withCount(['faculty', 'students']);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->where('id', $hodDeptId);
        }

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
        if (!$this->isUnrestrictedAdmin($request)) {
            abort(Response::HTTP_FORBIDDEN, 'Forbidden: Only administrators can create departments.');
        }

        $department = Department::create($request->validated());

        return response()->json([
            'message' => 'Department created successfully',
            'data' => new DepartmentResource($department->load(['hodFaculty.designation']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Department $department): JsonResponse
    {
        $this->validateDepartmentAccess($request, $department->id);

        $department->load(['hodFaculty.designation'])->loadCount(['faculty', 'students']);

        return response()->json([
            'data' => new DepartmentResource($department)
        ], Response::HTTP_OK);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $this->validateDepartmentAccess($request, $department->id);

        $department->update($request->validated());

        return response()->json([
            'message' => 'Department updated successfully',
            'data' => new DepartmentResource($department->fresh('hodFaculty'))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Department $department): JsonResponse
    {
        if (!$this->isUnrestrictedAdmin($request)) {
            abort(Response::HTTP_FORBIDDEN, 'Forbidden: Only administrators can delete departments.');
        }

        $hasDependencies = $department->faculty()->exists() || $department->students()->exists() || $department->batches()->exists() || $department->subjects()->exists();

        if ($hasDependencies) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete department with active faculty, students, batches, or subjects.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($department) {
                // Remove HOD reference first to avoid self/foreign key loops
                $department->update(['hod_faculty_id' => null]);

                // Delete teaching assignments & offerings for subjects in this department
                foreach ($department->subjects as $subject) {
                    $subject->teachingAssignments()->delete();
                    $subject->subjectOfferings()->delete();
                    $subject->delete();
                }

                // Delete batches, divisions, sections, and students
                foreach ($department->batches as $batch) {
                    foreach ($batch->divisions as $division) {
                        $division->sections()->delete();
                        $division->delete();
                    }
                    $batch->delete();
                }

                foreach ($department->students as $student) {
                    $userAccount = $student->userAccount;
                    $student->delete();
                    if ($userAccount) {
                        $userAccount->delete();
                    }
                }

                foreach ($department->faculty as $fac) {
                    $fac->teachingAssignments()->delete();
                    $userAccount = $fac->userAccount;
                    $fac->delete();
                    if ($userAccount) {
                        $userAccount->delete();
                    }
                }

                $department->delete();
            });

            return response()->json([
                'message' => 'Department and all associated records deleted successfully'
            ], Response::HTTP_OK);
        }

        $department->delete();

        return response()->json([
            'message' => 'Department deleted successfully'
        ], Response::HTTP_OK);
    }

    public function batches(Request $request, Department $department): JsonResponse
    {
        $this->validateDepartmentAccess($request, $department->id);

        $batches = $department->batches()->with('currentSemester')->get();

        return response()->json([
            'data' => BatchResource::collection($batches)
        ], Response::HTTP_OK);
    }

    public function faculty(Request $request, Department $department): JsonResponse
    {
        $this->validateDepartmentAccess($request, $department->id);

        $faculty = $department->faculty()->with(['designation'])->get();

        return response()->json([
            'data' => FacultyResource::collection($faculty)
        ], Response::HTTP_OK);
    }

    public function subjects(Request $request, Department $department): JsonResponse
    {
        $this->validateDepartmentAccess($request, $department->id);

        $subjects = $department->subjects()->with(['semester'])->get();

        return response()->json([
            'data' => SubjectResource::collection($subjects)
        ], Response::HTTP_OK);
    }
}
