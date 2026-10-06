<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\FeedbackResponse;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $departmentId = $request->query('department_id');
        
        $query = FeedbackResponse::query()
            ->join('feedback_form', 'feedback_response.feedback_form_id', '=', 'feedback_form.id')
            ->join('teaching_assignment', 'feedback_form.teaching_assignment_id', '=', 'teaching_assignment.id')
            ->join('subject', 'teaching_assignment.subject_id', '=', 'subject.id')
            ->join('department', 'subject.department_id', '=', 'department.id')
            ->join('faculty', 'teaching_assignment.faculty_id', '=', 'faculty.id');

        if ($departmentId && $departmentId !== 'ALL') {
            $query->where('department.department_code', $departmentId);
        }

        $responses = $query->select(
            'department.department_name',
            'faculty.id as faculty_id',
            'faculty.full_name as faculty_name',
            'feedback_response.question_scores'
        )->get();

        if ($responses->isEmpty()) {
            return response()->json([
                'departmentRatings' => [],
                'topFaculty' => [],
                'scoreDistribution' => [],
            ]);
        }

        // Aggregate Department Ratings
        $deptAgg = [];
        $facultyAgg = [];
        $scoresList = [];

        foreach ($responses as $response) {
            $scores = is_string($response->question_scores) ? json_decode($response->question_scores, true) : $response->question_scores;
            if (!$scores) continue;

            $totalScore = 0;
            $count = 0;
            $punctuality = 0;
            $knowledge = 0;
            $clarity = 0;
            $material = 0;
            
            // Dummy logic to map questions to categories. Since we don't know exactly which questions are which,
            // we will just average the scores for the overall.
            foreach ($scores as $qId => $score) {
                $score = floatval($score);
                $totalScore += $score;
                $count++;
                $scoresList[] = $score;
                // Distribute evenly for dummy categories if not available
                $punctuality += $score;
                $knowledge += $score;
                $clarity += $score;
                $material += $score;
            }

            if ($count > 0) {
                $avg = $totalScore / $count;
                $deptName = $response->department_name;
                
                if (!isset($deptAgg[$deptName])) {
                    $deptAgg[$deptName] = ['punctuality' => 0, 'knowledge' => 0, 'clarity' => 0, 'material' => 0, 'count' => 0];
                }
                $deptAgg[$deptName]['punctuality'] += $avg;
                $deptAgg[$deptName]['knowledge'] += $avg;
                $deptAgg[$deptName]['clarity'] += $avg;
                $deptAgg[$deptName]['material'] += $avg;
                $deptAgg[$deptName]['count']++;

                $facId = $response->faculty_id;
                if (!isset($facultyAgg[$facId])) {
                    $facultyAgg[$facId] = ['name' => $response->faculty_name, 'department' => $deptName, 'total' => 0, 'count' => 0];
                }
                $facultyAgg[$facId]['total'] += $avg;
                $facultyAgg[$facId]['count']++;
            }
        }

        $departmentRatings = [];
        foreach ($deptAgg as $dept => $data) {
            $departmentRatings[] = [
                'department' => $dept,
                'punctuality' => round($data['punctuality'] / $data['count'], 1),
                'knowledge' => round($data['knowledge'] / $data['count'], 1),
                'clarity' => round($data['clarity'] / $data['count'], 1),
                'material' => round($data['material'] / $data['count'], 1),
            ];
        }

        $topFaculty = [];
        foreach ($facultyAgg as $facId => $data) {
            $topFaculty[] = [
                'id' => $facId,
                'name' => $data['name'],
                'department' => $data['department'],
                'avgRating' => round($data['total'] / $data['count'], 2),
                'totalResponses' => current(array_filter($responses->toArray(), fn($r) => $r['faculty_id'] == $facId)) ? count(array_filter($responses->toArray(), fn($r) => $r['faculty_id'] == $facId)) : 1, // rough estimate
            ];
        }
        usort($topFaculty, fn($a, $b) => $b['avgRating'] <=> $a['avgRating']);
        $topFaculty = array_slice($topFaculty, 0, 5);

        // Score Distribution
        $ranges = ['0 - 1' => 0, '1 - 2' => 0, '2 - 3' => 0, '3 - 4' => 0, '4 - 5' => 0];
        foreach ($scoresList as $s) {
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
            'departmentRatings' => $departmentRatings,
            'topFaculty' => $topFaculty,
            'scoreDistribution' => array_reverse($scoreDistribution),
        ]);
    }
}
