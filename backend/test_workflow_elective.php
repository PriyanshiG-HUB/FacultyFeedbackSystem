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

echo "=== Testing Part 8: Elective Workflow & Delete Safety ===\n\n";

// 1. Login Admin
$adminAuth = request('POST', "$baseUrl/auth/login", ['email' => 'admin@college.edu', 'password' => 'password123']);
$adminToken = $adminAuth['data']['token'];

// 2. Login Student 6 (24IT019)
$stu24Auth = request('POST', "$baseUrl/auth/login", ['email' => '24it019@charusat.ac.in', 'password' => '24IT019']);
$stu24Token = $stu24Auth['data']['token'];

// 3. Login Student 1 (student1@college.edu)
$stu1Auth = request('POST', "$baseUrl/auth/login", ['email' => 'student1@college.edu', 'password' => 'password123']);
$stu1Token = $stu1Auth['data']['token'];

// 4. Create Elective Offering for Subject 2 (CEUC301 - ELECTIVE) for Batch 2 (Student 6's batch)
$offeringRes = request('POST', "$baseUrl/subject-offerings", [
    'subject_id' => 2,
    'batch_id' => 2,
    'academic_year_id' => 1,
    'enrollment_capacity' => 60,
    'status' => 'OPEN'
], $adminToken);
echo "1. Create Elective Offering: HTTP {$offeringRes['code']}\n";
$offeringId = $offeringRes['data']['data']['id'] ?? $offeringRes['data']['id'] ?? null;
echo "   Offering ID: {$offeringId}\n";

// 5. Enroll Student 6 (id: 6) into this elective offering
$enrollRes = request('POST', "$baseUrl/elective-enrollments", [
    'student_id' => 6,
    'subject_offering_id' => $offeringId,
    'status' => 'ENROLLED'
], $adminToken);
echo "2. Enroll Student 6 in Elective: HTTP {$enrollRes['code']}\n";
$enrollmentId = $enrollRes['data']['data']['id'] ?? $enrollRes['data']['id'] ?? null;
echo "   Enrollment ID: {$enrollmentId}\n";

// 6. Create Teaching Assignment for this Elective (Subject 2, Faculty 1, Batch 2, Academic Year 1, Semester 7)
$taRes = request('POST', "$baseUrl/teaching-assignments", [
    'subject_id' => 2,
    'faculty_id' => 1,
    'batch_id' => 2,
    'division_id' => null,
    'section_id' => null,
    'academic_year_id' => 1,
    'semester_id' => 7,
    'status' => 'ACTIVE'
], $adminToken);
echo "3. Create Teaching Assignment for Elective: HTTP {$taRes['code']}\n";
$taId = $taRes['data']['data']['id'] ?? $taRes['data']['id'] ?? null;
echo "   Teaching Assignment ID: {$taId}\n";

// 7. Create Feedback Form for this Elective TA & Publish
$formRes = request('POST', "$baseUrl/feedback-forms", [
    'teaching_assignment_id' => $taId,
    'title' => 'Big Data Elective Feedback',
    'form_code' => 'FF-ELEC-' . time(),
    'window_start_date' => '2026-01-01',
    'window_end_date' => '2026-12-31',
    'questions' => [
        [
            'question_text' => 'Course content coverage of Big Data frameworks.',
            'question_type' => 'RATING',
            'max_rating' => 5,
            'is_required' => true,
            'display_order' => 1
        ]
    ]
], $adminToken);
$formId = $formRes['data']['data']['id'] ?? $formRes['data']['id'] ?? null;
request('POST', "$baseUrl/feedback-forms/{$formId}/publish", [], $adminToken);
echo "4. Feedback Form for Elective Created & Published: ID {$formId}\n";

// 8. Student 6 checks eligible forms: MUST see formId
$stu6Forms = request('GET', "$baseUrl/student/feedback-forms", [], $stu24Token);
echo "HTTP code for stu6 forms: {$stu6Forms['code']}\n";
if ($stu6Forms['code'] !== 200) {
    echo "Stu6 forms response: " . json_encode($stu6Forms['data']) . "\n";
}
$stu6FormsList = (isset($stu6Forms['data']['data']) && is_array($stu6Forms['data']['data'])) ? $stu6Forms['data']['data'] : (is_array($stu6Forms['data']) ? $stu6Forms['data'] : []);
$stu6CanSee = false;
foreach ($stu6FormsList as $f) {
    if (is_array($f) && isset($f['id']) && $f['id'] == $formId) $stu6CanSee = true;
}
echo "5. Enrolled Student 6 sees Elective Form: " . ($stu6CanSee ? "YES (VERIFIED)" : "NO (FAILED)") . "\n";

// 9. Student 1 (Not enrolled in this elective, different batch & not enrolled): checks forms: MUST NOT see formId
$stu1Forms = request('GET', "$baseUrl/student/feedback-forms", [], $stu1Token);
$stu1FormsList = $stu1Forms['data']['data'] ?? $stu1Forms['data'] ?? [];
$stu1CanSee = false;
foreach ($stu1FormsList as $f) {
    if ($f['id'] == $formId) $stu1CanSee = true;
}
echo "6. Non-enrolled Student 1 sees Elective Form: " . ($stu1CanSee ? "YES (BUG!)" : "NO (VERIFIED)") . "\n";

// 10. Student 6 submits feedback for Elective
$subRes = request('POST', "$baseUrl/student/feedback-forms/{$formId}/submit", [
    'overall_remark' => 'Excellent elective course',
    'answers' => [
        [
            'question_id' => $formRes['data']['data']['questions'][0]['id'] ?? 8,
            'rating_value' => 5
        ]
    ]
], $stu24Token);
echo "7. Student 6 submits Elective Feedback: HTTP {$subRes['code']}\n";
$responseId = $subRes['data']['data']['id'] ?? $subRes['data']['id'] ?? null;

// ==================== PART 6: DELETE SAFETY TESTS ====================
echo "\n--- Testing Part 6: Delete Safety ---\n";

// 11. Delete Subject Offering WITHOUT cascade (Enrollment exists) -> Expect 409 Conflict
$delOffNoCascade = request('DELETE', "$baseUrl/subject-offerings/{$offeringId}", [], $adminToken);
echo "8. Delete Subject Offering without cascade: HTTP {$delOffNoCascade['code']} (expected 409)\n";

// 12. Delete Feedback Form WITHOUT cascade (Responses exist) -> Expect 409 Conflict
$delFormNoCascade = request('DELETE', "$baseUrl/feedback-forms/{$formId}", [], $adminToken);
echo "9. Delete Feedback Form without cascade: HTTP {$delFormNoCascade['code']} (expected 409)\n";

// 13. Delete Feedback Form WITH cascade (?cascade=true) -> Expect 200 OK
$delFormCascade = request('DELETE', "$baseUrl/feedback-forms/{$formId}?cascade=true", [], $adminToken);
echo "10. Delete Feedback Form with ?cascade=true: HTTP {$delFormCascade['code']} (expected 200)\n";

// 14. Delete Subject Offering WITH cascade (?cascade=true) -> Expect 200 OK
$delOffCascade = request('DELETE', "$baseUrl/subject-offerings/{$offeringId}?cascade=true", [], $adminToken);
echo "11. Delete Subject Offering with ?cascade=true: HTTP {$delOffCascade['code']} (expected 200)\n";

// Clean up TA
request('DELETE', "$baseUrl/teaching-assignments/{$taId}?cascade=true", [], $adminToken);
echo "12. Cleaned up elective teaching assignment.\n";

