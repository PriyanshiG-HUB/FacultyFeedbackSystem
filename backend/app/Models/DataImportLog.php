<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataImportLog extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'data_import_log';

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
        'file_name',
        'import_type',
        'department_id',
        'uploaded_by_user_account_id',
        'record_count',
        'status',
        'error_log',
        'uploaded_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'record_count' => 'integer',
            'uploaded_at' => 'datetime',
        ];
    }

    /**
     * Get the department associated with this import log.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id', 'id');
    }

    /**
     * Get the user account who uploaded/initiated this data import.
     */
    public function uploadedByUserAccount(): BelongsTo
    {
        return $this->belongsTo(UserAccount::class, 'uploaded_by_user_account_id', 'id');
    }
}
