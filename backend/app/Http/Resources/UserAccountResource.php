<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hodDept = method_exists($this->resource, 'isHod') && $this->resource->isHod() ? $this->resource->getHodDepartment() : null;
        $effectiveRole = $this->role;
        if ($this->role === 'FACULTY' && $hodDept) {
            $effectiveRole = 'HOD';
        }

        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $effectiveRole,
            'canonical_role' => $this->role,
            'is_hod' => $hodDept !== null,
            'hod_department_id' => $hodDept?->id,
            'hod_department_code' => $hodDept?->department_code,
            'status' => $this->status,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'faculty' => new FacultyResource($this->whenLoaded('faculty')),
            'student' => new StudentResource($this->whenLoaded('student')),
        ];
    }
}
