import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Shield,
  Check,
  Flame,
  Award,
  Crown,
  Star,
  Swords,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

export interface UnlockedItemPayload {
  title: string;
  subtitle?: string;
  type: 'crate' | 'weapon_upgrade' | 'clothing_purchase' | 'mystery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  itemName: string;
  itemNameEn?: string;
  itemImage?: string;
  itemIcon?: string;
  statGains?: { label: string; oldVal?: string | number; newVal: string | number }[];
  rewards?: { label: string; value: string; color?: string }[];
  badge?: string;
}

interface AnimatedCrateCutsceneModalProps {
  isOpen: boolean;
  itemPayload: UnlockedItemPayload | null;
  onClose: () => void;
  onClaim?: () => void;
}

export const AnimatedCrateCutsceneModal: React.FC<AnimatedCrateCutsceneModalProps> = ({
  isOpen,
  itemPayload,
  onClose,
  onClaim,
}) => {
  const [phase, setPhase] = useState<'dropping' | 'shaking' | 'exploding' | 'revealed'>('dropping');

  useEffect(() => {
    if (isOpen && itemPayload) {
      setPhase('dropping');
      soundManager.playButtonClick();

      // Timeline Sequence
      const timer1 = setTimeout(() => {
        setPhase('shaking');
        soundManager.playVictory();
        haptics.heavy();
      }, 700);

      const timer2 = setTimeout(() => {
        setPhase('exploding');
        soundManager.playExplosion();
        haptics.victory();
      }, 2200);

      const timer3 = setTimeout(() => {
        setPhase('revealed');
        soundManager.playVictory();
        haptics.victory();
      }, 2600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setPhase('dropping');
    }
  }, [isOpen, itemPayload]);

  if (!isOpen || !itemPayload) return null;

  const rarityGradients = {
    common: 'from-slate-600 via-gray-400 to-slate-800',
    rare: 'from-blue-600 via-cyan-400 to-blue-900',
    epic: 'from-purple-600 via-fuchsia-400 to-indigo-900',
    legendary: 'from-amber-500 via-yellow-300 to-orange-600',
  };

  const rarityGlows = {
    common: 'rgba(148, 163, 184, 0.4)',
    rare: 'rgba(56, 189, 248, 0.6)',
    epic: 'rgba(192, 132, 252, 0.7)',
    legendary: 'rgba(245, 158, 11, 0.85)',
  };

  const handleFinish = () => {
    soundManager.playVictory();
    if (onClaim) onClaim();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-2xl select-none overflow-hidden">
        {/* Animated Background Light Rays */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.35),transparent_70%)]" />
        <div className="absolute inset-0 opacity-20 pointer-events-none animate-spin" style={{ animationDuration: '25s' }}>
          <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,#f59e0b_0deg,transparent_30deg,#3b82f6_90deg,transparent_120deg,#f59e0b_180deg,transparent_210deg,#ec4899_270deg,transparent_300deg)]" />
        </div>

        {/* Screen Flash on Explosion */}
        {phase === 'exploding' && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-white pointer-events-none"
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#111e14] via-[#09120c] to-[#040805] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_100px_rgba(245,158,11,0.5)] flex flex-col items-center text-center overflow-hidden z-10"
        >
          {/* Close X button */}
          {phase === 'revealed' && (
            <button
              onClick={handleFinish}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 hover:text-white active:scale-95 transition-all cursor-pointer z-20"
            >
              <X size={18} />
            </button>
          )}

          {/* Header Tag */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider mb-2">
            <Sparkles size={16} />
            <span>{itemPayload.title}</span>
          </div>

          {itemPayload.subtitle && (
            <p className="text-xs text-amber-200/90 font-bold mb-3">{itemPayload.subtitle}</p>
          )}

          {/* CUTSCENE PHASE 1 & 2: DROPPING & SHAKING CRATE */}
          {(phase === 'dropping' || phase === 'shaking' || phase === 'exploding') && (
            <div className="relative w-full h-64 my-4 flex flex-col items-center justify-center">
              {/* Dropping Crate Container */}
              <motion.div
                animate={
                  phase === 'dropping'
                    ? { y: [-150, 0], scale: [1.3, 1] }
                    : phase === 'shaking'
                    ? {
                        x: [-12, 12, -10, 10, -6, 6, -3, 3, 0],
                        y: [-6, 6, -4, 4, -2, 2, 0],
                        rotate: [-4, 4, -3, 3, 0],
                      }
                    : { scale: [1, 1.4, 2], opacity: [1, 0.8, 0] }
                }
                transition={
                  phase === 'dropping'
                    ? { type: 'spring', damping: 12, stiffness: 200 }
                    : phase === 'shaking'
                    ? { repeat: Infinity, duration: 0.12 }
                    : { duration: 0.3 }
                }
                className="relative w-48 h-48 flex items-center justify-center"
              >
                {/* Glowing Aura & Sparks */}
                <div
                  className="absolute inset-0 rounded-3xl blur-3xl animate-pulse"
                  style={{ backgroundColor: rarityGlows[itemPayload.rarity] }}
                />

                {/* Tactical Chest Graphic */}
                <div className="relative w-40 h-40 bg-gradient-to-b from-[#3a2512] via-[#24170b] to-[#120b05] border-4 border-amber-500 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden group">
                  {/* Metal Chains & Bands */}
                  <div className="absolute inset-x-0 top-1/4 h-3 bg-gradient-to-r from-gray-400 via-amber-300 to-gray-500 border-y border-amber-600" />
                  <div className="absolute inset-x-0 bottom-1/4 h-3 bg-gradient-to-r from-gray-400 via-amber-300 to-gray-500 border-y border-amber-600" />
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-b from-gray-400 via-amber-300 to-gray-500 border-x border-amber-600" />

                  {/* Heavy Brass Lock */}
                  <div className="relative w-14 h-14 bg-amber-400 border-2 border-amber-200 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.9)] z-10 animate-bounce">
                    <Crown size={28} className="text-black" />
                  </div>
                </div>
              </motion.div>

              {/* Progress Bar & Status Text */}
              <div className="w-full max-w-xs mt-6 space-y-1.5">
                <span className="text-xs text-amber-300 font-mono font-black animate-pulse block">
                  {phase === 'dropping'
                    ? '📦 جاري إنزال صندوق الإمدادات التكتيكي ...'
                    : phase === 'shaking'
                    ? '⚡ كسر أقفال الأمان والتعرف البالستي ...'
                    : '💥 انفجار الصندوق واستخراج الجوائز!'}
                </span>
                <div className="w-full bg-black/80 rounded-full h-2.5 overflow-hidden border border-amber-500/40">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: phase === 'dropping' ? '30%' : phase === 'shaking' ? '85%' : '100%' }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CUTSCENE PHASE 3: REVEALED LEGENDARY ITEM CARD */}
          {phase === 'revealed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 180 }}
              className="w-full flex flex-col items-center space-y-3 my-2"
            >
              {/* Central Glowing Card Frame */}
              <div
                className={`relative w-full max-w-sm p-4 rounded-3xl border-2 bg-gradient-to-b ${rarityGradients[itemPayload.rarity]} shadow-[0_0_60px_rgba(245,158,11,0.6)] flex flex-col items-center overflow-hidden`}
              >
                {/* Rarity Ribbon */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-amber-300 border border-amber-500/50 uppercase tracking-widest flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span>{itemPayload.badge || itemPayload.rarity.toUpperCase()}</span>
                </div>

                {/* Item Graphic / Icon */}
                <div className="relative w-44 h-44 my-3 flex items-center justify-center bg-black/60 rounded-2xl border border-white/20 shadow-inner">
                  <div
                    className="absolute inset-0 rounded-2xl blur-xl animate-pulse"
                    style={{ backgroundColor: rarityGlows[itemPayload.rarity] }}
                  />
                  {itemPayload.itemImage ? (
                    <img
                      src={itemPayload.itemImage}
                      alt={itemPayload.itemName}
                      className="w-4/5 h-4/5 object-contain filter drop-shadow-[0_12px_25px_rgba(0,0,0,0.8)] animate-bounce"
                      style={{ animationDuration: '3.5s' }}
                    />
                  ) : (
                    <div className="text-amber-300 text-6xl animate-pulse">
                      {itemPayload.itemIcon || '⚔️'}
                    </div>
                  )}
                </div>

                {/* Item Name */}
                <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md">
                  {itemPayload.itemName}
                </h3>
                {itemPayload.itemNameEn && (
                  <span className="text-[11px] text-gray-200/90 font-mono">
                    {itemPayload.itemNameEn}
                  </span>
                )}
              </div>

              {/* Stat Gains or Rewards Deck */}
              {itemPayload.statGains && itemPayload.statGains.length > 0 && (
                <div className="w-full bg-[#0d1710] border border-[#233c2a] rounded-2xl p-3 space-y-1.5 text-right">
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <Zap size={14} />
                    <span>تطوير وإحصائيات القوة الجديدة (STAT BOOSTS):</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {itemPayload.statGains.map((st, i) => (
                      <div
                        key={i}
                        className="bg-black/60 p-2 rounded-xl border border-emerald-500/30 flex items-center justify-between"
                      >
                        <span className="text-[11px] text-gray-300">{st.label}:</span>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          {st.oldVal ? `${st.oldVal} ➔ ` : ''}
                          {st.newVal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {itemPayload.rewards && itemPayload.rewards.length > 0 && (
                <div className="w-full bg-[#0d1710] border border-[#233c2a] rounded-2xl p-3 space-y-2 text-right">
                  <div className="grid grid-cols-2 gap-2">
                    {itemPayload.rewards.map((rw, i) => (
                      <div
                        key={i}
                        className="bg-black/60 p-2 rounded-xl border border-amber-500/30 flex items-center justify-between"
                      >
                        <span className="text-[11px] text-gray-300">{rw.label}:</span>
                        <span
                          className={`text-xs font-black font-mono ${
                            rw.color || 'text-amber-400'
                          }`}
                        >
                          {rw.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleFinish}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm shadow-2xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Check size={20} />
                <span>إضافة للترسانة والمشونة (CLAIM & EQUIP)</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
