import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Tag,
  Calendar,
  X,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = ['Stocks', 'Mutual Funds', 'SIP', 'Gold', 'Crypto', 'Fixed Deposit', 'Real Estate'];

const Portfolio = () => {
  const { refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Manual Add Form states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formCategory, setFormCategory] = useState('Stocks');
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formShares, setFormShares] = useState('');
  const [formBuyPrice, setFormBuyPrice] = useState('');
  const [formCurrentPrice, setFormCurrentPrice] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/investments');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setFormCategory('Stocks');
    setFormName('');
    setFormSymbol('');
    setFormShares('');
    setFormBuyPrice('');
    setFormCurrentPrice('');
    setAddModalOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setIsEditing(true);
    setEditId(inv._id);
    setFormCategory(inv.category);
    setFormName(inv.name);
    setFormSymbol(inv.symbol);
    setFormShares(inv.shares);
    setFormBuyPrice(inv.buyPrice);
    setFormCurrentPrice(inv.currentPrice);
    setAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (isEditing) {
        const res = await api.put(`/investments/update/${editId}`, {
          category: formCategory,
          name: formName,
          shares: Number(formShares),
          buyPrice: Number(formBuyPrice),
          currentPrice: Number(formCurrentPrice)
        });
        if (res.data.success) {
          setAddModalOpen(false);
          fetchPortfolio();
          refreshMe();
        }
      } else {
        const res = await api.post('/investments/add-manual', {
          category: formCategory,
          name: formName,
          symbol: formSymbol,
          shares: Number(formShares),
          buyPrice: Number(formBuyPrice),
          currentPrice: Number(formCurrentPrice)
        });
        if (res.data.success) {
          setAddModalOpen(false);
          fetchPortfolio();
          refreshMe();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this investment?')) return;
    try {
      const res = await api.delete(`/investments/delete/${id}`);
      if (res.data.success) {
        fetchPortfolio();
        refreshMe();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Portfolio report to CSV
  const handleExportCSV = () => {
    if (!data || !data.investments.length) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Asset,Symbol,Category,Shares,Buy Price,Current Price,Current Value,Profit/Loss,Gain %\n";
    
    data.investments.forEach(inv => {
      csvContent += `"${inv.name}","${inv.symbol}","${inv.category}",${inv.shares},${inv.buyPrice},${inv.currentPrice},${inv.currentValue},${inv.profitOrLoss},${inv.gainPercent}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton.Card />
        <div className="p-6 rounded-3xl border border-slate-200/50 bg-white/40 animate-pulse h-96"></div>
      </div>
    );
  }

  const { investments, summary } = data || { investments: [], summary: { totalInvested: 0, currentPortfolioValue: 0, totalProfitLoss: 0, profitLossPercent: 0 } };

  // Filter logic
  const filteredInvestments = investments.filter(inv => {
    if (activeFilter === 'All') return true;
    return inv.category === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Portfolio overview top banner card */}
      <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-gradient-to-tr from-brand-650 to-violet-500 text-white shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Blob decor */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-white/5 blur-3xl translate-x-20 translate-y-20 pointer-events-none"></div>
        
        <div className="space-y-1 z-15">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Net Asset Summary</span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            ${summary.currentPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg border bg-white/10 ${
              summary.totalProfitLoss >= 0 ? 'text-emerald-300 border-emerald-400/20' : 'text-red-300 border-red-400/20'
            }`}>
              {summary.totalProfitLoss >= 0 ? '+' : ''}${summary.totalProfitLoss.toLocaleString()} ({summary.profitLossPercent}%)
            </span>
            <span className="text-[10px] text-slate-200 font-semibold uppercase tracking-wider">Total gains</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 z-15">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Report (CSV)
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="px-4.5 py-2.5 rounded-2xl bg-white text-brand-600 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-2 shadow-premium transition-colors"
          >
            <Plus className="w-4.5 h-4.5" /> Add Investment Asset
          </button>
        </div>
      </div>

      {/* Category filters tab list */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 w-fit border border-slate-300/10 shadow-glass">
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'All'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          All Assets
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === cat
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Portfolio Table list container */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                <th className="py-4.5 px-6">Asset Name</th>
                <th className="py-4.5 px-6">Category</th>
                <th className="py-4.5 px-6">Units/Shares</th>
                <th className="py-4.5 px-6">Buy Avg.</th>
                <th className="py-4.5 px-6">Current Value</th>
                <th className="py-4.5 px-6">Returns</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-semibold">
              {filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">
                    No investments found matching this asset filter.
                  </td>
                </tr>
              ) : (
                filteredInvestments.map(inv => {
                  const isPositive = inv.profitOrLoss >= 0;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{inv.symbol}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{inv.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/5 text-brand-500 dark:text-brand-400 border border-brand-500/10">
                          {inv.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-700 dark:text-slate-300">
                        {inv.shares.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        ${inv.buyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white font-mono">
                          ${inv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          Current Price: ${inv.currentPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-0.5 font-bold ${
                          isPositive ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}${inv.profitOrLoss.toLocaleString()} ({inv.gainPercent}%)
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          title="Modify Entry"
                          className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors inline-flex"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          title="Remove Entry"
                          className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add / Edit Asset Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">
                {isEditing ? 'Modify Investment Asset' : 'Add Investment Asset'}
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symbol</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. APPL, GOLD, REAL1"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Inc, physical gold bar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shares/Units</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5"
                    value={formShares}
                    onChange={(e) => setFormShares(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buy Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 150"
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current NAV ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Same as Buy"
                    value={formCurrentPrice}
                    onChange={(e) => setFormCurrentPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : isEditing ? 'Update Entry' : 'Add to Portfolio'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
