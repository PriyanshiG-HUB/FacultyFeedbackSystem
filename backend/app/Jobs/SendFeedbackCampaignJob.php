<?php

namespace App\Jobs;

use App\Mail\FeedbackInvitationMail;
use App\Models\FeedbackForm;
use App\Models\Student;
use App\Models\StudentElectiveEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendFeedbackCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public FeedbackForm $feedbackForm;

    /**
     * Create a new job instance.
     */
    public function __construct(FeedbackForm $feedbackForm)
    {
        $this->feedbackForm = $feedbackForm->withoutRelations();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->feedbackForm->loadMissing('teachingAssignment.subject');
        $ta = $this->feedbackForm->teachingAssignment;

        if (!$ta) {
            Log::error('SendFeedbackCampaignJob: Teaching Assignment not found for Form ID ' . $this->feedbackForm->id);
            return;
        }

        // Query students that match the target audience for this form
        $query = Student::where('batch_id', $ta->batch_id)
            ->whereHas('batch', function($q) use ($ta) {
                $q->where('current_semester_id', $ta->semester_id);
            });

        // Filter by division if specified
        if (!is_null($ta->division_id)) {
            $query->where('division_id', $ta->division_id);
        }

        // Filter by section if specified
        if (!is_null($ta->section_id)) {
            $query->where('section_id', $ta->section_id);
        }

        // Load the user account relation to get the email address
        $students = $query->with('userAccount')->get();
        $sentCount = 0;

        foreach ($students as $student) {
            // Check elective enrollment if the subject is elective
            if ($ta->subject && $ta->subject->course_type === 'ELECTIVE') {
                $isEnrolled = StudentElectiveEnrollment::where('student_id', $student->id)
                    ->where('status', 'ENROLLED')
                    ->whereHas('subjectOffering', function ($sq) use ($ta) {
                        $sq->where('subject_id', $ta->subject_id)
                           ->where('batch_id', $ta->batch_id);
                    })
                    ->exists();

                if (!$isEnrolled) {
                    continue; // Skip student not enrolled in elective
                }
            }

            // Fallback to student->email if userAccount->email is not present (though they should be synced)
            $email = $student->userAccount?->email ?? $student->email;

            if ($email) {
                try {
                    Mail::to($email)->send(new FeedbackInvitationMail($student, $this->feedbackForm));
                    $sentCount++;
                } catch (\Exception $e) {
                    Log::error("Failed to send feedback email to $email: " . $e->getMessage());
                }
            }
        }
        
        Log::info("SendFeedbackCampaignJob: Sent $sentCount emails for Form ID " . $this->feedbackForm->id);
    }
}
