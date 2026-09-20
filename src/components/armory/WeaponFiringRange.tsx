import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  RotateCcw,
  Volume2,
  Sparkles,
  Zap,
  Target,
  Flame,
  Shield,
  Radio,
  Sliders,
} from 'lucide-react';
import { WeaponItem } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';
import { WeaponSpriteSVG } from '../../game/weaponSprites';

interface BulletHole {
  id: number;
  x: number;
  y: number;
  score: number;
  label: string;
}

interface ShellCasing {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
}

interface WeaponFiringRangeProps {
  weapon: WeaponItem;
}

export const WeaponFiringRange: React.FC<WeaponFiringRangeProps> = ({ weapon }) => {
  const [currentAmmo, setCurrentAmmo] = useState(weapon.magSize);
  const [isReloading, setIsReloading] = useState(false);
  const [isLaserEnabled, setIsLaserEnabled] = useState(true);
  const [isFiring, setIsFiring] = useState(false);
  const [bulletHoles, setBulletHoles] = useState<BulletHole[]>([]);
  const [shells, setShells] = useState<ShellCasing[]>([]);
  const [lastHitScore, setLastHitScore] = useState<{ label: string; score: number } | null>(null);
  const [aimPos, setAimPos] = useState({ x: 50, y: 50 });
  const [totalShotsFired, setTotalShotsFired] = useState(0);

  const targetRef = useRef<HTMLDivElement>(null);

  // Reset ammo when switching weapons
  useEffect(() => {
    setCurrentAmmo(weapon.magSize);
    setIsReloading(false);
    setBulletHoles([]);
    setLastHitScore(null);
  }, [weapon.id, weapon.magSize]);

  // Play appropriate weapon gunshot
  const playWeaponAudio = () => {
    switch (weapon.id) {
      case 'sniper':
        soundManager.playSniper();
        break;
      case 'rocket':
        soundManager.playRocketLaunch();
        setTimeout(() => soundManager.playExplosion(true), 250);
        break;
      case 'shotgun':
        soundManager.playShotgun();
        break;
      case 'dual_uzi':
        soundManager.playUzi();
        break;
      case 'desert_eagle_gold':
        soundManager.playPistol();
        break;
      case 'saw_gun':
        soundManager.playRifle();
        setTimeout(() => soundManager.playRifle(), 70);
        break;
      case 'riot_shield':
        soundManager.playShieldDeflect();
        break;
      case 'm4_rifle':
      default:
        soundManager.playRifle();
        break;
    }
  };

  const handleFireAt = (targetX: number, targetY: number) => {
    if (isReloading) return;

    if (currentAmmo <= 0) {
      soundManager.playEmptyMag();
      haptics.light();
      handleReload();
      return;
    }

    // Deduct ammo
    setCurrentAmmo((prev) => Math.max(0, prev - 1));
    setTotalShotsFired((prev) => prev + 1);
    setIsFiring(true);
    playWeaponAudio();
    haptics.heavy();

    // Calculate score based on proximity to center/head
    // Target is scaled 0..100%
    const dxCenter = targetX - 50;
    const dyCenter = targetY - 50;
    const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

    // Head is around x: 50, y: 22
    const dxHead = targetX - 50;
    const dyHead = targetY - 22;
    const distHead = Math.sqrt(dxHead * dxHead + dyHead * dyHead);

    let score = 50;
    let label = 'إصابة بدن (BODY HIT)';

    if (distHead < 9) {
      score = 100;
      label = 'إصابة رأس قاتلة! (HEADSHOT)';
      soundManager.playHitMarker();
    } else if (distCenter < 8) {
      score = 95;
      label = 'إصابة عين الهدف! (BULLSEYE)';
      soundManager.playHitMarker();
    } else if (distCenter < 18) {
      score = 80;
      label = 'المنطقة الصدرية (TORSO)';
    } else if (distCenter < 32) {
      score = 65;
      label = 'إصابة خارجية (OUTER RING)';
    }

    setLastHitScore({ label, score });

    // Add bullet hole decal
    const newHole: BulletHole = {
      id: Date.now() + Math.random(),
      x: targetX,
      y: targetY,
      score,
      label,
    };
    setBulletHoles((prev) => [...prev.slice(-24), newHole]);

    // Eject shell casing
    const newShell: ShellCasing = {
      id: Date.now(),
      x: 20,
      y: 70,
      vx: (Math.random() - 0.5) * 4 - 3,
      vy: -(Math.random() * 4 + 3),
      rot: Math.random() * 360,
    };
    setShells((prev) => [...prev.slice(-6), newShell]);

    setTimeout(() => {
      setIsFiring(false);
    }, 120);
  };

  const handleTargetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setAimPos({ x, y });
    handleFireAt(x, y);
  };

  const handleTargetMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setAimPos({ x, y });
  };

  const handleReload = () => {
    if (isReloading || currentAmmo === weapon.magSize) return;
    setIsReloading(true);
    soundManager.playReload();
    haptics.medium();

    const reloadDuration = Math.max(600, 1800 - weapon.reload * 12);
    setTimeout(() => {
      setCurrentAmmo(weapon.magSize);
      setIsReloading(false);
      soundManager.playMechanicalClick();
      haptics.light();
    }, reloadDuration);
  };

  const handleClearTarget = () => {
    soundManager.playButtonClick();
    haptics.light();
    setBulletHoles([]);
    setLastHitScore(null);
  };

  return (
    <div className="bg-[#0b130e] border border-[#1f3323] rounded-2xl p-4 shadow-xl select-none">
      {/* Range Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1b2b1e] mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#142318] border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Crosshair size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white">
                حقل الرماية والتجربة البالستية (LIVE SHOOTING RANGE)
              </span>
              <span className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                حي ومباشر
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              انقر على الهدف مباشرة لتسديد طلقات حية واختبار ارتداد ودقة {weapon.name}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setIsLaserEnabled(!isLaserEnabled);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
              isLaserEnabled
                ? 'bg-red-950/80 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                : 'bg-[#121d15] text-gray-400 border-[#223525]'
            }`}
          >
            <Radio size={12} className={isLaserEnabled ? 'animate-pulse text-red-500' : ''} />
            <span>ليزر التصويب {isLaserEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleClearTarget}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#121d15] text-gray-400 hover:text-white border border-[#223525] flex items-center gap-1"
          >
            <RotateCcw size={11} />
            <span>تنظيف الهدف</span>
          </button>
        </div>
      </div>

      {/* Main Shooting Range Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Weapon Visual & Recoil Bench (Cols 4) */}
        <div className="md:col-span-4 bg-[#080e0a] border border-[#1b2b1e] rounded-xl p-3 flex flex-col justify-between h-[240px] relative overflow-hidden">
          {/* Status HUD Header */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-mono">CALIBER BENCH</span>
            <span className="text-amber-400 font-mono font-bold">{weapon.category}</span>
          </div>

          {/* Weapon Graphic with Firing Recoil */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <motion.div
              animate={
                isFiring
                  ? {
                      x: [-12, 4, 0],
                      y: [-4, 2, 0],
                      rotate: [-4, 2, 0],
                    }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={{ duration: 0.12 }}
              className="relative w-full max-w-[180px] h-28 flex items-center justify-center"
            >
              <div className="relative w-full h-32 flex items-center justify-center">
                <WeaponSpriteSVG
                  weapon={weapon.id}
                  lightingMode="pbr"
                  className="w-40 h-24 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
                />
              </div>

              {/* Muzzle Flash VFX */}
              <AnimatePresence>
                {isFiring && (
                  <motion.div
                    initial={{ opacity: 1, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1.4 }}
                    exit={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.08 }}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 via-orange-500 to-transparent blur-[1px] animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white blur-[0.5px]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Ammo & Reload Controls */}
          <div className="space-y-2 pt-2 border-t border-[#1a2b1f]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">الذخيرة الحية:</span>
              <div className="flex items-baseline gap-1 font-mono font-black">
                <span
                  className={`text-lg ${
                    currentAmmo <= 2 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {currentAmmo}
                </span>
                <span className="text-gray-500">/ {weapon.magSize}</span>
              </div>
            </div>

            {/* Ammo Progress Bar */}
            <div className="h-1.5 bg-[#050806] rounded-full overflow-hidden border border-[#162519]">
              <div
                className={`h-full transition-all duration-150 ${
                  currentAmmo <= 2 ? 'bg-red-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${(currentAmmo / weapon.magSize) * 100}%` }}
              />
            </div>

            {/* Fire and Reload Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => handleFireAt(aimPos.x, aimPos.y)}
                disabled={isReloading}
                className="py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 border border-red-400/40"
              >
                <Zap size={14} />
                <span>إطلاق (FIRE)</span>
              </button>

              <button
                onClick={handleReload}
                disabled={isReloading || currentAmmo === weapon.magSize}
                className="py-2 rounded-xl bg-[#142318] hover:bg-[#1b3021] active:scale-95 text-gray-200 font-black text-xs border border-[#273d2b] transition-all flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <RotateCcw size={13} className={isReloading ? 'animate-spin text-amber-400' : ''} />
                <span>{isReloading ? 'جارٍ التلقيم...' : 'تلقيم (RELOAD)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Ballistic Target Range (Cols 8) */}
        <div className="md:col-span-8 bg-[#070c09] border-2 border-[#1c2e20] rounded-xl p-3 h-[240px] relative overflow-hidden flex flex-col justify-between">
          {/* Target Range Info Header */}
          <div className="flex items-center justify-between text-xs z-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono text-[11px]">DISTANCE: 25M</span>
              {lastHitScore && (
                <span className="text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 text-[10px]">
                  {lastHitScore.label} (+{lastHitScore.score})
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              TOTAL SHOTS: {totalShotsFired}
            </span>
          </div>

          {/* Interactive Target Canvas Area */}
          <div
            ref={targetRef}
            onClick={handleTargetClick}
            onMouseMove={handleTargetMouseMove}
            className="relative flex-1 my-1 w-full max-w-[280px] mx-auto cursor-crosshair flex items-center justify-center"
          >
            {/* Silhouette Combat Target SVG */}
            <div className="relative w-44 h-44 rounded-full border-2 border-[#2b4430] bg-[#0c140e] flex items-center justify-center shadow-inner">
              {/* Outer Ring 7 */}
              <div className="w-36 h-36 rounded-full border border-[#2b4430]/70 flex items-center justify-center">
                {/* Mid Ring 8 */}
                <div className="w-28 h-28 rounded-full border border-[#2b4430]/90 flex items-center justify-center bg-[#0e1711]">
                  {/* Inner Ring 9 */}
                  <div className="w-20 h-20 rounded-full border border-cyan-500/40 flex items-center justify-center bg-[#111d14]">
                    {/* Bullseye 10 */}
                    <div className="w-8 h-8 rounded-full bg-red-600/70 border border-red-400 flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Head Silhouette at Top */}
              <div className="absolute top-2 w-10 h-10 rounded-full border-2 border-red-500/50 bg-red-950/30 flex items-center justify-center pointer-events-none">
                <span className="text-[8px] font-mono text-red-400 font-black">HEAD</span>
              </div>

              {/* Crosshair guidelines */}
              <div className="absolute w-full h-[1px] bg-[#223525] pointer-events-none" />
              <div className="absolute h-full w-[1px] bg-[#223525] pointer-events-none" />

              {/* Bullet Hole Decals */}
              {bulletHoles.map((hole) => (
                <div
                  key={hole.id}
                  style={{
                    position: 'absolute',
                    left: `${hole.x}%`,
                    top: `${hole.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="pointer-events-none z-20"
                >
                  <div className="w-3 h-3 rounded-full bg-black border border-amber-400/80 shadow-[0_0_6px_rgba(245,158,11,0.8)] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>
              ))}

              {/* Real-time Tactical Laser Pointer */}
              {isLaserEnabled && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${aimPos.x}%`,
                    top: `${aimPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="pointer-events-none z-30 flex items-center justify-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ff0000]" />
                </div>
              )}
            </div>
          </div>

          {/* Range Footer Status */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-[#18261b] pt-1.5">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles size={11} />
              <span>معدل سرعة الطلقة: {weapon.range * 10} m/s</span>
            </span>
            <span className="font-mono text-gray-400">
              CLICK TARGET TO SHOOT (الرماية التفاعلية)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
