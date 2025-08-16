import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SpeedChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <XAxis dataKey="ts" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                <YAxis unit="km/h" domain={[0, 'auto']} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
                <Line type="monotone" dataKey="speed_kmh" stroke="#2563eb" dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
