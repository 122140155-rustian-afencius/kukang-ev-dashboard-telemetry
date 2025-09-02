<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public $withinTransaction = false;

    public function up(): void
    {
        DB::unprepared(<<<'SQL'
-- Remove CAgg policies if exist
DO $$
BEGIN
  BEGIN PERFORM remove_continuous_aggregate_policy('telemetry_1s'); EXCEPTION WHEN others THEN END;
  BEGIN PERFORM remove_continuous_aggregate_policy('telemetry_10s'); EXCEPTION WHEN others THEN END;
END $$;

-- Drop CAggs to allow schema change
DROP MATERIALIZED VIEW IF EXISTS telemetry_10s CASCADE;
DROP MATERIALIZED VIEW IF EXISTS telemetry_1s CASCADE;

-- Drop dependent index and column
DROP INDEX IF EXISTS idx_telemetry_raw_vehicle_ts;
ALTER TABLE telemetry_raw DROP COLUMN IF EXISTS vehicle_id;

-- Recreate CAggs without vehicle dimension
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_1s
WITH (timescaledb.continuous)
AS
SELECT
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
GROUP BY bucket
WITH NO DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_10s
WITH (timescaledb.continuous)
AS
SELECT
  time_bucket('10 seconds', ts) AS bucket,
  avg(speed_kmh)  AS speed_kmh_avg,
  avg(current_a)  AS current_a_avg,
  avg(voltage_v)  AS voltage_v_avg
FROM telemetry_raw
GROUP BY bucket
WITH NO DATA;

-- Re-add policies
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
-- Remove CAgg policies if exist
DO $$
BEGIN
  BEGIN PERFORM remove_continuous_aggregate_policy('telemetry_1s'); EXCEPTION WHEN others THEN END;
  BEGIN PERFORM remove_continuous_aggregate_policy('telemetry_10s'); EXCEPTION WHEN others THEN END;
END $$;

-- Drop current CAggs
DROP MATERIALIZED VIEW IF EXISTS telemetry_10s CASCADE;
DROP MATERIALIZED VIEW IF EXISTS telemetry_1s CASCADE;

-- Re-add vehicle_id column and index
ALTER TABLE telemetry_raw ADD COLUMN IF NOT EXISTS vehicle_id TEXT;
-- Make it NOT NULL by filling default then setting constraint
UPDATE telemetry_raw SET vehicle_id = COALESCE(vehicle_id, 'vehicle-1');
ALTER TABLE telemetry_raw ALTER COLUMN vehicle_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_raw_vehicle_ts ON telemetry_raw (vehicle_id, ts DESC);

-- Recreate original CAggs with vehicle dimension
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

-- Re-add policies
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
};

