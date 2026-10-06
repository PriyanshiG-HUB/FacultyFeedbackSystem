<?php

namespace App\Mail;

use App\Models\FeedbackForm;
use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FeedbackInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Student $student;
    public FeedbackForm $feedbackForm;
    public string $actionUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Student $student, FeedbackForm $feedbackForm)
    {
        $this->student = $student;
        $this->feedbackForm = $feedbackForm;
        
        // Use the frontend student identify/dashboard route.
        // Assuming the app runs on a known URL, config('app.url') or fallback.
        $baseUrl = config('app.url');
        $this->actionUrl = $baseUrl . '/#Student/Identify';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Feedback Form Available: ' . $this->feedbackForm->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.feedback-invitation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
