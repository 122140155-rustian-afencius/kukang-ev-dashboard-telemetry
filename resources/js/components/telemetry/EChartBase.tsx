import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './raceTheme';

type Props = {
  className?: string;
  option: echarts.EChartsOption;
  theme?: 'raceNight' | string;
  style?: React.CSSProperties;
  height?: number | string;
  width?: number | string;
  onReady?: (instance: echarts.ECharts) => void;
};

export default function EChartBase({
  className,
  option,
  theme = 'raceNight',
  style,
  height = 280,
  width = '100%',
  onReady,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const inst = echarts.init(ref.current, theme);
    chartRef.current = inst;
    onReady?.(inst);
    const ro = new ResizeObserver(() => inst.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      inst.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption(option as any, { notMerge: true, lazyUpdate: true });
  }, [option]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ height, width, ...style }}
    />
  );
}

