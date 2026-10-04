<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Models\UserAccount;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class StudentController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['department', 'batch', 'division', 'section', 'userAccount']);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->where('department_id', $hodDeptId);
        } elseif ($request->has('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

if ($request->has('batch_id')) {
    $query->where('batch_id', $request->input('batch_id'));
}

if ($request->has('division_id')) {
    $query->where('division_id', $request->input('division_id'));
}

if ($request->has('section_id')) {
    $query->where('section_id', $request->input('section_id'));
}

if ($request->has('search')) {
    $search = $request->input('search');

    $query->where(function ($q) use ($search) {
        $q->where('full_name', 'like', "%{$search}%")
          ->orWhere('roll_no', 'like', "%{$search}%")
          ->orWhere('enrollment_no', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%");
    });
}

        $students = $query->get();

        return response()->json([
            'data' => StudentResource::collection($students)
        ], Response::HTTP_OK);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            if (isset($data['department_id']) && (int) $data['department_id'] !== $hodDeptId) {
                abort(Response::HTTP_FORBIDDEN, 'Forbidden: You cannot create a student for another department.');
            }
            $data['department_id'] = $hodDeptId;
        }

        $student = DB::transaction(function () use ($data) {
            // Student credentials: password defaults to student ID / roll number (e.g. 24IT019)
            $defaultPassword = $data['roll_no'] ?? $data['enrollment_no'] ?? 'password123';
            $password = $data['password'] ?? $defaultPassword;

            $userAccount = UserAccount::create([
                'email' => $data['email'],
                'password_hash' => Hash::make($password),
                'role' => 'STUDENT',
                'status' => 'ACTIVE',
            ]);

            $data['user_account_id'] = $userAccount->id;
            $data['enrollment_no'] = $data['enrollment_no'] ?? 'ENR-' . strtoupper(substr(md5((string) microtime()), 0, 6));
            unset($data['password']);

            return Student::create($data);
        });

        return response()->json([
            'message' => 'Student created successfully',
            'data' => new StudentResource($student->load(['department', 'batch', 'division', 'section', 'userAccount']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Student $student): JsonResponse
    {
        $this->validateDepartmentAccess($request, $student->department_id);

        return response()->json([
            'data' => new StudentResource($student->load(['department', 'batch', 'division', 'section', 'userAccount']))
        ], Response::HTTP_OK);
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $this->validateDepartmentAccess($request, $student->department_id);

        $data = $request->validated();

        DB::transaction(function () use ($student, $data) {
            if (isset($data['email']) && $student->userAccount) {
                $student->userAccount->update(['email' => $data['email']]);
            }
            $student->update($data);
        });

        return response()->json([
            'message' => 'Student updated successfully',
            'data' => new StudentResource($student->fresh(['department', 'batch', 'division', 'section', 'userAccount']))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Student $student): JsonResponse
    {
        $this->validateDepartmentAccess($request, $student->department_id);

        if ($student->feedbackResponses()->exists()) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete student with submitted feedback responses.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($student) {
                // Delete answers and responses
                foreach ($student->feedbackResponses as $response) {
                    $response->feedbackAnswers()->delete();
                    $response->delete();
                }
                $student->electiveEnrollments()->delete();

                $userAccount = $student->userAccount;
                $student->delete();
                if ($userAccount) {
                    $userAccount->delete();
                }
            });

            return response()->json([
                'message' => 'Student and all associated records deleted successfully'
            ], Response::HTTP_OK);
        }

        DB::transaction(function () use ($student) {
            $student->electiveEnrollments()->delete();
            $userAccount = $student->userAccount;
            $student->delete();
            if ($userAccount) {
                $userAccount->delete();
            }
        });

        return response()->json([
            'message' => 'Student deleted successfully'
        ], Response::HTTP_OK);
    }
}
