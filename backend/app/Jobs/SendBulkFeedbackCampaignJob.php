<?php

namespace App\Jobs;

use App\Mail\BulkFeedbackInvitationMail;
use App\Models\Student;
use App\Models\StudentElectiveEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class SendBulkFeedbackCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Collection $feedbackForms;

    /**
     * Create a new job instance.
     */
    public function __construct(Collection $feedbackForms)
    {
        // To avoid serialization issues with large relations
        $this->feedbackForms = $feedbackForms->map(function ($form) {
            return $form->withoutRelations();
        });
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $studentFormsMap = []; // Maps student_id to array of forms they are eligible for

        foreach ($this->feedbackForms as $form) {
            $form->loadMissing('teachingAssignment.subject');
            $ta = $form->teachingAssignment;

            if (!$ta) {
                Log::error('SendBulkFeedbackCampaignJob: Teaching Assignment not found for Form ID ' . $form->id);
                continue;
            }

            // Query students that match the target audience for this form
            $query = Student::where('batch_id', $ta->batch_id)
                ->whereHas('batch', function($q) use ($ta) {
                    $q->where('current_semester_id', $ta->semester_id);
                });

            if (!is_null($ta->division_id)) {
                $query->where('division_id', $ta->division_id);
            }
            if (!is_null($ta->section_id)) {
                $query->where('section_id', $ta->section_id);
            }

            $students = $query->with('userAccount')->get();

            foreach ($students as $student) {
                // Check elective enrollment
                if ($ta->subject && $ta->subject->course_type === 'ELECTIVE') {
                    $isEnrolled = StudentElectiveEnrollment::where('student_id', $student->id)
                        ->where('status', 'ENROLLED')
                        ->whereHas('subjectOffering', function ($sq) use ($ta) {
                            $sq->where('subject_id', $ta->subject_id)
                               ->where('batch_id', $ta->batch_id);
                        })
                        ->exists();

                    if (!$isEnrolled) {
                        continue;
                    }
                }

                if (!isset($studentFormsMap[$student->id])) {
                    $studentFormsMap[$student->id] = [
                        'student' => $student,
                        'forms' => []
                    ];
                }
                $studentFormsMap[$student->id]['forms'][] = $form;
            }
        }

        $sentCount = 0;

        foreach ($studentFormsMap as $studentId => $data) {
            $student = $data['student'];
            $forms = collect($data['forms']);
            $email = $student->userAccount?->email ?? $student->email;

            if ($email) {
                try {
                    Mail::to($email)->send(new BulkFeedbackInvitationMail($student, $forms));
                    $sentCount++;
                } catch (\Exception $e) {
                    Log::error("Failed to send bulk feedback email to $email: " . $e->getMessage());
                }
            }
        }
        
        Log::info("SendBulkFeedbackCampaignJob: Sent $sentCount emails for " . $this->feedbackForms->count() . " forms.");
    }
}
