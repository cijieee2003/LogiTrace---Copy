<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverInfo extends Model
{
    use HasFactory;

    protected $table = 'driver_infos';

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'birth_date',
        'age',
        'gender',
        'address',
        'contact_number',
        'license_number',
        'license_expiration',
        'truck_plate_number',
        'truck_name',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'license_expiration' => 'date',
        'age' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | DriverInfo belongs to User
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | FULL NAME
    |--------------------------------------------------------------------------
    */

    // public function getFullNameAttribute()
    // {
    //     return collect([
    //         $this->first_name,
    //         $this->middle_name,
    //         $this->last_name,
    //     ])
    //     ->filter(function ($value) {
    //         return !is_null($value) && trim($value) !== '';
    //     })
    //     ->implode(' ');
    // }
}

