import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import { RetirementLineChart } from './components/Charts';
import {
  buildExpenseBreakdown,
  calculateHarvestProjection,
  calculateSeedProjection,
  formatCurrency
} from './calculators/retirementReality';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function calculateLumpsumProjection({ lumpsum, expectedReturn, investYears, currentAge }) {
  const principal = Math.max(0, Number(lumpsum) || 0);
  const years = Math.max(1, Math.round(Number(investYears) || 1));
  const annualRate = Math.max(0, Number(expectedReturn) || 0) / 100;
  const ageNow = Math.max(0, Number(currentAge) || 0);
  const yearlyData = [];

  for (let year = 0; year <= years; year += 1) {
    const corpus = principal * Math.pow(1 + annualRate, year);
    yearlyData.push({
      year,
      label: `Age ${ageNow + year}`,
      accumulated: Math.round(corpus),
      required: principal
    });
  }

  return {
    futureValue: Math.round(principal * Math.pow(1 + annualRate, years)),
    investedAmount: principal,
    yearlyData
  };
}

function t(lang, en, kn) {
  return lang === 'kn' ? kn : en;
}

function SectionHeader({ lang, number, eyebrow, title, subtitle }) {
  return (
    <div className="section-header">
      <div className="section-header__lead">
        {number ? <span className="section-number">{number}</span> : null}
        <p className="eyebrow">{eyebrow}</p>
      </div>
      <h2>{title}</h2>
      <p className="section-header__subtitle">{subtitle}</p>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step = 1, suffix = '' }) {
  const displayValue = Number.isFinite(value) ? value : min;
  return (
    <div className="field-card">
      <div className="field-card__top">
        <label>{label}</label>
        <strong>{suffix === '₹' ? formatCurrency(displayValue) : `${Math.round(displayValue).toLocaleString('en-IN')}${suffix}`}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={e => onChange(clamp(Number(e.target.value), min, max))}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={e => {
          const next = e.target.value === '' ? min : clamp(Number(e.target.value), min, max);
          onChange(next);
        }}
      />
    </div>
  );
}

function Hero({ lang }) {
  return (
    <section id="home" className="hero-shell">
      <div className="container hero-grid hero-grid--single">
        <div className="hero-copy">
          <span className="hero-kicker">{t(lang, 'Will your money last as long as you do?', 'ನಿಮ್ಮ ಹಣ ನಿಮ್ಮ ಆಯುಷ್ಯವರೆಗೆ ಸಾಕಾಗುತ್ತದೆಯೇ?')}</span>
          <h1>
            <span>{t(lang, 'The Seed.', 'ಹೂಡಿಕೆಯ ಬೀಜ.')}</span>
            <span>{t(lang, 'The Harvest.', 'ಅದರ ಕೊಯ್ಲು.')}</span>
            <span>{t(lang, 'The Life It Buys.', 'ಅದು ಕೊಳ್ಳುವ ಜೀವನ.')}</span>
          </h1>
          <p>
            {t(
              lang,
              'SIP or lumpsum. See if your retirement plan actually works. Adjusted for real Indian inflation. Takes 60 seconds.',
              'SIP ಅಥವಾ lumpsum. ನಿಮ್ಮ ನಿವೃತ್ತಿ ಯೋಜನೆ ನಿಜವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆಯೇ ನೋಡಿ. ಭಾರತೀಯ ದರ ಏರಿಕೆಗೆ ಹೊಂದಿಸಲಾಗಿದೆ. 60 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಫಲಿತಾಂಶ.'
            )}
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#seed">{t(lang, 'Check My Plan', 'ನನ್ನ ಯೋಜನೆ ನೋಡಿ')}</a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <span>5L+</span>
              <small>{t(lang, 'Subscribers', 'ಸದಸ್ಯರು')}</small>
            </div>
            <div className="trust-item">
              <span>{t(lang, 'Top Rated', 'ಟಾಪ್ ರೇಟೆಡ್')}</span>
              <small>{t(lang, 'Investor Community', 'ಹೂಡಿಕೆದಾರರ ಸಮುದಾಯ')}</small>
            </div>
            <div className="trust-item">
              <span>{t(lang, 'SEBI Regulated', 'SEBI ನಿಯಂತ್ರಿತ')}</span>
              <small>{t(lang, 'AMFI Registered', 'AMFI ನೋಂದಾಯಿತ')}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SeedSection({
  lang,
  currentAge,
  retirementAge,
  onCurrentAgeChange,
  onRetirementAgeChange,
  onCorpusChange
}) {
  const [planType, setPlanType] = useState('sip');
  const [state, setState] = useState({
    monthlySip: 5000,
    annualStepUp: 10,
    expectedReturn: 12,
    stepUpEnabled: true
  });
  const [lumpsumState, setLumpsumState] = useState({
    lumpsum: 1000000,
    expectedReturn: 12,
    investYears: 25
  });

  const investYears = Math.max(1, retirementAge - currentAge);

  const projection = useMemo(
    () =>
      calculateSeedProjection({
        monthlySip: state.monthlySip,
        annualStepUp: state.annualStepUp,
        expectedReturn: state.expectedReturn,
        investYears,
        currentAge,
        stepUpEnabled: state.stepUpEnabled
      }),
    [currentAge, investYears, state]
  );

  const lumpsumProjection = useMemo(
    () =>
      calculateLumpsumProjection({
        ...lumpsumState,
        currentAge,
        investYears
      }),
    [currentAge, investYears, lumpsumState]
  );

  const isSipPlan = planType === 'sip';
  const chartData = isSipPlan ? projection.yearlyData : lumpsumProjection.yearlyData;

  useEffect(() => {
    const corpus = isSipPlan ? projection.futureValue : lumpsumProjection.futureValue;
    onCorpusChange(corpus);
  }, [isSipPlan, lumpsumProjection.futureValue, onCorpusChange, projection.futureValue]);

  return (
    <section id="seed" className="section section--framed section--dark-soft">
      <div className="container">
        <SectionHeader
          lang={lang}
          number="01"
          eyebrow={t(lang, 'THE SEED', 'ಬೀಜ')}
          title={t(lang, 'Your money compounding quietly for decades', 'ನಿಮ್ಮ ಹಣ ದಶಕಗಳ ಕಾಲ ಮೌನವಾಗಿ ಬೆಳೆದು ಕೊಳ್ಳುತ್ತದೆ')}
          subtitle={t(lang, 'See how SIP, annual step-up, and compounding combine into a retirement corpus.', 'SIP, ವಾರ್ಷಿಕ ಹೆಚ್ಚಳ ಮತ್ತು compounding ಸೇರಿ ನಿವೃತ್ತಿ corpus ಹೇಗೆ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ ನೋಡಿ.')}
        />

        <div className="plan-switch" role="tablist" aria-label="Plan Type">
          <button type="button" className={`plan-switch__button ${isSipPlan ? 'is-active' : ''}`} onClick={() => setPlanType('sip')}>
            {t(lang, 'SIP Plan', 'SIP ಯೋಜನೆ')}
          </button>
          <button type="button" className={`plan-switch__button ${!isSipPlan ? 'is-active' : ''}`} onClick={() => setPlanType('lumpsum')}>
            {t(lang, 'Lumpsum Plan', 'Lumpsum ಯೋಜನೆ')}
          </button>
        </div>

        <div className="planner-card">
          <div className="planner-controls">
            {isSipPlan ? (
              <>
                <SliderField label={t(lang, 'Monthly SIP', 'ಮಾಸಿಕ SIP')} value={state.monthlySip} onChange={monthlySip => setState(prev => ({ ...prev, monthlySip }))} min={1000} max={50000} step={500} suffix="₹" />
                <SliderField label={t(lang, 'Annual Step-up', 'ವಾರ್ಷಿಕ Step-up')} value={state.annualStepUp} onChange={annualStepUp => setState(prev => ({ ...prev, annualStepUp }))} min={0} max={25} step={1} suffix="%" />
                <SliderField label={t(lang, 'Expected Returns', 'ಅಪೇಕ್ಷಿತ Returns')} value={state.expectedReturn} onChange={expectedReturn => setState(prev => ({ ...prev, expectedReturn }))} min={6} max={20} step={0.5} suffix="%" />
                <SliderField label={t(lang, 'Invest Years', 'ಹೂಡಿಕೆ ವರ್ಷಗಳು')} value={investYears} onChange={years => onRetirementAgeChange(currentAge + years)} min={5} max={40} step={1} suffix=" yrs" />
                <SliderField label={t(lang, 'Starting Age', 'ಪ್ರಾರಂಭಿಕ ವಯಸ್ಸು')} value={currentAge} onChange={onCurrentAgeChange} min={18} max={70} step={1} suffix=" yrs" />
              </>
            ) : (
              <>
                <SliderField label={t(lang, 'Lumpsum Amount', 'Lumpsum ಮೊತ್ತ')} value={lumpsumState.lumpsum} onChange={lumpsum => setLumpsumState(prev => ({ ...prev, lumpsum }))} min={100000} max={50000000} step={50000} suffix="₹" />
                <SliderField label={t(lang, 'Expected Returns', 'ಅಪೇಕ್ಷಿತ Returns')} value={lumpsumState.expectedReturn} onChange={expectedReturn => setLumpsumState(prev => ({ ...prev, expectedReturn }))} min={6} max={20} step={0.5} suffix="%" />
                <SliderField label={t(lang, 'Invest Years', 'ಹೂಡಿಕೆ ವರ್ಷಗಳು')} value={investYears} onChange={years => onRetirementAgeChange(currentAge + years)} min={5} max={40} step={1} suffix=" yrs" />
                <SliderField label={t(lang, 'Starting Age', 'ಪ್ರಾರಂಭಿಕ ವಯಸ್ಸು')} value={currentAge} onChange={onCurrentAgeChange} min={18} max={70} step={1} suffix=" yrs" />
              </>
            )}
          </div>

          <div className="planner-summary">
            {isSipPlan ? (
              <>
                <div className="seed-compare seed-compare--bright seed-compare--stack">
                  <div>
                    <span>{t(lang, 'WITH 10% STEP-UP', '10% Step-up ಜೊತೆ')}</span>
                    <strong>{formatCurrency(projection.futureValue)}</strong>
                  </div>
                  <div>
                    <span>{t(lang, 'FLAT SIP', 'ಸ್ಥಿರ SIP')}</span>
                    <strong>{formatCurrency(projection.flatFutureValue)}</strong>
                  </div>
                  <div>
                    <span>{t(lang, 'BOOST', 'ಹೆಚ್ಚುವರಿ')}</span>
                    <strong>{formatCurrency(projection.stepUpBoost)}</strong>
                  </div>
                </div>

                <div className="magic-card">
                  <div>
                    <span>{t(lang, 'MAGIC YEAR', 'ಮ್ಯಾಜಿಕ್ ವರ್ಷ')}</span>
                    <strong>
                      {projection.magicYear
                        ? `${t(lang, 'Age', 'ವಯಸ್ಸು')} ${projection.magicYear}`
                        : t(lang, 'Not reached', 'ಇನ್ನೂ ಬಂದಿಲ್ಲ')}
                    </strong>
                  </div>
                  <p>
                    {projection.magicYear
                      ? t(
                        lang,
                        `At age ${projection.magicYear} your annual returns beat your annual contributions.`,
                        `ವಯಸ್ಸು ${projection.magicYear}ರಲ್ಲಿ ನಿಮ್ಮ ವಾರ್ಷಿಕ returns ನಿಮ್ಮ ವಾರ್ಷಿಕ ಕೊಡುಗೆಯನ್ನು ಮೀರುತ್ತವೆ.`
                      )
                      : t(
                        lang,
                        'Your annual returns have not crossed annual contributions yet in this time horizon.',
                        'ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ವಾರ್ಷಿಕ returns ಇನ್ನೂ ವಾರ್ಷಿಕ ಕೊಡುಗೆಯನ್ನು ಮೀರುವಷ್ಟಾಗಿಲ್ಲ.'
                      )}
                  </p>
                </div>
              </>
            ) : (
              <div className="seed-compare seed-compare--bright seed-compare--stack">
                <div>
                  <span>{t(lang, 'FUTURE VALUE', 'ಭವಿಷ್ಯದ ಮೌಲ್ಯ')}</span>
                  <strong>{formatCurrency(lumpsumProjection.futureValue)}</strong>
                </div>
                <div>
                  <span>{t(lang, 'INVESTED', 'ಹೂಡಿಕೆ')}</span>
                  <strong>{formatCurrency(lumpsumProjection.investedAmount)}</strong>
                </div>
                <div>
                  <span>{t(lang, 'WEALTH GAINED', 'ಆಸ್ತಿಯ ಬೆಳವಣಿಗೆ')}</span>
                  <strong>{formatCurrency(lumpsumProjection.futureValue - lumpsumProjection.investedAmount)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="chart-shell chart-shell--large">
          <div className="chart-shell__header">
            <h3>{t(lang, 'CORPUS GROWTH - THE HOCKEY STICK', 'CORPUS ಬೆಳವಣಿಗೆ - ಹಾಕಿ ಸ್ಟಿಕ್')}</h3>
            <p>{t(lang, `Starts from your investment age (Age ${currentAge}) and grows year-by-year with compounding.`, `ನಿಮ್ಮ ಹೂಡಿಕೆ ಆರಂಭದ ವಯಸ್ಸು (ವಯಸ್ಸು ${currentAge}) ಇಂದ ಪ್ರತಿ ವರ್ಷ compounding ಜೊತೆ ಬೆಳೆಯುತ್ತದೆ.`)}</p>
          </div>
          <div className="chart-panel chart-panel--xl">
            <RetirementLineChart data={chartData} mode={isSipPlan ? 'default' : 'journey'} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HarvestSection({
  lang,
  currentAge,
  retirementAge,
  lifeExpectancy,
  monthlyExpensesNow,
  inflationRate,
  corpusAtRetirement,
  postRetReturn,
  withdrawalStepUp,
  onRetirementAgeChange,
  onLifeExpectancyChange,
  onMonthlyExpensesNowChange,
  onInflationRateChange,
  onPostRetReturnChange,
  onWithdrawalStepUpChange
}) {
  const projection = useMemo(
    () =>
      calculateHarvestProjection({
        corpusAtRetirement,
        currentAge,
        retirementAge,
        lifeExpectancy,
        monthlyExpensesNow,
        inflationRate,
        postRetReturn,
        withdrawalStepUp
      }),
    [corpusAtRetirement, currentAge, inflationRate, lifeExpectancy, monthlyExpensesNow, postRetReturn, retirementAge, withdrawalStepUp]
  );

  const fullJourneyData = useMemo(() => {
    const accumulationYears = Math.max(1, retirementAge - currentAge);
    const accumulation = [];

    for (let year = 0; year <= accumulationYears; year += 1) {
      const ratio = year / accumulationYears;
      const age = currentAge + year;
      const corpus = corpusAtRetirement * Math.pow(ratio, 2.2);
      accumulation.push({
        year,
        label: `Age ${age}`,
        accumulated: Math.round(corpus),
        required: 0
      });
    }

    const retirementOnly = projection.retirementPath
      .slice(1)
      .map((point, index) => ({
        ...point,
        year: accumulationYears + 1 + index
      }));

    return [...accumulation, ...retirementOnly];
  }, [corpusAtRetirement, currentAge, projection.retirementPath, retirementAge]);

  return (
    <section id="harvest" className="section section--framed">
      <div className="container">
        <SectionHeader
          lang={lang}
          number="02"
          eyebrow={t(lang, 'THE HARVEST', 'ಕೊಯ್ಲು')}
          title={t(lang, 'Turning corpus into a monthly paycheck', 'Corpus ಅನ್ನು ಮಾಸಿಕ ಆದಾಯವಾಗಿ ಪರಿವರ್ತಿಸುವುದು')}
          subtitle={t(lang, 'Withdrawal planning needs its own compounding logic. Income must rise with inflation, or the corpus breaks.', 'Withdrawal ಯೋಜನೆಗೆ ತನ್ನದೇ compounding ಲಾಜಿಕ್ ಬೇಕು. ದರ ಏರಿಕೆಗೆ ಆದಾಯ ಹೆಚ್ಚದಿದ್ದರೆ corpus ಮುರಿಯುತ್ತದೆ.')}
        />

        <div className="planner-card planner-card--clean">
          <div className="planner-controls">
            <div className="metric-box metric-box--accent">
              <span>{t(lang, 'CORPUS FROM SEED PLAN', 'ಬೀಜ ಯೋಜನೆಯಿಂದ Corpus')}</span>
              <strong>{formatCurrency(corpusAtRetirement)}</strong>
            </div>
            <SliderField label={t(lang, 'Retirement Age', 'ನಿವೃತ್ತಿ ವಯಸ್ಸು')} value={retirementAge} onChange={onRetirementAgeChange} min={40} max={80} step={1} suffix=" yrs" />
            <SliderField label={t(lang, 'Life Expectancy', 'ಆಯುಷ್ಯ')} value={lifeExpectancy} onChange={onLifeExpectancyChange} min={60} max={100} step={1} suffix=" yrs" />
            <SliderField label={t(lang, 'Monthly Expenses Now', 'ಇಂದಿನ ಮಾಸಿಕ ಖರ್ಚು')} value={monthlyExpensesNow} onChange={onMonthlyExpensesNowChange} min={10000} max={250000} step={1000} suffix="₹" />
            <SliderField label={t(lang, 'Inflation', 'ದರ ಏರಿಕೆ')} value={inflationRate} onChange={onInflationRateChange} min={4} max={12} step={0.5} suffix="%" />
            <SliderField label={t(lang, 'Post-ret Returns', 'ನಿವೃತ್ತಿಯ ನಂತರ Returns')} value={postRetReturn} onChange={onPostRetReturnChange} min={4} max={10} step={0.5} suffix="%" />
            <SliderField label={t(lang, 'Withdrawal Step-up', 'Withdrawal Step-up')} value={withdrawalStepUp} onChange={onWithdrawalStepUpChange} min={0} max={12} step={0.5} suffix="%" />
          </div>

          <div className="planner-summary">
            <div className="metric-grid metric-grid--single-col">
              <div className="metric-box">
                <span>{t(lang, 'STARTING MONTHLY WITHDRAWAL', 'ಆರಂಭಿಕ ಮಾಸಿಕ Withdrawal')}</span>
                <strong>{formatCurrency(projection.retirementMonthlyNeed)}</strong>
              </div>
              <div className="metric-box metric-box--accent">
                <span>{t(lang, 'CORPUS RUNS OUT', 'CORPUS ಮುಗಿಯುವ ವಯಸ್ಸು')}</span>
                <strong>{t(lang, 'Age', 'ವಯಸ್ಸು')} {projection.depletionAge}</strong>
              </div>
              <div className="metric-box">
                <span>{t(lang, 'YEARS OF INCOME FUNDED', 'ಆದಾಯ ಸಿಗುವ ವರ್ಷಗಳು')}</span>
                <strong>{projection.yearsFunded} {t(lang, 'yrs', 'ವರ್ಷ')}</strong>
              </div>
            </div>

            <div className="callout-card callout-card--warning">
              <strong>{t(lang, 'Your SIP needs an increase.', 'ನಿಮ್ಮ SIP ಹೆಚ್ಚಳ ಅಗತ್ಯವಿದೆ.')}</strong>
              <p>{t(lang, `Corpus runs out at age ${projection.depletionAge}.`, `Corpus ವಯಸ್ಸು ${projection.depletionAge} ರಲ್ಲಿ ಮುಗಿಯುತ್ತದೆ.`)}</p>
            </div>
          </div>
        </div>

        <div className="chart-shell chart-shell--large">
          <div className="chart-shell__header">
            <h3>{t(lang, 'FULL JOURNEY - BUILD & SPEND', 'ಪೂರ್ಣ ಪ್ರಯಾಣ - ನಿರ್ಮಿಸಿ ಮತ್ತು ಬಳಸಿ')}</h3>
            <p>{t(lang, 'Corpus growth during accumulation and monthly withdrawal during retirement.', 'ಹೂಡಿಕೆ ಅವಧಿಯ ಬೆಳವಣಿಗೆ ಮತ್ತು ನಿವೃತ್ತಿಯ ಸಮಯದ withdrawal')}</p>
          </div>
          <div className="chart-panel chart-panel--xxl chart-panel--journey-dark">
            <RetirementLineChart
              data={fullJourneyData}
              mode="journey"
              retireLabel={`Age ${retirementAge}`}
              depletedLabel={`Age ${projection.depletionAge}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function LifeSection({
  lang,
  monthlyExpensesNow,
  inflationRate,
  yearsToRetire,
  corpusAtRetirement,
  lifeExpectancy,
  retirementAge,
  postRetReturn,
  onMonthlyExpensesNowChange,
  onInflationRateChange,
  onYearsToRetireChange
}) {

  const monthlyNeedAtRetirement = useMemo(
    () => Math.round(monthlyExpensesNow * Math.pow(1 + inflationRate / 100, yearsToRetire)),
    [monthlyExpensesNow, inflationRate, yearsToRetire]
  );
  const breakdown = useMemo(() => buildExpenseBreakdown(monthlyNeedAtRetirement), [monthlyNeedAtRetirement]);
  const yearsInRetirement = Math.max(1, lifeExpectancy - retirementAge);
  const estimatedCorpusNeed = Math.round(monthlyNeedAtRetirement * 12 * yearsInRetirement * 0.85);
  const corpusGap = Math.max(0, estimatedCorpusNeed - corpusAtRetirement);
  const planAtRisk = corpusGap > 0;
  const fundedYearsApprox = Math.max(0, Math.min(yearsInRetirement, Math.round(corpusAtRetirement / Math.max(monthlyNeedAtRetirement * 12, 1))));

  return (
    <section id="life" className="section section--framed section--dark-soft">
      <div className="container">
        <SectionHeader
          lang={lang}
          number="03"
          eyebrow={t(lang, 'THE LIFE IT BUYS', 'ಅದು ಕೊಳ್ಳುವ ಜೀವನ')}
          title={t(lang, `${formatCurrency(monthlyExpensesNow)}/month today → ${formatCurrency(monthlyNeedAtRetirement)}/month needed at retirement`, `ಇಂದು ${formatCurrency(monthlyExpensesNow)}/ತಿಂಗಳು → ನಿವೃತ್ತಿಯಲ್ಲಿ ${formatCurrency(monthlyNeedAtRetirement)}/ತಿಂಗಳು ಅಗತ್ಯ`) }
          subtitle={t(lang, 'The verdict is not just a corpus number - it is whether your future lifestyle survives inflation.', 'ಕೇವಲ corpus ಸಂಖ್ಯೆ ಸಾಕಾಗುವುದಿಲ್ಲ - ನಿಮ್ಮ ಭವಿಷ್ಯದ ಜೀವನಶೈಲಿ ದರ ಏರಿಕೆಯನ್ನು ಮೀರಿ ಸಾಗುತ್ತದೆಯೇ ಅನ್ನೋದೇ ಮುಖ್ಯ.')}
        />

        <div className="life-layout">
          <div className="life-summary-card life-summary-card--bright">
            <div className="life-summary-card__top">
              <span>{t(lang, 'THE VERDICT', 'ತೀರ್ಪು')}</span>
              <strong>{planAtRisk ? t(lang, 'Plan at Risk', 'ಯೋಜನೆ ಅಪಾಯದಲ್ಲಿದೆ') : t(lang, 'Plan on Track', 'ಯೋಜನೆ ಸರಿಯಾದ ದಾರಿಯಲ್ಲಿ')}</strong>
            </div>
            <p>
              {planAtRisk
                ? t(lang, `Estimated gap: ${formatCurrency(corpusGap)}. At current pace, your corpus may fund around ${fundedYearsApprox} years after retirement.`, `ಅಂದಾಜು ಕೊರತೆ: ${formatCurrency(corpusGap)}. ಈಗಿನ ವೇಗದಲ್ಲಿ corpus ನಿವೃತ್ತಿಯ ನಂತರ ಸುಮಾರು ${fundedYearsApprox} ವರ್ಷಗಳಿಗೆ ಸಾಕಾಗಬಹುದು.`)
                : t(lang, 'Your projected corpus is currently above the estimated requirement for your selected lifestyle.', 'ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಜೀವನಶೈಲಿಗೆ ಬೇಕಾದ ಅಂದಾಜು corpus ಗಿಂತ ನಿಮ್ಮ projected corpus ಹೆಚ್ಚಿನದಾಗಿದೆ.')}
            </p>
          </div>
          <div className="life-inputs">
            <SliderField label={t(lang, 'Monthly Expenses Now', 'ಇಂದಿನ ಮಾಸಿಕ ಖರ್ಚು')} value={monthlyExpensesNow} onChange={onMonthlyExpensesNowChange} min={10000} max={200000} step={1000} suffix="₹" />
            <SliderField label={t(lang, 'Inflation Rate', 'ದರ ಏರಿಕೆ ದರ')} value={inflationRate} onChange={onInflationRateChange} min={4} max={12} step={0.5} suffix="%" />
            <SliderField label={t(lang, 'Years to Retirement', 'ನಿವೃತ್ತಿಗೆ ವರ್ಷಗಳು')} value={yearsToRetire} onChange={onYearsToRetireChange} min={5} max={40} step={1} suffix=" yrs" />
            <div className="metric-box">
              <span>{t(lang, 'PROJECTED CORPUS', 'ಅಂದಾಜು Corpus')}</span>
              <strong>{formatCurrency(corpusAtRetirement)}</strong>
            </div>
            <div className="metric-box">
              <span>{t(lang, 'ESTIMATED CORPUS NEED', 'ಅಂದಾಜು Corpus ಅಗತ್ಯ')}</span>
              <strong>{formatCurrency(estimatedCorpusNeed)}</strong>
            </div>
            <div className="metric-box">
              <span>{t(lang, 'POST-RET RETURNS', 'ನಿವೃತ್ತಿಯ ನಂತರ Returns')}</span>
              <strong>{postRetReturn}%</strong>
            </div>
          </div>
        </div>

        <div className="expense-grid">
          {breakdown.breakdown.map(item => (
            <div key={item.label} className="expense-card expense-card--bright">
              <span>{item.label}</span>
              <strong>{formatCurrency(item.value)}</strong>
              {item.editable ? <i>{t(lang, 'Tap any amount to edit', 'ಮೊತ್ತವನ್ನು ತಿದ್ದುಪಡಿ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ')}</i> : null}
            </div>
          ))}
          <div className="expense-card expense-card--total">
            <span>{t(lang, 'TOTAL MONTHLY NEED', 'ಒಟ್ಟು ಮಾಸಿಕ ಅಗತ್ಯ')}</span>
            <strong>{formatCurrency(breakdown.total)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function CallSection({ lang }) {
  return (
    <section id="call" className="section section--framed">
      <div className="container">
        <SectionHeader
          lang={lang}
          number="04"
          eyebrow={t(lang, 'ONLY 18 FREE SLOTS LEFT THIS WEEK', 'ಈ ವಾರ ಕೇವಲ 18 ಉಚಿತ ಸ್ಲಾಟ್‌ಗಳು ಉಳಿದಿವೆ')}
          title={t(lang, 'Book a free call back', 'ಉಚಿತ ಕಾಲ್‌ಬ್ಯಾಕ್ ಬುಕ್ ಮಾಡಿ')}
          subtitle={t(lang, 'AMFI registered. No spam, ever. 24hr callback.', 'AMFI ನೋಂದಾಯಿತ. ಯಾವುದೇ spam ಇಲ್ಲ. 24 ಗಂಟೆಯೊಳಗೆ callback.')}
        />

        <div className="call-grid call-grid--tall">
          <div className="call-card">
            <div className="call-form">
              <a className="button button--primary button--full" href="https://docs.google.com/forms/d/e/1FAIpQLSe6dr_dxvy9rnnYZxHTQsWhhfpQp0fHcwgm-GGHQsfJLm03ug/viewform" target="_blank" rel="noreferrer noopener">
                {t(lang, 'Fill Google Form', 'Google Form ಭರ್ತಿ ಮಾಡಿ')}
              </a>
              <p className="journey-note">
                {t(lang, 'One short form. Our team will review your numbers and call you within 24 hours.', 'ಒಂದು ಚಿಕ್ಕ ಫಾರ್ಮ್. ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ಲೆಕ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ 24 ಗಂಟೆಯೊಳಗೆ ಕರೆಮಾಡುತ್ತದೆ.')}
              </p>
              <p className="fine-print">{t(lang, 'AMFI Registered. No Spam, Ever. 24hr Callback.', 'AMFI ನೋಂದಾಯಿತ. Spam ಇಲ್ಲ. 24 ಗಂಟೆಯೊಳಗೆ Callback.')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ lang }) {
  const qa = [
    {
      q: 'Is ₹5,000/month really enough for retirement?',
      aEn: 'It is a strong start, but usually not enough alone. Increase SIP each year to stay ahead of inflation.',
      aKn: '₹5,000 ಆರಂಭಕ್ಕೆ ಚೆನ್ನಾಗಿದೆ, ಆದರೆ ಒಂದೇ ಇದರಿಂದ ಸಾಕಾಗುವುದಿಲ್ಲ. ದರ ಏರಿಕೆಗೆ ತಕ್ಕಂತೆ SIP ಅನ್ನು ವರ್ಷಕ್ಕೊಂದು ಹೆಚ್ಚಿಸಿ.'
    },
    {
      q: 'What is the annual step-up and why does it matter?',
      aEn: 'Annual step-up means increasing SIP every year. Even 10% step-up can create a much larger corpus.',
      aKn: 'Annual step-up ಎಂದರೆ SIP ಅನ್ನು ವರ್ಷಕ್ಕೊಮ್ಮೆ ಹೆಚ್ಚಿಸುವುದು. 10% ಹೆಚ್ಚಳವೂ ದೀರ್ಘಾವಧಿಯಲ್ಲಿ ದೊಡ್ಡ corpus ಕೊಡುತ್ತದೆ.'
    },
    {
      q: 'Why does the calculator show 8% inflation?',
      aEn: '8% combines everyday inflation with lifestyle growth, giving a safer long-term estimate.',
      aKn: '8% ದರ ಏರಿಕೆ ಅಂದಾಜು ದಿನನಿತ್ಯದ ಖರ್ಚು ಏರಿಕೆ ಮತ್ತು ಜೀವನಶೈಲಿ ಏರಿಕೆಯನ್ನು ಸೇರಿಸಿ ಸುರಕ್ಷಿತ ಲೆಕ್ಕ ಕೊಡುತ್ತದೆ.'
    },
    {
      q: 'What is the withdrawal step-up and why is it on by default?',
      aEn: 'Post-retirement expenses also rise. Step-up keeps your withdrawal realistic year after year.',
      aKn: 'ನಿವೃತ್ತಿಯ ನಂತರವೂ ಖರ್ಚು ಏರುತ್ತದೆ. Withdrawal step-up ನಿಮ್ಮ ಆದಾಯವನ್ನು ವರ್ಷಕ್ಕೊಂದು ವಾಸ್ತವಿಕವಾಗಿರಿಸುತ್ತದೆ.'
    },
    {
      q: 'What is the minimum investment for PMS?',
      aEn: 'Most PMS strategies start from ₹50 lakh, based on SEBI rules and provider terms.',
      aKn: 'ಬಹುತೇಕ PMS ಯೋಜನೆಗಳು ₹50 ಲಕ್ಷದಿಂದ ಆರಂಭವಾಗುತ್ತವೆ. ಇದು SEBI ನಿಯಮಗಳು ಮತ್ತು ಪೂರೈಕೆದಾರರ ಷರತ್ತುಗಳ ಮೇಲೆ ಅವಲಂಬಿತ.'
    },
    {
      q: 'What is AIF and who is it for?',
      aEn: 'AIF is an Alternative Investment Fund, generally suitable for high-net-worth investors seeking advanced strategies.',
      aKn: 'AIF ಎಂದರೆ Alternative Investment Fund. ಇದು ಸಾಮಾನ್ಯವಾಗಿ ಹೆಚ್ಚಿನ ಹೂಡಿಕೆ ಸಾಮರ್ಥ್ಯ ಇರುವ ಹೂಡಿಕೆದಾರರಿಗೆ ಸೂಕ್ತ.'
    },
    {
      q: 'What are GIFT City Funds?',
      aEn: 'These are globally oriented investment structures based in GIFT City, often used for international diversification.',
      aKn: 'GIFT City Funds ಅಂದರೆ ಜಾಗತಿಕ ಹೂಡಿಕೆ ಅವಕಾಶಗಳಿಗೆ ವಿನ್ಯಾಸಗೊಳಿಸಿದ ನಿಧಿಗಳು, ಅಂತಾರಾಷ್ಟ್ರೀಯ ವಿಭಜನೆಗೆ ಉಪಯುಕ್ತ.'
    },
    {
      q: 'How is the "increase SIP by X" number calculated?',
      aEn: 'The model compares your required retirement corpus with projected corpus and converts the gap to a monthly SIP increase.',
      aKn: 'ನಿಮಗೆ ಬೇಕಾದ corpus ಮತ್ತು ನಿಮ್ಮ ಪ್ರಕ್ಷೇಪಿತ corpus ನಡುವಿನ ಅಂತರವನ್ನು ಲೆಕ್ಕಿಸಿ, ಅದನ್ನು ಮಾಸಿಕ SIP ಹೆಚ್ಚಳವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.'
    },
    {
      q: 'Is my data safe? Does Angel Investments see my numbers?',
      aEn: 'Your calculator inputs stay in your browser session. We do not store or track personal inputs from this tool.',
      aKn: 'ಈ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ನಲ್ಲಿ ನಮೂದಿಸಿದ ಡೇಟಾ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಇರುತ್ತದೆ. ವೈಯಕ್ತಿಕ ಸಂಖ್ಯೆಗಳು ಸಂಗ್ರಹವಾಗುವುದಿಲ್ಲ.'
    },
    {
      q: 'Can I use this calculator for my parents or spouse?',
      aEn: 'Yes. You can run separate scenarios for each family member by changing age, goals, and expenses.',
      aKn: 'ಹೌದು. ವಯಸ್ಸು, ಗುರಿ ಮತ್ತು ಖರ್ಚುಗಳನ್ನು ಬದಲಿಸಿ ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಪ್ರತ್ಯೇಕ ಲೆಕ್ಕ ಮಾಡಬಹುದು.'
    }
  ];

  return (
    <section className="section section--framed section--dark-soft">
      <div className="container">
        <SectionHeader
          lang={lang}
          number="05"
          eyebrow={t(lang, 'Common Questions', 'ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು')}
          title={t(lang, 'From our YouTube community', 'ನಮ್ಮ YouTube ಸಮುದಾಯದಿಂದ')}
          subtitle={t(lang, 'Simple, direct answers to common planning doubts.', 'ಯೋಜನೆಗೆ ಸಂಬಂಧಿಸಿದ ಸಾಮಾನ್ಯ ಅನುಮಾನಗಳಿಗೆ ಸರಳ ಮತ್ತು ನೇರ ಉತ್ತರಗಳು.')}
        />
        <div className="faq-list-simple">
          {qa.map(item => (
            <div key={item.q} className="faq-item-simple">
              <strong>{item.q}</strong>
              <p>{lang === 'kn' ? item.aKn : item.aEn}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ lang }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <img src="/angel-logo.svg" alt="Angel Investments Logo" className="footer-logo-large" />
          <p className="footer-company-copy">
            {t(
              lang,
              'Wealth Management & Investment Distribution. AMFI-registered. We deal exclusively in SEBI regulated products.',
              'ಸಂಪತ್ತಿನ ನಿರ್ವಹಣೆ ಮತ್ತು ಹೂಡಿಕೆ ವಿತರಣೆ. AMFI ನೋಂದಾಯಿತ. ನಾವು ಕೇವಲ SEBI ನಿಯಂತ್ರಿತ ಉತ್ಪನ್ನಗಳನ್ನೇ ನಿರ್ವಹಿಸುತ್ತೇವೆ.'
            )}
          </p>
        </div>
        <div>
          <h4>{t(lang, 'Connect', 'ಸಂಪರ್ಕ')}</h4>
          <a href="https://www.youtube.com/@angelinvestments_" target="_blank" rel="noreferrer noopener">YouTube</a>
          <a href="https://www.instagram.com/angelinvestments_/" target="_blank" rel="noreferrer noopener">Instagram</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSe6dr_dxvy9rnnYZxHTQsWhhfpQp0fHcwgm-GGHQsfJLm03ug/viewform" target="_blank" rel="noreferrer noopener">Fill Google Form</a>
          <a href="tel:+919035254332">+91 9035254332</a>
        </div>
        <div>
          <h4>Disclaimer</h4>
          <p>
            This calculator is for illustrative and educational purposes only. Angel Investments is AMFI-registered. We deal exclusively in SEBI regulated investment products — Mutual Funds, Portfolio Management Services (PMS), Alternative Investment Funds (AIF), and GIFT City Funds. We are not SEBI-registered Investment Advisors and do not provide regulated investment advice. All investments are subject to market risk. Past performance is not indicative of future results. Please read all scheme-related documents carefully before investing.
          </p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 Angel Investments Content Studios. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function App() {
  const [language, setLanguage] = useState('en');
  const [sharedPlanState, setSharedPlanState] = useState({
    currentAge: 20,
    retirementAge: 45,
    lifeExpectancy: 93,
    monthlyExpensesNow: 40000,
    inflationRate: 8,
    postRetReturn: 6,
    withdrawalStepUp: 6
  });
  const [corpusAtRetirement, setCorpusAtRetirement] = useState(21400000);

  const yearsToRetire = Math.max(1, sharedPlanState.retirementAge - sharedPlanState.currentAge);

  const setCurrentAge = value => {
    setSharedPlanState(prev => {
      const currentAge = clamp(Math.round(Number(value) || prev.currentAge), 18, 70);
      const retirementAge = Math.max(prev.retirementAge, currentAge + 1);
      const lifeExpectancy = Math.max(prev.lifeExpectancy, retirementAge);
      return { ...prev, currentAge, retirementAge, lifeExpectancy };
    });
  };

  const setRetirementAge = value => {
    setSharedPlanState(prev => {
      const minRetireAge = prev.currentAge + 1;
      const retirementAge = clamp(Math.round(Number(value) || prev.retirementAge), minRetireAge, 80);
      const lifeExpectancy = Math.max(prev.lifeExpectancy, retirementAge);
      return { ...prev, retirementAge, lifeExpectancy };
    });
  };

  const setYearsToRetire = value => {
    const years = clamp(Math.round(Number(value) || yearsToRetire), 5, 40);
    setRetirementAge(sharedPlanState.currentAge + years);
  };

  const setLifeExpectancy = value => {
    setSharedPlanState(prev => {
      const lifeExpectancy = clamp(Math.round(Number(value) || prev.lifeExpectancy), prev.retirementAge, 100);
      return { ...prev, lifeExpectancy };
    });
  };

  const setMonthlyExpensesNow = value => {
    setSharedPlanState(prev => ({
      ...prev,
      monthlyExpensesNow: clamp(Number(value) || prev.monthlyExpensesNow, 10000, 250000)
    }));
  };

  const setInflationRate = value => {
    setSharedPlanState(prev => ({
      ...prev,
      inflationRate: clamp(Number(value) || prev.inflationRate, 4, 12)
    }));
  };

  const setPostRetReturn = value => {
    setSharedPlanState(prev => ({
      ...prev,
      postRetReturn: clamp(Number(value) || prev.postRetReturn, 4, 10)
    }));
  };

  const setWithdrawalStepUp = value => {
    setSharedPlanState(prev => ({
      ...prev,
      withdrawalStepUp: clamp(Number(value) || prev.withdrawalStepUp, 0, 12)
    }));
  };

  return (
    <>
      <Navbar language={language} onLanguageChange={setLanguage} />
      <main>
        <Hero lang={language} />
        <SeedSection
          lang={language}
          currentAge={sharedPlanState.currentAge}
          retirementAge={sharedPlanState.retirementAge}
          onCurrentAgeChange={setCurrentAge}
          onRetirementAgeChange={setRetirementAge}
          onCorpusChange={setCorpusAtRetirement}
        />
        <HarvestSection
          lang={language}
          currentAge={sharedPlanState.currentAge}
          retirementAge={sharedPlanState.retirementAge}
          lifeExpectancy={sharedPlanState.lifeExpectancy}
          monthlyExpensesNow={sharedPlanState.monthlyExpensesNow}
          inflationRate={sharedPlanState.inflationRate}
          corpusAtRetirement={corpusAtRetirement}
          postRetReturn={sharedPlanState.postRetReturn}
          withdrawalStepUp={sharedPlanState.withdrawalStepUp}
          onRetirementAgeChange={setRetirementAge}
          onLifeExpectancyChange={setLifeExpectancy}
          onMonthlyExpensesNowChange={setMonthlyExpensesNow}
          onInflationRateChange={setInflationRate}
          onPostRetReturnChange={setPostRetReturn}
          onWithdrawalStepUpChange={setWithdrawalStepUp}
        />
        <LifeSection
          lang={language}
          monthlyExpensesNow={sharedPlanState.monthlyExpensesNow}
          inflationRate={sharedPlanState.inflationRate}
          yearsToRetire={yearsToRetire}
          corpusAtRetirement={corpusAtRetirement}
          lifeExpectancy={sharedPlanState.lifeExpectancy}
          retirementAge={sharedPlanState.retirementAge}
          postRetReturn={sharedPlanState.postRetReturn}
          onMonthlyExpensesNowChange={setMonthlyExpensesNow}
          onInflationRateChange={setInflationRate}
          onYearsToRetireChange={setYearsToRetire}
        />
        <CallSection lang={language} />
        <FaqSection lang={language} />
      </main>
      <Footer lang={language} />
    </>
  );
}
