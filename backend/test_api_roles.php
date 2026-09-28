<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = [
    'ADMIN' => ['email' => 'admin@college.edu', 'pass' => 'password123'],
    'HOD' => ['email' => 'dr.smith@college.edu', 'pass' => 'password123'],
    'FACULTY' => ['email' => 'prof.jones@college.edu', 'pass' => 'password123'],
    'STUDENT' => ['email' => '24it019@charusat.ac.in', 'pass' => '24IT019'],
];

foreach ($users as $role => $cred) {
    $u = App\Models\UserAccount::where('email', $cred['email'])->first();
    if (!$u && $role === 'STUDENT') {
        $u = App\Models\UserAccount::whereHas('student', function($q) use ($cred) {
            $q->where('roll_no', '24IT019')->orWhere('email', $cred['email']);
        })->first();
    }
    echo $role . ': ' . ($u ? 'FOUND (id: ' . $u->id . ', email: ' . $u->email . ', role: ' . $u->role . ', status: ' . $u->status . ')' : 'NOT FOUND') . PHP_EOL;
}
