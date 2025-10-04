import L from 'leaflet';
import { useEffect, useRef } from 'react';

type Props = {
    lat: number;
    lng: number;
    heading?: number | null;
    follow?: boolean;
    height?: number | string;
    className?: string;
};

function createKukangIcon(heading: number = 0): L.DivIcon {
    return L.divIcon({
        html: `
            <div style="transform: rotate(${heading}deg); transition: transform 0.3s ease-out; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                <img 
                    src="/map-point-kukang.png" 
                    alt="KUKANG" 
                    style="width: 60px; height: 60px; object-fit: contain;"
                />
            </div>
        `,
        className: 'custom-kukang-icon',
        iconSize: [60, 60],
        iconAnchor: [30, 30],
    });
}

export default function LiveMap({ lat, lng, heading, follow = true, height = 340, className }: Props) {
    const mapRef = useRef<L.Map | null>(null);
    const divRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!divRef.current || mapRef.current) return;
        const map = L.map(divRef.current, { zoomControl: true, attributionControl: false }).setView([lat || 0, lng || 0], 20);
        mapRef.current = map;
        L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 22,
            attribution: '&copy; Google',
        }).addTo(map);

        const icon = createKukangIcon(heading ?? 0);
        markerRef.current = L.marker([lat || 0, lng || 0], { icon }).addTo(map);

        const ro = new ResizeObserver(() => map.invalidateSize());
        ro.observe(divRef.current);
        return () => {
            ro.disconnect();
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!mapRef.current || !markerRef.current) return;
        const pos: [number, number] = [lat || 0, lng || 0];
        markerRef.current.setLatLng(pos);

        // Update icon with new heading
        const icon = createKukangIcon(heading ?? 0);
        markerRef.current.setIcon(icon);

        if (follow) mapRef.current.setView(pos);
    }, [lat, lng, heading, follow]);

    return <div ref={divRef} className={className} style={{ height }} />;
}
