import type { TelemetryPoint } from '@/types/telemetry';
import { useMemo } from 'react';

type Props = {
  rows: TelemetryPoint[];
};

export default function TelemetryTable({ rows }: Props) {
  const headers = useMemo(
    () => [
      { key: 'ts', label: 'Timestamp' },
      { key: 'lat', label: 'Lat' },
      { key: 'lng', label: 'Lng' },
      { key: 'speed_kmh', label: 'Speed (km/h)' },
      { key: 'current_a', label: 'Current (A)' },
      { key: 'voltage_v', label: 'Voltage (V)' },
      { key: 'rpm_motor', label: 'RPM Motor' },
      { key: 'rpm_wheel', label: 'RPM Roda' },
      { key: 'acc_x', label: 'Acc X (m/s²)' },
      { key: 'acc_y', label: 'Acc Y (m/s²)' },
      { key: 'acc_z', label: 'Acc Z (m/s²)' },
      { key: 'gyro_x', label: 'Gyro X (°/s)' },
      { key: 'gyro_y', label: 'Gyro Y (°/s)' },
      { key: 'gyro_z', label: 'Gyro Z (°/s)' },
      { key: 'suhu_esc', label: 'ESC Temp (°C)' },
      { key: 'suhu_baterai', label: 'Batt Temp (°C)' },
      { key: 'suhu_motor', label: 'Motor Temp (°C)' },
    ],
    []
  );

  const format = (value: unknown) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      if (Number.isNaN(value)) return '-';
      return Number.isInteger(value) ? value : (value as number).toFixed(2);
    }
    return String(value);
  };

  return (
    <div className="overflow-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-secondary/60">
          <tr>
            {headers.map((h) => (
              <th key={h.key} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-3 text-center text-muted-foreground" colSpan={headers.length}>
                Waiting for telemetry...
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={`${row.ts}-${idx}`} className={idx % 2 ? 'bg-secondary/20' : undefined}>
                <td className="px-3 py-2 whitespace-nowrap">{format(row.ts)}</td>
                <td className="px-3 py-2">{format(row.lat)}</td>
                <td className="px-3 py-2">{format(row.lng)}</td>
                <td className="px-3 py-2">{format(row.speed_kmh)}</td>
                <td className="px-3 py-2">{format(row.current_a)}</td>
                <td className="px-3 py-2">{format(row.voltage_v)}</td>
                <td className="px-3 py-2">{format(row.rpm_motor)}</td>
                <td className="px-3 py-2">{format(row.rpm_wheel)}</td>
                <td className="px-3 py-2">{format(row.acc_x)}</td>
                <td className="px-3 py-2">{format(row.acc_y)}</td>
                <td className="px-3 py-2">{format(row.acc_z)}</td>
                <td className="px-3 py-2">{format(row.gyro_x)}</td>
                <td className="px-3 py-2">{format(row.gyro_y)}</td>
                <td className="px-3 py-2">{format(row.gyro_z)}</td>
                <td className="px-3 py-2">{format(row.suhu_esc)}</td>
                <td className="px-3 py-2">{format(row.suhu_baterai)}</td>
                <td className="px-3 py-2">{format(row.suhu_motor)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

