import * as echarts from 'echarts';

let isThemeRegistered = false;

const raceNight = {
  darkMode: true,
  color: ['#00FFA3', '#FF004D', '#FFD166', '#00B4FF', '#7B61FF'],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Instrument Sans, ui-sans-serif, system-ui, sans-serif',
    color: '#E5E7EB',
  },
  title: { textStyle: { color: '#F3F4F6' }, subtextStyle: { color: '#9CA3AF' } },
  tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#111827', textStyle: { color: '#F9FAFB' } },
  grid: { top: 24, right: 12, bottom: 24, left: 12, containLabel: true },
  axisPointer: { lineStyle: { color: '#6B7280' } },
  xAxis: {
    axisLine: { lineStyle: { color: '#4B5563' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(75,85,99,0.3)' } },
  },
  yAxis: {
    axisLine: { lineStyle: { color: '#4B5563' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(75,85,99,0.3)' } },
  },
  legend: { textStyle: { color: '#D1D5DB' } },
};

if (!isThemeRegistered) {
  echarts.registerTheme('raceNight', raceNight);
  isThemeRegistered = true;
}

export {}; // side-effect module

