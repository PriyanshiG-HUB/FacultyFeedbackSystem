<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeachingAssignment extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'teaching_assignment';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'subject_id',
        'faculty_id',
        'batch_id',
        'division_id',
        'section_id',
        'academic_year_id',
        'semester_id',
        'status',
    ];

    /**
     * Get the subject assigned.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    /**
     * Get the faculty member assigned.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'id');
    }

    /**
     * Get the graduation batch targeted by this assignment.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');
    }

    /**
     * Get the division assigned (NULL if assignment applies to Entire Batch).
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_id', 'id');
    }

    /**
     * Get the section assigned (NULL if assignment applies to Entire Batch or Entire Division).
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id', 'id');
    }

    /**
     * Get the academic year of this teaching assignment.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'id');
    }

    /**
     * Get the semester of this teaching assignment.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'id');
    }

    /**
     * Get all feedback forms created for this teaching assignment.
     */
    public function feedbackForms(): HasMany
    {
        return $this->hasMany(FeedbackForm::class, 'teaching_assignment_id', 'id');
    }

    /**
     * Check if this assignment applies to the entire batch (no specific division/section).
     */
    public function isEntireBatch(): bool
    {
        return is_null($this->division_id) && is_null($this->section_id);
    }

    /**
     * Check if this assignment applies to an entire division (specific division, no specific section).
     */
    public function isEntireDivision(): bool
    {
        return !is_null($this->division_id) && is_null($this->section_id);
    }

    /**
     * Check if this assignment applies to a specific section (both division and section specified).
     */
    public function isSpecificSection(): bool
    {
        return !is_null($this->division_id) && !is_null($this->section_id);
    }
}
