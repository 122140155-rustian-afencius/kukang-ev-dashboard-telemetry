import { ThemeProvider } from '@/components/theme-provider';
import { createInertiaApp } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import 'leaflet/dist/leaflet.css';
import Pusher from 'pusher-js';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '../css/app.css';

registerSW();

declare global {
    interface Window {
        Echo: Echo<'reverb'>;
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT),
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
});

createInertiaApp({
    title: (title) => (title ? `${title} - KUKANG EV ITERA` : 'KUKANG EV ITERA'),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider defaultTheme="system" storageKey="kukang-ev-theme">
                <App {...props} />
            </ThemeProvider>,
        );
    },
});
