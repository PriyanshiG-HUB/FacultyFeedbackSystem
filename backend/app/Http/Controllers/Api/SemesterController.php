<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SemesterResource;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class SemesterController extends Controller
{
    public function index(): JsonResponse
    {
        $semesters = Semester::orderBy('id')->get();

        return response()->json([
            'data' => SemesterResource::collection($semesters)
        ], Response::HTTP_OK);
    }
}
