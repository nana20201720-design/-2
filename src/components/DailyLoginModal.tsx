import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift, Sparkles, X, Shield, Award, Clock, Lock, Unlock, Zap, Swords, Flame } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';
import { statsManager } from '../utils/statsManager';
import { haptics } from '../utils/haptics';
import { toastManager } from '../utils/toastManager';

export const WEEKLY_CHEST_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in Milliseconds
const WEEKLY_CLAIM_TIME_KEY = 'mini_militia_weekly_chest_last_claim_time';

export function isWeeklyChestReady(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(WEEKLY_CLAIM_TIME_KEY);
  if (!saved) return true;
  const lastTime = parseInt(saved, 10);
  if (isNaN(lastTime) || lastTime <= 0) return true;
  return Date.now() >= lastTime + WEEKLY_CHEST_COOLDOWN_MS;
}

export function getWeeklyChestRemainingMs(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(WEEKLY_CLAIM_TIME_KEY);
  if (!saved) return 0;
  const lastTime = parseInt(saved, 10);
  if (isNaN(lastTime) || lastTime <= 0) return 0;
  const remaining = lastTime + WEEKLY_CHEST_COOLDOWN_MS - Date.now();
  return Math.max(0, remaining);
}

interface WeeklyChestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyLoginModal: React.FC<WeeklyChestModalProps> = ({ isOpen, onClose }) => {
  const [lastClaimTime, setLastClaimTime] = useState<number>(() => {
    const saved = localStorage.getItem(WEEKLY_CLAIM_TIME_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [now, setNow] = useState(Date.now());
  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);
  const [justClaimedReward, setJustClaimedReward] = useState<boolean>(false);

  // Live countdown ticker
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Handle Escape key
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

  const nextAvailableTime = lastClaimTime + WEEKLY_CHEST_COOLDOWN_MS;
  const isCooldownActive = lastClaimTime > 0 && now < nextAvailableTime;
  const remainingMs = Math.max(0, nextAvailableTime - now);

  const getCooldownDetails = () => {
    if (remainingMs <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, text: 'جاهز للفتح الآن!' };
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      text: `${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`,
    };
  };

  const cooldown = getCooldownDetails();

  const handleClaimWeeklyChest = () => {
    if (isCooldownActive) {
      toastManager.show('🔒 الصندوق الأسبوعي مقفل!', `يُفتح مرة كل 7 أيام. متبقي: ${cooldown.text}`, 'error');
      soundManager.playButtonClick();
      haptics.error();
      return;
    }

    setIsOpeningAnimation(true);
    soundManager.playRocketLaunch();
    haptics.heavy();

    setTimeout(() => {
      soundManager.playVictory();
      haptics.victory();

      const coinsReward = 12500;
      const gemsReward = 200;
      const xpReward = 1500;

      // Update Coins & Gems
      const curSettings = settingsManager.getSettings();
      settingsManager.updateSettings({
        coins: curSettings.coins + coinsReward,
        gems: curSettings.gems + gemsReward,
      });

      // Update Player XP
      const curStats = statsManager.getStats();
      curStats.coins = (curStats.coins || 0) + coinsReward;
      statsManager.saveStats(curStats);

      // Lock chest for 7 days
      const claimTimestamp = Date.now();
      setLastClaimTime(claimTimestamp);
      localStorage.setItem(WEEKLY_CLAIM_TIME_KEY, claimTimestamp.toString());

      setIsOpeningAnimation(false);
      setJustClaimedReward(true);

      toastManager.show(
        '🎁 تم فتح الصندوق الأسبوعي بنجاح!',
        `+${coinsReward.toLocaleString()} 🪙 كوينز | +${gemsReward} 💎 جوهرة | +${xpReward} ⚡ XP`,
        'reward'
      );
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-xl bg-gradient-to-b from-[#121c15] via-[#0b130e] to-[#070b09] border-2 border-amber-500 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col text-center overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-30 w-full bg-[#101b13]/98 backdrop-blur-md border-b border-[#223525] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
              {isCooldownActive ? (
                <Lock size={16} className="text-rose-400 animate-pulse" />
              ) : (
                <Gift size={16} className="text-amber-400 animate-bounce" />
              )}
              <span>الصندوق الأسبوعي الملكي (Weekly War Crate)</span>
            </div>

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

          {/* Modal Content */}
          <div className="p-5 sm:p-7 space-y-5">
            {/* Title & Badge */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono font-black text-amber-400 mb-1">
                <Clock size={13} />
                <span>مكافأة أسبوعية متجددة كل 7 أيام</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                صندوق الإمداد الأسبوعي الأسطوري
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                يُتاح هذا الصندوق الملكي مرة واحدة فقط كل أسبوع. استلم غنائم المعارك الضخمة لتطوير أسلحتك وترقيتك العسكرية.
              </p>
            </div>

            {/* Central Chest Display & Lock Status */}
            <div className={`relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
              isCooldownActive
                ? 'bg-[#0e1711]/90 border-neutral-700 shadow-inner'
                : 'bg-gradient-to-b from-[#183120] to-[#0d1a11] border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.25)]'
            }`}>
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              {/* Status Header inside Chest Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  {isCooldownActive ? (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/80 flex items-center gap-1.5 shadow">
                      <Lock size={13} />
                      <span>حالة الصندوق: مقفل بإحكام 🔒</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 flex items-center gap-1.5 shadow animate-pulse">
                      <Unlock size={13} />
                      <span>حالة الصندوق: جاهز للفتح! 🔓✨</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  مرة كل 7 أيام
                </span>
              </div>

              {/* Big Chest Icon Visual */}
              <div className="my-4 flex flex-col items-center justify-center">
                <div className="relative">
                  {isCooldownActive ? (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-neutral-900/90 border-2 border-neutral-700 flex items-center justify-center shadow-2xl relative">
                      <Lock className="w-12 h-12 text-rose-400/80" />
                      <div className="absolute -bottom-2 bg-rose-950 border border-rose-700 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        مغلق
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      animate={isOpeningAnimation ? { scale: [1, 1.2, 0.9, 1.3], rotate: [0, -5, 5, 0] } : { scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: isOpeningAnimation ? 0 : Infinity }}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 border-3 border-yellow-200 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)] cursor-pointer"
                      onClick={handleClaimWeeklyChest}
                    >
                      <Gift className="w-14 h-14 text-black" />
                      <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-100 animate-spin" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Rewards Preview List */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                <div className="bg-black/50 border border-[#223525] rounded-xl p-2.5 text-center">
                  <span className="text-base sm:text-lg font-black text-amber-400 font-mono block">
                    +12,500
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold block flex items-center justify-center gap-1">
                    🪙 كوينز تكتيكية
                  </span>
                </div>

                <div className="bg-black/50 border border-[#223525] rounded-xl p-2.5 text-center">
                  <span className="text-base sm:text-lg font-black text-cyan-400 font-mono block">
                    +200
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold block flex items-center justify-center gap-1">
                    💎 جواهر نادرة
                  </span>
                </div>

                <div className="bg-black/50 border border-[#223525] rounded-xl p-2.5 text-center">
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono block">
                    +1,500
                  </span>
                  <span className="text-[10px] text-gray-300 font-bold block flex items-center justify-center gap-1">
                    ⚡ خبرة XP قتالية
                  </span>
                </div>
              </div>

              {/* Weekly Cooldown Countdown Banner */}
              {isCooldownActive && (
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3.5 mt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold">
                    <Clock size={15} />
                    <span>ينفتح الصندوق الأسبوعي القادم خلال:</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-[#121c15] p-2 rounded-xl border border-neutral-700">
                      <span className="text-base sm:text-lg font-black text-white block">{cooldown.days}</span>
                      <span className="text-[9px] text-gray-400 block">أيام</span>
                    </div>
                    <div className="bg-[#121c15] p-2 rounded-xl border border-neutral-700">
                      <span className="text-base sm:text-lg font-black text-white block">{cooldown.hours}</span>
                      <span className="text-[9px] text-gray-400 block">ساعات</span>
                    </div>
                    <div className="bg-[#121c15] p-2 rounded-xl border border-neutral-700">
                      <span className="text-base sm:text-lg font-black text-white block">{cooldown.minutes}</span>
                      <span className="text-[9px] text-gray-400 block">دقائق</span>
                    </div>
                    <div className="bg-[#121c15] p-2 rounded-xl border border-neutral-700">
                      <span className="text-base sm:text-lg font-black text-amber-400 block">{cooldown.seconds}</span>
                      <span className="text-[9px] text-gray-400 block">ثواني</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-neutral-400 text-center">
                    تم قفل الصندوق تلقائياً بعد استلام المكافأة الأسبوعية. سيتجدد في الموعد المحدد.
                  </p>
                </div>
              )}

              {/* Main Action Button */}
              <div className="mt-5">
                {isCooldownActive ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-neutral-900 border border-neutral-700/80 text-neutral-500 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                  >
                    <Lock size={16} />
                    <span>🔒 الصندوق مقفل (متاح بعد {cooldown.days} أيام و {cooldown.hours}س)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleClaimWeeklyChest}
                    disabled={isOpeningAnimation}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-yellow-200 cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <Sparkles size={18} className="animate-spin text-black" />
                    <span>{isOpeningAnimation ? 'جاري فتح الصندوق...' : 'فتح واستلام الصندوق الأسبوعي 🎁'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="sticky bottom-0 z-30 w-full bg-[#0a120d]/98 backdrop-blur-md border-t border-[#1d2d20] p-3 flex items-center justify-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="flex-1 max-w-sm py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-black font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check size={16} />
              <span>متابعة والعودة إلى اللعبة</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

