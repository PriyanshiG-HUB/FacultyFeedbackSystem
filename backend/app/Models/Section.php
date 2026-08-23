<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'section';

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
        'division_id',
        'section_code',
        'status',
    ];

    /**
     * Get the division to which this section belongs.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_id', 'id');
    }

    /**
     * Get all students assigned to this section.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'section_id', 'id');
    }

    /**
     * Get all teaching assignments specifically targeted to this section.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'section_id', 'id');
    }
}
