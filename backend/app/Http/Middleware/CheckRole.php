<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Map logical 'ADMIN' role to canonical database 'SUPER_ADMIN'
        $userRole = $user->role;
        $normalizedUserRoles = [$userRole];
        if ($userRole === 'SUPER_ADMIN') {
            $normalizedUserRoles[] = 'ADMIN';
            $normalizedUserRoles[] = 'SUPER_ADMIN';
        }

        $allowed = false;
        foreach ($roles as $role) {
            $normalizedRole = strtoupper($role);
            if ($normalizedRole === 'ADMIN') {
                if (in_array('SUPER_ADMIN', $normalizedUserRoles) || in_array('ADMIN', $normalizedUserRoles)) {
                    $allowed = true;
                    break;
                }
            } elseif (in_array($normalizedRole, $normalizedUserRoles)) {
                $allowed = true;
                break;
            }
        }

        if (!$allowed) {
            return response()->json([
                'message' => 'Forbidden: Access denied for role ' . $userRole
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
