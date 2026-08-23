<?php

namespace App\Services;

use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackQuestionOption;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class FeedbackPublishingService
{
    /**
     * Create a new FeedbackForm with questions and options inside a DB transaction.
     */
    public function createForm(array $data, UserAccount $userAccount): FeedbackForm
    {
        return DB::transaction(function () use ($data, $userAccount) {
            $assignment = TeachingAssignment::with(['subject', 'faculty', 'batch'])->findOrFail($data['teaching_assignment_id']);

            $formCode = $data['form_code'] ?? ('FF-' . strtoupper(uniqid()));
            $title = $data['title'] ?? ($assignment->subject->subject_name . ' Feedback');

            $form = FeedbackForm::create([
                'form_code' => $formCode,
                'title' => $title,
                'teaching_assignment_id' => $assignment->id,
                'window_start_date' => $data['window_start_date'] ?? null,
                'window_end_date' => $data['window_end_date'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? true,
                'is_published' => false,
                'status' => 'DRAFT',
                'created_by_user_account_id' => $userAccount->id,
            ]);

            if (!empty($data['questions']) && is_array($data['questions'])) {
                foreach ($data['questions'] as $index => $qData) {
                    $question = FeedbackQuestion::create([
                        'feedback_form_id' => $form->id,
                        'category_id' => $qData['category_id'] ?? null,
                        'question_text' => $qData['question_text'],
                        'question_type' => $qData['question_type'] ?? 'RATING',
                        'display_order' => $qData['display_order'] ?? ($index + 1),
                        'is_required' => $qData['is_required'] ?? true,
                        'max_rating' => $qData['max_rating'] ?? 5,
                    ]);

                    if (!empty($qData['options']) && is_array($qData['options'])) {
                        foreach ($qData['options'] as $optIndex => $oData) {
                            FeedbackQuestionOption::create([
                                'question_id' => $question->id,
                                'option_value' => $oData['option_value'],
                                'option_label' => $oData['option_label'],
                                'display_order' => $oData['display_order'] ?? ($optIndex + 1),
                            ]);
                        }
                    }
                }
            }

            return $form->load(['teachingAssignment.subject', 'teachingAssignment.faculty', 'questions.options', 'questions.category']);
        });
    }

    /**
     * Publish a feedback form after verifying rules.
     */
    public function publishForm(FeedbackForm $form): FeedbackForm
    {
        if ($form->questions()->count() === 0) {
            throw ValidationException::withMessages([
                'questions' => ['Cannot publish a feedback form without questions.']
            ]);
        }

        if (!$form->teaching_assignment_id) {
            throw ValidationException::withMessages([
                'teaching_assignment_id' => ['Form must be associated with a valid Teaching Assignment.']
            ]);
        }

        if ($form->window_start_date && $form->window_end_date && $form->window_end_date < $form->window_start_date) {
            throw ValidationException::withMessages([
                'window_end_date' => ['Feedback window end date cannot be before start date.']
            ]);
        }

        $form->update([
            'is_published' => true,
            'published_at' => now(),
            'status' => 'PUBLISHED',
        ]);

        return $form->fresh(['teachingAssignment', 'questions.options']);
    }

    /**
     * Unpublish / close a feedback form.
     */
    public function unpublishForm(FeedbackForm $form): FeedbackForm
    {
        $form->update([
            'is_published' => false,
            'status' => 'UNPUBLISHED',
        ]);

        return $form->fresh();
    }
}
