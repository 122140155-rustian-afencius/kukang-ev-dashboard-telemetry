export interface TelemetryPoint {
    ts: string;
    lat: number;
    lng: number;
    speed_kmh: number;
    current_a: number;
    voltage_v: number;
    rpm_motor: number;
    suhu_esc: number;
    suhu_baterai: number;
    suhu_motor: number;
    // Optional fields for extended telemetry
    rpm_wheel?: number | null;
    acc_x?: number | null;
    acc_y?: number | null;
    acc_z?: number | null;
    gyro_x?: number | null;
    gyro_y?: number | null;
    gyro_z?: number | null;
}
