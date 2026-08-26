<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimetableRequest;
use App\Http\Requests\UpdateTimetableRequest;
use App\Models\Timetable;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $query = Timetable::with([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section',
            'teachingAssignment.academicYear',
            'teachingAssignment.semester'
        ]);

        if ($request->has('department_id')) {
            $query->whereHas('teachingAssignment.subject', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->has('academic_year_id')) {
            $query->whereHas('teachingAssignment', function ($q) use ($request) {
                $q->where('academic_year_id', $request->academic_year_id);
            });
        }

        return response()->json($query->orderBy('day')->orderBy('start_time')->get());
    }

    public function store(StoreTimetableRequest $request)
    {
        $timetable = Timetable::create($request->validated());
        $timetable->load([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section'
        ]);
        return response()->json($timetable, 201);
    }

    public function show(Timetable $timetable)
    {
        $timetable->load([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section'
        ]);
        return response()->json($timetable);
    }

    public function update(UpdateTimetableRequest $request, Timetable $timetable)
    {
        $timetable->update($request->validated());
        $timetable->load([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section'
        ]);
        return response()->json($timetable);
    }

    public function destroy(Timetable $timetable)
    {
        $timetable->delete();
        return response()->json(null, 204);
    }
}
