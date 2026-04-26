const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function formatCurrency(value) {
  return Math.round(Number(value) || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
}

export function toYearLabel(age) {
  return `Age ${Math.round(age)}`;
}

export function calculateSeedProjection({
  monthlySip,
  annualStepUp,
  expectedReturn,
  investYears,
  currentAge,
  stepUpEnabled = true
}) {
  const monthlyRate = clamp(Number(expectedReturn) || 0, 0, 100) / 12 / 100;
  const years = Math.max(1, Math.round(Number(investYears) || 1));
  const startingSip = Math.max(0, Number(monthlySip) || 0);
  const stepUp = Math.max(0, Number(annualStepUp) || 0);
  const ageNow = Math.max(0, Number(currentAge) || 0);

  let corpus = 0;
  let totalContributions = 0;
  let yearlySip = startingSip;
  let magicYear = null;
  const flatData = [];
  const steppedData = [];

  let flatCorpus = 0;
  let flatContributions = 0;
  const flatSip = startingSip;

  for (let year = 0; year <= years; year += 1) {
    const currentAgeForYear = ageNow + year;
    const corpusAtStartOfYear = corpus;
    let yearlyContribution = 0;

    steppedData.push({
      year,
      label: toYearLabel(currentAgeForYear),
      accumulated: Math.round(corpus),
      required: Math.round(totalContributions)
    });

    flatData.push({
      year,
      label: toYearLabel(currentAgeForYear),
      accumulated: Math.round(flatCorpus),
      required: Math.round(flatContributions)
    });

    if (year === years) break;

    for (let month = 0; month < 12; month += 1) {
      corpus = corpus * (1 + monthlyRate) + yearlySip;
      totalContributions += yearlySip;
      yearlyContribution += yearlySip;

      flatCorpus = flatCorpus * (1 + monthlyRate) + flatSip;
      flatContributions += flatSip;
    }

    const yearlyReturns = corpus - corpusAtStartOfYear - yearlyContribution;
    if (!magicYear && yearlyReturns > yearlyContribution) {
      magicYear = currentAgeForYear + 1;
    }

    if (stepUpEnabled) {
      yearlySip = yearlySip * (1 + stepUp / 100);
    }
  }

  const investedAmount = Math.round(totalContributions);
  const futureValue = Math.round(corpus);
  const wealthGained = futureValue - investedAmount;
  const flatFutureValue = Math.round(flatCorpus);
  const stepUpBoost = futureValue - flatFutureValue;
  const wealthMultiplier = investedAmount > 0 ? futureValue / investedAmount : 0;

  return {
    investedAmount,
    futureValue,
    wealthGained,
    flatFutureValue,
    stepUpBoost,
    wealthMultiplier,
    magicYear,
    yearlyData: steppedData,
    flatYearlyData: flatData,
    finalSip: Math.round(yearlySip),
    finalAge: ageNow + years
  };
}

export function calculateHarvestProjection({
  corpusAtRetirement,
  currentAge,
  retirementAge,
  lifeExpectancy,
  monthlyExpensesNow,
  inflationRate,
  postRetReturn,
  withdrawalStepUp
}) {
  const corpus = Math.max(0, Number(corpusAtRetirement) || 0);
  const ageNow = Math.max(0, Number(currentAge) || 0);
  const retireAge = Math.max(ageNow + 1, Number(retirementAge) || ageNow + 1);
  const lifeAge = Math.max(retireAge, Number(lifeExpectancy) || retireAge);
  const expensesNow = Math.max(0, Number(monthlyExpensesNow) || 0);
  const inflation = Math.max(0, Number(inflationRate) || 0);
  const postReturn = Math.max(0, Number(postRetReturn) || 0);
  const withdrawalStep = Math.max(0, Number(withdrawalStepUp) || 0);

  const yearsToRetire = retireAge - ageNow;
  const retirementMonthlyNeed = expensesNow * Math.pow(1 + inflation / 100, yearsToRetire);
  let corpusBalance = corpus;
  let withdrawal = retirementMonthlyNeed;
  const monthlyGrowthRate = postReturn / 12 / 100;
  let depletionAge = lifeAge;
  let fundedMonths = 0;
  let depleted = false;
  const retirementPath = [];

  for (let year = 0; year <= lifeAge - retireAge; year += 1) {
    const age = retireAge + year;
    retirementPath.push({
      year,
      label: toYearLabel(age),
      accumulated: Math.max(0, Math.round(corpusBalance)),
      required: Math.round(withdrawal)
    });

    if (year === lifeAge - retireAge) break;

    if (!depleted) {
      for (let month = 0; month < 12; month += 1) {
        corpusBalance = corpusBalance * (1 + monthlyGrowthRate) - withdrawal;
        fundedMonths += 1;
        if (corpusBalance <= 0) {
          depletionAge = retireAge + fundedMonths / 12;
          corpusBalance = 0;
          depleted = true;
          break;
        }
      }
    }

    withdrawal = withdrawal * (1 + withdrawalStep / 100);
  }

  const yearsFunded = Math.max(0, Math.min(lifeAge - retireAge, fundedMonths / 12));
  const corpusNeededForFullLife = retirementMonthlyNeed * 12 * (lifeAge - retireAge) * 0.85;
  const corpusGap = Math.max(0, corpusNeededForFullLife - corpus);
  const requiredSipIncrease = yearsToRetire > 0
    ? Math.round((corpusGap * (postReturn / 12 / 100)) / (Math.pow(1 + postReturn / 12 / 100, yearsToRetire * 12) - 1 || 1))
    : 0;

  return {
    retirementMonthlyNeed: Math.round(retirementMonthlyNeed),
    finalWithdrawal: Math.round(withdrawal),
    depletionAge: Math.ceil(depletionAge),
    yearsFunded: Math.ceil(yearsFunded),
    yearsAtRetirement: retireAge,
    corpusGap: Math.round(corpusGap),
    requiredSipIncrease: Math.max(0, requiredSipIncrease),
    retirementPath,
    corpusBalance: Math.round(corpusBalance),
    lifeAge
  };
}

export function buildExpenseBreakdown(monthlyNeed) {
  const amount = Math.max(0, Number(monthlyNeed) || 0);
  const parts = [
    { label: 'Food & Groceries', ratio: 0.33 },
    { label: 'Utilities & Housing', ratio: 0.14 },
    { label: 'Healthcare', ratio: 0.15 },
    { label: 'Leisure & Travel', ratio: 0.24 },
    { label: 'Emergency Buffer', ratio: 0.14 }
  ];

  const breakdown = parts.map((part, index) => ({
    ...part,
    value: Math.round(amount * part.ratio),
    editable: index < 4
  }));

  const total = breakdown.reduce((sum, item) => sum + item.value, 0);
  return {
    breakdown,
    total
  };
}
