<?php

namespace App\Http\Requests\Department;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_code' => ['required', 'string', 'max:10', 'unique:department,department_code'],
            'department_name' => ['required', 'string', 'max:200'],
            'hod_faculty_id' => ['nullable', 'integer', 'exists:faculty,id', 'unique:department,hod_faculty_id'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ];
    }

    public function messages(): array
    {
        return [
            'hod_faculty_id.unique' => 'The selected faculty member is already appointed as HOD of another department.',
            'department_code.unique' => 'This department code is already in use.',
        ];
    }
}
