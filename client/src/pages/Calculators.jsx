import React, { useState } from 'react';
import {
  Calculator,
  Coins,
  Percent,
  Calendar,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('SIP');

  // SIP states
  const [sipMonthly, setSipMonthly] = useState(1000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // EMI states
  const [emiPrincipal, setEmiPrincipal] = useState(50000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiYears, setEmiYears] = useState(15);

  // Compound states
  const [ciPrincipal, setCiPrincipal] = useState(10000);
  const [ciMonthly, setCiMonthly] = useState(200);
  const [ciRate, setCiRate] = useState(10);
  const [ciYears, setCiYears] = useState(15);

  // Retirement states
  const [retCurrentAge, setRetCurrentAge] = useState(30);
  const [retRetireAge, setRetRetireAge] = useState(60);
  const [retExpenses, setRetExpenses] = useState(2500);
  const [retInflation, setRetInflation] = useState(6);
  const [retReturns, setRetReturns] = useState(12);

  // SIP Calculation
  const calculateSIP = () => {
    const P = Number(sipMonthly);
    const i = Number(sipRate) / 12 / 100;
    const n = Number(sipYears) * 12;

    const totalValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const investedAmount = P * n;
    const estReturns = totalValue - investedAmount;

    return {
      invested: Math.round(investedAmount),
      returns: Math.round(estReturns),
      total: Math.round(totalValue)
    };
  };

  // EMI Calculation
  const calculateEMI = () => {
    const P = Number(emiPrincipal);
    const r = Number(emiRate) / 12 / 100;
    const n = Number(emiYears) * 12;

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    return {
      monthlyEmi: Math.round(emi),
      interest: Math.round(totalInterest),
      total: Math.round(totalPayment)
    };
  };

  // Compound Interest Calculation
  const calculateCI = () => {
    const P = Number(ciPrincipal);
    const PMT = Number(ciMonthly);
    const r = Number(ciRate) / 100;
    const t = Number(ciYears);
    const n = 12; // monthly compounding default

    // Compound interest on principal
    const valPrincipal = P * Math.pow(1 + r / n, n * t);
    // Compound interest on monthly payments
    const valContribution = PMT * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));

    const totalValue = valPrincipal + valContribution;
    const investedAmount = P + (PMT * 12 * t);
    const estReturns = totalValue - investedAmount;

    return {
      invested: Math.round(investedAmount),
      returns: Math.round(estReturns),
      total: Math.round(totalValue)
    };
  };

  // Retirement Corpus Calculation
  const calculateRetirement = () => {
    const currentAge = Number(retCurrentAge);
    const retireAge = Number(retRetireAge);
    const monthlyExp = Number(retExpenses);
    const inflation = Number(retInflation) / 100;
    const returns = Number(retReturns) / 100;

    const yearsToRetire = retireAge - currentAge;
    
    // Future expense inflated to retirement age
    const futureMonthlyExp = monthlyExp * Math.pow(1 + inflation, yearsToRetire);
    const futureAnnualExp = futureMonthlyExp * 12;

    // Capital needed at retirement assuming a safe withdrawal rate or perpetual return matching inflation
    const safeWithdrawalRate = returns - inflation;
    const requiredCorpus = safeWithdrawalRate > 0 
      ? futureAnnualExp / safeWithdrawalRate 
      : futureAnnualExp / 0.04; // fallback to 4% SWR

    // Monthly savings needed to hit this corpus assuming current returns
    const r = returns / 12;
    const n = yearsToRetire * 12;
    const monthlySavingsNeeded = n > 0 
      ? requiredCorpus / (((Math.pow(1 + r, n) - 1) / r) * (1 + r)) 
      : 0;

    return {
      futureExpense: Math.round(futureMonthlyExp),
      corpus: Math.round(requiredCorpus),
      savingsNeeded: Math.round(monthlySavingsNeeded)
    };
  };

  const tabs = ['SIP', 'EMI', 'Compound Interest', 'Retirement'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Investment Calculators</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Simulate growth and determine financial requirements for loans or retirement planning.</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 w-fit border border-slate-300/10 shadow-glass">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Inputs vs Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SIP Tab Inputs & Outputs */}
        {activeTab === 'SIP' && (() => {
          const results = calculateSIP();
          return (
            <>
              {/* Inputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass space-y-5">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Parameters</h3>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Contribution ($)</label>
                    <span className="text-xs font-extrabold text-brand-500">${sipMonthly.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={sipMonthly}
                    onChange={(e) => setSipMonthly(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Expected Annual Returns (%)</label>
                    <span className="text-xs font-extrabold text-brand-500">{sipRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="0.5"
                    value={sipRate}
                    onChange={(e) => setSipRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Duration (Years)</label>
                    <span className="text-xs font-extrabold text-brand-500">{sipYears} years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              {/* Outputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-6">Simulation Result</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Invested Capital</span>
                      <span className="font-bold text-slate-850 dark:text-white">${results.invested.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Estimated Gains</span>
                      <span className="font-bold text-emerald-500">${results.returns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5">
                      <span className="text-slate-400">Total Value</span>
                      <span className="font-extrabold text-brand-500 text-base">${results.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 flex gap-2.5 items-start mt-6">
                  <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 Fact: Compounding accelerates over time! If you increased your SIP duration by 5 more years, your total value would grow exponentially.
                  </p>
                </div>
              </div>
            </>
          );
        })()}

        {/* EMI Tab Inputs & Outputs */}
        {activeTab === 'EMI' && (() => {
          const results = calculateEMI();
          return (
            <>
              {/* Inputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass space-y-5">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Parameters</h3>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Loan Amount ($)</label>
                    <span className="text-xs font-extrabold text-brand-500">${emiPrincipal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Interest Rate (% p.a.)</label>
                    <span className="text-xs font-extrabold text-brand-500">{emiRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="0.1"
                    value={emiRate}
                    onChange={(e) => setEmiRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Tenure (Years)</label>
                    <span className="text-xs font-extrabold text-brand-500">{emiYears} years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={emiYears}
                    onChange={(e) => setEmiYears(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              {/* Outputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-6">Simulation Result</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Monthly EMI</span>
                      <span className="font-extrabold text-brand-500 text-base">${results.monthlyEmi.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Principal Amount</span>
                      <span className="font-bold text-slate-800 dark:text-white">${emiPrincipal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5">
                      <span className="text-slate-400">Total Interest Payable</span>
                      <span className="font-bold text-red-500">${results.interest.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 flex gap-2.5 items-start mt-6">
                  <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 Tip: Consider prepaying a small lump sum extra each year. Prepaying just 1 extra EMI annually can slash your interest payments and cut years off your tenure.
                  </p>
                </div>
              </div>
            </>
          );
        })()}

        {/* Compound Interest Tab Inputs & Outputs */}
        {activeTab === 'Compound Interest' && (() => {
          const results = calculateCI();
          return (
            <>
              {/* Inputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass space-y-5">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Parameters</h3>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Initial Principal ($)</label>
                    <span className="text-xs font-extrabold text-brand-500">${ciPrincipal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={ciPrincipal}
                    onChange={(e) => setCiPrincipal(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Contribution ($)</label>
                    <span className="text-xs font-extrabold text-brand-500">${ciMonthly.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="50"
                    value={ciMonthly}
                    onChange={(e) => setCiMonthly(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Annual Return Rate (%)</label>
                    <span className="text-xs font-extrabold text-brand-500">{ciRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="25"
                    step="0.5"
                    value={ciRate}
                    onChange={(e) => setCiRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Tenure (Years)</label>
                    <span className="text-xs font-extrabold text-brand-500">{ciYears} years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={ciYears}
                    onChange={(e) => setCiYears(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              {/* Outputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-6">Simulation Result</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Total Invested</span>
                      <span className="font-bold text-slate-850 dark:text-white">${results.invested.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Accrued Compound Returns</span>
                      <span className="font-bold text-emerald-500">${results.returns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5">
                      <span className="text-slate-400">Future Balance Value</span>
                      <span className="font-extrabold text-brand-500 text-base">${results.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 flex gap-2.5 items-start mt-6">
                  <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 Rule of 72: Divide 72 by your annual interest rate to find out exactly how many years it will take for your investment capital to double! At {ciRate}%, your money doubles in about {(72 / ciRate).toFixed(1)} years.
                  </p>
                </div>
              </div>
            </>
          );
        })()}

        {/* Retirement Tab Inputs & Outputs */}
        {activeTab === 'Retirement' && (() => {
          const results = calculateRetirement();
          return (
            <>
              {/* Inputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass space-y-5">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Parameters</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Current Age</label>
                    <input
                      type="number"
                      value={retCurrentAge}
                      onChange={(e) => setRetCurrentAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Retirement Age</label>
                    <input
                      type="number"
                      value={retRetireAge}
                      onChange={(e) => setRetRetireAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Current Monthly Expense ($)</label>
                    <span className="text-xs font-extrabold text-brand-500">${retExpenses.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="100"
                    value={retExpenses}
                    onChange={(e) => setRetExpenses(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Expected Inflation Rate (%)</label>
                    <span className="text-xs font-extrabold text-brand-500">{retInflation}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={retInflation}
                    onChange={(e) => setRetInflation(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Expected ROI Post-retirement (%)</label>
                    <span className="text-xs font-extrabold text-brand-500">{retReturns}%</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="18"
                    step="0.5"
                    value={retReturns}
                    onChange={(e) => setRetReturns(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              {/* Outputs */}
              <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-6">Simulation Result</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Monthly Expense at Retirement (Inflated)</span>
                      <span className="font-bold text-slate-850 dark:text-white">${results.futureExpense.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Required Net Retirement Corpus</span>
                      <span className="font-extrabold text-emerald-500 text-base">${results.corpus.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold py-2.5">
                      <span className="text-slate-400">Recommended Monthly Savings Needed</span>
                      <span className="font-extrabold text-brand-500">${results.savingsNeeded.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 flex gap-2.5 items-start mt-6">
                  <Info className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 Retirement wisdom: The earlier you start saving, the less you have to save monthly due to compounding over time. Start today to lower your required monthly savings!
                  </p>
                </div>
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
};

export default Calculators;
