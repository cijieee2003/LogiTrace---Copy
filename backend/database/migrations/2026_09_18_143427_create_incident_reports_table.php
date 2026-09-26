<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_reports', function (Blueprint $table) {
            $table->id();

            $table->string('incident_number')->unique();

            $table->foreignId('delivery_id')
                ->constrained('deliveries')
                ->cascadeOnDelete();

            $table->foreignId('reported_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('incident_classification_id')
                ->constrained('incident_classifications')
                ->restrictOnDelete();

            $table->unsignedInteger('quantity_affected')
                ->nullable();

            $table->text('description');

            $table->string('evidence_photo')
                ->nullable();

            $table->enum('status', [
                'open',
                'under_review',
                'resolved',
            ])->default('open');

            $table->text('staff_remarks')
                ->nullable();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('reviewed_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_reports');
    }
};
