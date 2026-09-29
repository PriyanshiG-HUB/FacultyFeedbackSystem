<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTimetableRequest;
use App\Http\Requests\UpdateTimetableRequest;
use App\Models\TeachingAssignment;
use App\Models\Timetable;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    use AuthorizesDepartmentScope;

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

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->whereHas('teachingAssignment.subject', function ($q) use ($hodDeptId) {
                $q->where('department_id', $hodDeptId);
            });
        } elseif ($request->has('department_id')) {
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
        $data = $request->validated();
        $ta = TeachingAssignment::with('subject')->findOrFail($data['teaching_assignment_id']);
        if ($ta->subject) {
            $this->validateDepartmentAccess($request, $ta->subject->department_id);
        }

        $timetable = Timetable::create($data);
        $timetable->load([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section'
        ]);
        return response()->json($timetable, 201);
    }

    public function show(Request $request, Timetable $timetable)
    {
        $timetable->load([
            'teachingAssignment.subject',
            'teachingAssignment.faculty',
            'teachingAssignment.batch',
            'teachingAssignment.division',
            'teachingAssignment.section'
        ]);

        if ($timetable->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $timetable->teachingAssignment->subject->department_id);
        }

        return response()->json($timetable);
    }

    public function update(UpdateTimetableRequest $request, Timetable $timetable)
    {
        $timetable->loadMissing('teachingAssignment.subject');
        if ($timetable->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $timetable->teachingAssignment->subject->department_id);
        }

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

    public function destroy(Request $request, Timetable $timetable)
    {
        $timetable->loadMissing('teachingAssignment.subject');
        if ($timetable->teachingAssignment?->subject) {
            $this->validateDepartmentAccess($request, $timetable->teachingAssignment->subject->department_id);
        }

        $timetable->delete();
        return response()->json(null, 204);
    }
}
