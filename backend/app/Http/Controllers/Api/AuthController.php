<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserAccountResource;
use App\Models\UserAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Authenticate user account and generate Sanctum API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = UserAccount::with(['faculty.department', 'faculty.designation', 'student.department', 'student.batch', 'student.division', 'student.section'])
            ->where('email', $credentials['email'])
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->password_hash)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($user->status !== 'ACTIVE') {
            return response()->json([
                'message' => 'Account is ' . strtolower($user->status)
            ], Response::HTTP_FORBIDDEN);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserAccountResource($user),
        ], Response::HTTP_OK);
    }

    /**
     * Revoke current Sanctum token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful'
        ], Response::HTTP_OK);
    }

    /**
     * Get authenticated user account profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['faculty.department', 'faculty.designation', 'student.department', 'student.batch', 'student.division', 'student.section']);

        return response()->json([
            'user' => new UserAccountResource($user)
        ], Response::HTTP_OK);
    }
}
