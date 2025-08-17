import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TelemetryPoint } from '@/types/telemetry';

interface Props {
    data: TelemetryPoint[];
}

export default function TempChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <XAxis dataKey="ts" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                <YAxis unit="°C" domain={['auto', 'auto']} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
                <Line type="monotone" dataKey="suhu_esc" stroke="#f43f5e" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="suhu_baterai" stroke="#8b5cf6" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="suhu_motor" stroke="#0ea5e9" dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
