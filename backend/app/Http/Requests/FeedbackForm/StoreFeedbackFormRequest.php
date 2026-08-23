<?php

namespace App\Http\Requests\FeedbackForm;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teaching_assignment_id' => ['required', 'integer', 'exists:teaching_assignment,id'],
            'title' => ['nullable', 'string', 'max:200'],
            'form_code' => ['nullable', 'string', 'max:50', 'unique:feedback_form,form_code'],
            'window_start_date' => ['nullable', 'date'],
            'window_end_date' => ['nullable', 'date', 'after_or_equal:window_start_date'],
            'is_anonymous' => ['nullable', 'boolean'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.category_id' => ['nullable', 'integer', 'exists:feedback_question_category,id'],
            'questions.*.question_type' => ['required', 'in:RATING,YES_NO,TEXT,SINGLE_CHOICE,MULTIPLE_CHOICE'],
            'questions.*.display_order' => ['nullable', 'integer'],
            'questions.*.is_required' => ['nullable', 'boolean'],
            'questions.*.max_rating' => ['nullable', 'integer', 'min:1', 'max:10'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.options.*.option_value' => ['required_with:questions.*.options', 'string'],
            'questions.*.options.*.option_label' => ['required_with:questions.*.options', 'string'],
        ];
    }
}
