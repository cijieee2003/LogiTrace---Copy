<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Staff extends Model
{
    //
    use HasFactory;

    protected $table = "staff";

    protected $fillable = [
        'user_id',
        
        'assign',
    ];

   public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function deliveries()
{
    return $this->hasMany(Delivery::class, 'driver_id');
}

    
}
