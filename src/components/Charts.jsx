import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

const currencyTick = value => `₹${Math.round(value).toLocaleString('en-IN')}`;
const labelFor = item => item.label || `Y${item.year}`;

const journeyLabelsPlugin = {
  id: 'journeyLabelsPlugin',
  afterDraw(chart, args, opts) {
    if (!opts?.enabled) return;
    const { ctx, chartArea, scales } = chart;
    const xScale = scales.x;
    if (!xScale) return;

    ctx.save();
    ctx.font = '12px Sora, sans-serif';
    ctx.textAlign = 'center';

    if (opts.retireLabel) {
      const x = xScale.getPixelForValue(opts.retireLabel);
      if (Number.isFinite(x)) {
        ctx.fillStyle = '#f2b33d';
        ctx.fillText('Retire', x, chartArea.top + 18);
      }
    }

    if (opts.depletedLabel) {
      const x = xScale.getPixelForValue(opts.depletedLabel);
      if (Number.isFinite(x)) {
        ctx.fillStyle = '#ff5f67';
        ctx.fillText('Depleted', x, chartArea.top + 18);
      }
    }

    ctx.restore();
  }
};

ChartJS.register(journeyLabelsPlugin);

export function SipDonutChart({ invested, wealthGained }) {
  return (
    <Doughnut
      data={{
        labels: ['Invested', 'Wealth Gained'],
        datasets: [{
          data: [invested, wealthGained],
          backgroundColor: ['#1a3c6e', '#f5a623'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      }}
      options={{
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${currencyTick(ctx.parsed)}` } }
        },
        cutout: '68%',
        maintainAspectRatio: false,
        responsive: true
      }}
    />
  );
}

export function SipGrowthChart({ data }) {
  return (
    <Bar
      data={{
        labels: data.map(item => `Y${item.year}`),
        datasets: [{
          label: 'Portfolio Value',
          data: data.map(item => item.value),
          backgroundColor: '#f5a623',
          borderRadius: 10,
          borderSkipped: false
        }]
      }}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => currencyTick(ctx.parsed.y) } }
        },
        scales: {
          x: { grid: { display: false } },
          y: { ticks: { callback: currencyTick } }
        }
      }}
    />
  );
}

export function DelayChart({ startNow, startLater }) {
  return (
    <Bar
      data={{
        labels: ['Start Now', 'Start After Delay'],
        datasets: [{
          label: 'Value',
          data: [startNow, startLater],
          backgroundColor: ['#27ae60', '#e74c3c'],
          borderRadius: 12,
          borderSkipped: false
        }]
      }}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => currencyTick(ctx.parsed.y) } } },
        scales: { x: { grid: { display: false } }, y: { ticks: { callback: currencyTick } } }
      }}
    />
  );
}

export function RetirementLineChart({ data, mode = 'default', retireLabel, depletedLabel }) {
  const darkJourney = mode === 'journey';
  const labels = data.map(labelFor);
  const maxY = Math.max(...data.map(item => Number(item.accumulated) || 0), 1);

  const datasets = darkJourney
    ? [
      {
        label: 'Corpus',
        data: data.map(item => item.accumulated),
        borderColor: '#06b0ff',
        backgroundColor: 'rgba(6, 176, 255, 0.16)',
        fill: true,
        tension: 0.34,
        pointRadius: 0,
        borderWidth: 3
      },
      {
        label: 'Retire marker',
        data: retireLabel ? [{ x: retireLabel, y: 0 }, { x: retireLabel, y: maxY }] : [],
        parsing: false,
        borderColor: '#f2b33d',
        borderDash: [6, 5],
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false
      },
      {
        label: 'Depleted marker',
        data: depletedLabel ? [{ x: depletedLabel, y: 0 }, { x: depletedLabel, y: maxY }] : [],
        parsing: false,
        borderColor: '#ff5f67',
        borderDash: [6, 5],
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false
      }
    ]
    : [
      {
        label: 'Accumulated Corpus',
        data: data.map(item => item.accumulated),
        borderColor: '#f5a623',
        backgroundColor: 'rgba(245, 166, 35, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3
      },
      {
        label: 'Required Corpus',
        data: data.map(item => item.required),
        borderColor: '#1a3c6e',
        borderDash: [6, 6],
        fill: false,
        tension: 0.2,
        pointRadius: 0
      }
    ];

  return (
    <Line
      data={{
        labels,
        datasets
      }}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: darkJourney
            ? { display: false }
            : { position: 'bottom', labels: { usePointStyle: true, padding: 18 } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${currencyTick(ctx.parsed.y)}`
            }
          },
          journeyLabelsPlugin: {
            enabled: darkJourney,
            retireLabel,
            depletedLabel
          }
        },
        scales: {
          x: {
            grid: darkJourney
              ? { color: 'rgba(61, 113, 167, 0.3)', borderDash: [4, 4] }
              : { display: false },
            ticks: darkJourney ? { color: '#6d8bb3' } : { autoSkip: true, maxRotation: 0 },
            title: darkJourney
              ? undefined
              : {
                display: true,
                text: 'Age',
                color: '#3a4f6a',
                font: { size: 12, weight: 700 }
              }
          },
          y: {
            grid: darkJourney ? { color: 'rgba(61, 113, 167, 0.3)', borderDash: [4, 4] } : undefined,
            ticks: {
              callback: currencyTick,
              color: darkJourney ? '#6d8bb3' : undefined
            }
          }
        }
      }}
    />
  );
}
