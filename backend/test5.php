<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$student = \App\Models\Student::where('email', '24it019@charusat.edu.in')->first();
$user = \App\Models\SystemUser::where('email', '24it019@charusat.edu.in')->first();

if(!$user){
    // Mock user if system_users doesn't have it
    $user = new \stdClass();
    $user->student = $student;
} else {
    $user->student = $student;
}

$request = \Illuminate\Http\Request::create('/api/student/feedback-forms', 'GET');
$request->setUserResolver(function() use ($user) { return $user; });

$controller = app(\App\Http\Controllers\Api\StudentFeedbackController::class);
$response = $controller->eligibleForms($request);
echo json_encode($response->getData(true));
