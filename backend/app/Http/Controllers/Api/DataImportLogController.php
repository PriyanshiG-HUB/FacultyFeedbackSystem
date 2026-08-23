<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DataImportLogResource;
use App\Models\DataImportLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DataImportLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DataImportLog::with(['department', 'uploadedByUserAccount']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->get('department_id'));
        }

        $logs = $query->latest('uploaded_at')->get();

        return response()->json([
            'data' => DataImportLogResource::collection($logs)
        ], Response::HTTP_OK);
    }

    public function show(DataImportLog $dataImportLog): JsonResponse
    {
        return response()->json([
            'data' => new DataImportLogResource($dataImportLog->load(['department', 'uploadedByUserAccount']))
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['required', 'string', 'max:255'],
            'import_type' => ['required', 'in:STUDENT_ROSTER,FACULTY_SESSION_MAPPING,HISTORIC_FEEDBACK_METRICS,OTHER'],
            'department_id' => ['nullable', 'integer', 'exists:department,id'],
            'record_count' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:SUCCESS,FAILED,PROCESSING'],
            'error_log' => ['nullable', 'string'],
        ]);

        $validated['uploaded_by_user_account_id'] = $request->user()->id;
        $validated['uploaded_at'] = now();

        $log = DataImportLog::create($validated);

        return response()->json([
            'message' => 'Import log recorded successfully',
            'data' => new DataImportLogResource($log->load(['department', 'uploadedByUserAccount']))
        ], Response::HTTP_CREATED);
    }
}
