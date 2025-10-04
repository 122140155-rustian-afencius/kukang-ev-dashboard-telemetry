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

// Create custom arrow icon that rotates based on heading
function createArrowIcon(heading: number = 0): L.DivIcon {
    return L.divIcon({
        html: `
            <div style="transform: rotate(${heading}deg); transition: transform 0.3s ease-out;">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <defs>
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                            <feOffset dx="0" dy="2" result="offsetblur"/>
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3"/>
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <path 
                        d="M20 5 L30 35 L20 32 L10 35 Z" 
                        fill="#3B82F6" 
                        stroke="#1E40AF" 
                        stroke-width="2"
                        filter="url(#shadow)"
                    />
                    <circle cx="20" cy="20" r="3" fill="#1E40AF" />
                </svg>
            </div>
        `,
        className: 'custom-arrow-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
}

export default function LiveMap({ lat, lng, heading, follow = true, height = 340, className }: Props) {
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

        // Create marker with arrow icon
        const icon = createArrowIcon(heading ?? 0);
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
        const icon = createArrowIcon(heading ?? 0);
        markerRef.current.setIcon(icon);

        if (follow) mapRef.current.setView(pos);
    }, [lat, lng, heading, follow]);

    return <div ref={divRef} className={className} style={{ height }} />;
}
