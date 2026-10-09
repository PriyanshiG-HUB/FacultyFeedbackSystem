<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\UserAccount;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role;
        
        $departmentId = $request->query('department_id');
        $departmentCode = $request->query('department_code', $departmentId); // fallback

        // RBAC / Scope Enforcement
        if ($role === 'HOD') {
            $faculty = DB::table('faculty')->where('user_account_id', $user->id)->first();
            $dept = DB::table('department')->where('id', $faculty->department_id)->first();
            $departmentCode = $dept->department_code; // Force HOD to their own department
        } elseif ($role === 'STUDENT' || $role === 'FACULTY') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Base query for forms
        $baseForms = DB::table('feedback_form as ff')
            ->join('teaching_assignment as ta', 'ff.teaching_assignment_id', '=', 'ta.id')
            ->join('subject as sub', 'ta.subject_id', '=', 'sub.id')
            ->join('department as d', 'sub.department_id', '=', 'd.id')
            ->join('faculty as fac', 'ta.faculty_id', '=', 'fac.id');

        if ($departmentCode && $departmentCode !== 'ALL') {
            $baseForms->where('d.department_code', $departmentCode);
        }

        // 1. Department Ratings (Subject Category Scores aggregated by Department)
        $categoryScoresQuery = DB::table('feedback_answer as fa')
            ->join('feedback_response as fr', 'fa.response_id', '=', 'fr.id')
            ->join('feedback_form as ff', 'fr.feedback_form_id', '=', 'ff.id')
            ->join('teaching_assignment as ta', 'ff.teaching_assignment_id', '=', 'ta.id')
            ->join('subject as sub', 'ta.subject_id', '=', 'sub.id')
            ->join('department as d', 'sub.department_id', '=', 'd.id')
            ->join('feedback_question as fq', 'fa.question_id', '=', 'fq.id')
            ->leftJoin('feedback_question_category as fqc', 'fq.category_id', '=', 'fqc.id')
            ->where('fr.is_excluded', false);

        if ($departmentCode && $departmentCode !== 'ALL') {
            $categoryScoresQuery->where('d.department_code', $departmentCode);
        }

        $rawScores = $categoryScoresQuery->select(
            'd.department_name',
            'fqc.category_name',
            'fq.question_text',
            DB::raw('AVG(fa.rating_value) as avg_rating')
        )->groupBy('d.department_name', 'fqc.category_name', 'fq.question_text')->get();

        $deptAggTemp = [];
        foreach ($rawScores as $row) {
            $deptName = $row->department_name;
            if (!isset($deptAggTemp[$deptName])) {
                $deptAggTemp[$deptName] = ['punctuality' => [], 'knowledge' => [], 'clarity' => [], 'material' => []];
            }
            $cat = strtolower($row->category_name ?? '');
            $qText = strtolower($row->question_text ?? '');
            $val = floatval($row->avg_rating);
            
            if (str_contains($cat, 'punctual') || str_contains($qText, 'time') || str_contains($qText, 'punctual')) {
                $deptAggTemp[$deptName]['punctuality'][] = $val;
            } elseif (str_contains($cat, 'knowledge') || str_contains($qText, 'knowledge')) {
                $deptAggTemp[$deptName]['knowledge'][] = $val;
            } elseif (str_contains($cat, 'clarity') || str_contains($qText, 'clarity') || str_contains($qText, 'explain')) {
                $deptAggTemp[$deptName]['clarity'][] = $val;
            } elseif (str_contains($cat, 'material') || str_contains($qText, 'material')) {
                $deptAggTemp[$deptName]['material'][] = $val;
            }
        }
        
        $deptAgg = [];
        foreach ($deptAggTemp as $deptName => $cats) {
            $deptAgg[$deptName] = [
                'department' => $deptName,
                'punctuality' => count($cats['punctuality']) ? round(array_sum($cats['punctuality']) / count($cats['punctuality']), 2) : 0,
                'knowledge' => count($cats['knowledge']) ? round(array_sum($cats['knowledge']) / count($cats['knowledge']), 2) : 0,
                'clarity' => count($cats['clarity']) ? round(array_sum($cats['clarity']) / count($cats['clarity']), 2) : 0,
                'material' => count($cats['material']) ? round(array_sum($cats['material']) / count($cats['material']), 2) : 0,
            ];
        }

        // 2. Top Faculty Leaderboard
        $facultyScoresQuery = DB::table('feedback_answer as fa')
            ->join('feedback_response as fr', 'fa.response_id', '=', 'fr.id')
            ->join('feedback_form as ff', 'fr.feedback_form_id', '=', 'ff.id')
            ->join('teaching_assignment as ta', 'ff.teaching_assignment_id', '=', 'ta.id')
            ->join('faculty as fac', 'ta.faculty_id', '=', 'fac.id')
            ->join('department as d', 'fac.department_id', '=', 'd.id')
            ->where('fr.is_excluded', false);

        if ($departmentCode && $departmentCode !== 'ALL') {
            $facultyScoresQuery->where('d.department_code', $departmentCode);
        }

        $topFacultyRaw = $facultyScoresQuery->select(
            'fac.id',
            'fac.full_name as name',
            'd.department_name as department',
            DB::raw('COUNT(DISTINCT fr.id) as totalResponses'),
            DB::raw('AVG(fa.rating_value) as avgRating')
        )->groupBy('fac.id', 'fac.full_name', 'd.department_name')
         ->orderByDesc('avgRating')
         ->limit(5)
         ->get();
         
        $topFaculty = $topFacultyRaw->map(function($f) {
            $f->avgRating = round($f->avgRating, 2);
            return (array) $f;
        })->toArray();

        // 3. Score Distribution
        $distQuery = DB::table('feedback_answer as fa')
            ->join('feedback_response as fr', 'fa.response_id', '=', 'fr.id')
            ->join('feedback_form as ff', 'fr.feedback_form_id', '=', 'ff.id')
            ->join('teaching_assignment as ta', 'ff.teaching_assignment_id', '=', 'ta.id')
            ->join('subject as sub', 'ta.subject_id', '=', 'sub.id')
            ->join('department as d', 'sub.department_id', '=', 'd.id')
            ->where('fr.is_excluded', false)
            ->whereNotNull('fa.rating_value');

        if ($departmentCode && $departmentCode !== 'ALL') {
            $distQuery->where('d.department_code', $departmentCode);
        }

        $ratings = $distQuery->pluck('rating_value');
        $ranges = ['0 - 1' => 0, '1 - 2' => 0, '2 - 3' => 0, '3 - 4' => 0, '4 - 5' => 0];
        foreach ($ratings as $s) {
            $s = floatval($s);
            if ($s <= 1) $ranges['0 - 1']++;
            elseif ($s <= 2) $ranges['1 - 2']++;
            elseif ($s <= 3) $ranges['2 - 3']++;
            elseif ($s <= 4) $ranges['3 - 4']++;
            else $ranges['4 - 5']++;
        }
        $scoreDistribution = [];
        foreach ($ranges as $range => $count) {
            $scoreDistribution[] = ['range' => $range, 'count' => $count];
        }

        return response()->json([
            'departmentRatings' => array_values($deptAgg),
            'topFaculty' => $topFaculty,
            'scoreDistribution' => array_reverse($scoreDistribution)
        ]);
    }
}
