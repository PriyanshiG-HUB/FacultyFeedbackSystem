<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('custom_feedback_questions')) {
            Schema::create('custom_feedback_questions', function (Blueprint $table) {
                $table->id();
                $table->text('question');
                $table->string('category', 100)->nullable();
                $table->foreignId('category_id')->nullable()->constrained('feedback_question_category')->nullOnDelete();
                $table->string('question_type', 20)->default('RATING');
                $table->text('options')->nullable();
                $table->foreignId('created_by_user_account_id')->nullable()->constrained('user_account')->nullOnDelete();
                $table->timestamps();
            });
        }

        Schema::table('feedback_form', function (Blueprint $table) {
            if (!Schema::hasColumn('feedback_form', 'question_source')) {
                $table->string('question_source', 30)->default('EXISTING');
            }
            if (!Schema::hasColumn('feedback_form', 'response_type')) {
                $table->string('response_type', 30)->default('RATING');
            }
        });
    }

    public function down(): void
    {
        Schema::table('feedback_form', function (Blueprint $table) {
            if (Schema::hasColumn('feedback_form', 'question_source')) {
                $table->dropColumn('question_source');
            }
            if (Schema::hasColumn('feedback_form', 'response_type')) {
                $table->dropColumn('response_type');
            }
        });

        Schema::dropIfExists('custom_feedback_questions');
    }
};
