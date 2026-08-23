<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackAnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'response_id' => $this->response_id,
            'question_id' => $this->question_id,
            'rating_value' => $this->rating_value,
            'text_value' => $this->text_value,
            'selected_option_id' => $this->selected_option_id,
            'question' => new FeedbackQuestionResource($this->whenLoaded('question')),
            'selected_option' => new FeedbackQuestionOptionResource($this->whenLoaded('selectedOption')),
        ];
    }
}
