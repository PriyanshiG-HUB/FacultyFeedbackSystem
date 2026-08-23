<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubjectOffering extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'subject_offering';

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
        'subject_id',
        'batch_id',
        'academic_year_id',
        'enrollment_capacity',
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
            'enrollment_capacity' => 'integer',
        ];
    }

    /**
     * Get the subject associated with this offering.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    /**
     * Get the graduation batch to which this offering is targeted.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');
    }

    /**
     * Get the academic year of this subject offering.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'id');
    }

    /**
     * Get all student elective enrollments for this subject offering.
     */
    public function electiveEnrollments(): HasMany
    {
        return $this->hasMany(StudentElectiveEnrollment::class, 'subject_offering_id', 'id');
    }
}
