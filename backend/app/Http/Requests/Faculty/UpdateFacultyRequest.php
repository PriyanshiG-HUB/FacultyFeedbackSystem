<?php

namespace App\Http\Requests\Faculty;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFacultyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('faculty')?->id ?? $this->route('faculty');

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:200'],
            'email' => ['sometimes', 'required', 'email', 'max:200', Rule::unique('faculty', 'email')->ignore($id)],
            'employee_code' => ['nullable', 'string', 'max:50', Rule::unique('faculty', 'employee_code')->ignore($id)],
            'mobile' => ['nullable', 'string', 'max:30'],
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'designation_id' => ['nullable', 'integer', 'exists:designation,id'],
            'joining_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
