<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_account', function (Blueprint $table) {
            $table->id();
            $table->string('email', 150)->unique();
            $table->string('password_hash', 255);
            $table->enum('role', ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT'])->default('STUDENT');
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'LOCKED'])->default('ACTIVE');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('department', function (Blueprint $table) {
            $table->id();
            $table->string('department_code', 20)->unique();
            $table->string('department_name', 100);
            $table->unsignedBigInteger('hod_faculty_id')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('designation', function (Blueprint $table) {
            $table->id();
            $table->string('designation_name', 100)->unique();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('faculty', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_account_id')->constrained('user_account')->cascadeOnDelete();
            $table->string('full_name', 120);
            $table->string('email', 150)->unique();
            $table->string('mobile', 20)->nullable();
            $table->foreignId('department_id')->constrained('department');
            $table->foreignId('designation_id')->constrained('designation');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::table('department', function (Blueprint $table) {
            $table->foreign('hod_faculty_id')->references('id')->on('faculty')->nullOnDelete();
        });

        Schema::create('academic_year', function (Blueprint $table) {
            $table->id();
            $table->string('year_code', 20)->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('semester', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->unsignedTinyInteger('semester_no')->unique();
            $table->enum('term', ['ODD', 'EVEN'])->default('ODD');
        });

        Schema::create('batch', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('department');
            $table->string('batch_title', 60);
            $table->string('program_name', 100);
            $table->unsignedSmallInteger('admission_year');
            $table->unsignedSmallInteger('graduation_year');
            $table->unsignedTinyInteger('current_semester_id')->default(1);
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'PASSED_OUT'])->default('ACTIVE');
            $table->timestamps();
            $table->foreign('current_semester_id')->references('id')->on('semester');
        });

        Schema::create('division', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('department');
            $table->foreignId('batch_id')->constrained('batch');
            $table->unsignedTinyInteger('semester_id');
            $table->string('division_code', 20);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
            $table->foreign('semester_id')->references('id')->on('semester');
            $table->unique(['batch_id', 'division_code']);
        });

        Schema::create('section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained('division');
            $table->string('section_code', 20);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
            $table->unique(['division_id', 'section_code']);
        });

        Schema::create('student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_account_id')->constrained('user_account')->cascadeOnDelete();
            $table->string('roll_no', 30)->unique();
            $table->string('enrollment_no', 40)->nullable()->unique();
            $table->string('full_name', 120);
            $table->string('email', 150)->unique();
            $table->string('mobile', 20)->nullable();
            $table->foreignId('department_id')->constrained('department');
            $table->foreignId('batch_id')->constrained('batch');
            $table->foreignId('division_id')->nullable()->constrained('division');
            $table->foreignId('section_id')->nullable()->constrained('section');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('subject', function (Blueprint $table) {
            $table->id();
            $table->string('subject_code', 30)->unique();
            $table->string('subject_name', 150);
            $table->foreignId('department_id')->constrained('department');
            $table->unsignedTinyInteger('semester_id');
            $table->enum('course_type', ['CORE', 'ELECTIVE', 'LAB', 'PROJECT'])->default('CORE');
            $table->decimal('credits', 3, 1)->default(3.0);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
            $table->foreign('semester_id')->references('id')->on('semester');
        });

        Schema::create('subject_offering', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subject');
            $table->foreignId('academic_year_id')->constrained('academic_year');
            $table->unsignedTinyInteger('semester_id')->nullable();
            $table->foreignId('batch_id')->constrained('batch');
            $table->unsignedInteger('enrollment_capacity')->default(60);
            $table->string('status', 40)->default('OPEN');
            $table->timestamps();
            $table->foreign('semester_id')->references('id')->on('semester');
        });

        Schema::create('student_elective_enrollment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student');
            $table->foreignId('subject_offering_id')->constrained('subject_offering');
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_year');
            $table->unsignedTinyInteger('semester_id')->nullable();
            $table->string('status', 40)->default('ENROLLED');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();
            $table->foreign('semester_id')->references('id')->on('semester');
        });

        Schema::create('teaching_assignment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subject');
            $table->foreignId('faculty_id')->constrained('faculty');
            $table->foreignId('batch_id')->constrained('batch');
            $table->foreignId('division_id')->nullable()->constrained('division');
            $table->foreignId('section_id')->nullable()->constrained('section');
            $table->foreignId('academic_year_id')->constrained('academic_year');
            $table->unsignedTinyInteger('semester_id');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('feedback_question_category', function (Blueprint $table) {
            $table->id();
            $table->string('category_name', 100)->unique();
            $table->unsignedTinyInteger('display_order')->default(1);
        });

        Schema::create('data_import_log', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 255);
            $table->string('import_type', 100)->default('OTHER');
            $table->foreignId('department_id')->nullable()->constrained('department')->nullOnDelete();
            $table->foreignId('uploaded_by_user_account_id')->nullable()->constrained('user_account')->nullOnDelete();
            $table->unsignedInteger('record_count')->default(0);
            $table->enum('status', ['SUCCESS', 'FAILED', 'PROCESSING'])->default('PROCESSING');
            $table->text('error_log')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained('department');
            $table->unsignedTinyInteger('rating_scale_min')->default(1);
            $table->unsignedTinyInteger('rating_scale_max')->default(5);
            $table->unsignedInteger('min_responses_threshold')->default(10);
            $table->date('window_start_date')->nullable();
            $table->date('window_end_date')->nullable();
            $table->boolean('enforce_anonymous_submissions')->default(true);
            $table->boolean('auto_publish_on_window_close')->default(false);
            $table->foreignId('updated_by_user_account_id')->nullable()->constrained('user_account');
            $table->timestamps();
        });

        Schema::create('feedback_form', function (Blueprint $table) {
            $table->id();
            $table->string('form_code', 50)->unique();
            $table->string('title', 200);
            $table->foreignId('teaching_assignment_id')->constrained('teaching_assignment');
            $table->date('window_start_date')->nullable();
            $table->date('window_end_date')->nullable();
            $table->boolean('is_anonymous')->default(true);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->string('status', 40)->default('DRAFT');
            $table->foreignId('created_by_user_account_id')->nullable()->constrained('user_account');
            $table->timestamps();
        });

        Schema::create('feedback_question', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_form_id')->constrained('feedback_form')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('feedback_question_category');
            $table->text('question_text');
            $table->enum('question_type', ['RATING', 'TEXT', 'MCQ'])->default('RATING');
            $table->boolean('is_required')->default(true);
            $table->unsignedTinyInteger('max_rating')->default(5);
            $table->unsignedTinyInteger('display_order')->default(1);
            $table->timestamps();
        });

        Schema::create('feedback_question_option', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('feedback_question')->cascadeOnDelete();
            $table->string('option_text', 200);
            $table->unsignedTinyInteger('display_order')->default(1);
        });

        Schema::create('feedback_response', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_form_id')->constrained('feedback_form')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('student')->nullOnDelete();
            $table->text('overall_remark')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->boolean('is_excluded')->default(false);
            $table->text('exclusion_reason')->nullable();
            $table->text('excluded_reason')->nullable();
            $table->foreignId('excluded_by_user_account_id')->nullable()->constrained('user_account');
            $table->timestamp('excluded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('feedback_answer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('feedback_response')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('feedback_question')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating_value')->nullable();
            $table->text('text_value')->nullable();
            $table->text('text_answer')->nullable();
            $table->foreignId('selected_option_id')->nullable()->constrained('feedback_question_option');
            $table->timestamps();
        });

        Schema::create('report', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->foreignId('department_id')->nullable()->constrained('department');
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_year');
            $table->string('term', 20)->nullable();
            $table->unsignedInteger('sample_size')->default(0);
            $table->boolean('is_published')->default(false);
            $table->string('status', 40)->default('PUBLISHED');
            $table->foreignId('generated_by_user_account_id')->nullable()->constrained('user_account');
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report');
        Schema::dropIfExists('feedback_answer');
        Schema::dropIfExists('feedback_response');
        Schema::dropIfExists('feedback_question_option');
        Schema::dropIfExists('feedback_question');
        Schema::dropIfExists('feedback_form');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('data_import_log');
        Schema::dropIfExists('feedback_question_category');
        Schema::dropIfExists('teaching_assignment');
        Schema::dropIfExists('student_elective_enrollment');
        Schema::dropIfExists('subject_offering');
        Schema::dropIfExists('subject');
        Schema::dropIfExists('student');
        Schema::dropIfExists('section');
        Schema::dropIfExists('division');
        Schema::dropIfExists('batch');
        Schema::dropIfExists('semester');
        Schema::dropIfExists('academic_year');
        Schema::table('department', function (Blueprint $table) {
            $table->dropForeign(['hod_faculty_id']);
        });
        Schema::dropIfExists('faculty');
        Schema::dropIfExists('designation');
        Schema::dropIfExists('department');
        Schema::dropIfExists('user_account');
    }
};
