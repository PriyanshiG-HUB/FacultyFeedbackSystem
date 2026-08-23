<?php

namespace App\Http\Requests\Department;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('department')?->id ?? $this->route('department');

        return [
            'department_code' => ['sometimes', 'required', 'string', 'max:10', Rule::unique('department', 'department_code')->ignore($id)],
            'department_name' => ['sometimes', 'required', 'string', 'max:200'],
            'hod_faculty_id' => ['nullable', 'integer', 'exists:faculty,id'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ];
    }
}
