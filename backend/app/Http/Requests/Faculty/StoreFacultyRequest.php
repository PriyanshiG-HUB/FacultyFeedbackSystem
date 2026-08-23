<?php

namespace App\Http\Requests\Faculty;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacultyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'email', 'max:200', 'unique:faculty,email', 'unique:user_account,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'employee_code' => ['nullable', 'string', 'max:50', 'unique:faculty,employee_code'],
            'mobile' => ['nullable', 'string', 'max:30'],
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'designation_id' => ['nullable', 'integer', 'exists:designation,id'],
            'joining_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
