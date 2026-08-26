<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectOfferingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'batch_id' => $this->batch_id,
            'academic_year_id' => $this->academic_year_id,
            'enrollment_capacity' => $this->enrollment_capacity,
            'enrolled_count' => $this->elective_enrollments_count ?? ($this->relationLoaded('electiveEnrollments') ? $this->electiveEnrollments->count() : $this->electiveEnrollments()->count()),
            'status' => $this->status,
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'batch' => new BatchResource($this->whenLoaded('batch')),
            'academic_year' => new AcademicYearResource($this->whenLoaded('academicYear')),
        ];
    }
}
