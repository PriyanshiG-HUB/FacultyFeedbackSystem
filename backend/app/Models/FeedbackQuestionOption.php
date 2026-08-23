<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedbackQuestionOption extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'feedback_question_option';

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
        'question_id',
        'option_value',
        'option_label',
        'display_order',
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
        ];
    }

    /**
     * Get the question to which this option belongs.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestion::class, 'question_id', 'id');
    }

    /**
     * Get all feedback answers where this option was selected.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FeedbackAnswer::class, 'selected_option_id', 'id');
    }
}
