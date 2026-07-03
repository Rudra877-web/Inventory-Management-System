import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  Eye,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  LineChart,
  DollarSign,
  Zap,
  X
} from 'lucide-react';

const Watchlist = () => {
  const { refreshMe } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [marketPrices, setMarketPrices] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [symbol, setSymbol] = useState('AAPL');

  // Order trade state
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeShares, setTradeShares] = useState('');
  const [tradeType, setTradeType] = useState('Buy');

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      if (res.data.success) {
        setWatchlist(res.data.data);
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
    fetchWatchlist();
    // Update live prices every 3 seconds to show fluctuating stock rates!
    const interval = setInterval(async () => {
      try {
        const priceRes = await api.get('/investments/market');
        if (priceRes.data.success) {
          setMarketPrices(priceRes.data.prices);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const asset = marketPrices[symbol];
      if (!asset) return;

      const res = await api.post('/watchlist/add', {
        symbol,
        name: asset.name,
        category: asset.category
      });

      if (res.data.success) {
        setModalOpen(false);
        fetchWatchlist();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (sym) => {
    try {
      const res = await api.delete(`/watchlist/remove/${sym}`);
      if (res.data.success) {
        setWatchlist(prev => prev.filter(item => item.symbol !== sym));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTradeSubmit = async (e) => {
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
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openTrade = (sym) => {
    setTradeSymbol(sym);
    setTradeShares('');
    setTradeType('Buy');
    setTradeModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton.Card />
        <div className="p-6 rounded-3xl border border-slate-200/50 bg-white/40 animate-pulse h-96"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Assets Watchlist</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Track live ticker prices and place immediate purchase orders.</p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-premium transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4.5 h-4.5" /> Watch New Asset
        </button>
      </div>

      {/* Watchlist Table Grid */}
      {watchlist.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
          <Eye className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          Your watchlist is empty. Add stocks or crypto assets above to track prices!
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                  <th className="py-4.5 px-6">Asset</th>
                  <th className="py-4.5 px-6">Category</th>
                  <th className="py-4.5 px-6">Live Ticker Price</th>
                  <th className="py-4.5 px-6">24h Gain/Loss</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-semibold">
                {watchlist.map(item => {
                  const priceInfo = marketPrices[item.symbol] || { price: 100, changePercent: 0 };
                  const isPositive = priceInfo.changePercent >= 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{item.symbol}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{item.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/5 text-brand-500 dark:text-brand-400 border border-brand-500/10">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold font-mono text-slate-800 dark:text-white text-sm">
                        ${priceInfo.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-0.5 font-bold ${
                          isPositive ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}{priceInfo.changePercent}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openTrade(item.symbol)}
                          className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/10 text-[10px] font-extrabold text-brand-500 dark:text-brand-400 inline-flex items-center gap-1 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" /> Buy / Sell
                        </button>
                        
                        <button
                          onClick={() => handleRemove(item.symbol)}
                          title="Remove Watch"
                          className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Watchlist modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">Add Asset to Watch</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Ticker Asset</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                >
                  {Object.keys(marketPrices).map(sym => (
                    <option key={sym} value={sym}>
                      {sym} — {marketPrices[sym].name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 transition-all"
              >
                {actionLoading ? 'Adding...' : 'Confirm Watch'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Buy/Sell Ticker Modal */}
      {tradeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">
                Order Placement: {tradeSymbol}
              </h3>
              <button
                onClick={() => setTradeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTradeSubmit} className="space-y-4">
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
                <span className="text-slate-400">Trading Price:</span>
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
                {actionLoading ? 'Processing Order...' : `Confirm ${tradeType}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
