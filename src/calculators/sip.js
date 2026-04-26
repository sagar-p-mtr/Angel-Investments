export function formatCurrency(value) {
  return Math.round(Number(value) || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
}

export function calculateSIP(monthlyAmount, annualRate, years) {
  const p = Number(monthlyAmount) || 0;
  const rate = Number(annualRate) || 0;
  const y = Number(years) || 0;
  const monthlyRate = rate / 12 / 100;
  const n = y * 12;
  const invested = p * n;

  if (n <= 0) {
    return { investedAmount: 0, futureValue: 0, wealthGained: 0, yearlyBreakdown: [] };
  }

  let futureValue = invested;
  if (monthlyRate > 0) {
    futureValue = p * (((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate));
  }

  const wealthGained = futureValue - invested;
  const yearlyBreakdown = Array.from({ length: y }, (_, index) => {
    const year = index + 1;
    const months = year * 12;
    const fv = monthlyRate > 0
      ? p * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
      : p * months;
    return { year, value: Math.round(fv) };
  });

  return {
    investedAmount: Math.round(invested),
    futureValue: Math.round(futureValue),
    wealthGained: Math.round(wealthGained),
    yearlyBreakdown
  };
}
