
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_classification_requests', function (Blueprint $table) {
            $table->id();

            // User who submitted the request
            $table->foreignId('requested_by');

            $table->string('incident_type');

            $table->text('reason');

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
            ])->default('pending');

            // Admin who reviewed the request
            $table->foreignId('reviewed_by')
                ->nullable();

            $table->timestamp('reviewed_at')
                ->nullable();

            $table->text('admin_remarks')
                ->nullable();

            /*
             * When the admin approves the request,
             * this points to the newly created official
             * incident classification.
             */
            $table->foreignId('created_classification_id')
                ->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('requested_by');

            /*
             * Foreign keys with explicitly shortened names.
             * This avoids MySQL's 64-character identifier limit.
             */
            $table->foreign('requested_by', 'icr_requested_by_fk')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('reviewed_by', 'icr_reviewed_by_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign(
                'created_classification_id',
                'icr_created_classification_fk'
            )
                ->references('id')
                ->on('incident_classifications')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_classification_requests');
    }
};

