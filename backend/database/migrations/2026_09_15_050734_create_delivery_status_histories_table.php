<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('delivery_status_histories', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | DELIVERY
            |--------------------------------------------------------------------------
            */

            $table->foreignId('delivery_id')
                ->constrained('deliveries')
                ->cascadeOnDelete();


            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            |
            | Example:
            | pick_up
            | arrival
            | queueing
            | unloading
            | checking
            | delivered
            |
            */

            $table->string('status', 50);


            /*
            |--------------------------------------------------------------------------
            | USER WHO CHANGED THE STATUS
            |--------------------------------------------------------------------------
            */

            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();


            /*
            |--------------------------------------------------------------------------
            | EXACT DATE AND TIME
            |--------------------------------------------------------------------------
            |
            | This is the actual moment the driver clicked the button.
            |
            */

            $table->timestamp('changed_at');


            $table->timestamps();


            /*
            |--------------------------------------------------------------------------
            | INDEXES
            |--------------------------------------------------------------------------
            */

            $table->index([
                'delivery_id',
                'status',
            ]);

            $table->index('changed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_status_histories');
    }
};

