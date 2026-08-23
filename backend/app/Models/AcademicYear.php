<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'academic_year';

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
        'year_code',
        'start_date',
        'end_date',
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
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * Get all subject offerings in this academic year.
     */
    public function subjectOfferings(): HasMany
    {
        return $this->hasMany(SubjectOffering::class, 'academic_year_id', 'id');
    }

    /**
     * Get all teaching assignments in this academic year.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'academic_year_id', 'id');
    }

    /**
     * Get all reports generated for this academic year.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'academic_year_id', 'id');
    }
}
