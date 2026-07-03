import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  Users,
  ShieldAlert,
  Coins,
  History,
  Check,
  X,
  CreditCard,
  TrendingUp,
  Wallet,
  DollarSign
} from 'lucide-react';

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Tab Lists data
  const [usersList, setUsersList] = useState([]);
  const [kycQueue, setKycQueue] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Balance modification states
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  
  // KYC Reject state
  const [rejectFormId, setRejectFormId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        if (res.data.success) setUsersList(res.data.data);
      } else if (activeTab === 'kyc') {
        const res = await api.get('/admin/kyc');
        if (res.data.success) setKycQueue(res.data.data);
      } else if (activeTab === 'transactions') {
        const res = await api.get('/admin/transactions');
        if (res.data.success) setTransactions(res.data.data);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/logs');
        if (res.data.success) setAuditLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      fetchTabContent();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  // KYC actions handlers
  const handleKycApprove = async (id) => {
    if (!window.confirm('Approve KYC verification for this user?')) return;
    try {
      const res = await api.put(`/admin/kyc/approve/${id}`);
      if (res.data.success) {
        alert('KYC Approved successfully');
        fetchTabContent();
        fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKycRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/kyc/reject/${rejectFormId}`, { remarks: rejectRemarks });
      if (res.data.success) {
        setRejectFormId(null);
        setRejectRemarks('');
        fetchTabContent();
        fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Modify user balance cash handler
  const handleModifyBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!balanceAmount || Number(balanceAmount) < 0) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/users/balance/${balanceModalUser._id}`, { balance: Number(balanceAmount) });
      if (res.data.success) {
        setBalanceModalUser(null);
        setBalanceAmount('');
        fetchTabContent();
        fetchAdminStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Backoffice Panel</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Oversee system registrations, approve KYC applications, audit transactions, and adjust user wallets.</p>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 w-fit border border-slate-300/10 shadow-glass">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          User Registry
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kyc'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          KYC Applications
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          System Transactions
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-glass'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Security Logs
        </button>
      </div>

      {/* Dashboard Overview content */}
      {activeTab === 'dashboard' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-5 h-5 text-brand-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.totalUsers}</h3>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending KYC Queue</span>
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">{stats.pendingKyc}</h3>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Invested Volume</span>
              <Coins className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">${stats.totalInvestedValue.toLocaleString()}</h3>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Cash Deposited</span>
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">${stats.totalDeposited.toLocaleString()}</h3>
          </div>
        </div>
      )}

      {/* Main Tab Lists Panel */}
      {activeTab !== 'dashboard' && (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 space-y-4">
                <LoadingSkeleton.TableRow />
                <LoadingSkeleton.TableRow />
                <LoadingSkeleton.TableRow />
              </div>
            ) : (
              <>
                {/* Users Tab List */}
                {activeTab === 'users' && (
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email Address</th>
                        <th className="py-4 px-6">Available Wallet Cash</th>
                        <th className="py-4 px-6">KYC Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                      {usersList.map(u => (
                        <tr key={u._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6 text-slate-850 dark:text-white font-bold">{u.name}</td>
                          <td className="py-4 px-6 font-medium">{u.email}</td>
                          <td className="py-4 px-6 font-mono font-bold">${u.balance.toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                              u.kycStatus === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : u.kycStatus === 'Pending'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              {u.kycStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => { setBalanceModalUser(u); setBalanceAmount(u.balance); }}
                                className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/10 text-[10px] font-extrabold text-brand-500 dark:text-brand-400 inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Coins className="w-3.5 h-3.5" /> Adjust Balance
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* KYC queue list */}
                {activeTab === 'kyc' && (
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                        <th className="py-4 px-6">User</th>
                        <th className="py-4 px-6">PAN Number</th>
                        <th className="py-4 px-6">Aadhaar Number</th>
                        <th className="py-4 px-6">Submission Status</th>
                        <th className="py-4 px-6 text-right">KYC Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                      {kycQueue.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-12 text-slate-450 font-bold">No KYC applications submitted.</td>
                        </tr>
                      ) : (
                        kycQueue.map(form => (
                          <tr key={form._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-4.5 px-6 flex flex-col">
                              <span className="font-bold text-slate-850 dark:text-white">{form.userName}</span>
                              <span className="text-[10px] text-slate-450">{form.userEmail}</span>
                            </td>
                            <td className="py-4.5 px-6 font-mono font-bold">{form.panNumber}</td>
                            <td className="py-4.5 px-6 font-mono">{form.aadhaarNumber}</td>
                            <td className="py-4.5 px-6">
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                                form.status === 'Approved'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : form.status === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                                {form.status}
                              </span>
                            </td>
                            <td className="py-4.5 px-6 text-right space-x-2">
                              {form.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleKycApprove(form._id)}
                                    className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 text-emerald-500 inline-flex transition-colors"
                                    title="Approve verification"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => { setRejectFormId(form._id); setRejectRemarks(''); }}
                                    className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-red-500 inline-flex transition-colors"
                                    title="Reject verification"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* System Transactions Monitoring */}
                {activeTab === 'transactions' && (
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                        <th className="py-4 px-6">User details</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6">Asset details</th>
                        <th className="py-4 px-6 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                      {transactions.map(t => (
                        <tr key={t._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6 flex flex-col">
                            <span className="font-bold text-slate-850 dark:text-white">{t.userName}</span>
                            <span className="text-[10px] text-slate-450">{t.userEmail}</span>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-400">{new Date(t.date || t.createdAt).toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`font-bold ${
                              t.type === 'Deposit' || t.type === 'Sell' ? 'text-emerald-500' : 'text-brand-500'
                            }`}>{t.type}</span>
                          </td>
                          <td className="py-4 px-6 font-bold">{t.symbol ? `${t.symbol} (${t.category})` : t.category}</td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-sm">${t.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Audit Security Logs */}
                {activeTab === 'logs' && (
                  <table className="w-full text-left border-collapse text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/10">
                        <th className="py-4 px-6">User details</th>
                        <th className="py-4 px-6">Security Event</th>
                        <th className="py-4 px-6">IP Address</th>
                        <th className="py-4 px-6 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
                      {auditLogs.map(log => (
                        <tr key={log._id} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6 flex flex-col">
                            <span className="font-bold text-slate-850 dark:text-white">{log.userName}</span>
                            <span className="text-[10px] text-slate-450">{log.userEmail}</span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">{log.action}</td>
                          <td className="py-4 px-6 font-mono text-slate-400">{log.ipAddress}</td>
                          <td className="py-4 px-6 text-right font-mono text-[10px] text-slate-450">{new Date(log.createdAt || log.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Adjust User Wallet balance Cash Modal */}
      {balanceModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">Adjust User Balance</h3>
              <button
                onClick={() => setBalanceModalUser(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleModifyBalanceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">User</label>
                <input
                  type="text"
                  disabled
                  value={`${balanceModalUser.name} (${balanceModalUser.email})`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-805 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Wallet Cash Balance ($)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4"
              >
                {actionLoading ? 'Updating...' : 'Adjust Wallet Cash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* KYC Reject remarks dialog Modal */}
      {rejectFormId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">Reject KYC Verification</h3>
              <button
                onClick={() => setRejectFormId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleKycRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejection Remarks</label>
                <textarea
                  required
                  placeholder="Explain reason for rejection e.g. blurry ID scan, wrong details..."
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold h-24"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Application'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
