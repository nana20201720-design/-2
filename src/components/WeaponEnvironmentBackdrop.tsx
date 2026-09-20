import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trees,
  Cpu,
  Flame,
  Crown,
  Snowflake,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Sliders,
  Check,
  Eye,
} from 'lucide-react';
import {
  WeaponBiomeId,
  WeaponBiomeTheme,
  WEAPON_BIOMES,
} from '../utils/weaponEnvironmentThemes';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
  driftX: number;
}

interface WeaponEnvironmentBackdropProps {
  biomeId: WeaponBiomeId;
  children: React.ReactNode;
  className?: string;
  isAutoMode?: boolean;
  onSelectBiome?: (biomeId: WeaponBiomeId) => void;
  onToggleAutoMode?: () => void;
  showSelectorPill?: boolean;
  subTitle?: string;
}

export const WeaponEnvironmentBackdrop: React.FC<WeaponEnvironmentBackdropProps> = ({
  biomeId,
  children,
  className = '',
  isAutoMode = true,
  onSelectBiome,
  onToggleAutoMode,
  showSelectorPill = true,
  subTitle,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentBiome: WeaponBiomeTheme = WEAPON_BIOMES[biomeId] || WEAPON_BIOMES.jungle_forest;
  const BiomeIcon = currentBiome.icon;

  // Pre-generate stable environment particles
  const particles: Particle[] = useMemo(() => {
    const pColors = currentBiome.particleColors;
    const count = currentBiome.particleType === 'cyber_sparks' ? 36 : 28;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage vw
      y: Math.random() * 100, // percentage vh
      size:
        currentBiome.particleType === 'leaves'
          ? 6 + Math.random() * 10
          : currentBiome.particleType === 'embers'
          ? 3 + Math.random() * 6
          : currentBiome.particleType === 'gold_dust'
          ? 4 + Math.random() * 8
          : 3 + Math.random() * 7,
      color: pColors[Math.floor(Math.random() * pColors.length)],
      duration: 5 + Math.random() * 7,
      delay: Math.random() * 5,
      rotation: Math.random() * 360,
      driftX: (Math.random() - 0.5) * 60,
    }));
  }, [biomeId]);

  const handleSelectBiome = (id: WeaponBiomeId) => {
    soundManager.playButtonClick();
    haptics.light();
    if (onSelectBiome) {
      onSelectBiome(id);
    }
    setIsDropdownOpen(false);
  };

  const handleToggleAuto = () => {
    soundManager.playButtonClick();
    haptics.medium();
    if (onToggleAutoMode) {
      onToggleAutoMode();
    }
  };

  return (
    <div className={`relative min-h-full w-full overflow-hidden select-none ${className}`}>
      {/* =========================================================================
          1. DYNAMIC BIOME BACKGROUND GRADIENT & LIGHTING LAYERS
          ========================================================================= */}
      <motion.div
        key={biomeId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`absolute inset-0 bg-gradient-to-b ${currentBiome.bgGradient} pointer-events-none z-0`}
      />

      {/* Radial lighting aura from top epicenter */}
      <motion.div
        key={`radial-${biomeId}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: currentBiome.radialLighting,
        }}
      />

      {/* Top Atmosphere Border Accent */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="absolute top-0 inset-x-0 h-[2px] pointer-events-none z-20"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${currentBiome.primaryColor} 50%, transparent 100%)`,
          boxShadow: `0 0 16px ${currentBiome.primaryColor}`,
        }}
      />

      {/* =========================================================================
          2. THEMATIC BIOME GRAPHIC PATTERNS
          ========================================================================= */}
      {/* A. Cyber Tech Laser Grid & Scanlines */}
      {biomeId === 'cyber_tech' && (
        <>
          <div
            className="absolute inset-0 pointer-events-none opacity-25 z-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 218, 243, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 218, 243, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="absolute inset-x-0 h-40 pointer-events-none z-0 opacity-15"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(0, 218, 243, 0.4), transparent)',
            }}
          />
        </>
      )}

      {/* B. Jungle / Forest Organic Foliage Vignette */}
      {biomeId === 'jungle_forest' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.18) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(5, 150, 105, 0.22) 0%, transparent 50%),
              linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 28px 28px, 28px 28px',
          }}
        />
      )}

      {/* C. Volcanic Molten Magma Heat Distortion & Ground Glow */}
      {biomeId === 'volcanic_molten' && (
        <>
          <motion.div
            animate={{ opacity: [0.35, 0.65, 0.35], scaleY: [0.95, 1.05, 0.95] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute bottom-0 inset-x-0 h-64 pointer-events-none z-0"
            style={{
              background: 'linear-gradient(to top, rgba(239, 68, 68, 0.25), rgba(234, 88, 12, 0.12), transparent)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 90%, rgba(249, 115, 22, 0.35) 0%, transparent 60%),
                radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.15) 0%, transparent 40%)
              `,
            }}
          />
        </>
      )}

      {/* D. Royal Sovereign God-Rays & Gold Sparkle Core */}
      {biomeId === 'royal_palace' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[850px] h-[850px] pointer-events-none z-0 opacity-20"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, 
              #f59e0b 0deg, transparent 20deg, 
              #facc15 60deg, transparent 80deg, 
              #f59e0b 120deg, transparent 140deg, 
              #facc15 180deg, transparent 200deg, 
              #f59e0b 240deg, transparent 260deg, 
              #facc15 300deg, transparent 320deg, 
              #f59e0b 360deg)`,
          }}
        />
      )}

      {/* E. Arctic Tundra Glacial Frost Vignette */}
      {biomeId === 'arctic_tundra' && (
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.25) 0%, transparent 45%),
              radial-gradient(circle at 100% 0%, rgba(125, 211, 252, 0.22) 0%, transparent 45%),
              radial-gradient(circle at 50% 100%, rgba(2, 132, 199, 0.2) 0%, transparent 55%)
            `,
          }}
        />
      )}

      {/* =========================================================================
          3. DYNAMIC ATMOSPHERIC PARTICLES (Leaves, Sparks, Embers, Gold Dust, Snow)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => {
          // Movement trajectory depending on particle type
          const isEmbers = currentBiome.particleType === 'embers';
          const isLeaves = currentBiome.particleType === 'leaves';
          const isSnow = currentBiome.particleType === 'frost_snow';

          return (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: isEmbers ? '105vh' : '-5vh',
                opacity: 0,
                rotate: p.rotation,
              }}
              animate={{
                y: isEmbers ? '-10vh' : '105vh',
                x: `${p.x + p.driftX / 10}vw`,
                opacity: [0, 0.85, 0.85, 0],
                rotate: p.rotation + (isLeaves ? 360 : 180),
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: isEmbers ? 'easeOut' : isLeaves ? 'easeInOut' : 'linear',
              }}
              className="absolute pointer-events-none"
              style={{
                width: p.size,
                height: isLeaves ? p.size * 1.5 : p.size,
                backgroundColor: p.color,
                borderRadius:
                  isLeaves
                    ? '70% 15% 70% 15%'
                    : isSnow
                    ? '50%'
                    : currentBiome.particleType === 'gold_dust'
                    ? '2px'
                    : '50%',
                boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
              }}
            />
          );
        })}
      </div>

      {/* =========================================================================
          4. SLEEK BIOME SELECTOR & STATUS HUD PILL
          ========================================================================= */}
      {showSelectorPill && (
        <div className="relative z-30 px-3 pt-1.5 pb-1 flex flex-col items-center justify-center">
          <div className="relative">
            {/* The Clickable Trigger Pill */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all cursor-pointer text-xs font-black ${currentBiome.badgeBg} ${currentBiome.badgeBorder} ${currentBiome.badgeText} hover:brightness-125 active:scale-98`}
              title="تغيير بيئة وخلفية العرض"
            >
              <div
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: currentBiome.primaryColor }}
              />
              <BiomeIcon size={14} style={{ color: currentBiome.accentColor }} />
              <span>{currentBiome.nameAr}</span>
              {isAutoMode && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/80 font-mono">
                  تلقائي بحسب السلاح ⚡
                </span>
              )}
              <ChevronDown
                size={13}
                className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Subtitle / Weapon Hint if present */}
            {subTitle && (
              <p className="text-[10px] text-gray-400 text-center mt-1 font-medium">
                {subTitle}
              </p>
            )}

            {/* Dropdown Menu for Biome Selection */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 sm:w-96 bg-[#09110d]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Sliders size={14} className="text-emerald-400" />
                      <span>بيئة عرض السلاح (Weapon Biome)</span>
                    </span>

                    {/* Toggle Auto Mode Button */}
                    <button
                      onClick={handleToggleAuto}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isAutoMode
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <RotateCcw size={10} />
                      <span>{isAutoMode ? 'مفعل: تلقائي بحسب السلاح' : 'يدوي (تثبيت)'}</span>
                    </button>
                  </div>

                  {/* 5 Weapon Biomes Grid */}
                  <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-0.5 no-scrollbar">
                    {Object.values(WEAPON_BIOMES).map((biome) => {
                      const IconComponent = biome.icon;
                      const isSelected = biome.id === biomeId;

                      return (
                        <button
                          key={biome.id}
                          onClick={() => handleSelectBiome(biome.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border text-right transition-all cursor-pointer ${
                            isSelected
                              ? `${biome.badgeBg} ${biome.badgeBorder} shadow-md`
                              : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center border"
                              style={{
                                backgroundColor: `${biome.primaryColor}22`,
                                borderColor: `${biome.primaryColor}55`,
                              }}
                            >
                              <IconComponent size={14} style={{ color: biome.primaryColor }} />
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-xs font-black block ${
                                  isSelected ? 'text-white' : 'text-gray-300'
                                }`}
                              >
                                {biome.nameAr}
                              </span>
                              <span className="text-[9px] text-gray-400 block font-mono">
                                {biome.tagAr}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: biome.primaryColor }}
                            >
                              <Check size={11} className="text-black font-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MAIN CONTENT (ArmoryScreen or StoreScreen components)
          ========================================================================= */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
