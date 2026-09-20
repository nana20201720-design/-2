import * as THREE from 'three';
import { WeaponType } from '../types';
import { ClothingPhysicsSystem } from './clothingPhysics';
import { lodAndTextureOptimizer } from '../utils/lodAndTextureOptimizer';

export interface ThreeSoldierConfig {
  camoColor?: string;
  headgear?: string;
  bodyArmor?: string;
  eyewear?: string;
  beard?: string;
  jetpackStyle?: string;
  skinTone?: string;
  weapon?: WeaponType | 'fists' | string;
  trailColor?: string;
  isJetpacking?: boolean;
  aimAngle?: number;
  capeStyle?: 'none' | 'tactical_cape' | 'commando_scarf' | 'full_set';
  enableClothingPhysics?: boolean;
  gltfModelUrl?: string;
}

/**
 * High-fidelity 3D Mini Militia (Doodle Army) stylized soldier builder.
 * Incorporates authentic proportions, round doodle head, expressive tactical eyebrows,
 * aviator sunglasses, military headgear, tactical vests, dual jetpacks with 3D thruster flames,
 * floating combat boots, detailed stylized weapons, and dynamic cloth physics for clothing & accessories.
 */
export class ThreeSoldierBuilder {
  public root: THREE.Group;
  public headGroup: THREE.Group;
  public torsoGroup: THREE.Group;
  public rightArmGroup: THREE.Group;
  public leftArmGroup: THREE.Group;
  public weaponGroup: THREE.Group;
  public jetpackGroup: THREE.Group;
  public leftFlameMesh: THREE.Mesh;
  public rightFlameMesh: THREE.Mesh;
  public rightThrusterLight: THREE.PointLight;
  public leftThrusterLight: THREE.PointLight;
  public muzzleFlashLight: THREE.PointLight;
  public muzzleMesh: THREE.Mesh;
  public jetpackParticles: THREE.Points;
  public leftBootMesh: THREE.Mesh | null = null;
  public rightBootMesh: THREE.Mesh | null = null;
  public clothingPhysics: ClothingPhysicsSystem;
  public gltfModelGroup: THREE.Group | null = null;
  public isGLTFLoaded = false;
  public isGLTFLoadingFailed = false;
  public fallbackSprite: THREE.Sprite | null = null;
  public gltfMixer: THREE.AnimationMixer | null = null;
  public gltfActions: Record<string, THREE.AnimationAction> = {};
  public healthSegments: any[] = [];
  public ammoSegments: any[] = [];

  // 3D Holographic HUD Group and Segments
  public holoHUDGroup!: THREE.Group;
  private healthInstancedMesh: THREE.InstancedMesh | null = null;
  private ammoInstancedMesh: THREE.InstancedMesh | null = null;
  private hudCanvas: HTMLCanvasElement | null = null;
  private hudCtx: CanvasRenderingContext2D | null = null;
  private hudTexture: THREE.CanvasTexture | null = null;
  private hudTextMesh: THREE.Mesh | null = null;

  // 3D Motion & State Blending Animation Controller
  public currentAnimState: string = 'idle';
  public prevAnimState: string = 'idle';
  public blendProgress: number = 1.0;
  public blendDuration: number = 0.22; // 220ms smooth motion transition lerp

  constructor(config: ThreeSoldierConfig = {}) {
    this.root = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.torsoGroup = new THREE.Group();
    this.rightArmGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.weaponGroup = new THREE.Group();
    this.jetpackGroup = new THREE.Group();

    this.clothingPhysics = new ClothingPhysicsSystem();

    // Setup thruster lights
    this.rightThrusterLight = new THREE.PointLight(0x06b6d4, 0, 4);
    this.leftThrusterLight = new THREE.PointLight(0x06b6d4, 0, 4);
    this.muzzleFlashLight = new THREE.PointLight(0xffaa00, 0, 5);

    // Muzzle flash mesh
    const muzzleGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const muzzleMat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0 });
    this.muzzleMesh = new THREE.Mesh(muzzleGeo, muzzleMat);

    // 3D Thruster Flame Meshes (Mini Militia signature jet flame)
    const flameGeo = new THREE.ConeGeometry(0.1, 0.45, 12);
    flameGeo.rotateX(Math.PI);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0,
    });
    this.leftFlameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.rightFlameMesh = new THREE.Mesh(flameGeo.clone(), flameMat.clone());

    // Jetpack particle system
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.25;
      positions[i * 3 + 1] = -Math.random() * 0.9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      colors[i * 3] = 0.2;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 1.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.jetpackParticles = new THREE.Points(particleGeo, pMat);

    this.build(config);
  }

  public updateConfig(config: ThreeSoldierConfig) {
    while (this.root.children.length > 0) {
      const obj = this.root.children[0];
      this.root.remove(obj);
    }
    this.build(config);
  }

  private build(config: ThreeSoldierConfig) {
    const camoHex = this.parseColor(config.camoColor || '#365314');
    const skinHex = this.parseColor(config.skinTone || '#fbb587');
    const trailHex = this.parseColor(config.trailColor || '#06b6d4');

    const segMult = lodAndTextureOptimizer.getSegmentMultiplier();
    const cylSegs = Math.max(8, Math.round(16 * segMult));
    const sphereSegs = Math.max(10, Math.round(24 * segMult));

    const isPerformanceMode = lodAndTextureOptimizer.getQuality() === 'low';
    const MaterialClass = THREE.MeshStandardMaterial;

    // 1. Stylized Materials
    const skinMat = new MaterialClass({
      color: skinHex,
      roughness: isPerformanceMode ? 0.8 : 0.5,
      metalness: isPerformanceMode ? 0.0 : 0.05
    });

    const camoMat = new MaterialClass({
      color: camoHex,
      roughness: isPerformanceMode ? 0.7 : 0.45,
      metalness: isPerformanceMode ? 0.1 : 0.2
    });

    const darkClothMat = new MaterialClass({
      color: 0x18181b,
      roughness: isPerformanceMode ? 0.9 : 0.7,
      metalness: isPerformanceMode ? 0.0 : 0.1
    });

    const metalDarkMat = new MaterialClass({
      color: 0x27272a,
      roughness: isPerformanceMode ? 0.5 : 0.3,
      metalness: isPerformanceMode ? 0.5 : 0.85
    });

    const goldAccentMat = new MaterialClass({
      color: 0xf59e0b,
      roughness: isPerformanceMode ? 0.4 : 0.25,
      metalness: isPerformanceMode ? 0.7 : 0.9
    });

    // 2. Torso Assembly (Mini Militia proportioned cartoon body)
    this.torsoGroup = new THREE.Group();
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.75, cylSegs);
    const torsoMesh = new THREE.Mesh(torsoGeo, camoMat);
    if (!isPerformanceMode) {
      torsoMesh.castShadow = true;
      torsoMesh.receiveShadow = true;
    }
    this.torsoGroup.add(torsoMesh);

    // Armor Vest
    const vestType = config.bodyArmor || 'molle_vest';
    if (vestType !== 'none') {
      const vestGeo = new THREE.CylinderGeometry(0.42, 0.36, 0.6, cylSegs);
      let vestMat = darkClothMat;
      if (vestType === 'juggernaut' || vestType === 'gold_heavy') {
        vestMat = goldAccentMat;
      } else if (vestType === 'cyber_rig' || vestType === 'cyber_nano' || vestType === 'stealth_kevlar') {
        vestMat = metalDarkMat;
      } else if (vestType === 'hazmat_suit') {
        vestMat = new MaterialClass({ color: 0xeab308, ...(!isPerformanceMode ? { roughness: 0.6 } : {}) }); // Yellow
      } else if (vestType === 'chest_harness') {
        vestMat = new MaterialClass({ color: 0x78350f, ...(!isPerformanceMode ? { roughness: 0.8 } : {}) }); // Brown leather
      }

      const vestMesh = new THREE.Mesh(vestGeo, vestMat);
      vestMesh.position.y = 0.04;
      if (!isPerformanceMode) {
        vestMesh.castShadow = true;
      }
      this.torsoGroup.add(vestMesh);

      if (vestType === 'juggernaut') {
        // bulky gold shoulder plates
        const plateGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
        const lShoulderPlate = new THREE.Mesh(plateGeo, goldAccentMat);
        lShoulderPlate.position.set(-0.4, 0.2, 0);
        const rShoulderPlate = new THREE.Mesh(plateGeo, goldAccentMat);
        rShoulderPlate.position.set(0.4, 0.2, 0);
        this.torsoGroup.add(lShoulderPlate, rShoulderPlate);
      } else if (vestType === 'cyber_rig') {
        // High tech rig with glowing cyan box in center
        const coreGeo = new THREE.BoxGeometry(0.12, 0.12, 0.08);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee }); // Cyan glow
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 0.05, 0.41);
        this.torsoGroup.add(core);
      } else if (vestType === 'chest_harness') {
        // Bandolier straps
        const strapGeo = new THREE.BoxGeometry(0.08, 0.7, 0.44);
        const strap = new THREE.Mesh(strapGeo, vestMat);
        strap.rotation.z = 0.5;
        strap.position.set(0, 0.04, 0.02);
        this.torsoGroup.add(strap);

        // Ammo shells on strap
        for (let i = -2; i <= 2; i++) {
          const shellGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 6);
          shellGeo.rotateX(Math.PI / 2);
          const shell = new THREE.Mesh(shellGeo, goldAccentMat);
          shell.position.set(i * 0.08, i * 0.04, 0.25);
          this.torsoGroup.add(shell);
        }
      } else if (vestType === 'hazmat_suit') {
        // Yellow collar / hood base
        const hoodBaseGeo = new THREE.CylinderGeometry(0.3, 0.34, 0.15, cylSegs);
        const hoodBase = new THREE.Mesh(hoodBaseGeo, vestMat);
        hoodBase.position.y = 0.35;
        this.torsoGroup.add(hoodBase);
      } else {
        // Molle tactical pouches & chest clips (Default MOLLE / other vests)
        const pouchGeo = new THREE.BoxGeometry(0.12, 0.14, 0.1);
        const pouch1 = new THREE.Mesh(pouchGeo, darkClothMat);
        pouch1.position.set(-0.16, -0.05, 0.38);
        const pouch2 = new THREE.Mesh(pouchGeo, darkClothMat);
        pouch2.position.set(0.16, -0.05, 0.38);
        this.torsoGroup.add(pouch1, pouch2);

        // Center tactical chest plate & comms radio
        const plateGeo = new THREE.BoxGeometry(0.18, 0.22, 0.08);
        const plateMesh = new THREE.Mesh(plateGeo, metalDarkMat);
        plateMesh.position.set(0, 0.12, 0.4);
        this.torsoGroup.add(plateMesh);
      }
    }

    // Tactical Belt and golden buckle
    const beltGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, cylSegs);
    const beltMesh = new THREE.Mesh(beltGeo, darkClothMat);
    beltMesh.position.y = -0.36;
    const buckleGeo = new THREE.BoxGeometry(0.12, 0.1, 0.06);
    const buckleMesh = new THREE.Mesh(buckleGeo, goldAccentMat);
    buckleMesh.position.set(0, -0.36, 0.35);
    this.torsoGroup.add(beltMesh, buckleMesh);

    this.torsoGroup.position.y = 1.0;
    this.root.add(this.torsoGroup);

    // 3. Iconic Doodle Army Head & Facial Features
    this.headGroup = new THREE.Group();
    const headGeo = new THREE.SphereGeometry(0.36, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Expressive Eyes (Big cartoon tactical doodle eyes)
    const eyeWhiteGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    const leftEye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEye.position.set(-0.12, 0.03, 0.32);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), eyePupilMat);
    leftPupil.position.set(-0.12, 0.03, 0.37);

    const rightEye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEye.position.set(0.12, 0.03, 0.32);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), eyePupilMat);
    rightPupil.position.set(0.12, 0.03, 0.37);

    this.headGroup.add(leftEye, leftPupil, rightEye, rightPupil);

    // Signature Mini Militia Angled Tactical Eyebrows (Thick & determined)
    const browMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
    const browGeo = new THREE.BoxGeometry(0.14, 0.035, 0.04);

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.12, 0.12, 0.34);
    leftBrow.rotation.z = -0.22; // Angled inwards

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.12, 0.12, 0.34);
    rightBrow.rotation.z = 0.22; // Angled inwards

    this.headGroup.add(leftBrow, rightBrow);

    // Eyewear / Aviator Sunglasses / Cyber Visor
    const eyewear = config.eyewear || 'none';
    if (eyewear === 'aviators' || eyewear === 'sunglasses') {
      const glassesGroup = new THREE.Group();
      // Aviator Dark Lenses
      const lensGeo = new THREE.BoxGeometry(0.15, 0.11, 0.03);
      const glassMat = new MaterialClass({
        color: 0x09090b,
        ...(!isPerformanceMode ? { roughness: 0.1, metalness: 0.95 } : {})
      });
      const leftLens = new THREE.Mesh(lensGeo, glassMat);
      leftLens.position.set(-0.12, 0.03, 0.36);
      const rightLens = new THREE.Mesh(lensGeo, glassMat);
      rightLens.position.set(0.12, 0.03, 0.36);

      // Gold / Chrome Aviator Bridge
      const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6);
      bridgeGeo.rotateZ(Math.PI / 2);
      const bridge = new THREE.Mesh(bridgeGeo, goldAccentMat);
      bridge.position.set(0, 0.05, 0.37);

      // Top Brow Bar
      const topBarGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.38, 8);
      topBarGeo.rotateZ(Math.PI / 2);
      const topBar = new THREE.Mesh(topBarGeo, goldAccentMat);
      topBar.position.set(0, 0.09, 0.36);

      glassesGroup.add(leftLens, rightLens, bridge, topBar);
      this.headGroup.add(glassesGroup);
    } else if (eyewear === 'cyber_visor' || eyewear === 'nvg' || eyewear === 'ballistic_goggles') {
      const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.14, 20, 1, false, 0, Math.PI);
      const visorColor = eyewear === 'ballistic_goggles' ? 0xeab308 : 0x06b6d4; // Gold vs Cyan
      const visorMat = new MaterialClass({
        color: visorColor,
        ...(!isPerformanceMode ? { emissive: visorColor, emissiveIntensity: 0.85, roughness: 0.1 } : {})
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0.05, 0.18);
      this.headGroup.add(visorMesh);
    }

    // Beard / Stubble / Cigar
    const beard = config.beard || 'none';
    if (beard !== 'none') {
      const beardGeo = new THREE.SphereGeometry(0.37, 18, 14, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.42);
      const beardColor = beard === 'thick_bush' || beard === 'full_beard' ? 0x271a0c : 0x4a3b2c;
      const beardMat = new MaterialClass({
        color: beardColor,
        ...(!isPerformanceMode ? { roughness: 0.95 } : {})
      });
      const beardMesh = new THREE.Mesh(beardGeo, beardMat);
      this.headGroup.add(beardMesh);

      if (beard === 'cigar' || beard === 'cigar_badass') {
        // Cool badass cigar sticking out of mouth!
        const cigarGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6);
        cigarGeo.rotateX(Math.PI / 2);
        const cigarMat = new MaterialClass({ color: 0x451a03 }); // Dark brown
        const cigar = new THREE.Mesh(cigarGeo, cigarMat);
        cigar.position.set(0.12, -0.15, 0.34);
        cigar.rotation.y = 0.4;

        // Orange glowing tip
        const tipGeo = new THREE.SphereGeometry(0.022, 6, 6);
        const tipMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(0.18, -0.15, 0.42);

        this.headGroup.add(cigar, tip);
      }
    }

    // Headgear Selection
    const headgear = config.headgear || 'camo_helmet';
    if (headgear === 'camo_helmet' || headgear === 'specops_helmet' || headgear === 'nvg_helmet') {
      const helmetGeo = new THREE.SphereGeometry(0.4, sphereSegs, Math.max(8, Math.round(16 * segMult)), 0, Math.PI * 2, 0, Math.PI * 0.55);
      const helmetMat = headgear === 'specops_helmet' ? metalDarkMat : camoMat;
      const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
      helmetMesh.position.y = 0.08;
      if (!isPerformanceMode) {
        helmetMesh.castShadow = true;
      }
      this.headGroup.add(helmetMesh);

      // Helmet Rim band & front tactical NVG mount
      const rimGeo = new THREE.TorusGeometry(0.4, 0.03, 8, 24);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, darkClothMat);
      rimMesh.position.y = 0.08;
      this.headGroup.add(rimMesh);

      const nvgMountGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
      const nvgMount = new THREE.Mesh(nvgMountGeo, metalDarkMat);
      nvgMount.position.set(0, 0.16, 0.4);
      this.headGroup.add(nvgMount);

      if (headgear === 'nvg_helmet') {
        // Sticking out dual Night Vision Tubes with glowing green lenses!
        const tubeMat = new MaterialClass({ color: 0x111827 });
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Glowing green NVG lens!

        const tubeGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.16, 8);
        tubeGeo.rotateX(Math.PI / 2);

        const leftTube = new THREE.Mesh(tubeGeo, tubeMat);
        leftTube.position.set(-0.1, 0.12, 0.46);
        const leftLensGeo = new THREE.CircleGeometry(0.04, 8);
        const leftLens = new THREE.Mesh(leftLensGeo, lensMat);
        leftLens.position.set(-0.1, 0.12, 0.54);

        const rightTube = new THREE.Mesh(tubeGeo, tubeMat);
        rightTube.position.set(0.1, 0.12, 0.46);
        const rightLens = new THREE.Mesh(leftLensGeo, lensMat);
        rightLens.position.set(0.1, 0.12, 0.54);

        this.headGroup.add(leftTube, leftLens, rightTube, rightLens);
      }
    } else if (headgear === 'beret_red' || headgear === 'beret' || headgear === 'beret_green' || headgear === 'bandana') {
      const beretGroup = new THREE.Group();
      if (headgear === 'bandana') {
        // Red Commando bandana tied around head
        const bandGeo = new THREE.TorusGeometry(0.39, 0.05, 8, cylSegs);
        bandGeo.rotateX(Math.PI / 2);
        const bandMat = new MaterialClass({ color: 0xdc2626 }); // Red
        const bandMesh = new THREE.Mesh(bandGeo, bandMat);
        bandMesh.position.y = 0.15;
        beretGroup.add(bandMesh);

        // Trailing bandana knots behind head
        const knotGeo = new THREE.BoxGeometry(0.04, 0.22, 0.04);
        const knot1 = new THREE.Mesh(knotGeo, bandMat);
        knot1.position.set(-0.06, 0.1, -0.42);
        knot1.rotation.z = 0.2;
        const knot2 = new THREE.Mesh(knotGeo, bandMat);
        knot2.position.set(0.06, 0.1, -0.42);
        knot2.rotation.z = -0.2;
        beretGroup.add(knot1, knot2);
      } else {
        const beretGeo = new THREE.CylinderGeometry(0.42, 0.34, 0.16, cylSegs);
        const beretColor = headgear === 'beret_green' ? 0x15803d : 0xdc2626; // Green vs Red
        const beretMat = new MaterialClass({ color: beretColor, ...(!isPerformanceMode ? { roughness: 0.7 } : {}) });
        const beretMesh = new THREE.Mesh(beretGeo, beretMat);
        beretMesh.position.set(0.06, 0.28, 0);
        beretMesh.rotation.z = -0.2;

        // Golden Special Ops Officer Insignia Crest
        const crestGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const crest = new THREE.Mesh(crestGeo, goldAccentMat);
        crest.position.set(-0.16, 0.32, 0.32);

        beretGroup.add(beretMesh, crest);
      }
      this.headGroup.add(beretGroup);
    } else if (headgear === 'crown_gold') {
      const crownGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.18, 7);
      const crownMesh = new THREE.Mesh(crownGeo, goldAccentMat);
      crownMesh.position.y = 0.35;
      this.headGroup.add(crownMesh);
    } else if (headgear === 'pilot_helmet') {
      // Sleek pilot helmet with big black visor
      const helmetGeo = new THREE.SphereGeometry(0.42, sphereSegs, sphereSegs);
      const helmetMat = new MaterialClass({ color: 0xf3f4f6 }); // Glossy white
      const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
      helmetMesh.position.y = 0.08;
      this.headGroup.add(helmetMesh);

      // Black Visor
      const visorGeo = new THREE.SphereGeometry(0.35, 12, 12, 0, Math.PI, 0.2, Math.PI * 0.4);
      visorGeo.rotateY(-Math.PI / 2);
      const visorMat = new MaterialClass({ color: 0x111827, ...(!isPerformanceMode ? { roughness: 0.1, metalness: 0.9 } : {}) });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0.08, 0.1);
      this.headGroup.add(visorMesh);
    } else if (headgear === 'gas_mask') {
      // Large respirator gas mask covering lower face/head
      const maskGeo = new THREE.SphereGeometry(0.41, sphereSegs, sphereSegs);
      const maskMat = darkClothMat;
      const maskMesh = new THREE.Mesh(maskGeo, maskMat);
      maskMesh.position.y = 0.06;
      this.headGroup.add(maskMesh);

      // Two big round goggles lenses
      const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10);
      lensGeo.rotateX(Math.PI / 2);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Orange tint lenses

      const lEye = new THREE.Mesh(lensGeo, lensMat);
      lEye.position.set(-0.15, 0.12, 0.36);
      const rEye = new THREE.Mesh(lensGeo, lensMat);
      rEye.position.set(0.15, 0.12, 0.36);
      this.headGroup.add(lEye, rEye);

      // Front filter canister (respirator box)
      const canisterGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 10);
      canisterGeo.rotateX(Math.PI / 2);
      const canister = new THREE.Mesh(canisterGeo, metalDarkMat);
      canister.position.set(0, -0.1, 0.38);
      this.headGroup.add(canister);
    } else if (headgear === 'skull_mask' || headgear === 'ninja_mask') {
      // Skull or Ninja Hood covering whole head
      const hoodGeo = new THREE.SphereGeometry(0.41, sphereSegs, sphereSegs);
      const hoodMat = darkClothMat;
      const hoodMesh = new THREE.Mesh(hoodGeo, hoodMat);
      hoodMesh.position.y = 0.06;
      this.headGroup.add(hoodMesh);

      if (headgear === 'skull_mask') {
        // White Skull Faceplate on front of the black hood
        const plateGeo = new THREE.SphereGeometry(0.38, 12, 12, 0, Math.PI * 0.9, 0, Math.PI * 0.5);
        plateGeo.rotateX(Math.PI / 2);
        const plateMat = new MaterialClass({ color: 0xf3f4f6 }); // Skull bone white
        const plateMesh = new THREE.Mesh(plateGeo, plateMat);
        plateMesh.position.set(0, 0.04, 0.12);
        this.headGroup.add(plateMesh);

        // Black eye sockets
        const socketGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
        const socketMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
        const lSocket = new THREE.Mesh(socketGeo, socketMat);
        lSocket.position.set(-0.13, 0.1, 0.44);
        const rSocket = new THREE.Mesh(socketGeo, socketMat);
        rSocket.position.set(0.13, 0.1, 0.44);
        this.headGroup.add(lSocket, rSocket);
      } else {
        // Ninja Mask - only skin showing around eyes
        const skinOpeningGeo = new THREE.BoxGeometry(0.24, 0.08, 0.03);
        const skinOpening = new THREE.Mesh(skinOpeningGeo, skinMat);
        skinOpening.position.set(0, 0.1, 0.39);
        this.headGroup.add(skinOpening);
      }
    }

    this.headGroup.position.y = 1.62;
    this.root.add(this.headGroup);

    // 4. Dual Jetpack Assembly (Rear Mounted Rocket Thrusters)
    this.jetpackGroup = new THREE.Group();
    const jetpackStyle = config.jetpackStyle || 'military_dual';
    const jetMat = jetpackStyle === 'gold_titan' ? goldAccentMat : metalDarkMat;

    // Dual Thruster Rockets
    const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.58, cylSegs);
    const leftThruster = new THREE.Mesh(thrusterGeo, jetMat);
    leftThruster.position.set(-0.2, 0, 0);
    const rightThruster = new THREE.Mesh(thrusterGeo, jetMat);
    rightThruster.position.set(0.2, 0, 0);

    // Center fuel core with glowing indicator
    const cellGeo = new THREE.BoxGeometry(0.34, 0.48, 0.2);
    const cellMesh = new THREE.Mesh(cellGeo, camoMat);
    const coreGlowGeo = new THREE.BoxGeometry(0.12, 0.2, 0.05);
    const coreGlowMat = new MaterialClass({
      color: trailHex,
      ...(!isPerformanceMode ? { emissive: trailHex, emissiveIntensity: 0.9 } : {})
    });
    const coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    coreGlow.position.set(0, 0, -0.11);

    this.jetpackGroup.add(leftThruster, rightThruster, cellMesh, coreGlow);

    // Glowing Jet Nozzles
    const nozzleMat = new MaterialClass({
      color: trailHex,
      emissive: trailHex,
      emissiveIntensity: 1.0,
    });
    const nozzleGeo = new THREE.TorusGeometry(0.11, 0.03, 8, 16);
    nozzleGeo.rotateX(Math.PI / 2);
    const leftNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    leftNozzle.position.set(-0.2, -0.3, 0);
    const rightNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    rightNozzle.position.set(0.2, -0.3, 0);

    // Connect 3D Thruster Flame Meshes
    this.leftFlameMesh.position.set(-0.2, -0.55, 0);
    this.rightFlameMesh.position.set(0.2, -0.55, 0);
    (this.leftFlameMesh.material as THREE.MeshStandardMaterial).color.setHex(trailHex);
    (this.leftFlameMesh.material as THREE.MeshStandardMaterial).emissive.setHex(trailHex);
    (this.rightFlameMesh.material as THREE.MeshStandardMaterial).color.setHex(trailHex);
    (this.rightFlameMesh.material as THREE.MeshStandardMaterial).emissive.setHex(trailHex);

    this.jetpackGroup.add(leftNozzle, rightNozzle, this.leftFlameMesh, this.rightFlameMesh);

    // Thruster Point Lights & Particles
    this.rightThrusterLight.color.setHex(trailHex);
    this.leftThrusterLight.color.setHex(trailHex);
    this.rightThrusterLight.position.set(0.2, -0.45, -0.2);
    this.leftThrusterLight.position.set(-0.2, -0.45, -0.2);
    this.jetpackParticles.position.set(0, -0.35, 0);
    this.jetpackGroup.add(this.rightThrusterLight, this.leftThrusterLight, this.jetpackParticles);

    this.jetpackGroup.position.set(0, 1.0, -0.38);
    this.root.add(this.jetpackGroup);

    // 5. Stylized Floating Boots & Hover Legs (Authentic Mini Militia Silhouette)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.52, 12);
    const bootGeo = new THREE.BoxGeometry(0.2, 0.22, 0.32);

    const leftLegMesh = new THREE.Mesh(legGeo, camoMat);
    leftLegMesh.position.set(-0.18, 0.42, 0);
    const leftBoot = new THREE.Mesh(bootGeo, darkClothMat);
    leftBoot.position.set(-0.18, 0.1, 0.05);
    leftLegMesh.castShadow = true;
    leftBoot.castShadow = true;
    this.leftBootMesh = leftBoot;

    const rightLegMesh = new THREE.Mesh(legGeo, camoMat);
    rightLegMesh.position.set(0.18, 0.42, 0);
    const rightBoot = new THREE.Mesh(bootGeo, darkClothMat);
    rightBoot.position.set(0.18, 0.1, 0.05);
    rightLegMesh.castShadow = true;
    rightBoot.castShadow = true;
    this.rightBootMesh = rightBoot;

    this.root.add(leftLegMesh, leftBoot, rightLegMesh, rightBoot);

    // 6. Articulated Arms & Hands
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.44, 10);
    const handGeo = new THREE.SphereGeometry(0.085, 12, 12);

    // Right Arm (Weapon Primary)
    this.rightArmGroup = new THREE.Group();
    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), camoMat);
    const rightForearm = new THREE.Mesh(armGeo, camoMat);
    rightForearm.position.set(0, -0.22, 0);
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0, -0.45, 0);
    this.rightArmGroup.add(rightShoulder, rightForearm, rightHand);
    this.rightArmGroup.position.set(0.44, 1.25, 0);

    // Left Arm (Support / Steady)
    this.leftArmGroup = new THREE.Group();
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), camoMat);
    const leftForearm = new THREE.Mesh(armGeo, camoMat);
    leftForearm.position.set(0, -0.22, 0);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(0, -0.45, 0);
    this.leftArmGroup.add(leftShoulder, leftForearm, leftHand);
    this.leftArmGroup.position.set(-0.44, 1.25, 0);

    this.root.add(this.rightArmGroup, this.leftArmGroup);

    // 7. Mini Militia 3D Weapon Model Attached
    this.build3DWeapon(config.weapon || 'pistol');
    this.rightArmGroup.add(this.weaponGroup);

    // 8. Dynamic Clothing & Accessories Physics Integration
    const capeStyle = config.capeStyle || 'full_set';
    this.clothingPhysics = new ClothingPhysicsSystem(camoHex);
    this.clothingPhysics.enabled = config.enableClothingPhysics !== false;

    if (capeStyle === 'tactical_cape' || capeStyle === 'full_set') {
      this.root.add(this.clothingPhysics.capeGroup);
    }
    if (capeStyle === 'commando_scarf' || capeStyle === 'full_set') {
      this.root.add(this.clothingPhysics.scarfGroup);
    }
    if (capeStyle === 'full_set' || capeStyle === 'tactical_cape') {
      this.torsoGroup.add(this.clothingPhysics.dogTagGroup);
      if (this.clothingPhysics.antennaMesh) {
        this.torsoGroup.add(this.clothingPhysics.antennaMesh);
      }
    }

    // Set Default Aim Pose
    this.setAimPose(config.aimAngle || 0);

    // 9. Initialize 3D Holographic HUD attached to the weaponGroup
    this.initHolographicHUD();
    this.weaponGroup.add(this.holoHUDGroup);

    // 10. Load Custom GLTF Model if url is provided
    if (config.gltfModelUrl) {
      this.loadGLTFModel(config.gltfModelUrl);
    }
  }

  /**
   * Advances the dynamic clothing physics simulation based on model rotation & delta time
   */
  public updatePhysics(currentRotationY: number, deltaSec: number = 0.016) {
    if (this.clothingPhysics) {
      this.clothingPhysics.update(currentRotationY, deltaSec);
    }
  }

  /**
   * Constructs detailed 3D Mini Militia stylized Weapon Models
   */
  public build3DWeapon(weaponType: string) {
    while (this.weaponGroup.children.length > 0) {
      this.weaponGroup.remove(this.weaponGroup.children[0]);
    }

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.85, roughness: 0.25 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.1, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.2 });
    const darkClothMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
    const neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
    });
    const orangeHotMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.0,
    });

    const wGroup = new THREE.Group();

    if (weaponType === 'saw_gun' || weaponType === 'saw') {
      // Mini Militia Iconic SAW Blade Gun
      const frameGeo = new THREE.BoxGeometry(0.12, 0.2, 0.7);
      const frame = new THREE.Mesh(frameGeo, metalMat);

      // Rotating Circular Saw Blade
      const bladeGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16);
      bladeGeo.rotateX(Math.PI / 2);
      const blade = new THREE.Mesh(bladeGeo, chromeMat);
      blade.position.set(0, 0.08, 0.45);

      // Blade Teeth Ring
      const teethGeo = new THREE.TorusGeometry(0.3, 0.025, 8, 16);
      teethGeo.rotateX(Math.PI / 2);
      const teeth = new THREE.Mesh(teethGeo, orangeHotMat);
      teeth.position.set(0, 0.08, 0.45);

      // Guard & Handle
      const guardGeo = new THREE.BoxGeometry(0.16, 0.18, 0.2);
      const guard = new THREE.Mesh(guardGeo, darkClothMat);
      guard.position.set(0, 0.04, 0.1);

      wGroup.add(frame, blade, teeth, guard);
      this.muzzleMesh.position.set(0, 0.08, 0.8);
      this.muzzleFlashLight.position.set(0, 0.08, 0.85);
    } else if (weaponType === 'dual_uzi' || weaponType === 'uzi') {
      // Dual Micro Uzi
      const uzi1 = this.createUziMesh(metalMat, darkClothMat);
      uzi1.position.set(0, 0, 0.1);
      wGroup.add(uzi1);
      this.muzzleMesh.position.set(0, 0.04, 0.42);
      this.muzzleFlashLight.position.set(0, 0.04, 0.45);
    } else if (weaponType === 'flamethrower') {
      // Mini Militia Flamethrower with fuel cylinder
      const barrelGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.9, 12);
      barrelGeo.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, metalMat);
      barrel.position.set(0, 0.04, 0.35);

      const fuelTankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 12);
      fuelTankGeo.rotateX(Math.PI / 2);
      const fuelTank = new THREE.Mesh(fuelTankGeo, orangeHotMat);
      fuelTank.position.set(0, -0.15, 0.1);

      const nozzleGeo = new THREE.ConeGeometry(0.08, 0.2, 10);
      nozzleGeo.rotateX(Math.PI / 2);
      const nozzle = new THREE.Mesh(nozzleGeo, chromeMat);
      nozzle.position.set(0, 0.04, 0.82);

      wGroup.add(barrel, fuelTank, nozzle);
      this.muzzleMesh.position.set(0, 0.04, 0.9);
      this.muzzleFlashLight.position.set(0, 0.04, 0.95);
    } else if (weaponType === 'sniper' || weaponType === 'awm' || weaponType === 'sniper_gold') {
      // Long Range Tactical Sniper Rifle
      const isGold = weaponType.includes('gold');
      const barrelGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.4, 12);
      barrelGeo.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, isGold ? goldMat : metalMat);
      barrel.position.set(0, 0.04, 0.5);

      const bodyGeo = new THREE.BoxGeometry(0.09, 0.18, 0.85);
      const body = new THREE.Mesh(bodyGeo, isGold ? goldMat : chromeMat);
      body.position.set(0, 0, 0);

      // High-power Scope with Glowing Lens
      const scopeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.48, 12);
      scopeGeo.rotateX(Math.PI / 2);
      const scope = new THREE.Mesh(scopeGeo, metalMat);
      scope.position.set(0, 0.16, 0.05);

      const lensGeo = new THREE.CircleGeometry(0.05, 12);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 0.16, 0.29);

      // Bipod legs
      const bipodGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
      const bipod1 = new THREE.Mesh(bipodGeo, metalMat);
      bipod1.position.set(-0.06, -0.12, 0.8);
      bipod1.rotation.z = 0.3;
      const bipod2 = new THREE.Mesh(bipodGeo, metalMat);
      bipod2.position.set(0.06, -0.12, 0.8);
      bipod2.rotation.z = -0.3;

      wGroup.add(barrel, body, scope, lens, bipod1, bipod2);
      this.muzzleMesh.position.set(0, 0.04, 1.25);
      this.muzzleFlashLight.position.set(0, 0.04, 1.3);
    } else if (weaponType === 'rocket_launcher' || weaponType === 'bazooka' || weaponType === 'rpg') {
      // Rocket Launcher RPG-7
      const tubeGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.3, 16);
      tubeGeo.rotateX(Math.PI / 2);
      const tube = new THREE.Mesh(tubeGeo, metalMat);

      const warheadGeo = new THREE.ConeGeometry(0.12, 0.3, 12);
      warheadGeo.rotateX(Math.PI / 2);
      const warhead = new THREE.Mesh(warheadGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
      warhead.position.set(0, 0, 0.75);

      const sightGeo = new THREE.BoxGeometry(0.1, 0.12, 0.2);
      const sight = new THREE.Mesh(sightGeo, neonCyanMat);
      sight.position.set(0.12, 0.1, 0.1);

      wGroup.add(tube, warhead, sight);
      this.muzzleMesh.position.set(0, 0, 0.9);
      this.muzzleFlashLight.position.set(0, 0, 0.95);
    } else if (weaponType === 'shotgun') {
      // Pump-Action Combat Shotgun
      const barrelGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.95, 12);
      barrelGeo.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeo, chromeMat);
      barrel.position.set(0, 0.03, 0.3);

      const magTubeGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.8, 10);
      magTubeGeo.rotateX(Math.PI / 2);
      const magTube = new THREE.Mesh(magTubeGeo, metalMat);
      magTube.position.set(0, -0.05, 0.25);

      const stockGeo = new THREE.BoxGeometry(0.08, 0.16, 0.38);
      const stock = new THREE.Mesh(stockGeo, woodMat);
      stock.position.set(0, -0.04, -0.3);

      wGroup.add(barrel, magTube, stock);
      this.muzzleMesh.position.set(0, 0.03, 0.8);
      this.muzzleFlashLight.position.set(0, 0.03, 0.85);
    } else {
      // Desert Eagle / Golden Hand Cannon
      const isGold = weaponType.includes('gold') || weaponType.includes('desert');
      const slideGeo = new THREE.BoxGeometry(0.07, 0.11, 0.42);
      const slide = new THREE.Mesh(slideGeo, isGold ? goldMat : chromeMat);
      slide.position.set(0, 0.06, 0.1);

      const gripGeo = new THREE.BoxGeometry(0.06, 0.22, 0.12);
      const grip = new THREE.Mesh(gripGeo, darkClothMat);
      grip.position.set(0, -0.08, 0);
      grip.rotation.x = -0.22;

      wGroup.add(slide, grip);
      this.muzzleMesh.position.set(0, 0.06, 0.35);
      this.muzzleFlashLight.position.set(0, 0.06, 0.38);
    }

    wGroup.add(this.muzzleMesh, this.muzzleFlashLight);
    wGroup.position.set(0, -0.45, 0.15);
    this.weaponGroup.add(wGroup);

    // Re-add Holographic HUD group to weaponGroup after weapon rebuild!
    if (this.holoHUDGroup) {
      this.weaponGroup.add(this.holoHUDGroup);
    }
  }

  private createUziMesh(metalMat: THREE.Material, darkMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.06, 0.1, 0.32);
    const body = new THREE.Mesh(bodyGeo, metalMat);
    const magGeo = new THREE.BoxGeometry(0.04, 0.2, 0.06);
    const mag = new THREE.Mesh(magGeo, darkMat);
    mag.position.set(0, -0.12, 0);
    const barrelGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, metalMat);
    barrel.position.set(0, 0.02, 0.2);
    group.add(body, mag, barrel);
    return group;
  }

  /**
   * Sets the 3D Soldier posture and aim angle
   */
  public setAimPose(angleRad: number) {
    this.rightArmGroup.rotation.x = -angleRad;
    this.headGroup.rotation.y = Math.sin(angleRad * 0.5) * 0.4;
  }

  /**
   * Triggers a 3D Muzzle Flash animation
   */
  public triggerMuzzleFlash() {
    const isPerformanceMode = lodAndTextureOptimizer.getQuality() === 'low';
    const mat = this.muzzleMesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 1;
    if (!isPerformanceMode) {
      this.muzzleFlashLight.intensity = 4.5;
    }

    setTimeout(() => {
      mat.opacity = 0;
      this.muzzleFlashLight.intensity = 0;
    }, 85);
  }

  /**
   * Triggers 3D Jetpack Thruster Active Flare & Animated Flame Cone
   */
  public setJetpackActive(active: boolean) {
    const isPerformanceMode = lodAndTextureOptimizer.getQuality() === 'low';
    const pMat = this.jetpackParticles.material as THREE.PointsMaterial;
    pMat.opacity = active ? 0.95 : 0;
    
    if (!isPerformanceMode) {
      this.leftThrusterLight.intensity = active ? 3.5 : 0;
      this.rightThrusterLight.intensity = active ? 3.5 : 0;
    } else {
      this.leftThrusterLight.intensity = 0;
      this.rightThrusterLight.intensity = 0;
    }

    const leftFMat = this.leftFlameMesh.material as any;
    const rightFMat = this.rightFlameMesh.material as any;
    leftFMat.opacity = active ? 0.9 : 0;
    rightFMat.opacity = active ? 0.9 : 0;
  }

  /**
   * Calculates joint transform keyframes for procedural 3D motion states
   */
  public getPoseTransforms(stateName: string, timeSec: number) {
    let torsoY = 1.0;
    let torsoRotX = 0;
    let torsoRotZ = 0;
    let headRotY = 0;
    let headRotX = 0;
    let rightArmRotX = -0.3;
    let rightArmRotZ = 0;
    let leftArmRotX = -0.2;
    let leftArmRotZ = 0;
    let rightBootY = 0.1;
    let rightBootZ = 0.05;
    let leftBootY = 0.1;
    let leftBootZ = 0.05;
    let rootY = 0;
    let rootRotX = 0;
    let isJetpackActive = false;

    if (stateName === 'run') {
      const runSin = Math.sin(timeSec * 12.0);
      torsoY = 1.0 + Math.abs(Math.sin(timeSec * 12.0)) * 0.06;
      torsoRotX = 0.18; // Aerodynamic forward run posture
      rightArmRotX = -0.4 + runSin * 0.45;
      leftArmRotX = -0.4 - runSin * 0.45;
      rightBootY = 0.1 + Math.max(0, -runSin) * 0.22;
      rightBootZ = 0.05 + runSin * 0.28;
      leftBootY = 0.1 + Math.max(0, runSin) * 0.22;
      leftBootZ = 0.05 - runSin * 0.28;
      headRotY = runSin * 0.05;
      headRotX = -0.08;
    } else if (stateName === 'jump') {
      torsoY = 1.15 + Math.sin(timeSec * 4.0) * 0.05;
      torsoRotX = -0.08;
      rightArmRotX = -0.85;
      leftArmRotX = -0.7;
      rightBootY = 0.25;
      rightBootZ = -0.15; // Tuck knees in mid-air
      leftBootY = 0.3;
      leftBootZ = 0.1;
      headRotX = -0.15;
      rootY = 0.18;
    } else if (stateName === 'flight' || stateName === 'jetpack') {
      torsoY = 1.0 + Math.sin(timeSec * 5.0) * 0.08;
      torsoRotX = 0.38; // 35 degree flight tilt
      rightArmRotX = -0.9;
      leftArmRotX = -0.9;
      rightBootY = 0.05;
      rightBootZ = -0.32; // Trailing boots draft
      leftBootY = 0.05;
      leftBootZ = -0.28;
      headRotY = Math.sin(timeSec * 2.5) * 0.08;
      headRotX = -0.2;
      rootY = 0.25;
      rootRotX = 0.1;
      isJetpackActive = true;
    } else if (stateName === 'crouch' || stateName === 'cover') {
      torsoY = 0.72; // Kneeling low
      torsoRotX = 0.25;
      rightArmRotX = -0.5;
      leftArmRotX = -0.6;
      rightBootY = 0.18;
      rightBootZ = -0.22;
      leftBootY = 0.1;
      leftBootZ = 0.18;
      headRotX = 0.1;
      rootY = -0.2;
    } else if (stateName === 'reload') {
      const reloadPhase = (timeSec * 3.2) % 1.0;
      torsoY = 0.98 + Math.sin(reloadPhase * Math.PI) * 0.03;
      torsoRotX = -0.1;
      rightArmRotX = -0.75; // Gun tilted up
      leftArmRotX = -1.2 + Math.sin(reloadPhase * Math.PI) * 0.5; // Left hand snapping magazine
      headRotY = -0.15;
      headRotX = 0.2;
    } else if (stateName === 'salute') {
      torsoY = 1.05;
      torsoRotX = -0.05;
      rightArmRotX = -2.2;
      rightArmRotZ = -0.45;
      leftArmRotX = -0.1;
      headRotY = 0.12;
    } else if (stateName === 'victory') {
      torsoY = 1.1 + Math.abs(Math.sin(timeSec * 4)) * 0.04;
      torsoRotX = -0.15;
      rightArmRotX = -2.5;
      rightArmRotZ = 0.2;
      leftArmRotX = -2.2;
      leftArmRotZ = -0.3;
      rightBootY = 0.1;
      rightBootZ = 0.12;
      leftBootY = 0.1;
      leftBootZ = -0.12;
      headRotY = Math.sin(timeSec * 3) * 0.2;
      headRotX = -0.2;
      rootY = 0.08;
    } else if (stateName === 'aim') {
      torsoY = 1.0;
      torsoRotX = 0;
      rightArmRotX = -0.3 + Math.sin(timeSec * 2) * 0.2;
      leftArmRotX = -0.4;
      headRotY = Math.sin(timeSec * 2) * 0.3;
    } else {
      // Default IDLE
      torsoY = 1.0 + Math.sin(timeSec * 2.5) * 0.025;
      headRotY = Math.sin(timeSec * 1.2) * 0.12;
      rightArmRotX = -0.3 + Math.sin(timeSec * 2.0) * 0.04;
      leftArmRotX = -0.2 + Math.cos(timeSec * 2.0) * 0.04;
      rightBootY = 0.1;
      rightBootZ = 0.05 + Math.sin(timeSec * 1.5) * 0.02;
      leftBootY = 0.1;
      leftBootZ = 0.05 - Math.sin(timeSec * 1.5) * 0.02;
    }

    return {
      torsoY,
      torsoRotX,
      torsoRotZ,
      headRotY,
      headRotX,
      rightArmRotX,
      rightArmRotZ,
      leftArmRotX,
      leftArmRotZ,
      rightBootY,
      rightBootZ,
      leftBootY,
      leftBootZ,
      rootY,
      rootRotX,
      isJetpackActive,
    };
  }

  /**
   * Advances state transitions with smooth motion lerping (Cubic Ease) across 3D joint hierarchies
   */
  public updateAnimationState(targetState: string, timeSec: number, deltaSec: number = 0.016) {
    if (this.gltfMixer) {
      this.gltfMixer.update(deltaSec);
      
      const targetAction = this.gltfActions[targetState.toLowerCase()];
      if (targetAction) {
        Object.keys(this.gltfActions).forEach((actName) => {
          const act = this.gltfActions[actName];
          if (act !== targetAction && act.isRunning()) {
            act.fadeOut(0.2);
          }
        });
        if (!targetAction.isRunning()) {
          targetAction.reset().fadeIn(0.2).play();
        }
      }
    }

    if (targetState !== this.currentAnimState) {
      this.prevAnimState = this.currentAnimState;
      this.currentAnimState = targetState;
      this.blendProgress = 0.0;
    }

    this.blendProgress = Math.min(1.0, this.blendProgress + deltaSec / this.blendDuration);
    // Smoothstep cubic alpha interpolation curve
    const alpha = this.blendProgress * this.blendProgress * (3.0 - 2.0 * this.blendProgress);

    const p1 = this.getPoseTransforms(this.prevAnimState, timeSec);
    const p2 = this.getPoseTransforms(this.currentAnimState, timeSec);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const torsoY = lerp(p1.torsoY, p2.torsoY, alpha);
    const torsoRotX = lerp(p1.torsoRotX, p2.torsoRotX, alpha);
    const torsoRotZ = lerp(p1.torsoRotZ, p2.torsoRotZ, alpha);
    const headRotY = lerp(p1.headRotY, p2.headRotY, alpha);
    const headRotX = lerp(p1.headRotX, p2.headRotX, alpha);
    const rightArmRotX = lerp(p1.rightArmRotX, p2.rightArmRotX, alpha);
    const rightArmRotZ = lerp(p1.rightArmRotZ, p2.rightArmRotZ, alpha);
    const leftArmRotX = lerp(p1.leftArmRotX, p2.leftArmRotX, alpha);
    const leftArmRotZ = lerp(p1.leftArmRotZ, p2.leftArmRotZ, alpha);
    const rightBootY = lerp(p1.rightBootY, p2.rightBootY, alpha);
    const rightBootZ = lerp(p1.rightBootZ, p2.rightBootZ, alpha);
    const leftBootY = lerp(p1.leftBootY, p2.leftBootY, alpha);
    const leftBootZ = lerp(p1.leftBootZ, p2.leftBootZ, alpha);
    const rootY = lerp(p1.rootY, p2.rootY, alpha);
    const rootRotX = lerp(p1.rootRotX, p2.rootRotX, alpha);
    const isJetpackActive = alpha > 0.5 ? p2.isJetpackActive : p1.isJetpackActive;

    // Apply interpolated joint values
    this.torsoGroup.position.y = torsoY;
    this.torsoGroup.rotation.x = torsoRotX;
    this.torsoGroup.rotation.z = torsoRotZ;

    this.headGroup.rotation.y = headRotY;
    this.headGroup.rotation.x = headRotX;

    this.rightArmGroup.rotation.x = rightArmRotX;
    this.rightArmGroup.rotation.z = rightArmRotZ;

    this.leftArmGroup.rotation.x = leftArmRotX;
    this.leftArmGroup.rotation.z = leftArmRotZ;

    if (this.rightBootMesh) {
      this.rightBootMesh.position.y = rightBootY;
      this.rightBootMesh.position.z = rightBootZ;
    }
    if (this.leftBootMesh) {
      this.leftBootMesh.position.y = leftBootY;
      this.leftBootMesh.position.z = leftBootZ;
    }

    this.root.position.y = rootY;
    this.root.rotation.x = rootRotX;

    this.setJetpackActive(isJetpackActive);
  }

  private async loadGLTFModel(url: string) {
    try {
      // 2-second timeout
      const gltf = await Promise.race([
        lodAndTextureOptimizer.loadGLTF(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout loading GLTF')), 2000)
        ),
      ]);
      
      // Clone the scene safely so we don't interfere with other instances
      const model = lodAndTextureOptimizer.cloneGLTFScene(gltf);
      model.position.set(0, 0, 0);
      model.scale.set(1.1, 1.1, 1.1); // Proportioned nicely
      
      // Clear previous loaded gltf model if any
      if (this.gltfModelGroup) {
        this.root.remove(this.gltfModelGroup);
        lodAndTextureOptimizer.disposeHierarchy(this.gltfModelGroup);
      }

      this.gltfModelGroup = model;
      this.isGLTFLoaded = true;
      this.root.add(model);
      
      // Hide procedural body meshes!
      this.headGroup.visible = false;
      this.torsoGroup.visible = false;
      this.rightArmGroup.visible = false;
      this.leftArmGroup.visible = false;
      this.jetpackGroup.visible = false;
      if (this.leftBootMesh) this.leftBootMesh.visible = false;
      if (this.rightBootMesh) this.rightBootMesh.visible = false;
      
      if (this.clothingPhysics) {
        this.clothingPhysics.enabled = false;
        if (this.clothingPhysics.capeGroup) this.clothingPhysics.capeGroup.visible = false;
        if (this.clothingPhysics.scarfGroup) this.clothingPhysics.scarfGroup.visible = false;
        if (this.clothingPhysics.dogTagGroup) this.clothingPhysics.dogTagGroup.visible = false;
      }

      // Handle animations if available in the source gltf
      if (gltf.animations && gltf.animations.length > 0) {
        this.gltfMixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip: any) => {
          const action = this.gltfMixer!.clipAction(clip);
          this.gltfActions[clip.name.toLowerCase()] = action;
        });
        
        // Start default idle animation or whatever first action is there
        const firstAction = this.gltfMixer.clipAction(gltf.animations[0]);
        firstAction.play();
      }
    } catch (err) {
      console.warn('Failed to load custom GLTF inside ThreeSoldierBuilder:', err);
      this.isGLTFLoadingFailed = true;

      // Show Fallback Sprite!
      if (!this.fallbackSprite) {
        this.createFallbackSprite();
      }
      if (this.fallbackSprite) {
        this.fallbackSprite.visible = true;
      }

      // Fallback: make sure procedural meshes are visible if it fails
      this.headGroup.visible = true;
      this.torsoGroup.visible = true;
      this.rightArmGroup.visible = true;
      this.leftArmGroup.visible = true;
      this.jetpackGroup.visible = true;
      if (this.leftBootMesh) this.leftBootMesh.visible = true;
      if (this.rightBootMesh) this.rightBootMesh.visible = true;
    }
  }

  private parseColor(color: any): number {
    try {
      if (!color) return 0x365314;
      if (typeof color === 'number') return color;
      if (typeof color === 'string') {
        const trimmed = color.trim();
        // Handle hex starting with # or without
        if (trimmed.startsWith('#')) {
          const hexNum = parseInt(trimmed.replace('#', '0x'), 16);
          if (!isNaN(hexNum)) return hexNum;
        } else if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
          const hexNum = parseInt('0x' + trimmed, 16);
          if (!isNaN(hexNum)) return hexNum;
        }
        const c = new THREE.Color(trimmed);
        return c.getHex();
      }
      return 0x365314;
    } catch (e) {
      console.warn('Error parsing color:', color, e);
      return 0x365314;
    }
  }

  public createFallbackSprite(textureUrl: string = '/images/commando_avatar.jpg') {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureUrl);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 1.5, 1.5);
    sprite.visible = false;
    this.root.add(sprite);
    this.fallbackSprite = sprite;
    return sprite;
  }

  /**
   * Initializes a high-fidelity 3D Holographic circular HUD segment display
   */
  public initHolographicHUD() {
    this.holoHUDGroup = new THREE.Group();
    this.healthSegments = [];
    this.ammoSegments = [];

    const isPerformanceMode = lodAndTextureOptimizer.getQuality() === 'low';

    // 1. Holographic Orbital Ring (Circular grid background)
    const ringGeo = new THREE.RingGeometry(0.55, 0.56, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      transparent: true,
      opacity: isPerformanceMode ? 0.15 : 0.35,
      side: THREE.DoubleSide
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    this.holoHUDGroup.add(orbitalRing);

    // 2. Holographic Health Segments (Emerald green) arranged in an arc on the left side
    // From angle PI*0.7 to PI*1.3
    const healthCount = 6;
    const startAngleH = Math.PI * 0.7;
    const endAngleH = Math.PI * 1.3;
    const healthMatActive = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald green
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < healthCount; i++) {
      const step = i / (healthCount - 1 || 1);
      const angle = startAngleH + step * (endAngleH - startAngleH);
      
      const segGeo = new THREE.RingGeometry(0.44, 0.50, 8, 1, angle - 0.04, 0.08);
      const segMesh = new THREE.Mesh(segGeo, healthMatActive.clone());
      this.holoHUDGroup.add(segMesh);
      this.healthSegments.push(segMesh);
    }

    // 3. Holographic Ammo Segments (Neon Cyan) arranged in an arc on the right side
    // From angle -PI*0.3 to PI*0.3
    const ammoCount = 10;
    const startAngleA = -Math.PI * 0.3;
    const endAngleA = Math.PI * 0.3;
    const ammoMatActive = new THREE.MeshBasicMaterial({
      color: 0x22d3ee, // Neon Cyan
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < ammoCount; i++) {
      const step = i / (ammoCount - 1 || 1);
      const angle = startAngleA + step * (endAngleA - startAngleA);

      const segGeo = new THREE.RingGeometry(0.44, 0.50, 8, 1, angle - 0.02, 0.04);
      const segMesh = new THREE.Mesh(segGeo, ammoMatActive.clone());
      this.holoHUDGroup.add(segMesh);
      this.ammoSegments.push(segMesh);
    }

    // 4. Center floating reticle / scope ring
    const reticleGeo = new THREE.RingGeometry(0.12, 0.14, 16);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: isPerformanceMode ? 0.2 : 0.45,
      side: THREE.DoubleSide
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    this.holoHUDGroup.add(reticle);

    // 5. Dynamic Holographic Numeric Canvas Texture Indicator
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const texture = new THREE.CanvasTexture(canvas);
        const textMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending // Glow/hologram blending look!
        });
        const textGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.set(0, 0, 0.02); // Slightly forward
        this.holoHUDGroup.add(textMesh);

        this.hudCanvas = canvas;
        this.hudCtx = ctx;
        this.hudTexture = texture;
        this.hudTextMesh = textMesh;
      }
    } catch (err) {
      console.warn('Holographic Canvas HUD creation bypassed:', err);
    }

    // Position the holo HUD so it floats above the weapon
    this.holoHUDGroup.position.set(0, 0.35, 0.05);
    
    // Default scale
    this.holoHUDGroup.scale.set(1.1, 1.1, 1.1);
  }

  /**
   * Updates the 3D holographic HUD state in real-time based on actual health and weapon ammo ratio
   */
  public updateHolographicHUD(healthRatio: number, ammoRatio: number, isPlayer: boolean) {
    if (!this.holoHUDGroup) {
      this.initHolographicHUD();
      this.weaponGroup.add(this.holoHUDGroup);
    }

    this.holoHUDGroup.visible = true;

    const isPerformanceMode = lodAndTextureOptimizer.getQuality() === 'low';

    // Scale HUD larger for local player so it's super prominent and glorious!
    const scaleFactor = isPlayer ? 1.25 : 0.75;
    this.holoHUDGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Update Health Segments
    const healthCount = this.healthSegments.length;
    for (let i = 0; i < healthCount; i++) {
      const segMesh = this.healthSegments[i];
      const mat = segMesh.material as THREE.MeshBasicMaterial;
      const step = (i + 1) / healthCount;
      if (step <= healthRatio) {
        if (healthRatio > 0.5) {
          mat.color.setHex(0x10b981); // Green
        } else if (healthRatio > 0.25) {
          mat.color.setHex(0xeab308); // Yellow
        } else {
          mat.color.setHex(0xef4444); // Red
        }
        mat.opacity = isPerformanceMode ? 0.75 : 0.95;
      } else {
        mat.color.setHex(0x374151); // Dark grey
        mat.opacity = isPerformanceMode ? 0.05 : 0.15;
      }
    }

    // Update Ammo Segments
    const ammoCount = this.ammoSegments.length;
    for (let i = 0; i < ammoCount; i++) {
      const segMesh = this.ammoSegments[i];
      const mat = segMesh.material as THREE.MeshBasicMaterial;
      const step = (i + 1) / ammoCount;
      if (step <= ammoRatio) {
        mat.color.setHex(0x22d3ee); // Cyan
        mat.opacity = isPerformanceMode ? 0.75 : 0.95;
      } else {
        mat.color.setHex(0x374151); // Dark grey
        mat.opacity = isPerformanceMode ? 0.05 : 0.15;
      }
    }

    // Redraw and update dynamic holographic numbers texture
    if (this.hudCtx && this.hudTexture) {
      const ctx = this.hudCtx;
      ctx.clearRect(0, 0, 128, 128);

      // 1. Draw glowing outer circular telemetry indicators
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(64, 64, 52, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw glowing HP (Emerald green/Yellow/Red depending on health)
      const hpColor = healthRatio > 0.5 ? '#10b981' : healthRatio > 0.25 ? '#fbbf24' : '#f87171';
      ctx.fillStyle = hpColor;
      ctx.shadowColor = hpColor;
      ctx.shadowBlur = isPerformanceMode ? 0 : 8;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      const hpPercent = Math.round(healthRatio * 100);
      ctx.fillText(`+${hpPercent}%`, 64, 50);

      // 3. Draw glowing AMMO (Cyan)
      const ammoColorHex = '#22d3ee';
      ctx.fillStyle = ammoColorHex;
      ctx.shadowColor = ammoColorHex;
      ctx.shadowBlur = isPerformanceMode ? 0 : 8;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      const maxAmmo = 30; // standard display cap
      const ammoCountValue = Math.round(ammoRatio * maxAmmo);
      ctx.fillText(`⚡${ammoCountValue}`, 64, 86);

      // 4. Low-Health Warning Pulsing Background
      if (healthRatio <= 0.25) {
        const warningPulse = Math.abs(Math.sin(Date.now() * 0.006));
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + warningPulse * 0.15})`;
        ctx.beginPath();
        ctx.arc(64, 64, 48, 0, Math.PI * 2);
        ctx.fill();

        // Draw 'DANGER' indicator
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('DANGER', 64, 110);
      }

      ctx.shadowBlur = 0; // reset shadow
      this.hudTexture.needsUpdate = true;
    }

    // Slowly rotate the entire holographic ring for high-tech orbital animation!
    this.holoHUDGroup.rotation.z += 0.008;
  }
}
