import { useMemo, useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import SpeedGauge from '@/components/telemetry/SpeedGauge';
import StatCard from '@/components/telemetry/StatCard';
import LiveMap from '@/components/telemetry/LiveMap';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { IconGauge, IconMap, IconBolt, IconTemperature, IconChevronLeft } from '@tabler/icons-react';
import { motion } from 'motion/react';

type TelemetryProps = {
  telemetry: {
    speed_kmh?: number;
    current_a?: number;
    suhu_esc?: number;
    lat?: number;
    lng?: number;
    current_history?: number[];
    suhu_esc_history?: number[];
  };
};

export default function Overview() {
  const { props } = usePage<TelemetryProps>();
  const t = props.telemetry ?? {};

  const speed = Number.isFinite(t.speed_kmh as number) ? (t.speed_kmh as number) : 0;
  const current = Number.isFinite(t.current_a as number) ? (t.current_a as number) : 0;
  const escTemp = Number.isFinite(t.suhu_esc as number) ? (t.suhu_esc as number) : 0;
  const lat = Number.isFinite(t.lat as number) ? (t.lat as number) : 0;
  const lng = Number.isFinite(t.lng as number) ? (t.lng as number) : 0;
  const currentHistory = useMemo(() => t.current_history ?? [], [t.current_history]);
  const escTempHistory = useMemo(() => t.suhu_esc_history ?? [], [t.suhu_esc_history]);

  // Optional: derive a dynamic max speed for nicer gauge scaling
  const [maxSpeed, setMaxSpeed] = useState(200);
  useEffect(() => {
    const target = Math.max(60, Math.ceil(Math.max(speed, 120) / 20) * 20);
    setMaxSpeed((prev) => (Math.abs(prev - target) > 20 ? target : prev));
  }, [speed]);

  const links = useMemo(
    () => [
      { label: 'Telemetry', href: '#', icon: <IconGauge className="h-5 w-5 text-neutral-200" /> },
      { label: 'Map', href: '#map', icon: <IconMap className="h-5 w-5 text-neutral-200" /> },
      { label: 'Current', href: '#current', icon: <IconBolt className="h-5 w-5 text-neutral-200" /> },
      { label: 'ESC Temp', href: '#esc-temp', icon: <IconTemperature className="h-5 w-5 text-neutral-200" /> },
      { label: 'Back', href: '/live', icon: <IconChevronLeft className="h-5 w-5 text-neutral-200" /> },
    ],
    []
  );

  return (
    <div className="flex h-screen w-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 md:flex-row">
      <Sidebar open={true} setOpen={() => {}}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-100">KUKANG EV — Live Telemetry</h1>
              <p className="text-xs text-neutral-400">Racing mode • Dark • ECharts</p>
            </div>
            <Link href="/live" className="text-xs text-neutral-400 underline">Go to Live Table</Link>
          </div>

          {/* Top Grid: Speed + KPIs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-1 md:col-span-2 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-medium tracking-wide text-neutral-300">Speed</h2>
                <span className="text-xs text-neutral-500">Max {maxSpeed} km/h</span>
              </div>
              <SpeedGauge value={speed} max={maxSpeed} />
            </div>

            <div className="col-span-1 flex flex-col gap-4">
              <div id="current">
                <StatCard title="Current" value={current} unit="A" trend={currentHistory} accent="blue" />
              </div>
              <div id="esc-temp">
                <StatCard title="ESC Temp" value={escTemp} unit="°C" trend={escTempHistory} accent="red" />
              </div>
            </div>
          </div>

          {/* Map */}
          <div id="map" className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-2">
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="text-sm font-medium tracking-wide text-neutral-300">Location</h2>
              <span className="text-xs text-neutral-500">Lat {lat.toFixed(5)} • Lng {lng.toFixed(5)}</span>
            </div>
            <LiveMap lat={lat} lng={lng} follow height={360} className="rounded-lg overflow-hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

const Logo = () => (
  <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal">
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-emerald-500" />
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium whitespace-pre text-neutral-100">
      KUKANG EV
    </motion.span>
  </a>
);

