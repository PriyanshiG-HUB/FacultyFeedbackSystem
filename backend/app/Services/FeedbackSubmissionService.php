<?php

namespace App\Services;

use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackQuestionOption;
use App\Models\FeedbackResponse;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FeedbackSubmissionService
{
    protected StudentEligibilityService $eligibilityService;

    public function __construct(StudentEligibilityService $eligibilityService)
    {
        $this->eligibilityService = $eligibilityService;
    }

    /**
     * Submit feedback for a student on a specific form inside a DB transaction.
     */
    public function submitFeedback(Student $student, FeedbackForm $form, array $data): FeedbackResponse
    {
        // 1. Verify eligibility
        if (!$this->eligibilityService->isStudentEligibleForForm($student, $form)) {
            throw ValidationException::withMessages([
                'form' => ['Student is not eligible to submit feedback for this form or feedback window is closed.']
            ]);
        }

        // 2. Double check existing response
        $existing = FeedbackResponse::where('feedback_form_id', $form->id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'form' => ['Student has already submitted feedback for this form.']
            ]);
        }

        // 3. Process submission transaction
        return DB::transaction(function () use ($student, $form, $data) {
            $response = FeedbackResponse::create([
                'feedback_form_id' => $form->id,
                'student_id' => $student->id,
                'overall_remark' => $data['overall_remark'] ?? null,
                'is_excluded' => false,
                'submitted_at' => now(),
            ]);

            $answersData = $data['answers'] ?? [];
            $formQuestions = FeedbackQuestion::where('feedback_form_id', $form->id)->get()->keyBy('id');

            foreach ($answersData as $aData) {
                $qId = $aData['question_id'];
                if (!$formQuestions->has($qId)) {
                    throw ValidationException::withMessages([
                        'answers' => ["Question ID {$qId} does not belong to this feedback form."]
                    ]);
                }

                $question = $formQuestions->get($qId);

                // Validate option matches question if selected_option_id is supplied
                $selectedOptionId = $aData['selected_option_id'] ?? null;
                if ($selectedOptionId) {
                    $validOption = FeedbackQuestionOption::where('id', $selectedOptionId)
                        ->where('question_id', $question->id)
                        ->exists();

                    if (!$validOption) {
                        throw ValidationException::withMessages([
                            'answers' => ["Selected option ID {$selectedOptionId} does not belong to question ID {$qId}."]
                        ]);
                    }
                }

                // Validate rating value
                $ratingValue = isset($aData['rating_value']) ? (float)$aData['rating_value'] : null;
                if ($ratingValue !== null && ($ratingValue < 1 || $ratingValue > $question->max_rating)) {
                    throw ValidationException::withMessages([
                        'answers' => ["Rating value {$ratingValue} exceeds maximum rating limit {$question->max_rating} for question ID {$qId}."]
                    ]);
                }

                FeedbackAnswer::create([
                    'response_id' => $response->id,
                    'question_id' => $question->id,
                    'rating_value' => $ratingValue,
                    'text_value' => $aData['text_value'] ?? null,
                    'selected_option_id' => $selectedOptionId,
                ]);
            }

            return $response->load('answers');
        });
    }
}
