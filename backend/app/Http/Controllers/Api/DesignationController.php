<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DesignationResource;
use App\Models\Designation;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class DesignationController extends Controller
{
    public function index(): JsonResponse
    {
        $designations = Designation::where('status', 'ACTIVE')->get();

        return response()->json([
            'data' => DesignationResource::collection($designations)
        ], Response::HTTP_OK);
    }
}
