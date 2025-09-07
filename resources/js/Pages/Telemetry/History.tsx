import { useEffect, useState } from 'react';
import AppShell from '@/layouts/AppShell';
import TelemetryTable from '@/components/telemetry/TelemetryTable';
import type { TelemetryPoint } from '@/types/telemetry';

export default function HistoryPage() {
  const [rows, setRows] = useState<TelemetryPoint[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000); // last 1h
    const url = `/api/telemetry/history?resolution=raw&start=${encodeURIComponent(
      start.toISOString(),
    )}&end=${encodeURIComponent(end.toISOString())}`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { points: any[] }) => {
        const mapped: TelemetryPoint[] = (data.points ?? []).map((p) => ({
          ts: String(p.t ?? ''),
          lat: typeof p.lat === 'number' ? p.lat : Number.NaN,
          lng: typeof p.lng === 'number' ? p.lng : Number.NaN,
          speed_kmh: typeof p.speed === 'number' ? p.speed : Number.NaN,
          current_a: typeof p.current === 'number' ? p.current : Number.NaN,
          voltage_v: typeof p.voltage === 'number' ? p.voltage : Number.NaN,
          rpm_motor: typeof p.rpm_motor === 'number' ? p.rpm_motor : Number.NaN,
          suhu_esc: typeof p.esc_temp === 'number' ? p.esc_temp : Number.NaN,
          suhu_baterai: typeof p.batt_temp === 'number' ? p.batt_temp : Number.NaN,
          suhu_motor: typeof p.motor_temp === 'number' ? p.motor_temp : Number.NaN,
          rpm_wheel: null,
          acc_x: null,
          acc_y: null,
          acc_z: null,
          gyro_x: null,
          gyro_y: null,
          gyro_z: null,
        }));
        setRows(mapped.reverse());
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <AppShell>
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">History</h1>
        </div>
        <TelemetryTable rows={rows} />
      </div>
    </AppShell>
  );
}

