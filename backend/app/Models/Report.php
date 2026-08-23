<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'report';

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
        'title',
        'department_id',
        'academic_year_id',
        'term',
        'sample_size',
        'is_published',
        'pdf_file_path',
        'generated_by_user_account_id',
        'generated_at',
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
            'sample_size' => 'integer',
            'is_published' => 'boolean',
            'generated_at' => 'datetime',
        ];
    }

    /**
     * Get the department for which this report was generated (NULL if all-department).
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the academic year associated with this report.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'id');
    }

    /**
     * Get the user account who generated this report.
     */
    public function generatedByUserAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'generated_by_user_account_id', 'id');
    }
}
