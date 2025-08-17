import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import type { TelemetryPoint } from '@/types/telemetry';

interface Props {
    points: TelemetryPoint[];
}

export default function TelemetryMap({ points }: Props) {
    const last = points[points.length - 1];
    const center: [number, number] = last ? [last.lat, last.lng] : [0, 0];
    const path: [number, number][] = points.map((p) => [p.lat, p.lng]);
    return (
        <MapContainer center={center} zoom={15} style={{ height: 300, width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {last && <Marker position={center} />}
            {path.length > 1 && <Polyline positions={path} color="#2563eb" />}
        </MapContainer>
    );
}
