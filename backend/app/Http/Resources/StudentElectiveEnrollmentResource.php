<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentElectiveEnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'subject_offering_id' => $this->subject_offering_id,
            'status' => $this->status,
            'enrolled_at' => $this->enrolled_at?->toIso8601String(),
            'student' => new StudentResource($this->whenLoaded('student')),
            'subject_offering' => new SubjectOfferingResource($this->whenLoaded('subjectOffering')),
        ];
    }
}
