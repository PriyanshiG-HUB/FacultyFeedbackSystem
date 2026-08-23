<?php

namespace App\Services;

use App\Models\FeedbackForm;
use App\Models\Student;
use App\Models\FeedbackResponse;
use Illuminate\Support\Collection;

class StudentEligibilityService
{
    /**
     * Get all eligible feedback forms for an authenticated student.
     */
    public function getEligibleFormsForStudent(Student $student): Collection
    {
        $student->loadMissing(['batch', 'division', 'section']);
        
        $departmentId = $student->department_id;
        $batchId = $student->batch_id;
        $currentSemesterId = $student->batch?->current_semester_id;
        $divisionId = $student->division_id;
        $sectionId = $student->section_id;

        if (!$departmentId || !$batchId || !$currentSemesterId) {
            return collect();
        }

        // Get IDs of forms the student has already submitted
        $submittedFormIds = FeedbackResponse::where('student_id', $student->id)
            ->pluck('feedback_form_id')
            ->toArray();

        $today = now()->format('Y-m-d');

        // Fetch published forms with teaching assignments matching base context
        $forms = FeedbackForm::with([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section',
            'questions.options',
            'questions.category',
        ])
        ->where('is_published', true)
        ->whereNotIn('id', $submittedFormIds)
        ->where(function ($query) use ($today) {
            $query->whereNull('window_start_date')
                ->orWhere('window_start_date', '<=', $today);
        })
        ->where(function ($query) use ($today) {
            $query->whereNull('window_end_date')
                ->orWhere('window_end_date', '>=', $today);
        })
        ->get();

        // Filter forms matching scope hierarchy
        return $forms->filter(function (FeedbackForm $form) use ($departmentId, $batchId, $currentSemesterId, $divisionId, $sectionId) {
            $ta = $form->teachingAssignment;
            if (!$ta) {
                return false;
            }

            // Base match check
            if ($ta->batch_id != $batchId || $ta->semester_id != $currentSemesterId) {
                return false;
            }

            // Scope match check
            // Case 1: Entire Batch (division_id is null and section_id is null)
            if (is_null($ta->division_id) && is_null($ta->section_id)) {
                return true;
            }

            // Case 2: Entire Division (division_id matches and section_id is null)
            if (!is_null($ta->division_id) && is_null($ta->section_id)) {
                return $ta->division_id == $divisionId;
            }

            // Case 3: Specific Section (both division_id and section_id match)
            if (!is_null($ta->division_id) && !is_null($ta->section_id)) {
                return $ta->division_id == $divisionId && $ta->section_id == $sectionId;
            }

            return false;
        })->values();
    }

    /**
     * Check if a specific student is eligible to submit a specific feedback form.
     */
    public function isStudentEligibleForForm(Student $student, FeedbackForm $form): bool
    {
        $eligibleForms = $this->getEligibleFormsForStudent($student);
        return $eligibleForms->contains('id', $form->id);
    }
}
