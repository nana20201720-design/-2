import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Maximize2,
  Volume2,
} from 'lucide-react';
import { WeaponItem } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';
import { WeaponSpriteSVG } from '../../game/weaponSprites';

interface ArsenalPegboardRackProps {
  weapons: WeaponItem[];
  selectedWeaponId: string;
  equippedPrimary: string;
  equippedSecondary: string;
  onSelectWeapon: (weaponId: string) => void;
}

// Coordinate mapping for the 8 slots in /images/arsenal_grid.jpg
// The image is an authentic 2 rows x 4 columns weapons rack
const RACK_SLOT_COORDS = [
  // Row 1
  { id: 'sniper', row: 0, col: 0, left: '0%', top: '0%', width: '25%', height: '50%' },
  { id: 'rocket', row: 0, col: 1, left: '25%', top: '0%', width: '25%', height: '50%' },
  { id: 'riot_shield', row: 0, col: 2, left: '50%', top: '0%', width: '25%', height: '50%' },
  { id: 'dual_uzi', row: 0, col: 3, left: '75%', top: '0%', width: '25%', height: '50%' },
  // Row 2
  { id: 'desert_eagle_gold', row: 1, col: 0, left: '0%', top: '50%', width: '25%', height: '50%' },
  { id: 'shotgun', row: 1, col: 1, left: '25%', top: '50%', width: '25%', height: '50%' },
  { id: 'saw_gun', row: 1, col: 2, left: '50%', top: '50%', width: '25%', height: '50%' },
  { id: 'm4_rifle', row: 1, col: 3, left: '75%', top: '50%', width: '25%', height: '50%' },
];

export const ArsenalPegboardRack: React.FC<ArsenalPegboardRackProps> = ({
  weapons,
  selectedWeaponId,
  equippedPrimary,
  equippedSecondary,
  onSelectWeapon,
}) => {
  const [hoveredWeaponId, setHoveredWeaponId] = useState<string | null>(null);

  const handleWeaponClick = (id: string) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    onSelectWeapon(id);
  };

  const getWeaponIcon = (id: string) => {
    switch (id) {
      case 'sniper':
        return <Crosshair size={14} className="text-cyan-400" />;
      case 'rocket':
        return <Flame size={14} className="text-red-400" />;
      case 'dual_uzi':
        return <Zap size={14} className="text-amber-400" />;
      case 'shotgun':
        return <Target size={14} className="text-orange-400" />;
      case 'saw_gun':
        return <Wrench size={14} className="text-yellow-400" />;
      case 'riot_shield':
        return <Shield size={14} className="text-blue-400" />;
      default:
        return <Swords size={14} className="text-emerald-400" />;
    }
  };

  return (
    <section className="relative bg-[#0d1611] border-2 border-[#2b4430] rounded-2xl overflow-hidden shadow-2xl p-3 select-none">
      {/* Rack Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#142318] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Wrench size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                حامل الأسلحة التكتيكي الميداني (ARSENAL GRID)
              </span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                تفاعلي
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block">
              انقر مباشرة على أي سلاح في الحامل لتحديده واختباره وتجهيزه
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-black/60 text-emerald-400 font-bold px-2 py-1 rounded-lg border border-[#273d2b] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            8 أسلحة معتمدة
          </span>
        </div>
      </div>

      {/* Interactive Pegboard Image with Hotspot Overlays */}
      <div className="relative w-full aspect-[16/9] max-h-[300px] rounded-xl overflow-hidden border border-[#2b4430] bg-[#080d0a] shadow-2xl">
        {/* Base Pegboard Illustration */}
        <img
          src="/images/arsenal_grid.jpg"
          alt="Arsenal Grid Inventory"
          className="w-full h-full object-cover"
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* 8 Clickable Hotspot Zones */}
        {RACK_SLOT_COORDS.map((slot) => {
          const weapon = weapons.find((w) => w.id === slot.id);
          if (!weapon) return null;

          const isSelected = selectedWeaponId === weapon.id;
          const isPrimary = equippedPrimary === weapon.id;
          const isSecondary = equippedSecondary === weapon.id;
          const isHovered = hoveredWeaponId === weapon.id;

          return (
            <div
              key={slot.id}
              onClick={() => handleWeaponClick(weapon.id)}
              onMouseEnter={() => {
                setHoveredWeaponId(weapon.id);
                soundManager.playButtonClick();
              }}
              onMouseLeave={() => setHoveredWeaponId(null)}
              style={{
                position: 'absolute',
                left: slot.left,
                top: slot.top,
                width: slot.width,
                height: slot.height,
              }}
              className={`cursor-pointer transition-all duration-200 z-10 flex flex-col justify-between p-1.5 group ${
                isSelected
                  ? 'bg-amber-500/15 ring-2 ring-amber-400 shadow-[inset_0_0_16px_rgba(245,158,11,0.3)]'
                  : isHovered
                  ? 'bg-white/10 ring-1 ring-emerald-400/60'
                  : 'hover:bg-white/5'
              }`}
            >
              {/* Top slot tags */}
              <div className="flex items-center justify-between gap-1 pointer-events-none">
                <span
                  className={`text-[8px] sm:text-[9px] font-mono font-black px-1 rounded backdrop-blur ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'bg-black/70 text-gray-300 border border-white/10'
                  }`}
                >
                  LVL {weapon.level}
                </span>

                {isPrimary ? (
                  <span className="text-[8px] sm:text-[9px] font-black px-1 rounded bg-amber-500 text-black shadow-sm border border-amber-300">
                    رئيسي 1
                  </span>
                ) : isSecondary ? (
                  <span className="text-[8px] sm:text-[9px] font-black px-1 rounded bg-cyan-400 text-black shadow-sm border border-cyan-300">
                    ثانوي 2
                  </span>
                ) : isSelected ? (
                  <span className="text-[8px] sm:text-[9px] font-bold px-1 rounded bg-emerald-500 text-black">
                    مُحدد
                  </span>
                ) : null}
              </div>

              {/* Realistic Weapon Sprite Visual Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
                <WeaponSpriteSVG weapon={weapon.id} className="w-14 h-8 sm:w-20 sm:h-11 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] group-hover:scale-110 transition-transform duration-200" />
              </div>

              {/* Center Holographic Reticle when Selected or Hovered */}
              {(isSelected || isHovered) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-dashed flex items-center justify-center ${
                      isSelected
                        ? 'border-amber-400/80 animate-spin text-amber-300'
                        : 'border-emerald-400/50 text-emerald-300'
                    }`}
                    style={{ animationDuration: '8s' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                </div>
              )}

              {/* Bottom Slot Label */}
              <div className="flex items-center justify-between gap-1 pointer-events-none">
                <div
                  className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black truncate max-w-full backdrop-blur border ${
                    isSelected
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                      : isHovered
                      ? 'bg-black/90 text-white border-emerald-500/40'
                      : 'bg-black/70 text-gray-300 border-black/50'
                  }`}
                >
                  {weapon.nameEn.split(' ')[0]}
                </div>

                <div className="text-[8px] font-mono text-gray-400 hidden sm:block">
                  {weapon.damage} DMG
                </div>
              </div>

              {/* Tactical Corner Brackets */}
              {isSelected && (
                <>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-400 pointer-events-none" />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Selector Strip for Mobile / Touch Convenience */}
      <div className="mt-2.5 pt-2 border-t border-[#1a2b1f] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Crosshair size={13} className="text-amber-400" />
          <span>السلاح المختار حالياً في الحامل:</span>
          <strong className="text-amber-300 font-bold">
            {weapons.find((w) => w.id === selectedWeaponId)?.name}
          </strong>
        </div>

        <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
          TAP ANY WEAPON TO EQUIP OR TEST FIRE
        </span>
      </div>
    </section>
  );
};
