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
  const [lastClaimTime, setLastClaimTime] = useState<number>(() => {
    const saved = localStorage.getItem('mini_militia_daily_login_last_claim_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [now, setNow] = useState(Date.now());
  const [claimToast, setClaimToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('mini_militia_daily_login', JSON.stringify(rewards));
  }, [rewards]);

  // Handle ticking timer for cooldown live updates
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const firstUnclaimedIndex = rewards.findIndex((r) => !r.claimed);
  const cooldownPeriod = 18 * 60 * 60 * 1000; // 18 Hours player-friendly daily claim window
  const nextAvailableTime = lastClaimTime + cooldownPeriod;
  const isCooldownActive = now < nextAvailableTime;
  const cooldownMs = nextAvailableTime - now;

  // Auto-reset rewards list if all claimed and cooldown is over
  const allClaimed = rewards.every((r) => r.claimed);
  useEffect(() => {
    if (allClaimed && !isCooldownActive) {
      const resetRewards = DEFAULT_REWARDS.map((r) => ({ ...r, claimed: false }));
      setRewards(resetRewards);
      localStorage.setItem('mini_militia_daily_login', JSON.stringify(resetRewards));
    }
  }, [allClaimed, isCooldownActive]);

  const getCooldownString = () => {
    if (cooldownMs <= 0) return '';
    const hours = Math.floor(cooldownMs / (1000 * 60 * 60));
    const mins = Math.floor((cooldownMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((cooldownMs % (1000 * 60)) / 1000);
    return `${hours}س و ${mins}د`;
  };

  const handleClaimDay = (dayIndex: number) => {
    if (dayIndex !== firstUnclaimedIndex) {
      toastManager.show('🔒 مكافأة مقفلة!', 'يرجى استلام مكافآت الحضور بالترتيب اليومي المتتابع!', 'error');
      return;
    }
    if (isCooldownActive) {
      toastManager.show('⏳ قيد الانتظار!', 'يرجى الانتظار لحين انتهاء مؤقت التبريد اليومي للحصول على الهدية التالية.', 'error');
      return;
    }

    const reward = rewards[dayIndex];
    if (reward.claimed) return;

    soundManager.playVictory();
    haptics.victory();

    const cur = settingsManager.getSettings();
    settingsManager.updateSettings({
      coins: cur.coins + reward.coins,
      gems: cur.gems + reward.gems,
    });

    const nowTime = Date.now();
    setLastClaimTime(nowTime);
    localStorage.setItem('mini_militia_daily_login_last_claim_time', nowTime.toString());

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
      {/* Outer backdrop - clicking anywhere outside closes the modal */}
      <div
        onClick={() => {
          soundManager.playButtonClick();
          onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[92vh] bg-gradient-to-b from-[#121c15] via-[#0b130e] to-[#070b09] border-2 border-amber-500 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col text-center overflow-hidden my-auto"
        >
          {/* Sticky Top Header Bar with prominent Close Button */}
          <div className="sticky top-0 z-30 w-full bg-[#101b13]/98 backdrop-blur-md border-b border-[#223525] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
              <Gift size={16} className="animate-bounce text-amber-400" />
              <span>مكافآت الحضور اليومي للكتيبة</span>
            </div>

            {/* Clear, accessible, prominent Close button */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-full bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-700/60 flex items-center gap-1.5 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-lg"
              title="إغلاق النافذة"
            >
              <X size={16} />
              <span>إغلاق</span>
            </button>
          </div>

          {/* Scrollable Modal Body for all mobile screen heights */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wide mb-1">
                مكافآت الحضور والنشاط العسكري
              </h2>
              <p className="text-xs text-gray-400">
                سجل دخولك يومياً واستلم صناديق الإمداد والكوينز والجواهر لترقية ترسانتك القتالية.
              </p>
            </div>

             {/* Grid of 7 Days */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              {rewards.map((r, idx) => {
                const isClaimed = r.claimed;
                const isCurrent = idx === firstUnclaimedIndex;
                const isLocked = idx > firstUnclaimedIndex;
                
                let cardStyle = '';
                let buttonStyle = '';
                let buttonText = '';
                let buttonDisabled = false;

                if (isClaimed) {
                  cardStyle = 'bg-[#101b13]/40 border-[#1f3323]/50 opacity-60';
                  buttonStyle = 'bg-[#0f1711] text-gray-500 cursor-not-allowed border border-[#1b2b1e]';
                  buttonText = 'تم الاستلام ✓';
                  buttonDisabled = true;
                } else if (isCurrent) {
                  if (isCooldownActive) {
                    cardStyle = 'bg-[#132018] border-yellow-600/60 shadow-lg shadow-yellow-600/5';
                    buttonStyle = 'bg-yellow-950/40 text-yellow-500 font-bold border border-yellow-800/60 cursor-not-allowed';
                    buttonText = `${getCooldownString()}`;
                    buttonDisabled = true;
                  } else {
                    cardStyle = 'bg-[#1b3423] border-amber-500 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/40 animate-pulse';
                    buttonStyle = 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110 active:scale-98 cursor-pointer font-black';
                    buttonText = 'استلام الهدية 🎁';
                    buttonDisabled = false;
                  }
                } else {
                  // Locked Day
                  cardStyle = 'bg-[#0b100c] border-[#1b291d]/40 opacity-40';
                  buttonStyle = 'bg-neutral-900/60 text-neutral-600 border border-neutral-800/30 cursor-not-allowed';
                  buttonText = '🔒 مغلق';
                  buttonDisabled = true;
                }

                return (
                  <div
                    key={r.day}
                    className={`p-3 rounded-2xl border flex flex-col justify-between relative transition-all duration-300 ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        اليوم {r.day}
                      </span>
                      {isClaimed && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-800 flex items-center gap-0.5">
                          مستلم
                        </span>
                      )}
                      {isCurrent && !isCooldownActive && (
                        <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black animate-bounce">
                          جاهز!
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
                      disabled={buttonDisabled}
                      onClick={() => handleClaimDay(idx)}
                      className={`w-full py-2 rounded-xl text-xs transition-all shadow ${buttonStyle}`}
                    >
                      {buttonText}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Footer with Clear Confirm & Exit Buttons */}
          <div className="sticky bottom-0 z-30 w-full bg-[#0a120d]/98 backdrop-blur-md border-t border-[#1d2d20] p-3 flex items-center justify-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="flex-1 max-w-xs py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-black font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>الانتقال إلى ساحة المعركة (تأكيد)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="px-4 py-2.5 bg-[#16241b] hover:bg-[#1e3226] text-gray-300 hover:text-white font-bold text-xs rounded-2xl border border-[#263e2c] active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} />
              <span>إغلاق ✕</span>
            </button>
          </div>

          {/* Claim Toast Notice */}
          {claimToast && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-4 py-2 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 z-40"
            >
              <span>{claimToast}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
