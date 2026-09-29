<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Faculty\StoreFacultyRequest;
use App\Http\Requests\Faculty\UpdateFacultyRequest;
use App\Http\Resources\FacultyResource;
use App\Models\Faculty;
use App\Models\UserAccount;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class FacultyController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Faculty::with(['department', 'designation', 'userAccount']);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->where('department_id', $hodDeptId);
        } elseif ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $faculty = $query->get();

        return response()->json([
            'data' => FacultyResource::collection($faculty)
        ], Response::HTTP_OK);
    }

    public function store(StoreFacultyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            if (isset($data['department_id']) && (int)$data['department_id'] !== $hodDeptId) {
                abort(Response::HTTP_FORBIDDEN, 'Forbidden: You cannot create faculty for another department.');
            }
            $data['department_id'] = $hodDeptId;
        }

        $faculty = DB::transaction(function () use ($data) {
            $password = $data['password'] ?? 'password123';
            $userAccount = UserAccount::create([
                'email' => $data['email'],
                'password_hash' => $password,
                'role' => 'FACULTY',
                'status' => 'ACTIVE',
            ]);

            $data['user_account_id'] = $userAccount->id;
            unset($data['password']);

            return Faculty::create($data);
        });

        return response()->json([
            'message' => 'Faculty created successfully',
            'data' => new FacultyResource($faculty->load(['department', 'designation', 'userAccount']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Faculty $faculty): JsonResponse
    {
        $this->validateDepartmentAccess($request, $faculty->department_id);

        return response()->json([
            'data' => new FacultyResource($faculty->load(['department', 'designation', 'userAccount']))
        ], Response::HTTP_OK);
    }

    public function update(UpdateFacultyRequest $request, Faculty $faculty): JsonResponse
    {
        $this->validateDepartmentAccess($request, $faculty->department_id);

        $data = $request->validated();

        DB::transaction(function () use ($faculty, $data) {
            if (isset($data['email']) && $faculty->userAccount) {
                $faculty->userAccount->update(['email' => $data['email']]);
            }
            $faculty->update($data);
        });

        return response()->json([
            'message' => 'Faculty updated successfully',
            'data' => new FacultyResource($faculty->fresh(['department', 'designation', 'userAccount']))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Faculty $faculty): JsonResponse
    {
        $this->validateDepartmentAccess($request, $faculty->department_id);

        if ($faculty->teachingAssignments()->exists()) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete faculty member with active teaching assignments.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }
        }

        DB::transaction(function () use ($faculty) {
            $userAccount = $faculty->userAccount;
            
            // Unset HOD from any departments
            \App\Models\Department::where('hod_faculty_id', $faculty->id)
                ->update(['hod_faculty_id' => null]);
            
            // Delete teaching assignments & associated feedback forms and timetables
            foreach ($faculty->teachingAssignments as $assignment) {
                \App\Models\FeedbackForm::where('teaching_assignment_id', $assignment->id)->delete();
                \App\Models\Timetable::where('teaching_assignment_id', $assignment->id)->delete();
                $assignment->delete();
            }

            $faculty->delete();
            if ($userAccount) {
                $userAccount->delete();
            }
        });

        return response()->json([
            'message' => 'Faculty deleted successfully'
        ], Response::HTTP_OK);
    }
}
