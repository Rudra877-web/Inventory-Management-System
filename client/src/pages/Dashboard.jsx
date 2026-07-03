import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import MetricCard from '../components/MetricCard.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Briefcase,
  Wallet,
  Sparkles,
  Heart,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  RefreshCcw,
  Zap,
  Info
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#6366f1', '#14b8a6'];

const Dashboard = () => {
  const { user, refreshMe } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [quickTradeSymbol, setQuickTradeSymbol] = useState('AAPL');
  const [quickTradeShares, setQuickTradeShares] = useState('');
  const [quickTradeType, setQuickTradeType] = useState('Buy');
  const [marketPrices, setMarketPrices] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Tips array
  const financialTips = [
    "Diversify your assets. Don't put all your eggs in one basket.",
    "Invest consistently. Systematic Investment Plans (SIP) beat timing the market.",
    "Keep emergency funds worth 6 months of expenses in highly liquid FDs.",
    "Avoid high leverage/margin trading unless you are an expert.",
    "Review and rebalance your portfolio allocations quarterly."
  ];
  const [activeTip, setActiveTip] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setActiveTip(prev => (prev + 1) % financialTips.length);
    }, 10000);
    return () => clearInterval(tipInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/investments');
      if (res.data.success) {
        setData(res.data.data);
      }
      
      const priceRes = await api.get('/investments/market');
      if (priceRes.data.success) {
        setMarketPrices(priceRes.data.prices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickTrade = async (e) => {
    e.preventDefault();
    if (!quickTradeShares || Number(quickTradeShares) <= 0) return;
    
    setActionLoading(true);
    try {
      const activePrice = marketPrices[quickTradeSymbol]?.price || 100;
      const category = marketPrices[quickTradeSymbol]?.category || 'Stocks';
      
      if (quickTradeType === 'Buy') {
        const res = await api.post('/investments/buy', {
          symbol: quickTradeSymbol,
          shares: Number(quickTradeShares),
          buyPrice: activePrice,
          category
        });
        if (res.data.success) {
          setQuickTradeShares('');
          refreshMe();
          fetchDashboardData();
        }
      } else {
        const res = await api.post('/investments/sell', {
          symbol: quickTradeSymbol,
          shares: Number(quickTradeShares),
          sellPrice: activePrice
        });
        if (res.data.success) {
          setQuickTradeShares('');
          refreshMe();
          fetchDashboardData();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton.Card />
          <LoadingSkeleton.Card />
          <LoadingSkeleton.Card />
          <LoadingSkeleton.Card />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoadingSkeleton.Chart />
          </div>
          <div>
            <LoadingSkeleton.Card />
          </div>
        </div>
      </div>
    );
  }

  const { summary, investments, aiSuggestions } = data || {
    summary: {
      totalInvested: 0,
      currentPortfolioValue: 0,
      totalProfitLoss: 0,
      profitLossPercent: 0,
      todayGainLoss: 0,
      todayGainPercent: 0,
      healthScore: 50,
      riskProfile: 'Moderate',
      categoryAllocation: {}
    },
    investments: [],
    aiSuggestions: []
  };

  const totalAssetsVal = summary.currentPortfolioValue + summary.walletBalance;

  // Mock data for Growth Area Chart
  const growthData = [
    { name: 'Jan', value: summary.totalInvested * 0.4 },
    { name: 'Feb', value: summary.totalInvested * 0.52 },
    { name: 'Mar', value: summary.totalInvested * 0.65 },
    { name: 'Apr', value: summary.totalInvested * 0.8 },
    { name: 'May', value: summary.totalInvested * 0.95 },
    { name: 'Jun', value: summary.currentPortfolioValue }
  ];

  // Pie chart data
  const pieData = Object.keys(summary.categoryAllocation)
    .filter(cat => summary.categoryAllocation[cat] > 0)
    .map(cat => ({
      name: cat,
      value: summary.categoryAllocation[cat]
    }));

  const pieDataEmpty = pieData.length === 0;

  return (
    <div className="space-y-6">
      {/* Header Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Assets value"
          value={totalAssetsVal}
          icon={Briefcase}
          color="brand"
        />
        <MetricCard
          title="Invested Capital"
          value={summary.totalInvested}
          icon={Wallet}
          color="blue"
        />
        <MetricCard
          title="Total Profit / Loss"
          value={summary.totalProfitLoss}
          change={summary.profitLossPercent}
          icon={summary.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
          color={summary.totalProfitLoss >= 0 ? 'emerald' : 'red'}
        />
        <MetricCard
          title="Today's Performance"
          value={summary.todayGainLoss}
          change={summary.todayGainPercent}
          icon={summary.todayGainLoss >= 0 ? TrendingUp : TrendingDown}
          color={summary.todayGainLoss >= 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Main Charts Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Area Chart (2/3 col) */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Portfolio Growth</h3>
              <span className="text-xs text-slate-400 font-semibold">Performance over last 6 months</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Trade Form Box (1/3 col) */}
        <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-brand-500" /> Instant Order Placement
          </h3>
          <p className="text-xs text-slate-400 font-semibold mb-5 leading-relaxed">
            Direct trade interface linked to virtual cash balance.
          </p>

          <form onSubmit={handleQuickTrade} className="space-y-4">
            <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
              <button
                type="button"
                onClick={() => setQuickTradeType('Buy')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  quickTradeType === 'Buy'
                    ? 'bg-emerald-500 text-white shadow-premium'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Buy (Long)
              </button>
              <button
                type="button"
                onClick={() => setQuickTradeType('Sell')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  quickTradeType === 'Sell'
                    ? 'bg-brand-500 text-white shadow-premium'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Sell (Short)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset</label>
                <select
                  value={quickTradeSymbol}
                  onChange={(e) => setQuickTradeSymbol(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                >
                  {Object.keys(marketPrices).map((sym) => (
                    <option key={sym} value={sym}>
                      {sym} - {marketPrices[sym].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shares / Units</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  required
                  value={quickTradeShares}
                  onChange={(e) => setQuickTradeShares(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-[11px] font-bold flex justify-between">
              <span className="text-slate-400">Current Market Price:</span>
              <span className="text-slate-800 dark:text-white">
                ${marketPrices[quickTradeSymbol]?.price ? marketPrices[quickTradeSymbol].price.toLocaleString() : '100.00'}
              </span>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-premium flex items-center justify-center gap-2 text-white transition-all ${
                quickTradeType === 'Buy'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700'
                  : 'bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700'
              }`}
            >
              {actionLoading ? 'Executing Order...' : `Execute ${quickTradeType} Order`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Diversification & Recommendations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pie Chart Diversification (1 col) */}
        <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Asset Allocation</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mb-4 uppercase tracking-wider">Weight diversification</span>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center relative">
            {pieDataEmpty ? (
              <div className="text-center text-xs text-slate-400 font-semibold p-4">
                No active investments. Buy stocks or crypto above to generate chart weights.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {!pieDataEmpty && (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[10px] font-bold mt-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations Suggestion Box (1 col) */}
        <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" /> AI Suggestions
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold block mb-4 uppercase tracking-wider">Smart portfolio analyzer</span>
          </div>

          <div className="flex-grow space-y-3.5 max-h-[180px] overflow-y-auto pr-1">
            {aiSuggestions.map((sug, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{sug.type}</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    sug.impact === 'High' 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                      : sug.impact === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/10'
                  }`}>
                    {sug.impact} Impact
                  </span>
                </div>
                <p className="text-[11px] font-semibold leading-relaxed text-slate-600 dark:text-slate-400">
                  {sug.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Health Score & Tips (1 col) */}
        <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Health Score</h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Diversity Rating</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-extrabold">
              <Heart className="w-3.5 h-3.5 fill-current" /> {summary.healthScore}%
            </div>
          </div>

          {/* Simple progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 mb-6 overflow-hidden p-0.5 border border-slate-300/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.healthScore >= 80 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : summary.healthScore >= 60
                    ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${summary.healthScore}%` }}
            ></div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 flex gap-3 items-start">
            <Lightbulb className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Financial Wisdom</span>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-300">
                {financialTips[activeTip]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
