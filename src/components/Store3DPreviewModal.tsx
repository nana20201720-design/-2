import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Shield,
  Zap,
  ShoppingBag,
  Eye,
  Crosshair,
  Flame,
  User,
  Sun,
  Moon,
  Tv
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { ThreeWeaponCanvas } from './ThreeWeaponCanvas';
import { ThreeSoldierCanvas } from './ThreeSoldierCanvas';
import { SafeImage } from './SafeImage';
import { getWeaponBiome, WEAPON_BIOMES } from '../utils/weaponEnvironmentThemes';

export interface PreviewableStoreItem {
  id: string;
  name: string;
  nameEn?: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  category: 'weapon' | 'crate' | 'character' | 'pack';
  image?: string;
  weaponType?: string;
  characterConfig?: {
    camoColor?: string;
    headgear?: string;
    bodyArmor?: string;
    eyewear?: string;
    beard?: string;
    jetpackStyle?: string;
    skinTone?: string;
    trailColor?: string;
    weapon?: string;
  };
  priceCoins?: number;
  priceGems?: number;
  priceUsd?: string;
  description: string;
  stats?: {
    damage: number;
    fireRate: number;
    range: number;
    ammo?: number | string;
  };
  isOwned?: boolean;
}

interface Store3DPreviewModalProps {
  item: PreviewableStoreItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (item: PreviewableStoreItem) => void;
}

export const Store3DPreviewModal: React.FC<Store3DPreviewModalProps> = ({
  item,
  isOpen,
  onClose,
  onBuy,
}) => {
  const [lightingPreset, setLightingPreset] = useState<'cyber' | 'daylight' | 'sunset' | 'nightops'>('cyber');
  const [characterPose, setCharacterPose] = useState<'idle' | 'aim' | 'flight' | 'salute'>('aim');

  if (!isOpen || !item) return null;

  const isLegendary = item.rarity === 'legendary';
  const isEpic = item.rarity === 'epic';
  const isRare = item.rarity === 'rare';

  const itemBiome = getWeaponBiome(item);
  const biomeTheme = WEAPON_BIOMES[itemBiome];
  const BiomeIcon = biomeTheme.icon;

  const getRarityBadge = () => {
    if (isLegendary) {
      return (
        <span className="bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black font-black text-xs px-3 py-1 rounded-full border border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.8)] flex items-center gap-1.5 animate-pulse">
          <Sparkles size={14} className="text-black" />
          عنصر أسطوري 3D ★★★ (LEGENDARY)
        </span>
      );
    }
    if (isEpic) {
      return (
        <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-xs px-3 py-1 rounded-full border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.7)] flex items-center gap-1.5">
          <Zap size={14} className="text-yellow-300" />
          عنصر ملحمي 3D ★★ (EPIC)
        </span>
      );
    }
    if (isRare) {
      return (
        <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-xs px-3 py-1 rounded-full border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center gap-1.5">
          <Shield size={14} className="text-black" />
          عنصر نادر 3D ★ (RARE)
        </span>
      );
    }
    return (
      <span className="bg-gray-800 text-gray-300 font-bold text-xs px-3 py-1 rounded-full border border-gray-600">
        عنصر قياسي 3D (COMMON)
      </span>
    );
  };

  return (
    <AnimatePresence>
      <div
        onClick={() => {
          soundManager.playButtonClick();
          onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl select-none overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl p-4 sm:p-6 flex flex-col items-center border-2 shadow-2xl text-right my-auto ${
            isLegendary
              ? 'bg-gradient-to-b from-[#1c180e] via-[#0f0d07] to-[#080603] border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.5)]'
              : isEpic
              ? 'bg-gradient-to-b from-[#181024] via-[#0d0814] to-[#060309] border-purple-400 shadow-[0_0_70px_rgba(168,85,247,0.45)]'
              : 'bg-gradient-to-b from-[#101e16] via-[#0a120d] to-[#050906] border-emerald-500/80 shadow-[0_0_60px_rgba(16,185,129,0.35)]'
          }`}
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              {getRarityBadge()}
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${biomeTheme.badgeBg} ${biomeTheme.badgeBorder} ${biomeTheme.badgeText}`}
              >
                <BiomeIcon size={12} />
                <span>بيئة: {biomeTheme.nameAr}</span>
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Item Name & Details */}
          <div className="w-full space-y-1 mb-2 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                {item.name}
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700">
                مجسم ثلاثي الأبعاد حقيقي (Real-Time 3D WebGL)
              </span>
            </div>
            {item.nameEn && (
              <span className="text-xs text-amber-400 font-mono tracking-widest block">
                {item.nameEn}
              </span>
            )}
            <p className="text-xs text-gray-300">{item.description}</p>
          </div>

          {/* REAL-TIME 3D WEBGL INTERACTIVE VIEWPORT */}
          <div
            className={`relative w-full h-72 sm:h-80 my-2 rounded-2xl border-2 overflow-hidden flex items-center justify-center select-none z-10 ${
              isLegendary
                ? 'bg-gradient-to-b from-[#130f07] to-[#080603] border-amber-500/50 shadow-inner'
                : 'bg-gradient-to-b from-[#09110b] to-[#040805] border-emerald-500/40 shadow-inner'
            }`}
          >
            {/* Real 3D WebGL Rendering Canvas based on Category */}
            {item.category === 'character' ? (
              <div className="w-full h-full">
                <ThreeSoldierCanvas
                  camoColor={item.characterConfig?.camoColor || '#365314'}
                  headgear={item.characterConfig?.headgear || 'camo_helmet'}
                  bodyArmor={item.characterConfig?.bodyArmor || 'molle_vest'}
                  eyewear={item.characterConfig?.eyewear || 'aviators'}
                  beard={item.characterConfig?.beard || 'stubble'}
                  jetpackStyle={item.characterConfig?.jetpackStyle || 'military_dual'}
                  skinTone={item.characterConfig?.skinTone || '#fbb587'}
                  weapon={item.characterConfig?.weapon || 'rifle'}
                  trailColor={item.characterConfig?.trailColor || '#a855f7'}
                  height={320}
                  interactive={true}
                  autoRotate={true}
                  showPedestal={true}
                  lightingPreset={lightingPreset}
                />
              </div>
            ) : item.category === 'weapon' ? (
              <div className="w-full h-full">
                <ThreeWeaponCanvas
                  weaponType={item.weaponType || item.id}
                  rarity={item.rarity}
                  height={300}
                  interactive={true}
                  autoRotate={true}
                  showGlowBackdrop={true}
                />
              </div>
            ) : (
              /* Holographic 3D Crate / Pack Box */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                <div className="relative w-48 h-48 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                  <SafeImage
                    src={item.image || '/images/crate_elite.jpg'}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,215,0,0.85)]"
                    fallbackTitle={item.name}
                    fallbackIcon="package"
                  />
                </div>
                {/* 3D Holographic Base Ring */}
                <div className="w-40 h-8 rounded-full border-2 border-amber-400 bg-amber-500/20 blur-[1px] animate-pulse" />
              </div>
            )}

            {/* Hint Badge */}
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-[10px] text-amber-300 font-bold flex items-center gap-1.5 pointer-events-none">
              <Eye size={12} className="animate-pulse" />
              <span>معاينة حرة 360° ثلاثية الأبعاد</span>
            </div>
          </div>

          {/* STATS BARS (If Weapon) */}
          {item.stats && (
            <div className="w-full bg-black/60 p-3 rounded-2xl border border-white/10 space-y-2 mb-3 z-10 text-right">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">الضرر الفتاك (Damage)</span>
                    <span className="text-red-400 font-bold">{item.stats.damage} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${item.stats.damage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">معدل الإطلاق (Fire Rate)</span>
                    <span className="text-cyan-400 font-bold">{item.stats.fireRate} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full"
                      style={{ width: `${item.stats.fireRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">المدى المؤثر (Range)</span>
                    <span className="text-amber-400 font-bold">{item.stats.range} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${item.stats.range}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">سعة الذخيرة (Ammo)</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {item.stats.ammo || '30 طلقة'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buy & Acquire Button */}
          <div className="w-full z-10 pt-1">
            <button
              onClick={() => {
                onBuy(item);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-sm shadow-xl shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-200"
            >
              <ShoppingBag size={18} />
              <span>
                تأكيد الشراء (BUY NOW) —{' '}
                {item.priceGems ? `${item.priceGems} 💎` : `${item.priceCoins} 🪙`}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
