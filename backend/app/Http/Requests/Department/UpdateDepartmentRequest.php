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
            'department_code' => ['sometimes', 'required', 'string', 'max:10', Rule::unique('department', 'department_code')->ignore($id)],
            'department_name' => ['sometimes', 'required', 'string', 'max:200'],
            'hod_faculty_id' => ['nullable', 'integer', 'exists:faculty,id', Rule::unique('department', 'hod_faculty_id')->ignore($id)],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ];
    }

    public function messages(): array
    {
        return [
            'hod_faculty_id.unique' => 'The selected faculty member is already appointed as HOD of another department.',
            'department_code.unique' => 'This department code is already in use.',
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
