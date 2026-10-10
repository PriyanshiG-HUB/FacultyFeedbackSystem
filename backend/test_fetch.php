<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';
$r = \App\Models\FeedbackResponse::with('answers')->whereNotNull('overall_remark')->first();
echo json_encode($r->toArray(), JSON_PRETTY_PRINT);
