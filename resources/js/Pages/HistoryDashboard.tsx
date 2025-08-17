import { useMemo, useState } from 'react';
import SpeedChart from '../components/SpeedChart';
import CurrentChart from '../components/CurrentChart';
import VoltageChart from '../components/VoltageChart';
import TempChart from '../components/TempChart';
import TelemetryMap from '../components/TelemetryMap';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import type { TelemetryPoint } from '@/types/telemetry';

interface ApiPoint {
    t: string;
    lat: number;
    lng: number;
    speed: number;
    current: number;
    voltage: number;
    rpm_motor: number;
    esc_temp: number;
    batt_temp: number;
    motor_temp: number;
}

export default function HistoryDashboard() {
    const [vehicleId, setVehicleId] = useState<string>('itera-01');
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [resolution, setResolution] = useState<string>('1s');
    const [points, setPoints] = useState<TelemetryPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const fetchData = async (): Promise<void> => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({ vehicle_id: vehicleId, resolution });
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            const res = await fetch(`/api/telemetry/history?${params.toString()}`);
            if (!res.ok) throw new Error('Request failed');
            const json = await res.json();
            const mapped: TelemetryPoint[] = json.points.map((p: ApiPoint) => ({
                ts: p.t,
                lat: p.lat,
                lng: p.lng,
                speed_kmh: p.speed,
                current_a: p.current,
                voltage_v: p.voltage,
                rpm_motor: p.rpm_motor,
                suhu_esc: p.esc_temp,
                suhu_baterai: p.batt_temp,
                suhu_motor: p.motor_temp,
            }));
            setPoints(mapped);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
        } finally {
            setLoading(false);
        }
    };

    interface Stat {
        min: number;
        max: number;
        avg: number;
    }

    const stats = useMemo(() => {
        const calc = (key: keyof TelemetryPoint): Stat => {
            const values = points.map((p) => p[key] as number).filter((v) => v !== null && v !== undefined);
            if (!values.length) {
                return { min: 0, max: 0, avg: 0 };
            }
            const sum = values.reduce((a, b) => a + b, 0);
            return { min: Math.min(...values), max: Math.max(...values), avg: sum / values.length };
        };
        return {
            speed_kmh: calc('speed_kmh'),
            current_a: calc('current_a'),
            voltage_v: calc('voltage_v'),
        };
    }, [points]);

    return (
        <div className="p-4 space-y-4">
            <nav className="flex items-center justify-between">
                <div className="space-x-4">
                    <a href="/live" className="hover:underline">
                        Live
                    </a>
                    <a href="/history" className="font-semibold">
                        History
                    </a>
                </div>
            </nav>
            <Card className="p-4 space-y-2">
                <div className="flex space-x-2 items-center">
                    <label htmlFor="vehicle" className="text-sm">
                        Vehicle
                    </label>
                    <select
                        id="vehicle"
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="border rounded p-1"
                    >
                        <option value="itera-01">itera-01</option>
                        <option value="itera-02">itera-02</option>
                    </select>
                    <input
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="border rounded p-1"
                    />
                    <input
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="border rounded p-1"
                    />
                    <select
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="border rounded p-1"
                    >
                        <option value="raw">raw</option>
                        <option value="1s">1s</option>
                        <option value="10s">10s</option>
                    </select>
                    <Button onClick={fetchData}>Load</Button>
                </div>
            </Card>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && points.length === 0 && <p>No data</p>}
            {!loading && points.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="p-4">
                            <p className="text-sm">Speed (km/h)</p>
                            <p className="text-xl">{stats.speed_kmh.avg.toFixed(1)}</p>
                            <p className="text-xs">min {stats.speed_kmh.min.toFixed(1)} / max {stats.speed_kmh.max.toFixed(1)}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm">Current (A)</p>
                            <p className="text-xl">{stats.current_a.avg.toFixed(1)}</p>
                            <p className="text-xs">min {stats.current_a.min.toFixed(1)} / max {stats.current_a.max.toFixed(1)}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm">Voltage (V)</p>
                            <p className="text-xl">{stats.voltage_v.avg.toFixed(1)}</p>
                            <p className="text-xs">min {stats.voltage_v.min.toFixed(1)} / max {stats.voltage_v.max.toFixed(1)}</p>
                        </Card>
                    </div>
                    <SpeedChart data={points} />
                    <CurrentChart data={points} />
                    <VoltageChart data={points} />
                    <TempChart data={points} />
                    <TelemetryMap points={points} />
                </div>
            )}
        </div>
    );
}
