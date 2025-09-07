import EChartBase from './EChartBase';

type Props = {
  data: number[];
  color?: string;
  height?: number;
  area?: boolean;
};

export default function Sparkline({ data, color = '#00FFA3', height = 60, area = true }: Props) {
  const option = {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, boundaryGap: true, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    animation: true,
    series: [
      {
        type: 'line',
        data,
        showSymbol: false,
        smooth: true,
        lineStyle: { color, width: 2 },
        areaStyle: area
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: color + 'CC' },
                  { offset: 1, color: color + '00' },
                ],
              },
            }
          : undefined,
      },
    ],
  } as const;

  return <EChartBase option={option as any} height={height} />;
}

