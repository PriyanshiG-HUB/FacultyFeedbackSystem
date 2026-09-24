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
            'academic_year_id' => ['nullable', 'integer', 'exists:academic_year,id'],
            'window_start_date' => ['nullable', 'date'],
            'window_end_date' => ['nullable', 'date', 'after_or_equal:window_start_date'],
            'is_anonymous' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'question_source' => ['nullable', 'string', 'in:EXISTING,CUSTOM'],
            'response_type' => ['nullable', 'string', 'in:RATING,TEXT,BOTH'],
            'questions' => ['nullable', 'array'],
            'questions.*.question' => ['nullable', 'string'],
            'questions.*.question_text' => ['nullable', 'string'],
            'questions.*.category_id' => ['nullable', 'integer', 'exists:feedback_question_category,id'],
            'questions.*.category' => ['nullable', 'string'],
            'questions.*.question_type' => ['nullable', 'in:RATING,YES_NO,TEXT,SINGLE_CHOICE,MULTIPLE_CHOICE,BOTH,MCQ'],
            'questions.*.display_order' => ['nullable', 'integer'],
            'questions.*.is_required' => ['nullable', 'boolean'],
            'questions.*.max_rating' => ['nullable', 'integer', 'min:1', 'max:10'],
            'questions.*.options' => ['nullable', 'array'],
        ];
    }
}
