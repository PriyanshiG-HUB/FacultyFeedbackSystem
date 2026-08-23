<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SystemSettingsResource;
use App\Models\SystemSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SystemSettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $deptId = $request->get('department_id');
        $settings = SystemSettings::where('department_id', $deptId)->first()
            ?? SystemSettings::whereNull('department_id')->first();

        if (!$settings) {
            $settings = SystemSettings::create([
                'department_id' => null,
                'rating_scale_min' => 1,
                'rating_scale_max' => 5,
                'min_responses_threshold' => 10,
                'enforce_anonymous_submissions' => true,
                'auto_publish_on_window_close' => false,
            ]);
        }

        return response()->json([
            'data' => new SystemSettingsResource($settings->load(['department', 'updatedByUserAccount']))
        ], Response::HTTP_OK);
    }

    public function update(Request $request, SystemSettings $systemSettings): JsonResponse
    {
        $validated = $request->validate([
            'rating_scale_min' => ['sometimes', 'required', 'integer', 'min:1'],
            'rating_scale_max' => ['sometimes', 'required', 'integer', 'gte:rating_scale_min'],
            'min_responses_threshold' => ['sometimes', 'required', 'integer', 'min:1'],
            'window_start_date' => ['nullable', 'date'],
            'window_end_date' => ['nullable', 'date', 'after_or_equal:window_start_date'],
            'enforce_anonymous_submissions' => ['sometimes', 'boolean'],
            'auto_publish_on_window_close' => ['sometimes', 'boolean'],
        ]);

        $validated['updated_by_user_account_id'] = $request->user()->id;

        $systemSettings->update($validated);

        return response()->json([
            'message' => 'System settings updated successfully',
            'data' => new SystemSettingsResource($systemSettings->fresh(['department', 'updatedByUserAccount']))
        ], Response::HTTP_OK);
    }
}
