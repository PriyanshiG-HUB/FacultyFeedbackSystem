<?php

namespace App\Http\Requests\FeedbackSubmission;

use Illuminate\Foundation\Http\FormRequest;

class SubmitFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'overall_remark' => ['nullable', 'string', 'max:1000'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:feedback_question,id'],
            'answers.*.rating_value' => ['nullable', 'numeric', 'min:1'],
            'answers.*.text_value' => ['nullable', 'string'],
            'answers.*.selected_option_id' => ['nullable', 'integer', 'exists:feedback_question_option,id'],
        ];
    }
}
