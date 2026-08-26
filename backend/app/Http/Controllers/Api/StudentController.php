<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Models\UserAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['department', 'batch', 'division', 'section', 'userAccount']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->get('batch_id'));
        }
        if ($request->has('division_id')) {
            $query->where('division_id', $request->get('division_id'));
        }
        if ($request->has('section_id')) {
            $query->where('section_id', $request->get('section_id'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
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

        $student = DB::transaction(function () use ($data) {
            $password = $data['password'] ?? 'password123';
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

    public function show(Student $student): JsonResponse
    {
        return response()->json([
            'data' => new StudentResource($student->load(['department', 'batch', 'division', 'section', 'userAccount']))
        ], Response::HTTP_OK);
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
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

    public function destroy(Student $student): JsonResponse
    {
        if ($student->feedbackResponses()->exists()) {
            return response()->json([
                'message' => 'Cannot delete student with submitted feedback responses.'
            ], Response::HTTP_CONFLICT);
        }

        DB::transaction(function () use ($student) {
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
