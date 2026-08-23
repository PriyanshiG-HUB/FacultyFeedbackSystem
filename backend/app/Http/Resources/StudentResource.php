<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_account_id' => $this->user_account_id,
            'roll_no' => $this->roll_no,
            'enrollment_no' => $this->enrollment_no,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'mobile' => $this->mobile,
            'department_id' => $this->department_id,
            'batch_id' => $this->batch_id,
            'division_id' => $this->division_id,
            'section_id' => $this->section_id,
            'status' => $this->status,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'batch' => new BatchResource($this->whenLoaded('batch')),
            'division' => new DivisionResource($this->whenLoaded('division')),
            'section' => new SectionResource($this->whenLoaded('section')),
        ];
    }
}
