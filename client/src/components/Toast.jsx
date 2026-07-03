import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type, visible, onClose }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-premium border backdrop-blur-md transition-all duration-300 ${
            type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          )}
          
          <span className="text-sm font-medium pr-2">{message}</span>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
