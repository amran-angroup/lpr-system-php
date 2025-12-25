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
        Schema::create('vehicle_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alarm_id')->nullable()->constrained('alarms')->onDelete('set null');
            $table->unsignedBigInteger('gate_id')->nullable(); // Will add foreign key when gates table is created
            $table->dateTime('timestamp');
            $table->string('license_plate')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->enum('direction', ['in', 'out'])->default('in');
            $table->string('image_path')->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->json('license_plate_coords')->nullable(); // {x, y, width, height}
            $table->string('plate_text')->nullable();
            $table->text('plate_image_base64')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('timestamp');
            $table->index('license_plate');
            $table->index(['gate_id', 'timestamp']);
            $table->index('vehicle_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_logs');
    }
};
