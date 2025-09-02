import { useEffect, useState } from 'react';
import SpeedChart from '../components/SpeedChart';
import CurrentChart from '../components/CurrentChart';
import VoltageChart from '../components/VoltageChart';
import TempChart from '../components/TempChart';
import TelemetryMap from '../components/TelemetryMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { TelemetryPoint } from '@/types/telemetry';

interface Connection {
    bind: (event: string, cb: () => void) => void;
    unbind: (event: string, cb: () => void) => void;
}

export default function LiveDashboard() {
    const [points, setPoints] = useState<TelemetryPoint[]>([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const connection = (window.Echo as unknown as {
            connector: { pusher: { connection: Connection } };
        }).connector.pusher.connection;
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
        const handler = (e: TelemetryPoint) => {
            setPoints((prev) => {
                const next = [...prev, e];
                if (next.length > 600) next.shift();
                return next;
            });
        };
        channel.listen('TelemetryUpdated', handler);
        return () => {
            channel.stopListening('TelemetryUpdated');
            window.Echo.leave('telemetry.kukang');
        };
    }, []);

    return (
        <div className="p-4 space-y-4">
            <nav className="flex items-center justify-between">
                <div className="space-x-4">
                    <a href="/live" className="font-semibold">
                        Live
                    </a>
                    <a href="/history" className="hover:underline">
                        History
                    </a>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${connected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {connected ? 'Connected' : 'Disconnected'}
                </span>
            </nav>
            {/* Single-vehicle setup: no vehicle selector */}
            <Tabs defaultValue="charts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                </TabsList>
                <TabsContent value="charts" className="space-y-4">
                    <SpeedChart data={points} />
                    <CurrentChart data={points} />
                    <VoltageChart data={points} />
                    <TempChart data={points} />
                </TabsContent>
                <TabsContent value="map">
                    <TelemetryMap points={points} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
