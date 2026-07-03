import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, change, isPercent = false, prefix = '$', icon: Icon, color = 'brand' }) => {
  const isPositive = change >= 0;
  
  const colorMap = {
    brand: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  };

  const selectedColor = colorMap[color] || colorMap.brand;

  return (
    <div className="relative overflow-hidden group p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md shadow-glass hover:shadow-glass-hover transition-all duration-300 hover:-translate-y-1">
      {/* Decorative Blur Blob */}
      <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full opacity-10 blur-xl group-hover:scale-150 transition-transform duration-500 ${
        color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-brand-500'
      }`}></div>

      <div className="flex justify-between items-start mb-4">
        <span className="text-slate-400 dark:text-slate-500 text-sm font-semibold tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-2xl border flex items-center justify-center ${selectedColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
        </span>
        
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
