<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IncidentClassification extends Model
{
    use HasFactory;

    protected $table = 'incident_classifications';

    protected $fillable = [
        'incident_type',
        'department',
        'department_email',
        'quantity_required',
    ];

    protected $casts = [
        'quantity_required' => 'boolean',
    ];

    public function incidentReports(): HasMany
    {
        return $this->hasMany(
            IncidentReport::class,
            'incident_classification_id'
        );
    }
}