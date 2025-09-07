import LiveMap from '@/components/telemetry/LiveMap';
import SpeedGauge from '@/components/telemetry/SpeedGauge';
import StatCard from '@/components/telemetry/StatCard';
import AppShell from '@/layouts/AppShell';
import type { TelemetryPoint } from '@/types/telemetry';
import { useEffect, useMemo, useState } from 'react';

interface Connection {
    bind: (event: string, cb: () => void) => void;
    unbind: (event: string, cb: () => void) => void;
}

export default function LiveDashboard() {
    const [rows, setRows] = useState<TelemetryPoint[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const connection = (
            window.Echo as unknown as {
                connector: { pusher: { connection: Connection } };
            }
        ).connector.pusher.connection;
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
        connection.bind('connected', onConnect);
        connection.bind('disconnected', onDisconnect);
        return () => {
            connection.unbind('connected', onConnect);
            connection.unbind('disconnected', onDisconnect);
        };
    }, []);

    useEffect(() => {
        const channel = window.Echo.channel('telemetry.kukang');
        const handler = (e: unknown) => {
            const payload = e as Record<string, unknown>;
            const row: TelemetryPoint = {
                ts: String(payload.ts ?? ''),
                lat: typeof payload.lat === 'number' ? (payload.lat as number) : Number.NaN,
                lng: typeof payload.lng === 'number' ? (payload.lng as number) : Number.NaN,
                speed_kmh:
                    typeof payload.speed_kmh === 'number'
                        ? (payload.speed_kmh as number)
                        : typeof payload.kecepatan === 'number'
                          ? (payload.kecepatan as number)
                          : Number.NaN,
                current_a:
                    typeof payload.current_a === 'number'
                        ? (payload.current_a as number)
                        : typeof payload.arus === 'number'
                          ? (payload.arus as number)
                          : Number.NaN,
                voltage_v:
                    typeof payload.voltage_v === 'number'
                        ? (payload.voltage_v as number)
                        : typeof payload.tegangan === 'number'
                          ? (payload.tegangan as number)
                          : Number.NaN,
                rpm_motor: typeof payload.rpm_motor === 'number' ? (payload.rpm_motor as number) : Number.NaN,
                suhu_esc: typeof payload.suhu_esc === 'number' ? (payload.suhu_esc as number) : Number.NaN,
                suhu_baterai: typeof payload.suhu_baterai === 'number' ? (payload.suhu_baterai as number) : Number.NaN,
                suhu_motor: typeof payload.suhu_motor === 'number' ? (payload.suhu_motor as number) : Number.NaN,
                rpm_wheel: (payload.rpm_wheel as number) ?? (payload.rpm_wheel as number) ?? null,
                acc_x:
                    (payload.acc_x as number) ??
                    (typeof payload.accel === 'object' && payload.accel && typeof (payload.accel as Record<string, unknown>).x === 'number'
                        ? ((payload.accel as Record<string, unknown>).x as number)
                        : null),
                acc_y:
                    (payload.acc_y as number) ??
                    (typeof payload.accel === 'object' && payload.accel && typeof (payload.accel as Record<string, unknown>).y === 'number'
                        ? ((payload.accel as Record<string, unknown>).y as number)
                        : null),
                acc_z:
                    (payload.acc_z as number) ??
                    (typeof payload.accel === 'object' && payload.accel && typeof (payload.accel as Record<string, unknown>).z === 'number'
                        ? ((payload.accel as Record<string, unknown>).z as number)
                        : null),
                gyro_x:
                    (payload.gyro_x as number) ??
                    (typeof payload.gyro === 'object' && payload.gyro && typeof (payload.gyro as Record<string, unknown>).x === 'number'
                        ? ((payload.gyro as Record<string, unknown>).x as number)
                        : null),
                gyro_y:
                    (payload.gyro_y as number) ??
                    (typeof payload.gyro === 'object' && payload.gyro && typeof (payload.gyro as Record<string, unknown>).y === 'number'
                        ? ((payload.gyro as Record<string, unknown>).y as number)
                        : null),
                gyro_z:
                    (payload.gyro_z as number) ??
                    (typeof payload.gyro === 'object' && payload.gyro && typeof (payload.gyro as Record<string, unknown>).z === 'number'
                        ? ((payload.gyro as Record<string, unknown>).z as number)
                        : null),
            };
            setRows((prev) => {
                const next = [row, ...prev];
                const MAX = 1000;
                return next.length > MAX ? next.slice(0, MAX) : next;
            });
        };
        channel.listen('TelemetryUpdated', handler);
        channel.listen('App\\Events\\TelemetryUpdated', handler as unknown as () => void);
        return () => {
            channel.stopListening('TelemetryUpdated');
            channel.stopListening('App\\Events\\TelemetryUpdated');
            window.Echo.leave('telemetry.kukang');
        };
    }, []);

    const latest = rows[0];
    const speed = Number.isFinite(latest?.speed_kmh) ? (latest!.speed_kmh as number) : 0;
    const current = Number.isFinite(latest?.current_a) ? (latest!.current_a as number) : 0;
    const escTemp = Number.isFinite(latest?.suhu_esc) ? (latest!.suhu_esc as number) : 0;
    const lat = Number.isFinite(latest?.lat) ? (latest!.lat as number) : 0;
    const lng = Number.isFinite(latest?.lng) ? (latest!.lng as number) : 0;
    const currentHistory = useMemo(
        () =>
            rows
                .slice(0, 60)
                .map((r) => r.current_a)
                .reverse()
                .filter((v) => Number.isFinite(v)),
        [rows],
    );
    const escTempHistory = useMemo(
        () =>
            rows
                .slice(0, 60)
                .map((r) => r.suhu_esc)
                .reverse()
                .filter((v) => Number.isFinite(v)),
        [rows],
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
        <AppShell>
            <div className="flex h-screen w-full flex-1 flex-col gap-3 overflow-hidden rounded-tl-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between">
                    <h1 className="text-lg font-semibold">Live Telemetry</h1>
                    <div className="flex items-center gap-2">
                        <span className={`rounded px-2 py-1 text-xs ${connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                        <button onClick={() => setRows([])} className="rounded border px-2 py-1 text-xs hover:bg-secondary" title="Clear rows">
                            Clear
                        </button>
                    </div>
                </div>

                {/* First Row: 3 columns - Current, Speed (center), ESC Temp */}
                <div className="grid flex-shrink-0 grid-cols-3 gap-4" style={{ height: '35vh' }}>
                    {/* Current Card */}
                    <div className="col-span-1">
                        <StatCard title="Current" value={current} unit="A" trend={currentHistory as number[]} accent="blue" />
                    </div>

                    {/* Speed Gauge (Center) */}
                    <div className="col-span-1 flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/70">
                        <div className="flex flex-1 items-center justify-center">
                            <SpeedGauge value={speed} />
                        </div>
                    </div>

                    {/* ESC Temp Card */}
                    <div className="col-span-1">
                        <StatCard title="ESC Temp" value={escTemp} unit="°C" trend={escTempHistory as number[]} accent="red" />
                    </div>
                </div>

                {/* Second Row: Map spanning full width */}
                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-neutral-800 bg-neutral-950/70 p-2">
                    <div className="min-h-0 flex-1">
                        <LiveMap lat={lat} lng={lng} follow height="100%" className="h-full overflow-hidden rounded-lg" />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

// Sidebar branding moved to AppShell for a unified layout
