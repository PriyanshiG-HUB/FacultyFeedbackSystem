<?php
// Bootstrap Laravel
chdir(__DIR__);
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\FeedbackAnswer;
use App\Models\FeedbackResponse;

// Check a sample of answers to see their text_value
$answers = FeedbackAnswer::whereNotNull('text_value')
    ->take(10)
    ->get(['id', 'response_id', 'question_id', 'rating_value', 'text_value']);

echo "=== Answers WITH text_value ===\n";
echo "Count: " . FeedbackAnswer::whereNotNull('text_value')->count() . "\n";
foreach ($answers as $a) {
    echo "  answer_id={$a->id}, response_id={$a->response_id}, question_id={$a->question_id}, text='{$a->text_value}'\n";
}

echo "\n=== Answers WITHOUT text_value (null) ===\n";
echo "Count: " . FeedbackAnswer::whereNull('text_value')->count() . "\n";

echo "\n=== Responses WITH overall_remark ===\n";
echo "Count: " . FeedbackResponse::whereNotNull('overall_remark')->count() . "\n";
$responses = FeedbackResponse::whereNotNull('overall_remark')->take(5)->get(['id', 'overall_remark']);
foreach ($responses as $r) {
    echo "  response_id={$r->id}, overall_remark='{$r->overall_remark}'\n";
}

echo "\n=== Sample response with its answers ===\n";
$sampleResponse = FeedbackResponse::with('answers')->whereHas('answers')->latest('submitted_at')->first();
if ($sampleResponse) {
    echo "response_id={$sampleResponse->id}, overall_remark='{$sampleResponse->overall_remark}'\n";
    foreach ($sampleResponse->answers as $a) {
        echo "  answer_id={$a->id}, question_id={$a->question_id}, rating={$a->rating_value}, text_value=" . json_encode($a->text_value) . "\n";
    }
}
