import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, Shield, Zap, X, Crosshair, Users } from 'lucide-react';
import { MAP_WIDTH, MAP_HEIGHT } from '../game/mapData';

interface InGame3DMapBriefingProps {
  isOpen: boolean;
  onClose: () => void;
  playerPos?: { x: number; y: number };
  botsPos?: Array<{ id: string; name: string; x: number; y: number; health: number; isEnemy: boolean }>;
}

export const InGame3DMapBriefing: React.FC<InGame3DMapBriefingProps> = ({
  isOpen,
  onClose,
  playerPos,
  botsPos = [],
}) => {
  if (!isOpen) return null;

  const mapScaleX = 1 / (MAP_WIDTH || 3200);
  const mapScaleY = 1 / (MAP_HEIGHT || 1800);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.85, rotateX: 20, opacity: 0 }}
        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
        exit={{ scale: 0.85, rotateX: -20, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        style={{ perspective: 1200 }}
        className="relative z-10 w-full max-w-3xl rounded-3xl bg-neutral-950/95 border border-cyan-500/50 p-6 shadow-[0_0_60px_rgba(6,182,212,0.4)] text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Crosshair className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono tracking-wider text-cyan-300">
                الرادار التكتيكي ومسح الحلبة 3D
              </h2>
              <p className="text-xs text-neutral-400">OUTPOST TACTICAL HOLOGRAPHIC SCANNER</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Map Grid Canvas */}
        <div className="relative w-full h-80 rounded-2xl bg-[#071318] border border-cyan-500/30 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Cyber grid lines */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Holographic scanner line sweep */}
          <motion.div
            animate={{ top: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)] pointer-events-none"
          />

          {/* Outpost map landmarks representations */}
          <div className="absolute left-[45%] top-[20%] w-[10%] h-[35%] border border-cyan-400/40 bg-cyan-500/10 rounded-lg flex items-center justify-center text-[10px] text-cyan-300 font-mono text-center">
            برج المراقبة المركزي
          </div>

          <div className="absolute left-[15%] top-[30%] w-[12%] h-[20%] border border-amber-400/40 bg-amber-500/10 rounded-lg flex items-center justify-center text-[10px] text-amber-300 font-mono text-center">
            منصة القناصة الغربية
          </div>

          <div className="absolute right-[15%] top-[30%] w-[12%] h-[20%] border border-amber-400/40 bg-amber-500/10 rounded-lg flex items-center justify-center text-[10px] text-amber-300 font-mono text-center">
            منصة الدفاع الشرقية
          </div>

          <div className="absolute left-[20%] bottom-[15%] w-[60%] h-[20%] border border-purple-400/40 bg-purple-500/10 rounded-lg flex items-center justify-center text-[10px] text-purple-300 font-mono text-center">
            الأنفاق السرية ومستودع الذخيرة
          </div>

          {/* Player Blip */}
          {playerPos && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
              style={{
                left: `${Math.max(5, Math.min(95, (playerPos.x / 3200) * 100))}%`,
                top: `${Math.max(5, Math.min(95, (playerPos.y / 1800) * 100))}%`,
              }}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,1)] animate-ping absolute" />
              <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,1)] relative z-10" />
              <span className="text-[10px] font-bold text-cyan-300 mt-1 px-1.5 py-0.5 rounded bg-black/70 font-mono">
                أنت (YOU)
              </span>
            </div>
          )}

          {/* Enemy / Bot Blips */}
          {botsPos.map((bot, idx) => (
            <div
              key={bot.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
              style={{
                left: `${Math.max(5, Math.min(95, (bot.x / 3200) * 100))}%`,
                top: `${Math.max(5, Math.min(95, (bot.y / 1800) * 100))}%`,
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white/80 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
              <span className="text-[9px] font-bold text-red-300 mt-0.5 px-1 py-0.2 rounded bg-black/60 font-mono">
                {bot.name || `BOT ${idx + 1}`}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span>موقعك</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span>الخصوم (الأعداء)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400/80" />
              <span>صناديق الذخيرة والأسلحة</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all"
          >
            إغلاق الرادار [M]
          </button>
        </div>
      </motion.div>
    </div>
  );
};
