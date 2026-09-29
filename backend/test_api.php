<?php

$ch = curl_init('http://127.0.0.1:8000/api/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@college.edu',
    'password' => 'admin123'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
$response = curl_exec($ch);
$data = json_decode($response, true);
$token = $data['token'] ?? null;
curl_close($ch);

if (!$token) {
    echo "Login failed: $response\n";
    exit;
}

$ch2 = curl_init('http://127.0.0.1:8000/api/faculty/feedback-forms');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
$res2 = curl_exec($ch2);
echo "Response for feedback-forms: " . $res2 . "\n";
