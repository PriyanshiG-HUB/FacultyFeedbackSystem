<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemSettings extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'system_settings';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The name of the "created at" column.
     *
     * @var string|null
     */
    public const CREATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'department_id',
        'rating_scale_min',
        'rating_scale_max',
        'min_responses_threshold',
        'window_start_date',
        'window_end_date',
        'enforce_anonymous_submissions',
        'auto_publish_on_window_close',
        'updated_by_user_account_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating_scale_min' => 'integer',
            'rating_scale_max' => 'integer',
            'min_responses_threshold' => 'integer',
            'window_start_date' => 'date',
            'window_end_date' => 'date',
            'enforce_anonymous_submissions' => 'boolean',
            'auto_publish_on_window_close' => 'boolean',
        ];
    }

    /**
     * Get the department for which these system settings apply (NULL if system-wide defaults).
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the user account who last updated these settings.
     */
    public function updatedByUserAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'updated_by_user_account_id', 'id');
    }
}
