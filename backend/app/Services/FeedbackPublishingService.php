<?php

namespace App\Services;

use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackQuestionCategory;
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
            $shouldPublish = !empty($data['is_published']);

            $questionSource = strtoupper($data['question_source'] ?? 'EXISTING');
            $responseType = strtoupper($data['response_type'] ?? 'RATING');

            $form = FeedbackForm::create([
                'form_code' => $formCode,
                'title' => $title,
                'teaching_assignment_id' => $assignment->id,
                'window_start_date' => $data['window_start_date'] ?? null,
                'window_end_date' => $data['window_end_date'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? true,
                'is_published' => $shouldPublish,
                'published_at' => $shouldPublish ? now() : null,
                'status' => $shouldPublish ? 'PUBLISHED' : 'DRAFT',
                'created_by_user_account_id' => $userAccount->id,
                'question_source' => $questionSource,
                'response_type' => $responseType,
            ]);

            if (!empty($data['questions']) && is_array($data['questions'])) {
                foreach ($data['questions'] as $index => $qData) {
                    $qType = strtoupper($qData['question_type'] ?? 'RATING');
                    if ($responseType === 'TEXT' && $qType === 'RATING') {
                        $qType = 'TEXT';
                    }

                    $question = FeedbackQuestion::create([
                        'feedback_form_id' => $form->id,
                        'category_id' => $qData['category_id'] ?? null,
                        'question_text' => $qData['question_text'] ?? $qData['question'] ?? '',
                        'question_type' => $qType,
                        'display_order' => $qData['display_order'] ?? ($index + 1),
                        'is_required' => $qData['is_required'] ?? true,
                        'max_rating' => $qData['max_rating'] ?? 5,
                    ]);

                    if (!empty($qData['options']) && is_array($qData['options'])) {
                        foreach ($qData['options'] as $optIndex => $oData) {
                            $optValue = is_array($oData) ? ($oData['option_value'] ?? $oData['value'] ?? '') : (string)$oData;
                            $optLabel = is_array($oData) ? ($oData['option_label'] ?? $oData['label'] ?? $optValue) : (string)$oData;
                            FeedbackQuestionOption::create([
                                'question_id' => $question->id,
                                'option_value' => $optValue,
                                'option_label' => $optLabel,
                                'display_order' => is_array($oData) ? ($oData['display_order'] ?? ($optIndex + 1)) : ($optIndex + 1),
                            ]);
                        }
                    }
                }
            } else {
                // Attach default standard questions
                $categories = FeedbackQuestionCategory::orderBy('display_order')->get();
                $defaultQuestions = [
                    ['category_name' => 'Punctuality & Discipline', 'text' => 'Faculty arrives on time and conducts lectures regularly.'],
                    ['category_name' => 'Subject Knowledge & Depth', 'text' => 'Faculty demonstrates comprehensive knowledge of the course subject.'],
                    ['category_name' => 'Clarity of Teaching', 'text' => 'Course concepts, principles, and problems are explained with clarity.'],
                    ['category_name' => 'Study Material / Practical Guidance', 'text' => 'Faculty provides relevant study materials, assignments, and guidance.'],
                ];

                $defaultQType = $responseType === 'TEXT' ? 'TEXT' : ($responseType === 'BOTH' ? 'BOTH' : 'RATING');

                foreach ($defaultQuestions as $idx => $dq) {
                    $cat = $categories->firstWhere('category_name', $dq['category_name']) ?? ($categories[$idx] ?? null);
                    FeedbackQuestion::create([
                        'feedback_form_id' => $form->id,
                        'category_id' => $cat?->id,
                        'question_text' => $dq['text'],
                        'question_type' => $defaultQType,
                        'display_order' => $idx + 1,
                        'is_required' => true,
                        'max_rating' => 5,
                    ]);
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
