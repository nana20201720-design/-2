import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Crosshair, Volume2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { WeaponType } from '../types';
import { lodAndTextureOptimizer } from '../utils/lodAndTextureOptimizer';
import { getWeaponRarityTier, WeaponGlowBackdrop, WeaponRarityTier } from '../utils/weaponRarityThemes';

interface ThreeWeaponCanvasProps {
  weaponType: WeaponType | string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'bronze' | 'blue';
  height?: number | string;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
  showGlowBackdrop?: boolean;
  onTestFire?: () => void;
}

export const ThreeWeaponCanvas: React.FC<ThreeWeaponCanvasProps> = ({
  weaponType,
  rarity = 'epic',
  height = 240,
  autoRotate = true,
  interactive = true,
  className = '',
  showGlowBackdrop = true,
  onTestFire,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [webglFailed, setWebglFailed] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const weaponMeshGroupRef = useRef<THREE.Group | null>(null);
  const muzzleFlashRef = useRef<THREE.PointLight | null>(null);
  const flashSphereRef = useRef<THREE.Mesh | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ y: 0.4, x: 0.1 });

  // Normalized rarity tier: 'bronze' | 'blue' | 'legendary'
  const rarityTier: WeaponRarityTier = getWeaponRarityTier({
    id: typeof weaponType === 'string' ? weaponType : undefined,
    weaponType: typeof weaponType === 'string' ? weaponType : undefined,
    rarity: typeof rarity === 'string' ? rarity : undefined,
  });

  // Rarity aura color for 3D Three.js scene
  const getRarityColor = () => {
    switch (rarityTier) {
      case 'legendary':
        return 0xf59e0b; // Amber Gold
      case 'blue':
        return 0x00daf3; // Electric Blue / Azure Cyan
      case 'bronze':
      default:
        return 0xcd7f32; // Metallic Bronze
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let cleanupFn = () => {};

    try {
      const width = container.clientWidth || 300;
      const h = typeof height === 'number' ? height : container.clientHeight || 240;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 50);
      camera.position.set(0, 0.3, 2.8);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, h);
      renderer.setPixelRatio(lodAndTextureOptimizer.getOptimalPixelRatio());
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      rendererRef.current = renderer;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
      dirLight1.position.set(2, 4, 3);
      scene.add(dirLight1);

      const rarityHex = getRarityColor();
      const rimLight = new THREE.DirectionalLight(rarityHex, 2.5);
      rimLight.position.set(-2, -1, -2);
      scene.add(rimLight);

      // Muzzle flash lights
      const flashLight = new THREE.PointLight(0xffdd44, 0, 4);
      muzzleFlashRef.current = flashLight;
      scene.add(flashLight);

      const flashMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0 })
      );
      flashSphereRef.current = flashMesh;
      scene.add(flashMesh);

      // 3D Pedestal Grid Rings
      const ringGeo = new THREE.TorusGeometry(1.0, 0.02, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: rarityHex });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = -0.6;
      scene.add(ringMesh);

      // Build 3D Weapon Model
      const wGroup = create3DWeaponMesh(weaponType, rarity);
      weaponMeshGroupRef.current = wGroup;
      scene.add(wGroup);

      // Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        if (wGroup) {
          if (isRotating && !isDraggingRef.current) {
            rotationRef.current.y += 0.015;
          }

          wGroup.rotation.y = rotationRef.current.y;
          wGroup.rotation.x = rotationRef.current.x;
          wGroup.position.y = Math.sin(elapsed * 2.5) * 0.05;
        }

        ringMesh.rotation.z = elapsed * 0.4;

        renderer.render(scene, camera);
      };

      animate();

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
        window.removeEventListener('resize', handleResize);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (sceneRef.current) lodAndTextureOptimizer.disposeHierarchy(sceneRef.current);
        if (rendererRef.current) {
          if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
            rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
          }
          rendererRef.current.dispose();
        }
      };
    } catch (err) {
      console.warn("WebGL creation failed, showing 2D fallback:", err);
      setWebglFailed(true);
    }

    return () => {
      cleanupFn();
    };
  }, [weaponType, rarity, height]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingRef.current) return;
    const deltaX = e.clientX - prevPointerRef.current.x;
    const deltaY = e.clientY - prevPointerRef.current.y;
    rotationRef.current.y += deltaX * 0.018;
    rotationRef.current.x = Math.max(-0.4, Math.min(0.4, rotationRef.current.x + deltaY * 0.012));
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleTestFire = () => {
    if (muzzleFlashRef.current && flashSphereRef.current) {
      muzzleFlashRef.current.intensity = 5;
      const mat = flashSphereRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 1;

      setTimeout(() => {
        if (muzzleFlashRef.current) muzzleFlashRef.current.intensity = 0;
        if (flashSphereRef.current) {
          const m = flashSphereRef.current.material as THREE.MeshBasicMaterial;
          m.opacity = 0;
        }
      }, 70);
    }

    if (weaponType.includes('sniper')) soundManager.play('shoot_sniper');
    else if (weaponType.includes('rocket') || weaponType.includes('bazooka')) soundManager.play('shoot_rocket');
    else if (weaponType.includes('shotgun')) soundManager.play('shoot_shotgun');
    else if (weaponType.includes('ak47') || weaponType.includes('rifle')) soundManager.play('shoot_rifle');
    else soundManager.play('shoot_pistol');

    onTestFire?.();
  };

  if (webglFailed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#111c14] to-[#0a100c] border border-[#2a4531]/40 rounded-2xl text-center p-4 ${className}`} style={{ height }}>
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-2 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
          <Crosshair className="w-7 h-7 text-amber-400" />
        </div>
        <span className="text-xs font-black text-amber-300 font-mono tracking-wider">{weaponType.toUpperCase()} SPEC</span>
        <span className="text-[10px] text-gray-400 mt-1">عرض تكتيكي 2D (اضغط للمعاينة الكاملة)</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden select-none flex items-center justify-center ${className}`} style={{ height }}>
      {/* Dynamic Weapon Glow Aura behind 3D WebGL Canvas */}
      {showGlowBackdrop && (
        <WeaponGlowBackdrop tier={rarityTier} size="md" />
      )}

      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing"
      />

      {interactive && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title="تبديل الدوران 3D"
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border backdrop-blur-md transition-all ${
              isRotating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-neutral-900/60 text-neutral-400 border-white/10'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="text-[10px] hidden sm:inline">3D</span>
          </button>

          <button
            onClick={handleTestFire}
            title="تجربة إطلاق نار 3D"
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs backdrop-blur-md transition-all active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center gap-1"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">إطلاق</span>
          </button>
        </div>
      )}
    </div>
  );
};

function create3DWeaponMesh(weaponType: string, rarity: string): THREE.Group {
  const group = new THREE.Group();

  const isGold = rarity === 'legendary' || weaponType.includes('gold');
  const metalMat = new THREE.MeshStandardMaterial({
    color: isGold ? 0xf59e0b : 0x1f2937,
    metalness: 0.9,
    roughness: 0.2,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    metalness: 0.1,
    roughness: 0.65,
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.9,
  });

  if (weaponType.includes('sniper')) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.8, 16), metalMat);
    barrel.rotateZ(Math.PI / 2);
    barrel.position.x = 0.4;

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.1), chromeMat);
    body.position.x = -0.1;

    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.55, 16), metalMat);
    scope.rotateZ(Math.PI / 2);
    scope.position.set(-0.05, 0.18, 0);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.08), metalMat);
    mag.position.set(-0.1, -0.2, 0);

    group.add(barrel, body, scope, mag);
  } else if (weaponType.includes('rocket') || weaponType.includes('bazooka')) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.6, 20), metalMat);
    tube.rotateZ(Math.PI / 2);

    const warhead = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 })
    );
    warhead.rotateZ(-Math.PI / 2);
    warhead.position.x = 0.95;

    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.12), glowMat);
    sight.position.set(0.1, 0.22, 0.1);

    group.add(tube, warhead, sight);
  } else if (weaponType.includes('ak47') || weaponType.includes('rifle')) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 0.09), metalMat);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.08), woodMat);
    stock.position.set(-0.55, -0.04, 0);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 12), metalMat);
    barrel.rotateZ(Math.PI / 2);
    barrel.position.set(0.55, 0.04, 0);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.07), metalMat);
    mag.position.set(0.1, -0.22, 0);
    mag.rotation.z = 0.3;

    group.add(body, stock, barrel, mag);
  } else if (weaponType.includes('shotgun')) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 14), chromeMat);
    barrel.rotateZ(Math.PI / 2);
    barrel.position.set(0.3, 0.04, 0);

    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), metalMat);
    tube.rotateZ(Math.PI / 2);
    tube.position.set(0.25, -0.04, 0);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.08), woodMat);
    stock.position.set(-0.35, -0.06, 0);

    group.add(barrel, tube, stock);
  } else if (weaponType.includes('laser') || weaponType.includes('plasma')) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.12), metalMat);

    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 12, 24), glowMat);
      ring.position.set(-0.1 + i * 0.22, 0.03, 0);
      group.add(ring);
    }

    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12), glowMat);
    core.rotateZ(Math.PI / 2);
    core.position.set(0.2, 0.03, 0);

    group.add(body, core);
  } else if (weaponType.includes('minigun')) {
    const central = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.2, 16), metalMat);
    central.rotateZ(Math.PI / 2);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8), chromeMat);
      b.rotateZ(Math.PI / 2);
      b.position.set(0, Math.cos(angle) * 0.12, Math.sin(angle) * 0.12);
      group.add(b);
    }

    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.25), metalMat);
    motor.position.set(-0.45, 0, 0);

    group.add(central, motor);
  } else if (weaponType.includes('saw_gun') || weaponType.includes('saw')) {
    // Heavy Buzzsaw Disc Cannon
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.14), metalMat);
    body.position.x = -0.15;

    // Revolving Saw Disc Blade
    const sawDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.025, 24), chromeMat);
    sawDisc.rotateZ(Math.PI / 2);
    sawDisc.position.set(0.35, 0.05, 0);

    // Motor Hub & Teeth accents
    const sawHub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16), metalMat);
    sawHub.rotateZ(Math.PI / 2);
    sawHub.position.set(0.35, 0.05, 0);

    const cage = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 8, 20), glowMat);
    cage.position.set(0.35, 0.05, 0);

    group.add(body, sawDisc, sawHub, cage);
  } else if (weaponType.includes('dual_uzi') || weaponType.includes('uzi') || weaponType.includes('smg')) {
    // Dual Tactical Micro-Uzi Submachine Guns
    for (let offset of [-0.18, 0.18]) {
      const uziBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.08), metalMat);
      uziBody.position.set(0, 0, offset);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 12), chromeMat);
      barrel.rotateZ(Math.PI / 2);
      barrel.position.set(0.35, 0.03, offset);

      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.06), metalMat);
      mag.position.set(-0.02, -0.22, offset);

      const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 12), metalMat);
      suppressor.rotateZ(Math.PI / 2);
      suppressor.position.set(0.55, 0.03, offset);

      group.add(uziBody, barrel, mag, suppressor);
    }
  } else if (weaponType.includes('flamethrower')) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 16), glowMat);
    tank.rotateZ(Math.PI / 2);
    tank.position.set(-0.25, -0.1, 0);

    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 16), chromeMat);
    nozzle.rotateZ(-Math.PI / 2);
    nozzle.position.set(0.45, 0.05, 0);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.1), metalMat);
    body.position.set(0.05, 0.05, 0);

    group.add(tank, nozzle, body);
  } else {
    // Heavy Handgun / Desert Eagle Gold & Tactical Magnum
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.09), chromeMat);
    slide.position.set(0.1, 0.06, 0);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.15, 12), chromeMat);
    barrel.rotateZ(Math.PI / 2);
    barrel.position.set(0.42, 0.06, 0);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.08), metalMat);
    grip.position.set(-0.08, -0.1, 0);
    grip.rotation.z = 0.2;

    const laserSight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.07), glowMat);
    laserSight.position.set(0.2, -0.04, 0);

    group.add(slide, barrel, grip, laserSight);
  }

  return group;
}
