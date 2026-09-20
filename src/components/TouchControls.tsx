import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Crosshair, RotateCcw, ArrowRightLeft, Bomb, ArrowDownToLine, Flame, Zap, SlidersHorizontal, Move, ChevronRight } from 'lucide-react';
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GameEngine } from '../game/gameEngine';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';

const DraggableButton = ({ id, children, style }: any) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const dndStyle = {
    transform: CSS.Translate.toString(transform),
  };
  return (
    <div ref={setNodeRef} style={{ ...style, ...dndStyle }} {...listeners} {...attributes} className="cursor-move z-50">
      {children}
    </div>
  );
};

interface TouchControlsProps {
  engine: GameEngine | null;
  onPause: () => void;
  grenadesCount: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  engine,
  onPause,
  grenadesCount,
}) => {
  const leftZoneRef = useRef<HTMLDivElement>(null);
  const rightZoneRef = useRef<HTMLDivElement>(null);

  // Left Joystick visual state
  const [leftActive, setLeftActive] = useState(false);
  const [leftOrigin, setLeftOrigin] = useState({ x: 0, y: 0 });
  const [leftThumb, setLeftThumb] = useState({ x: 0, y: 0 });

  // Right Joystick visual state
  const [rightActive, setRightActive] = useState(false);
  const [rightOrigin, setRightOrigin] = useState({ x: 0, y: 0 });
  const [rightThumb, setRightThumb] = useState({ x: 0, y: 0 });

  // Auto-Fire / Manual-Fire toggle state (default: Auto-Fire enabled)
  const [autoFire, setAutoFire] = useState(true);
  const [shootPressed, setShootPressed] = useState(false);

  // Scope Zoom Level state (1 = 1x, 2 = 2x, 3 = 3x)
  const [scopeLevel, setScopeLevel] = useState<1 | 2 | 3>(engine?.scopeLevel || 1);

  // Tactile button states
  const [meleePressed, setMeleePressed] = useState(false);
  const [controlLayout, setControlLayout] = useState(settingsManager.getSettings().controlLayout);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    return settingsManager.subscribe((settings) => {
      setControlLayout(settings.controlLayout);
    });
  }, []);

  const handleDragEnd = (event: any) => {
    const { delta, active } = event;
    const btn = active.id as 'grenadeBtn' | 'meleeBtn' | 'shootBtn';
    
    setControlLayout(prev => {
      const newLayout = {
        ...prev,
        [btn]: {
          ...prev[btn],
          bottom: prev[btn].bottom - delta.y,
          [btn === 'grenadeBtn' ? 'left' : 'right']: prev[btn][btn === 'grenadeBtn' ? 'left' : 'right'] - delta.x
        }
      };
      settingsManager.updateSettings({ ...settingsManager.getSettings(), controlLayout: newLayout });
      return newLayout;
    });
  };

  const maxRadius = 55;

  const handleToggleScope = () => {
    if (engine) {
      const nextLevel = engine.cycleScopeLevel();
      setScopeLevel(nextLevel as 1 | 2 | 3);
      try {
        soundManager.playButtonClick();
      } catch { /* ignore */ }
    }
  };

  // Left joystick touch handling (Move & Jetpack)
  const handleLeftStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!leftZoneRef.current) return;
    const rect = leftZoneRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const ox = clientX - rect.left;
    const oy = clientY - rect.top;

    setLeftActive(true);
    setLeftOrigin({ x: ox, y: oy });
    setLeftThumb({ x: 0, y: 0 });
    engine?.setMoveInput(0, 0);
  }, [engine]);

  const handleLeftMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!leftActive || !leftZoneRef.current) return;
    const rect = leftZoneRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    let dx = currentX - leftOrigin.x;
    let dy = currentY - leftOrigin.y;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setLeftThumb({ x: dx, y: dy });

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;
    engine?.setMoveInput(normX, normY);
    // Mini Militia signature: pushing joystick up or diagonally automatically fires the Jetpack!
    engine?.setJetpack(normY < -0.15);
  }, [leftActive, leftOrigin, engine]);

  const handleLeftEnd = useCallback(() => {
    setLeftActive(false);
    setLeftThumb({ x: 0, y: 0 });
    engine?.setMoveInput(0, 0);
    engine?.setJetpack(false);
  }, [engine]);

  // Right joystick touch handling (Aiming +/- Shooting based on autoFire mode)
  const handleRightStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!rightZoneRef.current) return;
    const rect = rightZoneRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const ox = clientX - rect.left;
    const oy = clientY - rect.top;

    setRightActive(true);
    setRightOrigin({ x: ox, y: oy });
    setRightThumb({ x: 0, y: 0 });
  }, []);

  const handleRightMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!rightActive || !rightZoneRef.current) return;
    const rect = rightZoneRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    let dx = currentX - rightOrigin.x;
    let dy = currentY - rightOrigin.y;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setRightThumb({ x: dx, y: dy });

    if (dist > 10) {
      const normX = dx / maxRadius;
      const normY = dy / maxRadius;
      // If autoFire is true: shoot automatically while aiming!
      // If autoFire is false: aim direction ONLY without firing!
      engine?.setAimInput(normX, normY, autoFire);
    }
  }, [rightActive, rightOrigin, autoFire, engine]);

  const handleRightEnd = useCallback(() => {
    setRightActive(false);
    setRightThumb({ x: 0, y: 0 });
    if (autoFire && !shootPressed) {
      engine?.setShoot(false);
    }
  }, [autoFire, shootPressed, engine]);

  // Dedicated Shoot Button Handlers (Manual Shooting)
  const handleShootStart = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setShootPressed(true);
    engine?.setShoot(true);
  };

  const handleShootEnd = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setShootPressed(false);
    engine?.setShoot(false);
  };

  // Keyboard and Mouse desktop fallback support
  useEffect(() => {
    const activeKeys = new Set<string>();

    const updateMovementFromKeys = () => {
      let mx = 0;
      let my = 0;

      if (activeKeys.has('a') || activeKeys.has('arrowleft')) mx -= 1;
      if (activeKeys.has('d') || activeKeys.has('arrowright')) mx += 1;
      if (activeKeys.has('w') || activeKeys.has('arrowup') || activeKeys.has(' ')) my -= 1;
      if (activeKeys.has('s') || activeKeys.has('arrowdown')) my += 1;

      const isJetpacking = my < 0 || activeKeys.has('shift');
      engine?.setMoveInput(mx, my);
      engine?.setJetpack(isJetpacking);
      if (my < 0 || activeKeys.has(' ')) {
        engine?.setJump(true);
      } else {
        engine?.setJump(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      activeKeys.add(key);

      if (['a', 'd', 'w', 's', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'shift'].includes(key)) {
        updateMovementFromKeys();
      }

      if (e.repeat) return;
      if (key === 'r') engine?.reloadPlayer();
      if (key === 'q') engine?.switchPlayerWeapon();
      if (key === 'f' || key === 'v') engine?.meleePlayer();
      if (key === 'g' || key === 'e') engine?.throwPlayerGrenade();
      if (key === 'z' || key === 'x' || key === 'c' || key === 'backspace') engine?.dropPlayerWeapon();
      if (key === 'p' || key === 'escape') onPause();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      activeKeys.delete(key);
      updateMovementFromKeys();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!engine) return;
      const target = e.target as HTMLElement;
      if (target && target.closest('button, [role="button"], input, a')) {
        return;
      }
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mx = e.clientX - rect.left - centerX;
      const my = e.clientY - rect.top - centerY;
      const dist = Math.hypot(mx, my);
      if (dist > 25) {
        engine.setAimInput(mx / dist, my / dist, false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('button, [role="button"], input, a')) {
        return;
      }
      if (e.button === 0) engine?.setShoot(true);
      if (e.button === 2) {
        e.preventDefault();
        engine?.setJetpack(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) engine?.setShoot(false);
      if (e.button === 2) {
        e.preventDefault();
        engine?.setJetpack(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [engine, onPause]);

  return (
    <div id="touch-controls-container" className="absolute inset-0 pointer-events-none select-none z-30">
      {/* LANDSCAPE ORIENTATION WARNING OVERLAY */}
      {isPortrait && (
        <div className="fixed inset-0 z-[10000] bg-[#040705] flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <RotateCcw className="w-10 h-10 text-amber-500 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">يرجى تدوير الهاتف</h2>
          <p className="text-gray-400 text-sm max-w-[280px] leading-relaxed">
            للحصول على أفضل تجربة قتالية وتحكم دقيق، يرجى استخدام الوضع الأفقي (Landscape).
          </p>
          <div className="mt-8 flex gap-2">
            <div className="w-12 h-8 border-2 border-amber-500/50 rounded-md rotate-90" />
            <div className="w-4 h-4 flex items-center justify-center self-center">
              <ChevronRight className="text-amber-500" />
            </div>
            <div className="w-12 h-8 border-2 border-amber-500 rounded-md" />
          </div>
        </div>
      )}

      {/* TOP LEFT SCOPE ZOOM & AUTO-FIRE MODE TOGGLE BUTTONS */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto z-50">
        {/* SCOPE ZOOM BUTTON (1X / 2X / 3X) - EXACT MATCH WITH SCREENSHOT */}
        <button
          onClick={handleToggleScope}
          className="w-10 h-10 rounded-full border-2 border-white/90 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center text-white font-black text-xs shadow-2xl active:scale-90 cursor-pointer hover:bg-neutral-800 transition-all"
          title="تغيير المنظور / زوم الكاميرا (1X / 2X / 3X)"
        >
          {scopeLevel}x
        </button>

        {/* AUTO-FIRE / MANUAL FIRE TOGGLE BUTTON */}
        <button
          onClick={() => {
            setAutoFire((prev) => !prev);
            try { soundManager.playButtonClick(); } catch {}
          }}
          className={`px-3 py-1.5 rounded-full border-2 text-xs font-black flex items-center gap-1.5 shadow-2xl active:scale-95 cursor-pointer transition-all ${
            autoFire
              ? 'bg-amber-500/90 border-amber-300 text-neutral-950 hover:bg-amber-400'
              : 'bg-rose-950/90 border-rose-400 text-rose-200 hover:bg-rose-900'
          }`}
          title="تبديل وضع إطلاق النار (تلقائي مع الأيم أو يدوي)"
        >
          {autoFire ? (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>ضرب تلقائي</span>
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
              <span>ضرب يدوي</span>
            </>
          )}
        </button>
      </div>

      {/* MULTI-TOUCH ZONE MANAGER: 50/50 SPLIT WITH CENTER DEAD ZONE */}
      <div className="absolute inset-0 flex pointer-events-none">
        {/* LEFT TOUCH ZONE: MOVEMENT & JETPACK (48% SCREEN) */}
        <div
          id="zone-movement"
          ref={leftZoneRef}
          className="w-[48vw] h-full pointer-events-auto touch-none"
          onTouchStart={handleLeftStart}
          onTouchMove={handleLeftMove}
          onTouchEnd={handleLeftEnd}
          onTouchCancel={handleLeftEnd}
          onMouseDown={handleLeftStart}
          onMouseMove={handleLeftMove}
          onMouseUp={handleLeftEnd}
        >
          {/* Joystick Visual Indicator */}
          <div
            className="absolute transition-opacity duration-200 pointer-events-none"
            style={{
              left: leftActive ? `${leftOrigin.x}px` : '70px',
              top: leftActive ? `${leftOrigin.y}px` : '82%',
              transform: 'translate(-50%, -50%)',
              opacity: leftActive ? 0.95 : 0.4,
            }}
          >
            {/* Base Ring (Vibrant Translucent Blue) */}
            <div className={`w-24 h-24 rounded-full border-3 transition-colors ${leftActive ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'border-cyan-400/80 bg-cyan-950/25'} backdrop-blur-md flex items-center justify-center shadow-lg`}>
              <div className="w-14 h-14 rounded-full border border-cyan-400/30" />
              <div
                className="absolute w-12 h-12 rounded-full bg-cyan-500/40 border-2 border-cyan-200 shadow-md flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${leftThumb.x}px, ${leftThumb.y}px)`,
                }}
              >
                <div className="w-5 h-5 rounded-full bg-white/70" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER DEAD ZONE (4% SCREEN) - PREVENTS CROSS-TALK */}
        <div className="w-[4vw] h-full pointer-events-none border-x border-white/5 bg-white/2" />

        {/* RIGHT TOUCH ZONE: AIM & ROTATION (48% SCREEN) */}
        <div
          id="zone-aim"
          ref={rightZoneRef}
          className="w-[48vw] h-full pointer-events-auto touch-none"
          onTouchStart={handleRightStart}
          onTouchMove={handleRightMove}
          onTouchEnd={handleRightEnd}
          onTouchCancel={handleRightEnd}
          onMouseDown={handleRightStart}
          onMouseMove={handleRightMove}
          onMouseUp={handleRightEnd}
        >
          {/* Joystick Visual Indicator */}
          <div
            className="absolute transition-opacity duration-200 pointer-events-none"
            style={{
              right: rightActive ? `calc(100vw - ${rightOrigin.x}px)` : '70px',
              top: rightActive ? `${rightOrigin.y}px` : '82%',
              transform: 'translate(50%, -50%)',
              opacity: rightActive ? 0.95 : 0.4,
            }}
          >
            {/* Base Ring (Vibrant Translucent Red) */}
            <div className={`w-24 h-24 rounded-full border-3 transition-colors ${rightActive ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-rose-500/80 bg-rose-950/25'} backdrop-blur-md flex items-center justify-center shadow-lg`}>
              <div className="w-14 h-14 rounded-full border border-rose-500/30" />
              <div
                className="absolute w-12 h-12 rounded-full bg-red-600/45 border-2 border-red-300 shadow-md flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${rightThumb.x}px, ${rightThumb.y}px)`,
                }}
              >
                <Crosshair className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* GRENADE BUTTON - POSITIONED ABOVE MOVEMENT JOYSTICK */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: `${controlLayout.grenadeBtn.bottom}px`, left: `${controlLayout.grenadeBtn.left}px` }}
      >
        <button
          id="btn-grenade"
          disabled={grenadesCount <= 0}
          className={`w-11 h-11 rounded-full flex flex-col items-center justify-center border-2 border-white/80 shadow-lg backdrop-blur-md transition-transform active:scale-90 relative cursor-pointer ${
            grenadesCount > 0
              ? 'bg-neutral-900/60 text-white hover:bg-neutral-900/80'
              : 'bg-neutral-900/20 text-neutral-400 opacity-40 cursor-not-allowed'
          }`}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            engine?.throwPlayerGrenade();
          }}
          onClick={(e) => {
            e.stopPropagation();
            engine?.throwPlayerGrenade();
          }}
          title="رمي قنبلة (E / G)"
        >
          <Bomb className="w-5 h-5 text-white" />
          {grenadesCount > 0 && (
            <span className="text-[9px] font-black text-white leading-none mt-0.5">
              {grenadesCount}
            </span>
          )}
        </button>
      </div>

      {/* MELEE PUNCH BUTTON - ADJACENT TO AIM JOYSTICK */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: `${controlLayout.meleeBtn.bottom}px`, right: `${controlLayout.meleeBtn.right}px` }}
      >
        <button
          id="btn-melee"
          className={`w-11 h-11 rounded-full flex items-center justify-center border-2 border-white/80 shadow-lg backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            meleePressed ? 'bg-amber-600/80 scale-95' : 'bg-neutral-900/60 hover:bg-neutral-900/80'
          }`}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMeleePressed(true);
            engine?.meleePlayer();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMeleePressed(false);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setMeleePressed(true);
            engine?.meleePlayer();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            setMeleePressed(false);
          }}
          title="ضربة قريبة 👊 (F / V)"
        >
          <span className="text-xl select-none">👊</span>
        </button>
      </div>

      {/* DEDICATED SHOOT / FIRE BUTTON (زر الضرب المنفصل للطلق اليدوي أو الإضافي) */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: `${controlLayout.shootBtn.bottom}px`, right: `${controlLayout.shootBtn.right}px` }}
      >
        <button
          id="btn-shoot-manual"
          className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-lg backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            shootPressed
              ? 'bg-rose-600 border-white scale-95 shadow-rose-600/50'
              : autoFire
              ? 'bg-red-600/40 border-red-300/30 text-white hover:bg-red-600/70'
              : 'bg-rose-600 border-amber-300 text-white animate-pulse hover:bg-rose-500'
          }`}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShootStart(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShootEnd(e);
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShootEnd(e);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleShootStart(e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            handleShootEnd(e);
          }}
          title="زر إطلاق النار المنفصل 🔫"
        >
          <Flame className="w-6 h-6 text-white fill-current" />
          <span className="text-[8px] font-black text-white uppercase tracking-tighter">
            إطلاق
          </span>
        </button>
      </div>

      {/* UTILITY FLOATING BUTTONS (RELOAD & DROP WEAPON) */}
      <div className="absolute right-28 bottom-40 flex items-center gap-3 pointer-events-auto z-40">
        {/* RELOAD BUTTON */}
        <button
          id="btn-reload"
          className="w-10 h-10 rounded-full bg-neutral-900/60 border-2 border-white/80 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 hover:bg-neutral-900/80 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            engine?.reloadPlayer();
          }}
          title="تلقيم السلاح (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* DROP WEAPON BUTTON */}
        <button
          id="btn-drop-weapon"
          className="w-10 h-10 rounded-full bg-neutral-900/60 border-2 border-amber-400/80 text-amber-300 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 hover:bg-neutral-900/80 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            engine?.dropPlayerWeapon();
          }}
          title="رمي السلاح (Z / X)"
        >
          <ArrowDownToLine className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </div>
  );
};
