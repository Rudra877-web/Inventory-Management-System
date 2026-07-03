import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, LineChart, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, googleLogin, forgotPassword, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirected query messages
  const expired = searchParams.get('expired');
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  const [code2fa, setCode2fa] = useState('');

  // Forgot password flow state
  const [forgotFlow, setForgotFlow] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (forgotFlow) {
        await forgotPassword(forgotEmail);
        setForgotFlow(false);
      } else {
        const result = await login(email, password, code2fa);
        if (result && result.require2FA) {
          setShow2FA(true);
        } else if (result && result.success) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMockLogin = async () => {
    setLoading(true);
    try {
      const mockGoogleProfile = {
        email: 'investor_demo@investly.com',
        name: 'Alex Mercer',
        googleId: '1092837482937',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
      };
      const res = await googleLogin(mockGoogleProfile);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-5 bg-slate-950 text-white overflow-hidden font-sans">
      {/* Dynamic glow circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-success/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        {/* Logo Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white shadow-premium mb-3">
            <LineChart className="w-7 h-7" />
          </div>
          <h1 className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-brand-400 to-violet-300 bg-clip-text text-transparent">
            Investly
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Premium Wealth Manager
          </p>
        </div>

        {expired && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Your session has expired. Please sign in again.
          </div>
        )}

        {/* Auth Box (Glassmorphic dark design) */}
        <div className="glass-panel-dark p-8 rounded-3xl border border-white/5 shadow-premium">
          <h2 className="text-xl font-bold tracking-tight mb-2">
            {forgotFlow ? 'Recover Password' : show2FA ? 'Verification' : 'Welcome back'}
          </h2>
          <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">
            {forgotFlow 
              ? 'Enter your account email to receive a password reset link.' 
              : show2FA 
                ? 'Enter the 2-Factor code sent to your authenticator app (default mock is 123456).'
                : 'Manage your stock portfolios, analyze assets and hit financial goals.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {forgotFlow ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email e.g. alex@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold"
                  />
                </div>
              </div>
            ) : show2FA ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2FA Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    value={code2fa}
                    onChange={(e) => setCode2fa(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold text-center tracking-widest font-mono"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="alex@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotFlow(true)}
                      className="text-[10px] font-bold text-brand-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 hover:to-violet-600 font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 hover:shadow-glass transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : forgotFlow ? 'Send Recovery Link' : show2FA ? 'Confirm Code' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {forgotFlow ? (
            <button
              onClick={() => setForgotFlow(false)}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-white mt-5 transition-colors"
            >
              Back to Sign In
            </button>
          ) : show2FA ? (
            <button
              onClick={() => setShow2FA(false)}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-white mt-5 transition-colors"
            >
              Cancel Verification
            </button>
          ) : (
            <>
              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-white/5"></div>
                <span className="absolute bg-slate-950 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Or continue with
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleMockLogin}
                className="w-full py-3 rounded-2xl border border-white/5 hover:bg-white/5 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-premium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.833 0-8.75-3.87-8.75-8.63s3.917-8.63 8.75-8.63c2.203 0 4.093.81 5.62 2.237l3.11-3.11C18.173 1.134 15.428 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.07 0 11.76-4.977 11.76-11.986 0-.81-.073-1.428-.182-1.97H12.24z"
                  />
                </svg>
                Sign in with Google (Demo Auto-Login)
              </button>

              <p className="text-center text-xs font-semibold text-slate-400 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-400 hover:underline">
                  Sign up
                </Link>
              </p>

              {/* Quick Credentials Info Box for Testing */}
              <div className="mt-6 p-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-slate-400 leading-relaxed font-semibold">
                <span className="text-slate-200 block mb-1">💡 Demo Accounts:</span>
                • User Account: <span className="text-brand-400">investor_demo@investly.com</span> / password bypass (via Google button above)<br />
                • Admin Account: <span className="text-brand-400">admin@investly.com</span> / password: <span className="text-brand-400">admin123</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
