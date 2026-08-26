<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Batch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Division;
use App\Models\Faculty;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackQuestionCategory;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SystemSettings;
use App\Models\TeachingAssignment;
use App\Models\UserAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the canonical database with test data matching frontend mock requirements.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. System Settings Default
            SystemSettings::firstOrCreate(
                ['department_id' => null],
                [
                    'rating_scale_min' => 1,
                    'rating_scale_max' => 5,
                    'min_responses_threshold' => 10,
                    'window_start_date' => '2026-08-01',
                    'window_end_date' => '2026-12-31',
                    'enforce_anonymous_submissions' => true,
                    'auto_publish_on_window_close' => false,
                ]
            );

            // 2. Super Admin User Account
            $adminUser = UserAccount::firstOrCreate(
                ['email' => 'admin@college.edu'],
                [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'SUPER_ADMIN',
                    'status' => 'ACTIVE',
                ]
            );

            // 3. Departments
            $itDept = Department::firstOrCreate(
                ['department_code' => 'IT'],
                ['department_name' => 'Information Technology', 'status' => 'ACTIVE']
            );

            $ceDept = Department::firstOrCreate(
                ['department_code' => 'CE'],
                ['department_name' => 'Computer Engineering', 'status' => 'ACTIVE']
            );

            // 4. Designations
            $profDesig = Designation::firstOrCreate(
                ['designation_name' => 'Professor'],
                ['status' => 'ACTIVE']
            );
            $assocDesig = Designation::firstOrCreate(
                ['designation_name' => 'Associate Professor'],
                ['status' => 'ACTIVE']
            );

            // 5. Faculty Members
            $fac1User = UserAccount::firstOrCreate(
                ['email' => 'dr.smith@college.edu'],
                [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'FACULTY',
                    'status' => 'ACTIVE',
                ]
            );
            $fac1 = Faculty::firstOrCreate(
                ['email' => 'dr.smith@college.edu'],
                [
                    'user_account_id' => $fac1User->id,
                    'employee_code' => 'EMP-IT-001',
                    'full_name' => 'Dr. John Smith',
                    'mobile' => '9876543210',
                    'department_id' => $itDept->id,
                    'designation_id' => $profDesig->id,
                    'joining_date' => '2018-06-01',
                    'status' => 'ACTIVE',
                ]
            );

            $fac2User = UserAccount::firstOrCreate(
                ['email' => 'prof.jones@college.edu'],
                [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'FACULTY',
                    'status' => 'ACTIVE',
                ]
            );
            $fac2 = Faculty::firstOrCreate(
                ['email' => 'prof.jones@college.edu'],
                [
                    'user_account_id' => $fac2User->id,
                    'employee_code' => 'EMP-IT-002',
                    'full_name' => 'Prof. Sarah Jones',
                    'mobile' => '9876543211',
                    'department_id' => $itDept->id,
                    'designation_id' => $assocDesig->id,
                    'joining_date' => '2020-01-15',
                    'status' => 'ACTIVE',
                ]
            );

            // Set HOD
            $itDept->update(['hod_faculty_id' => $fac1->id]);

            // 6. Academic Year & Semester
            $ay = AcademicYear::firstOrCreate(
                ['year_code' => '2025-2026'],
                [
                    'start_date' => '2025-07-01',
                    'end_date' => '2026-06-30',
                    'status' => 'ACTIVE',
                ]
            );

            for ($s = 1; $s <= 8; $s++) {
                Semester::firstOrCreate(
                    ['id' => $s],
                    ['semester_no' => $s, 'term' => ($s % 2 === 1) ? 'ODD' : 'EVEN']
                );
            }
            $sem7 = Semester::find(7);

            // 7. Cohort (Batch, Division, Section)
            $batch = Batch::firstOrCreate(
                ['department_id' => $itDept->id, 'batch_title' => '2022-26'],
                [
                    'program_name' => 'B.Tech IT',
                    'admission_year' => 2022,
                    'graduation_year' => 2026,
                    'current_semester_id' => $sem7->id,
                    'status' => 'ACTIVE',
                ]
            );

            $div1 = Division::firstOrCreate(
                ['batch_id' => $batch->id, 'division_code' => 'Division 1'],
                [
                    'department_id' => $itDept->id,
                    'semester_id' => $sem7->id,
                    'status' => 'ACTIVE',
                ]
            );

            $secA1 = Section::firstOrCreate(
                ['division_id' => $div1->id, 'section_code' => 'A1'],
                ['status' => 'ACTIVE']
            );

            // 8. Student User Account
            $stuUser = UserAccount::firstOrCreate(
                ['email' => 'student1@college.edu'],
                [
                    'password_hash' => Hash::make('password123'),
                    'role' => 'STUDENT',
                    'status' => 'ACTIVE',
                ]
            );

            $student = Student::firstOrCreate(
                ['roll_no' => '22IT001'],
                [
                    'user_account_id' => $stuUser->id,
                    'enrollment_no' => 'EN2022001',
                    'full_name' => 'Alex Johnson',
                    'email' => 'student1@college.edu',
                    'mobile' => '9123456789',
                    'department_id' => $itDept->id,
                    'batch_id' => $batch->id,
                    'division_id' => $div1->id,
                    'section_id' => $secA1->id,
                    'status' => 'ACTIVE',
                ]
            );

            // 9. Subject
            $subject = Subject::firstOrCreate(
                ['subject_code' => 'IT701'],
                [
                    'subject_name' => 'Advanced Cloud Computing',
                    'department_id' => $itDept->id,
                    'semester_id' => $sem7->id,
                    'course_type' => 'CORE',
                    'credits' => 4.0,
                    'status' => 'ACTIVE',
                ]
            );

            Subject::firstOrCreate(
                ['subject_code' => 'CEUC301'],
                [
                    'subject_name' => 'Big Data Analysis',
                    'department_id' => $ceDept->id,
                    'semester_id' => 5,
                    'course_type' => 'ELECTIVE',
                    'credits' => 4.0,
                    'status' => 'ACTIVE',
                ]
            );

            Subject::firstOrCreate(
                ['subject_code' => 'CEUC303'],
                [
                    'subject_name' => 'Machine Learning',
                    'department_id' => $ceDept->id,
                    'semester_id' => 5,
                    'course_type' => 'ELECTIVE',
                    'credits' => 4.0,
                    'status' => 'ACTIVE',
                ]
            );

            // 10. Teaching Assignment
            $assignment = TeachingAssignment::firstOrCreate(
                [
                    'subject_id' => $subject->id,
                    'faculty_id' => $fac1->id,
                    'batch_id' => $batch->id,
                    'academic_year_id' => $ay->id,
                    'semester_id' => $sem7->id,
                ],
                [
                    'division_id' => $div1->id,
                    'section_id' => null, // Entire Division
                    'status' => 'ACTIVE',
                ]
            );

            // 11. Feedback Form & Questions
            $catPunctuality = FeedbackQuestionCategory::firstOrCreate(
                ['category_code' => 'PUNCTUALITY'],
                ['category_name' => 'Punctuality & Discipline', 'display_order' => 1]
            );
            $catClarity = FeedbackQuestionCategory::firstOrCreate(
                ['category_code' => 'CLARITY_OF_TEACHING'],
                ['category_name' => 'Clarity of Teaching', 'display_order' => 2]
            );

            $form = FeedbackForm::firstOrCreate(
                ['form_code' => 'FF-2026-IT701'],
                [
                    'title' => 'Cloud Computing Faculty Feedback',
                    'teaching_assignment_id' => $assignment->id,
                    'window_start_date' => '2026-08-01',
                    'window_end_date' => '2026-12-31',
                    'is_anonymous' => true,
                    'is_published' => true,
                    'published_at' => now(),
                    'status' => 'PUBLISHED',
                    'created_by_user_account_id' => $adminUser->id,
                ]
            );

            FeedbackQuestion::firstOrCreate(
                ['feedback_form_id' => $form->id, 'display_order' => 1],
                [
                    'category_id' => $catPunctuality->id,
                    'question_text' => 'Does the faculty arrive on time for lectures?',
                    'question_type' => 'RATING',
                    'is_required' => true,
                    'max_rating' => 5,
                ]
            );

            FeedbackQuestion::firstOrCreate(
                ['feedback_form_id' => $form->id, 'display_order' => 2],
                [
                    'category_id' => $catClarity->id,
                    'question_text' => 'How clear are the subject concepts explained?',
                    'question_type' => 'RATING',
                    'is_required' => true,
                    'max_rating' => 5,
                ]
            );
        });
    }
}
