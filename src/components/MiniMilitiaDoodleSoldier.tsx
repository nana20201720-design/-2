import React, { useEffect, useRef } from 'react';
import realisticCommandoImg from '../assets/images/realistic_commando_1789736030533.jpg';
import { drawSoldier2D } from '../game/soldierVisuals';

export interface MiniMilitiaDoodleSoldierProps {
  className?: string;
  weaponName?: string;
  realisticMode?: boolean;
  camoColor?: string;
  headgear?: string;
  bodyArmor?: string;
  eyewear?: string;
  beard?: string;
  jetpackStyle?: string;
  trailColor?: string;
  skinTone?: string;
  playerName?: string;
  isReady?: boolean;
  scale?: number;
}

export const MiniMilitiaDoodleSoldier: React.FC<MiniMilitiaDoodleSoldierProps> = ({
  className = "w-64 h-64",
  weaponName = "rifle",
  realisticMode = false,
  camoColor = "#365314",
  headgear = "camo_helmet",
  bodyArmor = "molle_vest",
  eyewear = "aviators",
  beard = "stubble",
  jetpackStyle = "military_dual",
  trailColor = "#a855f7",
  skinTone = "#fbb587",
  playerName,
  isReady,
  scale = 1.8,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);

  // Render 1:1 Gameplay Character on Canvas when 2D mode is selected
  useEffect(() => {
    if (realisticMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const renderLoop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      const centerX = w / 2;
      const baseCenterY = h * 0.50; // Centered to allow full body and shadow visibility

      // Gentle standing idle breathing/hover animation
      const hoverY = Math.sin(elapsed * 2.5) * 3;

      // Ground Stage Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(centerX, baseCenterY + 36, 36, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal Glow Light
      const glowGrad = ctx.createRadialGradient(
        centerX, baseCenterY + 36, 2,
        centerX, baseCenterY + 36, 45
      );
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
      glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, baseCenterY + 36, 45, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw 1:1 Gameplay Commando Soldier
      ctx.translate(centerX, baseCenterY + hoverY);

      drawSoldier2D(ctx, {
        camoColor,
        headgear,
        bodyArmor,
        eyewear,
        beard,
        jetpackStyle,
        trailColor,
        skinTone,
        weapon: weaponName,
        aimAngle: 0.08, // Aiming slightly forward in standing stance
        isFacingRight: true,
        isJetpacking: false,
        isGrounded: true,
        walkCycle: elapsed * 2,
        isCrouching: false,
        recoilOffset: 0,
        muzzleFlashTimer: 0,
        animTime: elapsed,
        scale,
      });

      ctx.restore();

      animRef.current = requestAnimationFrame(renderLoop);
    };

    animRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [realisticMode, camoColor, headgear, bodyArmor, eyewear, beard, jetpackStyle, trailColor, skinTone, weaponName, scale]);

  if (realisticMode) {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        {/* Glowing Background Radial Bloom */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-600/30 via-cyan-500/20 to-teal-400/30 blur-2xl animate-pulse" />

        {/* Realistic Commando Image Container with Tactical Cyber Frame */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-[0_10px_35px_rgba(16,185,129,0.4)] group">
          <img
            src={realisticCommandoImg}
            alt="Realistic Tactical Commando"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Jetpack Flame Overlay Effects at Bottom */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-t from-emerald-950/90 via-black/40 to-transparent flex items-end justify-center pb-2">
            <div className="flex gap-4">
              <span className="w-3 h-8 rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-transparent blur-sm animate-pulse" />
              <span className="w-3 h-8 rounded-full bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent blur-sm animate-pulse" />
            </div>
          </div>

          {/* Scanline Tactical Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
        </div>

        {/* Floating Tag */}
        <div className="absolute -bottom-3 bg-black/90 backdrop-blur-md border border-emerald-400/80 px-3.5 py-1 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-black text-emerald-300 tracking-wide font-mono">
            3D COMMANDO • {weaponName.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  // 1:1 Gameplay Canvas Doodle Commando Mode
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={280}
        height={320}
        className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(16,185,129,0.35)] pointer-events-none"
      />

      {/* Name and Ready Tag above or below */}
      {playerName && (
        <div className="absolute -bottom-2 bg-black/85 backdrop-blur-md border border-emerald-500/60 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg z-10">
          <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-[11px] font-black text-white">{playerName}</span>
          <span className="text-[10px] text-emerald-300 font-mono">[{weaponName.toUpperCase()}]</span>
        </div>
      )}
    </div>
  );
};

