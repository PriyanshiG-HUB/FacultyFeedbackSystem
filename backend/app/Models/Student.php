<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'student';

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
        'roll_no',
        'enrollment_no',
        'full_name',
        'email',
        'mobile',
        'department_id',
        'batch_id',
        'division_id',
        'section_id',
        'status',
    ];

    /**
     * Get the user account associated with this student.
     */
    public function userAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'user_account_id', 'id');
    }

    /**
     * Get the department to which this student belongs.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the graduation batch to which this student belongs.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');
    }

    /**
     * Get the division to which this student belongs.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_id', 'id');
    }

    /**
     * Get the section to which this student belongs.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id', 'id');
    }

    /**
     * Get all elective subject enrollments for this student.
     */
    public function electiveEnrollments(): HasMany
    {
        return $this->hasMany(StudentElectiveEnrollment::class, 'student_id', 'id');
    }

    /**
     * Get all feedback responses submitted by this student.
     */
    public function feedbackResponses(): HasMany
    {
        return $this->hasMany(FeedbackResponse::class, 'student_id', 'id');
    }
}
