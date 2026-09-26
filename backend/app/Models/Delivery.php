<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\IncidentReport;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'dr_number',
        'created_by',
        'driver_id',
        'recipient_name',
        'quantity_order',
        'delivery_address',
        'delivery_date',
        'status',
    ];

    protected $casts = [
        'delivery_date' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | CREATOR
    |--------------------------------------------------------------------------
    */

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DRIVER
    |--------------------------------------------------------------------------
    */

    public function driver(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'driver_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | INCIDENTS
    |--------------------------------------------------------------------------
    */

    public function incidents(): HasMany
    {
        return $this->hasMany(
            IncidentReport::class,
            'delivery_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS HISTORY
    |--------------------------------------------------------------------------
    */

    public function statusHistories(): HasMany
    {
        return $this->hasMany(
            DeliveryStatusHistory::class,
            'delivery_id'
        )->orderBy('changed_at');
    }

    public function incidentReports()
{
    return $this->hasMany(
        IncidentReport::class,
        'delivery_id'
    );
}
}