<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$b1 = \App\Models\Batch::find(1);
$b33 = \App\Models\Batch::find(33);

echo "Batch 1: " . ($b1 ? $b1->batch_title : 'Not found') . "\n";
echo "Batch 33: " . ($b33 ? $b33->batch_title : 'Not found') . "\n";
