<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentClassificationRequest extends Model
{
    use HasFactory;

    protected $table = 'incident_classification_requests';

    protected $fillable = [
        'requested_by',
        'incident_type',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'admin_remarks',
        'created_classification_id',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'requested_by'
        );
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'reviewed_by'
        );
    }

    public function createdClassification(): BelongsTo
    {
        return $this->belongsTo(
            IncidentClassification::class,
            'created_classification_id'
        );
    }
}