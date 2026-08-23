<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('student')?->id ?? $this->route('student');

        return [
            'roll_no' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('student', 'roll_no')->ignore($id)],
            'enrollment_no' => ['nullable', 'string', 'max:50', Rule::unique('student', 'enrollment_no')->ignore($id)],
            'full_name' => ['sometimes', 'required', 'string', 'max:200'],
            'email' => ['sometimes', 'required', 'email', 'max:200', Rule::unique('student', 'email')->ignore($id)],
            'mobile' => ['nullable', 'string', 'max:30'],
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'batch_id' => ['sometimes', 'required', 'integer', 'exists:batch,id'],
            'division_id' => ['sometimes', 'required', 'integer', 'exists:division,id'],
            'section_id' => ['nullable', 'integer', 'exists:section,id'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE,SUSPENDED'],
        ];
    }
}
