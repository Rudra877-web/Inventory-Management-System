import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import {
  User,
  Shield,
  CreditCard,
  History,
  CheckCircle,
  Clock,
  AlertOctagon,
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
];

const Profile = () => {
  const { user, updateProfile, refreshMe } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Profile forms state
  const [name, setName] = useState(user?.name || '');
  const [bankName, setBankName] = useState(user?.bankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(user?.bankDetails?.ifscCode || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // KYC form state
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await api.get('/auth/logs');
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name,
        bankDetails: {
          bankName,
          accountNumber,
          ifscCode
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/kyc/submit', { panNumber, aadhaarNumber });
      if (res.data.success) {
        refreshMe();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (url) => {
    try {
      await updateProfile({ avatar: url });
    } catch (err) {
      console.error(err);
    }
  };

  const handle2FAToggle = async () => {
    try {
      await updateProfile({ twoFactorEnabled: !user?.twoFactorEnabled });
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: User },
    { id: 'bank', name: 'Bank Account', icon: CreditCard },
    { id: 'kyc', name: 'KYC Center', icon: Shield },
    { id: 'logs', name: 'Activity Log', icon: History }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass flex flex-col gap-1.5 h-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/10'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Form Fields Container */}
      <div className="lg:col-span-3 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass">
        
        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-4">Edit Profile</h3>
              
              {/* Avatar Picker */}
              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Avatar</span>
                <div className="flex gap-3">
                  {AVATARS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => handleAvatarChange(url)}
                      className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all ${
                        user?.avatar === url ? 'border-brand-500 scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={url} alt={`avatar-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-205"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-premium flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile Details'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-6 mt-6">
              <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Lock className="w-4.5 h-4.5" /> Modify Security Password
              </h3>
              
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-premium flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Two Factor Authentication Switch */}
            <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-6 mt-6">
              <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider mb-2">Two-Factor Authentication (2FA)</h3>
              <p className="text-[11px] font-semibold text-slate-550 dark:text-slate-400 leading-relaxed mb-4">
                Keep your portfolio trades safe. Turn on 2FA to prompt for a code on login. (Demo mock code is always <span className="text-brand-500 font-bold">123456</span>).
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handle2FAToggle}
                  className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${
                    user?.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-premium transform transition-transform ${
                    user?.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
                <span className="text-xs font-bold">{user?.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bank Account Tab */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Bank Details</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-4">
              Enter your routing bank card credentials for fast balance withdrawals and deposit verification.
            </p>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Chase Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1092837482"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IFSC / Routing Code</label>
                  <input
                    type="text"
                    placeholder="e.g. JPMC10293"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-premium flex items-center gap-1.5 transition-all"
              >
                {loading ? 'Saving...' : 'Save Bank Details'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* KYC Verification Center Tab */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">KYC Compliance Center</h3>

            {/* Status alerts */}
            {user?.kycStatus === 'Approved' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3.5">
                <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm">KYC Approved & Verified</h4>
                  <p className="text-[11px] font-semibold opacity-90 mt-0.5">Your identity is fully verified. Withdrawal limits have been unlocked.</p>
                </div>
              </div>
            )}

            {user?.kycStatus === 'Pending' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-3.5">
                <Clock className="w-8 h-8 text-amber-500 flex-shrink-0 animate-spin-slow" />
                <div>
                  <h4 className="font-extrabold text-sm">KYC Processing Pending</h4>
                  <p className="text-[11px] font-semibold opacity-90 mt-0.5">Your documents are undergoing administrative review. This usually takes less than 24 hours.</p>
                </div>
              </div>
            )}

            {(user?.kycStatus === 'Not Started' || user?.kycStatus === 'Rejected') && (
              <div className="space-y-5">
                {user?.kycStatus === 'Rejected' && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3.5">
                    <AlertOctagon className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm">KYC Application Rejected</h4>
                      <p className="text-[11px] font-semibold opacity-90 mt-0.5">Reason: Document scan was blurry. Please resubmit clear numbers.</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Financial regulations require identity verification before executing high-volume deposits or withdrawals. Please enter your PAN and Aadhaar numbers below.
                </p>

                <form onSubmit={handleKycSubmit} className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Card Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="e.g. ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Card Number</label>
                    <input
                      type="text"
                      maxLength={12}
                      required
                      placeholder="e.g. 109283748293"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-premium flex items-center gap-1.5 transition-all"
                  >
                    {loading ? 'Submitting...' : 'Submit Documents'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Security / Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider">Security Activity Log</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-4">
              Review login sessions, profile edits, and authentication statuses.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/40 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/10">
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">User Agent</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20 font-semibold text-slate-700 dark:text-slate-300">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-400">
                        No activity logs loaded.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log._id}>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {log.ipAddress}
                        </td>
                        <td className="py-3 px-4 font-medium text-[10px] text-slate-400 truncate max-w-xs" title={log.userAgent}>
                          {log.userAgent}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-400">
                          {new Date(log.createdAt || log.date).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
