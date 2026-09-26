<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_classifications', function (Blueprint $table) {
            $table->id();
            $table->string('incident_type')->unique();
            $table->string('department');
            $table->string('department_email');
            $table->boolean('quantity_required')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_classifications');
    }
};

	