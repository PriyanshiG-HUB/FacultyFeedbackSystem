<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'subject';

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
        'subject_code',
        'subject_name',
        'department_id',
        'semester_id',
        'course_type',
        'credits',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'credits' => 'float',
        ];
    }

    /**
     * Get the department offering this subject.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the semester in which this subject is taught.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'id');
    }

    /**
     * Get all subject offerings created for this subject (for elective subjects).
     */
    public function subjectOfferings(): HasMany
    {
        return $this->hasMany(SubjectOffering::class, 'subject_id', 'id');
    }

    /**
     * Get all teaching assignments for this subject.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'subject_id', 'id');
    }
}
