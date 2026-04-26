const BASE = 'https://api.mfapi.in/mf';

export async function searchFunds(query) {
  const normalized = (query || '').trim();
  if (!normalized) return [];

  const response = await fetch(`${BASE}/search?q=${encodeURIComponent(normalized)}`);
  if (!response.ok) throw new Error('Unable to search funds');
  return response.json();
}

export async function getFundNAV(schemeCode) {
  const response = await fetch(`${BASE}/${schemeCode}`);
  if (!response.ok) throw new Error('Unable to fetch NAV');
  return response.json();
}

export function parseNAVData(data) {
  if (!data?.data?.length || !data?.meta) return null;
  const latest = data.data[0];
  const previous = data.data[1] || latest;
  const currentNAV = Number(latest.nav);
  const previousNAV = Number(previous.nav);
  const change = currentNAV - previousNAV;
  const changePercent = previousNAV === 0 ? 0 : (change / previousNAV) * 100;

  return {
    fundName: `${data.meta.fund_house} ${data.meta.scheme_name}`.trim(),
    schemeCode: data.meta.scheme_code,
    nav: currentNAV,
    date: latest.date,
    change,
    changePercent,
    arrow: change >= 0 ? '▲' : '▼'
  };
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function calculateCAGR(navData, years) {
  if (!navData?.data?.length) return 0;
  const current = Number(navData.data[0].nav);
  if (!current || !years) return 0;

  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() - years);

  const pastEntry = [...navData.data].reverse().find(entry => new Date(entry.date) <= targetDate) || navData.data[navData.data.length - 1];
  const past = Number(pastEntry?.nav);
  if (!past || past <= 0) return 0;

  return Math.round(((Math.pow(current / past, 1 / years) - 1) * 100) * 100) / 100;
}
