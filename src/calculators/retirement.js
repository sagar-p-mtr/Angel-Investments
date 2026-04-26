export function calculateRetirement(currentAge, retirementAge, monthlyExpenses, currentSavings, expectedReturn, inflationRate, lifeExpectancy) {
  const age = Number(currentAge) || 0;
  const retireAge = Number(retirementAge) || 0;
  const expenses = Number(monthlyExpenses) || 0;
  const savings = Number(currentSavings) || 0;
  const annualReturn = Number(expectedReturn) || 0;
  const inflation = Number(inflationRate) || 0;
  const life = Number(lifeExpectancy) || 0;

  const yearsToRetire = Math.max(0, retireAge - age);
  if (yearsToRetire <= 0) {
    return { error: 'Retirement age must be greater than current age.' };
  }

  const inflationAdjustedExpenses = expenses * Math.pow(1 + inflation / 100, yearsToRetire);
  const annualExpenses = inflationAdjustedExpenses * 12;
  const corpusRequired = annualExpenses * 25;
  const fvCurrentSavings = savings * Math.pow(1 + annualReturn / 100, yearsToRetire);
  const r = annualReturn / 12 / 100;
  const n = yearsToRetire * 12;
  const remaining = Math.max(0, corpusRequired - fvCurrentSavings);
  const sipNeeded = remaining <= 0 ? 0 : (r <= 0 ? remaining / Math.max(1, n) : (remaining * r) / (Math.pow(1 + r, n) - 1));
  const score = Math.min(100, Math.round((fvCurrentSavings / corpusRequired) * 100));

  const growthData = [];
  let accumulated = savings;
  const monthlyGrowthRate = annualReturn / 12 / 100;

  for (let year = 0; year <= yearsToRetire; year += 1) {
    growthData.push({
      year,
      accumulated: Math.round(accumulated),
      required: Math.round(corpusRequired)
    });

    for (let month = 0; month < 12 && year < yearsToRetire; month += 1) {
      accumulated = accumulated * (1 + monthlyGrowthRate) + sipNeeded;
    }
  }

  return {
    corpusRequired: Math.round(corpusRequired),
    sipNeeded: Math.round(sipNeeded),
    yearsToRetire,
    readinessScore: score,
    fvCurrentSavings: Math.round(fvCurrentSavings),
    inflationAdjustedExpenses: Math.round(inflationAdjustedExpenses),
    annualExpenses: Math.round(annualExpenses),
    growthData,
    lifeExpectancy: life
  };
}

export function calculateScenarioSIP(params, scenarioRate) {
  const result = calculateRetirement(
    params.currentAge,
    params.retirementAge,
    params.monthlyExpenses,
    params.currentSavings,
    scenarioRate,
    params.inflationRate,
    params.lifeExpectancy
  );

  return result.error ? 0 : result.sipNeeded;
}
