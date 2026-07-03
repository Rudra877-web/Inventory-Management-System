import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, User, LineChart, ShieldCheck, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification step state
  const [showVerifyStep, setShowVerifyStep] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res && res.success) {
        setShowVerifyStep(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyEmail(verificationToken);
      if (res && res.success) {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-5 bg-slate-950 text-white overflow-hidden font-sans">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-success/5 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white shadow-premium mb-3">
            <LineChart className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-3xl bg-gradient-to-r from-brand-400 to-violet-300 bg-clip-text text-transparent">
            Investly
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Create an Account
          </span>
        </div>

        {/* Panel Box */}
        <div className="glass-panel-dark p-8 rounded-3xl border border-white/5 shadow-premium">
          {!showVerifyStep ? (
            <>
              <h2 className="text-xl font-bold tracking-tight mb-2">Create Account</h2>
              <p className="text-xs font-medium text-slate-400 mb-6">
                Start tracking and managing your investments with state-of-the-art analytical reports.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>

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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Create security password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm security password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 hover:to-violet-600 font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Sign Up'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center text-xs font-semibold text-slate-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Verify Email Address
              </h2>
              <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">
                A verification token has been logged to the **Node.js server console window**. Please copy it and paste it below to confirm your account activation:
              </p>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Verification Code</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter verification token e.g. wye839..."
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-white/5 rounded-2xl text-sm font-semibold text-center font-mono tracking-widest text-brand-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
