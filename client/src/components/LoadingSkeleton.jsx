import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800/50">
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="py-4 px-6">
          <div className={`h-4 bg-slate-200 dark:bg-slate-800 rounded ${i === 0 ? 'w-24' : 'w-16'}`}></div>
        </td>
      ))}
    </tr>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md animate-pulse h-[300px] flex flex-col justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
      <div className="flex-grow flex items-end gap-3 px-2">
        {Array(12).fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-slate-200 dark:bg-slate-800 rounded-t-lg w-full"
            style={{ height: `${20 + Math.random() * 70}%` }}
          ></div>
        ))}
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mt-6"></div>
    </div>
  );
};

const LoadingSkeleton = {
  Card: CardSkeleton,
  TableRow: TableRowSkeleton,
  Chart: ChartSkeleton
};

export default LoadingSkeleton;
