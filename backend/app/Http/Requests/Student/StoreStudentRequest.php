<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roll_no' => ['required', 'string', 'max:50', 'unique:student,roll_no'],
            'enrollment_no' => ['nullable', 'string', 'max:50', 'unique:student,enrollment_no'],
            'full_name' => ['required', 'string', 'max:200'],
            'email' => ['required', 'email', 'max:200', 'unique:student,email', 'unique:user_account,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'mobile' => ['nullable', 'string', 'max:30'],
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'batch_id' => ['required', 'integer', 'exists:batch,id'],
            'division_id' => ['required', 'integer', 'exists:division,id'],
            'section_id' => ['nullable', 'integer', 'exists:section,id'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,SUSPENDED'],
        ];
    }
}
