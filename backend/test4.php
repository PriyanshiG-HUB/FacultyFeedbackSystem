<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$student = \App\Models\Student::where('email', '24it019@charusat.edu.in')->first();

$forms = \App\Models\FeedbackForm::whereIn('id', [24, 25])->get();
foreach($forms as $form) {
    $ta = $form->teachingAssignment;
    $subject = $ta->subject;
    echo "Form {$form->id} Subject: {$subject->subject_name} Course Type: {$subject->course_type}\n";
    
    if ($subject && $subject->course_type === 'ELECTIVE') {
        $isEnrolled = \App\Models\StudentElectiveEnrollment::where('student_id', $student->id)
            ->where('status', 'ENROLLED')
            ->whereHas('subjectOffering', function ($sq) use ($ta) {
                $sq->where('subject_id', $ta->subject_id)
                   ->where('batch_id', $ta->batch_id);
            })
            ->exists();
        echo "  Is Enrolled in Elective: " . ($isEnrolled ? "Yes" : "No") . "\n";
    }
}
