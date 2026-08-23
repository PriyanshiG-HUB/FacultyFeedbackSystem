<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'feedback_form_id' => $this->feedback_form_id,
            'category_id' => $this->category_id,
            'question_text' => $this->question_text,
            'question_type' => $this->question_type,
            'display_order' => $this->display_order,
            'is_required' => $this->is_required,
            'max_rating' => $this->max_rating,
            'category' => new FeedbackQuestionCategoryResource($this->whenLoaded('category')),
            'options' => FeedbackQuestionOptionResource::collection($this->whenLoaded('options')),
        ];
    }
}
