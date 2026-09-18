import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RotateCw,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
  Target,
  Flame,
  Check,
  ShoppingBag,
  Eye,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { WeaponSpriteSVG } from '../game/weaponSprites';
import { MiniMilitiaDoodleSoldier } from './MiniMilitiaDoodleSoldier';

export interface PreviewableStoreItem {
  id: string;
  name: string;
  nameEn?: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  category: 'weapon' | 'crate' | 'character' | 'pack';
  image?: string;
  weaponType?: string;
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
  const [rotateY, setRotateY] = useState(0);
  const [rotateX, setRotateX] = useState(10);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const autoRotateRef = useRef<number | null>(null);

  // Auto-rotation animation loop
  useEffect(() => {
    if (isAutoRotating && !isDragging) {
      const interval = setInterval(() => {
        setRotateY((prev) => (prev + 1.2) % 360);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isAutoRotating, isDragging]);

  if (!isOpen || !item) return null;

  const isLegendary = item.rarity === 'legendary';
  const isEpic = item.rarity === 'epic';
  const isRare = item.rarity === 'rare';

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotateY((prev) => (prev + deltaX * 0.8) % 360);
    setRotateX((prev) => Math.max(-30, Math.min(35, prev - deltaY * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const getRarityBadge = () => {
    if (isLegendary) {
      return (
        <span className="bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black font-black text-xs px-3 py-1 rounded-full border border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.8)] flex items-center gap-1.5 animate-pulse">
          <Sparkles size={14} className="text-black" />
          عنصر أسطوري ★★★ (LEGENDARY)
        </span>
      );
    }
    if (isEpic) {
      return (
        <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-xs px-3 py-1 rounded-full border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.7)] flex items-center gap-1.5">
          <Zap size={14} className="text-yellow-300" />
          عنصر ملحمي ★★ (EPIC)
        </span>
      );
    }
    if (isRare) {
      return (
        <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black text-xs px-3 py-1 rounded-full border border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center gap-1.5">
          <Shield size={14} className="text-black" />
          عنصر نادر ★ (RARE)
        </span>
      );
    }
    return (
      <span className="bg-gray-800 text-gray-300 font-bold text-xs px-3 py-1 rounded-full border border-gray-600">
        عنصر قياسي (COMMON)
      </span>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-xl select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-xl rounded-3xl p-5 sm:p-6 flex flex-col items-center overflow-hidden border-2 shadow-2xl text-right ${
            isLegendary
              ? 'bg-gradient-to-b from-[#1c180e] via-[#0f0d07] to-[#080603] border-amber-400 shadow-[0_0_80px_rgba(245,158,11,0.5)]'
              : isEpic
              ? 'bg-gradient-to-b from-[#181024] via-[#0d0814] to-[#060309] border-purple-400 shadow-[0_0_70px_rgba(168,85,247,0.45)]'
              : 'bg-gradient-to-b from-[#101e16] via-[#0a120d] to-[#050906] border-emerald-500/80 shadow-[0_0_60px_rgba(16,185,129,0.35)]'
          }`}
        >
          {/* RARE ITEM SPECULAR SHEEN & GLEAM SWEEP EFFECT (تأثير لمعان العناصر النادرة والأسطورية) */}
          {(isLegendary || isEpic || isRare) && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {/* Gold/Cyan Sheen Beam Animation */}
              <motion.div
                initial={{ x: '-150%', y: '-150%' }}
                animate={{ x: '150%', y: '150%' }}
                transition={{
                  repeat: Infinity,
                  duration: isLegendary ? 2.5 : 3.8,
                  ease: 'easeInOut',
                  repeatDelay: 1,
                }}
                className={`absolute w-full h-[200%] rotate-45 opacity-30 ${
                  isLegendary
                    ? 'bg-gradient-to-r from-transparent via-amber-200 to-transparent'
                    : isEpic
                    ? 'bg-gradient-to-r from-transparent via-purple-300 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-cyan-200 to-transparent'
                }`}
              />

              {/* Radial Sparkle Bloom in background */}
              <div
                className={`absolute inset-0 pointer-events-none animate-pulse ${
                  isLegendary
                    ? 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22),transparent_70%)]'
                    : 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_70%)]'
                }`}
              />
            </div>
          )}

          {/* Header Bar */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-3 z-10">
            <div className="flex items-center gap-2">
              {getRarityBadge()}
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
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              {item.name}
            </h2>
            {item.nameEn && (
              <span className="text-xs text-amber-400 font-mono tracking-widest block">
                {item.nameEn}
              </span>
            )}
            <p className="text-xs text-gray-300">{item.description}</p>
          </div>

          {/* INTERACTIVE 3D ROTATING VIEWPORT STAGE */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative w-full h-64 sm:h-72 my-2 rounded-2xl border-2 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none z-10 ${
              isLegendary
                ? 'bg-gradient-to-b from-[#130f07] to-[#080603] border-amber-500/50 shadow-inner'
                : 'bg-gradient-to-b from-[#09110b] to-[#040805] border-emerald-500/40 shadow-inner'
            }`}
          >
            {/* Interactive Drag Instruction Hint */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20 text-[10px] text-amber-300 font-bold flex items-center gap-1.5 pointer-events-none">
              <Eye size={12} className="animate-pulse" />
              <span>اسحب لتدوير المعاينة 360° (Drag to Rotate)</span>
            </div>

            {/* Rare Item Shimmer Sheen Light Burst Effect */}
            {(isLegendary || isEpic) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 bg-amber-500/20 rounded-full blur-3xl animate-ping" />
              </div>
            )}

            {/* ROTATING 3D MODEL CONTAINER */}
            <div
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div
                style={{
                  transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  transformStyle: 'preserve-3d',
                }}
                className="relative flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
              >
                {/* 1) WEAPON TYPE PREVIEW */}
                {item.category === 'weapon' && (
                  <div className="relative p-6 bg-black/40 rounded-3xl border border-amber-500/30 flex items-center justify-center">
                    <WeaponSpriteSVG
                      weapon={item.weaponType || item.id}
                      className="w-44 h-28 sm:w-60 sm:h-36 filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.7)]"
                    />
                    {/* Holographic Laser Sight Line in 3D */}
                    <div className="absolute top-1/2 left-full w-24 h-0.5 bg-red-500/80 blur-[1px] shadow-[0_0_8px_#ef4444]" />
                  </div>
                )}

                {/* 2) CRATE TYPE PREVIEW */}
                {item.category === 'crate' && (
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                    <img
                      src={item.image || '/images/crate_elite.jpg'}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,215,0,0.8)]"
                    />
                  </div>
                )}

                {/* 3) CHARACTER PREVIEW */}
                {item.category === 'character' && (
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <MiniMilitiaDoodleSoldier className="w-44 h-44 sm:w-52 sm:h-52" />
                  </div>
                )}

                {/* 4) FALLBACK IMAGE */}
                {item.category === 'pack' && item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-w-48 max-h-48 object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                  />
                )}
              </div>
            </div>

            {/* Rotation Control Toolbar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 flex items-center gap-2 z-20">
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setRotateY((prev) => prev - 45);
                }}
                className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-all"
                title="تدوير لليسار"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setIsAutoRotating(!isAutoRotating);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                  isAutoRotating
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                <RefreshCw size={12} className={isAutoRotating ? 'animate-spin' : ''} />
                <span>دوران تلقائي</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setRotateY((prev) => prev + 45);
                }}
                className="p-1.5 hover:bg-white/20 text-white rounded-lg transition-all"
                title="تدوير لليمين"
              >
                <RotateCw size={16} />
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setRotateY(0);
                  setRotateX(10);
                  setScale(1);
                }}
                className="px-2 py-1 text-[10px] bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg"
              >
                إعادة ضبط
              </button>
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
                soundManager.playVictory();
                haptics.victory();
                onBuy(item);
                onClose();
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
