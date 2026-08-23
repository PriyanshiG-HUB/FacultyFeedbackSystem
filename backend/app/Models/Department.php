<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Department extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'department';

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
        'department_code',
        'department_name',
        'hod_faculty_id',
        'status',
    ];

    /**
     * Get the HOD (Head of Department) Faculty member.
     */
    public function hodFaculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class, 'hod_faculty_id', 'id');
    }

    /**
     * Get all faculty members belonging to this department.
     */
    public function faculty(): HasMany
    {
        return $this->hasMany(Faculty::class, 'department_id', 'id');
    }

    /**
     * Get all graduation batches belonging to this department.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'department_id', 'id');
    }

    /**
     * Get all academic divisions belonging to this department.
     */
    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class, 'department_id', 'id');
    }

    /**
     * Get all students belonging to this department.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'department_id', 'id');
    }

    /**
     * Get all subjects belonging to this department.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'department_id', 'id');
    }

    /**
     * Get all reports generated for this department.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'department_id', 'id');
    }

    /**
     * Get all data import logs for this department.
     */
    public function dataImportLogs(): HasMany
    {
        return $this->hasMany(DataImportLog::class, 'department_id', 'id');
    }

    /**
     * Get the system settings override for this department (if set).
     */
    public function systemSettings(): HasOne
    {
        return $this->hasOne(SystemSettings::class, 'department_id', 'id');
    }
}
