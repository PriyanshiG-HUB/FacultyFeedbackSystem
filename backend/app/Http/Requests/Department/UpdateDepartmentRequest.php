<?php

namespace App\Http\Requests\Department;

use App\Models\Department;
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
        $dept = $this->route('department');
        $id = $dept instanceof Department ? $dept->id : $dept;

        return [
            'department_code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('department', 'department_code')->ignore($id)],
            'department_name' => ['sometimes', 'required', 'string', 'max:100'],
            'hod_faculty_id' => ['nullable', 'integer', 'exists:faculty,id', Rule::unique('department', 'hod_faculty_id')->ignore($id)],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],

            // Optional new HOD creation during department update
            'hod_full_name' => ['nullable', 'string', 'max:120'],
            'hod_name' => ['nullable', 'string', 'max:120'],
            'hod_email' => ['nullable', 'email', 'max:150', Rule::unique('faculty', 'email'), Rule::unique('user_account', 'email')],
            'hod_mobile' => ['nullable', 'string', 'max:20'],
            'hod_designation_id' => ['nullable', 'integer', 'exists:designation,id'],
            'hod_password' => ['nullable', 'string', 'min:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'hod_faculty_id.unique' => 'The selected faculty member is already appointed as HOD of another department.',
            'department_code.unique' => 'This department code is already in use.',
            'hod_email.unique' => 'A faculty member or user account with this email address already exists.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->hod_faculty_id) {
                $faculty = \App\Models\Faculty::find($this->hod_faculty_id);
                $dept = $this->route('department');
                $deptId = $dept instanceof Department ? $dept->id : $dept;
                
                if ($faculty && $faculty->department_id !== (int) $deptId) {
                    $validator->errors()->add(
                        'hod_faculty_id',
                        'The selected faculty member must belong to this department to be assigned as HOD.'
                    );
                }
            }
        });
    }
}
