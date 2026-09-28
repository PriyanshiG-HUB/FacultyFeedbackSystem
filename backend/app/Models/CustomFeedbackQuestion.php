<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomFeedbackQuestion extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'custom_feedback_questions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question',
        'category',
        'category_id',
        'question_type',
        'options',
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
            'options' => 'array',
        ];
    }

    /**
     * Get the user account who created/imported this custom question.
     */
    public function createdByUserAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'created_by_user_account_id', 'id');
    }

    /**
     * Get the referenced category if assigned.
     */
    public function categoryRef(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestionCategory::class, 'category_id', 'id');
    }
}
