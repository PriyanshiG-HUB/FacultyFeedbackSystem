<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Faculty extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'faculty';

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
        'user_account_id',
        'employee_code',
        'full_name',
        'email',
        'mobile',
        'department_id',
        'designation_id',
        'joining_date',
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
            'joining_date' => 'date',
        ];
    }

    /**
     * Get the user account associated with this faculty member.
     */
    public function userAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'user_account_id', 'id');
    }

    /**
     * Get the department associated with this faculty member.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the designation of this faculty member.
     */
    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class, 'designation_id', 'id');
    }

    /**
     * Get all teaching assignments for this faculty member.
     */
    public function teachingAssignments(): HasMany
    {
        return $this->hasMany(TeachingAssignment::class, 'faculty_id', 'id');
    }
}
