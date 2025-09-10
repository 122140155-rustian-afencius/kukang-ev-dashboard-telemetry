import EChartBase from './EChartBase';

type Props = {
    value: number;
    max?: number;
    unit?: string;
    title?: string;
};

export default function SpeedGauge({ value, max = 40, unit = 'km/h', title = 'Speed' }: Props) {
    const option = {
        backgroundColor: 'transparent',
        series: [
            {
                type: 'gauge' as const,
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max,
                splitNumber: 8,
                radius: '85%',
                axisLine: {
                    roundCap: false,
                    lineStyle: {
                        width: 2,
                        color: [[1, '#374151']] as [number, string][],
                    },
                },
                pointer: {
                    show: true,
                    length: '75%',
                    width: 2,
                    itemStyle: {
                        color: '#F3F4F6',
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        shadowBlur: 5,
                        shadowOffsetX: 1,
                        shadowOffsetY: 1,
                    },
                },
                axisTick: {
                    show: true,
                    distance: -8,
                    length: 6,
                    lineStyle: {
                        color: '#6B7280',
                        width: 1,
                    },
                },
                splitLine: {
                    show: true,
                    distance: -12,
                    length: 15,
                    lineStyle: {
                        color: '#4B5563',
                        width: 3,
                    },
                },
                axisLabel: {
                    show: true,
                    distance: 2,
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontStyle: 'italic' as const,
                    fontWeight: 600,
                    fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", "Monaco", "Consolas", monospace',
                },
                anchor: {
                    show: true,
                    size: 6,
                    itemStyle: {
                        color: '#F9FAFB',
                        borderColor: '#6B7280',
                        borderWidth: 1,
                        shadowColor: 'rgba(0, 0, 0, 0.2)',
                        shadowBlur: 3,
                    },
                },
                title: {
                    show: false,
                    offsetCenter: [0, '75%'],
                    color: '#9CA3AF',
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
                    textBorderWidth: 0,
                },
                detail: {
                    valueAnimation: true,
                    formatter: (val: number) => `${Math.round(val)}`,
                    color: '#F9FAFB',
                    fontSize: 22,
                    fontWeight: 200,
                    offsetCenter: [0, '20%'],
                },
                data: [{ value, name: title }],
            },
            {
                type: 'gauge' as const,
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max,
                radius: '90%',
                axisLine: { show: false },
                pointer: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                anchor: { show: false },
                title: { show: false },
                detail: {
                    formatter: () => unit,
                    color: '#9CA3AF',
                    fontSize: 12,
                    fontWeight: 300,
                    offsetCenter: [0, '45%'],
                },
                data: [{ value: 0, name: '' }],
            },
        ],
    };

    return <EChartBase option={option} height={200} />;
}
