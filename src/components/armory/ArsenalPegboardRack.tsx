import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Shield,
  Zap,
  Flame,
  Target,
  Wrench,
  Swords,
  Sparkles,
  Check,
  Award,
  Layers,
  CheckCircle2,
  Sliders,
  Eye,
  Grid,
} from 'lucide-react';
import { WeaponItem } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';
import { WeaponSpriteSVG } from '../../game/weaponSprites';
import { getWeaponRarityTier, WEAPON_RARITY_THEMES, WeaponGlowBackdrop } from '../../utils/weaponRarityThemes';

interface ArsenalPegboardRackProps {
  weapons: WeaponItem[];
  selectedWeaponId: string;
  equippedPrimary: string;
  equippedSecondary: string;
  onSelectWeapon: (weaponId: string) => void;
  onEquipPrimary?: (weaponId: string) => void;
  onEquipSecondary?: (weaponId: string) => void;
  onHoverWeapon?: (weaponId: string | null) => void;
}

export const ArsenalPegboardRack: React.FC<ArsenalPegboardRackProps> = ({
  weapons,
  selectedWeaponId,
  equippedPrimary,
  equippedSecondary,
  onSelectWeapon,
  onEquipPrimary,
  onEquipSecondary,
  onHoverWeapon,
}) => {
  const [hoveredWeaponId, setHoveredWeaponId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d_vault' | 'classic_rack'>('3d_vault');

  const handleWeaponClick = (id: string) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    onSelectWeapon(id);
  };

  const getWeaponRarityColor = (id: string) => {
    const tier = getWeaponRarityTier({ id });
    const theme = WEAPON_RARITY_THEMES[tier];
    switch (tier) {
      case 'legendary':
        return {
          glow: 'shadow-[0_0_26px_rgba(245,158,11,0.55)]',
          border: 'border-amber-400',
          accent: '#f59e0b',
          tag: 'أسطوري 3D ★★★',
          textClass: 'text-amber-400',
          tier,
        };
      case 'blue':
        return {
          glow: 'shadow-[0_0_22px_rgba(0,218,243,0.45)]',
          border: 'border-cyan-400',
          accent: '#00daf3',
          tag: 'أزرق 3D ★★',
          textClass: 'text-cyan-400',
          tier,
        };
      case 'bronze':
      default:
        return {
          glow: 'shadow-[0_0_18px_rgba(205,127,50,0.4)]',
          border: 'border-[#cd7f32]/80',
          accent: '#cd7f32',
          tag: 'برونزي 3D ★',
          textClass: 'text-[#e59850]',
          tier,
        };
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-[#0d1611] via-[#080e0a] to-[#040805] border-2 border-[#2b4430] rounded-2xl overflow-hidden shadow-2xl p-3.5 select-none">
      {/* Rack Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#142318] border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
            <Layers size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                خزنة الأسلحة التكتيكية 3D (ARSENAL VAULT)
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                8 أسلحة معتمدة
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block">
              اختر أي سلاح من الرف التكتيكي لمعاينته بالـ 3D، ترقيته أو تجهيزه للقتال
            </span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#050b07] p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setViewMode('3d_vault');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === '3d_vault'
                  ? 'bg-emerald-500 text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid size={12} />
              <span>خزنة 3D</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setViewMode('classic_rack');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'classic_rack'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye size={12} />
              <span>الحامل الميداني</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. 3D TACTICAL VAULT GRID (State of the art 3D weapons rack) */}
      {viewMode === '3d_vault' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-h-[145px]">
          <AnimatePresence mode="popLayout">
            {weapons.map((w) => {
              const isSelected = selectedWeaponId === w.id;
              const isPrimary = equippedPrimary === w.id;
              const isSecondary = equippedSecondary === w.id;
              const rarity = getWeaponRarityColor(w.id);

              return (
                <motion.div
                  key={w.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleWeaponClick(w.id)}
                  onMouseEnter={() => {
                    setHoveredWeaponId(w.id);
                    onHoverWeapon?.(w.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredWeaponId(null);
                    onHoverWeapon?.(null);
                  }}
                  className={`relative rounded-xl p-3 cursor-pointer transition-all duration-300 border-2 overflow-hidden flex flex-col justify-between min-h-[145px] ${rarity.glow} ${
                    isSelected
                      ? `bg-gradient-to-b from-[#18281d] via-[#101b13] to-[#0a120c] ${rarity.border} ring-2 ring-white/20 scale-[1.03]`
                      : `bg-gradient-to-b from-[#0f1712] via-[#090e0b] to-[#050806] ${rarity.border} opacity-85 hover:opacity-100 hover:scale-[1.01]`
                  }`}
                >
                {/* Tactical Carbon Weave Background Pattern */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 6px 6px',
                  }}
                />

                {/* Top Slot Header */}
                <div className="relative z-10 flex items-center justify-between gap-1">
                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-black/70 border ${
                    rarity.tier === 'legendary'
                      ? 'text-amber-300 border-amber-500/40'
                      : rarity.tier === 'blue'
                      ? 'text-cyan-300 border-cyan-500/40'
                      : 'text-[#e59850] border-[#cd7f32]/40'
                  }`}>
                    {rarity.tag}
                  </span>

                  <div className="flex items-center gap-1">
                    {isPrimary && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-black shadow-sm flex items-center gap-0.5">
                        <Check size={10} />
                        رئيسي 1
                      </span>
                    )}
                    {isSecondary && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyan-400 text-black shadow-sm flex items-center gap-0.5">
                        <Check size={10} />
                        ثانوي 2
                      </span>
                    )}
                    {!isPrimary && !isSecondary && isSelected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        محدد
                      </span>
                    )}
                  </div>
                </div>

                {/* 3D Weapon Floating Display Stage with Dynamic Rarity Glow */}
                <div className="relative z-10 my-2 flex items-center justify-center h-16 overflow-visible">
                  {/* Dynamic Optical Rarity Glow Aura */}
                  <WeaponGlowBackdrop tier={rarity.tier} size="sm" intensity="high" />

                  {/* 3D Metallic Weapon Sprite */}
                  <div className="relative z-10 transform hover:scale-105 transition-transform duration-200">
                    <WeaponSpriteSVG
                      weapon={w.id}
                      lightingMode="pbr"
                      className="w-24 h-12 filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)]"
                    />
                  </div>

                  {/* Laser Cradle Shelf Hooks */}
                  <div className="absolute bottom-0 w-20 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-60" />
                </div>

                {/* Bottom Weapon Info & Stats */}
                <div className="relative z-10 pt-1.5 border-t border-white/5 flex items-center justify-between">
                  <div className="truncate max-w-[70%]">
                    <span className="text-xs font-black text-white block truncate">
                      {w.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400 block truncate">
                      {w.nameEn.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-amber-400 block">
                      {w.damage} DMG
                    </span>
                    <span className="text-[8px] font-mono text-gray-500">
                      {w.magSize} RDS
                    </span>
                  </div>
                </div>

                {/* Selected Corner Laser Brackets */}
                {isSelected && (
                  <>
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
                  </>
                )}
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      ) : (
        /* 2. CLASSIC PEGBOARD VIEW WITH HIGH-TECH OVERLAYS */
        <div className="relative w-full aspect-[16/9] max-h-[300px] rounded-xl overflow-hidden border border-[#2b4430] bg-[#080d0a] shadow-2xl">
          <img
            src="/images/arsenal_grid.jpg"
            alt="Arsenal Grid Inventory"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* 8 Clickable Hotspot Zones */}
          {[
            { id: 'sniper', left: '0%', top: '0%', width: '25%', height: '50%' },
            { id: 'rocket', left: '25%', top: '0%', width: '25%', height: '50%' },
            { id: 'riot_shield', left: '50%', top: '0%', width: '25%', height: '50%' },
            { id: 'dual_uzi', left: '75%', top: '0%', width: '25%', height: '50%' },
            { id: 'desert_eagle_gold', left: '0%', top: '50%', width: '25%', height: '50%' },
            { id: 'shotgun', left: '25%', top: '50%', width: '25%', height: '50%' },
            { id: 'saw_gun', left: '50%', top: '50%', width: '25%', height: '50%' },
            { id: 'm4_rifle', left: '75%', top: '50%', width: '25%', height: '50%' },
          ].map((slot) => {
            const weapon = weapons.find((w) => w.id === slot.id);
            if (!weapon) return null;

            const isSelected = selectedWeaponId === weapon.id;
            const isPrimary = equippedPrimary === weapon.id;
            const isSecondary = equippedSecondary === weapon.id;
            const isHovered = hoveredWeaponId === weapon.id;

            const weaponTier = getWeaponRarityTier(weapon);

            return (
              <div
                key={slot.id}
                onClick={() => handleWeaponClick(weapon.id)}
                onMouseEnter={() => {
                  setHoveredWeaponId(weapon.id);
                  onHoverWeapon?.(weapon.id);
                }}
                onMouseLeave={() => {
                  setHoveredWeaponId(null);
                  onHoverWeapon?.(null);
                }}
                style={{
                  position: 'absolute',
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                }}
                className={`cursor-pointer transition-all duration-200 z-10 flex flex-col justify-between p-1.5 group overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/20 ring-2 ring-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.4)]'
                    : isHovered
                    ? 'bg-white/10 ring-1 ring-emerald-400/60'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-1 pointer-events-none z-10">
                  <span className={`text-[8px] sm:text-[9px] font-mono font-black px-1 rounded bg-black/80 border ${
                    weaponTier === 'legendary'
                      ? 'text-amber-300 border-amber-500/40'
                      : weaponTier === 'blue'
                      ? 'text-cyan-300 border-cyan-500/40'
                      : 'text-[#e59850] border-[#cd7f32]/40'
                  }`}>
                    {weaponTier === 'legendary' ? 'أسطوري' : weaponTier === 'blue' ? 'أزرق' : 'برونزي'}
                  </span>
                  {isPrimary ? (
                    <span className="text-[8px] font-black px-1 rounded bg-amber-500 text-black">
                      رئيسي 1
                    </span>
                  ) : isSecondary ? (
                    <span className="text-[8px] font-black px-1 rounded bg-cyan-400 text-black">
                      ثانوي 2
                    </span>
                  ) : null}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
                  <WeaponGlowBackdrop tier={weaponTier} size="sm" />
                  <div className="relative z-10">
                    <WeaponSpriteSVG
                      weapon={weapon.id}
                      lightingMode="pbr"
                      className="w-16 h-10 sm:w-20 sm:h-12 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pointer-events-none">
                  <span className="px-1 py-0.5 rounded text-[8px] font-black truncate bg-black/80 text-white border border-white/10">
                    {weapon.nameEn.split(' ')[0]}
                  </span>
                  <span className="text-[8px] font-mono text-amber-400 font-bold">
                    {weapon.damage} DMG
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK FOOTER WEAPON STATUS */}
      <div className="mt-3 pt-2.5 border-t border-[#1a2b1f] flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Crosshair size={14} className="text-amber-400" />
          <span>السلاح المحدد حالياً في الخزنة:</span>
          <strong className="text-white font-black">
            {weapons.find((w) => w.id === selectedWeaponId)?.name}
          </strong>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEquipPrimary && onEquipPrimary(selectedWeaponId)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-500 text-black hover:bg-amber-400 transition-all cursor-pointer shadow"
          >
            تجهيز كرئيسي 1
          </button>
          <button
            onClick={() => onEquipSecondary && onEquipSecondary(selectedWeaponId)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-cyan-400 text-black hover:bg-cyan-300 transition-all cursor-pointer shadow"
          >
            تجهيز كثانوي 2
          </button>
        </div>
      </div>
    </section>
  );
};
