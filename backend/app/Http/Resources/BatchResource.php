<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'program_name' => $this->program_name,
            'batch_title' => $this->batch_title,
            'admission_year' => $this->admission_year,
            'graduation_year' => $this->graduation_year,
            'current_semester_id' => $this->current_semester_id,
            'status' => $this->status,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'current_semester' => new SemesterResource($this->whenLoaded('currentSemester')),
        ];
    }
}
