<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ta = \App\Models\TeachingAssignment::where('batch_id', 33)->first();

$offering = \App\Models\SubjectOffering::where('subject_id', 2)->where('batch_id', 33)->first();
if ($offering) {
    echo "Offering ID: {$offering->id}\n";
    $e = \App\Models\StudentElectiveEnrollment::find(5);
    $e->subject_offering_id = $offering->id;
    $e->save();
    echo "Updated enrollment to use correct offering!\n";
} else {
    echo "No offering for Subject 2, Batch 33. Creating one...\n";
    $offering = new \App\Models\SubjectOffering();
    $offering->subject_id = 2;
    $offering->batch_id = 33;
    $offering->semester_id = 5;
    $offering->academic_year_id = $ta ? $ta->academic_year_id : 1;
    $offering->enrollment_capacity = 100;
    $offering->save();
    echo "Created Offering ID: {$offering->id}\n";
    $e = \App\Models\StudentElectiveEnrollment::find(5);
    if($e) {
        $e->subject_offering_id = $offering->id;
        $e->save();
        echo "Updated enrollment to use correct offering!\n";
    }
}
