import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Gift, Package, AlertTriangle, Info, X } from 'lucide-react';
import { toastManager, ToastMessage, ToastType } from '../utils/toastManager';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'reward':
        return <Gift className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'crate':
        return <Package className="w-5 h-5 text-cyan-400 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getBgStyle = (type: ToastType) => {
    switch (type) {
      case 'reward':
        return 'bg-gradient-to-r from-amber-950/90 via-neutral-950/95 to-neutral-900/95 border-amber-500/50 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
      case 'crate':
        return 'bg-gradient-to-r from-cyan-950/90 via-neutral-950/95 to-neutral-900/95 border-cyan-500/50 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.25)]';
      case 'error':
        return 'bg-gradient-to-r from-rose-950/90 via-neutral-950/95 to-neutral-900/95 border-rose-500/50 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.25)]';
      case 'success':
      default:
        return 'bg-gradient-to-r from-emerald-950/90 via-neutral-950/95 to-neutral-900/95 border-emerald-500/50 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.25)]';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl text-right relative overflow-hidden ${getBgStyle(
              toast.type
            )}`}
          >
            {/* Accent Glow bar */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-emerald-500" />

            <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-black text-white leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed font-medium">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => toastManager.remove(toast.id)}
              className="shrink-0 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
