import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift, Sparkles, X, Shield, Award, Clock } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';
import { haptics } from '../utils/haptics';
import { toastManager } from '../utils/toastManager';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RewardDay {
  day: number;
  title: string;
  coins: number;
  gems: number;
  crate: string;
  claimed: boolean;
}

const DEFAULT_REWARDS: RewardDay[] = [
  { day: 1, title: 'مكافأة اليوم الأول', coins: 750, gems: 10, crate: 'صندوق إمداد ميداني', claimed: false },
  { day: 2, title: 'مكافأة اليوم الثاني', coins: 1200, gems: 20, crate: 'بطاقة ترقية عشوائية', claimed: false },
  { day: 3, title: 'مكافأة اليوم الثالث', coins: 2000, gems: 35, crate: 'صندوق النخبة الفضي', claimed: false },
  { day: 4, title: 'مكافأة اليوم الرابع', coins: 3500, gems: 50, crate: 'درع تكتيكي مقوى', claimed: false },
  { day: 5, title: 'مكافأة اليوم الخامس', coins: 5000, gems: 75, crate: 'صندوق الأسلحة السري', claimed: false },
  { day: 6, title: 'مكافأة اليوم السادس', coins: 8000, gems: 100, crate: 'صندوق النخبة الذهبي', claimed: false },
  { day: 7, title: 'مكافأة اليوم السابع (الأساطير)', coins: 15000, gems: 250, crate: 'سلاح ذهبي أسطوري ★★★', claimed: false },
];

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ isOpen, onClose }) => {
  const [rewards, setRewards] = useState<RewardDay[]>(() => {
    const saved = localStorage.getItem('mini_militia_daily_login');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_REWARDS;
      }
    }
    return DEFAULT_REWARDS;
  });
  const [claimToast, setClaimToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mini_militia_daily_login', JSON.stringify(rewards));
  }, [rewards]);

  const handleClaimDay = (dayIndex: number) => {
    const reward = rewards[dayIndex];
    if (reward.claimed) return;

    soundManager.playVictory();
    haptics.victory();

    const cur = settingsManager.getSettings();
    settingsManager.updateSettings({
      coins: cur.coins + reward.coins,
      gems: cur.gems + reward.gems,
    });

    setRewards((prev) =>
      prev.map((r, idx) => (idx === dayIndex ? { ...r, claimed: true } : r))
    );

    toastManager.show(
      `🎁 مكافأة اليوم ${reward.day} تم استلامها!`,
      `+${reward.coins.toLocaleString()} كوينز | +${reward.gems} جوهرة | ${reward.crate}`,
      'reward'
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#121c15] via-[#0b130e] to-[#070b09] border-2 border-amber-500 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] p-5 sm:p-6 flex flex-col items-center text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#18261d] hover:bg-[#23382b] text-gray-300 hover:text-white border border-[#2b4432] flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header Banner */}
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/80 text-amber-300 rounded-full border border-amber-700/60 text-xs font-black mb-2 shadow-inner">
            <Gift size={15} className="animate-bounce text-amber-400" />
            <span>تسجيل الدخول اليومي للكتيبة (TACTICAL DAILY REWARDS)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide mb-1">
            مكافآت الحضور والنشاط العسكري
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            سجل دخولك يومياً واستلم صناديق الإمداد والكوينز والجواهر لترقية ترسانتك القتالية.
          </p>

          {/* Grid of 7 Days */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-5">
            {rewards.map((r, idx) => {
              const isToday = idx === 0 && !r.claimed;
              return (
                <div
                  key={r.day}
                  className={`p-3 rounded-2xl border flex flex-col justify-between relative transition-all ${
                    r.claimed
                      ? 'bg-[#101b13]/60 border-[#1f3323] opacity-60'
                      : isToday || idx <= 1
                      ? 'bg-[#18281d] border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-[#121d16] border-[#203324]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      اليوم {r.day}
                    </span>
                    {r.claimed && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-800 flex items-center gap-1">
                        <Check size={10} /> تم الاستلام
                      </span>
                    )}
                  </div>

                  <div className="my-2 space-y-1 text-center">
                    <span className="text-xs font-black text-white block">
                      +{r.coins.toLocaleString()} 🪙
                    </span>
                    <span className="text-[11px] font-black text-cyan-400 block font-mono">
                      +{r.gems} 💎
                    </span>
                    <span className="text-[10px] text-gray-300 block truncate">
                      {r.crate}
                    </span>
                  </div>

                  <button
                    disabled={r.claimed}
                    onClick={() => handleClaimDay(idx)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all shadow ${
                      r.claimed
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110 active:scale-98 cursor-pointer'
                    }`}
                  >
                    {r.claimed ? 'مستلم' : 'استلام الهدية'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full max-w-xs py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-black font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
          >
            الانتقال إلى ساحة المعركة (CONFIRM)
          </button>

          {/* Claim Toast Notice */}
          {claimToast && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-4 py-2 rounded-full font-black text-xs shadow-2xl flex items-center gap-2"
            >
              <span>{claimToast}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
