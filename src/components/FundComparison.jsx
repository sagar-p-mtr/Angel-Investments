import { useEffect, useMemo, useState } from 'react';
import { calculateCAGR, debounce, getFundNAV, parseNAVData, searchFunds } from '../api/nav';

const MAX_FUNDS = 5;
const PRESET_FILTERS = [
  'Low Duration',
  'Bluechip',
  'Small Cap',
  'Tax Saver (ELSS)',
  'Liquid Fund'
];

export default function FundComparison() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [comparisonFunds, setComparisonFunds] = useState([]);
  const [loadingSchemeCode, setLoadingSchemeCode] = useState('');

  const search = useMemo(
    () =>
      debounce(async value => {
        const normalized = value.trim();
        if (!normalized) {
          setResults([]);
          setLoadingResults(false);
          return;
        }

        try {
          const funds = await searchFunds(normalized);
          setResults(funds.slice(0, 6));
        } catch {
          setResults([]);
        } finally {
          setLoadingResults(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    setLoadingResults(true);
    search(query);
  }, [query, search]);

  const addFund = async fund => {
    if (comparisonFunds.length >= MAX_FUNDS || comparisonFunds.some(item => item.schemeCode === fund.schemeCode)) return;
    setLoadingSchemeCode(fund.schemeCode);
    try {
      const navData = await getFundNAV(fund.schemeCode);
      const parsed = parseNAVData(navData);
      if (!parsed) return;

      const [cagr1, cagr3, cagr5] = [1, 3, 5].map(years => calculateCAGR(navData, years));
      setComparisonFunds(prev => [
        ...prev,
        {
          schemeCode: fund.schemeCode,
          schemeName: fund.schemeName,
          nav: parsed.nav,
          date: parsed.date,
          cagr1,
          cagr3,
          cagr5
        }
      ]);
    } catch {
      // keep UI stable on API failure
    } finally {
      setLoadingSchemeCode('');
    }
  };

  const removeFund = schemeCode => {
    setComparisonFunds(prev => prev.filter(item => item.schemeCode !== schemeCode));
  };

  const bestValues = useMemo(() => {
    return {
      cagr1: Math.max(0, ...comparisonFunds.map(item => item.cagr1 || 0)),
      cagr3: Math.max(0, ...comparisonFunds.map(item => item.cagr3 || 0)),
      cagr5: Math.max(0, ...comparisonFunds.map(item => item.cagr5 || 0))
    };
  }, [comparisonFunds]);

  return (
    <section id="comparison" className="section section--alt">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Scheme Comparison</p>
          <h2>Search and add multiple funds to compare returns side-by-side</h2>
        </div>

        <div className="search-panel">
          <div className="search-panel__top">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search fund to compare..." aria-label="Search funds to compare" />
            <div className="filter-pills">
              {PRESET_FILTERS.map(label => (
                <button key={label} type="button" className="pill" onClick={() => setQuery(label)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-results">
            {loadingResults ? (
              <div className="state-card">Searching funds...</div>
            ) : results.length ? (
              results.map(item => (
                <div key={item.schemeCode} className="fund-result-card">
                  <div>
                    <strong>{item.schemeName}</strong>
                    <span>Scheme Code: {item.schemeCode}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => addFund(item)}
                    disabled={comparisonFunds.length >= MAX_FUNDS || loadingSchemeCode === item.schemeCode}
                  >
                    {loadingSchemeCode === item.schemeCode ? 'Adding Fund...' : 'Add Fund'}
                  </button>
                </div>
              ))
            ) : query.trim() ? (
              <div className="state-card">No funds found.</div>
            ) : (
              <div className="state-card">Search above to add funds to this table.</div>
            )}
          </div>
        </div>

        <div className="table-card">
          {comparisonFunds.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Scheme Name</th>
                    <th>NAV</th>
                    <th>1Y (%)</th>
                    <th>3Y (%)</th>
                    <th>5Y (%)</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFunds.map(fund => (
                    <tr key={fund.schemeCode}>
                      <td>
                        <strong>{fund.schemeName}</strong>
                      </td>
                      <td>₹{Number(fund.nav).toFixed(2)}</td>
                      <td className={fund.cagr1 === bestValues.cagr1 ? 'best-value' : ''}>{fund.cagr1.toFixed(2)}%</td>
                      <td className={fund.cagr3 === bestValues.cagr3 ? 'best-value' : ''}>{fund.cagr3.toFixed(2)}%</td>
                      <td className={fund.cagr5 === bestValues.cagr5 ? 'best-value' : ''}>{fund.cagr5.toFixed(2)}%</td>
                      <td>
                        <button type="button" className="link-btn" onClick={() => removeFund(fund.schemeCode)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="state-card">Search above to add funds to this table.</div>
          )}
        </div>
      </div>
    </section>
  );
}
