<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DivisionResource;
use App\Http\Resources\SectionResource;
use App\Models\Division;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class DivisionController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Division::with(['department', 'batch', 'semester']);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->where('department_id', $hodDeptId);
        } elseif ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->get('batch_id'));
        }

        $divisions = $query->get();

        return response()->json([
            'data' => DivisionResource::collection($divisions)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'batch_id' => ['required', 'integer', 'exists:batch,id'],
            'semester_id' => ['required', 'integer', 'exists:semester,id'],
            'division_code' => ['required', 'string', 'max:10'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE'],
        ]);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            if ((int)$validated['department_id'] !== $hodDeptId) {
                abort(Response::HTTP_FORBIDDEN, 'Forbidden: You cannot create a division for another department.');
            }
        }

        $division = Division::create($validated);

        return response()->json([
            'message' => 'Division created successfully',
            'data' => new DivisionResource($division->load(['department', 'batch', 'semester']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Division $division): JsonResponse
    {
        $this->validateDepartmentAccess($request, $division->department_id);

        return response()->json([
            'data' => new DivisionResource($division->load(['department', 'batch', 'semester']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Division $division): JsonResponse
    {
        $this->validateDepartmentAccess($request, $division->department_id);

        $validated = $request->validate([
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'batch_id' => ['sometimes', 'required', 'integer', 'exists:batch,id'],
            'semester_id' => ['sometimes', 'required', 'integer', 'exists:semester,id'],
            'division_code' => ['sometimes', 'required', 'string', 'max:10'],
            'status' => ['sometimes', 'in:ACTIVE,INACTIVE'],
        ]);

        if (isset($validated['department_id'])) {
            $this->validateDepartmentAccess($request, (int)$validated['department_id']);
        }

        $division->update($validated);

        return response()->json([
            'message' => 'Division updated successfully',
            'data' => new DivisionResource($division->fresh(['department', 'batch', 'semester']))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Division $division): JsonResponse
    {
        $this->validateDepartmentAccess($request, $division->department_id);

        $hasDependencies = $division->sections()->exists() || $division->students()->exists() || $division->teachingAssignments()->exists();

        if ($hasDependencies) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete division with active sections, students, or teaching assignments.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($division) {
                // Delete teaching assignments
                foreach ($division->teachingAssignments as $assignment) {
                    \App\Models\FeedbackForm::where('teaching_assignment_id', $assignment->id)->delete();
                    \App\Models\Timetable::where('teaching_assignment_id', $assignment->id)->delete();
                    $assignment->delete();
                }

                // Delete sections
                $division->sections()->delete();

                // Delete students
                foreach ($division->students as $student) {
                    $userAccount = $student->userAccount;
                    $student->delete();
                    if ($userAccount) {
                        $userAccount->delete();
                    }
                }

                $division->delete();
            });

            return response()->json([
                'message' => 'Division and all associated records deleted successfully'
            ], Response::HTTP_OK);
        }

        $division->delete();

        return response()->json([
            'message' => 'Division deleted successfully'
        ], Response::HTTP_OK);
    }

    public function sections(Request $request, Division $division): JsonResponse
    {
        $this->validateDepartmentAccess($request, $division->department_id);

        $sections = $division->sections()->get();

        return response()->json([
            'data' => SectionResource::collection($sections)
        ], Response::HTTP_OK);
    }
}
