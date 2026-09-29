<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$faculties = App\Models\Faculty::where('full_name', 'like', '%Purvi%')->get();
echo "Found " . count($faculties) . " faculties matching 'Purvi'.\n";

foreach ($faculties as $faculty) {
    echo "Faculty ID: " . $faculty->id . ", Name: " . $faculty->full_name . "\n";
    $user = App\Models\UserAccount::where('faculty_id', $faculty->id)->first();
    echo "  Email: " . ($user ? $user->email : 'null') . "\n";
}
