<?php

namespace App\Services;

use App\Models\CustomFeedbackQuestion;
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
     * Bulk create FeedbackForms for multiple teaching assignments inside a DB transaction.
     *
     * @return FeedbackForm[]
     */
    public function createFormsBulk(array $data, UserAccount $userAccount): array
    {
        $createdForms = [];
        $assignmentIds = array_unique($data['teaching_assignment_ids'] ?? []);

        foreach ($assignmentIds as $taId) {
            // Prevent duplicate form creation for the same teaching assignment if one already exists
            $existing = FeedbackForm::where('teaching_assignment_id', $taId)->first();
            if ($existing) {
                $createdForms[] = $existing->load(['teachingAssignment.subject', 'teachingAssignment.faculty', 'questions.options', 'questions.category']);
                continue;
            }

            $singleData = $data;
            $singleData['teaching_assignment_id'] = $taId;
            unset($singleData['teaching_assignment_ids']);

            $assignment = TeachingAssignment::with(['subject', 'faculty', 'division', 'section'])->find($taId);
            if ($assignment && $assignment->subject) {
                $divSecLabel = '';
                if ($assignment->division) {
                    $divSecLabel .= ' [Div ' . ($assignment->division->division_code ?? $assignment->division_id);
                    if ($assignment->section) {
                        $divSecLabel .= ' Sec ' . ($assignment->section->section_code ?? $assignment->section_id);
                    }
                    $divSecLabel .= ']';
                }
                $baseTitle = !empty($data['title']) ? trim($data['title']) : 'Faculty Feedback';
                $singleData['title'] = $baseTitle . ' — ' . $assignment->subject->subject_name . ' (' . ($assignment->faculty?->full_name ?? 'Faculty') . ')' . $divSecLabel;
            }

            $form = $this->createForm($singleData, $userAccount);
            $createdForms[] = $form;
        }

        return $createdForms;
    }

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
                    // Enforce form-level response_type for all questions (CSV question_type is ignored)
                    $rawQType = strtoupper($qData['question_type'] ?? '');
                    if ($rawQType === 'MCQ') {
                        $qType = 'MCQ';
                    } elseif ($responseType === 'BOTH' || $rawQType === 'BOTH') {
                        $qType = 'BOTH';
                    } elseif ($responseType === 'TEXT' || $rawQType === 'TEXT') {
                        $qType = 'TEXT';
                    } else {
                        $qType = 'RATING';
                    }

                    $catId = $qData['category_id'] ?? null;
                    if (!$catId && !empty($qData['category'])) {
                        $cat = FeedbackQuestionCategory::firstOrCreate(
                            ['category_name' => trim($qData['category'])],
                            ['display_order' => $index + 1]
                        );
                        $catId = $cat->id;
                    }

                    $question = FeedbackQuestion::create([
                        'feedback_form_id' => $form->id,
                        'category_id' => $catId,
                        'question_text' => $qData['question_text'] ?? $qData['question'] ?? '',
                        'question_type' => $qType,
                        'display_order' => $qData['display_order'] ?? ($index + 1),
                        'is_required' => isset($qData['is_required']) ? filter_var($qData['is_required'], FILTER_VALIDATE_BOOLEAN) : true,
                        'max_rating' => $qData['max_rating'] ?? 5,
                    ]);

                    if (!empty($qData['options'])) {
                        $optsList = is_array($qData['options']) ? $qData['options'] : array_map('trim', explode(',', $qData['options']));
                        foreach ($optsList as $optIndex => $oData) {
                            $optText = is_array($oData) ? ($oData['option_text'] ?? $oData['option_label'] ?? $oData['label'] ?? $oData['value'] ?? '') : (string)$oData;
                            if (trim($optText) !== '') {
                                FeedbackQuestionOption::create([
                                    'question_id' => $question->id,
                                    'option_text' => trim($optText),
                                    'display_order' => $optIndex + 1,
                                ]);
                            }
                        }
                    }

                    if ($questionSource === 'CUSTOM') {
                        CustomFeedbackQuestion::firstOrCreate([
                            'question' => $question->question_text,
                        ], [
                            'category' => $qData['category'] ?? 'General',
                            'category_id' => $catId,
                            'question_type' => $qType,
                            'options' => !empty($qData['options']) ? (is_array($qData['options']) ? $qData['options'] : array_map('trim', explode(',', $qData['options']))) : null,
                            'created_by_user_account_id' => $userAccount->id,
                        ]);
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
        
        \App\Jobs\SendFeedbackCampaignJob::dispatch($form);

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
