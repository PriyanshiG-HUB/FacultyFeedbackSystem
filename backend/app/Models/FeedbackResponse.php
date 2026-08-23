<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackResponse extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'feedback_response';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The name of the "updated at" column.
     *
     * @var string|null
     */
    public const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'feedback_form_id',
        'student_id',
        'overall_remark',
        'is_excluded',
        'excluded_by_user_account_id',
        'excluded_reason',
        'excluded_at',
        'submitted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_excluded' => 'boolean',
            'excluded_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Get the feedback form for which this response was submitted.
     */
    public function feedbackForm(): BelongsTo
    {
        return $this->belongsTo(FeedbackForm::class, 'feedback_form_id', 'id');
    }

    /**
     * Get the student who submitted this feedback response.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id', 'id');
    }

    /**
     * Get the admin user account who excluded this response (if moderated).
     */
    public function excludedByUserAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'excluded_by_user_account_id', 'id');
    }

    /**
     * Get all answers recorded within this response submission.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FeedbackAnswer::class, 'response_id', 'id');
    }
}
