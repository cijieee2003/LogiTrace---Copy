<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\DriverPasswordResetNotification;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',

        /*
        |--------------------------------------------------------------------------
        | Driver onboarding
        |--------------------------------------------------------------------------
        */

        'profile_completed',
        'password_changed',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',

            /*
            |--------------------------------------------------------------------------
            | Driver onboarding
            |--------------------------------------------------------------------------
            */

            'profile_completed' => 'boolean',
            'password_changed' => 'boolean',
        ];
    }

    /**
     * Send password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(
            new DriverPasswordResetNotification($token)
        );
    }

    /**
     * Staff relationship
     */
    public function staff()
    {
        return $this->hasMany(Staff::class);
    }

    /**
     * Driver relationship
     */
    public function driver()
    {
        return $this->hasOne(
            DriverInfo::class,
            'user_id'
        );
    }

    /**
     * Driver deliveries
     */
    public function deliveries()
    {
        return $this->hasMany(
            Delivery::class,
            'driver_id'
        );
    }

    /**
     * Driver information
     */
    public function driverInfo(): HasOne
    {
        return $this->hasOne(
            DriverInfo::class,
            'user_id'
        );
    }

    /**
     * Deliveries created by this user
     */
    public function createdDeliveries()
    {
        return $this->hasMany(
            Delivery::class,
            'created_by'
        );
    }

    /**
     * Incident reports
     */
    public function incidentReports()
    {
        return $this->hasMany(
            IncidentReport::class,
            'reported_by'
        );
    }

    /**
     * Reviewed incident reports
     */
    public function reviewedIncidentReports()
    {
        return $this->hasMany(
            IncidentReport::class,
            'reviewed_by'
        );
    }

    /**
     * Incident classification requests
     */
    public function incidentClassificationRequests(): HasMany
    {
        return $this->hasMany(
            IncidentClassificationRequest::class,
            'requested_by'
        );
    }
}