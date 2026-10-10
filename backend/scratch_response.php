<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$responses = App\Models\FeedbackResponse::with([
    'feedbackForm.teachingAssignment.subject.department',
    'feedbackForm.teachingAssignment.faculty',
    'feedbackForm.teachingAssignment.batch.department',
    'feedbackForm.teachingAssignment.division',
    'feedbackForm.teachingAssignment.section',
    'feedbackForm.teachingAssignment.academicYear',
    'feedbackForm.teachingAssignment.semester',
    'student',
    'answers.question',
    'answers.selectedOption',
])->take(1)->get();

echo json_encode(\App\Http\Resources\FeedbackResponseResource::collection($responses)->resolve(), JSON_PRETTY_PRINT);
