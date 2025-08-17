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
}
