<?php

namespace App\Mail;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class BulkFeedbackInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Student $student;
    public Collection $forms;

    /**
     * Create a new message instance.
     */
    public function __construct(Student $student, Collection $forms)
    {
        $this->student = $student;
        $this->forms = $forms;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Feedback Forms Available on Portal',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.bulk_feedback_invitation',
            with: [
                'studentName' => $this->student->full_name,
                'forms' => $this->forms,
                'portalUrl' => config('app.frontend_url', 'http://localhost:3000') . '/#Student/Feedback/Show',
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
