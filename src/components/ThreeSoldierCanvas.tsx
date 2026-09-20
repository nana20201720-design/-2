import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Zap, Flame, Shield, Crosshair, Volume2, Target, Cpu, User } from 'lucide-react';
import { ThreeSoldierBuilder } from '../game/threeSoldierBuilder';
import { WeaponType } from '../types';
import { soundManager } from '../audio/soundManager';
import {
  PreviewEnvironmentType,
  PREVIEW_ENVIRONMENTS,
  createEnvironmentBackdrop,
  EnvironmentInstance,
} from '../game/threeEnvironments';
import { settingsManager } from '../utils/settingsManager';
import { lodAndTextureOptimizer } from '../utils/lodAndTextureOptimizer';

interface ThreeSoldierCanvasProps {
  camoColor?: string;
  headgear?: string;
  bodyArmor?: string;
  eyewear?: string;
  beard?: string;
  jetpackStyle?: string;
  skinTone?: string;
  weapon?: WeaponType | 'fists' | string;
  trailColor?: string;
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
  capeStyle = 'full_set',
  enableClothingPhysics = true,
  interactive = true,
  showPedestal = true,
  autoRotate = true,
  height = 340,
  className = '',
  environment,
  lightingPreset = 'cyber',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [webglFailed, setWebglFailed] = useState(false);
  const [pose, setPose] = useState<'idle' | 'run' | 'jump' | 'flight' | 'crouch' | 'reload' | 'salute' | 'victory'>('idle');
  const [selectedEnv, setSelectedEnv] = useState<PreviewEnvironmentType>(
    () => environment || settingsManager.getSettings().previewEnvironment || 'training_grounds'
  );

  useEffect(() => {
    if (environment && environment !== selectedEnv) {
      setSelectedEnv(environment);
    }
  }, [environment]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const soldierRef = useRef<ThreeSoldierBuilder | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pedestalGroupRef = useRef<THREE.Group | null>(null);
  const envInstRef = useRef<EnvironmentInstance | null>(null);

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ y: 0, x: 0 });

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupFn = () => {};

    try {
      const width = container.clientWidth || 340;
      const h = typeof height === 'number' ? height : container.clientHeight || 340;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(38, width / h, 0.1, 100);
      camera.position.set(0, 1.2, 4.2);
      camera.lookAt(0, 0.9, 0);
      cameraRef.current = camera;

      // 3. Renderer with soft shadows and alpha transparency
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, h);
      renderer.setPixelRatio(lodAndTextureOptimizer.getOptimalPixelRatio());
      renderer.shadowMap.enabled = lodAndTextureOptimizer.getQuality() !== 'low';
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      rendererRef.current = renderer;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 4. Create 3D Environment Backdrop & Lighting
      const envInst = createEnvironmentBackdrop(selectedEnv);
      envInstRef.current = envInst;
      scene.add(envInst.group);

    // 5. Holographic Pedestal
    if (showPedestal) {
      const pedestalGroup = new THREE.Group();
      pedestalGroupRef.current = pedestalGroup;

      const rimColor = selectedEnv === 'training_grounds' ? 0xf59e0b : selectedEnv === 'military_bunker' ? 0xef4444 : 0x06b6d4;

      // Base disc
      const discGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.1, 32);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const discMesh = new THREE.Mesh(discGeo, discMat);
      discMesh.position.y = -0.05;
      discMesh.receiveShadow = true;
      pedestalGroup.add(discMesh);

      // Glowing Rim
      const ringGeo = new THREE.TorusGeometry(1.2, 0.03, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: rimColor });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.01;
      pedestalGroup.add(ringMesh);

      // Inner tech lines
      const innerRingGeo = new THREE.RingGeometry(0.5, 0.54, 32);
      innerRingGeo.rotateX(-Math.PI / 2);
      const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.position.y = 0.02;
      pedestalGroup.add(innerRing);

      scene.add(pedestalGroup);
    }

    // 6. Build Soldier Mesh
    const soldier = new ThreeSoldierBuilder({
      camoColor,
      headgear,
      bodyArmor,
      eyewear,
      beard,
      jetpackStyle,
      skinTone,
      weapon,
      trailColor,
      capeStyle,
      enableClothingPhysics,
    });
    soldierRef.current = soldier;
    scene.add(soldier.root);

    // 7. Fixed Timestep & Clamped Animation Loop
    let clock = new THREE.Clock();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState !== 'hidden';
      if (isTabVisible) {
        clock.getDelta(); // Reset clock delta on tab regain
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Skip processing when tab is hidden to conserve GPU/CPU memory and battery
      if (!isTabVisible) return;

      const rawDelta = clock.getDelta();
      // Clamp delta time to max 33.3ms (30 FPS limit) to prevent lag spikes or animation leaps
      const delta = lodAndTextureOptimizer.clampDelta(rawDelta, 0.0333);
      const elapsedTime = clock.getElapsedTime();

      // Update environment animation (dust, rotating holo, beacon lights)
      if (envInstRef.current) {
        envInstRef.current.update(delta, elapsedTime);
      }

      if (soldierRef.current) {
        // Handle Auto-rotation
        if (isRotating && !isDraggingRef.current) {
          rotationRef.current.y += 0.012;
        }

        soldierRef.current.root.rotation.y = rotationRef.current.y;
        soldierRef.current.root.rotation.x = rotationRef.current.x;

        // Advance dynamic clothing cloth/accessory physics simulation
        soldierRef.current.updatePhysics(rotationRef.current.y, delta);

        // Advance 3D Skeletal Animation Engine with smooth state lerp blending
        soldierRef.current.updateAnimationState(pose, elapsedTime, delta);
      }

      if (pedestalGroupRef.current) {
        pedestalGroupRef.current.rotation.y = elapsedTime * 0.2;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = typeof height === 'number' ? height : container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    cleanupFn = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (envInstRef.current) envInstRef.current.cleanup();
      if (sceneRef.current) lodAndTextureOptimizer.disposeHierarchy(sceneRef.current);
      if (rendererRef.current) {
        lodAndTextureOptimizer.disposeRenderer(rendererRef.current);
      }
    };
    } catch (err) {
      console.warn("WebGL creation failed, showing 2D fallback:", err);
      setWebglFailed(true);
    }

    return () => {
      cleanupFn();
    };
  }, [height, selectedEnv, showPedestal]);

  // Update soldier configuration whenever props change
  useEffect(() => {
    if (soldierRef.current) {
      soldierRef.current.updateConfig({
        camoColor,
        headgear,
        bodyArmor,
        eyewear,
        beard,
        jetpackStyle,
        skinTone,
        weapon,
        trailColor,
        capeStyle,
        enableClothingPhysics,
      });
    }
  }, [camoColor, headgear, bodyArmor, eyewear, beard, jetpackStyle, skinTone, weapon, trailColor, capeStyle, enableClothingPhysics]);

  // Pointer interactions for 360 rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingRef.current) return;
    const deltaX = e.clientX - prevPointerRef.current.x;
    const deltaY = e.clientY - prevPointerRef.current.y;
    rotationRef.current.y += deltaX * 0.015;
    rotationRef.current.x = Math.max(-0.35, Math.min(0.35, rotationRef.current.x + deltaY * 0.01));
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleTestShot = () => {
    if (soldierRef.current) {
      soldierRef.current.triggerMuzzleFlash();
      soundManager.play('shoot_pistol');
    }
  };

  if (webglFailed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#111c14] to-[#0a100c] border border-[#2a4531]/40 rounded-2xl text-center p-4 ${className}`} style={{ height }}>
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
          <User className="w-7 h-7 text-cyan-400" />
        </div>
        <span className="text-xs font-black text-cyan-300 font-mono tracking-wider">SOLDIER SPEC</span>
        <span className="text-[10px] text-gray-400 mt-1">عرض تكتيكي 2D (اضغط للمعاينة الكاملة)</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`} style={{ height }}>
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* 3D Holographic Controls & Badge Overlay */}
      {interactive && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title="تبديل الدوران التلقائي 3D"
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border backdrop-blur-md transition-all cursor-pointer ${
              isRotating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-neutral-900/60 text-neutral-400 border-white/10'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="text-[10px] hidden sm:inline">3D 360°</span>
          </button>

          <button
            onClick={handleTestShot}
            title="تجربة إطلاق نار ثلاثي الأبعاد"
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs backdrop-blur-md transition-all active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pose Selector floating toolbar */}
      {interactive && (
        <div className="absolute bottom-2 inset-x-2 flex justify-center items-center gap-1 z-10 pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setPose('idle')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'idle'
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              وقوف
            </button>
            <button
              onClick={() => setPose('run')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'run'
                  ? 'bg-lime-500 text-black shadow-[0_0_8px_rgba(132,204,22,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ركض 3D
            </button>
            <button
              onClick={() => setPose('jump')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'jump'
                  ? 'bg-orange-500 text-black shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              قفز
            </button>
            <button
              onClick={() => setPose('flight')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'flight'
                  ? 'bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              طيران 3D
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
              onClick={() => setPose('reload')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                pose === 'reload'
                  ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              تلقيم
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
