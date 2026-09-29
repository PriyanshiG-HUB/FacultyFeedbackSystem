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

        $validated = $request->validated();

        $department = DB::transaction(function () use ($validated) {
            $dept = Department::create([
                'department_code' => $validated['department_code'],
                'department_name' => $validated['department_name'],
                'status' => $validated['status'] ?? 'ACTIVE',
            ]);

            $hodFullName = $validated['hod_full_name'] ?? $validated['hod_name'] ?? null;
            $hodEmail = $validated['hod_email'] ?? null;

            // Option A: Register a new Faculty member as HOD
            if (!empty($hodFullName) && !empty($hodEmail)) {
                $password = $validated['hod_password'] ?? 'password123';
                $userAccount = \App\Models\UserAccount::create([
                    'email' => $hodEmail,
                    'password_hash' => \Illuminate\Support\Facades\Hash::make($password),
                    'role' => 'HOD',
                    'status' => 'ACTIVE',
                ]);

                $designationId = $validated['hod_designation_id'] ?? null;
                if (!$designationId) {
                    $designation = \App\Models\Designation::firstOrCreate(
                        ['designation_name' => 'Head of Department'],
                        ['status' => 'ACTIVE']
                    );
                    $designationId = $designation->id;
                }

                $hodFaculty = \App\Models\Faculty::create([
                    'user_account_id' => $userAccount->id,
                    'full_name' => $hodFullName,
                    'email' => $hodEmail,
                    'mobile' => $validated['hod_mobile'] ?? null,
                    'department_id' => $dept->id,
                    'designation_id' => $designationId,
                    'status' => 'ACTIVE',
                ]);

                $dept->update(['hod_faculty_id' => $hodFaculty->id]);
            }
            // Option B: Select an existing Faculty member as HOD
            elseif (!empty($validated['hod_faculty_id'])) {
                $faculty = \App\Models\Faculty::find($validated['hod_faculty_id']);
                if ($faculty) {
                    $faculty->update(['department_id' => $dept->id]);
                    if ($faculty->userAccount) {
                        $faculty->userAccount->update(['role' => 'HOD']);
                    }
                    $dept->update(['hod_faculty_id' => $faculty->id]);
                }
            }

            return $dept;
        });

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

        $validated = $request->validated();

        DB::transaction(function () use ($department, $validated) {
            $hodFullName = $validated['hod_full_name'] ?? $validated['hod_name'] ?? null;
            $hodEmail = $validated['hod_email'] ?? null;

            // Option A: Register a new Faculty member as the new HOD
            if (!empty($hodFullName) && !empty($hodEmail)) {
                $password = $validated['hod_password'] ?? 'password123';
                $userAccount = \App\Models\UserAccount::create([
                    'email' => $hodEmail,
                    'password_hash' => \Illuminate\Support\Facades\Hash::make($password),
                    'role' => 'HOD',
                    'status' => 'ACTIVE',
                ]);

                $designationId = $validated['hod_designation_id'] ?? null;
                if (!$designationId) {
                    $designation = \App\Models\Designation::firstOrCreate(
                        ['designation_name' => 'Head of Department'],
                        ['status' => 'ACTIVE']
                    );
                    $designationId = $designation->id;
                }

                $newFaculty = \App\Models\Faculty::create([
                    'user_account_id' => $userAccount->id,
                    'full_name' => $hodFullName,
                    'email' => $hodEmail,
                    'mobile' => $validated['hod_mobile'] ?? null,
                    'department_id' => $department->id,
                    'designation_id' => $designationId,
                    'status' => 'ACTIVE',
                ]);

                // Update department HOD. Note: The previous faculty member record is preserved in faculty table.
                $department->update(['hod_faculty_id' => $newFaculty->id]);
            }
            // Option B: Change HOD to another existing Faculty member or remove HOD (set to null)
            elseif (array_key_exists('hod_faculty_id', $validated)) {
                $newHodId = $validated['hod_faculty_id'];
                if ($newHodId) {
                    $faculty = \App\Models\Faculty::find($newHodId);
                    if ($faculty) {
                        $faculty->update(['department_id' => $department->id]);
                        if ($faculty->userAccount) {
                            $faculty->userAccount->update(['role' => 'HOD']);
                        }
                    }
                }
                // Update department HOD pointer. Note: The previous faculty record is preserved.
                $department->update(['hod_faculty_id' => $newHodId]);
            }

            // Update basic department fields if supplied
            $updateFields = [];
            if (isset($validated['department_code'])) {
                $updateFields['department_code'] = $validated['department_code'];
            }
            if (isset($validated['department_name'])) {
                $updateFields['department_name'] = $validated['department_name'];
            }
            if (isset($validated['status'])) {
                $updateFields['status'] = $validated['status'];
            }
            if (!empty($updateFields)) {
                $department->update($updateFields);
            }
        });

        return response()->json([
            'message' => 'Department updated successfully',
            'data' => new DepartmentResource($department->fresh(['hodFaculty.designation']))
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
