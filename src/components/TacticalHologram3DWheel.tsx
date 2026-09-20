import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Shield,
  Zap,
  Flame,
  Bomb,
  Heart,
  RotateCw,
  Sparkles,
  Swords,
  ChevronRight,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { WeaponType } from '../types';
import { WEAPON_CONFIGS } from '../game/weapons';
import { WeaponSpriteSVG } from '../game/weaponSprites';

interface TacticalHologram3DWheelProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeapon: WeaponType;
  secondaryWeapon?: WeaponType;
  health: number;
  maxHealth: number;
  fuel: number;
  onSelectWeapon: (weapon: WeaponType) => void;
  onUseTacticalBoost?: (type: 'health' | 'jetpack' | 'shield' | 'grenade') => void;
}

export const TacticalHologram3DWheel: React.FC<TacticalHologram3DWheelProps> = ({
  isOpen,
  onClose,
  currentWeapon,
  secondaryWeapon,
  health,
  maxHealth,
  fuel,
  onSelectWeapon,
  onUseTacticalBoost,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  if (!isOpen) return null;

  const weaponsList: WeaponType[] = [
    'pistol',
    'rifle',
    'shotgun',
    'sniper',
    'rocket',
  ];

  const handleSelect = (w: WeaponType) => {
    soundManager.play('weapon_pickup');
    onSelectWeapon(w);
    onClose();
  };

  const handleBoost = (type: 'health' | 'jetpack' | 'shield' | 'grenade') => {
    soundManager.play('menu_select');
    onUseTacticalBoost?.(type);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 select-none">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.8, rotateX: 25, opacity: 0 }}
          animate={{ scale: 1, rotateX: 0, opacity: 1 }}
          exit={{ scale: 0.8, rotateX: -25, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ perspective: 1200 }}
          className="relative z-10 w-full max-w-xl rounded-3xl bg-neutral-900/90 border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] backdrop-blur-xl text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Crosshair className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black font-mono tracking-wider text-cyan-300 flex items-center gap-2">
                  <span>القائمة التكتيكية 3D</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-sans">
                    HOLOGRAM V3
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">اختر السلاح أو التكتيك السريع أثناء المعركة</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tactical Boosts */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <button
              onClick={() => handleBoost('health')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:scale-105 shadow-md group"
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300">حقنة نانو طبية</div>
                <div className="text-[10px] text-neutral-400">استرجاع +50 صحة</div>
              </div>
            </button>

            <button
              onClick={() => handleBoost('jetpack')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all hover:scale-105 shadow-md group"
            >
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-300">وقود نفاث فائق</div>
                <div className="text-[10px] text-neutral-400">شحن 100% طاقة</div>
              </div>
            </button>

            <button
              onClick={() => handleBoost('shield')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400 text-left transition-all hover:scale-105 shadow-md group"
            >
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-300">درع صد كهرومغناطيسي</div>
                <div className="text-[10px] text-neutral-400">حماية 5 ثوانٍ</div>
              </div>
            </button>
          </div>

          {/* 3D Weapons Grid */}
          <div className="mb-2">
            <div className="text-xs font-bold text-neutral-400 font-mono mb-2 flex items-center justify-between">
              <span>ترسانة الأسلحة المتاحة:</span>
              <span className="text-cyan-400">السلاح الحالي: {WEAPON_CONFIGS[currentWeapon]?.name || currentWeapon}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {weaponsList.map((w) => {
                const config = WEAPON_CONFIGS[w];
                const isCurrent = currentWeapon === w;
                return (
                  <motion.button
                    key={w}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(w)}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                        : 'bg-neutral-800/60 hover:bg-neutral-800 border-white/10 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="w-16 h-10 flex items-center justify-center mb-1">
                      <WeaponSpriteSVG weapon={w} className="w-12 h-8" />
                    </div>
                    <div className="text-xs font-bold text-white text-center">{config?.nameAr || config?.name || w}</div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-1">
                      <span>ضرر: {config?.damage || 20}</span>
                      <span>•</span>
                      <span>سعة: {config?.magazineSize || 10}</span>
                    </div>

                    {isCurrent && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-cyan-500 text-[9px] font-black text-black">
                        مجهز
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>اضغط [Q] أو زر التكتيك لفتح هذه القائمة في أي وقت</span>
            <span className="text-cyan-400">BATTLE READY</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
