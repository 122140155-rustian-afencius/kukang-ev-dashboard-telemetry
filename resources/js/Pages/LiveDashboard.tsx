import type { TelemetryPoint } from '@/types/telemetry';
import { useEffect, useMemo, useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { IconArrowLeft, IconBrandTabler, IconSettings, IconUserBolt } from '@tabler/icons-react';
import { motion } from 'motion/react';

interface Connection {
    bind: (event: string, cb: () => void) => void;
    unbind: (event: string, cb: () => void) => void;
}

export default function LiveDashboard() {
    const [rows, setRows] = useState<TelemetryPoint[]>([]);
    const [connected, setConnected] = useState(false);
    const [open, setOpen] = useState(false);

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
        [],
    );

    const format = (value: unknown) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'number') {
            if (Number.isNaN(value)) return '-';
            return Number.isInteger(value) ? value : (value as number).toFixed(2);
        }
        return String(value);
    };

    const links = useMemo(
        () => [
            {
                label: 'Dashboard',
                href: '#',
                icon: (
                    <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: 'Profile',
                href: '#',
                icon: (
                    <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: 'Settings',
                href: '#',
                icon: (
                    <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: 'Logout',
                href: '#',
                icon: (
                    <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
        ],
        []
    );

    return (
        <div
            className={
                'flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800 h-screen'
            }
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: 'Technical Manager',
                                href: '#',
                                icon: (
                                    <img
                                        src="https://assets.aceternity.com/manu.png"
                                        className="h-7 w-7 shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            <div className="flex flex-1">
                <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold">Live Telemetry</h1>
                        <div className="flex items-center gap-2">
                            <span
                                className={`rounded px-2 py-1 text-xs ${connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                            >
                                {connected ? 'Connected' : 'Disconnected'}
                            </span>
                            <button
                                onClick={() => setRows([])}
                                className="rounded border px-2 py-1 text-xs hover:bg-secondary"
                                title="Clear rows"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="overflow-auto rounded border">
                        <table className="min-w-full text-sm">
                            <thead className="bg-secondary/60">
                                <tr>
                                    {headers.map((h) => (
                                        <th
                                            key={h.key}
                                            className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                                        >
                                            {h.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            className="px-3 py-3 text-center text-muted-foreground"
                                            colSpan={headers.length}
                                        >
                                            Waiting for telemetry...
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr
                                            key={`${row.ts}-${idx}`}
                                            className={idx % 2 ? 'bg-secondary/20' : undefined}
                                        >
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
                </div>
            </div>
        </div>
    );
}

export const Logo = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-black dark:text-white"
            >
                KUKANG EV ITERA
            </motion.span>
        </a>
    );
};

export const LogoIcon = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
        </a>
    );
};
