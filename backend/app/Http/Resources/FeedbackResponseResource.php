<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResponseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isAnonymousForm = $this->feedbackForm?->is_anonymous ?? true;
        
        // Hide student identity if form is anonymous and user is not SUPER_ADMIN/ADMIN
        $canViewStudentIdentity = $user && ($user->role === 'SUPER_ADMIN' || !$isAnonymousForm);

        return [
            'id' => $this->id,
            'feedback_form_id' => $this->feedback_form_id,
            'student_id' => $this->when($canViewStudentIdentity, $this->student_id),
            'overall_remark' => $this->overall_remark,
            'is_excluded' => $this->is_excluded,
            'excluded_by_user_account_id' => $this->when($user?->role === 'SUPER_ADMIN', $this->excluded_by_user_account_id),
            'excluded_reason' => $this->when($user?->role === 'SUPER_ADMIN', $this->excluded_reason),
            'excluded_at' => $this->when($user?->role === 'SUPER_ADMIN', $this->excluded_at?->toIso8601String()),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'student' => $this->when($canViewStudentIdentity, new StudentResource($this->whenLoaded('student'))),
            'feedback_form' => new FeedbackFormResource($this->whenLoaded('feedbackForm')),
            'answers' => FeedbackAnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
