<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'rating_scale_min' => $this->rating_scale_min,
            'rating_scale_max' => $this->rating_scale_max,
            'min_responses_threshold' => $this->min_responses_threshold,
            'window_start_date' => $this->window_start_date?->format('Y-m-d'),
            'window_end_date' => $this->window_end_date?->format('Y-m-d'),
            'enforce_anonymous_submissions' => $this->enforce_anonymous_submissions,
            'auto_publish_on_window_close' => $this->auto_publish_on_window_close,
            'updated_by_user_account_id' => $this->updated_by_user_account_id,
            'updated_at' => $this->updated_at?->toIso8601String(),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'updated_by_user_account' => new UserAccountResource($this->whenLoaded('updatedByUserAccount')),
        ];
    }
}
