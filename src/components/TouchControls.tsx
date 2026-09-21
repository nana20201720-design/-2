import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Crosshair, RotateCcw, Bomb, ArrowDownToLine, Flame, ChevronRight } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { soundManager } from '../audio/soundManager';

interface TouchControlsProps {
  engine: GameEngine | null;
  onPause: () => void;
  grenadesCount: number;
}

export const TouchControls: React.FC<TouchControlsProps> = React.memo(({
  engine,
  onPause,
  grenadesCount,
}) => {
  // Left Joystick visual state
  const [leftActive, setLeftActive] = useState(false);

  // Right Joystick visual state
  const [rightActive, setRightActive] = useState(false);

  // Auto-Fire / Manual-Fire toggle state (default: Auto-Fire enabled)
  const [autoFire] = useState(true);
  const [shootPressed, setShootPressed] = useState(false);

  // Scope Zoom Level state (1 = 1x, 2 = 2x, 3 = 3x)
  const [scopeLevel, setScopeLevel] = useState<1 | 2 | 3>(engine?.scopeLevel || 1);

  // Tactile button states
  const [meleePressed, setMeleePressed] = useState(false);
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

  const maxRadius = 52;

  const handleToggleScope = () => {
    if (engine) {
      const nextLevel = engine.cycleScopeLevel();
      setScopeLevel(nextLevel as 1 | 2 | 3);
      try {
        soundManager.playButtonClick();
      } catch { /* ignore */ }
    }
  };

  // Fixed DOM Element Refs for accurate screen centering and direct transform
  const leftBaseElementRef = useRef<HTMLDivElement | null>(null);
  const rightBaseElementRef = useRef<HTMLDivElement | null>(null);
  const leftThumbElementRef = useRef<HTMLDivElement | null>(null);
  const rightThumbElementRef = useRef<HTMLDivElement | null>(null);

  // Refs for tracking touch identifiers and active touch state
  const leftTouchIdRef = useRef<number | null>(null);
  const rightTouchIdRef = useRef<number | null>(null);
  const isUsingTouchRef = useRef<boolean>(false);

  const getLeftBaseCenter = useCallback(() => {
    if (leftBaseElementRef.current) {
      const rect = leftBaseElementRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: 95, y: window.innerHeight - 88 };
  }, []);

  const getRightBaseCenter = useCallback(() => {
    if (rightBaseElementRef.current) {
      const rect = rightBaseElementRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: window.innerWidth - 105, y: window.innerHeight - 88 };
  }, []);

  // Multi-Touch Event Manager Handlers for Static Fixed Joysticks (High-performance DOM transforms)
  const handleUnifiedTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    isUsingTouchRef.current = true;

    const midX = window.innerWidth / 2;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Left half -> Fixed Movement Joystick
      if (touch.clientX < midX) {
        if (leftTouchIdRef.current === null) {
          leftTouchIdRef.current = touch.identifier;
          setLeftActive(true);
          const center = getLeftBaseCenter();
          let dx = touch.clientX - center.x;
          let dy = touch.clientY - center.y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
          }
          if (leftThumbElementRef.current) {
            leftThumbElementRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          }
          const normX = dx / maxRadius;
          const normY = dy / maxRadius;
          engine?.setMoveInput(normX, normY);
          engine?.setJetpack(normY < -0.15);
        }
      }
      // Right half -> Fixed Aiming/Firing Joystick
      else {
        if (rightTouchIdRef.current === null) {
          rightTouchIdRef.current = touch.identifier;
          setRightActive(true);
          const center = getRightBaseCenter();
          let dx = touch.clientX - center.x;
          let dy = touch.clientY - center.y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
          }
          if (rightThumbElementRef.current) {
            rightThumbElementRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          }
          if (dist > 5) {
            const normX = dx / maxRadius;
            const normY = dy / maxRadius;
            engine?.setAimInput(normX, normY, autoFire);
          }
        }
      }
    }
  }, [engine, getLeftBaseCenter, getRightBaseCenter, autoFire]);

  const handleUnifiedTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];

      if (touch.identifier === leftTouchIdRef.current) {
        const center = getLeftBaseCenter();
        let dx = touch.clientX - center.x;
        let dy = touch.clientY - center.y;
        const dist = Math.hypot(dx, dy);

        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        if (leftThumbElementRef.current) {
          leftThumbElementRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        }

        const normX = dx / maxRadius;
        const normY = dy / maxRadius;
        engine?.setMoveInput(normX, normY);
        engine?.setJetpack(normY < -0.15);
      }
      else if (touch.identifier === rightTouchIdRef.current) {
        const center = getRightBaseCenter();
        let dx = touch.clientX - center.x;
        let dy = touch.clientY - center.y;
        const dist = Math.hypot(dx, dy);

        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        if (rightThumbElementRef.current) {
          rightThumbElementRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        }

        if (dist > 5) {
          const normX = dx / maxRadius;
          const normY = dy / maxRadius;
          engine?.setAimInput(normX, normY, autoFire);
        }
      }
    }
  }, [engine, getLeftBaseCenter, getRightBaseCenter, autoFire]);

  const handleUnifiedTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === leftTouchIdRef.current) {
        leftTouchIdRef.current = null;
        setLeftActive(false);
        if (leftThumbElementRef.current) {
          leftThumbElementRef.current.style.transform = 'translate3d(0px, 0px, 0)';
        }
        engine?.setMoveInput(0, 0);
        engine?.setJetpack(false);
      }
      else if (touch.identifier === rightTouchIdRef.current) {
        rightTouchIdRef.current = null;
        setRightActive(false);
        if (rightThumbElementRef.current) {
          rightThumbElementRef.current.style.transform = 'translate3d(0px, 0px, 0)';
        }
        if (autoFire && !shootPressed) {
          engine?.setShoot(false);
        }
      }
    }
  }, [engine, autoFire, shootPressed]);

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
      if (isUsingTouchRef.current) return;
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
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
      if (isUsingTouchRef.current) return;
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
      const target = e.target as HTMLElement;
      if (target && target.closest('button, [role="button"], input, a, #zone-movement, #zone-aim')) {
        return;
      }
      if (e.button === 0) engine?.setShoot(true);
      if (e.button === 2) {
        e.preventDefault();
        engine?.setJetpack(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isUsingTouchRef.current) return;
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
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

      {/* TOP LEFT SCOPE ZOOM BUTTON */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto z-50">
        <button
          onClick={handleToggleScope}
          className="w-10 h-10 rounded-full border-2 border-neutral-500 bg-neutral-300 text-neutral-900 font-black text-xs shadow-2xl active:scale-90 cursor-pointer hover:bg-neutral-400 transition-all flex items-center justify-center"
          title="تغيير المنظور (1X / 2X / 3X)"
        >
          {scopeLevel}x
        </button>
      </div>

      {/* UNIFIED MULTI-TOUCH EVENT MANAGER OVERLAY FOR FIXED JOYSTICKS */}
      <div
        id="unified-touch-overlay"
        className="absolute bottom-0 left-0 right-0 h-[65%] pointer-events-auto touch-none z-10"
        onTouchStart={handleUnifiedTouchStart}
        onTouchMove={handleUnifiedTouchMove}
        onTouchEnd={handleUnifiedTouchEnd}
        onTouchCancel={handleUnifiedTouchEnd}
      >
        {/* Left Joystick - 100% Fixed Position Movement Control */}
        <div
          ref={leftBaseElementRef}
          className="absolute pointer-events-none z-40 transition-opacity duration-150"
          style={{
            left: '45px',
            bottom: '40px',
            opacity: leftActive ? 1.0 : 0.8,
          }}
        >
          {/* Base Ring (Vibrant Translucent Blue) */}
          <div className={`w-24 h-24 rounded-full border-3 transition-all duration-150 ${leftActive ? 'border-cyan-300 bg-cyan-950/60 shadow-[0_0_25px_rgba(34,211,238,0.7)] scale-105' : 'border-cyan-400/80 bg-cyan-950/40 shadow-md'} backdrop-blur-md flex items-center justify-center`}>
            <div className={`w-14 h-14 rounded-full border transition-colors duration-150 ${leftActive ? 'border-cyan-300/60' : 'border-cyan-400/30'}`} />
            <div
              ref={leftThumbElementRef}
              className={`absolute w-12 h-12 rounded-full border-2 shadow-md flex items-center justify-center will-change-transform ${
                leftActive 
                  ? 'bg-cyan-400/80 border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110' 
                  : 'bg-cyan-500/50 border-cyan-200'
              }`}
            >
              <div className={`w-5 h-5 rounded-full transition-all duration-150 ${leftActive ? 'bg-cyan-100 shadow-[0_0_8px_white]' : 'bg-white/70'}`} />
            </div>
          </div>
        </div>

        {/* Right Joystick - 100% Fixed Position Aiming/Firing Control */}
        <div
          ref={rightBaseElementRef}
          className="absolute pointer-events-none z-40 transition-opacity duration-150"
          style={{
            right: '55px',
            bottom: '40px',
            opacity: rightActive ? 1.0 : 0.8,
          }}
        >
          {/* Base Ring (Vibrant Translucent Red) */}
          <div className={`w-24 h-24 rounded-full border-3 transition-all duration-150 ${rightActive ? 'border-rose-400 bg-rose-950/60 shadow-[0_0_25px_rgba(244,63,94,0.7)] scale-105' : 'border-rose-500/80 bg-rose-950/40 shadow-md'} backdrop-blur-md flex items-center justify-center`}>
            <div className={`w-14 h-14 rounded-full border transition-colors duration-150 ${rightActive ? 'border-rose-400/60' : 'border-rose-500/30'}`} />
            <div
              ref={rightThumbElementRef}
              className={`absolute w-12 h-12 rounded-full border-2 shadow-md flex items-center justify-center will-change-transform ${
                rightActive 
                  ? 'bg-rose-500/80 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-110' 
                  : 'bg-red-600/50 border-red-300'
              }`}
            >
              <Crosshair className={`w-6 h-6 transition-colors duration-150 ${rightActive ? 'text-rose-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]' : 'text-white'}`} />
            </div>
          </div>
        </div>
      </div>
      
      {/* GRENADE BUTTON - FIXED DIRECTLY ABOVE LEFT JOYSTICK */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: '155px', left: '45px' }}
      >
        <button
          id="btn-grenade"
          disabled={grenadesCount <= 0}
          className={`w-11 h-11 rounded-full flex flex-col items-center justify-center border-2 border-white/80 shadow-lg backdrop-blur-md transition-transform active:scale-90 relative cursor-pointer ${
            grenadesCount > 0
              ? 'bg-neutral-900/70 text-white hover:bg-neutral-900/90'
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

      {/* DROP WEAPON TOUCH BUTTON - FIXED DIRECTLY ABOVE GRENADE BUTTON */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: '215px', left: '45px' }}
      >
        <button
          id="btn-touch-drop-weapon"
          className="w-11 h-11 rounded-full flex flex-col items-center justify-center border-2 border-red-400/80 shadow-lg backdrop-blur-md bg-neutral-900/70 hover:bg-red-900/80 active:scale-90 cursor-pointer transition-transform group text-red-300"
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            engine?.dropPlayerWeapon();
          }}
          onClick={(e) => {
            e.stopPropagation();
            engine?.dropPlayerWeapon();
          }}
          title="رمي السلاح 🗑️ (Z)"
        >
          <ArrowDownToLine className="w-4 h-4 text-red-400 group-hover:text-white" />
          <span className="text-[7px] font-black text-red-300 leading-none mt-0.5">
            رمي
          </span>
        </button>
      </div>

      {/* MELEE PUNCH BUTTON - FIXED DIRECTLY ABOVE RIGHT JOYSTICK */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: '155px', right: '55px' }}
      >
        <button
          id="btn-melee"
          className={`w-11 h-11 rounded-full flex items-center justify-center border-2 border-white/80 shadow-lg backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            meleePressed ? 'bg-amber-600/80 scale-95' : 'bg-neutral-900/70 hover:bg-neutral-900/90'
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

      {/* DEDICATED SHOOT / FIRE BUTTON - FIXED DIRECTLY ABOVE MELEE BUTTON */}
      <div 
        className="absolute pointer-events-auto z-50"
        style={{ bottom: '215px', right: '55px' }}
      >
        <button
          id="btn-shoot-manual"
          className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shadow-lg backdrop-blur-md transition-transform active:scale-90 cursor-pointer ${
            shootPressed
              ? 'bg-rose-600 border-white scale-95 shadow-rose-600/50'
              : 'bg-neutral-900/70 border-white/80 text-white hover:bg-neutral-900/90'
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
          <Flame className="w-5 h-5 text-white fill-current" />
          <span className="text-[7px] font-black text-white uppercase tracking-tighter">
            إطلاق
          </span>
        </button>
      </div>
    </div>
  );
});
