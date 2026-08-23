<?php

namespace App\Http\Requests\TeachingAssignment;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeachingAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'integer', 'exists:subject,id'],
            'faculty_id' => ['required', 'integer', 'exists:faculty,id'],
            'batch_id' => ['required', 'integer', 'exists:batch,id'],
            'division_id' => ['nullable', 'integer', 'exists:division,id'],
            'section_id' => ['nullable', 'integer', 'exists:section,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_year,id'],
            'semester_id' => ['required', 'integer', 'exists:semester,id'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
