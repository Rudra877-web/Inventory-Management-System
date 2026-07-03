import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Zap,
  Newspaper,
  Calendar,
  X
} from 'lucide-react';

const Markets = () => {
  const { refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState({});
  const [activeTab, setActiveTab] = useState('Stocks');

  // Trade order states
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeShares, setTradeShares] = useState('');
  const [tradeType, setTradeType] = useState('Buy');
  const [actionLoading, setActionLoading] = useState(false);

  // Financial news mock data
  const marketNews = [
    {
      id: 1,
      title: "Federal Reserve hints at interest rate cuts as inflation begins to stabilize",
      source: "FinNews Daily",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Bitcoin registers a new monthly high, touching $65,200 behind institutional inflows",
      source: "CryptoTracker",
      time: "4 hours ago"
    },
    {
      id: 3,
      title: "Apple Inc. developers announce new AI assistant models at annual developer summit",
      source: "TechMarkets",
      time: "6 hours ago"
    },
    {
      id: 4,
      title: "Gold prices hit lifetime records on global asset hedging demands",
      source: "Commodity Times",
      time: "1 day ago"
    }
  ];

  const fetchMarkets = async () => {
    try {
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
    fetchMarkets();
    const interval = setInterval(async () => {
      try {
        const priceRes = await api.get('/investments/market');
        if (priceRes.data.success) {
          setMarketPrices(priceRes.data.prices);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000); // 3s tick
    return () => clearInterval(interval);
  }, []);

  const handleWatchlistAdd = async (sym, name, category) => {
    try {
      const res = await api.post('/watchlist/add', { symbol: sym, name, category });
      if (res.data.success) {
        alert(`${sym} added to your Watchlist!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Already in watchlist');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!tradeShares || Number(tradeShares) <= 0) return;

    setActionLoading(true);
    try {
      const activePrice = marketPrices[tradeSymbol]?.price || 100;
      const category = marketPrices[tradeSymbol]?.category || 'Stocks';

      if (tradeType === 'Buy') {
        const res = await api.post('/investments/buy', {
          symbol: tradeSymbol,
          shares: Number(tradeShares),
          buyPrice: activePrice,
          category
        });
        if (res.data.success) {
          setTradeModalOpen(false);
          setTradeShares('');
          refreshMe();
        }
      } else {
        const res = await api.post('/investments/sell', {
          symbol: tradeSymbol,
          shares: Number(tradeShares),
          sellPrice: activePrice
        });
        if (res.data.success) {
          setTradeModalOpen(false);
          setTradeShares('');
          refreshMe();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Order execution failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openOrder = (sym) => {
    setTradeSymbol(sym);
    setTradeShares('');
    setTradeType('Buy');
    setTradeModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton.Card />
        <LoadingSkeleton.Chart />
      </div>
    );
  }

  // Filter prices by category tab
  const filteredAssets = Object.keys(marketPrices)
    .filter(sym => marketPrices[sym].category === activeTab)
    .map(sym => ({
      symbol: sym,
      ...marketPrices[sym]
    }));

  const tabs = ['Stocks', 'Mutual Funds', 'Gold', 'Crypto'];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Live Market Tickers</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Explore active assets, monitor NAV changes, and execute long or short positions.</p>
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

      {/* Main Grid: Tickers Table vs Financial News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market Ticker Table (2/3 col) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass overflow-hidden h-fit">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                <th className="py-4 px-6">Asset Name</th>
                <th className="py-4 px-6">Ticker Price</th>
                <th className="py-4 px-6">Daily Change</th>
                <th className="py-4 px-6 text-right">Order Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredAssets.map(asset => {
                const isPositive = asset.changePercent >= 0;
                return (
                  <tr key={asset.symbol} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4.5 px-6 flex flex-col">
                      <span className="font-extrabold text-slate-800 dark:text-white text-sm">{asset.symbol}</span>
                      <span className="text-[10px] text-slate-405 dark:text-slate-500 font-semibold">{asset.name}</span>
                    </td>
                    <td className="py-4.5 px-6 font-bold font-mono text-slate-800 dark:text-white text-sm">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        isPositive ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{asset.changePercent}%
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleWatchlistAdd(asset.symbol, asset.name, asset.category)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-650 hover:bg-slate-200/50 dark:hover:text-slate-200 inline-flex transition-colors"
                        title="Add to Watchlist"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openOrder(asset.symbol)}
                        className="px-3.5 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 text-[10px] font-extrabold inline-flex items-center gap-1.5 transition-colors shadow-glass"
                      >
                        <Zap className="w-3.5 h-3.5" /> Trade Position
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial News Sidebar (1/3 col) */}
        <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col gap-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-brand-500" /> Market Feed & News
          </h3>

          <div className="space-y-4">
            {marketNews.map(news => (
              <div key={news.id} className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 space-y-1.5 hover:shadow-glass duration-250 transition-shadow">
                <h4 className="font-bold text-[11px] leading-relaxed text-slate-800 dark:text-white hover:text-brand-500 cursor-pointer">
                  {news.title}
                </h4>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>{news.source}</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Buy/Sell Ticker Modal */}
      {tradeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">
                Order Position: {tradeSymbol}
              </h3>
              <button
                onClick={() => setTradeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
                <button
                  type="button"
                  onClick={() => setTradeType('Buy')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    tradeType === 'Buy'
                      ? 'bg-emerald-500 text-white shadow-premium'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Buy Asset
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('Sell')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    tradeType === 'Sell'
                      ? 'bg-brand-500 text-white shadow-premium'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Sell Asset
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shares / Units</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  required
                  value={tradeShares}
                  onChange={(e) => setTradeShares(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-xs font-bold flex justify-between">
                <span className="text-slate-400">Market NAV Price:</span>
                <span className="text-slate-800 dark:text-white">
                  ${marketPrices[tradeSymbol]?.price ? marketPrices[tradeSymbol].price.toLocaleString() : '100.00'}
                </span>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold shadow-premium text-white flex items-center justify-center gap-1.5 transition-all ${
                  tradeType === 'Buy'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700'
                    : 'bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700'
                }`}
              >
                {actionLoading ? 'Executing Order...' : `Confirm ${tradeType}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Markets;
