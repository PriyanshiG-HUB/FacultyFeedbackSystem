<?php

namespace App\Traits;

use App\Models\Department;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

trait AuthorizesDepartmentScope
{
    /**
     * Determine if authenticated user has global unrestricted access (Admin or Super Admin).
     */
    protected function isUnrestrictedAdmin(?Request $request = null): bool
    {
        $user = $request ? $request->user() : auth()->user();
        if (!$user) {
            return false;
        }
        return in_array($user->role, ['SUPER_ADMIN', 'ADMIN']);
    }

    /**
     * Get the department ID for an HOD user, or null if unrestricted admin.
     * Aborts with 403 if user is not authorized.
     */
    protected function getAuthorizedDepartmentId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'Unauthenticated.');
        }

        if (in_array($user->role, ['SUPER_ADMIN', 'ADMIN'])) {
            return null;
        }

        if ($user->isHod()) {
            $hodDept = $user->getHodDepartment();
            return $hodDept ? $hodDept->id : -1;
        }

        abort(Response::HTTP_FORBIDDEN, 'Forbidden: You do not have administrative access.');
    }

    /**
     * Validate that the requested department matches the user's authorized scope.
     * If user is an HOD and target department ID does not match, aborts with 403.
     */
    protected function validateDepartmentAccess(Request $request, int $targetDepartmentId): void
    {
        $user = $request->user();
        if (!$user) {
            abort(Response::HTTP_UNAUTHORIZED, 'Unauthenticated.');
        }

        if (in_array($user->role, ['SUPER_ADMIN', 'ADMIN'])) {
            return;
        }

        if ($user->isHod()) {
            $hodDept = $user->getHodDepartment();
            if ($hodDept && $hodDept->id === $targetDepartmentId) {
                return;
            }
            abort(Response::HTTP_FORBIDDEN, 'Forbidden: You are not authorized to manage records for this department.');
        }

        abort(Response::HTTP_FORBIDDEN, 'Forbidden: Administrative access required.');
    }
}
