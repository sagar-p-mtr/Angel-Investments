export function calculateSIPValue(monthlyAmount, annualRate, months) {
  const p = Number(monthlyAmount) || 0;
  const rate = Number(annualRate) || 0;
  const n = Math.max(0, Number(months) || 0);
  const monthlyRate = rate / 12 / 100;

  if (n <= 0) return 0;
  if (monthlyRate <= 0) return p * n;

  return p * (((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate));
}

export function calculateCostOfDelay(amount, durationYears, delayMonths, annualRate) {
  const totalMonths = Math.max(0, Number(durationYears) || 0) * 12;
  const delayedMonths = Math.max(0, totalMonths - (Number(delayMonths) || 0));
  const valueNow = calculateSIPValue(amount, annualRate, totalMonths);
  const valueDelayed = calculateSIPValue(amount, annualRate, delayedMonths);

  return {
    valueNow: Math.round(valueNow),
    valueDelayed: Math.round(valueDelayed),
    costOfDelay: Math.round(Math.max(0, valueNow - valueDelayed))
  };
}
