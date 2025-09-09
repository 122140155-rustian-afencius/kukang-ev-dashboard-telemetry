import { cn } from '@/lib/utils';
import Sparkline from './Sparkline';

type Props = {
    title: string;
    value: number | string;
    unit?: string;
    trend?: number[];
    accent?: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
    className?: string;
};

const accents: Record<NonNullable<Props['accent']>, { color: string; border: string; glow: string }> = {
    green: { color: '#00FFA3', border: 'from-emerald-500 to-emerald-700', glow: 'shadow-[0_0_24px_rgba(16,185,129,0.4)]' },
    red: { color: '#FF004D', border: 'from-rose-500 to-rose-700', glow: 'shadow-[0_0_24px_rgba(244,63,94,0.4)]' },
    blue: { color: '#00B4FF', border: 'from-sky-500 to-sky-700', glow: 'shadow-[0_0_24px_rgba(14,165,233,0.4)]' },
    yellow: { color: '#FFD166', border: 'from-amber-400 to-amber-600', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.4)]' },
    purple: { color: '#7B61FF', border: 'from-violet-500 to-violet-700', glow: 'shadow-[0_0_24px_rgba(124,58,237,0.4)]' },
};

export default function StatCard({ title, value, unit, trend = [], accent = 'green', className }: Props) {
    const a = accents[accent];
    return (
        <div className={cn('rounded-xl bg-gradient-to-r p-[1px]', a.border, a.glow, className)}>
            <div className="flex min-h-[120px] flex-col rounded-[11px] bg-neutral-900 p-3 sm:min-h-[140px] sm:p-4">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs tracking-widest text-neutral-400 uppercase sm:text-xs">{title}</span>
                    {unit && <span className="text-[10px] text-neutral-500 sm:text-[10px]">{unit}</span>}
                </div>
                <div className="flex flex-1 items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-semibold text-neutral-100 sm:text-2xl">
                            {typeof value === 'number' ? Math.round(value) : value}
                        </span>
                        {unit && <span className="text-sm text-neutral-400">{unit}</span>}
                    </div>
                </div>
                {trend.length > 0 && (
                    <div className="mt-2">
                        <Sparkline data={trend} color={a.color} />
                    </div>
                )}
            </div>
        </div>
    );
}
