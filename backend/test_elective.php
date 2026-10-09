<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$enrollments = \App\Models\StudentElectiveEnrollment::with('subjectOffering')->get();
echo "Total enrollments: " . $enrollments->count() . "\n";
foreach($enrollments as $e) {
    echo "Enrollment ID: {$e->id}, Student: {$e->student_id}, Offering ID: {$e->subject_offering_id}, Status: {$e->status}, Subject ID: {$e->subjectOffering?->subject_id}, Batch ID: {$e->subjectOffering?->batch_id}\n";
}

$forms = \App\Models\FeedbackForm::whereHas('teachingAssignment.subject', function($q) {
    $q->where('course_type', 'ELECTIVE');
})->with('teachingAssignment.subject')->get();

echo "\nElective Feedback Forms:\n";
foreach($forms as $f) {
    echo "Form ID: {$f->id}, Subject ID: {$f->teachingAssignment->subject_id}, Batch ID: {$f->teachingAssignment->batch_id}\n";
}
