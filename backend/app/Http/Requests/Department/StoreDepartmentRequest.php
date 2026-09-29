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
            'department_code' => ['required', 'string', 'max:20', 'unique:department,department_code'],
            'department_name' => ['required', 'string', 'max:100'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
            'hod_faculty_id' => ['nullable', 'integer', 'exists:faculty,id', 'unique:department,hod_faculty_id'],

            // Optional fields to register a new HOD as a Faculty member during creation
            'hod_full_name' => ['nullable', 'string', 'max:120'],
            'hod_name' => ['nullable', 'string', 'max:120'],
            'hod_email' => ['nullable', 'email', 'max:150', 'unique:faculty,email', 'unique:user_account,email'],
            'hod_mobile' => ['nullable', 'string', 'max:20'],
            'hod_designation_id' => ['nullable', 'integer', 'exists:designation,id'],
            'hod_password' => ['nullable', 'string', 'min:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'department_code.unique' => 'This department code is already in use.',
            'hod_faculty_id.unique' => 'The selected faculty member is already appointed as HOD of another department.',
            'hod_faculty_id.exists' => 'The selected faculty member does not exist.',
            'hod_email.unique' => 'A faculty member or user account with this email address already exists.',
        ];
    }
}
