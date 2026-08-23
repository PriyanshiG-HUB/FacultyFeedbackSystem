<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'department_id' => $this->department_id,
            'academic_year_id' => $this->academic_year_id,
            'term' => $this->term,
            'sample_size' => $this->sample_size,
            'is_published' => $this->is_published,
            'pdf_file_path' => $this->pdf_file_path,
            'generated_by_user_account_id' => $this->generated_by_user_account_id,
            'generated_at' => $this->generated_at?->toIso8601String(),
            'status' => $this->status,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'academic_year' => new AcademicYearResource($this->whenLoaded('academicYear')),
            'generated_by_user_account' => new UserAccountResource($this->whenLoaded('generatedByUserAccount')),
        ];
    }
}
