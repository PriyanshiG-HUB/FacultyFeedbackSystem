<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Feedback Forms Available</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; border-top: 4px solid #4f46e5; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 15px; }
        .content { margin-bottom: 30px; }
        .title { font-size: 20px; font-weight: bold; color: #1e1b4b; margin-bottom: 10px; }
        .forms-list { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .form-item { font-size: 14px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
        .form-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
        .form-item strong { color: #1f2937; }
        .button-container { text-align: center; margin-top: 25px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Faculty Feedback System</h2>
        </div>
        <div class="content">
            <h1 class="title">New Evaluation Forms Available</h1>
            <p>Dear {{ $studentName }},</p>
            <p>Multiple new faculty evaluation forms have been published by your Head of Department. Your responses are strictly confidential and help improve academic excellence.</p>
            
            <div class="forms-list">
                <p style="margin-top: 0; font-weight: bold; color: #4b5563; font-size: 12px; text-transform: uppercase;">Newly Published Forms:</p>
                @foreach ($forms as $form)
                    <div class="form-item">
                        <strong>{{ $form->teachingAssignment?->subject?->subject_name ?? 'Subject' }}</strong><br>
                        <span style="color: #4b5563;">Faculty: {{ $form->teachingAssignment?->faculty?->full_name ?? 'Faculty' }}</span>
                    </div>
                @endforeach
            </div>

            <p>Please log in to the student portal to submit your evaluations before the window closes.</p>
            
            <div class="button-container">
                <a href="{{ $portalUrl }}" class="button">Log in to Portal</a>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from the CHARUSAT Faculty Feedback System. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
