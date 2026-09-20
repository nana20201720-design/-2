import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCw,
  Sparkles,
  Zap,
  Flame,
  Shield,
  Crosshair,
  Volume2,
  Maximize2,
  Sun,
  Moon,
  Eye,
  Camera,
  Play,
  Pause,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  Target,
  Cpu,
  Compass,
} from 'lucide-react';
import { ThreeSoldierBuilder } from '../game/threeSoldierBuilder';
import {
  PreviewEnvironmentType,
  PREVIEW_ENVIRONMENTS,
  createEnvironmentBackdrop,
  EnvironmentInstance,
} from '../game/threeEnvironments';
import { WeaponType } from '../types';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { settingsManager } from '../utils/settingsManager';
import { lodAndTextureOptimizer } from '../utils/lodAndTextureOptimizer';

export interface GLTFSoldierPreviewProps {
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
  gltfModelUrl?: string;
  interactive?: boolean;
  showPedestal?: boolean;
  autoRotateDefault?: boolean;
  height?: number | string;
  className?: string;
  environment?: PreviewEnvironmentType;
  onEnvironmentChange?: (env: PreviewEnvironmentType) => void;
  onActionToast?: (msg: string) => void;
}

export type SoldierAnimationPose = 'idle' | 'aim' | 'flight' | 'salute' | 'victory' | 'run';

export const GLTFSoldierPreview: React.FC<GLTFSoldierPreviewProps> = ({
  camoColor = '#365314',
  headgear = 'camo_helmet',
  bodyArmor = 'molle_vest',
  eyewear = 'aviators',
  beard = 'stubble',
  jetpackStyle = 'military_dual',
  skinTone = '#fbb587',
  weapon = 'sniper',
  trailColor = '#a855f7',
  capeStyle = 'full_set',
  enableClothingPhysics = true,
  gltfModelUrl,
  interactive = true,
  showPedestal = true,
  autoRotateDefault = true,
  height = 360,
  className = '',
  environment,
  onEnvironmentChange,
  onActionToast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotateDefault);
  const [currentPose, setCurrentPose] = useState<SoldierAnimationPose>('idle');
  const [selectedEnv, setSelectedEnv] = useState<PreviewEnvironmentType>(
    () => environment || settingsManager.getSettings().previewEnvironment || 'training_grounds'
  );
  const [cameraZoomLevel, setCameraZoomLevel] = useState(1);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showEnvSelectorMenu, setShowEnvSelectorMenu] = useState(false);

  // Sync external environment prop
  useEffect(() => {
    if (environment && environment !== selectedEnv) {
      setSelectedEnv(environment);
    }
  }, [environment]);

  // Three.js Core Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const soldierBuilderRef = useRef<ThreeSoldierBuilder | null>(null);
  const gltfModelGroupRef = useRef<THREE.Group | null>(null);
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animActionsRef = useRef<{ [name: string]: THREE.AnimationAction }>({});
  const animFrameRef = useRef<number | null>(null);
  const pedestalGroupRef = useRef<THREE.Group | null>(null);
  const envInstanceRef = useRef<EnvironmentInstance | null>(null);

  // Interaction tracking for smooth touch & pointer 360 rotation & tilt
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ y: 0.1, x: 0.05 });
  const targetRotationRef = useRef({ y: 0.1, x: 0.05 });
  const zoomDistRef = useRef(3.8);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const h = typeof height === 'number' ? height : container.clientHeight || 360;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
    camera.position.set(0, 1.15, zoomDistRef.current);
    camera.lookAt(0, 0.85, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer with Antialiasing, Tone Mapping & Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, h);
    renderer.setPixelRatio(lodAndTextureOptimizer.getOptimalPixelRatio());
    renderer.shadowMap.enabled = lodAndTextureOptimizer.getQuality() !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Create and attach 3D Environment Backdrop & Lighting
    const envInst = createEnvironmentBackdrop(selectedEnv);
    envInstanceRef.current = envInst;
    scene.add(envInst.group);

    // 5. Holographic / Tactical 3D Pedestal
    if (showPedestal) {
      const pedestalGroup = new THREE.Group();
      pedestalGroupRef.current = pedestalGroup;
      buildPedestalForEnvironment(pedestalGroup, selectedEnv);
      scene.add(pedestalGroup);
    }

    // 6. Build High-Fidelity Rigged 3D Soldier Model
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
      gltfModelUrl,
    });
    soldierBuilderRef.current = soldier;
    scene.add(soldier.root);

    // 7. Optional External GLTF/GLB Loader handled by ThreeSoldierBuilder directly
    if (gltfModelUrl) {
      // Just set loading state for a brief visual confirmation
      setIsModelLoading(true);
      const timer = setTimeout(() => {
        setIsModelLoading(false);
      }, 1000);
    }

    // 8. Fixed Timestep & Clamped Animation Loop
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

      // Smooth Rotation Interpolation
      if (isRotating && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.012;
      }
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.1;
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.1;

      // Update 3D Environment Backdrop props & particles
      if (envInstanceRef.current) {
        envInstanceRef.current.update(delta, elapsedTime);
      }

      // Update GLTF Mixer if present
      if (animationMixerRef.current) {
        animationMixerRef.current.update(delta);
      }

      // Procedural 3D Soldier Bones & Gear Animation
      if (soldierBuilderRef.current && soldierBuilderRef.current.root.visible) {
        const s = soldierBuilderRef.current;
        s.root.rotation.y = rotationRef.current.y;
        s.root.rotation.x = rotationRef.current.x;

        // Advance dynamic clothing cloth & accessory physics simulation
        s.updatePhysics(rotationRef.current.y, delta);

        // Advance 3D Skeletal Animation Engine with smooth state lerp blending
        s.updateAnimationState(currentPose, elapsedTime, delta);
      }

      // Rotate Pedestal Lights
      if (pedestalGroupRef.current) {
        pedestalGroupRef.current.rotation.y = elapsedTime * 0.12;
      }

      // Update Camera Zoom Distance smoothly
      if (cameraRef.current) {
        const targetZ = zoomDistRef.current / cameraZoomLevel;
        cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Container Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = typeof height === 'number' ? height : container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (envInstanceRef.current) envInstanceRef.current.cleanup();
      if (sceneRef.current) lodAndTextureOptimizer.disposeHierarchy(sceneRef.current);
      if (rendererRef.current) {
        lodAndTextureOptimizer.disposeRenderer(rendererRef.current);
      }
    };
  }, [height, showPedestal]);

  // Helper to construct dynamic themed pedestal for each backdrop
  const buildPedestalForEnvironment = (group: THREE.Group, env: PreviewEnvironmentType) => {
    while (group.children.length > 0) {
      const c = group.children[0];
      group.remove(c);
    }

    if (env === 'training_grounds') {
      // Concrete & Sandy Training Deck with Warning Target Markers
      const discGeo = new THREE.CylinderGeometry(1.45, 1.55, 0.12, 36);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x44403c,
        roughness: 0.9,
        metalness: 0.1,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = -0.06;
      disc.receiveShadow = true;
      group.add(disc);

      // Yellow Warning Outer Rim
      const rimGeo = new THREE.TorusGeometry(1.4, 0.035, 12, 48);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = 0.01;
      group.add(rimMesh);

      // Training Crosshair Circle in Center
      const crossGeo = new THREE.RingGeometry(0.5, 0.55, 32);
      crossGeo.rotateX(-Math.PI / 2);
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
      const crossMesh = new THREE.Mesh(crossGeo, crossMat);
      crossMesh.position.y = 0.015;
      group.add(crossMesh);

    } else if (env === 'military_bunker') {
      // Reinforced Heavy Gunmetal Steel Floor Grate
      const discGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.14, 32);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.95,
        roughness: 0.2,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = -0.07;
      disc.receiveShadow = true;
      group.add(disc);

      // Red Emergency Glowing Laser Ring
      const rimGeo = new THREE.TorusGeometry(1.35, 0.04, 16, 48);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = 0.01;
      group.add(rimMesh);

      // Hazard Black & Yellow Center Plate
      const octGeo = new THREE.RingGeometry(0.45, 0.6, 8);
      octGeo.rotateX(-Math.PI / 2);
      const octMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
      const octMesh = new THREE.Mesh(octGeo, octMat);
      octMesh.position.y = 0.015;
      group.add(octMesh);

    } else {
      // High-Tech Cybernetic Hologram Platform
      const discGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.1, 40);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x020617,
        metalness: 0.9,
        roughness: 0.15,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = -0.05;
      disc.receiveShadow = true;
      group.add(disc);

      // Glowing Cyan Laser Ring
      const ringGeo = new THREE.TorusGeometry(1.32, 0.035, 16, 64);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.01;
      group.add(ringMesh);

      // Futuristic Hexagon Core
      const hexGeo = new THREE.RingGeometry(0.5, 0.58, 6);
      hexGeo.rotateX(-Math.PI / 2);
      const hexMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, side: THREE.DoubleSide });
      const hexMesh = new THREE.Mesh(hexGeo, hexMat);
      hexMesh.position.y = 0.015;
      group.add(hexMesh);
    }
  };

  // Switch Environment Backdrop dynamically
  const switchEnvironment = (newEnv: PreviewEnvironmentType) => {
    setSelectedEnv(newEnv);
    settingsManager.updateSettings({ previewEnvironment: newEnv });

    if (sceneRef.current) {
      // Remove old environment
      if (envInstanceRef.current) {
        sceneRef.current.remove(envInstanceRef.current.group);
        envInstanceRef.current.cleanup();
      }

      // Create and mount new environment
      const newInst = createEnvironmentBackdrop(newEnv);
      envInstanceRef.current = newInst;
      sceneRef.current.add(newInst.group);

      // Rebuild pedestal for new theme
      if (pedestalGroupRef.current) {
        buildPedestalForEnvironment(pedestalGroupRef.current, newEnv);
      }
    }

    if (onEnvironmentChange) {
      onEnvironmentChange(newEnv);
    }

    if (onActionToast) {
      const meta = PREVIEW_ENVIRONMENTS[newEnv];
      onActionToast(`🗺️ تم تبديل بيئة الاستوديو 3D إلى: ${meta.nameAr}`);
    }
  };

  // Update Rigged Soldier Mesh whenever Customization changes
  useEffect(() => {
    if (soldierBuilderRef.current) {
      soldierBuilderRef.current.updateConfig({
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
        gltfModelUrl,
      });

      // Apply wireframe mode if active
      if (wireframeMode) {
        soldierBuilderRef.current.root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = (child as THREE.Mesh).material;
            if (Array.isArray(m)) {
              m.forEach((mat) => {
                if ('wireframe' in mat) (mat as THREE.MeshStandardMaterial).wireframe = true;
              });
            } else if (m && 'wireframe' in m) {
              (m as THREE.MeshStandardMaterial).wireframe = true;
            }
          }
        });
      }
    }
  }, [camoColor, headgear, bodyArmor, eyewear, beard, jetpackStyle, skinTone, weapon, trailColor, capeStyle, enableClothingPhysics, wireframeMode, gltfModelUrl]);

  // Pointer & Drag Handlers for 360 Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingRef.current) return;
    const deltaX = e.clientX - prevPointerRef.current.x;
    const deltaY = e.clientY - prevPointerRef.current.y;

    targetRotationRef.current.y += deltaX * 0.015;
    targetRotationRef.current.x = Math.max(
      -0.35,
      Math.min(0.35, targetRotationRef.current.x + deltaY * 0.01)
    );

    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setCameraZoomLevel((prev) => Math.max(0.65, Math.min(1.8, prev + delta)));
  };

  // Interactive Action Triggers
  const handleFireWeapon = () => {
    soundManager.playSwitchWeapon();
    haptics.heavy();
    if (soldierBuilderRef.current) {
      soldierBuilderRef.current.triggerMuzzleFlash();
      soundManager.play('shoot_rifle');
    }
    if (onActionToast) {
      onActionToast('💥 تجربة إطلاق نار ثلاثي الأبعاد من السلاح المجهز!');
    }
  };

  const handleJetpackBurst = () => {
    soundManager.play('switch_weapon');
    haptics.medium();
    setCurrentPose('flight');
    if (onActionToast) {
      onActionToast('🚀 تشغيل نفاثة الطيران التكتيكية ثلاثية الأبعاد!');
    }
  };

  const handleResetView = () => {
    soundManager.playButtonClick();
    haptics.light();
    targetRotationRef.current = { y: 0.1, x: 0.05 };
    setCameraZoomLevel(1);
    setCurrentPose('idle');
    if (onActionToast) {
      onActionToast('🔄 إعادة ضبط زاوية المعاينة 3D الافتراضية');
    }
  };

  const handleToggleWireframe = () => {
    soundManager.playButtonClick();
    haptics.light();
    setWireframeMode(!wireframeMode);
    if (onActionToast) {
      onActionToast(wireframeMode ? '🌐 تم تفعيل العرض الواقعي' : '📐 تم تفعيل نمط الهولوجرام الشبكي (Wireframe)');
    }
  };

  const currentEnvMeta = PREVIEW_ENVIRONMENTS[selectedEnv];

  return (
    <div
      className={`relative w-full overflow-hidden select-none rounded-2xl bg-gradient-to-b ${currentEnvMeta.bgGradientCss} border border-amber-500/40 shadow-2xl transition-colors duration-500 ${className}`}
      style={{ height }}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing relative"
      />

      {/* Model Loading Indicator */}
      {isModelLoading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-mono font-bold text-cyan-300">جارٍ تحميل النموذج ثلاثي الأبعاد GLTF...</span>
        </div>
      )}

      {/* Top Left: 3D Badge & Status Overlay */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
        <span className="bg-black/80 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Sparkles size={12} className="text-cyan-400 animate-pulse" />
          <span>3D GLTF LIVE VIEWER</span>
        </span>
        <span className="bg-black/80 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
          زاوية 360°
        </span>
      </div>

      {/* Top Center: Environment Switcher Dropdown / Quick Bar */}
      {interactive && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
          <div className="flex items-center bg-black/85 backdrop-blur-md p-0.5 rounded-2xl border border-white/15 shadow-xl">
            {(['training_grounds', 'military_bunker', 'tech_lab'] as PreviewEnvironmentType[]).map((envKey) => {
              const env = PREVIEW_ENVIRONMENTS[envKey];
              const isSelected = selectedEnv === envKey;

              return (
                <button
                  key={envKey}
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.medium();
                    switchEnvironment(envKey);
                  }}
                  title={`${env.nameAr} (${env.nameEn})`}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-102'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {envKey === 'training_grounds' && <Target size={12} className={isSelected ? 'text-black' : 'text-amber-400'} />}
                  {envKey === 'military_bunker' && <Shield size={12} className={isSelected ? 'text-black' : 'text-red-400'} />}
                  {envKey === 'tech_lab' && <Cpu size={12} className={isSelected ? 'text-black' : 'text-cyan-400'} />}
                  <span className="text-[10px] whitespace-nowrap hidden sm:inline">{env.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Right: Interactive Utility Controls */}
      {interactive && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setIsRotating(!isRotating);
            }}
            title={isRotating ? 'إيقاف الدوران التلقائي' : 'تشغيل الدوران التلقائي'}
            className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isRotating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-black/60 text-neutral-400 border-white/10 hover:text-white'
            }`}
          >
            <RotateCw size={13} className={isRotating ? 'animate-spin' : ''} />
            <span className="text-[10px] font-bold hidden sm:inline">دوران 360°</span>
          </button>

          <button
            onClick={handleFireWeapon}
            title="تجربة إطلاق النار بالسلاح المجهز"
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 text-xs backdrop-blur-md transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
          >
            <Crosshair size={13} className="text-red-400" />
            <span className="text-[10px] font-bold hidden sm:inline">إطلاق</span>
          </button>

          <button
            onClick={handleJetpackBurst}
            title="اختبار شعلة النفاثة"
            className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 text-xs backdrop-blur-md transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
          >
            <Flame size={13} className="text-purple-400" />
            <span className="text-[10px] font-bold hidden sm:inline">نفاثة</span>
          </button>

          <button
            onClick={handleResetView}
            title="إعادة ضبط زاوية الكاميرا"
            className="p-2 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <RefreshCcw size={13} />
          </button>
        </div>
      )}

      {/* Floating Side Tools (Zoom & Wireframe & Backdrop cycle) */}
      {interactive && (
        <div className="absolute right-2.5 top-14 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setCameraZoomLevel((prev) => Math.min(1.8, prev + 0.2));
            }}
            title="تقريب الكاميرا"
            className="p-1.5 rounded-lg bg-black/70 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md text-xs active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setCameraZoomLevel((prev) => Math.max(0.65, prev - 0.2));
            }}
            title="إبعاد الكاميرا"
            className="p-1.5 rounded-lg bg-black/70 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md text-xs active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={handleToggleWireframe}
            title="تبديل نمط الهولوجرام الشبكي"
            className={`p-1.5 rounded-lg border backdrop-blur-md text-xs active:scale-95 transition-all shadow-md cursor-pointer ${
              wireframeMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-black/70 text-neutral-400 border-white/10 hover:text-white'
            }`}
          >
            <Layers size={13} />
          </button>

          {/* Quick Environment Cycle Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              const envs: PreviewEnvironmentType[] = ['training_grounds', 'military_bunker', 'tech_lab'];
              const nextIdx = (envs.indexOf(selectedEnv) + 1) % envs.length;
              switchEnvironment(envs[nextIdx]);
            }}
            title="تبديل البيئة التكتيكية"
            className="p-1.5 rounded-lg bg-black/70 hover:bg-white/10 text-amber-300 border border-amber-500/40 backdrop-blur-md text-xs active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Compass size={13} />
          </button>
        </div>
      )}

      {/* Bottom Poses & Animation Toolbar */}
      {interactive && (
        <div className="absolute bottom-2 inset-x-2 flex flex-col items-center gap-1.5 z-10 pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-amber-500/40 shadow-xl overflow-x-auto max-w-full">
            <span className="text-[10px] font-bold text-gray-400 ml-1 hidden sm:inline">التحريك:</span>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentPose('idle');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 ${
                currentPose === 'idle'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              وقوف قتالي
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentPose('aim');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 ${
                currentPose === 'aim'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              تصويب بالسلاح
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentPose('flight');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 ${
                currentPose === 'flight'
                  ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              طيران بالنفاثة
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentPose('run');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 ${
                currentPose === 'run'
                  ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ركض ومناورة
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentPose('salute');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 ${
                currentPose === 'salute'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              تحية عسكرية
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentPose('victory');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shrink-0 ${
                currentPose === 'victory'
                  ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              احتفال النصر
            </button>
          </div>

          <div className="text-[10px] text-gray-400 bg-black/60 px-3 py-0.5 rounded-full border border-white/5 font-mono flex items-center gap-1.5">
            <span>البيئة: <strong className="text-amber-300">{currentEnvMeta.nameAr}</strong></span>
            <span>•</span>
            <span>اسحب للإدارة 360° • عجلة الفأرة للتقريب</span>
          </div>
        </div>
      )}
    </div>
  );
};
