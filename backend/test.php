<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', '24it019@charusat.edu.in')->first();
$student = \App\Models\Student::where('user_id', $user->id)->with(['batch', 'division', 'section'])->first();
if ($student) {
    echo "Student ID: {$student->id}\n";
    echo "User Email: {$user->email}\n";
    echo "Department ID: {$student->department_id}\n";
    echo "Batch ID: {$student->batch_id}\n";
    echo "Semester ID: " . ($student->batch ? $student->batch->current_semester_id : 'NULL') . "\n";
    echo "Division ID: {$student->division_id}\n";
    echo "Section ID: {$student->section_id}\n";
}

$forms = \App\Models\FeedbackForm::with(['teachingAssignment'])->where('is_published', true)->get();
foreach($forms as $form) {
    $ta = $form->teachingAssignment;
    echo "\nForm {$form->id}:\n";
    echo "  TA Batch ID: {$ta->batch_id}\n";
    echo "  TA Semester ID: {$ta->semester_id}\n";
    echo "  TA Division ID: {$ta->division_id}\n";
    echo "  TA Section ID: {$ta->section_id}\n";
    echo "  Start Date: {$form->window_start_date}\n";
    echo "  End Date: {$form->window_end_date}\n";
}
