<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackForm;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackResponse;
use App\Models\TeachingAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FacultyReportController extends Controller
{
    /**
     * Helper to get user's scoped department ID if restricted (HOD scope).
     */
    private function getUserDepartmentScope(Request $request): ?int
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        // If user is SUPER_ADMIN, they have global scope unless restricted
        if ($user->role === 'SUPER_ADMIN') {
            return null;
        }

        // Check if user account is linked to a Faculty profile (e.g. HOD or Department Administrator)
        $faculty = $user->faculty;
        if ($faculty) {
            $hodDept = Department::where('hod_faculty_id', $faculty->id)->first();
            if ($hodDept) {
                return $hodDept->id;
            }
            return $faculty->department_id;
        }

        return null;
    }

    /**
     * Get list of faculty members available for report generation.
     */
    public function getFacultyList(Request $request): JsonResponse
    {
        $scopedDeptId = $this->getUserDepartmentScope($request);

        $query = Faculty::with(['department', 'designation', 'userAccount'])
            ->where('status', 'ACTIVE');

        if ($scopedDeptId !== null) {
            $query->where('department_id', $scopedDeptId);
        } elseif ($request->has('department_id') && !empty($request->get('department_id'))) {
            $query->where('department_id', $request->get('department_id'));
        }

        if ($request->has('search') && !empty($request->get('search'))) {
            $search = trim($request->get('search'));
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $facultyList = $query->orderBy('full_name', 'asc')->get()->map(function ($f) {
            return [
                'id' => $f->id,
                'full_name' => $f->full_name,
                'email' => $f->email,
                'department_id' => $f->department_id,
                'department_name' => $f->department?->department_name,
                'department_code' => $f->department?->department_code,
                'designation_name' => $f->designation?->designation_name ?? 'Faculty Member',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $facultyList,
        ], Response::HTTP_OK);
    }

    /**
     * Get teaching assignments / subjects for a selected faculty member.
     */
    public function getFacultyAssignments(Request $request): JsonResponse
    {
        $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculty,id'],
        ]);

        $facultyId = (int)$request->input('faculty_id');
        $scopedDeptId = $this->getUserDepartmentScope($request);

        $faculty = Faculty::find($facultyId);
        if (!$faculty) {
            return response()->json(['message' => 'Faculty member not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($scopedDeptId !== null && $faculty->department_id !== $scopedDeptId) {
            return response()->json(['message' => 'Forbidden: Cannot access faculty from another department.'], Response::HTTP_FORBIDDEN);
        }

        $assignments = TeachingAssignment::with([
            'subject',
            'batch',
            'academicYear',
            'semester',
            'division',
            'section',
        ])
        ->where('faculty_id', $facultyId)
        ->get()
        ->map(function ($ta) {
            // Count total responses for this assignment
            $formIds = FeedbackForm::where('teaching_assignment_id', $ta->id)->pluck('id');
            $responseCount = FeedbackResponse::whereIn('feedback_form_id', $formIds)
                ->where('is_excluded', false)
                ->count();

            $subjectName = $ta->subject?->subject_name ?? 'N/A';
            $courseType = $ta->subject?->course_type === 'ELECTIVE' ? 'Elective' : 'Core/Theory';

            $divSec = [];
            if ($ta->division) $divSec[] = "Div {$ta->division->division_code}";
            if ($ta->section) $divSec[] = "Sec {$ta->section->section_code}";
            $divSecStr = !empty($divSec) ? " (" . implode(', ', $divSec) . ")" : "";

            return [
                'id' => $ta->id,
                'subject_id' => $ta->subject_id,
                'subject_code' => $ta->subject?->subject_code ?? '',
                'subject_name' => $subjectName,
                'course_type' => $courseType,
                'batch_title' => $ta->batch?->batch_title ?? '',
                'academic_year_code' => $ta->academicYear?->year_code ?? '',
                'semester_no' => $ta->semester?->semester_no ?? $ta->semester_id,
                'display_label' => "{$subjectName} [{$ta->subject?->subject_code}]{$divSecStr} - AY {$ta->academicYear?->year_code}",
                'total_responses' => $responseCount,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ], Response::HTTP_OK);
    }

    /**
     * Generate dynamic Teacher Performance Report from database metrics.
     */
    public function generateReport(Request $request): JsonResponse
    {
        $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculty,id'],
            'teaching_assignment_id' => ['nullable', 'integer', 'exists:teaching_assignment,id'],
        ]);

        $facultyId = (int)$request->input('faculty_id');
        $assignmentId = $request->input('teaching_assignment_id') ? (int)$request->input('teaching_assignment_id') : null;

        $scopedDeptId = $this->getUserDepartmentScope($request);

        $faculty = Faculty::with(['department', 'designation'])->find($facultyId);
        if (!$faculty) {
            return response()->json(['message' => 'Faculty member not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($scopedDeptId !== null && $faculty->department_id !== $scopedDeptId) {
            return response()->json(['message' => 'Forbidden: Access denied for this department faculty.'], Response::HTTP_FORBIDDEN);
        }

        // Get matching teaching assignments
        $assignmentsQuery = TeachingAssignment::with(['subject', 'batch', 'academicYear', 'semester', 'division', 'section'])
            ->where('faculty_id', $facultyId);

        if ($assignmentId) {
            $assignmentsQuery->where('id', $assignmentId);
        }

        $assignments = $assignmentsQuery->get();
        $assignmentIds = $assignments->pluck('id')->toArray();

        // Find forms
        $forms = FeedbackForm::whereIn('teaching_assignment_id', $assignmentIds)->get();
        $formIds = $forms->pluck('id')->toArray();

        // Get valid responses
        $responses = FeedbackResponse::whereIn('feedback_form_id', $formIds)
            ->where('is_excluded', false)
            ->get();
        $responseIds = $responses->pluck('id')->toArray();
        $totalResponses = count($responseIds);

        // Fetch all rating answers
        $answers = FeedbackAnswer::whereIn('response_id', $responseIds)
            ->whereNotNull('rating_value')
            ->get();

        $totalRatingsCount = count($answers);

        // Overall average rating
        $overallAvgScore = $totalRatingsCount > 0 ? (float)round($answers->avg('rating_value'), 2) : 0.0;
        $overallAvgPct = $totalRatingsCount > 0 ? (float)round(($overallAvgScore / 5.0) * 100, 1) : 0.0;

        // Overall rating distribution
        $count5 = $answers->where('rating_value', 5)->count();
        $count4 = $answers->where('rating_value', 4)->count();
        $count3 = $answers->where('rating_value', 3)->count();
        $count2 = $answers->where('rating_value', 2)->count();
        $count1 = $answers->where('rating_value', 1)->count();

        $dist5 = $totalRatingsCount > 0 ? (float)round(($count5 / $totalRatingsCount) * 100, 1) : 0.0;
        $dist4 = $totalRatingsCount > 0 ? (float)round(($count4 / $totalRatingsCount) * 100, 1) : 0.0;
        $dist3 = $totalRatingsCount > 0 ? (float)round(($count3 / $totalRatingsCount) * 100, 1) : 0.0;
        $dist2 = $totalRatingsCount > 0 ? (float)round(($count2 / $totalRatingsCount) * 100, 1) : 0.0;
        $dist1 = $totalRatingsCount > 0 ? (float)round(($count1 / $totalRatingsCount) * 100, 1) : 0.0;

        // Question-wise Statistics
        $questionStats = [];
        $commentCards = [];

        // Get questions associated with these forms or default system feedback questions
        $questions = FeedbackQuestion::with('category')
            ->whereIn('feedback_form_id', $formIds)
            ->orderBy('display_order', 'asc')
            ->get();

        if ($questions->isEmpty()) {
            // Fallback to all questions if specific forms have no questions attached
            $questions = FeedbackQuestion::with('category')->orderBy('display_order', 'asc')->get();
        }

        foreach ($questions as $q) {
            $qAnswers = $answers->where('question_id', $q->id);
            $qCount = count($qAnswers);

            if ($qCount > 0) {
                $q5 = $qAnswers->where('rating_value', 5)->count();
                $q4 = $qAnswers->where('rating_value', 4)->count();
                $q3 = $qAnswers->where('rating_value', 3)->count();
                $q2 = $qAnswers->where('rating_value', 2)->count();
                $q1 = $qAnswers->where('rating_value', 1)->count();

                $p5 = (float)round(($q5 / $qCount) * 100, 1);
                $p4 = (float)round(($q4 / $qCount) * 100, 1);
                $p3 = (float)round(($q3 / $qCount) * 100, 1);
                $p2 = (float)round(($q2 / $qCount) * 100, 1);
                $p1 = (float)round(($q1 / $qCount) * 100, 1);

                $qAvg = (float)round($qAnswers->avg('rating_value'), 2);
                $qAvgPct = (float)round(($qAvg / 5.0) * 100, 1);
            } else {
                $p5 = $p4 = $p3 = $p2 = $p1 = $qAvgPct = 0.0;
                $qAvg = 0.0;
            }

            $questionStats[] = [
                'question_id' => $q->id,
                'question_text' => $q->question_text,
                'category_name' => $q->category?->category_name ?? 'General',
                'strongly_agree_pct' => $p5,
                'agree_pct' => $p4,
                'neutral_pct' => $p3,
                'disagree_pct' => $p2,
                'strongly_disagree_pct' => $p1,
                'avg_score' => $qAvg,
                'avg_pct' => $qAvgPct,
            ];

            // Extract student comments for this question or general feedback
            $qComments = FeedbackAnswer::whereIn('response_id', $responseIds)
                ->where('question_id', $q->id)
                ->where(function ($query) {
                    $query->whereNotNull('text_value')->where('text_value', '!=', '')
                          ->orWhereNotNull('text_answer')->where('text_answer', '!=', '');
                })
                ->get()
                ->map(fn($ans) => trim($ans->text_value ?: $ans->text_answer))
                ->filter(fn($txt) => !empty($txt) && !in_array(strtolower($txt), ['na', 'n/a', '-']))
                ->values()
                ->toArray();

            if (empty($qComments)) {
                $qComments = ['NA'];
            }

            $commentCards[] = [
                'question_text' => $q->question_text,
                'comments' => $qComments,
            ];
        }

        // Include any general overall remarks from FeedbackResponse
        $generalRemarks = $responses->pluck('overall_remark')
            ->filter(fn($rem) => !empty($rem) && !in_array(strtolower(trim($rem)), ['na', 'n/a', '-']))
            ->values()
            ->toArray();

        if (!empty($generalRemarks)) {
            $commentCards[] = [
                'question_text' => 'General Student Remarks & Suggestions',
                'comments' => $generalRemarks,
            ];
        }

        // Meta info formatting
        $firstAssignment = $assignments->first();
        $subjectName = $firstAssignment?->subject?->subject_name ?? 'All Assigned Subjects';
        $subjectCode = $firstAssignment?->subject?->subject_code ?? 'ALL';
        $courseType = $firstAssignment?->subject?->course_type === 'ELECTIVE' ? 'Elective' : 'Core/Theory';
        $academicYear = $firstAssignment?->academicYear?->year_code ?? date('Y') . '-' . (date('Y') + 1);

        $departmentName = $faculty->department?->department_name ?? 'Academic Department';
        $departmentCode = $faculty->department?->department_code ?? 'DEPT';

        $departmentFullName = str_contains(strtolower($departmentName), 'department')
            ? $departmentName
            : "Department of {$departmentName}";

        return response()->json([
            'success' => true,
            'data' => [
                'faculty' => [
                    'id' => $faculty->id,
                    'full_name' => strtoupper($faculty->full_name),
                    'email' => $faculty->email,
                    'department_name' => $departmentName,
                    'department_code' => $departmentCode,
                    'department_full_name' => $departmentFullName,
                    'designation_name' => $faculty->designation?->designation_name ?? 'Faculty Member',
                ],
                'subject' => [
                    'subject_name' => strtoupper($subjectName),
                    'subject_code' => $subjectCode,
                    'course_type' => $courseType,
                    'academic_year' => $academicYear,
                ],
                'generated_date' => date('F j, Y'),
                'total_responses' => $totalResponses,
                'overall_average' => $overallAvgScore,
                'overall_percentage' => $overallAvgPct,
                'distribution' => [
                    'strongly_agree' => $dist5,
                    'agree' => $dist4,
                    'neutral' => $dist3,
                    'disagree' => $dist2,
                    'strongly_disagree' => $dist1,
                ],
                'question_statistics' => $questionStats,
                'comment_cards' => $commentCards,
            ],
        ], Response::HTTP_OK);
    }
}
