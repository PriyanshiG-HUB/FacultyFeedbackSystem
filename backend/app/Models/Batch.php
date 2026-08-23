<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batch extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'batch';

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
        'department_id',
        'program_name',
        'batch_title',
        'admission_year',
        'graduation_year',
        'current_semester_id',
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
            'admission_year' => 'integer',
            'graduation_year' => 'integer',
        ];
    }

    /**
     * Get the department to which this graduation batch belongs.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the current semester of this graduation batch.
     */
    public function currentSemester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'current_semester_id', 'id');
    }

    /**
     * Get all divisions belonging to this batch.
     */
    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class, 'batch_id', 'id');
    }

    /**
     * Get all students belonging to this batch.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'batch_id', 'id');
    }

    /**
     * Get all subject offerings targeted to this batch.
     */
    public function subjectOfferings(): HasMany
    {
        return $this->hasMany(SubjectOffering::class, 'batch_id', 'id');
    }

    /**
     * Get all teaching assignments targeted to this batch.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'batch_id', 'id');
    }
}
