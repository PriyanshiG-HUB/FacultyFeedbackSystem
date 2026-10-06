<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SectionResource;
use App\Models\Division;
use App\Models\Section;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class SectionController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Section::with(['division.department', 'division.batch', 'division.semester'])->withCount('students');

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->whereHas('division', function ($q) use ($hodDeptId) {
                $q->where('department_id', $hodDeptId);
            });
        }

        if ($request->has('division_id')) {
            $query->where('division_id', $request->get('division_id'));
        }

        $sections = $query->get();

        return response()->json([
            'data' => SectionResource::collection($sections)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'division_id' => ['required', 'integer', 'exists:division,id'],
            'section_code' => ['required', 'string', 'max:10'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ]);

        $division = Division::findOrFail($validated['division_id']);
        $this->validateDepartmentAccess($request, $division->department_id);

        $section = Section::create($validated);

        return response()->json([
            'message' => 'Section created successfully',
            'data' => new SectionResource($section->load('division'))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Section $section): JsonResponse
    {
        $section->loadMissing('division');
        if ($section->division) {
            $this->validateDepartmentAccess($request, $section->division->department_id);
        }

        return response()->json([
            'data' => new SectionResource($section->load('division'))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Section $section): JsonResponse
    {
        $section->loadMissing('division');
        if ($section->division) {
            $this->validateDepartmentAccess($request, $section->division->department_id);
        }

        $validated = $request->validate([
            'division_id' => ['sometimes', 'required', 'integer', 'exists:division,id'],
            'section_code' => ['sometimes', 'required', 'string', 'max:10'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        if (isset($validated['division_id'])) {
            $targetDivision = Division::findOrFail($validated['division_id']);
            $this->validateDepartmentAccess($request, $targetDivision->department_id);
        }

        $section->update($validated);

        return response()->json([
            'message' => 'Section updated successfully',
            'data' => new SectionResource($section->fresh('division'))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Section $section): JsonResponse
    {
        $section->loadMissing('division');
        if ($section->division) {
            $this->validateDepartmentAccess($request, $section->division->department_id);
        }

        $hasDependencies = $section->students()->exists() || $section->teachingAssignments()->exists();

        if ($hasDependencies) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete section with active students or teaching assignments.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($section) {
                // Delete teaching assignments
                foreach ($section->teachingAssignments as $assignment) {
                    \App\Models\FeedbackForm::where('teaching_assignment_id', $assignment->id)->delete();
                    \App\Models\Timetable::where('teaching_assignment_id', $assignment->id)->delete();
                    $assignment->delete();
                }

                // Delete students
                foreach ($section->students as $student) {
                    $userAccount = $student->userAccount;
                    $student->delete();
                    if ($userAccount) {
                        $userAccount->delete();
                    }
                }

                $section->delete();
            });

            return response()->json([
                'message' => 'Section and all associated records deleted successfully'
            ], Response::HTTP_OK);
        }

        $section->delete();

        return response()->json([
            'message' => 'Section deleted successfully'
        ], Response::HTTP_OK);
    }
}
