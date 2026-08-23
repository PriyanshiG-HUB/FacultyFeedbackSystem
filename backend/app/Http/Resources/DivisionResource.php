<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DivisionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'batch_id' => $this->batch_id,
            'semester_id' => $this->semester_id,
            'division_code' => $this->division_code,
            'status' => $this->status,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'batch' => new BatchResource($this->whenLoaded('batch')),
            'semester' => new SemesterResource($this->whenLoaded('semester')),
        ];
    }
}
