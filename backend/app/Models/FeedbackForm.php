<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackForm extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'feedback_form';

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
        'form_code',
        'title',
        'teaching_assignment_id',
        'window_start_date',
        'window_end_date',
        'is_anonymous',
        'is_published',
        'published_at',
        'status',
        'created_by_user_account_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'window_start_date' => 'date',
            'window_end_date' => 'date',
            'is_anonymous' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Get the teaching assignment for which this form is configured.
     */
    public function teachingAssignment(): BelongsTo
    {
        return $this->belongsTo(TeachingAssignment::class, 'teaching_assignment_id', 'id');
    }

    /**
     * Get the user account who created this feedback form.
     */
    public function createdByUserAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'created_by_user_account_id', 'id');
    }

    /**
     * Get all questions configured for this feedback form.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(FeedbackQuestion::class, 'feedback_form_id', 'id');
    }

    /**
     * Get all student responses submitted for this feedback form.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(FeedbackResponse::class, 'feedback_form_id', 'id');
    }
}
