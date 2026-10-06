<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserAccountResource;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Faculty;
use App\Models\UserAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's profile details.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'faculty.department',
            'faculty.designation',
            'student.department',
            'student.batch',
            'student.division',
            'student.section',
        ]);

        return response()->json([
            'user' => new UserAccountResource($user)
        ], Response::HTTP_OK);
    }

    /**
     * Update the authenticated user's basic profile details (name, email, mobile).
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:120',
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('user_account', 'email')->ignore($user->id),
            ],
            'mobile' => 'nullable|string|max:20',
        ]);

        // If faculty record exists, validate email uniqueness ignoring current faculty id
        if ($user->faculty) {
            $request->validate([
                'email' => [
                    Rule::unique('faculty', 'email')->ignore($user->faculty->id),
                ],
            ]);
        }

        // Update UserAccount email
        $user->email = strtolower(trim($validated['email']));
        $user->save();

        // Update or create Faculty profile record
        if ($user->faculty) {
            $user->faculty->full_name = trim($validated['full_name']);
            $user->faculty->email = strtolower(trim($validated['email']));
            $user->faculty->mobile = $validated['mobile'] ? trim($validated['mobile']) : null;
            $user->faculty->save();
        } else {
            // If user has no faculty row (e.g., pure ADMIN / SUPER_ADMIN account), create one so details are persisted
            $dept = Department::first();
            $desig = Designation::first();
            if ($dept && $desig) {
                Faculty::create([
                    'user_account_id' => $user->id,
                    'full_name' => trim($validated['full_name']),
                    'email' => strtolower(trim($validated['email'])),
                    'mobile' => $validated['mobile'] ? trim($validated['mobile']) : null,
                    'department_id' => $dept->id,
                    'designation_id' => $desig->id,
                    'status' => 'ACTIVE',
                ]);
            }
        }

        // Reload user with relations
        $user->load([
            'faculty.department',
            'faculty.designation',
            'student.department',
            'student.batch',
            'student.division',
            'student.section',
        ]);

        return response()->json([
            'message' => 'Profile details updated successfully.',
            'user' => new UserAccountResource($user),
        ], Response::HTTP_OK);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $currentPassword = $validated['current_password'];
        $passwordMatches = false;

        // Support plain text match (e.g., default seeded password123) or Hash::check
        if ($currentPassword === $user->password_hash) {
            $passwordMatches = true;
        } else {
            try {
                if (Hash::check($currentPassword, $user->password_hash)) {
                    $passwordMatches = true;
                }
            } catch (\Throwable $e) {
                $passwordMatches = false;
            }
        }

        if (!$passwordMatches) {
            return response()->json([
                'message' => 'The current password provided is incorrect.',
                'errors' => [
                    'current_password' => ['The current password provided is incorrect.']
                ]
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Update password with Hash::make
        $user->password_hash = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ], Response::HTTP_OK);
    }
}
