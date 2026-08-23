<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_code' => $this->subject_code,
            'subject_name' => $this->subject_name,
            'department_id' => $this->department_id,
            'semester_id' => $this->semester_id,
            'course_type' => $this->course_type,
            'credits' => $this->credits,
            'status' => $this->status,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'semester' => new SemesterResource($this->whenLoaded('semester')),
        ];
    }
}
