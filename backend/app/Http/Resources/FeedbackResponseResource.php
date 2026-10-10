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

        $isAuthorized = $user && in_array($user->role, ['SUPER_ADMIN', 'ADMIN', 'HOD']);
        $canViewStudentIdentity = $isAuthorized || !$isAnonymousForm;

        // Reconstruct per-answer text from overall_remark for legacy submissions
        // where text was joined into overall_remark instead of stored per text_value.
        $answers = $this->whenLoaded('answers');
        if ($answers instanceof \Illuminate\Support\Collection || is_iterable($answers)) {
            $answersCollection = collect($answers);
            $allNullText = $answersCollection->every(fn($a) => is_null($a->text_value));

            if ($allNullText && !empty($this->overall_remark) && $this->overall_remark !== 'Submitted via portal') {
                $parts = array_map('trim', explode(';', $this->overall_remark));
                $answersCollection->values()->each(function ($answer, $index) use ($parts) {
                    if (isset($parts[$index]) && $parts[$index] !== '') {
                        $answer->text_value = $parts[$index];
                    }
                });
            }
        }

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
