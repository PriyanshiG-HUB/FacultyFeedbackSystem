<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Designation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'designation';

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
        'designation_name',
        'status',
    ];

    /**
     * Get all faculty members with this designation.
     */
    public function faculty(): HasMany
    {
        return $this->hasMany(Faculty::class, 'designation_id', 'id');
    }
}
