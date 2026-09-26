<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentReport extends Model
{
    use HasFactory;

    protected $table = 'incident_reports';

    protected $fillable = [
        'incident_number',
        'delivery_id',
        'reported_by',
        'incident_classification_id',
        'quantity_affected',
        'description',
        'evidence_photo',
        'status',
        'staff_remarks',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'quantity_affected' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Incident belongs to one delivery.
     */
    public function delivery(): BelongsTo
    {
        return $this->belongsTo(
            Delivery::class,
            'delivery_id'
        );
    }

    /**
     * Incident belongs to the user who reported it.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'reported_by'
        );
    }

    /**
     * Incident belongs to the user who reviewed it.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by'
        );
    }

    /**
     * Incident belongs to one classification.
     */
    public function classification(): BelongsTo
    {
        return $this->belongsTo(
            IncidentClassification::class,
            'incident_classification_id'
        );
    }
}

