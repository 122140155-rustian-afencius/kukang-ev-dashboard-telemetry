<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
            ALTER TABLE telemetry_raw ADD COLUMN IF NOT EXISTS heading DOUBLE PRECISION;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared(<<<'SQL'
            ALTER TABLE telemetry_raw DROP COLUMN IF EXISTS heading;
        SQL);
    }
};
