import * as THREE from 'three';

export type PreviewEnvironmentType = 'training_grounds' | 'military_bunker' | 'tech_lab';

export interface EnvironmentMetadata {
  id: PreviewEnvironmentType;
  nameEn: string;
  nameAr: string;
  descriptionAr: string;
  themeColor: string;
  badge: string;
  iconName: string;
  bgGradientCss: string;
}

export const PREVIEW_ENVIRONMENTS: Record<PreviewEnvironmentType, EnvironmentMetadata> = {
  training_grounds: {
    id: 'training_grounds',
    nameEn: 'Training Grounds',
    nameAr: 'ميادين التدريب الميدانية',
    descriptionAr: 'منطقة تدريب وتصويب تكتيكية مفتوحة مع سواتر رملية وأهداف خشبية وإضاءة شمسية دافئة',
    themeColor: '#f59e0b',
    badge: 'طبيعة وتدريب',
    iconName: 'Target',
    bgGradientCss: 'from-[#1c1917] via-[#292524] to-[#0c0a09]',
  },
  military_bunker: {
    id: 'military_bunker',
    nameEn: 'Military Bunker',
    nameAr: 'المخبأ العسكري المصفح',
    descriptionAr: 'حصن دفاعي تحت الأرض مع صفائح فولاذ مصفحة وأضواء إنذار حمراء وصناديق ذخيرة ثقيلة',
    themeColor: '#ef4444',
    badge: 'حصن عمليات',
    iconName: 'Shield',
    bgGradientCss: 'from-[#18181b] via-[#09090b] to-[#030712]',
  },
  tech_lab: {
    id: 'tech_lab',
    nameEn: 'Technological Lab',
    nameAr: 'المختبر التقني المتطور',
    descriptionAr: 'غرفة أبحاث سيبرانية متقدمة مزودة بشبكات ليزر هولوجرافية وأعمدة طاقة بلازمية فائقة',
    themeColor: '#06b6d4',
    badge: 'سيبراني متطور',
    iconName: 'Cpu',
    bgGradientCss: 'from-[#082f49] via-[#020617] to-[#030712]',
  },
};

export interface EnvironmentInstance {
  group: THREE.Group;
  update: (delta: number, time: number) => void;
  cleanup: () => void;
}

export function createEnvironmentBackdrop(type: PreviewEnvironmentType): EnvironmentInstance {
  const group = new THREE.Group();
  group.name = `env_${type}`;

  const animatedMeshes: Array<{
    mesh: THREE.Object3D;
    animType: 'rotateY' | 'pulseScale' | 'float' | 'beaconLight' | 'particles';
    speed: number;
    baseScale?: number;
    baseY?: number;
  }> = [];

  const lights: THREE.Light[] = [];

  if (type === 'training_grounds') {
    // ----------------------------------------------------
    // 1. TRAINING GROUNDS ENVIRONMENT (Desert Field)
    // ----------------------------------------------------
    // Ambient & Sun Lighting
    const amb = new THREE.AmbientLight(0xffedd5, 0.9);
    lights.push(amb);
    group.add(amb);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.8);
    sun.position.set(4, 6, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.bias = -0.001;
    lights.push(sun);
    group.add(sun);

    const skyFill = new THREE.DirectionalLight(0x93c5fd, 0.8);
    skyFill.position.set(-4, 3, -3);
    lights.push(skyFill);
    group.add(skyFill);

    const groundBounce = new THREE.PointLight(0xd97706, 0.6, 6);
    groundBounce.position.set(0, -0.2, 0);
    lights.push(groundBounce);
    group.add(groundBounce);

    // Distant Background Mountain Silhouette
    const bgWallGeo = new THREE.CylinderGeometry(8, 8, 5, 24, 1, true, -Math.PI * 0.7, Math.PI * 1.4);
    const bgWallMat = new THREE.MeshBasicMaterial({
      color: 0x292524,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.85,
    });
    const bgWall = new THREE.Mesh(bgWallGeo, bgWallMat);
    bgWall.position.set(0, 1.5, 0);
    group.add(bgWall);

    // Sandbag Fortification Left Stack
    const sandbagMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.95,
      metalness: 0.05,
    });

    const createSandbag = (x: number, y: number, z: number, rotY: number) => {
      const bagGeo = new THREE.BoxGeometry(0.5, 0.16, 0.28);
      const bagMesh = new THREE.Mesh(bagGeo, sandbagMat);
      bagMesh.position.set(x, y, z);
      bagMesh.rotation.y = rotY;
      bagMesh.castShadow = true;
      bagMesh.receiveShadow = true;
      group.add(bagMesh);
    };

    // Left sandbag bunker
    createSandbag(-1.8, 0.1, -1.2, 0.4);
    createSandbag(-1.5, 0.1, -1.4, 0.6);
    createSandbag(-1.65, 0.26, -1.3, 0.5);
    createSandbag(-1.9, 0.26, -1.0, 0.3);

    // Right sandbag bunker
    createSandbag(1.8, 0.1, -1.1, -0.4);
    createSandbag(1.5, 0.1, -1.3, -0.6);
    createSandbag(1.65, 0.26, -1.2, -0.5);

    // Wooden Shooting Target Dummies
    const targetStandMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const targetBoardMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 });
    const targetRedMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const createTarget = (x: number, z: number, rotY: number) => {
      const targetGroup = new THREE.Group();
      targetGroup.position.set(x, 0, z);
      targetGroup.rotation.y = rotY;

      // Wooden Post
      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
      const post = new THREE.Mesh(postGeo, targetStandMat);
      post.position.y = 0.8;
      post.castShadow = true;
      targetGroup.add(post);

      // Target Board Silhouette (Head + Torso)
      const boardGeo = new THREE.BoxGeometry(0.48, 0.65, 0.04);
      const board = new THREE.Mesh(boardGeo, targetBoardMat);
      board.position.y = 1.05;
      board.castShadow = true;
      targetGroup.add(board);

      // Bullseye Rings
      const ring1Geo = new THREE.RingGeometry(0.08, 0.14, 16);
      const ring1 = new THREE.Mesh(ring1Geo, targetRedMat);
      ring1.position.set(0, 1.05, 0.025);
      targetGroup.add(ring1);

      const ring2Geo = new THREE.CircleGeometry(0.04, 16);
      const ring2 = new THREE.Mesh(ring2Geo, targetRedMat);
      ring2.position.set(0, 1.05, 0.026);
      targetGroup.add(ring2);

      group.add(targetGroup);
    };

    createTarget(-1.3, -1.9, 0.3);
    createTarget(1.4, -2.1, -0.3);

    // Steel Anti-Tank Hedgehogs (Czech Hedgehog)
    const steelBeamMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.8,
      roughness: 0.4,
    });

    const createHedgehog = (x: number, y: number, z: number) => {
      const hGroup = new THREE.Group();
      hGroup.position.set(x, y, z);
      const beamGeo = new THREE.BoxGeometry(0.08, 0.7, 0.08);

      const b1 = new THREE.Mesh(beamGeo, steelBeamMat);
      b1.rotation.z = Math.PI / 4;
      hGroup.add(b1);

      const b2 = new THREE.Mesh(beamGeo, steelBeamMat);
      b2.rotation.z = -Math.PI / 4;
      hGroup.add(b2);

      const b3 = new THREE.Mesh(beamGeo, steelBeamMat);
      b3.rotation.x = Math.PI / 4;
      hGroup.add(b3);

      hGroup.scale.set(0.85, 0.85, 0.85);
      group.add(hGroup);
    };

    createHedgehog(2.1, 0.25, 0.2);

    // Military Fuel Barrel Drum
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x3f6212,
      metalness: 0.6,
      roughness: 0.35,
    });
    const barrelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.75, 18);
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(-2.0, 0.38, 0.2);
    barrel.castShadow = true;
    group.add(barrel);

    // Floating Dust Motes Particle System
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;
      positions[i + 1] = Math.random() * 3.5;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    group.add(dustParticles);
    animatedMeshes.push({ mesh: dustParticles, animType: 'particles', speed: 0.2 });

  } else if (type === 'military_bunker') {
    // ----------------------------------------------------
    // 2. MILITARY BUNKER ENVIRONMENT (Heavy Steel Vault)
    // ----------------------------------------------------
    // Industrial Moody Lighting with Warning Beacons
    const amb = new THREE.AmbientLight(0x27272a, 0.8);
    lights.push(amb);
    group.add(amb);

    const mainOverhead = new THREE.SpotLight(0xf8fafc, 2.0, 10, Math.PI / 4, 0.4);
    mainOverhead.position.set(0, 5, 2);
    mainOverhead.castShadow = true;
    lights.push(mainOverhead);
    group.add(mainOverhead);

    // Emergency Red Beacon Point Light
    const alertLight1 = new THREE.PointLight(0xef4444, 2.5, 7);
    alertLight1.position.set(-2.2, 2.0, -1.5);
    lights.push(alertLight1);
    group.add(alertLight1);

    const alertLight2 = new THREE.PointLight(0xf59e0b, 1.8, 6);
    alertLight2.position.set(2.2, 1.8, -1.5);
    lights.push(alertLight2);
    group.add(alertLight2);

    // Steel Wall Plate Backdrop
    const steelWallMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.9,
      roughness: 0.3,
    });
    const wallGeo = new THREE.BoxGeometry(7, 4.5, 0.2);
    const wallMesh = new THREE.Mesh(wallGeo, steelWallMat);
    wallMesh.position.set(0, 2.0, -2.6);
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    // Hazard Caution Stripes on Wall
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = -5; i <= 5; i++) {
      const stripeGeo = new THREE.PlaneGeometry(0.12, 0.5);
      const stripe = new THREE.Mesh(stripeGeo, hazardMat);
      stripe.position.set(i * 0.4, 0.4, -2.48);
      stripe.rotation.z = Math.PI / 4;
      group.add(stripe);
    }

    // Heavy Industrial Steel I-Beams / Pillars
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.85,
      roughness: 0.25,
    });

    const createColumn = (x: number) => {
      const colGeo = new THREE.BoxGeometry(0.4, 4.5, 0.4);
      const col = new THREE.Mesh(colGeo, beamMat);
      col.position.set(x, 2.0, -2.4);
      col.castShadow = true;
      group.add(col);

      // Warning Beacon Cage on Column
      const beaconHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9 })
      );
      beaconHousing.position.set(x > 0 ? x - 0.25 : x + 0.25, 2.2, -2.2);

      const beaconBulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ color: x > 0 ? 0xf59e0b : 0xef4444 })
      );
      beaconBulb.position.copy(beaconHousing.position);
      group.add(beaconHousing);
      group.add(beaconBulb);
      animatedMeshes.push({ mesh: beaconBulb, animType: 'beaconLight', speed: 4.0 });
    };

    createColumn(-2.4);
    createColumn(2.4);

    // Reinforced Military Ammo Crates
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      metalness: 0.7,
      roughness: 0.4,
    });
    const crateMetalBand = new THREE.MeshStandardMaterial({
      color: 0x71717a,
      metalness: 0.95,
      roughness: 0.2,
    });

    const createCrate = (x: number, y: number, z: number, rotY: number) => {
      const crateGroup = new THREE.Group();
      crateGroup.position.set(x, y, z);
      crateGroup.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.45), crateMat);
      body.castShadow = true;
      crateGroup.add(body);

      const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.47, 0.08), crateMetalBand);
      crateGroup.add(band1);

      group.add(crateGroup);
    };

    createCrate(-1.8, 0.22, -1.2, 0.3);
    createCrate(-1.6, 0.65, -1.1, -0.1);
    createCrate(1.9, 0.22, -1.0, -0.4);

    // Thick Power Conduits / Heavy Pipes on Floor
    const pipeGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.0, 16);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.9, roughness: 0.2 });
    const pipe1 = new THREE.Mesh(pipeGeo, pipeMat);
    pipe1.position.set(0, 0.06, -2.1);
    group.add(pipe1);

    const pipe2 = new THREE.Mesh(pipeGeo, pipeMat);
    pipe2.position.set(0, 0.18, -2.15);
    group.add(pipe2);

    // Floor Exhaust Heat Glow Points
    const exhaustGeo = new THREE.PlaneGeometry(1.2, 0.6);
    exhaustGeo.rotateX(-Math.PI / 2);
    const exhaustMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
    });
    const exhaustMesh = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaustMesh.position.set(0, 0.005, -1.4);
    group.add(exhaustMesh);

  } else {
    // ----------------------------------------------------
    // 3. TECHNOLOGICAL LAB ENVIRONMENT (Cyber Research)
    // ----------------------------------------------------
    // Cyber Clean Lighting
    const amb = new THREE.AmbientLight(0x082f49, 1.0);
    lights.push(amb);
    group.add(amb);

    const labKey = new THREE.DirectionalLight(0xe0f2fe, 1.8);
    labKey.position.set(2, 5, 3);
    labKey.castShadow = true;
    lights.push(labKey);
    group.add(labKey);

    // Cyan & Magenta Cyber Dual Rim Lights
    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 2.4);
    cyanRim.position.set(-3.5, 2.5, -2.5);
    lights.push(cyanRim);
    group.add(cyanRim);

    const magentaRim = new THREE.DirectionalLight(0xd946ef, 1.9);
    magentaRim.position.set(3.5, 2.0, -2.5);
    lights.push(magentaRim);
    group.add(magentaRim);

    // Cyber Hologram Backdrop Ring
    const holoRingGeo = new THREE.TorusGeometry(2.4, 0.025, 16, 64);
    const holoRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.75,
    });
    const holoRing1 = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing1.position.set(0, 1.6, -1.8);
    group.add(holoRing1);
    animatedMeshes.push({ mesh: holoRing1, animType: 'rotateY', speed: 0.4 });

    const holoRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.02, 16, 48), new THREE.MeshBasicMaterial({ color: 0xd946ef, transparent: true, opacity: 0.6 }));
    holoRing2.position.set(0, 1.6, -1.75);
    holoRing2.rotation.x = Math.PI / 6;
    group.add(holoRing2);
    animatedMeshes.push({ mesh: holoRing2, animType: 'rotateY', speed: -0.6 });

    // Floating Cyber Data Hex Grid Target
    const hexPlaneGeo = new THREE.RingGeometry(0.8, 0.85, 6);
    const hexPlaneMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const hexMesh = new THREE.Mesh(hexPlaneGeo, hexPlaneMat);
    hexMesh.position.set(0, 1.6, -1.7);
    group.add(hexMesh);
    animatedMeshes.push({ mesh: hexMesh, animType: 'pulseScale', speed: 2.0, baseScale: 1.0 });

    // Cyber Energy Columns / Plasma Cores
    const colGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0369a1,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.5,
    });
    const plasmaCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

    const createCyberPillar = (x: number, z: number) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(x, 0, z);

      // Glass Cylinder
      const cylGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 16);
      const cyl = new THREE.Mesh(cylGeo, colGlassMat);
      cyl.position.y = 1.6;
      pGroup.add(cyl);

      // Inner Glowing Core
      const coreGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.8, 8);
      const core = new THREE.Mesh(coreGeo, plasmaCoreMat);
      core.position.y = 1.6;
      pGroup.add(core);

      // Top and Bottom Metal Caps
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const capBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.15, 16), capMat);
      capBottom.position.y = 0.075;
      pGroup.add(capBottom);

      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.15, 16), capMat);
      capTop.position.y = 3.125;
      pGroup.add(capTop);

      group.add(pGroup);
      animatedMeshes.push({ mesh: core, animType: 'pulseScale', speed: 3.5, baseScale: 1.0 });
    };

    createCyberPillar(-2.3, -1.5);
    createCyberPillar(2.3, -1.5);

    // Floating Cyber Particles (Quantum Sparks)
    const qCount = 50;
    const qGeo = new THREE.BufferGeometry();
    const qPos = new Float32Array(qCount * 3);
    for (let i = 0; i < qCount * 3; i += 3) {
      qPos[i] = (Math.random() - 0.5) * 5;
      qPos[i + 1] = Math.random() * 3.2;
      qPos[i + 2] = (Math.random() - 0.5) * 4;
    }
    qGeo.setAttribute('position', new THREE.BufferAttribute(qPos, 3));
    const qMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const quantumParticles = new THREE.Points(qGeo, qMat);
    group.add(quantumParticles);
    animatedMeshes.push({ mesh: quantumParticles, animType: 'particles', speed: 0.4 });
  }

  // Unified Update Loop
  const update = (delta: number, time: number) => {
    for (const item of animatedMeshes) {
      if (item.animType === 'rotateY') {
        item.mesh.rotation.y += delta * item.speed;
      } else if (item.animType === 'pulseScale') {
        const s = (item.baseScale || 1.0) + Math.sin(time * item.speed) * 0.08;
        item.mesh.scale.set(s, s, s);
      } else if (item.animType === 'beaconLight') {
        const mat = (item.mesh as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.4 + Math.abs(Math.sin(time * item.speed)) * 0.6;
        }
      } else if (item.animType === 'particles') {
        item.mesh.rotation.y = time * 0.05 * item.speed;
        const pts = item.mesh as THREE.Points;
        if (pts.geometry) {
          const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
          if (pos) {
            for (let i = 1; i < pos.count * 3; i += 3) {
              let y = pos.array[i] + delta * item.speed;
              if (y > 3.4) y = 0.1;
              pos.array[i] = y;
            }
            pos.needsUpdate = true;
          }
        }
      }
    }
  };

  const cleanup = () => {
    for (const l of lights) {
      if (l && l.dispose) {
        l.dispose();
      }
    }
    lights.length = 0;
    animatedMeshes.length = 0;

    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              m.dispose();
              if ((m as any).map) (m as any).map.dispose();
            });
          } else {
            mesh.material.dispose();
            if ((mesh.material as any).map) (mesh.material as any).map.dispose();
          }
        }
      } else if ((obj as THREE.Light).isLight) {
        if ((obj as THREE.Light).dispose) (obj as THREE.Light).dispose();
      }
    });

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
  };

  return { group, update, cleanup };
}
