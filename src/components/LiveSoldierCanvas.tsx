import React, { useRef, useEffect, useState } from 'react';
import { drawSoldier2D } from '../game/soldierVisuals';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import {
  RotateCw,
  Zap,
  Crosshair,
  Crown,
  Sparkles,
  Volume2,
} from 'lucide-react';

export interface LiveSoldierCanvasProps {
  skinId?: string;
  camoColor: string;
  headgear: string;
  bodyArmor: string;
  eyewear: string;
  beard: string;
  jetpackStyle: string;
  trailColor: string;
  weapon: string;
  skinTone?: string;
  width?: number;
  height?: number;
  onActionToast?: (msg: string) => void;
}

export const LiveSoldierCanvas: React.FC<LiveSoldierCanvasProps> = ({
  skinId,
  camoColor,
  headgear,
  bodyArmor,
  eyewear,
  beard,
  jetpackStyle,
  trailColor,
  weapon,
  skinTone = '#fbb587',
  width = 280,
  height = 280,
  onActionToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interactive Animation States
  const [rotationAngle, setRotationAngle] = useState(0); // in radians
  const [isJetTesting, setIsJetTesting] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [isSaluting, setIsSaluting] = useState(false);

  // References for continuous anim loop
  const animRef = useRef<number>(0);
  const isJetTestingRef = useRef(false);
  const isFiringRef = useRef(false);
  const isSalutingRef = useRef(false);
  const rotationAngleRef = useRef(0);
  const recoilRef = useRef(0);
  const muzzleFlashRef = useRef(0);

  // Touch / Drag rotation
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    isJetTestingRef.current = isJetTesting;
  }, [isJetTesting]);

  useEffect(() => {
    isFiringRef.current = isFiring;
  }, [isFiring]);

  useEffect(() => {
    isSalutingRef.current = isSaluting;
  }, [isSaluting]);

  useEffect(() => {
    rotationAngleRef.current = rotationAngle;
  }, [rotationAngle]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const renderFrame = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Handle recoil and muzzle recovery
      if (recoilRef.current > 0) {
        recoilRef.current = Math.max(0, recoilRef.current - 0.5);
      }
      if (muzzleFlashRef.current > 0) {
        muzzleFlashRef.current = Math.max(0, muzzleFlashRef.current - 0.1);
      }

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      // Center on pedestal
      const centerX = width / 2;
      const baseCenterY = height * 0.62;

      // Vertical hover oscillation
      let hoverY = Math.sin(elapsed * 3) * 3;
      if (isJetTestingRef.current) {
        hoverY = -18 + Math.sin(elapsed * 18) * 4;
      }

      // ==========================================
      // STAGE PEDESTAL & SHADOW
      // ==========================================
      // Shadow on floor
      const shadowScale = isJetTestingRef.current ? 0.6 : 1.0;
      const shadowAlpha = isJetTestingRef.current ? 0.3 : 0.6;
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(centerX, baseCenterY + 44, 42 * shadowScale, 12 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Pedestal Light Ring
      const glowGrad = ctx.createRadialGradient(
        centerX,
        baseCenterY + 44,
        5,
        centerX,
        baseCenterY + 44,
        55
      );
      if (isJetTestingRef.current) {
        glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
        glowGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, baseCenterY + 44, 55, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // SOLDIER FIGURE DRAWING
      // ==========================================
      ctx.translate(centerX, baseCenterY + hoverY);

      // Determine facing direction from rotation angle
      const normAngle = ((rotationAngleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const isFacingRight = normAngle < Math.PI * 0.5 || normAngle > Math.PI * 1.5;

      // Draw Soldier with 2D Visuals
      drawSoldier2D(ctx, {
        skinId,
        camoColor,
        headgear,
        bodyArmor,
        eyewear,
        beard,
        jetpackStyle,
        trailColor,
        skinTone,
        weapon: isSalutingRef.current ? 'fists' : weapon,
        aimAngle: isFiringRef.current ? -0.1 : 0,
        isFacingRight,
        isJetpacking: isJetTestingRef.current,
        isGrounded: !isJetTestingRef.current,
        walkCycle: elapsed * 4,
        isCrouching: false,
        recoilOffset: recoilRef.current,
        muzzleFlashTimer: muzzleFlashRef.current,
        animTime: elapsed,
        scale: 2.1, // High resolution preview scale
        isSaluting: isSalutingRef.current,
        saluteTime: elapsed,
      });

      ctx.restore();

      animRef.current = requestAnimationFrame(renderFrame);
    };

    animRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [skinId, camoColor, headgear, bodyArmor, eyewear, beard, jetpackStyle, trailColor, skinTone, weapon, width, height]);

  // Touch and Drag handlers for 360 degree rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    setRotationAngle((prev) => prev + deltaX * 0.025);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.touches[0].clientX;
    setRotationAngle((prev) => prev + deltaX * 0.03);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Button Actions
  const handleRotateButton = () => {
    soundManager.playButtonClick();
    haptics.light();
    setRotationAngle((prev) => prev + Math.PI);
    onActionToast?.('🔄 تم تدوير زاوية عرض الجندي 180°');
  };

  const handleJetpackTest = () => {
    soundManager.playRocketLaunch();
    haptics.heavy();
    setIsJetTesting(true);
    onActionToast?.('🚀 تم تشغيل نفاثة الطيران التكتيكية!');
    setTimeout(() => {
      setIsJetTesting(false);
    }, 2000);
  };

  const handleTestFire = () => {
    const w = weapon.toLowerCase();
    if (w.includes('sniper')) soundManager.playSniper();
    else if (w.includes('rocket') || w.includes('rpg')) soundManager.playRocketLaunch();
    else if (w.includes('shotgun')) soundManager.playShotgun();
    else if (w.includes('rifle') || w.includes('m4')) soundManager.playRifle();
    else soundManager.playPistol();

    haptics.heavy();
    recoilRef.current = 10;
    muzzleFlashRef.current = 1.0;
    setIsFiring(true);
    onActionToast?.(`💥 تجربة إطلاق نار حية: ${weapon.toUpperCase()}`);

    setTimeout(() => {
      setIsFiring(false);
    }, 300);
  };

  const handleVictorySalute = () => {
    soundManager.playVictory();
    haptics.medium();
    setIsSaluting(true);
    onActionToast?.('🎖️ تحية النصر العسكرية للأبطال!');
    setTimeout(() => {
      setIsSaluting(false);
    }, 2200);
  };

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* Interactive Canvas Viewport */}
      <div
        className="relative w-full max-w-[320px] h-[260px] sm:h-[280px] rounded-2xl bg-gradient-to-b from-[#09150d] via-[#0b1b11] to-[#050c08] border-2 border-[#2b4430] flex items-center justify-center overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ambient Grid Matrix */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Live Canvas */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="relative z-10 w-full h-full object-contain pointer-events-none"
        />

        {/* Swipe Rotation Helper Prompt */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none bg-black/70 backdrop-blur border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-400 flex items-center gap-1">
          <RotateCw size={10} className="animate-spin" style={{ animationDuration: '6s' }} />
          <span>اسحب للتدوير 360°</span>
        </div>

        {/* Status Tag */}
        <div className="absolute top-2 right-2 z-20 pointer-events-none bg-emerald-950/90 border border-emerald-500/60 px-2 py-0.5 rounded-full text-[9px] font-black text-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>حي ومباشر (LIVE 3D)</span>
        </div>
      </div>

      {/* Interactive Action Control Deck */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-[320px] mt-2.5">
        <button
          onClick={handleRotateButton}
          className="flex flex-col items-center justify-center gap-1 bg-[#132017] hover:bg-[#1c2e21] border border-[#273d2b] p-2 rounded-xl text-gray-200 active:scale-95 transition-all shadow cursor-pointer"
          title="تدوير زاوية العرض"
        >
          <RotateCw size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold">تدوير</span>
        </button>

        <button
          onClick={handleJetpackTest}
          className={`flex flex-col items-center justify-center gap-1 border p-2 rounded-xl active:scale-95 transition-all shadow cursor-pointer ${
            isJetTesting
              ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-[#10232b] hover:bg-[#16303b] border-cyan-500/60 text-cyan-300'
          }`}
          title="تجربة تشغيل النفاثة"
        >
          <Zap size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black">نفاثة 🔥</span>
        </button>

        <button
          onClick={handleTestFire}
          className="flex flex-col items-center justify-center gap-1 bg-[#281515] hover:bg-[#381c1c] border border-red-500/60 p-2 rounded-xl text-red-300 active:scale-95 transition-all shadow cursor-pointer"
          title="تجربة إطلاق النار بالسلاح المجهز"
        >
          <Crosshair size={14} className="text-red-400" />
          <span className="text-[10px] font-black">إطلاق 💥</span>
        </button>

        <button
          onClick={handleVictorySalute}
          className="flex flex-col items-center justify-center gap-1 bg-[#241e10] hover:bg-[#332b16] border border-amber-500/60 p-2 rounded-xl text-amber-300 active:scale-95 transition-all shadow cursor-pointer"
          title="حركة النصر والتحية العسكرية"
        >
          <Crown size={14} className="text-amber-400" />
          <span className="text-[10px] font-black">تحية 👑</span>
        </button>
      </div>
    </div>
  );
};
