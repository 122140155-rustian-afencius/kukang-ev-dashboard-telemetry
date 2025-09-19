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
    const [dataActive, setDataActive] = useState(false);
    const [lastDataTime, setLastDataTime] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (lastDataTime) {
                const now = new Date();
                const lastTime = new Date(lastDataTime);
                const diffSeconds = (now.getTime() - lastTime.getTime()) / 1000;
                setDataActive(diffSeconds <= 5);
            } else {
                setDataActive(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastDataTime]);

    useEffect(() => {
        const statusChannel = window.Echo.channel('telemetry.status');
        const statusHandler = (e: unknown) => {
            const payload = e as Record<string, unknown>;
            if (payload.status === 'active') {
                setDataActive(true);
                setLastDataTime(payload.last_data_time as string);
            } else {
                setDataActive(false);
            }
        };

        statusChannel.listen('TelemetryStatusUpdated', statusHandler);
        statusChannel.listen('App\\Events\\TelemetryStatusUpdated', statusHandler as unknown as () => void);

        return () => {
            statusChannel.stopListening('TelemetryStatusUpdated');
            statusChannel.stopListening('App\\Events\\TelemetryStatusUpdated');
            window.Echo.leave('telemetry.status');
        };
    }, []);

    useEffect(() => {
        fetch('/api/telemetry/status')
            .then((response) => response.json())
            .then((data) => {
                setDataActive(data.is_active);
                if (data.last_data_time) {
                    setLastDataTime(data.last_data_time);
                }
            })
            .catch(console.error);
    }, []);

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

            // Update last data time when new telemetry data is received
            setLastDataTime(new Date().toISOString());

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

    return (
        <AppShell>
            <div className="flex h-screen w-full flex-1 flex-col gap-2 overflow-hidden rounded-tl-2xl border border-neutral-200 bg-white p-2 sm:gap-3 sm:p-3 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="dark:to-neutral-850 flex flex-shrink-0 flex-col gap-3 rounded-xl border border-neutral-300 bg-gradient-to-r from-slate-50 to-slate-100 p-3 sm:p-4 dark:border-neutral-700 dark:from-neutral-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                                <img src="/logo-kukang.png" alt="KUKANG Logo" className="h-full w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base font-bold text-gray-800 sm:text-lg dark:text-white">IKU PROTO 3.0 TELEMETRY</h1>
                                <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">Real-time Vehicle Monitoring System</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <div className="flex flex-col items-start sm:items-end">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">DATA STREAM</span>
                                <span className={`text-sm font-bold ${connected && dataActive ? 'text-green-600' : 'text-red-600'}`}>
                                    {connected && dataActive ? 'LIVE' : 'OFFLINE'}
                                </span>
                            </div>
                            <div
                                className={`h-3 w-3 flex-shrink-0 rounded-full ${connected && dataActive ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-shrink-0 flex-col gap-2 sm:gap-4 lg:grid lg:grid-cols-8">
                    <div className="order-1 flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/70 lg:order-2 lg:col-span-2">
                        <div className="-mb-13 flex min-h-[120px] flex-1 items-center justify-center p-1 sm:min-h-[140px]">
                            <SpeedGauge value={speed} />
                        </div>
                    </div>

                    <div className="order-2 lg:order-1 lg:col-span-3">
                        <StatCard title="Current" value={current} unit="A" trend={currentHistory as number[]} accent="blue" />
                    </div>

                    <div className="order-3 lg:order-3 lg:col-span-3">
                        <StatCard title="ESC Temp" value={escTemp} unit="°C" trend={escTempHistory as number[]} accent="red" />
                    </div>
                </div>

                <div className="z-20 flex min-h-0 flex-1 flex-col rounded-xl border border-neutral-800 bg-neutral-950/70 p-1 sm:p-2">
                    <div className="min-h-[250px] flex-1 md:min-h-[300px]">
                        <LiveMap lat={lat} lng={lng} follow height="100%" className="h-full overflow-hidden rounded-lg" />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
