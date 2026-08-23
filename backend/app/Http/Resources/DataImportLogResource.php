<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataImportLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'import_type' => $this->import_type,
            'department_id' => $this->department_id,
            'uploaded_by_user_account_id' => $this->uploaded_by_user_account_id,
            'record_count' => $this->record_count,
            'status' => $this->status,
            'error_log' => $this->error_log,
            'uploaded_at' => $this->uploaded_at?->toIso8601String(),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'uploaded_by_user_account' => new UserAccountResource($this->whenLoaded('uploadedByUserAccount')),
        ];
    }
}
