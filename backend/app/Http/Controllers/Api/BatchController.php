<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BatchResource;
use App\Http\Resources\DivisionResource;
use App\Models\Batch;
use App\Traits\AuthorizesDepartmentScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class BatchController extends Controller
{
    use AuthorizesDepartmentScope;

    public function index(Request $request): JsonResponse
    {
        $query = Batch::with(['department', 'currentSemester'])->withCount('students');

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            $query->where('department_id', $hodDeptId);
        } elseif ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        $batches = $query->get();

        return response()->json([
            'data' => BatchResource::collection($batches)
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => ['required', 'integer', 'exists:department,id'],
            'program_name' => ['required', 'string', 'max:100'],
            'batch_title' => ['required', 'string', 'max:150'],
            'admission_year' => ['required', 'integer'],
            'graduation_year' => ['required', 'integer', 'gte:admission_year'],
            'current_semester_id' => ['nullable', 'integer', 'exists:semester,id'],
            'status' => ['nullable', 'in:ACTIVE,GRADUATED,DISCONTINUED'],
        ]);

        $hodDeptId = $this->getAuthorizedDepartmentId($request);
        if ($hodDeptId !== null) {
            if ((int)$validated['department_id'] !== $hodDeptId) {
                abort(Response::HTTP_FORBIDDEN, 'Forbidden: You cannot create a batch for another department.');
            }
        }

        $batch = Batch::create($validated);

        return response()->json([
            'message' => 'Batch created successfully',
            'data' => new BatchResource($batch->load(['department', 'currentSemester']))
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Batch $batch): JsonResponse
    {
        $this->validateDepartmentAccess($request, $batch->department_id);

        return response()->json([
            'data' => new BatchResource($batch->load(['department', 'currentSemester']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, Batch $batch): JsonResponse
    {
        $this->validateDepartmentAccess($request, $batch->department_id);

        $validated = $request->validate([
            'department_id' => ['sometimes', 'required', 'integer', 'exists:department,id'],
            'program_name' => ['sometimes', 'required', 'string', 'max:100'],
            'batch_title' => ['sometimes', 'required', 'string', 'max:150'],
            'admission_year' => ['sometimes', 'required', 'integer'],
            'graduation_year' => ['sometimes', 'required', 'integer'],
            'current_semester_id' => ['nullable', 'integer', 'exists:semester,id'],
            'status' => ['sometimes', 'in:ACTIVE,GRADUATED,DISCONTINUED'],
        ]);

        if (isset($validated['department_id'])) {
            $this->validateDepartmentAccess($request, (int)$validated['department_id']);
        }

        $batch->update($validated);

        return response()->json([
            'message' => 'Batch updated successfully',
            'data' => new BatchResource($batch->fresh(['department', 'currentSemester']))
        ], Response::HTTP_OK);
    }

    public function destroy(Request $request, Batch $batch): JsonResponse
    {
        $this->validateDepartmentAccess($request, $batch->department_id);

        $hasDependencies = $batch->divisions()->exists() || $batch->students()->exists() || $batch->teachingAssignments()->exists();

        if ($hasDependencies) {
            if (!$request->boolean('cascade')) {
                return response()->json([
                    'message' => 'Cannot delete batch with active divisions, students, or teaching assignments.',
                    'has_dependencies' => true
                ], Response::HTTP_CONFLICT);
            }

            DB::transaction(function () use ($batch) {
                // Delete teaching assignments
                foreach ($batch->teachingAssignments as $assignment) {
                    \App\Models\FeedbackForm::where('teaching_assignment_id', $assignment->id)->delete();
                    \App\Models\Timetable::where('teaching_assignment_id', $assignment->id)->delete();
                    $assignment->delete();
                }

                // Delete divisions & sections
                foreach ($batch->divisions as $division) {
                    $division->sections()->delete();
                    $division->delete();
                }

                // Delete students
                foreach ($batch->students as $student) {
                    $userAccount = $student->userAccount;
                    $student->delete();
                    if ($userAccount) {
                        $userAccount->delete();
                    }
                }

                $batch->delete();
            });

            return response()->json([
                'message' => 'Batch and all associated records deleted successfully'
            ], Response::HTTP_OK);
        }

        $batch->delete();

        return response()->json([
            'message' => 'Batch deleted successfully'
        ], Response::HTTP_OK);
    }

    public function divisions(Request $request, Batch $batch): JsonResponse
    {
        $this->validateDepartmentAccess($request, $batch->department_id);

        $divisions = $batch->divisions()->with(['department', 'semester', 'sections'])->get();

        return response()->json([
            'data' => DivisionResource::collection($divisions)
        ], Response::HTTP_OK);
    }
}
