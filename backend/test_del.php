<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$token = \App\Models\UserAccount::find(1)->createToken('audit_test')->plainTextToken;

function del($url, $token) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Bearer ' . $token,
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => $res];
}

$r1 = del('http://127.0.0.1:8000/api/subject-offerings/6', $token);
echo "1. DELETE without cascade: HTTP {$r1['code']}\n   Body: {$r1['body']}\n";

$r2 = del('http://127.0.0.1:8000/api/subject-offerings/6?cascade=true', $token);
echo "2. DELETE with ?cascade=true: HTTP {$r2['code']}\n   Body: {$r2['body']}\n";
