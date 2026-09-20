import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Target,
  Crosshair,
  Package,
  Eye,
  RotateCw,
  Box,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { ThreeCrateCanvas } from './ThreeCrateCanvas';
import { ThreeWeaponCanvas } from './ThreeWeaponCanvas';
import { WeaponSpriteSVG } from '../game/weaponSprites';
import {
  WeaponGlowBackdrop,
  WeaponRarityTier,
} from '../utils/weaponRarityThemes';

export interface UnlockedItemPayload {
  title: string;
  subtitle?: string;
  type: 'crate' | 'weapon_upgrade' | 'clothing_purchase' | 'mystery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  itemName: string;
  itemNameEn?: string;
  weaponId?: string;
  weaponType?: string;
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

interface LootParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  shape: 'circle' | 'diamond' | 'star' | 'spark';
}

const RARITY_CONFIG = {
  legendary: {
    tier: 'legendary' as WeaponRarityTier,
    nameAr: 'أسطوري مذهب ملكي',
    nameEn: 'ROYAL SOVEREIGN LEGENDARY',
    stars: '★★★',
    primaryColor: '#f59e0b',
    accentColor: '#facc15',
    secondaryColor: '#ea580c',
    glowColor: 'rgba(245, 158, 11, 0.9)',
    glowColorSoft: 'rgba(245, 158, 11, 0.28)',
    ambientRgb: '245, 158, 11',
    screenGradient: 'from-[#2e1903] via-[#140b02] to-[#040705]',
    cardBorder: 'border-amber-400',
    cardGlow: '0 0 70px rgba(245, 158, 11, 0.65)',
    bannerBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/80',
    particleColors: ['#f59e0b', '#fbbf24', '#facc15', '#fef08a', '#ea580c', '#ffffff', '#ffd700'],
  },
  epic: {
    tier: 'blue' as WeaponRarityTier,
    nameAr: 'ملحمي تكتيكي خارق',
    nameEn: 'TACTICAL CYBER EPIC',
    stars: '★★',
    primaryColor: '#a855f7',
    accentColor: '#c084fc',
    secondaryColor: '#e879f9',
    glowColor: 'rgba(168, 85, 247, 0.9)',
    glowColorSoft: 'rgba(168, 85, 247, 0.28)',
    ambientRgb: '168, 85, 247',
    screenGradient: 'from-[#250d38] via-[#100519] to-[#040705]',
    cardBorder: 'border-purple-400',
    cardGlow: '0 0 70px rgba(168, 85, 247, 0.65)',
    bannerBg: 'bg-gradient-to-r from-purple-600 via-fuchsia-400 to-indigo-600 text-white',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/80',
    particleColors: ['#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#8b5cf6', '#ffffff', '#ec4899'],
  },
  rare: {
    tier: 'blue' as WeaponRarityTier,
    nameAr: 'نادر بالستي أزرق',
    nameEn: 'TACTICAL AZURE RARE',
    stars: '★',
    primaryColor: '#00daf3',
    accentColor: '#38bdf8',
    secondaryColor: '#0284c7',
    glowColor: 'rgba(0, 218, 243, 0.9)',
    glowColorSoft: 'rgba(0, 218, 243, 0.28)',
    ambientRgb: '0, 218, 243',
    screenGradient: 'from-[#032333] via-[#020e17] to-[#040705]',
    cardBorder: 'border-cyan-400',
    cardGlow: '0 0 70px rgba(0, 218, 243, 0.65)',
    bannerBg: 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-black',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80',
    particleColors: ['#00daf3', '#38bdf8', '#06b6d4', '#67e8f9', '#2563eb', '#ffffff', '#7dd3fc'],
  },
  common: {
    tier: 'bronze' as WeaponRarityTier,
    nameAr: 'برونزي ميداني قياسي',
    nameEn: 'FIELD BRONZE COMMON',
    stars: '★',
    primaryColor: '#cd7f32',
    accentColor: '#d97706',
    secondaryColor: '#b45309',
    glowColor: 'rgba(205, 127, 50, 0.9)',
    glowColorSoft: 'rgba(205, 127, 50, 0.25)',
    ambientRgb: '205, 127, 50',
    screenGradient: 'from-[#1f1207] via-[#0d0703] to-[#040705]',
    cardBorder: 'border-amber-700',
    cardGlow: '0 0 55px rgba(205, 127, 50, 0.5)',
    bannerBg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white',
    badgeBg: 'bg-amber-900/30 text-amber-400 border-amber-600/70',
    particleColors: ['#cd7f32', '#d97706', '#f59e0b', '#b45309', '#fde68a', '#ffffff', '#e59850'],
  },
};

export const AnimatedCrateCutsceneModal: React.FC<AnimatedCrateCutsceneModalProps> = ({
  isOpen,
  itemPayload,
  onClose,
  onClaim,
}) => {
  const [phase, setPhase] = useState<'dropping' | 'shaking' | 'exploding' | 'revealed'>('dropping');
  const [particles, setParticles] = useState<LootParticle[]>([]);
  const [shakeProgress, setShakeProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'sprite' | '3d'>('sprite');

  // Resolve active theme configuration
  const currentRarity = itemPayload?.rarity || 'common';
  const config = RARITY_CONFIG[currentRarity] || RARITY_CONFIG.common;

  // Resolve weapon ID & 3D type
  const resolvedWeapon = useMemo(() => {
    if (!itemPayload) return { id: 'm4', type: 'rifle', isFirearm: true };
    if (itemPayload.weaponId) {
      return {
        id: itemPayload.weaponId,
        type: itemPayload.weaponType || itemPayload.weaponId,
        isFirearm: true,
      };
    }
    const name = (itemPayload.itemNameEn || itemPayload.itemName).toLowerCase();
    if (name.includes('eagle') || name.includes('deagle') || name.includes('ذهب') || name.includes('gold')) {
      return { id: 'desert_eagle_gold', type: 'pistol', isFirearm: true };
    }
    if (name.includes('sniper') || name.includes('awm') || name.includes('قنص')) {
      return { id: 'sniper', type: 'sniper', isFirearm: true };
    }
    if (name.includes('rocket') || name.includes('rpg') || name.includes('صاروخ')) {
      return { id: 'rocket', type: 'rocket', isFirearm: true };
    }
    if (name.includes('uzi') || name.includes('رشاش') || name.includes('smg')) {
      return { id: 'dual_uzi', type: 'dual_uzi', isFirearm: true };
    }
    if (name.includes('saw') || name.includes('منشار')) {
      return { id: 'saw_gun', type: 'saw_gun', isFirearm: true };
    }
    if (name.includes('shotgun') || name.includes('شوزن')) {
      return { id: 'shotgun', type: 'shotgun', isFirearm: true };
    }
    return { id: 'm4', type: 'rifle', isFirearm: true };
  }, [itemPayload]);

  // Generate dynamic particle explosion when phase switches to exploding
  useEffect(() => {
    if (phase === 'exploding') {
      const pColors = config.particleColors;
      const shapes: ('circle' | 'diamond' | 'star' | 'spark')[] = ['circle', 'diamond', 'star', 'spark'];
      
      const pArray: LootParticle[] = Array.from({ length: 95 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        // Distances distributed from inner core to outer viewport
        const distance = 120 + Math.pow(Math.random(), 0.7) * 380;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          color: pColors[Math.floor(Math.random() * pColors.length)],
          size: 5 + Math.random() * 14,
          delay: Math.random() * 0.16,
          duration: 1.4 + Math.random() * 1.1,
          rotate: (Math.random() - 0.5) * 720,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        };
      });

      setParticles(pArray);
    }
  }, [phase, config]);

  // Timeline Sequence with physical vibration and building tension
  useEffect(() => {
    if (isOpen && itemPayload) {
      setPhase('dropping');
      setShakeProgress(0);
      soundManager.playButtonClick();

      // 1. Drop down & land on pedestal (750ms)
      const timer1 = setTimeout(() => {
        setPhase('shaking');
        soundManager.playVictory();
        haptics.heavy();
      }, 750);

      // Shake progress ticker
      const progressInterval = setInterval(() => {
        setShakeProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 8;
        });
      }, 100);

      // 2. Explode and trigger particle blast (2300ms)
      const timer2 = setTimeout(() => {
        setPhase('exploding');
        soundManager.playExplosion();
        haptics.heavy();
      }, 2350);

      // 3. Fully reveal weapon with victory fanfare (2750ms)
      const timer3 = setTimeout(() => {
        setPhase('revealed');
        soundManager.playVictory();
        haptics.victory();
      }, 2750);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearInterval(progressInterval);
      };
    } else {
      setPhase('dropping');
      setShakeProgress(0);
    }
  }, [isOpen, itemPayload]);

  if (!isOpen || !itemPayload) return null;

  const handleFinish = () => {
    soundManager.playVictory();
    if (onClaim) onClaim();
    onClose();
  };

  const handleSkip = () => {
    setPhase('revealed');
    soundManager.playVictory();
    haptics.heavy();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-hidden">
        {/* =========================================================================
            DYNAMIC RARITY LIGHTING: Entire screen ambient background changes dynamically
            ========================================================================= */}
        <motion.div
          animate={{
            backgroundColor:
              phase === 'revealed' || phase === 'exploding'
                ? `rgba(${config.ambientRgb}, 0.22)`
                : 'rgba(5, 10, 7, 0.95)',
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="fixed inset-0 pointer-events-none z-0 backdrop-blur-2xl"
        />

        {/* Ambient Radial Lighting Aura centered on the crate / weapon */}
        <motion.div
          animate={{
            opacity: phase === 'revealed' ? 0.9 : phase === 'shaking' ? 0.5 : 0.25,
            scale: phase === 'revealed' ? [1, 1.08, 1] : 1,
          }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
          }}
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at 50% 48%, rgba(${config.ambientRgb}, 0.42) 0%, rgba(${config.ambientRgb}, 0.14) 40%, transparent 75%)`,
          }}
        />

        {/* Volumetric Rotating Light Beams in the background */}
        {(phase === 'revealed' || phase === 'exploding') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35, rotate: 360 }}
            transition={{
              opacity: { duration: 0.8 },
              rotate: { repeat: Infinity, duration: 25, ease: 'linear' },
            }}
            className="fixed w-[900px] h-[900px] pointer-events-none z-0"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, 
                ${config.primaryColor} 0deg, transparent 25deg, 
                ${config.accentColor} 90deg, transparent 115deg, 
                ${config.primaryColor} 180deg, transparent 205deg, 
                ${config.accentColor} 270deg, transparent 295deg, 
                ${config.primaryColor} 360deg)`,
            }}
          />
        )}

        {/* Shockwave Blast Flash when crate explodes */}
        {phase === 'exploding' && (
          <>
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="fixed inset-0 z-50 pointer-events-none"
              style={{ backgroundColor: config.accentColor }}
            />
            {/* Radial Expanding Shockwave Rings */}
            <motion.div
              initial={{ scale: 0.1, opacity: 1, borderWidth: 12 }}
              animate={{ scale: 3.5, opacity: 0, borderWidth: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="fixed w-48 h-48 rounded-full border-solid pointer-events-none z-40"
              style={{ borderColor: config.primaryColor }}
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 0.8, borderWidth: 8 }}
              animate={{ scale: 2.8, opacity: 0, borderWidth: 1 }}
              transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
              className="fixed w-48 h-48 rounded-full border-solid pointer-events-none z-40"
              style={{ borderColor: config.accentColor }}
            />
          </>
        )}

        {/* =========================================================================
            PARTICLE EXPLOSION: High-density dynamic physics particles with Motion
            ========================================================================= */}
        {(phase === 'revealed' || phase === 'exploding') &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, 1.4, 0.9, 0],
                opacity: [1, 1, 0.85, 0],
                rotate: p.rotate,
              }}
              transition={{
                duration: p.duration,
                ease: 'easeOut',
                delay: p.delay,
              }}
              className="fixed pointer-events-none z-40"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'spark' ? '1px' : '3px',
                transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
                boxShadow: `0 0 14px ${p.color}`,
              }}
            />
          ))}

        {/* =========================================================================
            CINEMATIC MODAL CARD: Frame containing the unboxing sequence & revealed loot
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`relative w-full max-w-xl bg-gradient-to-b ${config.screenGradient} border-2 ${config.cardBorder} rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center overflow-hidden z-10`}
          style={{
            boxShadow: config.cardGlow,
          }}
        >
          {/* Top Corner Close Button */}
          {phase === 'revealed' && (
            <button
              onClick={handleFinish}
              className="absolute top-4 left-4 p-2 rounded-full bg-black/60 border border-white/20 text-gray-300 hover:text-white active:scale-95 transition-all cursor-pointer z-20"
            >
              <X size={18} />
            </button>
          )}

          {/* Skip Animation Fast-Forward Button during shaking */}
          {phase === 'shaking' && (
            <button
              onClick={handleSkip}
              className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer z-20"
            >
              <span>تخطي للفتح</span>
              <ChevronRight size={14} />
            </button>
          )}

          {/* Header Rarity Badge */}
          <div
            className={`inline-flex items-center gap-2 font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider mb-1.5 transition-all ${config.bannerBg}`}
          >
            <Sparkles size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>{itemPayload.title}</span>
          </div>

          {itemPayload.subtitle && (
            <p className="text-xs text-gray-300 font-bold mb-2">{itemPayload.subtitle}</p>
          )}

          {/* =========================================================================
              PHASE 1 & 2: DROPPING & INTENSE CRATE SHAKING SEQUENCE
              ========================================================================= */}
          {(phase === 'dropping' || phase === 'shaking' || phase === 'exploding') && (
            <div className="relative w-full h-80 my-2 flex flex-col items-center justify-center">
              {/* Ground Impact Pedestal & Dust Ring */}
              <div className="absolute bottom-12 w-52 h-14 bg-black/80 rounded-full border border-white/10 blur-sm pointer-events-none" />

              {/* Laser Light Leaks piercing out of crate seams while shaking */}
              {phase === 'shaking' && (
                <>
                  <motion.div
                    animate={{ scaleY: [0.8, 1.4, 0.9, 1.6, 1], opacity: [0.4, 1, 0.6, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.25 }}
                    className="absolute bottom-20 w-16 h-72 blur-xl pointer-events-none z-0"
                    style={{
                      background: `linear-gradient(to top, ${config.primaryColor}, transparent)`,
                    }}
                  />
                  <motion.div
                    animate={{ rotate: [-15, 15, -10, 10], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    className="absolute bottom-20 w-80 h-3 blur-md pointer-events-none z-0"
                    style={{
                      background: `radial-gradient(circle, ${config.accentColor}, transparent 70%)`,
                    }}
                  />
                </>
              )}

              {/* CRATE CONTAINER WITH INTENSE SHAKING PHYSICS */}
              <motion.div
                animate={
                  phase === 'dropping'
                    ? {
                        y: [-280, 0],
                        scale: [1.3, 1],
                        rotate: [12, 0],
                      }
                    : phase === 'shaking'
                    ? {
                        x: [-7, 8, -11, 10, -6, 7, -14, 13, -9, 8, 0],
                        y: [-4, 5, -7, 6, -3, 4, -8, 7, 0],
                        rotate: [-3, 3.5, -5, 4.5, -2, 2.5, -5.5, 5, 0],
                        scale: [1, 1.04, 0.98, 1.05, 1],
                      }
                    : {
                        scale: [1, 1.25, 0],
                        opacity: [1, 1, 0],
                      }
                }
                transition={
                  phase === 'dropping'
                    ? { type: 'spring', damping: 11, stiffness: 160 }
                    : phase === 'shaking'
                    ? { repeat: Infinity, duration: 0.1, ease: 'linear' }
                    : { duration: 0.32 }
                }
                className="relative w-64 h-64 flex items-center justify-center z-10 cursor-pointer"
                onClick={phase === 'shaking' ? handleSkip : undefined}
              >
                {/* Atmospheric Glow behind Crate */}
                <div
                  className="absolute inset-4 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none"
                  style={{ backgroundColor: config.primaryColor }}
                />

                <ThreeCrateCanvas
                  type={
                    itemPayload.rarity === 'legendary'
                      ? 'elite'
                      : itemPayload.rarity === 'epic'
                      ? 'mystery'
                      : 'supply'
                  }
                  rarity={itemPayload.rarity}
                  phase={phase}
                  className="w-full h-full"
                  autoRotate={false}
                />
              </motion.div>

              {/* Status HUD Tension Progress Bar */}
              <div className="w-full max-w-sm mt-3 space-y-2 z-10">
                <div className="flex items-center justify-between text-xs font-mono font-black">
                  <span className="text-gray-400">
                    {phase === 'dropping'
                      ? '📦 إنزال جوي تكتيكي...'
                      : phase === 'shaking'
                      ? '⚡ فك تشفير أقفال البلازما...'
                      : '💥 انفجار الصندوق!'}
                  </span>
                  <span style={{ color: config.accentColor }}>{shakeProgress}%</span>
                </div>
                <div className="w-full bg-black/80 rounded-full h-2.5 overflow-hidden border border-white/20 p-0.5">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width:
                        phase === 'dropping' ? '25%' : phase === 'shaking' ? '88%' : '100%',
                    }}
                    transition={{ duration: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${config.primaryColor}, ${config.accentColor})`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PHASE 3: REVEALED WEAPON SHOWCASE WITH DYNAMIC RARITY LIGHTING & HALO
              ========================================================================= */}
          {phase === 'revealed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.2, y: 70, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
              transition={{ type: 'spring', damping: 13, stiffness: 130 }}
              className="w-full flex flex-col items-center space-y-3 my-1"
            >
              {/* Central Weapon Podium Frame */}
              <div
                className={`relative w-full max-w-md p-4 sm:p-5 rounded-3xl border-2 ${config.cardBorder} bg-[#060c08]/90 flex flex-col items-center overflow-hidden`}
                style={{
                  boxShadow: config.cardGlow,
                }}
              >
                {/* Rarity Header Ribbon */}
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 shadow ${config.badgeBg}`}
                    >
                      <Star size={12} className="fill-current animate-spin" style={{ animationDuration: '6s' }} />
                      <span>{config.nameAr}</span>
                      <span>{config.stars}</span>
                    </span>
                  </div>

                  {/* Toggle 2D / 3D View */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setViewMode('sprite')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        viewMode === 'sprite' ? 'bg-white/20 text-white font-black' : 'text-gray-400'
                      }`}
                    >
                      SVG عالي الدقة
                    </button>
                    <button
                      onClick={() => setViewMode('3d')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        viewMode === '3d' ? 'bg-white/20 text-white font-black' : 'text-gray-400'
                      }`}
                    >
                      <RotateCw size={10} />
                      <span>3D WebGL</span>
                    </button>
                  </div>
                </div>

                {/* THE WEAPON VIEWPORT WITH OPTICAL RARITY GLOW BACKDROP */}
                <div className="relative w-full h-44 sm:h-48 my-1 flex items-center justify-center rounded-2xl bg-[#040805] border border-white/10 overflow-hidden group">
                  {/* Concentrated Rarity Glow Halo positioned directly behind the weapon */}
                  <WeaponGlowBackdrop tier={config.tier} size="hero" intensity="high" />

                  {/* Caliber Watermark */}
                  <span className="absolute text-[48px] sm:text-[60px] font-black text-white/5 tracking-wider uppercase select-none pointer-events-none leading-none">
                    {resolvedWeapon.id.toUpperCase()}
                  </span>

                  {viewMode === 'sprite' ? (
                    <motion.div
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="relative z-10 flex items-center justify-center p-2"
                    >
                      <WeaponSpriteSVG
                        weapon={resolvedWeapon.id}
                        className="w-48 sm:w-56 h-28 sm:h-32 filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.95)]"
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full relative z-10">
                      <ThreeWeaponCanvas
                        weaponType={resolvedWeapon.type}
                        rarity={itemPayload.rarity}
                        height={190}
                        interactive={true}
                        autoRotate={true}
                        showGlowBackdrop={false}
                      />
                    </div>
                  )}

                  {/* Laser Scanlines effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none opacity-40" />
                </div>

                {/* Item Name & Subtitle */}
                <div className="text-center my-2 space-y-0.5">
                  <h3 className="text-base sm:text-xl font-black text-white drop-shadow-md">
                    {itemPayload.itemName}
                  </h3>
                  {itemPayload.itemNameEn && (
                    <span className="text-xs text-amber-400/90 font-mono tracking-wider block">
                      {itemPayload.itemNameEn}
                    </span>
                  )}
                </div>

                {/* Stat Gains / Boosts Grid */}
                {itemPayload.statGains && itemPayload.statGains.length > 0 && (
                  <div className="w-full bg-[#08120b] border border-white/10 rounded-2xl p-2.5 space-y-1.5 text-right mt-1">
                    <h4 className="text-[11px] font-black text-emerald-400 flex items-center gap-1 justify-end">
                      <span>إحصائيات القوة البالستية (WEAPON STATS)</span>
                      <TrendingUp size={13} />
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {itemPayload.statGains.map((st, i) => (
                        <div
                          key={i}
                          className="bg-black/60 p-2 rounded-xl border border-white/5 flex items-center justify-between"
                        >
                          <span className="text-[10px] text-gray-400">{st.label}:</span>
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            {st.oldVal ? `${st.oldVal} ➔ ` : ''}
                            {st.newVal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rewards Gained Deck */}
                {itemPayload.rewards && itemPayload.rewards.length > 0 && (
                  <div className="w-full grid grid-cols-2 gap-2 mt-2">
                    {itemPayload.rewards.map((rw, i) => (
                      <div
                        key={i}
                        className="bg-black/60 p-2 rounded-xl border border-white/10 flex items-center justify-between text-right"
                      >
                        <span className="text-[10px] text-gray-400">{rw.label}:</span>
                        <span className={`text-xs font-black font-mono ${rw.color || 'text-amber-400'}`}>
                          {rw.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claim Button */}
              <button
                onClick={handleFinish}
                className={`w-full max-w-md py-3.5 rounded-2xl font-black text-sm shadow-2xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 ${config.bannerBg}`}
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
