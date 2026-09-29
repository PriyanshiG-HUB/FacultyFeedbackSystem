<?php

function post($url, $data = [], $token = null) {
    $ch = curl_init($url);
    $payload = json_encode($data);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'data' => json_decode($res, true), 'raw' => $res];
}

function get($url, $token = null) {
    $ch = curl_init($url);
    $headers = ['Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'data' => json_decode($res, true), 'raw' => $res];
}

$baseUrl = 'http://127.0.0.1:8000/api';

echo "--- Testing Part 1: Authentication ---\n";

// 1. Student login with email & exact password
$r1 = post("$baseUrl/auth/login", ['email' => '24it019@charusat.ac.in', 'password' => '24IT019']);
echo "1. Student email + uppercase pass: HTTP {$r1['code']}, Token: " . (!empty($r1['data']['token']) ? 'YES' : 'NO') . "\n";

// 2. Student login with lowercase password
$r2 = post("$baseUrl/auth/login", ['email' => '24it019@charusat.ac.in', 'password' => '24it019']);
echo "2. Student email + lowercase pass: HTTP {$r2['code']}, Token: " . (!empty($r2['data']['token']) ? 'YES' : 'NO') . "\n";

// 3. Student login with roll number
$r3 = post("$baseUrl/auth/login", ['email' => '24IT019', 'password' => '24it019']);
echo "3. Student roll no + lowercase pass: HTTP {$r3['code']}, Token: " . (!empty($r3['data']['token']) ? 'YES' : 'NO') . "\n";

// 4. Student login with lowercase roll number
$r4 = post("$baseUrl/auth/login", ['email' => '24it019', 'password' => '24IT019']);
echo "4. Student lower roll no + uppercase pass: HTTP {$r4['code']}, Token: " . (!empty($r4['data']['token']) ? 'YES' : 'NO') . "\n";

// 5. Invalid credentials
$r5 = post("$baseUrl/auth/login", ['email' => '24it019@charusat.ac.in', 'password' => 'wrongpass']);
echo "5. Invalid credentials: HTTP {$r5['code']} (expected 401)\n";

// 6. Admin login
$rAdmin = post("$baseUrl/auth/login", ['email' => 'admin@college.edu', 'password' => 'password123']);
echo "6. Admin login: HTTP {$rAdmin['code']}, Role: " . ($rAdmin['data']['user']['role'] ?? 'none') . "\n";

// 7. Faculty / HOD login
$rFac = post("$baseUrl/auth/login", ['email' => 'dr.smith@college.edu', 'password' => 'password123']);
echo "7. Faculty login: HTTP {$rFac['code']}, Role: " . ($rFac['data']['user']['role'] ?? 'none') . "\n";

// 8. Auth/me with Admin token
$token = $rAdmin['data']['token'] ?? null;
$rMe = get("$baseUrl/auth/me", $token);
echo "8. Auth/me with admin token: HTTP {$rMe['code']}, Email: " . ($rMe['data']['user']['email'] ?? 'none') . "\n";

// 9. Logout
$rLogout = post("$baseUrl/auth/logout", [], $token);
echo "9. Logout: HTTP {$rLogout['code']}, Message: " . ($rLogout['data']['message'] ?? 'none') . "\n";

// 10. Auth/me after logout (should be 401)
$rMeAfter = get("$baseUrl/auth/me", $token);
echo "10. Auth/me after logout: HTTP {$rMeAfter['code']} (expected 401)\n";
