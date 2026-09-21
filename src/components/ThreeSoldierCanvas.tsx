import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, Zap, Flame, Shield, Crosshair, Volume2 } from 'lucide-react';
import { drawSoldier2D } from '../game/soldierVisuals';
import { WeaponType } from '../types';
import { soundManager } from '../audio/soundManager';
import { PreviewEnvironmentType } from '../game/threeEnvironments';
import { settingsManager } from '../utils/settingsManager';

export interface ThreeSoldierCanvasProps {
  camoColor?: string;
  headgear?: string;
  bodyArmor?: string;
  eyewear?: string;
  beard?: string;
  jetpackStyle?: string;
  skinTone?: string;
  weapon?: WeaponType | 'fists' | string;
  trailColor?: string;
  skinId?: string;
  capeStyle?: 'none' | 'tactical_cape' | 'commando_scarf' | 'full_set';
  enableClothingPhysics?: boolean;
  interactive?: boolean;
  showPedestal?: boolean;
  autoRotate?: boolean;
  height?: number | string;
  className?: string;
  environment?: PreviewEnvironmentType;
  lightingPreset?: 'cyber' | 'daylight' | 'sunset' | 'nightops';
}

export const ThreeSoldierCanvas: React.FC<ThreeSoldierCanvasProps> = ({
  camoColor = '#365314',
  headgear = 'camo_helmet',
  bodyArmor = 'molle_vest',
  eyewear = 'aviators',
  beard = 'stubble',
  jetpackStyle = 'military_dual',
  skinTone = '#fbb587',
  weapon = 'pistol',
  trailColor = '#a855f7',
  skinId,
  interactive = true,
  showPedestal = true,
  autoRotate = true,
  height = 340,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [pose, setPose] = useState<'idle' | 'run' | 'jump' | 'flight' | 'crouch' | 'reload' | 'salute' | 'victory'>('idle');
  const [isFiring, setIsFiring] = useState(false);

  // Interaction tracking
  const rotationAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const recoilRef = useRef(0);
  const muzzleFlashRef = useRef(0);

  // Resolved skin
  const resolvedSkinId = skinId || settingsManager.getSettings().equippedSkin || 'woodland_camo';

  // Handle firing test
  const handleTriggerShot = () => {
    setIsFiring(true);
    recoilRef.current = 10;
    muzzleFlashRef.current = 0.12;
    try {
      soundManager.playWeaponSound(weapon as WeaponType);
    } catch {
      // Audio fallback
    }
    setTimeout(() => setIsFiring(false), 200);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();
    let lastTime = startTime;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      lastTime = now;

      // Update recoil and muzzle flash
      if (recoilRef.current > 0) {
        recoilRef.current = Math.max(0, recoilRef.current - dt * 35);
      }
      if (muzzleFlashRef.current > 0) {
        muzzleFlashRef.current = Math.max(0, muzzleFlashRef.current - dt);
      }

      // Auto rotation
      if (isRotating && !isDraggingRef.current) {
        rotationAngleRef.current += dt * 1.2;
      }

      // Resize canvas to container
      const container = containerRef.current;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const displayW = Math.max(rect.width, 240);
        const displayH = typeof height === 'number' ? height : Math.max(rect.height, 300);

        if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
          canvas.width = displayW * dpr;
          canvas.height = displayH * dpr;
        }

        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayW, displayH);

        const centerX = displayW / 2;
        const baseCenterY = displayH * 0.58;

        // Pose parameters
        const isFlight = pose === 'flight';
        const isRun = pose === 'run';
        const isJump = pose === 'jump';
        const isCrouch = pose === 'crouch';
        const isSalute = pose === 'salute';
        const isVictory = pose === 'victory';

        // Vertical hover oscillation
        let hoverY = Math.sin(elapsed * 3) * 3;
        if (isFlight) {
          hoverY = -24 + Math.sin(elapsed * 16) * 5;
        } else if (isJump) {
          hoverY = -18 + Math.abs(Math.sin(elapsed * 4)) * -10;
        } else if (isRun) {
          hoverY = Math.abs(Math.sin(elapsed * 10)) * -4;
        } else if (isCrouch) {
          hoverY = 6;
        }

        // ==========================================
        // 1. PEDESTAL & SHADOW
        // ==========================================
        if (showPedestal) {
          const shadowScale = isFlight ? 0.55 : isJump ? 0.7 : 1.0;
          const shadowAlpha = isFlight ? 0.25 : 0.55;

          // Soft ground shadow
          ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
          ctx.beginPath();
          ctx.ellipse(centerX, baseCenterY + 44, 48 * shadowScale, 13 * shadowScale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer Pedestal Disc
          ctx.fillStyle = '#09090b';
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(centerX, baseCenterY + 44, 60, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Glowing Launchpad Ring
          const ringColor = isFlight ? '#a855f7' : '#f59e0b';
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(centerX, baseCenterY + 44, 52, 13.5, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Pedestal radial glow
          const pedestalGrad = ctx.createRadialGradient(
            centerX,
            baseCenterY + 44,
            5,
            centerX,
            baseCenterY + 44,
            65
          );
          pedestalGrad.addColorStop(0, isFlight ? 'rgba(168, 85, 247, 0.45)' : 'rgba(245, 158, 11, 0.35)');
          pedestalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = pedestalGrad;
          ctx.beginPath();
          ctx.ellipse(centerX, baseCenterY + 44, 65, 18, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // ==========================================
        // 2. JETPACK THRUSTER FLAMES & SMOKE
        // ==========================================
        if (isFlight) {
          const jetX = centerX - 12;
          const jetY = baseCenterY + hoverY + 12;
          
          // Jet flame
          const flameH = 24 + Math.random() * 12;
          const flameGrad = ctx.createLinearGradient(jetX, jetY, jetX, jetY + flameH);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#38bdf8');
          flameGrad.addColorStop(0.7, '#a855f7');
          flameGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.ellipse(jetX, jetY + flameH * 0.4, 7, flameH * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Trailing exhaust smoke rings
          for (let si = 1; si <= 3; si++) {
            const smokeY = jetY + flameH + si * 10 + (elapsed * 25) % 15;
            const smokeRadius = 5 + si * 3.5;
            ctx.fillStyle = `rgba(168, 85, 247, ${0.4 / si})`;
            ctx.beginPath();
            ctx.arc(jetX + (Math.sin(elapsed * 10 + si) * 4), smokeY, smokeRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ==========================================
        // 3. DRAW AUTHENTIC 2D MINI MILITIA SOLDIER
        // ==========================================
        ctx.save();
        ctx.translate(centerX, baseCenterY + hoverY);

        // Determine facing direction from rotation angle
        const normAngle = ((rotationAngleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const isFacingRight = normAngle < Math.PI * 0.5 || normAngle > Math.PI * 1.5;

        // Calculate aim angle for pose
        let aimAngle = 0;
        if (isVictory) {
          aimAngle = -Math.PI * 0.45; // Gun pointing triumphantly up!
        } else if (pose === 'reload') {
          aimAngle = Math.PI * 0.25; // Gun pointing down to reload!
        } else if (isFlight) {
          aimAngle = -Math.PI * 0.15;
        }

        drawSoldier2D(ctx, {
          skinId: resolvedSkinId,
          camoColor,
          headgear,
          bodyArmor,
          eyewear,
          beard,
          jetpackStyle,
          trailColor,
          skinTone,
          weapon: isSalute ? 'fists' : weapon,
          aimAngle,
          isFacingRight,
          isJetpacking: isFlight,
          isGrounded: !isFlight && !isJump,
          walkCycle: isRun ? elapsed * 14 : isFlight ? 0 : elapsed * 2,
          isCrouching: isCrouch,
          recoilOffset: recoilRef.current,
          muzzleFlashTimer: muzzleFlashRef.current,
          animTime: elapsed,
          scale: 2.2, // High resolution preview scale
          isSaluting: isSalute,
          saluteTime: elapsed,
        });

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    camoColor,
    headgear,
    bodyArmor,
    eyewear,
    beard,
    jetpackStyle,
    skinTone,
    weapon,
    trailColor,
    resolvedSkinId,
    pose,
    isRotating,
    showPedestal,
    height,
  ]);

  // Pointer interaction for rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !interactive) return;
    const dx = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    rotationAngleRef.current += dx * 0.015;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // pointer release fallback
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden flex flex-col items-center select-none bg-gradient-to-b from-neutral-950 via-[#0a0f0d] to-neutral-950 rounded-2xl border border-neutral-800/80 ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* Interactive 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Top Left Badge: Authentic 2D Mini Militia Commando */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-emerald-500/40 backdrop-blur-md pointer-events-none z-10 shadow-lg">
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] font-black text-emerald-300 tracking-wider">
          مقاتل 2D أصلي (MINI MILITIA)
        </span>
      </div>

      {/* Top Right Quick Action Buttons */}
      {interactive && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Test Firing Shot */}
          <button
            onClick={handleTriggerShot}
            title="تجربة إطلاق النار"
            className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/50 hover:bg-red-800/80 text-red-300 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'إيقاف التدوير' : 'تشغيل التدوير التلقائي'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 ${
              isRotating
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-neutral-900/80 border-neutral-700 text-neutral-400'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </button>
        </div>
      )}

      {/* Bottom Floating Pose Bar */}
      {interactive && (
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center px-2 pointer-events-auto z-10">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/80 border border-neutral-800 backdrop-blur-md shadow-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setPose('idle')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'idle'
                  ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              وقوف
            </button>
            <button
              onClick={() => setPose('run')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'run'
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ركض
            </button>
            <button
              onClick={() => setPose('flight')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-0.5 ${
                pose === 'flight'
                  ? 'bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-2.5 h-2.5" />
              طيران
            </button>
            <button
              onClick={() => setPose('crouch')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'crouch'
                  ? 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              احتماء
            </button>
            <button
              onClick={() => setPose('salute')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'salute'
                  ? 'bg-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              تحية
            </button>
            <button
              onClick={() => setPose('victory')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'victory'
                  ? 'bg-yellow-400 text-black shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              انتصار
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
