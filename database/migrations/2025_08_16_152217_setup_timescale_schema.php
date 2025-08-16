<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    // Beberapa perintah (CAgg/policy) tidak boleh dalam transaksi
    public $withinTransaction = false;

    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS telemetry_raw (
  ts           TIMESTAMPTZ NOT NULL,
  vehicle_id   TEXT        NOT NULL,
  esc_temp     DOUBLE PRECISION,
  batt_temp    DOUBLE PRECISION,
  motor_temp   DOUBLE PRECISION,
  current_a    DOUBLE PRECISION,
  voltage_v    DOUBLE PRECISION,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  speed_kmh    DOUBLE PRECISION,
  rpm_motor    DOUBLE PRECISION,
  rpm_wheel    DOUBLE PRECISION,
  acc_x        DOUBLE PRECISION,
  acc_y        DOUBLE PRECISION,
  acc_z        DOUBLE PRECISION,
  gyro_x       DOUBLE PRECISION,
  gyro_y       DOUBLE PRECISION,
  gyro_z       DOUBLE PRECISION
);

-- Jadikan hypertable (idempotent)
SELECT create_hypertable('telemetry_raw', 'ts', if_not_exists => TRUE);

-- Index setelah hypertable agar ter-distribusi ke chunks
CREATE INDEX IF NOT EXISTS idx_telemetry_raw_ts ON telemetry_raw (ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_raw_vehicle_ts ON telemetry_raw (vehicle_id, ts DESC);

-- Continuous aggregate 1s (dibuat tanpa data awal agar boleh di luar transaksi)
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_1s
WITH (timescaledb.continuous)
AS
SELECT
  vehicle_id,
  time_bucket('1 second', ts) AS bucket,
  avg(esc_temp)   AS esc_temp_avg,
  avg(batt_temp)  AS batt_temp_avg,
  avg(motor_temp) AS motor_temp_avg,
  avg(current_a)  AS current_a_avg,
  avg(voltage_v)  AS voltage_v_avg,
  avg(speed_kmh)  AS speed_kmh_avg,
  avg(rpm_motor)  AS rpm_motor_avg,
  avg(rpm_wheel)  AS rpm_wheel_avg
FROM telemetry_raw
GROUP BY vehicle_id, bucket
WITH NO DATA;

-- Continuous aggregate 10s
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_10s
WITH (timescaledb.continuous)
AS
SELECT
  vehicle_id,
  time_bucket('10 seconds', ts) AS bucket,
  avg(speed_kmh)  AS speed_kmh_avg,
  avg(current_a)  AS current_a_avg,
  avg(voltage_v)  AS voltage_v_avg
FROM telemetry_raw
GROUP BY vehicle_id, bucket
WITH NO DATA;

-- Policies (scheduler untuk isi CAgg)
SELECT add_continuous_aggregate_policy('telemetry_1s',
  start_offset => INTERVAL '24 hours',
  end_offset   => INTERVAL '30 seconds',
  schedule_interval => INTERVAL '1 minute');

SELECT add_continuous_aggregate_policy('telemetry_10s',
  start_offset => INTERVAL '7 days',
  end_offset   => INTERVAL '1 minute',
  schedule_interval => INTERVAL '5 minutes');
SQL);
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
-- Bersihkan policy kalau ada (dibungkus DO agar tidak error jika tidak ada)
DO $$
BEGIN
  BEGIN
    PERFORM remove_continuous_aggregate_policy('telemetry_1s');
  EXCEPTION WHEN others THEN
    -- abaikan jika tidak ada
  END;
  BEGIN
    PERFORM remove_continuous_aggregate_policy('telemetry_10s');
  EXCEPTION WHEN others THEN
    -- abaikan jika tidak ada
  END;
END $$;

-- Drop CAgg (pakai CASCADE untuk dependensi internal)
DROP MATERIALIZED VIEW IF EXISTS telemetry_10s CASCADE;
DROP MATERIALIZED VIEW IF EXISTS telemetry_1s CASCADE;

-- Drop table
DROP TABLE IF EXISTS telemetry_raw;
-- Extension tidak perlu di-drop
SQL);
    }
};
