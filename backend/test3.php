<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$student = \App\Models\Student::where('email', '24it019@charusat.edu.in')->first();
$service = app(\App\Services\StudentEligibilityService::class);
$eligible = $service->getEligibleFormsForStudent($student);

echo "Eligible forms count: " . $eligible->count() . "\n";
foreach($eligible as $f) {
    echo "Form {$f->id}\n";
}

$today = now()->format('Y-m-d');
echo "Today: $today\n";

$forms = \App\Models\FeedbackForm::where('is_published', true)
        ->where(function ($query) use ($today) {
            $query->whereNull('window_start_date')
                ->orWhere('window_start_date', '<=', $today);
        })
        ->where(function ($query) use ($today) {
            $query->whereNull('window_end_date')
                ->orWhere('window_end_date', '>=', $today);
        })
        ->get();

echo "Raw query matching forms count: " . $forms->count() . "\n";
