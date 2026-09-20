import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Play,
  Pause,
  SunMedium,
  Sparkles,
  Maximize2,
  Volume2,
  Zap,
  Target,
  Moon,
  Cpu,
  Sun,
  MapPin,
  Flame,
  Crosshair,
  Shield,
  Layers,
} from 'lucide-react';
import { WeaponItem } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';
import { settingsManager } from '../../utils/settingsManager';
import { ARMORY_ENVIRONMENTS, ArmoryEnvironmentId, WEAPON_SKINS, WeaponSkin } from './WeaponSkinCarousel';
import { getWeaponRarityTier, WEAPON_RARITY_THEMES, WeaponGlowBackdrop } from '../../utils/weaponRarityThemes';

interface ThreeDWeaponViewerProps {
  weapon: WeaponItem;
  skinId?: string;
  onSelectSkin?: (skinId: string) => void;
}

export const ThreeDWeaponViewer: React.FC<ThreeDWeaponViewerProps> = ({
  weapon,
  skinId: propSkinId,
  onSelectSkin,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const settings = settingsManager.getSettings();
  const rarityTier = getWeaponRarityTier(weapon);
  const rarityTheme = WEAPON_RARITY_THEMES[rarityTier];

  const [activeSkinId, setActiveSkinId] = useState<string>(
    () => propSkinId || settings.weaponSkins?.[weapon.id] || 'standard'
  );
  const [environmentId, setEnvironmentId] = useState<ArmoryEnvironmentId>(
    () => (settings.armoryEnvironment as ArmoryEnvironmentId) || 'training_range'
  );
  const [lightingMode, setLightingMode] = useState<'pbr' | 'toon'>(
    () => settings.armoryLightingMode || 'pbr'
  );
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isFiring, setIsFiring] = useState<boolean>(false);

  // Sync skin when prop or weapon changes
  useEffect(() => {
    const currentSkin = propSkinId || settingsManager.getSettings().weaponSkins?.[weapon.id] || 'standard';
    setActiveSkinId(currentSkin);
  }, [weapon.id, propSkinId]);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const weaponGroupRef = useRef<THREE.Group | null>(null);
  const pedestalGroupRef = useRef<THREE.Group | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dirLight1: THREE.DirectionalLight;
    dirLight2: THREE.DirectionalLight;
    rimLight: THREE.PointLight;
    spotLight: THREE.SpotLight;
    muzzleLight: THREE.PointLight;
  } | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ y: -0.3, x: 0.15 });
  const currentRotationRef = useRef({ y: -0.3, x: 0.15 });
  const zoomLevelRef = useRef(1);
  const recoilRef = useRef(0);

  // Get current environment metadata
  const currentEnv =
    ARMORY_ENVIRONMENTS.find((e) => e.id === environmentId) || ARMORY_ENVIRONMENTS[0];

  // Skin metadata
  const skinsForThisWeapon: WeaponSkin[] = WEAPON_SKINS[weapon.id] || [
    {
      id: 'standard',
      name: 'الطلاء الميداني التكتيكي',
      nameEn: 'Mil-Spec Standard',
      rarity: 'common',
      material3D: 'سبائك ألمنيوم عسكرية',
      colorGradient: 'from-neutral-800 to-neutral-950',
      accentColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      perk: 'ثبات ميداني',
      description: 'الطلاء الميداني التكتيكي القياسي',
    },
  ];
  const currentSkinObj =
    skinsForThisWeapon.find((s) => s.id === activeSkinId) || skinsForThisWeapon[0];

  // ==========================================
  // PROCEDURAL 3D WEAPON MODEL GENERATOR
  // ==========================================
  const buildWeaponMesh = useCallback(
    (weaponId: string, skin: typeof currentSkinObj, mode: 'pbr' | 'toon') => {
      const root = new THREE.Group();
      root.name = 'WeaponRoot';

      // Material Helper
      const isPBR = mode === 'pbr';
      const isGold = skin?.id?.includes('gold') || weaponId === 'desert_eagle_gold';
      const isCyber = skin?.id?.includes('neon') || skin?.id?.includes('cyber');
      const isMagma = skin?.id?.includes('flame') || skin?.id?.includes('magma');
      const isStealth = skin?.id?.includes('obsidian') || skin?.id?.includes('stealth');

      const primaryColor = isGold
        ? 0xfacc15
        : isCyber
        ? 0x06b6d4
        : isMagma
        ? 0xef4444
        : isStealth
        ? 0x18181b
        : weaponId === 'sniper' || weaponId === 'rocket'
        ? 0x2e4a32 // military olive green
        : 0x334155; // tactical gunmetal

      const secondaryColor = isGold
        ? 0xca8a04
        : isCyber
        ? 0x3b82f6
        : isMagma
        ? 0xf97316
        : 0x1e293b;

      const accentColor = new THREE.Color(skin?.accentColor || '#10b981');

      // Create PBR materials
      const mainMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        metalness: isGold ? 0.95 : isPBR ? 0.75 : 0.4,
        roughness: isGold ? 0.15 : isPBR ? 0.35 : 0.6,
      });

      const metalDarkMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: isPBR ? 0.85 : 0.5,
        roughness: isPBR ? 0.3 : 0.5,
      });

      const steelMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2,
      });

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.95,
        roughness: 0.18,
      });

      const glowMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: isCyber || isMagma ? 0.85 : 0.35,
        metalness: 0.5,
        roughness: 0.2,
      });

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.75,
      });

      const woodMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        metalness: 0.05,
        roughness: 0.85,
      });

      // ---------------------------------------------
      // 1. SNIPER RIFLE .50 BMG (3D Precision Model)
      // ---------------------------------------------
      if (weaponId === 'sniper') {
        // Main Chassis
        const chassisGeo = new THREE.BoxGeometry(2.4, 0.45, 0.35);
        const chassis = new THREE.Mesh(chassisGeo, mainMat);
        root.add(chassis);

        // Long Fluted Precision Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.09, 0.11, 2.6, 16);
        barrelGeo.rotateZ(-Math.PI / 2);
        const barrel = new THREE.Mesh(barrelGeo, metalDarkMat);
        barrel.position.set(2.2, 0.05, 0);
        root.add(barrel);

        // Massive Multislot Muzzle Brake
        const brakeGeo = new THREE.BoxGeometry(0.45, 0.28, 0.28);
        const brake = new THREE.Mesh(brakeGeo, steelMat);
        brake.position.set(3.5, 0.05, 0);
        root.add(brake);

        // High-Magnification Scope Tube
        const scopeGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.6, 16);
        scopeGeo.rotateZ(-Math.PI / 2);
        const scope = new THREE.Mesh(scopeGeo, metalDarkMat);
        scope.position.set(0.2, 0.55, 0);
        root.add(scope);

        // Scope Objective Lens (Glass)
        const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
        lensGeo.rotateZ(-Math.PI / 2);
        const lens = new THREE.Mesh(lensGeo, glassMat);
        lens.position.set(1.0, 0.55, 0);
        root.add(lens);

        // Scope Rings Mount
        const ring1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.32), steelMat);
        ring1.position.set(-0.3, 0.35, 0);
        const ring2 = ring1.clone();
        ring2.position.set(0.7, 0.35, 0);
        root.add(ring1, ring2);

        // Tactical Skeleton Stock with Cheek Pad
        const stockBeam = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.2), mainMat);
        stockBeam.position.set(-1.8, -0.05, 0);
        const buttPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.8, 0.25), metalDarkMat);
        buttPlate.position.set(-2.5, -0.2, 0);
        const cheekRest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.24), metalDarkMat);
        cheekRest.position.set(-1.7, 0.15, 0);
        root.add(stockBeam, buttPlate, cheekRest);

        // Magazine Box (.50 BMG)
        const magGeo = new THREE.BoxGeometry(0.55, 0.7, 0.24);
        const mag = new THREE.Mesh(magGeo, metalDarkMat);
        mag.position.set(0.1, -0.45, 0);
        mag.rotation.z = 0.15;
        root.add(mag);

        // Pistol Grip
        const gripGeo = new THREE.BoxGeometry(0.3, 0.65, 0.22);
        const grip = new THREE.Mesh(gripGeo, metalDarkMat);
        grip.position.set(-0.6, -0.45, 0);
        grip.rotation.z = -0.3;
        root.add(grip);

        // Foldable Bipod Legs
        const bipodBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), steelMat);
        bipodBase.position.set(1.8, -0.15, 0);
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
        const legL = new THREE.Mesh(legGeo, steelMat);
        legL.position.set(1.8, -0.55, 0.25);
        legL.rotation.x = 0.3;
        const legR = new THREE.Mesh(legGeo, steelMat);
        legR.position.set(1.8, -0.55, -0.25);
        legR.rotation.x = -0.3;
        root.add(bipodBase, legL, legR);

        // Glowing Skin Accent Strip
        const strip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.37), glowMat);
        strip.position.set(0, 0.18, 0);
        root.add(strip);
      }
      // ---------------------------------------------
      // 2. ROCKET LAUNCHER RPG-7 (3D Explosive Model)
      // ---------------------------------------------
      else if (weaponId === 'rocket') {
        // Main Olive Steel Tube
        const tubeGeo = new THREE.CylinderGeometry(0.28, 0.28, 3.4, 20);
        tubeGeo.rotateZ(-Math.PI / 2);
        const tube = new THREE.Mesh(tubeGeo, mainMat);
        root.add(tube);

        // Wooden Heat Shield Wrap
        const shieldGeo = new THREE.CylinderGeometry(0.34, 0.34, 1.4, 20);
        shieldGeo.rotateZ(-Math.PI / 2);
        const shield = new THREE.Mesh(shieldGeo, woodMat);
        shield.position.set(-0.2, 0, 0);
        root.add(shield);

        // Venturi Exhaust Bell (Rear)
        const exhaustGeo = new THREE.ConeGeometry(0.48, 0.7, 20);
        exhaustGeo.rotateZ(-Math.PI / 2);
        const exhaust = new THREE.Mesh(exhaustGeo, metalDarkMat);
        exhaust.position.set(-1.95, 0, 0);
        root.add(exhaust);

        // Massive Rocket Warhead Cone (PG-7V)
        const warheadCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.55, 1.1, 20),
          isGold ? goldMat : new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.3 })
        );
        warheadCone.rotateZ(-Math.PI / 2);
        warheadCone.position.set(2.4, 0, 0);

        // Rocket Warhead Body Base
        const warheadBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.52, 0.32, 0.65, 20),
          new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5, roughness: 0.4 })
        );
        warheadBase.rotateZ(-Math.PI / 2);
        warheadBase.position.set(1.65, 0, 0);
        root.add(warheadCone, warheadBase);

        // Dual Pistol Grips
        const gripF = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.18), metalDarkMat);
        gripF.position.set(0.6, -0.55, 0);
        gripF.rotation.z = -0.2;
        const gripR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.18), metalDarkMat);
        gripR.position.set(-0.5, -0.55, 0);
        gripR.rotation.z = -0.2;
        root.add(gripF, gripR);

        // Optical PGO-7 Sight
        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.3), metalDarkMat);
        sight.position.set(0.2, 0.42, 0.2);
        root.add(sight);

        // Glowing Strip
        const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 12, 24), glowMat);
        glowRing.rotation.y = Math.PI / 2;
        glowRing.position.set(1.2, 0, 0);
        root.add(glowRing);
      }
      // ---------------------------------------------
      // 3. RIOT SHIELD (3D Ballistic Barrier)
      // ---------------------------------------------
      else if (weaponId === 'riot_shield') {
        // Curved Main Ballistic Shield Plate
        const shieldShape = new THREE.BoxGeometry(2.4, 3.2, 0.18);
        const shieldMesh = new THREE.Mesh(shieldShape, mainMat);
        root.add(shieldMesh);

        // Reinforced Outer Protective Bevel Rim
        const rim = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 3.3, 0.1),
          steelMat
        );
        rim.position.z = -0.04;
        root.add(rim);

        // Polycarbonate Bulletproof Transparent Viewport
        const viewPortFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 0.22), metalDarkMat);
        viewPortFrame.position.set(0, 0.75, 0.02);
        const glassWindow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.1), glassMat);
        glassWindow.position.set(0, 0.75, 0.06);
        root.add(viewPortFrame, glassWindow);

        // Heavy Tactical Stencil Chevron Stripes
        const chevron = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.12, 0.06),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
        );
        chevron.position.set(0, -0.2, 0.1);
        const chevron2 = chevron.clone();
        chevron2.position.set(0, -0.5, 0.1);
        root.add(chevron, chevron2);

        // Rear Ergonomic Holding Handle & Arm Strap
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 16), metalDarkMat);
        handle.position.set(-0.4, 0.1, -0.3);
        const armStrap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.1), metalDarkMat);
        armStrap.position.set(0.4, 0.1, -0.25);
        root.add(handle, armStrap);

        // Glowing Shield Core Accents
        const glowCore = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.05), glowMat);
        glowCore.position.set(0, 0.2, 0.1);
        root.add(glowCore);
      }
      // ---------------------------------------------
      // 4. DUAL TACTICAL UZIS (3D Twin SMG)
      // ---------------------------------------------
      else if (weaponId === 'dual_uzi') {
        const createSingleUzi = (isRight: boolean) => {
          const uzi = new THREE.Group();
          const zOffset = isRight ? 0.35 : -0.35;
          uzi.position.set(isRight ? 0.15 : -0.15, 0, zOffset);

          // Receiver Body
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.3), mainMat);
          uzi.add(body);

          // Top Cover Rib
          const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.26), steelMat);
          top.position.set(0, 0.3, 0);
          uzi.add(top);

          // Barrel & Threaded Muzzle
          const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 0.7, 12),
            metalDarkMat
          );
          barrel.rotateZ(-Math.PI / 2);
          barrel.position.set(0.9, 0.05, 0);
          uzi.add(barrel);

          // Folding Wire Stock
          const stock = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.12), steelMat);
          stock.position.set(-0.8, 0.15, 0);
          uzi.add(stock);

          // Tactical Pistol Grip & Extended 32-Round Mag
          const grip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.22), metalDarkMat);
          grip.position.set(-0.15, -0.45, 0);
          const mag = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.18), steelMat);
          mag.position.set(-0.15, -0.75, 0);
          uzi.add(grip, mag);

          // Glowing skin accent
          const uziGlow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.32), glowMat);
          uziGlow.position.set(0, -0.05, 0);
          uzi.add(uziGlow);

          return uzi;
        };

        root.add(createSingleUzi(false));
        root.add(createSingleUzi(true));
      }
      // ---------------------------------------------
      // 5. DESERT EAGLE GOLDEN EDITION (.50 AE)
      // ---------------------------------------------
      else if (weaponId === 'desert_eagle_gold') {
        // Massive 24K Gold Slide
        const slideGeo = new THREE.BoxGeometry(1.8, 0.55, 0.35);
        const slide = new THREE.Mesh(slideGeo, goldMat);
        slide.position.set(0.3, 0.25, 0);
        root.add(slide);

        // Slide Serrations & Bevel Cuts
        const cutGeo = new THREE.BoxGeometry(0.1, 0.35, 0.37);
        for (let i = 0; i < 4; i++) {
          const cut = new THREE.Mesh(cutGeo, new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.3 }));
          cut.position.set(-0.1 - i * 0.14, 0.25, 0);
          root.add(cut);
        }

        // Barrel with Top Weaver Rail
        const barrelGeo = new THREE.BoxGeometry(0.8, 0.35, 0.32);
        const barrel = new THREE.Mesh(barrelGeo, goldMat);
        barrel.position.set(1.25, 0.25, 0);
        root.add(barrel);

        // Lower Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.3), goldMat);
        frame.position.set(0.1, -0.05, 0);
        root.add(frame);

        // Ergonomic Textured Hogue-Style Grip
        const gripGeo = new THREE.BoxGeometry(0.45, 0.9, 0.32);
        const grip = new THREE.Mesh(gripGeo, metalDarkMat);
        grip.position.set(-0.25, -0.5, 0);
        grip.rotation.z = -0.28;
        root.add(grip);

        // Gold Inlaid Eagle Medallion
        const medalGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.34, 16);
        medalGeo.rotateX(Math.PI / 2);
        const medal = new THREE.Mesh(medalGeo, goldMat);
        medal.position.set(-0.25, -0.5, 0);
        root.add(medal);

        // Trigger Guard & Golden Trigger
        const guard = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 16), goldMat);
        guard.position.set(0.15, -0.2, 0);
        root.add(guard);

        // Glowing Trim
        const deGlow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.36), glowMat);
        deGlow.position.set(0.5, 0.45, 0);
        root.add(deGlow);
      }
      // ---------------------------------------------
      // 6. COMBAT SHOTGUN (12 Gauge Pump-Action)
      // ---------------------------------------------
      else if (weaponId === 'shotgun') {
        // Blued Steel Receiver
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 0.35), metalDarkMat);
        root.add(receiver);

        // Dual Over-Under Barrels (12 Gauge)
        const barrel1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, 2.3, 16),
          steelMat
        );
        barrel1.rotateZ(-Math.PI / 2);
        barrel1.position.set(1.8, 0.12, 0);

        const magTube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 2.0, 16),
          metalDarkMat
        );
        magTube.rotateZ(-Math.PI / 2);
        magTube.position.set(1.65, -0.15, 0);
        root.add(barrel1, magTube);

        // Ribbed Pump-Action Forend Slide
        const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.9, 16), metalDarkMat);
        pump.rotateZ(-Math.PI / 2);
        pump.position.set(1.4, -0.15, 0);
        root.add(pump);

        // Hardwood Combat Stock
        const stock = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.28), woodMat);
        stock.position.set(-1.4, -0.2, 0);
        stock.rotation.z = -0.15;
        root.add(stock);

        // Brass Front Bead Sight
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), goldMat);
        bead.position.set(2.9, 0.26, 0);
        root.add(bead);

        // Glowing shell rack on side
        const shellRack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.42), glowMat);
        shellRack.position.set(0.1, 0.1, 0);
        root.add(shellRack);
      }
      // ---------------------------------------------
      // 7. HEAVY SQUAD SAW GUN (Belt-Fed Machine Gun)
      // ---------------------------------------------
      else if (weaponId === 'saw_gun') {
        // Heavy Machined Receiver
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 0.45), mainMat);
        root.add(receiver);

        // Perforated Barrel Cooling Shroud
        const shroud = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 2.2, 16),
          metalDarkMat
        );
        shroud.rotateZ(-Math.PI / 2);
        shroud.position.set(1.8, 0.1, 0);
        root.add(shroud);

        // High-Capacity 100-Round Drum / Box Magazine
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.55, 20),
          metalDarkMat
        );
        drum.position.set(-0.1, -0.65, 0);
        root.add(drum);

        // Top Carry Handle
        const handleBeam = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.12), steelMat);
        handleBeam.position.set(0.4, 0.65, 0);
        const handleLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.1), steelMat);
        handleLeg1.position.set(0.1, 0.5, 0);
        const handleLeg2 = handleLeg1.clone();
        handleLeg2.position.set(0.7, 0.5, 0);
        root.add(handleBeam, handleLeg1, handleLeg2);

        // Heavy Stock
        const stock = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.3), metalDarkMat);
        stock.position.set(-1.4, -0.05, 0);
        root.add(stock);

        // Rotating Blade or Muzzle Shroud
        const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16), steelMat);
        blade.rotateZ(-Math.PI / 2);
        blade.position.set(3.0, 0.1, 0);
        root.add(blade);

        // Glowing Ammo Belt Feeder
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.6), glowMat);
        belt.position.set(-0.4, -0.2, 0.25);
        root.add(belt);
      }
      // ---------------------------------------------
      // 8. M4 TACTICAL ASSAULT RIFLE
      // ---------------------------------------------
      else {
        // Upper & Lower Mil-Spec Receiver
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.32), mainMat);
        root.add(receiver);

        // Quad-Rail Picatinny Handguard
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.38), metalDarkMat);
        rail.position.set(1.2, 0.05, 0);
        root.add(rail);

        // Match-Grade Steel Barrel
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16), steelMat);
        barrel.rotateZ(-Math.PI / 2);
        barrel.position.set(2.2, 0.05, 0);
        root.add(barrel);

        // A2 Birdcage Flash Hider
        const hider = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12), metalDarkMat);
        hider.rotateZ(-Math.PI / 2);
        hider.position.set(3.1, 0.05, 0);
        root.add(hider);

        // Holographic Red Dot Reflex Sight
        const holoSight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.28), metalDarkMat);
        holoSight.position.set(0.1, 0.45, 0);
        const holoReticle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), glowMat);
        holoReticle.position.set(0.1, 0.45, 0);
        root.add(holoSight, holoReticle);

        // Curved 30-Round Magazine
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.2), metalDarkMat);
        mag.position.set(0.25, -0.6, 0);
        mag.rotation.z = 0.2;
        root.add(mag);

        // Ergonomic Pistol Grip
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.65, 0.22), metalDarkMat);
        grip.position.set(-0.45, -0.45, 0);
        grip.rotation.z = -0.3;
        root.add(grip);

        // 6-Position Telescoping Crane Stock
        const bufferTube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 1.0, 16),
          steelMat
        );
        bufferTube.rotateZ(-Math.PI / 2);
        bufferTube.position.set(-1.1, 0.05, 0);
        const stockBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.28), metalDarkMat);
        stockBody.position.set(-1.3, -0.05, 0);
        root.add(bufferTube, stockBody);

        // Glowing Tactical Rail Accents
        const laserRail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.4), glowMat);
        laserRail.position.set(1.2, 0.28, 0);
        root.add(laserRail);
      }

      // Center and scale weapon root
      root.scale.set(0.9, 0.9, 0.9);
      root.castShadow = true;
      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      return root;
    },
    []
  );

  // ==========================================
  // SETUP THREE.JS SCENE, LIGHTS & CANVAS
  // ==========================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 5.5);
    cameraRef.current = camera;

    // 3. Renderer with shadows and antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(4, 5, 4);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight2.position.set(-4, -2, -3);

    const rimLight = new THREE.PointLight(0x10b981, 2.5, 8);
    rimLight.position.set(-2, 2, -3);

    const spotLight = new THREE.SpotLight(0xffffff, 1.8);
    spotLight.position.set(0, 5, 2);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;

    const muzzleLight = new THREE.PointLight(0xffaa00, 0, 6);
    muzzleLight.position.set(3, 0.2, 0);

    scene.add(ambient, dirLight1, dirLight2, rimLight, spotLight, muzzleLight);
    lightsRef.current = { ambient, dirLight1, dirLight2, rimLight, spotLight, muzzleLight };

    // 5. 3D Tactical Pedestal / Turntable Platform
    const pedestalGroup = new THREE.Group();
    pedestalGroupRef.current = pedestalGroup;

    // Outer Hex/Circle Metallic Base
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.2;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Glowing Neon Ring on Pedestal
    const ringGeo = new THREE.TorusGeometry(2.35, 0.04, 16, 48);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = -1.1;
    pedestalGroup.add(ringMesh);

    // Grid Floor
    const grid = new THREE.GridHelper(8, 16, 0x10b981, 0x1e293b);
    grid.position.y = -1.21;
    pedestalGroup.add(grid);

    scene.add(pedestalGroup);

    // 6. Weapon Holder Group
    const weaponGroup = new THREE.Group();
    weaponGroup.position.y = 0.1;
    weaponGroupRef.current = weaponGroup;
    scene.add(weaponGroup);

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Auto rotation logic
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.7;
      }

      // Smooth dampening rotation
      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;

      if (weaponGroupRef.current) {
        weaponGroupRef.current.rotation.y = currentRotationRef.current.y;
        weaponGroupRef.current.rotation.x = currentRotationRef.current.x;

        // Floating hover motion
        const floatOffset = Math.sin(clock.getElapsedTime() * 1.8) * 0.05;
        weaponGroupRef.current.position.y = 0.1 + floatOffset;

        // Apply recoil kickback
        if (recoilRef.current > 0) {
          weaponGroupRef.current.position.x = -recoilRef.current * 0.2;
          weaponGroupRef.current.rotation.z = recoilRef.current * 0.1;
          recoilRef.current = Math.max(0, recoilRef.current - delta * 4);
        } else {
          weaponGroupRef.current.position.x = 0;
          weaponGroupRef.current.rotation.z = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Weapon Mesh when weapon, skin, or lightingMode changes
  useEffect(() => {
    if (!weaponGroupRef.current) return;

    // Clear old weapon
    while (weaponGroupRef.current.children.length > 0) {
      const obj = weaponGroupRef.current.children[0];
      weaponGroupRef.current.remove(obj);
    }

    // Build new weapon mesh
    const newMesh = buildWeaponMesh(weapon.id, currentSkinObj, lightingMode);
    weaponGroupRef.current.add(newMesh);
  }, [weapon.id, currentSkinObj, lightingMode, buildWeaponMesh]);

  // Update Environment Lighting & Colors
  useEffect(() => {
    if (!lightsRef.current || !pedestalGroupRef.current) return;

    const { ambient, dirLight1, rimLight, spotLight } = lightsRef.current;
    const accentColor = new THREE.Color(currentEnv.accentColor);

    // Tone lights by environment
    if (environmentId === 'training_range') {
      ambient.color.setHex(0xffffff);
      ambient.intensity = 0.75;
      dirLight1.color.setHex(0xffffff);
      rimLight.color.setHex(0x10b981);
      spotLight.color.setHex(0xffffff);
    } else if (environmentId === 'night_ops') {
      ambient.color.setHex(0x1e3a8a);
      ambient.intensity = 0.55;
      dirLight1.color.setHex(0x60a5fa);
      rimLight.color.setHex(0x3b82f6);
      spotLight.color.setHex(0x93c5fd);
    } else if (environmentId === 'cyber_tech') {
      ambient.color.setHex(0x083344);
      ambient.intensity = 0.65;
      dirLight1.color.setHex(0x06b6d4);
      rimLight.color.setHex(0xa855f7);
      spotLight.color.setHex(0x22d3ee);
    } else if (environmentId === 'desert_outpost') {
      ambient.color.setHex(0x78350f);
      ambient.intensity = 0.8;
      dirLight1.color.setHex(0xfbbf24);
      rimLight.color.setHex(0xf59e0b);
      spotLight.color.setHex(0xfef08a);
    }

    // Update Pedestal Ring Color
    const ringMesh = pedestalGroupRef.current.children[1] as THREE.Mesh;
    if (ringMesh && (ringMesh.material as THREE.MeshBasicMaterial)) {
      (ringMesh.material as THREE.MeshBasicMaterial).color.copy(accentColor);
    }
  }, [environmentId, currentEnv]);

  // ==========================================
  // INTERACTIVE TOUCH & MOUSE ORBIT CONTROLS
  // ==========================================
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    targetRotationRef.current.y += deltaX * 0.01;
    targetRotationRef.current.x = Math.max(
      -0.6,
      Math.min(0.6, targetRotationRef.current.x + deltaY * 0.008)
    );

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Reset Angle
  const handleResetAngle = () => {
    soundManager.playButtonClick();
    haptics.light();
    targetRotationRef.current = { y: -0.3, x: 0.15 };
  };

  // Toggle Auto Spin
  const handleToggleAutoSpin = () => {
    soundManager.playButtonClick();
    haptics.light();
    setAutoRotate(!autoRotate);
  };

  // Toggle Lighting Mode
  const handleToggleLightingMode = (mode: 'pbr' | 'toon') => {
    soundManager.playButtonClick();
    haptics.light();
    setLightingMode(mode);
    settingsManager.updateSettings({ armoryLightingMode: mode });
  };

  // Change Environment
  const handleChangeEnvironment = (envId: ArmoryEnvironmentId) => {
    soundManager.playButtonClick();
    haptics.light();
    setEnvironmentId(envId);
    settingsManager.updateSettings({ armoryEnvironment: envId });
  };

  // 3D Test-Fire Action
  const handleTestFire = () => {
    if (isFiring) return;
    setIsFiring(true);
    recoilRef.current = 1.0;

    // Play sound based on weapon
    switch (weapon.id) {
      case 'sniper':
        soundManager.playSniper();
        break;
      case 'rocket':
        soundManager.playRocketLaunch();
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
      case 'riot_shield':
        soundManager.playShieldDeflect();
        break;
      default:
        soundManager.playRifle();
        break;
    }
    haptics.heavy();

    // Flash muzzle light
    if (lightsRef.current) {
      lightsRef.current.muzzleLight.intensity = 3.5;
      setTimeout(() => {
        if (lightsRef.current) lightsRef.current.muzzleLight.intensity = 0;
      }, 90);
    }

    setTimeout(() => {
      setIsFiring(false);
    }, 280);
  };

  return (
    <div
      className="relative w-full rounded-2xl bg-gradient-to-b from-[#0a140d] via-[#060a08] to-[#030604] border-2 overflow-hidden shadow-2xl flex flex-col transition-colors duration-700"
      style={{
        borderColor: `${rarityTheme.accentHex}88`,
        boxShadow: `0 0 35px ${rarityTheme.accentHex}25`,
      }}
    >
      {/* TOP HEADER CONTROLS */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3 bg-black/40 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors duration-500"
            style={{
              backgroundColor: `${rarityTheme.accentHex}22`,
              borderColor: `${rarityTheme.accentHex}66`,
              color: rarityTheme.accentHex,
            }}
          >
            <Layers size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                استوديو السلاح 3D (GUNSMITH PODIUM)
              </span>
              <span
                className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded border transition-colors duration-500"
                style={{
                  backgroundColor: `${rarityTheme.accentHex}22`,
                  borderColor: `${rarityTheme.accentHex}77`,
                  color: rarityTheme.accentHex,
                }}
              >
                {rarityTheme.arabicLabel} ★★★
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block">
              اسحب للتدوير 360° • توهج ندرة ديناميكي متزامن
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Lighting Mode */}
          <div className="flex items-center bg-[#050b07] p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => handleToggleLightingMode('pbr')}
              className={`px-2 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                lightingMode === 'pbr'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="إضاءة واقعية PBR"
            >
              <SunMedium size={12} className="inline mr-1" />
              PBR
            </button>
            <button
              onClick={() => handleToggleLightingMode('toon')}
              className={`px-2 py-1 rounded text-[11px] font-black transition-all cursor-pointer ${
                lightingMode === 'toon'
                  ? 'bg-cyan-400 text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="إضاءة كلاسيكية Toon"
            >
              <Sparkles size={12} className="inline mr-1" />
              Toon
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={handleToggleAutoSpin}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              autoRotate
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-neutral-900 text-gray-400 border-neutral-700'
            }`}
            title="تشغيل/إيقاف الدوران التلقائي"
          >
            {autoRotate ? <Pause size={11} /> : <Play size={11} />}
            <span>360°</span>
          </button>

          {/* Reset Angle */}
          <button
            onClick={handleResetAngle}
            className="p-1.5 rounded-lg bg-neutral-900 text-gray-300 hover:text-white border border-neutral-700 cursor-pointer"
            title="إعادة ضبط الزاوية"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ENVIRONMENT SELECTION BAR */}
      <div className="relative z-10 px-3 py-1.5 bg-[#050d08]/80 border-b border-neutral-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] font-bold text-gray-400 shrink-0 flex items-center gap-1">
          <MapPin size={12} className="text-amber-400" />
          <span>البيئة:</span>
        </span>
        <div className="flex items-center gap-1">
          {ARMORY_ENVIRONMENTS.map((env) => {
            const Icon = env.icon;
            const isSelected = env.id === environmentId;
            return (
              <button
                key={env.id}
                onClick={() => handleChangeEnvironment(env.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? `${env.badgeBg} ${env.badgeBorder} ${env.badgeText} border shadow`
                    : 'text-gray-400 hover:text-white bg-black/30'
                }`}
              >
                <Icon size={11} />
                <span>{env.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D WEBGL STAGE CANVAS */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[280px] sm:h-[340px] cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden flex items-center justify-center"
      >
        {/* Optical Weapon Rarity Glow Halo Behind 3D Model */}
        <WeaponGlowBackdrop tier={rarityTier} size="hero" intensity="high" />

        {/* Dynamic Studio Ambient Glow Behind Canvas */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${currentEnv.accentColor} 0%, transparent 70%)`,
          }}
        />

        {/* Real-time Reticle Crosshair Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-56 h-56 rounded-full border border-white flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border border-dashed border-white" />
          </div>
        </div>

        {/* 3D HUD Indicators in Corners */}
        <div className="absolute top-2 right-3 pointer-events-none text-right">
          <span className="text-[10px] font-mono text-emerald-400 font-bold block">
            {weapon.nameEn}
          </span>
          <span className="text-[9px] font-mono text-gray-500">
            PBR SHADER • ROTATION 360°
          </span>
        </div>

        <div className="absolute bottom-2 left-3 pointer-events-none">
          <span className="text-[10px] font-mono text-amber-400 font-bold block">
            {currentSkinObj.name}
          </span>
          <span className="text-[9px] font-mono text-gray-500">
            {currentSkinObj.description}
          </span>
        </div>

        {/* Interactive 3D Recoil / Test-Fire Trigger Button */}
        <div className="absolute bottom-3 right-3 z-30">
          <button
            onClick={handleTestFire}
            disabled={isFiring}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-black text-xs shadow-lg shadow-red-600/40 hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5 border border-red-400/60 transition-transform"
          >
            <Zap size={14} className={isFiring ? 'animate-bounce text-yellow-300' : ''} />
            <span>{isFiring ? '💥 إطلاق!' : 'تجربة الإطلاق (3D FIRE)'}</span>
          </button>
        </div>
      </div>

      {/* FOOTER SKIN SELECTOR STRIP */}
      {skinsForThisWeapon.length > 1 && (
        <div className="relative z-10 p-2.5 bg-black/60 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 shrink-0">المظاهر:</span>
          {skinsForThisWeapon.map((skin) => {
            const isSelected = skin.id === activeSkinId;
            return (
              <button
                key={skin.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  haptics.light();
                  setActiveSkinId(skin.id);
                  if (onSelectSkin) onSelectSkin(skin.id);
                  settingsManager.updateSettings({
                    weaponSkins: {
                      ...settingsManager.getSettings().weaponSkins,
                      [weapon.id]: skin.id,
                    },
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: skin.accentColor }}
                />
                <span>{skin.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
