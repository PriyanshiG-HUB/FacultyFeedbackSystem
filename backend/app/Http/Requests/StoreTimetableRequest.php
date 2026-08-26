<?php

namespace App\Http\Requests;

use App\Models\TeachingAssignment;
use App\Models\Timetable;
use Illuminate\Foundation\Http\FormRequest;

class StoreTimetableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teaching_assignment_id' => 'required|exists:teaching_assignment,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->has('start_time') && $this->has('end_time') && $this->has('day') && $this->has('teaching_assignment_id')) {
                $assignment = TeachingAssignment::find($this->teaching_assignment_id);
                if (!$assignment) return;

                $day = $this->day;
                $start = $this->start_time;
                $end = $this->end_time;
                $room = $this->room;

                // Find overlapping timetables for the same day (excluding INACTIVE)
                $overlaps = Timetable::with('teachingAssignment')
                    ->where('status', 'ACTIVE')
                    ->where('day', $day)
                    ->where('start_time', '<', $end)
                    ->where('end_time', '>', $start)
                    ->get();

                foreach ($overlaps as $overlap) {
                    $overlapAssignment = $overlap->teachingAssignment;
                    if (!$overlapAssignment) continue;

                    // 1. Faculty Conflict
                    if ($overlapAssignment->faculty_id === $assignment->faculty_id) {
                        $validator->errors()->add('faculty', 'The selected faculty member is already scheduled for this time slot.');
                        return;
                    }

                    // 2. Room Conflict (Case insensitive & trimmed)
                    $normalizedRoomInput = $room ? strtolower(trim($room)) : null;
                    $normalizedOverlapRoom = $overlap->room ? strtolower(trim($overlap->room)) : null;
                    
                    if ($normalizedRoomInput && $normalizedOverlapRoom === $normalizedRoomInput) {
                        $validator->errors()->add('room', 'The selected room is already booked for this time slot.');
                        return;
                    }

                    // 3. Division/Section Conflict
                    if ($overlapAssignment->batch_id === $assignment->batch_id) {
                        if ($overlapAssignment->isEntireBatch() || $assignment->isEntireBatch()) {
                            $validator->errors()->add('batch', 'The entire batch is already scheduled for this time slot.');
                            return;
                        }

                        if ($overlapAssignment->division_id === $assignment->division_id) {
                            if ($overlapAssignment->isEntireDivision() || $assignment->isEntireDivision()) {
                                $validator->errors()->add('division', 'The selected division is already scheduled for this time slot.');
                                return;
                            }

                            if ($overlapAssignment->section_id === $assignment->section_id) {
                                $validator->errors()->add('section', 'The selected section is already scheduled for this time slot.');
                                return;
                            }
                        }
                    }
                }
            }
        });
    }
}
