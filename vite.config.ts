import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'Kukang EV Telemetry',
                short_name: 'Kukang EV',
                display: 'standalone',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                icons: [
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                ],
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^\/$/,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'root' },
                    },
                    {
                        urlPattern: /\/(live|history)/,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'pages' },
                    },
                    {
                        urlPattern: /\/api\/telemetry\/history/,
                        handler: 'NetworkFirst',
                        options: { cacheName: 'telemetry-history' },
                    },
                    {
                        urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\//,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'osm-tiles',
                            expiration: { maxEntries: 1000, maxAgeSeconds: 86400 },
                        },
                    },
                ],
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
