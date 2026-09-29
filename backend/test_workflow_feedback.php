<?php

function request($method, $url, $data = [], $token = null) {
    $ch = curl_init($url);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if (!empty($data) || in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'data' => json_decode($res, true), 'raw' => $res];
}

$baseUrl = 'http://127.0.0.1:8000/api';

echo "=== Testing Part 7 & 8: Feedback and Elective Workflow ===\n\n";

// 1. Login as Admin
$adminAuth = request('POST', "$baseUrl/auth/login", ['email' => 'admin@college.edu', 'password' => 'password123']);
$adminToken = $adminAuth['data']['token'];
echo "1. Admin Logged in: HTTP {$adminAuth['code']}, Token generated.\n";

// 2. Login as Student 1 (Alex Johnson - student1@college.edu)
$stu1Auth = request('POST', "$baseUrl/auth/login", ['email' => 'student1@college.edu', 'password' => 'password123']);
$stu1Token = $stu1Auth['data']['token'];
echo "2. Student 1 Logged in: HTTP {$stu1Auth['code']}, Token generated.\n";

// 3. Login as Student 6 (24IT019 - 24it019@charusat.ac.in)
$stu24Auth = request('POST', "$baseUrl/auth/login", ['email' => '24it019@charusat.ac.in', 'password' => '24IT019']);
$stu24Token = $stu24Auth['data']['token'];
echo "3. Student 24IT019 Logged in: HTTP {$stu24Auth['code']}, Token generated.\n";

// 4. Check Student 1 eligible forms (should see Form 1)
$stu1Forms = request('GET', "$baseUrl/student/feedback-forms", [], $stu1Token);
echo "4. Student 1 eligible forms count: " . count($stu1Forms['data']['data'] ?? $stu1Forms['data'] ?? []) . " (expected >= 1)\n";

// 5. Check Student 24IT019 eligible forms (should NOT see Form 1 because batch is different)
$stu24Forms = request('GET', "$baseUrl/student/feedback-forms", [], $stu24Token);
$stu24Count = count($stu24Forms['data']['data'] ?? $stu24Forms['data'] ?? []);
echo "5. Student 24IT019 eligible forms before new form: {$stu24Count} (expected 0)\n";

// 6. Admin creates Teaching Assignment for Batch 2 (Student 24IT019's batch: batch 2, division 2, sem 7, subject 1, faculty 2)
$taRes = request('POST', "$baseUrl/teaching-assignments", [
    'subject_id' => 1,
    'faculty_id' => 2, // Prof. Sarah Jones
    'batch_id' => 2,
    'division_id' => 2,
    'section_id' => null,
    'academic_year_id' => 1,
    'semester_id' => 7,
    'status' => 'ACTIVE'
], $adminToken);
echo "6. Admin creates Teaching Assignment: HTTP {$taRes['code']}\n";
$newTaId = $taRes['data']['data']['id'] ?? $taRes['data']['id'] ?? null;
echo "   New TA ID: {$newTaId}\n";

// 7. Admin creates Feedback Form for this TA
$formRes = request('POST', "$baseUrl/feedback-forms", [
    'teaching_assignment_id' => $newTaId,
    'title' => 'Cloud Computing Feedback for 24IT Batch',
    'form_code' => 'FF-24IT-' . time(),
    'window_start_date' => '2026-01-01',
    'window_end_date' => '2026-12-31',
    'questions' => [
        [
            'question_text' => 'The faculty explains concepts clearly.',
            'question_type' => 'RATING',
            'max_rating' => 5,
            'is_required' => true,
            'display_order' => 1
        ],
        [
            'question_text' => 'The faculty is punctual.',
            'question_type' => 'RATING',
            'max_rating' => 5,
            'is_required' => true,
            'display_order' => 2
        ]
    ]
], $adminToken);
echo "7. Admin creates Feedback Form: HTTP {$formRes['code']}\n";
$newFormId = $formRes['data']['data']['id'] ?? $formRes['data']['id'] ?? null;
echo "   New Form ID: {$newFormId}\n";

// 8. Publish the Form
$pubRes = request('POST', "$baseUrl/feedback-forms/{$newFormId}/publish", [], $adminToken);
echo "8. Admin publishes Form: HTTP {$pubRes['code']}\n";

// 9. Student 24IT019 re-fetches eligible forms (should now see the new form)
$stu24FormsAfter = request('GET', "$baseUrl/student/feedback-forms", [], $stu24Token);
$formsList = $stu24FormsAfter['data']['data'] ?? $stu24FormsAfter['data'] ?? [];
echo "9. Student 24IT019 eligible forms after publish: " . count($formsList) . " (expected >= 1)\n";

// Find questions in the form
$targetForm = null;
foreach ($formsList as $f) {
    if ($f['id'] == $newFormId) {
        $targetForm = $f;
        break;
    }
}
$questions = $targetForm['questions'] ?? [];
echo "   Questions count: " . count($questions) . "\n";

// 10. Student 24IT019 submits feedback
$subPayload = [
    'overall_remark' => 'Great lectures, pacing was perfect.',
    'answers' => [
        [
            'question_id' => $questions[0]['id'],
            'rating_value' => 5
        ],
        [
            'question_id' => $questions[1]['id'],
            'rating_value' => 4
        ]
    ]
];
$subRes = request('POST', "$baseUrl/student/feedback-forms/{$newFormId}/submit", $subPayload, $stu24Token);
echo "10. Student 24IT019 submits feedback: HTTP {$subRes['code']}\n";
$responseId = $subRes['data']['data']['id'] ?? $subRes['data']['id'] ?? null;
echo "    Response ID: {$responseId}\n";

// 11. Student 24IT019 attempts duplicate submission (MUST be blocked)
$dupRes = request('POST', "$baseUrl/student/feedback-forms/{$newFormId}/submit", $subPayload, $stu24Token);
echo "11. Duplicate submission attempt: HTTP {$dupRes['code']} (expected 422)\n";

// 12. Check Faculty Reports / Dashboard
$facRes = request('GET', "$baseUrl/faculty-reports/report?faculty_id=2&academic_year_id=1", [], $adminToken);
echo "12. Faculty Report for Faculty 2: HTTP {$facRes['code']}, Avg Rating: " . ($facRes['data']['overall_score'] ?? $facRes['data']['metrics']['overall_average_score'] ?? 'computed') . "\n";

// 13. Moderation: Exclude feedback
$exRes = request('POST', "$baseUrl/feedback/responses/{$responseId}/exclude", ['reason' => 'Student requested revision'], $adminToken);
echo "13. Moderation Exclude: HTTP {$exRes['code']}, Message: " . ($exRes['data']['message'] ?? 'none') . "\n";

// 14. Moderation: Restore feedback
$restRes = request('POST', "$baseUrl/feedback/responses/{$responseId}/restore", [], $adminToken);
echo "14. Moderation Restore: HTTP {$restRes['code']}, Message: " . ($restRes['data']['message'] ?? 'none') . "\n";

