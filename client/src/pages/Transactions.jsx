import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Calendar
} from 'lucide-react';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  
  // Filter states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: {
          search,
          type,
          category,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setTransactions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [type, category, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  // Export reports to CSV
  const handleExportCSV = () => {
    if (!transactions.length) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Category,Symbol,Shares,Price,Amount,Status\n";
    
    transactions.forEach(t => {
      csvContent += `"${new Date(t.date || t.createdAt).toLocaleDateString()}","${t.type}","${t.category}","${t.symbol || ''}",${t.shares || 0},${t.price || 0},${t.amount},"${t.status}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and export controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Transaction Logs</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Monitor and query cash deposits, wallet withdrawals, and order transactions.</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          disabled={transactions.length === 0}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-xs font-bold text-slate-600 dark:text-slate-200 hover:border-brand-500/30 flex items-center gap-2 transition-all shadow-glass disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Export logs (CSV)
        </button>
      </div>

      {/* Filter and search control bar */}
      <div className="p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex-shrink-0">
          <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full justify-start md:justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filters:</span>
          </div>

          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
          >
            <option value="">All Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Withdraw">Withdraw</option>
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
          </select>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
          >
            <option value="">All Categories</option>
            <option value="Wallet">Wallet Cash</option>
            <option value="Stocks">Stocks</option>
            <option value="Crypto">Crypto</option>
            <option value="Mutual Funds">Mutual Funds</option>
            <option value="SIP">SIP</option>
            <option value="Gold">Gold</option>
            <option value="Fixed Deposit">Fixed Deposit</option>
            <option value="Real Estate">Real Estate</option>
          </select>
        </div>
      </div>

      {/* Transaction list table */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                <th className="py-4.5 px-6">Date</th>
                <th className="py-4.5 px-6">Transaction Type</th>
                <th className="py-4.5 px-6">Category</th>
                <th className="py-4.5 px-6">Asset Symbol</th>
                <th className="py-4.5 px-6">Price/Unit</th>
                <th className="py-4.5 px-6">Total Value</th>
                <th className="py-4.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-semibold">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <LoadingSkeleton.TableRow key={i} cols={7} />
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                transactions.map(t => {
                  const isIncoming = t.type === 'Deposit' || t.type === 'Sell';
                  return (
                    <tr key={t._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          {new Date(t.date || t.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isIncoming ? 'text-emerald-500' : 'text-brand-500'
                        }`}>
                          {isIncoming ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-slate-700 dark:text-slate-300">
                        {t.category}
                      </td>
                      <td className="py-4.5 px-6 font-bold text-slate-800 dark:text-white">
                        {t.symbol || '—'}
                      </td>
                      <td className="py-4.5 px-6 font-mono text-slate-500 dark:text-slate-400">
                        {t.price ? `$${t.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-4.5 px-6 font-bold font-mono text-slate-800 dark:text-white text-sm">
                        {isIncoming ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : t.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination logs bar */}
        {!loading && pagination.pages > 1 && (
          <div className="flex justify-between items-center px-6 py-4.5 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Showing page {pagination.page} of {pagination.pages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={pagination.page === pagination.pages}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
