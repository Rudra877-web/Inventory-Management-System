import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import {
  LayoutDashboard,
  Briefcase,
  Eye,
  LineChart,
  Target,
  Calculator,
  User,
  Shield,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Check
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, refreshMe } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAction, setWalletAction] = useState('Deposit'); // 'Deposit' or 'Withdraw'
  const [walletAmount, setWalletAmount] = useState('');

  // Apply dark mode classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'theme'); // fallback or light
    }
  }, [darkMode]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotifDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Deposit/Withdraw handler
  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    if (!walletAmount || Number(walletAmount) <= 0) return;

    try {
      const endpoint = walletAction === 'Deposit' ? '/transactions/deposit' : '/transactions/withdraw';
      const res = await api.post(endpoint, { amount: Number(walletAmount) });
      if (res.data.success) {
        setWalletModalOpen(false);
        setWalletAmount('');
        refreshMe();
        // Fetch notifications to show the new wallet activity log
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Watchlist', href: '/watchlist', icon: Eye },
    { name: 'Markets', href: '/markets', icon: LineChart },
    { name: 'Financial Goals', href: '/goals', icon: Target },
    { name: 'Calculators', href: '/calculators', icon: Calculator },
    { name: 'Profile & Security', href: '/profile', icon: User },
  ];

  // If user is admin, append Admin Panel option
  if (user && user.role === 'admin') {
    navigation.push({ name: 'Admin Control', href: '/admin', icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Glow Blobs for Futuristic Glass Look */}
      <div className="radial-glows">
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/40">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white shadow-premium">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-300">
              Investly
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Fintech Platform
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-grow p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/10 to-violet-500/5 text-brand-600 dark:text-brand-400 border border-brand-500/10 shadow-glass'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/40 dark:hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors group"
          >
            <LogOut className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1 text-red-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex justify-between items-center px-5 py-4 border-b border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white">
            <LineChart className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-300">
            Investly
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="relative flex flex-col w-64 max-w-xs bg-white dark:bg-slate-900 h-full p-4 shadow-premium border-r border-slate-200/50 dark:border-slate-800/40 z-50">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-200/50 dark:border-slate-800/40 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white">
                <LineChart className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-violet-300">
                Investly
              </span>
            </div>
            
            <nav className="flex-grow space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-500 border border-brand-500/10'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 rounded-2xl mt-4"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              Sign Out
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Desktop Navbar */}
        <header className="hidden md:flex justify-between items-center px-8 py-5 border-b border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-950/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Hello, {user ? user.name.split(' ')[0] : 'Investor'} 👋
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Wallet Cash Balance Display */}
            <div className="flex items-center gap-3.5 px-4.5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 shadow-glass">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Cash</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                  ${user ? user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => { setWalletAction('Deposit'); setWalletModalOpen(true); }}
                  title="Deposit Cash"
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/10 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setWalletAction('Withdraw'); setWalletModalOpen(true); }}
                  title="Withdraw Cash"
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 flex items-center justify-center transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors shadow-glass"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors shadow-glass"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-premium p-4 z-30">
                  <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div
                          key={n._id}
                          onClick={() => !n.isRead && markNotificationRead(n._id)}
                          className={`p-2.5 rounded-xl text-xs flex flex-col gap-1 transition-colors cursor-pointer ${
                            n.isRead
                              ? 'bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500'
                              : 'bg-brand-500/5 dark:bg-brand-500/10 text-slate-700 dark:text-slate-300 border-l-2 border-brand-500'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-brand-500">
                              {n.type || 'Alert'}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 text-left p-1.5 pr-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 hover:border-brand-500/40 transition-colors shadow-glass"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-500 text-white font-extrabold flex items-center justify-center text-sm shadow-premium">
                  {user && user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    user ? user.name.charAt(0) : 'U'
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-tight">{user ? user.name : 'User'}</span>
                  <span className="text-[9px] font-semibold text-slate-400 tracking-wider capitalize">
                    {user ? user.role : 'Investor'}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-premium p-2 z-30">
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  {user && user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-xl"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-grow p-5 md:p-8 overflow-y-auto z-10 relative">
          {children}
        </main>
      </div>

      {/* Wallet Deposit/Withdraw Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
                <Wallet className="w-5 h-5 text-brand-500" />
                {walletAction === 'Deposit' ? 'Add Funds to Wallet' : 'Withdraw Funds to Bank'}
              </h3>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number"
                  placeholder="Enter dollar amount (e.g. 5000)"
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                />
              </div>

              {walletAction === 'Withdraw' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-[11px] font-semibold leading-relaxed text-amber-600 dark:text-amber-400">
                  ⚠️ Note: Withdrawals will be deposited into your verified bank account on file within 1 business day. Max withdrawal is limited by available cash.
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-premium text-white ${
                  walletAction === 'Deposit' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700' 
                    : 'bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700'
                }`}
              >
                {walletAction === 'Deposit' ? (
                  <>
                    <ArrowDownLeft className="w-4 h-4" /> Deposit Now
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" /> Withdraw Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
