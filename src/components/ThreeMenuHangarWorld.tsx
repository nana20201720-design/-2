import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Video,
  RotateCw,
  Compass,
  Play,
  Pause,
  Swords,
  Users,
  Shield,
  Zap,
  Package,
  Sparkles,
  Maximize2,
  Activity,
  Film,
} from 'lucide-react';
import { ThreeSoldierBuilder } from '../game/threeSoldierBuilder';
import { settingsManager } from '../utils/settingsManager';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

interface CameraTargetDef {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  zoneTitleAr: string;
  zoneTitleEn: string;
}

/**
 * Creates 3D Holographic Zone Title Canvas Sprites
 */
function createHoloZoneSprite(textAr: string, textEn: string, mainColorHex: string = '#10b981') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 140);
    
    // Dark glass backing
    ctx.fillStyle = 'rgba(8, 16, 11, 0.82)';
    ctx.strokeStyle = mainColorHex;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(12, 12, 488, 116, 24);
    } else {
      ctx.rect(12, 12, 488, 116);
    }
    ctx.fill();
    ctx.stroke();

    // Glowing corner braces
    ctx.fillStyle = mainColorHex;
    ctx.fillRect(20, 20, 12, 4);
    ctx.fillRect(20, 20, 4, 12);
    ctx.fillRect(480, 20, 12, 4);
    ctx.fillRect(488, 20, 4, 12);

    // Text Glow
    ctx.shadowColor = mainColorHex;
    ctx.shadowBlur = 12;

    // Arabic Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(textAr, 256, 58);

    // English Title
    ctx.fillStyle = mainColorHex;
    ctx.font = 'bold 18px monospace';
    ctx.fillText(textEn, 256, 96);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.92,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.6, 0.7, 1);
  return sprite;
}

export const ThreeMenuHangarWorld: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [currentZoneTitle, setCurrentZoneTitle] = useState('منصة المعركة الميدانية');

  // Internal Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const soldierRef = useRef<ThreeSoldierBuilder | null>(null);
  const soldierGroupRef = useRef<THREE.Group | null>(null);
  const armoryPedestalWeaponRef = useRef<THREE.Group | null>(null);
  const crateVaultGroupRef = useRef<THREE.Group | null>(null);
  const radarHoloRingRef = useRef<THREE.Mesh | null>(null);

  // Holographic 3D Label Sprites
  const zoneSpritesRef = useRef<THREE.Sprite[]>([]);

  // Smooth Bezier Camera State
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.35, 3.8));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));
  const targetFovRef = useRef<number>(38);

  // Bezier Interpolation Spline Curve
  const startCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.35, 3.8));
  const startLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));
  const startFovRef = useRef<number>(38);
  const controlCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.2, 4.5));
  const controlLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));

  const transitionStartTimeRef = useRef<number>(0);
  const transitionDurationSecRef = useRef<number>(1.2);
  const isTransitioningRef = useRef<boolean>(false);

  // User Drag Orbit interaction
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ x: 0, y: 0 });

  // Map route to 3D Hangar Camera Target Definitions
  const getCameraTargetForRoute = (pathname: string): CameraTargetDef => {
    switch (pathname) {
      case '/lobby':
        return {
          position: new THREE.Vector3(-3.8, 1.75, 3.5),
          target: new THREE.Vector3(-3.2, 1.05, -0.2),
          fov: 37,
          zoneTitleAr: 'غرفة التحكم واللوبي التكتيكي',
          zoneTitleEn: 'TACTICAL LOBBY & COMMAND CENTER',
        };
      case '/armory':
        return {
          position: new THREE.Vector3(3.8, 1.6, 3.2),
          target: new THREE.Vector3(3.2, 1.0, -0.2),
          fov: 36,
          zoneTitleAr: 'ترسانة الأسلحة والتجهيزات',
          zoneTitleEn: 'WEAPON ARSENAL & TURNTABLE VAULT',
        };
      case '/customize':
        return {
          position: new THREE.Vector3(0, 1.3, 2.95),
          target: new THREE.Vector3(0, 1.15, 0),
          fov: 35,
          zoneTitleAr: 'منصة تجهيز المحارب والنفاثة',
          zoneTitleEn: 'SOLDIER FITTING & JETPACK PEDESTAL',
        };
      case '/store':
        return {
          position: new THREE.Vector3(0, 2.1, 5.0),
          target: new THREE.Vector3(0, 1.3, -1.2),
          fov: 40,
          zoneTitleAr: 'مخبأ الإمدادات والصناديق الذهبية',
          zoneTitleEn: 'SUPPLY VAULT & LOOT CRATES',
        };
      default:
        return {
          position: new THREE.Vector3(0, 1.35, 3.8),
          target: new THREE.Vector3(0, 1.0, 0),
          fov: 38,
          zoneTitleAr: 'منصة هبوط ساحة المعركة',
          zoneTitleEn: 'BATTLE ARENA LAUNCHPAD',
        };
    }
  };

  // Initiate Cinematic Bezier Camera Curve Transition on Route Change
  useEffect(() => {
    const targetDef = getCameraTargetForRoute(location.pathname);
    setCurrentZoneTitle(targetDef.zoneTitleAr);

    // 1. Capture current camera state as Bezier Start Point
    if (cameraRef.current) {
      startCamPosRef.current.copy(cameraRef.current.position);
      startLookAtRef.current.copy(currentLookAtRef.current);
      startFovRef.current = cameraRef.current.fov;
    } else {
      startCamPosRef.current.copy(targetCamPosRef.current);
      startLookAtRef.current.copy(targetLookAtRef.current);
      startFovRef.current = targetDef.fov;
    }

    // 2. Set Destination Target Points
    targetCamPosRef.current.copy(targetDef.position);
    targetLookAtRef.current.copy(targetDef.target);
    targetFovRef.current = targetDef.fov;

    // 3. Calculate Bezier Arc Trajectory Control Point (Swoop Curve)
    const midPos = new THREE.Vector3().addVectors(startCamPosRef.current, targetCamPosRef.current).multiplyScalar(0.5);
    const dist = startCamPosRef.current.distanceTo(targetCamPosRef.current);

    midPos.y += Math.max(0.65, dist * 0.38);
    midPos.z += Math.max(0.85, dist * 0.28); // Outward arc away from center
    controlCamPosRef.current.copy(midPos);

    const midLook = new THREE.Vector3().addVectors(startLookAtRef.current, targetLookAtRef.current).multiplyScalar(0.5);
    controlLookAtRef.current.copy(midLook);

    // 4. Start Bezier Timer
    transitionStartTimeRef.current = performance.now();
    isTransitioningRef.current = true;
    orbitAngleRef.current = { x: 0, y: 0 };

    // Play pneumatic camera servo audio & light haptic
    soundManager.playSwitchWeapon();
    haptics.light();
  }, [location.pathname]);

  // Listen to soldier customization updates
  useEffect(() => {
    const handleUpdate = () => {
      const s = settingsManager.getSettings();
      if (soldierRef.current) {
        soldierRef.current.updateConfig({
          camoColor: s.equippedSkin || '#365314',
          headgear: s.equippedHeadgear || 'camo_helmet',
          bodyArmor: s.equippedArmor || 'molle_vest',
          eyewear: s.equippedEyewear || 'aviators',
          beard: s.equippedBeard || 'stubble',
          jetpackStyle: s.equippedJetpack || 'military_dual',
          weapon: s.equippedPrimaryWeapon || 'sniper',
          trailColor: s.equippedTrail || '#06b6d4',
        });
      }
    };

    window.addEventListener('soldier-customization-updated', handleUpdate);
    return () => window.removeEventListener('soldier-customization-updated', handleUpdate);
  }, []);

  // Initialize Three.js continuous world
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040805);
    scene.fog = new THREE.FogExp2(0x040805, 0.065);
    sceneRef.current = scene;

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 3.8);
    cameraRef.current = camera;

    // 3. Renderer with soft shadows & ACES tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x040805, 1.0);
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Atmospheric Lights - Realistic Stealth Military Command Tone
    const ambientLight = new THREE.AmbientLight(0x0a1610, 0.5);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xdcfce7, 0.85);
    mainKeyLight.position.set(3, 8, 5);
    scene.add(mainKeyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x06b6d4, 1.0);
    cyanRimLight.position.set(-6, 4, -4);
    scene.add(cyanRimLight);

    const amberFillLight = new THREE.DirectionalLight(0xf59e0b, 0.75);
    amberFillLight.position.set(6, 3, -3);
    scene.add(amberFillLight);

    // 5. Military Tactical Hangar Base Environment Meshes - Dark Matte Armor Steel
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060b08,
      roughness: 0.75,
      metalness: 0.3,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = 0;
    scene.add(floorMesh);

    // Floor Grid Wireframe Line Texture (Stealth Green / Muted Emerald)
    const gridHelper = new THREE.GridHelper(28, 28, 0x10b981, 0x091c10);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Back Bunker Wall with Steel Ribs - Matte Dark Carbon (Prevents washed-out glare)
    const wallGeo = new THREE.PlaneGeometry(32, 11);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x050a07,
      roughness: 0.92,
      metalness: 0.15,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 5.5, -5.5);
    scene.add(backWall);

    // Tactical Hangar Pillars
    const pillarGeo = new THREE.BoxGeometry(0.85, 10, 0.85);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x09140e, roughness: 0.8, metalness: 0.3 });
    for (const x of [-7.5, -3.8, 3.8, 7.5]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(x, 5, -5.0);
      scene.add(p);
    }

    // ==========================================
    // ZONE 1: BATTLE & CUSTOMIZE CENTRAL PLATFORM
    // ==========================================
    const soldierGroup = new THREE.Group();
    soldierGroupRef.current = soldierGroup;

    // Glowing Holographic Pedestal
    const baseDiscGeo = new THREE.CylinderGeometry(1.3, 1.45, 0.12, 32);
    const baseDiscMat = new THREE.MeshStandardMaterial({ color: 0x090e0b, metalness: 0.9, roughness: 0.2 });
    const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
    baseDisc.position.y = 0.06;
    soldierGroup.add(baseDisc);

    // Glowing Launchpad Ring
    const launchRingGeo = new THREE.TorusGeometry(1.25, 0.035, 12, 48);
    launchRingGeo.rotateX(Math.PI / 2);
    const launchRingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const launchRing = new THREE.Mesh(launchRingGeo, launchRingMat);
    launchRing.position.y = 0.13;
    soldierGroup.add(launchRing);

    // 3D Mini Militia Soldier
    const s = settingsManager.getSettings();
    const soldier = new ThreeSoldierBuilder({
      camoColor: s.equippedSkin || '#365314',
      headgear: s.equippedHeadgear || 'camo_helmet',
      bodyArmor: s.equippedArmor || 'molle_vest',
      eyewear: s.equippedEyewear || 'aviators',
      beard: s.equippedBeard || 'stubble',
      jetpackStyle: s.equippedJetpack || 'military_dual',
      weapon: s.equippedPrimaryWeapon || 'sniper',
      trailColor: s.equippedTrail || '#06b6d4',
    });
    soldierRef.current = soldier;
    soldier.root.position.set(0, 0.1, 0);
    soldier.root.visible = false; // Hide 3D soldier mannequin to preserve pure authentic 2D style
    soldierGroup.add(soldier.root);
    scene.add(soldierGroup);

    // Holographic Label 1: Central Platform
    const spriteCentral = createHoloZoneSprite('منصة الهبوط الرئيسية', 'COMMANDO BATTLE LAUNCHPAD', '#f59e0b');
    spriteCentral.position.set(0, 2.55, -0.2);
    scene.add(spriteCentral);

    // ==========================================
    // ZONE 2: LOBBY TACTICAL COMMAND CENTER (LEFT)
    // ==========================================
    const lobbyGroup = new THREE.Group();
    lobbyGroup.position.set(-3.6, 0, -0.4);

    // Holographic Command Desk
    const deskGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.7, 16);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x0b1510, metalness: 0.85, roughness: 0.3 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = 0.35;
    lobbyGroup.add(desk);

    // Holographic Radar Grid Ring
    const radarGeo = new THREE.RingGeometry(0.2, 1.0, 32);
    radarGeo.rotateX(-Math.PI / 2);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const radarRing = new THREE.Mesh(radarGeo, radarMat);
    radarRing.position.y = 0.72;
    radarHoloRingRef.current = radarRing;
    lobbyGroup.add(radarRing);

    // Floating Hologram Tactical Core
    const holoCoreGeo = new THREE.IcosahedronGeometry(0.25, 1);
    const holoCoreMat = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true });
    const holoCore = new THREE.Mesh(holoCoreGeo, holoCoreMat);
    holoCore.position.y = 1.15;
    lobbyGroup.add(holoCore);

    scene.add(lobbyGroup);

    // Holographic Label 2: Lobby Command Center
    const spriteLobby = createHoloZoneSprite('غرفة التحكم واللوبي', 'TACTICAL COMMAND CENTER', '#10b981');
    spriteLobby.position.set(-3.6, 2.45, -0.4);
    scene.add(spriteLobby);

    // ==========================================
    // ZONE 3: ARMORY WEAPON VAULT (RIGHT)
    // ==========================================
    const armoryGroup = new THREE.Group();
    armoryGroup.position.set(3.6, 0, -0.4);

    // Armory Pegboard Wall
    const rackWallGeo = new THREE.BoxGeometry(2.4, 2.2, 0.2);
    const rackWallMat = new THREE.MeshStandardMaterial({ color: 0x18241c, metalness: 0.8, roughness: 0.4 });
    const rackWall = new THREE.Mesh(rackWallGeo, rackWallMat);
    rackWall.position.set(0, 1.2, -0.8);
    armoryGroup.add(rackWall);

    // Rotating Pedestal for Active Weapon
    const armoryPedestalGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.6, 20);
    const armoryPedestalMat = new THREE.MeshStandardMaterial({ color: 0x0c1611, metalness: 0.9, roughness: 0.2 });
    const armoryPedestal = new THREE.Mesh(armoryPedestalGeo, armoryPedestalMat);
    armoryPedestal.position.set(0, 0.3, 0);
    armoryGroup.add(armoryPedestal);

    // Display Weapon on Armory Turntable
    const armoryWeaponGroup = new THREE.Group();
    const displaySniperGeo = new THREE.BoxGeometry(0.12, 0.2, 1.4);
    const displaySniperMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 });
    const displaySniper = new THREE.Mesh(displaySniperGeo, displaySniperMat);
    displaySniper.position.set(0, 0.85, 0);
    displaySniper.rotation.y = 0.4;
    armoryWeaponGroup.add(displaySniper);
    armoryPedestalWeaponRef.current = armoryWeaponGroup;
    armoryGroup.add(armoryWeaponGroup);

    scene.add(armoryGroup);

    // Holographic Label 3: Armory Vault
    const spriteArmory = createHoloZoneSprite('ترسانة الأسلحة المتقدمة', 'WEAPON ARSENAL VAULT', '#38bdf8');
    spriteArmory.position.set(3.6, 2.45, -0.4);
    scene.add(spriteArmory);

    // ==========================================
    // ZONE 4: STORE & SUPPLY VAULT (BACK ELEVATED)
    // ==========================================
    const storeVaultGroup = new THREE.Group();
    storeVaultGroup.position.set(0, 0.4, -2.5);

    // Floating Golden Legendary Crate
    const crateGeo = new THREE.BoxGeometry(0.9, 0.65, 0.65);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const goldenCrate = new THREE.Mesh(crateGeo, crateMat);
    goldenCrate.position.set(0, 1.2, 0);

    // Glowing Gem Crystal
    const gemGeo = new THREE.OctahedronGeometry(0.28, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 2.0, 0);

    storeVaultGroup.add(goldenCrate, gem);
    crateVaultGroupRef.current = storeVaultGroup;
    scene.add(storeVaultGroup);

    // Holographic Label 4: Supply Vault
    const spriteStore = createHoloZoneSprite('خزينة الإمدادات والصناديق', 'SUPPLY CRATE VAULT', '#a855f7');
    spriteStore.position.set(0, 3.1, -2.5);
    scene.add(spriteStore);

    zoneSpritesRef.current = [spriteCentral, spriteLobby, spriteArmory, spriteStore];

    // ==========================================
    // CONTINUOUS ANIMATION & CINEMATIC CAMERA LOOP
    // ==========================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();

      // 1. CINEMATIC CAMERA INTERPOLATION (BEZIER SPLINE SWOOP)
      if (isTransitioningRef.current) {
        const elapsedTransSec = (performance.now() - transitionStartTimeRef.current) / 1000;
        const rawT = Math.min(1, Math.max(0, elapsedTransSec / transitionDurationSecRef.current));

        // Smootherstep cubic curve: t^3 * (t * (t * 6 - 15) + 10)
        const smoothT = rawT * rawT * rawT * (rawT * (rawT * 6 - 15) + 10);

        // Quadratic Bezier interpolation for Position: P(t) = (1-t)^2 P0 + 2(1-t)t Pctrl + t^2 P1
        const invT = 1 - smoothT;
        const p0 = startCamPosRef.current.clone().multiplyScalar(invT * invT);
        const pCtrl = controlCamPosRef.current.clone().multiplyScalar(2 * invT * smoothT);
        const p1 = targetCamPosRef.current.clone().multiplyScalar(smoothT * smoothT);
        const currentPos = new THREE.Vector3().add(p0).add(pCtrl).add(p1);

        // Quadratic Bezier interpolation for LookAt Target
        const l0 = startLookAtRef.current.clone().multiplyScalar(invT * invT);
        const lCtrl = controlLookAtRef.current.clone().multiplyScalar(2 * invT * smoothT);
        const l1 = targetLookAtRef.current.clone().multiplyScalar(smoothT * smoothT);
        const currentLook = new THREE.Vector3().add(l0).add(lCtrl).add(l1);

        // Dynamic FOV Warp (Expands FOV slightly midway for high-speed flight feel)
        const fovWarp = Math.sin(Math.PI * rawT) * 4.2;
        const currentFov = THREE.MathUtils.lerp(startFovRef.current, targetFovRef.current, smoothT) + fovWarp;

        // Dynamic Dutch Angle Roll (Z-axis banking into the curve)
        const deltaX = targetCamPosRef.current.x - startCamPosRef.current.x;
        const rollZ = -Math.max(-0.065, Math.min(0.065, deltaX * 0.035)) * Math.sin(Math.PI * rawT);

        camera.position.copy(currentPos);
        currentLookAtRef.current.copy(currentLook);
        camera.lookAt(currentLookAtRef.current);
        camera.rotation.z += rollZ;

        camera.fov = currentFov;
        camera.updateProjectionMatrix();

        if (rawT >= 1) {
          isTransitioningRef.current = false;
        }
      } else {
        // Idle camera breathing & user drag orbit offset
        const targetPos = targetCamPosRef.current.clone();
        const targetLook = targetLookAtRef.current.clone();

        // Subtle breathing float
        targetPos.y += Math.sin(elapsed * 1.2) * 0.035;
        targetPos.x += Math.cos(elapsed * 0.8) * 0.025;

        // Apply user drag orbit offsets
        if (orbitAngleRef.current.x !== 0 || orbitAngleRef.current.y !== 0) {
          targetPos.x += orbitAngleRef.current.x * 2.0;
          targetPos.y += orbitAngleRef.current.y * 1.5;
        }

        camera.position.lerp(targetPos, 0.06);
        currentLookAtRef.current.lerp(targetLook, 0.06);
        camera.lookAt(currentLookAtRef.current);

        if (Math.abs(camera.fov - targetFovRef.current) > 0.1) {
          camera.fov = THREE.MathUtils.lerp(camera.fov, targetFovRef.current, 0.06);
          camera.updateProjectionMatrix();
        }
      }

      // 2. Animate 3D Holographic Label Sprites (Floating bob & opacity fade)
      zoneSpritesRef.current.forEach((sprite, idx) => {
        sprite.position.y += Math.sin(elapsed * 2.0 + idx) * 0.0012;
      });

      // 3. Animate Mini Militia Soldier Idle Breathing & Floating Boots
      if (soldierRef.current) {
        const soldier = soldierRef.current;
        const breath = Math.sin(elapsed * 2.5);
        soldier.torsoGroup.position.y = 1.0 + breath * 0.02;
        soldier.headGroup.position.y = 1.62 + breath * 0.025;

        // Advance dynamic clothing cloth physics
        soldier.updatePhysics(soldier.root.rotation.y, delta);

        // Hovering boot bobbing
        if (soldier.leftBootMesh && soldier.rightBootMesh) {
          soldier.leftBootMesh.position.y = 0.1 + Math.sin(elapsed * 3.0) * 0.02;
          soldier.rightBootMesh.position.y = 0.1 + Math.cos(elapsed * 3.0) * 0.02;
        }

        // Slight weapon sway
        soldier.weaponGroup.rotation.z = Math.sin(elapsed * 1.8) * 0.03;
      }

      // 4. Animate Lobby Holo Radar
      if (radarHoloRingRef.current) {
        radarHoloRingRef.current.rotation.z = elapsed * 0.8;
      }
      holoCore.rotation.x = elapsed * 0.6;
      holoCore.rotation.y = elapsed * 0.9;

      // 5. Animate Armory Turntable Weapon
      if (armoryPedestalWeaponRef.current) {
        armoryPedestalWeaponRef.current.rotation.y = elapsed * 0.8;
        armoryPedestalWeaponRef.current.position.y = Math.sin(elapsed * 2.0) * 0.04;
      }

      // 6. Animate Store Golden Crate & Floating Gem
      if (crateVaultGroupRef.current) {
        goldenCrate.rotation.y = elapsed * 0.5;
        goldenCrate.position.y = 1.2 + Math.sin(elapsed * 1.8) * 0.06;
        gem.rotation.y = -elapsed * 1.2;
        gem.rotation.x = elapsed * 0.7;
        gem.position.y = 1.95 + Math.cos(elapsed * 2.2) * 0.08;
      }

      // 7. Slowly rotate main launchpad ring
      launchRing.rotation.z = elapsed * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Touch & Pointer Drag for Scene Inspection
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = (e.clientX - prevMouseRef.current.x) * 0.003;
    const deltaY = (e.clientY - prevMouseRef.current.y) * 0.003;
    orbitAngleRef.current.x += deltaX;
    orbitAngleRef.current.y = Math.max(-0.6, Math.min(0.6, orbitAngleRef.current.y - deltaY));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const zonesList = [
    { path: '/lobby', name: 'اللوبي', icon: Users, color: 'text-emerald-400 border-emerald-500/50' },
    { path: '/armory', name: 'الترسانة', icon: Shield, color: 'text-sky-400 border-sky-500/50' },
    { path: '/customize', name: 'المحارب', icon: Zap, color: 'text-amber-400 border-amber-500/50' },
    { path: '/store', name: 'المتجر', icon: Package, color: 'text-purple-400 border-purple-500/50' },
    { path: '/', name: 'المعركة', icon: Swords, color: 'text-red-400 border-red-500/50' },
  ];

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-auto"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Cinematic HUD Controller Bar */}
      <div className="fixed top-16 left-3 z-30 flex flex-col items-start gap-2">
        <div className="flex items-center gap-1.5 bg-[#0e1611]/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-[#253928] shadow-2xl">
          {/* Toggle Cinematic View Mode */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              const nextMode = !isCinematicMode;
              setIsCinematicMode(nextMode);
              window.dispatchEvent(new CustomEvent('toggle-cinematic-3d-view', { detail: { active: nextMode } }));
            }}
            className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              isCinematicMode
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/30 animate-pulse'
                : 'text-gray-200 hover:text-white bg-[#16261a] hover:bg-[#1f3524] border border-[#2c4731]'
            }`}
            title="تبديل وضع الكاميرا السينمائية المباشر"
          >
            <Video size={14} className={isCinematicMode ? 'text-black' : 'text-amber-400'} />
            <span className="hidden sm:inline">
              {isCinematicMode ? 'إغلاق الوضع السينمائي' : 'عرض سينمائي 3D'}
            </span>
          </button>

          {/* Reset Camera Orbit */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              orbitAngleRef.current = { x: 0, y: 0 };
              if (soldierRef.current) {
                soldierRef.current.setJetpackActive(true);
                setTimeout(() => soldierRef.current?.setJetpackActive(false), 900);
              }
            }}
            className="p-1.5 text-gray-300 hover:text-amber-300 bg-[#16261a] hover:bg-[#1f3524] border border-[#2c4731] rounded-xl transition-colors cursor-pointer"
            title="إعادة ضبط زاوية الكاميرا ونفث المحرك"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Current Active 3D Zone Indicator Badge */}
        <div className="bg-[#09120c]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-md">
          <Activity size={13} className="text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{currentZoneTitle}</span>
        </div>

        {/* Quick Cinematic Zone Jump Bar (Visible in Cinematic Mode or hover) */}
        {isCinematicMode && (
          <div className="flex items-center gap-1 bg-[#09120b]/90 backdrop-blur-md p-1.5 rounded-2xl border border-amber-500/40 shadow-2xl flex-wrap max-w-xs">
            <span className="text-[10px] font-black text-amber-400 px-2 py-0.5 w-full flex items-center gap-1 border-b border-amber-500/20 mb-1">
              <Film size={12} /> الانتقال السينمائي بين المناطق:
            </span>
            {zonesList.map((z) => {
              const Icon = z.icon;
              const isActive = location.pathname === z.path;
              return (
                <button
                  key={z.path}
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.light();
                    navigate(z.path);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
                      : 'bg-[#142318] text-gray-300 hover:text-white border-[#273d2b] hover:bg-[#1b2f21]'
                  }`}
                >
                  <Icon size={12} />
                  <span>{z.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

