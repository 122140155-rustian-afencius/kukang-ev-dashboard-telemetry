import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TelemetryPoint } from '@/types/telemetry';

interface Props {
    data: TelemetryPoint[];
}

export default function CurrentChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <XAxis dataKey="ts" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                <YAxis unit="A" domain={['auto', 'auto']} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
                <Line type="monotone" dataKey="current_a" stroke="#16a34a" dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
