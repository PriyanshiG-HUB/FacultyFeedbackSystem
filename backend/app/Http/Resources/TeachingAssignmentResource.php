<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeachingAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'faculty_id' => $this->faculty_id,
            'batch_id' => $this->batch_id,
            'division_id' => $this->division_id,
            'section_id' => $this->section_id,
            'academic_year_id' => $this->academic_year_id,
            'semester_id' => $this->semester_id,
            'status' => $this->status,
            'scope' => $this->isEntireBatch() ? 'BATCH' : ($this->isEntireDivision() ? 'DIVISION' : 'SECTION'),
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'faculty' => new FacultyResource($this->whenLoaded('faculty')),
            'batch' => new BatchResource($this->whenLoaded('batch')),
            'division' => new DivisionResource($this->whenLoaded('division')),
            'section' => new SectionResource($this->whenLoaded('section')),
            'academic_year' => new AcademicYearResource($this->whenLoaded('academicYear')),
            'semester' => new SemesterResource($this->whenLoaded('semester')),
        ];
    }
}
