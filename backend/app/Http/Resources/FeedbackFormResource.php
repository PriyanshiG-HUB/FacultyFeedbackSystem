<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackFormResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'form_code' => $this->form_code,
            'title' => $this->title,
            'teaching_assignment_id' => $this->teaching_assignment_id,
            'window_start_date' => $this->window_start_date?->format('Y-m-d'),
            'window_end_date' => $this->window_end_date?->format('Y-m-d'),
            'is_anonymous' => $this->is_anonymous,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at?->toIso8601String(),
            'status' => $this->status,
            'created_by_user_account_id' => $this->created_by_user_account_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'teaching_assignment' => new TeachingAssignmentResource($this->whenLoaded('teachingAssignment')),
            'created_by_user_account' => new UserAccountResource($this->whenLoaded('createdByUserAccount')),
            'questions' => FeedbackQuestionResource::collection($this->whenLoaded('questions')),
            'responses_count' => $this->when(isset($this->responses_count), $this->responses_count),
        ];
    }
}
