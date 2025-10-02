import L from 'leaflet';
import { useEffect, useRef } from 'react';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2x,
    iconUrl: marker,
    shadowUrl: markerShadow,
});

type Props = {
    lat: number;
    lng: number;
    follow?: boolean;
    height?: number | string;
    className?: string;
};

export default function LiveMap({ lat, lng, follow = true, height = 340, className }: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!divRef.current || mapRef.current) return;
        const map = L.map(divRef.current, { zoomControl: true, attributionControl: false }).setView([lat || 0, lng || 0], 16);
        mapRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        markerRef.current = L.marker([lat || 0, lng || 0]).addTo(map);
        const ro = new ResizeObserver(() => map.invalidateSize());
        ro.observe(divRef.current);
        return () => {
            ro.disconnect();
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, [lat, lng]);

    useEffect(() => {
        if (!mapRef.current || !markerRef.current) return;
        const pos: [number, number] = [lat || 0, lng || 0];
        markerRef.current.setLatLng(pos);
        if (follow) mapRef.current.setView(pos);
    }, [lat, lng, follow]);

    return <div ref={divRef} className={className} style={{ height }} />;
}
