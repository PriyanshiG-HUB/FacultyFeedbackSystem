<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Feedback Invitation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2b6cb0; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2b6cb0; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Faculty Feedback System</h2>
        </div>
        <div class="content">
            <p>Dear {{ $student->full_name }},</p>
            <p>A new feedback form has been published and requires your response.</p>
            
            <h3>{{ $feedbackForm->title }}</h3>
            
            @if($feedbackForm->window_end_date)
            <p>Please submit your feedback before: <strong>{{ \Carbon\Carbon::parse($feedbackForm->window_end_date)->format('F j, Y') }}</strong></p>
            @endif
            
            <p>Your honest feedback is valuable and will remain anonymous.</p>
            
            <a href="{{ $actionUrl }}" class="button">Log In to Submit Feedback</a>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
