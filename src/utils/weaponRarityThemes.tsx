import React from 'react';
import { motion } from 'framer-motion';

export type WeaponRarityTier = 'bronze' | 'blue' | 'legendary';

export interface WeaponRarityTheme {
  tier: WeaponRarityTier;
  nameAr: string;
  nameEn: string;
  badge: string;
  arabicLabel: string;
  stars: string;
  starsCount: number;

  // Hex Colors
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  glowRgba: string;
  glowRgbaSoft: string;
  ambientRgb: string;

  // Tailwind Classes
  borderClass: string;
  hoverBorderClass: string;
  textClass: string;
  badgeBgClass: string;
  badgeBorderClass: string;
  badgeTextClass: string;

  // Screen Dynamic Ambient Background Styles
  screenBgCss: string;
  screenGlowStyle: React.CSSProperties;
  screenBorderTint: string;
  hudGlowFilter: string;
}

export const WEAPON_RARITY_THEMES: Record<WeaponRarityTier, WeaponRarityTheme> = {
  bronze: {
    tier: 'bronze',
    nameAr: 'برونزي ميداني',
    nameEn: 'Field Bronze Tier',
    badge: 'برونزي ★',
    arabicLabel: 'برونزي ميداني',
    stars: '★',
    starsCount: 1,

    primaryHex: '#cd7f32',
    secondaryHex: '#b45309',
    accentHex: '#d97706',
    glowRgba: 'rgba(205, 127, 50, 0.65)',
    glowRgbaSoft: 'rgba(205, 127, 50, 0.22)',
    ambientRgb: '205, 127, 50',

    borderClass: 'border-[#cd7f32]/60',
    hoverBorderClass: 'hover:border-[#cd7f32]',
    textClass: 'text-[#e59850]',
    badgeBgClass: 'bg-[#2a170a]',
    badgeBorderClass: 'border-[#cd7f32]/70',
    badgeTextClass: 'text-[#e59850]',

    screenBgCss: 'bg-gradient-to-b from-[#140b06] via-[#090705] to-[#040705]',
    screenGlowStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 18%, rgba(205, 127, 50, 0.22) 0%, rgba(180, 83, 9, 0.08) 45%, transparent 75%),
        radial-gradient(circle at 10% 80%, rgba(217, 119, 6, 0.07) 0%, transparent 50%),
        radial-gradient(circle at 90% 85%, rgba(180, 83, 9, 0.06) 0%, transparent 50%)
      `,
    },
    screenBorderTint: '#cd7f32',
    hudGlowFilter: 'drop-shadow(0 0 12px rgba(205, 127, 50, 0.45))',
  },

  blue: {
    tier: 'blue',
    nameAr: 'أزرق تكتيكي نادر',
    nameEn: 'Tactical Azure Blue Tier',
    badge: 'أزرق ★★',
    arabicLabel: 'أزرق تكتيكي',
    stars: '★★',
    starsCount: 2,

    primaryHex: '#00daf3',
    secondaryHex: '#0284c7',
    accentHex: '#38bdf8',
    glowRgba: 'rgba(0, 218, 243, 0.70)',
    glowRgbaSoft: 'rgba(6, 182, 212, 0.25)',
    ambientRgb: '6, 182, 212',

    borderClass: 'border-cyan-500/60',
    hoverBorderClass: 'hover:border-cyan-400',
    textClass: 'text-cyan-300',
    badgeBgClass: 'bg-[#061e29]',
    badgeBorderClass: 'border-cyan-500/70',
    badgeTextClass: 'text-cyan-300',

    screenBgCss: 'bg-gradient-to-b from-[#061421] via-[#040a12] to-[#040705]',
    screenGlowStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 18%, rgba(6, 182, 212, 0.24) 0%, rgba(2, 132, 199, 0.10) 45%, transparent 75%),
        radial-gradient(circle at 12% 80%, rgba(56, 189, 248, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 88% 85%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
      `,
    },
    screenBorderTint: '#00daf3',
    hudGlowFilter: 'drop-shadow(0 0 14px rgba(0, 218, 243, 0.5))',
  },

  legendary: {
    tier: 'legendary',
    nameAr: 'أسطوري مذهب ملكي',
    nameEn: 'Royal Sovereign Legendary Tier',
    badge: 'أسطوري ★★★',
    arabicLabel: 'أسطوري مذهب',
    stars: '★★★',
    starsCount: 3,

    primaryHex: '#f59e0b',
    secondaryHex: '#b45309',
    accentHex: '#facc15',
    glowRgba: 'rgba(245, 158, 11, 0.80)',
    glowRgbaSoft: 'rgba(245, 158, 11, 0.28)',
    ambientRgb: '245, 158, 11',

    borderClass: 'border-amber-400/80',
    hoverBorderClass: 'hover:border-amber-300',
    textClass: 'text-amber-300',
    badgeBgClass: 'bg-[#291b05]',
    badgeBorderClass: 'border-amber-500/80',
    badgeTextClass: 'text-amber-300',

    screenBgCss: 'bg-gradient-to-b from-[#1c1305] via-[#0d0903] to-[#040705]',
    screenGlowStyle: {
      backgroundImage: `
        radial-gradient(circle at 50% 18%, rgba(245, 158, 11, 0.26) 0%, rgba(217, 119, 6, 0.11) 45%, transparent 75%),
        radial-gradient(circle at 10% 80%, rgba(250, 204, 21, 0.09) 0%, transparent 50%),
        radial-gradient(circle at 90% 85%, rgba(245, 158, 11, 0.09) 0%, transparent 50%)
      `,
    },
    screenBorderTint: '#f59e0b',
    hudGlowFilter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.6))',
  },
};

/**
 * Normalizes any weapon representation to its corresponding rarity tier
 */
export function getWeaponRarityTier(
  weapon?: {
    id?: string;
    rarity?: string;
    category?: string;
    weaponType?: string;
    isSpecial?: boolean;
    name?: string;
  } | null
): WeaponRarityTier {
  if (!weapon) return 'bronze';

  const wId = (weapon.weaponType || weapon.id || '').toLowerCase();
  const rarity = (weapon.rarity || '').toLowerCase();
  const cat = (weapon.category || '').toLowerCase();
  const name = (weapon.name || '').toLowerCase();

  // 1. Check for explicit or implicit Legendary
  if (
    rarity === 'legendary' ||
    rarity === 'mythic' ||
    wId === 'desert_eagle_gold' ||
    wId === 'sniper' ||
    cat.includes('أسطور') ||
    cat.includes('ذهب') ||
    name.includes('ذهب') ||
    name.includes('أسطور') ||
    weapon.isSpecial
  ) {
    return 'legendary';
  }

  // 2. Check for Blue (Rare, Epic, Tactical Energy)
  if (
    rarity === 'blue' ||
    rarity === 'rare' ||
    rarity === 'epic' ||
    wId === 'rocket' ||
    wId === 'dual_uzi' ||
    wId === 'saw_gun' ||
    wId === 'saw' ||
    cat.includes('نادر') ||
    cat.includes('ملحم') ||
    cat.includes('أزرق') ||
    name.includes('أزرق') ||
    name.includes('صاروخ')
  ) {
    return 'blue';
  }

  // 3. Bronze (Common / Shotgun / M4 / Riot Shield)
  return 'bronze';
}

/**
 * High-impact weapon background glow aura component
 * Renders multiple layered light waves, radial nebulae, and holographic rays behind the weapon
 */
export const WeaponGlowBackdrop: React.FC<{
  tier: WeaponRarityTier;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  intensity?: 'low' | 'medium' | 'high' | string;
  className?: string;
  interactiveGlow?: boolean;
}> = ({ tier, size = 'md', intensity = 'medium', className = '', interactiveGlow = true }) => {
  const theme = WEAPON_RARITY_THEMES[tier];

  const opacityMultiplier = intensity === 'high' ? 1.0 : intensity === 'low' ? 0.6 : 0.85;

  // Sizing definitions
  const sizeMap = {
    sm: { aura: 'w-24 h-24 blur-xl', core: 'w-14 h-14 blur-md', ring: 'w-20 h-20' },
    md: { aura: 'w-44 h-44 blur-2xl', core: 'w-24 h-24 blur-lg', ring: 'w-36 h-36' },
    lg: { aura: 'w-64 h-64 blur-3xl', core: 'w-36 h-36 blur-xl', ring: 'w-52 h-52' },
    hero: { aura: 'w-96 h-96 blur-3xl', core: 'w-56 h-56 blur-2xl', ring: 'w-72 h-72' },
  }[size];

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none ${className}`}
    >
      {/* 1. Deep Atmospheric Outer Nebula Bloom */}
      <div
        className={`absolute rounded-full transition-all duration-700 ${sizeMap.aura}`}
        style={{
          background: `radial-gradient(circle, ${theme.glowRgba} 0%, ${theme.glowRgbaSoft} 45%, transparent 70%)`,
          opacity: 0.85,
        }}
      />

      {/* 2. Concentrated Optical Core Halo */}
      <motion.div
        animate={interactiveGlow ? { scale: [0.94, 1.06, 0.94], opacity: [0.75, 1, 0.75] } : undefined}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        className={`absolute rounded-full ${sizeMap.core}`}
        style={{
          background: `radial-gradient(circle, ${theme.accentHex} 0%, ${theme.primaryHex} 40%, transparent 75%)`,
          boxShadow: `0 0 45px ${theme.primaryHex}88`,
        }}
      />

      {/* 3. Pulsing Holographic Weapon Pedestal Ring */}
      <div
        className={`absolute rounded-full border border-dashed opacity-40 transition-colors duration-700 ${sizeMap.ring}`}
        style={{
          borderColor: theme.accentHex,
          animation: 'spin 18s linear infinite',
        }}
      />

      {/* 4. Crosshair / Tactical Light Flare */}
      <div
        className="absolute w-full h-[1px] opacity-25"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.primaryHex} 50%, transparent 100%)`,
        }}
      />
      <div
        className="absolute h-full w-[1px] opacity-25"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.primaryHex} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
};

/**
 * Dynamic Ambient Background Wrapper for Whole Screen (StoreScreen & ArmoryScreen)
 * Smoothly morphs the entire viewport background colors when browsing weapons of different rarities
 */
export const DynamicRarityScreenBackdrop: React.FC<{
  activeTier: WeaponRarityTier;
  children: React.ReactNode;
  className?: string;
}> = ({ activeTier, children, className = '' }) => {
  const theme = WEAPON_RARITY_THEMES[activeTier];

  return (
    <div
      className={`relative min-h-full w-full transition-colors duration-700 ease-out overflow-hidden ${className}`}
      style={{
        backgroundColor: '#040705',
      }}
    >
      {/* Dynamic Screen Ambient Lighting Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-0"
        style={theme.screenGlowStyle}
      />

      {/* Dynamic Top Atmospheric Border Laser Accent */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] pointer-events-none transition-colors duration-700 ease-out z-10"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.primaryHex} 50%, transparent 100%)`,
          boxShadow: `0 0 15px ${theme.primaryHex}`,
        }}
      />

      {/* Tactical Carbon Fiber Grid with subtle tint */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Screen Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
