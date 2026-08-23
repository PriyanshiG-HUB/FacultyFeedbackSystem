<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'semester';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

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
        'id',
        'semester_no',
        'term',
    ];

    /**
     * Get all graduation batches currently in this semester.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'current_semester_id', 'id');
    }

    /**
     * Get all divisions belonging to this semester.
     */
    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class, 'semester_id', 'id');
    }

    /**
     * Get all subjects assigned to this semester.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'semester_id', 'id');
    }

    /**
     * Get all teaching assignments for this semester.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'semester_id', 'id');
    }
}
