<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_histories', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | User who performed the action
            |--------------------------------------------------------------------------
            */
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Module
            |--------------------------------------------------------------------------
            |
            | deliveries
            | drivers
            | classifications
            | classification_requests
            | incidents
            |
            */
            $table->string('module');

            /*
            |--------------------------------------------------------------------------
            | Action
            |--------------------------------------------------------------------------
            |
            | registered
            | created
            | updated
            | deleted
            | approved
            | rejected
            | resolved
            | password_reset
            | status_changed
            |
            */
            $table->string('action');

            /*
            |--------------------------------------------------------------------------
            | Reference
            |--------------------------------------------------------------------------
            |
            | Example:
            | Driver #12
            | Incident #INC-001
            | Request #5
            | DR-00021
            |
            */
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Human-readable history message
            |--------------------------------------------------------------------------
            */
            $table->text('description');

            /*
            |--------------------------------------------------------------------------
            | Previous and new values
            |--------------------------------------------------------------------------
            |
            | Useful for things like:
            |
            | pending -> approved
            | open -> resolved
            |
            */
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */
            $table->index('module');
            $table->index('action');
            $table->index('reference_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_histories');
    }
};