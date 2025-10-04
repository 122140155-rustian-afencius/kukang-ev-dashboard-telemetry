import LiveMap from '@/components/telemetry/LiveMap';
import AppShell from '@/layouts/AppShell';
import type { TelemetryPoint } from '@/types/telemetry';
import { useEffect, useState } from 'react';

interface Connection {
    bind: (event: string, cb: () => void) => void;
    unbind: (event: string, cb: () => void) => void;
}

export default function Maps() {
    const [latestPoint, setLatestPoint] = useState<TelemetryPoint | null>(null);
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
            const point: TelemetryPoint = {
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
                rpm_wheel: (payload.rpm_wheel as number) ?? null,
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
                heading: typeof payload.heading === 'number' ? (payload.heading as number) : null,
            };

            setLastDataTime(new Date().toISOString());

            // Update latest point jika ada koordinat valid
            if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) {
                setLatestPoint(point);
            }
        };
        channel.listen('TelemetryUpdated', handler);
        channel.listen('App\\Events\\TelemetryUpdated', handler as unknown as () => void);
        return () => {
            channel.stopListening('TelemetryUpdated');
            channel.stopListening('App\\Events\\TelemetryUpdated');
            window.Echo.leave('telemetry.kukang');
        };
    }, []);

    // Render map dengan LiveMap component
    return (
        <AppShell>
            <div className="flex w-full flex-1 flex-col gap-2 overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white p-2 sm:gap-3 sm:p-3 dark:border-neutral-700 dark:bg-neutral-900">
                {/* Header - Consistent with LiveDashboard */}
                <div className="flex flex-shrink-0 flex-col gap-3 rounded-xl border border-neutral-300 bg-slate-50 p-3 sm:p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                                <img src="/logo-kukang.png" alt="KUKANG Logo" className="h-full w-full object-contain" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base font-bold text-gray-800 sm:text-lg dark:text-white">IKU PROTO 3.0 TELEMETRY</h1>
                                <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-300">Real-time Monitoring System</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <div className="flex flex-col items-start sm:items-end">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">STATUS</span>
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

                {/* Map Card */}
                <div className="flex flex-1 flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                    {latestPoint && Number.isFinite(latestPoint.lat) && Number.isFinite(latestPoint.lng) ? (
                        <div className="relative h-full min-h-[500px] w-full overflow-hidden rounded-lg">
                            <LiveMap
                                lat={latestPoint.lat}
                                lng={latestPoint.lng}
                                heading={latestPoint.heading}
                                follow={true}
                                height="100%"
                                className="h-full w-full"
                            />
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900">
                            <div className="text-center">
                                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    />
                                </svg>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">Waiting for GPS data...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
