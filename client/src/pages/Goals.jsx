import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CircleCheck,
  Coins
} from 'lucide-react';

const Goals = () => {
  const { user, refreshMe } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Allocation state
  const [allocationGoalId, setAllocationGoalId] = useState(null);
  const [allocationAmount, setAllocationAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !deadline) return;

    setActionLoading(true);
    try {
      const res = await api.post('/goals/create', {
        name: goalName,
        targetAmount: Number(targetAmount),
        deadline: new Date(deadline)
      });
      if (res.data.success) {
        setGoalName('');
        setTargetAmount('');
        setDeadline('');
        setModalOpen(false);
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this financial goal?')) return;
    try {
      const res = await api.delete(`/goals/delete/${id}`);
      if (res.data.success) {
        setGoals(prev => prev.filter(g => g._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocationAmount || Number(allocationAmount) <= 0) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/goals/allocate/${allocationGoalId}`, {
        amount: Number(allocationAmount)
      });

      if (res.data.success) {
        setAllocationGoalId(null);
        setAllocationAmount('');
        refreshMe();
        fetchGoals();

        // Trigger confetti celebration if the goal status becomes 'Achieved'!
        if (res.data.data.status === 'Achieved') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#10b981', '#f59e0b']
          });
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Allocation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        <LoadingSkeleton.Card />
        <LoadingSkeleton.Card />
        <LoadingSkeleton.Card />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Title and Create trigger */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Financial Targets & Goals</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Plan and fund your future milestones directly from your wallet balance.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-premium transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4.5 h-4.5" /> Create Financial Goal
        </button>
      </div>

      {/* Goals grid display */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
          <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          No financial goals created yet. Click "Create Financial Goal" above to start planning!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
            const isCompleted = goal.status === 'Achieved' || pct >= 100;

            return (
              <div
                key={goal._id}
                className="relative overflow-hidden p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-glass hover:shadow-glass-hover transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual completion overlay border */}
                {isCompleted && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2.5 rounded-xl border ${
                        isCompleted 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-brand-500/10 text-brand-500 border-brand-500/20'
                      }`}>
                        <Target className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">{goal.name}</h3>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end text-xs font-semibold mb-2 mt-6">
                    <span className="text-slate-400">Target Progress</span>
                    <span className={`font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-700 dark:text-white'}`}>{pct}%</span>
                  </div>

                  {/* Glass Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-300/10 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                          : 'bg-gradient-to-r from-brand-600 to-violet-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold mb-5.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Funded</span>
                      <span className="text-slate-800 dark:text-white mt-0.5">${goal.currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Target Capital</span>
                      <span className="text-slate-800 dark:text-white mt-0.5">${goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {isCompleted ? 'Target Achieved!' : `${daysLeft} Days left`}
                  </span>

                  {!isCompleted ? (
                    <button
                      onClick={() => { setAllocationGoalId(goal._id); setAllocationAmount(''); }}
                      className="px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/15 border border-brand-500/10 text-[10px] font-extrabold text-brand-500 dark:text-brand-400 flex items-center gap-1 transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5" /> Fund Goal
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                      <CircleCheck className="w-3.5 h-3.5 fill-emerald-500 text-white dark:text-slate-900" /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal creation modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight">Create Financial Goal</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dream House, Retirement Fund"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Capital ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-700 text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Creating Goal...' : 'Establish Target'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Funds Modal */}
      {allocationGoalId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 p-6 shadow-premium">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-2 text-brand-500">
                <Coins className="w-5 h-5" /> Allocate Cash to Goal
              </h3>
              <button
                onClick={() => setAllocationGoalId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fund Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder={`Max available: $${user ? user.balance.toLocaleString() : '0'}`}
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-[10px] font-semibold text-slate-500 leading-relaxed">
                ℹ️ Note: Funds will be moved directly out of your available cash wallet balance into this dedicated goal.
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 text-white font-bold text-sm shadow-premium flex items-center justify-center gap-2 mt-4 transition-all"
              >
                {actionLoading ? 'Funding...' : 'Confirm Allocation'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
