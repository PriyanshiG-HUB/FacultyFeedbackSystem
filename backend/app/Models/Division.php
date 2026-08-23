<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'division';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'department_id',
        'batch_id',
        'semester_id',
        'division_code',
        'status',
    ];

    /**
     * Get the department to which this division belongs.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the graduation batch to which this division belongs.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');
    }

    /**
     * Get the semester to which this division belongs.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id', 'id');
    }

    /**
     * Get all sections under this division.
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'division_id', 'id');
    }

    /**
     * Get all students under this division.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'division_id', 'id');
    }

    /**
     * Get all teaching assignments specifically targeted to this division.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'division_id', 'id');
    }
}
