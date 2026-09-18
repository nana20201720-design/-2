import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Shield, Coins, Zap, Star, Flame, ChevronRight } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { settingsManager } from '../utils/settingsManager';
import { statsManager } from '../utils/statsManager';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  oldLevel: number;
  rankTitleAr: string;
  skillPointsGained: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  level,
  oldLevel,
  rankTitleAr,
  skillPointsGained,
  onClose,
}) => {
  const [stars, setStars] = useState<{ id: number; left: string; delay: number; scale: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Play celebratory sound
      soundManager.playVictory();
      haptics.heavy();

      // Credit 300 Coins as promotion bonus
      const currentSettings = settingsManager.getSettings();
      const newCoins = (currentSettings.coins || 0) + 300;
      settingsManager.updateSettings({ coins: newCoins });
      // Notify components about coin update
      window.dispatchEvent(new CustomEvent('tactical-settings-updated'));

      // Generate random star configurations for floating background celebration
      const generatedStars = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        scale: Math.random() * 0.6 + 0.4,
      }));
      setStars(generatedStars);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Reward definitions based on the level reached
  const getLevelRewards = (lvl: number) => {
    const defaultRewards = [
      {
        id: 'coins',
        name: '+300 عملة معدنية',
        nameEn: '+300 Golden Coins',
        icon: <Coins className="text-amber-400 w-6 h-6 animate-pulse" />,
        desc: 'رصيد إضافي لشراء وترقية العتاد الحربي.',
        rarity: 'rare',
      },
      {
        id: 'skill',
        name: `+${skillPointsGained} نقطة مهارة`,
        nameEn: `+${skillPointsGained} Skill Point`,
        icon: <Zap className="text-cyan-400 w-6 h-6" />,
        desc: 'استخدمها في صفحة تخصيص المحارب لترقية سرعتك أو تدريعك.',
        rarity: 'rare',
      },
    ];

    // Special rewards for milestone levels
    if (lvl % 5 === 0) {
      return [
        ...defaultRewards,
        {
          id: 'weapon_bonus',
          name: 'بطاقات ترقية بندقية القنص',
          nameEn: 'Sniper Upgrade Cards x20',
          icon: <Flame className="text-rose-500 w-6 h-6" />,
          desc: 'حزمة نادرة لزيادة مستوى قوة فتك رصاص بندقية القنص .50 BMG.',
          rarity: 'legendary',
        },
      ];
    } else if (lvl % 2 === 0) {
      return [
        ...defaultRewards,
        {
          id: 'jetpack_booster',
          name: 'معزز النفاثة تيربو',
          nameEn: 'Jetpack Turbo Charger',
          icon: <Shield className="text-emerald-400 w-6 h-6" />,
          desc: 'وقود نفاثة خاص يزيد من قدرة التحمل ومقاومة الرياح.',
          rarity: 'epic',
        },
      ];
    } else {
      return [
        ...defaultRewards,
        {
          id: 'crate_bonus',
          name: 'صندوق إمدادات ذهبي',
          nameEn: 'Golden Supply Crate',
          icon: <Trophy className="text-yellow-400 w-6 h-6" />,
          desc: 'صندوق يحتوي على أسلحة تكتيكية وملابس قتالية حصرية.',
          rarity: 'epic',
        },
      ];
    }
  };

  const rewards = getLevelRewards(level);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto">
        {/* Floating Celebration Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ y: '105vh', opacity: 0 }}
              animate={{
                y: '-10vh',
                opacity: [0, 1, 1, 0],
                rotate: 360,
              }}
              transition={{
                duration: 4,
                delay: star.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: star.left,
                transform: `scale(${star.scale})`,
              }}
              className="text-amber-400/40"
            >
              ★
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#132216] via-[#09100a]/98 to-[#050906] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]"
          id="level-up-modal-container"
        >
          {/* Top Radiant Crown Accent */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center border-4 border-emerald-500 shadow-xl"
            >
              <Sparkles className="text-black w-12 h-12 animate-pulse" />
            </motion.div>
          </div>

          <div className="pt-12 mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-black text-emerald-400 tracking-wider uppercase mb-3 font-mono"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ترقية جديدة بالجيش</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-2 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              LEVEL UP!
            </h2>

            <div className="flex items-center justify-center gap-4 text-white font-mono my-4">
              <span className="text-2xl font-bold text-gray-500 line-through">Lvl {oldLevel}</span>
              <ChevronRight className="w-6 h-6 text-emerald-500 animate-bounce" />
              <motion.span
                initial={{ scale: 0.5 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-4xl font-black text-amber-300 bg-amber-950/40 px-4 py-1 rounded-2xl border-2 border-amber-500/40 shadow-inner"
              >
                Lvl {level}
              </motion.span>
            </div>

            <p className="text-base font-bold text-emerald-300 mb-6 bg-emerald-950/40 border border-emerald-500/20 py-2.5 px-6 rounded-2xl">
              رتبتك الحالية بالساحة: <span className="underline font-black text-white text-lg">{rankTitleAr}</span> 🎖️
            </p>
          </div>

          {/* Unlocked Rewards Showcase */}
          <div className="space-y-3 mb-8 text-right">
            <h3 className="text-xs font-black text-amber-400 tracking-wider uppercase px-1">
              🎁 المكافآت العسكرية المكتسبة:
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {rewards.map((reward, i) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl border bg-black/40 ${
                    reward.rarity === 'legendary'
                      ? 'border-rose-500/40 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                      : reward.rarity === 'epic'
                      ? 'border-purple-500/40 hover:border-purple-500/60'
                      : 'border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 shrink-0">
                    {reward.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-white truncate">{reward.name}</h4>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        reward.rarity === 'legendary'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          : reward.rarity === 'epic'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {reward.rarity === 'legendary' ? 'أسطوري' : reward.rarity === 'epic' ? 'ملحمي' : 'نادر'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold mt-0.5 truncate">{reward.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black text-sm py-4 rounded-2xl transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            استلام المكافآت ومتابعة القتال ⚔️
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
