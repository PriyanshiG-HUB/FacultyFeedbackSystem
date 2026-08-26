<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_code' => $this->department_code,
            'department_name' => $this->department_name,
            'hod_faculty_id' => $this->hod_faculty_id,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'hod_faculty' => new FacultyResource($this->whenLoaded('hodFaculty')),
            'faculty_count' => $this->when(isset($this->faculty_count), $this->faculty_count),
            'students_count' => $this->when(isset($this->students_count), $this->students_count),
            'student_count' => $this->when(isset($this->students_count) || isset($this->student_count), $this->students_count ?? $this->student_count),
        ];
    }
}
