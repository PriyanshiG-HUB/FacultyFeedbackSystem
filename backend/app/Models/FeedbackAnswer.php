<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackAnswer extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'feedback_answer';

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
        'response_id',
        'question_id',
        'rating_value',
        'text_value',
        'selected_option_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating_value' => 'float',
        ];
    }

    /**
     * Get the feedback response to which this answer belongs.
     */
    public function response(): BelongsTo
    {
        return $this->belongsTo(FeedbackResponse::class, 'response_id', 'id');
    }

    /**
     * Get the question for which this answer was given.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestion::class, 'question_id', 'id');
    }

    /**
     * Get the selected option if this is a choice question answer.
     */
    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestionOption::class, 'selected_option_id', 'id');
    }
}
