import * as THREE from 'three';
import {
  CharacterState,
  Projectile,
  WeaponType,
} from '../types';
import { MAP_WIDTH, MAP_HEIGHT, MapData } from './mapData';
import { ParticleSystem } from './particles';
import { ThreeSoldierBuilder } from './threeSoldierBuilder';
import { CharacterManager } from './characterManager';
import { lodAndTextureOptimizer } from '../utils/lodAndTextureOptimizer';
import { GameRenderer } from './renderer';
import { settingsManager } from '../utils/settingsManager';
import { WEAPON_CONFIGS } from './weapons';

export class ThreeGameRenderer {
  private container: HTMLDivElement;
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private characterManager: CharacterManager;

  // 3D Player Meshes (playerId -> ThreeSoldierBuilder)
  private soldierMeshes: Map<string, ThreeSoldierBuilder> = new Map();

  private isTabVisible = true;
  private handleVisibilityChange: () => void;

  public get areModelsLoaded(): boolean {
    // If no soldiers, we can't say they are loaded.
    if (this.soldierMeshes.size === 0) return false;
    // Check if all soldiers with GLTF models have finished loading.
    for (const soldier of this.soldierMeshes.values()) {
       if (soldier.gltfModelGroup && !soldier.isGLTFLoaded) return false;
    }
    return true;
  }

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.characterManager = new CharacterManager(this.soldierMeshes);
    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;

    // 1. Scene - Completely transparent to show 2D map canvas beneath!
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // 2. Camera - Orthographic to map 1:1 with 2D coordinates in pixels
    // Fixed centered bounds; we move camera and set zoom in render()
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer with alpha: true for transparent overlay
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(width, height);
    // Ensure the WebGL canvas element scales and stretches exactly like the 2D canvas
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.className = 'w-full h-full block pointer-events-none';
    this.renderer.setPixelRatio(lodAndTextureOptimizer.getOptimalPixelRatio());
    this.renderer.shadowMap.enabled = false;

    // Create absolute overlay container
    const threeWrapper = document.createElement('div');
    threeWrapper.className = 'absolute inset-0 w-full h-full overflow-hidden z-10 pointer-events-none';
    
    // Add the WebGL overlay on top of everything
    this.container.appendChild(threeWrapper);
    threeWrapper.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // 4. Add beautiful studio/combat lighting to illuminate 3D soldier avatars
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    mainDirLight.position.set(1, 1.5, 3);
    this.scene.add(mainDirLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.9); // Subtle cyan combat/cyber glow
    rimLight.position.set(-1, -0.5, 2);
    this.scene.add(rimLight);

    // Visibility change optimizations
    this.handleVisibilityChange = () => {
      this.isTabVisible = document.visibilityState !== 'hidden';
      if (this.isTabVisible) {
        this.clock.getDelta();
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public setDimensions(width: number, height: number) {
    if (!this.renderer) return;
    this.renderer.setSize(width, height);
  }

  /**
   * Stub method to keep compatibility with old 3D map triggers,
   * since we are now rendering the native 2D level.
   */
  public build3DOutpostLevel(map: MapData) {
    // No-op: Map is beautifully drawn in 2D beneath!
  }

  /**
   * Main 3D overlay render loop: aligns 3D camera to 2D view,
   * updates 3D character avatars/weapons, and renders on top of the 2D canvas.
   */
  public render(
    map: MapData,
    player: CharacterState,
    otherPlayers: CharacterState[],
    projectiles: Projectile[],
    particles: ParticleSystem,
    scopeLevel: number = 1,
    camera2DProvider: GameRenderer
  ) {
    if (!this.isTabVisible || !camera2DProvider) return;

    const rawDelta = this.clock.getDelta();
    const delta = lodAndTextureOptimizer.clampDelta(rawDelta, 0.0333);
    const elapsedTime = this.clock.getElapsedTime();

    // Dynamic quality control for Performance Mode toggle
    const isPerformanceMode = settingsManager.getSettings().performanceMode || false;
    if (isPerformanceMode) {
      lodAndTextureOptimizer.setQuality('low');
    } else {
      lodAndTextureOptimizer.autoDetectDeviceQuality();
    }

    // 1. Synchronize the 3D Orthographic Camera to the exact 2D camera viewport mathematically
    const cam2D = camera2DProvider.getCamera();
    const visibleW = cam2D.width;
    const visibleH = cam2D.height;

    const centerX2D = cam2D.x + (visibleW / cam2D.zoom) / 2;
    const centerY2D = cam2D.y + (visibleH / cam2D.zoom) / 2;

    const centerX3D = centerX2D;
    const centerY3D = MAP_HEIGHT - centerY2D;

    this.camera.left = -visibleW / 2;
    this.camera.right = visibleW / 2;
    this.camera.top = visibleH / 2;
    this.camera.bottom = -visibleH / 2;
    this.camera.zoom = cam2D.zoom;
    this.camera.position.set(centerX3D, centerY3D, 100);
    this.camera.lookAt(centerX3D, centerY3D, 0);
    this.camera.updateProjectionMatrix();

    // 2. Sync active player and bots
    const allCharacters = [player, ...otherPlayers];
    const activePlayerIds = new Set(allCharacters.map((c) => c.id));

    // Remove dead / disconnected players from the 3D scene
    for (const [id, sMesh] of this.soldierMeshes.entries()) {
      if (!activePlayerIds.has(id)) {
        this.scene.remove(sMesh.root);
        lodAndTextureOptimizer.disposeHierarchy(sMesh.root);
        this.soldierMeshes.delete(id);
      }
    }

    // Update or build 3D player meshes
    allCharacters.forEach((char) => {
      let sBuilder = this.soldierMeshes.get(char.id);
      const equippedEyewear = char.eyewear || (char.sunglasses ? 'aviators' : 'none');
      const equippedBeard = char.beard || 'none';
      const equippedJetpack = char.jetpackStyle || 'military_dual';
      const equippedTrail = char.trailColor || '#06b6d4';
      const equippedArmor = char.bodyArmor || 'molle_vest';
      const equippedCamo = char.camoColor || '#2d4a22';
      const equippedHeadgear = char.headgear || 'camo_helmet';
      const equippedSkin = char.skinTone || '#fbb587';
      const equippedWeapon = char.weapons?.[char.currentWeaponIndex] || 'pistol';

      if (!sBuilder) {
        sBuilder = new ThreeSoldierBuilder({
          camoColor: equippedCamo,
          headgear: equippedHeadgear,
          bodyArmor: equippedArmor,
          eyewear: equippedEyewear,
          beard: equippedBeard,
          jetpackStyle: equippedJetpack,
          trailColor: equippedTrail,
          weapon: equippedWeapon,
          skinTone: equippedSkin,
          enableClothingPhysics: !isPerformanceMode,
          gltfModelUrl: char.gltfModelUrl,
        });
        this.soldierMeshes.set(char.id, sBuilder);
        this.scene.add(sBuilder.root);
      } else {
        // Dynamic re-configuration in case they changed skin in real-time or Performance Mode was flipped
        // To avoid excessive rebuilds, only trigger build updates when structural styles change
        const currentName = sBuilder.weaponGroup.name || '';
        const structuralChanged = 
          (sBuilder.clothingPhysics.enabled === isPerformanceMode) || // if clothing physics toggle state differs
          (sBuilder.root.userData.headgear !== equippedHeadgear) ||
          (sBuilder.root.userData.bodyArmor !== equippedArmor) ||
          (sBuilder.root.userData.eyewear !== equippedEyewear) ||
          (sBuilder.root.userData.beard !== equippedBeard) ||
          (sBuilder.root.userData.camoColor !== equippedCamo) ||
          (sBuilder.root.userData.skinTone !== equippedSkin) ||
          (sBuilder.root.userData.gltfModelUrl !== char.gltfModelUrl);

        if (structuralChanged) {
          sBuilder.updateConfig({
            camoColor: equippedCamo,
            headgear: equippedHeadgear,
            bodyArmor: equippedArmor,
            eyewear: equippedEyewear,
            beard: equippedBeard,
            jetpackStyle: equippedJetpack,
            trailColor: equippedTrail,
            weapon: equippedWeapon,
            skinTone: equippedSkin,
            enableClothingPhysics: !isPerformanceMode,
            gltfModelUrl: char.gltfModelUrl,
          });
        }
      }

      // Store structural properties to prevent redundant rebuilds
      sBuilder.root.userData = {
        headgear: equippedHeadgear,
        bodyArmor: equippedArmor,
        eyewear: equippedEyewear,
        beard: equippedBeard,
        camoColor: equippedCamo,
        skinTone: equippedSkin,
        gltfModelUrl: char.gltfModelUrl,
      };

      // Handle visibility and fallback via CharacterManager
      this.characterManager.updateCharacterVisibility(char, sBuilder);

      // Position in 3D Space (aligning foot/base position to standard 3D Y coordinates)
      const px = char.x + char.width / 2;
      const py = MAP_HEIGHT - (char.y + char.height);
      sBuilder.root.position.set(px, py, 0);

      // Scale model to match character height in 2D pixels (ThreeSoldierBuilder is ~1.8 units tall)
      const scaleFactor = char.height / 1.8;
      sBuilder.root.scale.set(scaleFactor, scaleFactor, scaleFactor);
      
      // Update visibility using CharacterManager
      this.characterManager.updateCharacterVisibility(char, sBuilder);

      // Update weapon model if changed
      const currWeapon = char.weapons?.[char.currentWeaponIndex] || 'pistol';
      if (sBuilder.weaponGroup.name !== currWeapon) {
        sBuilder.build3DWeapon(currWeapon);
        sBuilder.weaponGroup.name = currWeapon;
      }

      // Facing direction & aiming
      sBuilder.root.rotation.y = char.facingRight ? 0 : Math.PI;
      sBuilder.setAimPose(char.aimAngle || 0);
      sBuilder.setJetpackActive(char.isJetpacking || false);

      // Compute and update the 3D Holographic HUD
      const healthRatio = char.health / char.maxHealth;
      const configWeapon = WEAPON_CONFIGS[currWeapon as WeaponType];
      const maxMagazine = configWeapon ? configWeapon.magazineSize : 10;
      const currentAmmo = char.ammo[currWeapon as WeaponType] !== undefined ? char.ammo[currWeapon as WeaponType] : maxMagazine;
      const ammoRatio = Math.min(1.0, currentAmmo / maxMagazine);

      sBuilder.updateHolographicHUD(healthRatio, ammoRatio, char.isPlayer);

      // Trigger weapon firing muzzle flash
      if (char.muzzleFlashTimer && char.muzzleFlashTimer > 0) {
        sBuilder.triggerMuzzleFlash();
      }

      // Procedural animations based on movement states
      let poseName = 'idle';
      if (char.isJetpacking) {
        poseName = 'flight';
      } else if (Math.abs(char.vx) > 0.8) {
        poseName = 'run';
      } else if (!char.isGrounded) {
        poseName = 'jump';
      } else if (char.isCrouching) {
        poseName = 'crouch';
      } else if (char.isReloading) {
        poseName = 'reload';
      }
      sBuilder.updateAnimationState(poseName, elapsedTime, delta);
      sBuilder.updatePhysics(sBuilder.root.rotation.y, delta);
    });

    // 3. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  public cleanup() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    this.soldierMeshes.forEach((s) => {
      lodAndTextureOptimizer.disposeHierarchy(s.root);
    });
    this.soldierMeshes.clear();

    lodAndTextureOptimizer.disposeRenderer(this.renderer);
  }
}
