<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'division_id' => $this->division_id,
            'section_code' => $this->section_code,
            'status' => $this->status,
            'students_count' => $this->whenCounted('students'),
            'division' => new DivisionResource($this->whenLoaded('division')),
        ];
    }
}
