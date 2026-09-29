<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\UserAccount::where('email', 'purvi.prajapati@college.edu')->first();
if (!$user) {
    echo "No user found.\n";
    exit;
}

echo "User Faculty ID: " . $user->faculty_id . "\n";

$faculty = App\Models\Faculty::find($user->faculty_id);
echo "Faculty Name: " . ($faculty ? $faculty->full_name : 'null') . "\n";

$forms = App\Models\FeedbackForm::whereHas('teachingAssignment', function ($q) use ($faculty) {
    $q->where('faculty_id', $faculty->id);
})->get();

echo "Forms: " . count($forms) . "\n";
foreach ($forms as $f) {
    $ta = App\Models\TeachingAssignment::with('subject')->find($f->teaching_assignment_id);
    echo " - " . ($ta->subject ? $ta->subject->subject_name : 'null') . "\n";
}
