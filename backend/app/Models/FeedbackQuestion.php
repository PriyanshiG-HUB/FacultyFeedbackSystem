<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackQuestion extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'feedback_question';

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
        'feedback_form_id',
        'category_id',
        'question_text',
        'question_type',
        'display_order',
        'is_required',
        'max_rating',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_required' => 'boolean',
            'max_rating' => 'integer',
        ];
    }

    /**
     * Get the feedback form to which this question belongs.
     */
    public function feedbackForm(): BelongsTo
    {
        return $this->belongsTo(FeedbackForm::class, 'feedback_form_id', 'id');
    }

    /**
     * Get the category to which this question belongs.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestionCategory::class, 'category_id', 'id');
    }

    /**
     * Get all options for this question (for choice type questions).
     */
    public function options(): HasMany
    {
        return $this->hasMany(FeedbackQuestionOption::class, 'question_id', 'id');
    }

    /**
     * Get all answers submitted for this question across responses.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FeedbackAnswer::class, 'question_id', 'id');
    }
}
