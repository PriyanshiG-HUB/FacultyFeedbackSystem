<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Faculty\StoreFacultyRequest;
use App\Http\Requests\Faculty\UpdateFacultyRequest;
use App\Http\Resources\FacultyResource;
use App\Models\Faculty;
use App\Models\UserAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class FacultyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Faculty::with(['department', 'designation', 'userAccount']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
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

        $faculty = DB::transaction(function () use ($data) {
            $password = $data['password'] ?? 'password123';
            $userAccount = UserAccount::create([
                'email' => $data['email'],
                'password_hash' => Hash::make($password),
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

    public function show(Faculty $faculty): JsonResponse
    {
        return response()->json([
            'data' => new FacultyResource($faculty->load(['department', 'designation', 'userAccount']))
        ], Response::HTTP_OK);
    }

    public function update(UpdateFacultyRequest $request, Faculty $faculty): JsonResponse
    {
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

    public function destroy(Faculty $faculty): JsonResponse
    {
        if ($faculty->teachingAssignments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete faculty member with active teaching assignments.'
            ], Response::HTTP_CONFLICT);
        }

        DB::transaction(function () use ($faculty) {
            $userAccount = $faculty->userAccount;
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
