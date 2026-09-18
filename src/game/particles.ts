import { Particle, FloatingText, BloodDecal, Platform } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private decals: BloodDecal[] = [];
  private nextTextId = 1;
  private nextDecalId = 1;
  private readonly MAX_DECALS = 200;

  public update(dt: number, platforms?: Platform[]) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Movement
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Rotation
      if (p.rotationSpeed !== undefined) {
        p.rotation = (p.rotation || 0) + p.rotationSpeed * dt;
      }

      // Type-specific physics & visual transitions
      if (p.type === 'smoke') {
        p.vy -= 22 * dt; // Smoke rises
        p.vx *= 0.95;
        p.radius += (p.growth || 12) * dt;
        p.alpha = Math.max(0, (1 - p.life / p.maxLife) * 0.85);
      } else if (p.type === 'fire') {
        p.vy -= 40 * dt;
        p.radius = Math.max(0.5, p.radius - 6 * dt);
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      } else if (p.type === 'subterranean-dust') {
        p.vy = 14 + Math.sin(p.life * 2) * 4; // Gentle downward drift
        p.vx = Math.sin(p.life * 3.5 + p.x * 0.01) * 18; // Side swaying
        p.alpha = Math.max(0, Math.sin((p.life / p.maxLife) * Math.PI) * 0.65);
      } else if (p.type === 'dust') {
        p.vy -= 8 * dt;
        p.vx *= 0.92;
        p.radius += (p.growth || 10) * dt;
        p.alpha = Math.max(0, (1 - p.life / p.maxLife) * 0.65);
      } else if (p.type === 'blood') {
        p.vy += 680 * dt; // Gravity on blood droplet
        p.vx *= 0.95;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife) * 0.5);

        // Check platform collision to spawn surface splat decal!
        if (platforms) {
          for (const plat of platforms) {
            if (
              p.x >= plat.x &&
              p.x <= plat.x + plat.width &&
              p.y >= plat.y &&
              p.y <= plat.y + plat.height
            ) {
              // Hit a rock/ground surface - turn into persistent surface blood splat!
              this.addBloodSplatDecal(p.x, p.y, p.color, p.radius * 1.5, p.vx, p.vy);
              this.particles.splice(i, 1);
              break;
            }
          }
        }
      } else if (p.type === 'debris') {
        p.vy += 700 * dt; // Gravity
        p.vx *= 0.97;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      } else if (p.type === 'splinter') {
        p.vy += 650 * dt; // Gravity on wood splinter
        p.vx *= 0.96;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      } else if (p.type === 'shockwave') {
        p.radius += (p.growth || 280) * dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      } else if (p.type === 'casing') {
        p.vy += 850 * dt; // Gravity on brass casing
        p.vx *= 0.96;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife) * 0.4);
      } else if (p.type === 'magazine') {
        p.vy += 920 * dt; // Gravity on metal/polymer dropped magazine
        p.vx *= 0.95;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife) * 0.2);
        
        // Bounce off ground platforms
        if (platforms) {
          for (const plat of platforms) {
            if (
              p.x >= plat.x &&
              p.x <= plat.x + plat.width &&
              p.y >= plat.y &&
              p.y <= plat.y + plat.height &&
              p.vy > 0
            ) {
              p.y = plat.y - 1;
              p.vy = -p.vy * 0.35; // bounce up slightly
              p.vx *= 0.6;
              if (p.rotationSpeed) p.rotationSpeed *= -0.5;
              break;
            }
          }
        }
      } else {
        // Spark / Flash / Muzzle particle: drag + gravity on embers
        p.vx *= 0.94;
        p.vy += 320 * dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life += dt;
      if (t.life >= 1.1) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
      t.vy *= 0.94;
      t.alpha = Math.max(0, 1 - t.life / 1.1);
    }

    // Update Blood Decals (drying & aging)
    for (let i = this.decals.length - 1; i >= 0; i--) {
      const d = this.decals[i];
      d.life += dt;
      if (d.life >= d.maxLife) {
        this.decals.splice(i, 1);
        continue;
      }
      if (d.life > d.maxLife * 0.7) {
        // Slowly dry and fade out in the final 30% of lifespan
        const fadeProg = (d.life - d.maxLife * 0.7) / (d.maxLife * 0.3);
        d.alpha = Math.max(0, (1 - fadeProg) * 0.85);
      }
    }
  }

  public spawnSubterraneanDust(camX: number, camY: number, camW: number, camH: number) {
    if (camY + camH < 1100) return; // Only underground
    if (this.particles.filter(p => p.type === 'subterranean-dust').length > 40) return;

    if (Math.random() < 0.35) {
      this.particles.push({
        x: camX + Math.random() * camW,
        y: Math.max(1200, camY - 50 + Math.random() * 50),
        vx: 0,
        vy: 10,
        radius: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.4 ? 'rgba(214, 211, 196, 0.7)' : 'rgba(245, 238, 220, 0.85)',
        alpha: 0.6,
        life: 0,
        maxLife: 4 + Math.random() * 4,
        type: 'subterranean-dust',
      });
    }
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public getFloatingTexts(): FloatingText[] {
    return this.floatingTexts;
  }

  public getDecals(): BloodDecal[] {
    return this.decals;
  }

  /**
   * Spawns a procedural cartoon blood splat decal on stone/ground surface
   */
  public addBloodSplatDecal(
    x: number,
    y: number,
    baseColor: string = '#991b1b',
    radius: number = 6,
    impactVx: number = 0,
    impactVy: number = 0
  ) {
    if (this.decals.length >= this.MAX_DECALS) {
      this.decals.shift(); // Remove oldest to preserve 60fps performance
    }

    const splatPoints: { dx: number; dy: number; r: number }[] = [];
    const pointCount = 3 + Math.floor(Math.random() * 4);
    
    // Generate organic directional blood droplets surrounding the main impact pool
    const impactAngle = Math.atan2(impactVy, impactVx);
    for (let p = 0; p < pointCount; p++) {
      const angle = impactAngle + (Math.random() * 1.8 - 0.9);
      const dist = (radius * 0.6) + Math.random() * (radius * 1.4);
      splatPoints.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        r: Math.max(1.2, radius * (0.25 + Math.random() * 0.45)),
      });
    }

    const colorVariants = ['#7f1d1d', '#991b1b', '#b91c1c', '#6b1313'];
    const chosenColor = colorVariants[Math.floor(Math.random() * colorVariants.length)] || baseColor;

    this.decals.push({
      id: this.nextDecalId++,
      x,
      y,
      radius: Math.max(3, Math.min(14, radius)),
      color: chosenColor,
      alpha: 0.88,
      life: 0,
      maxLife: 28 + Math.random() * 16, // Stays for ~35-45 seconds
      splatPoints,
      dripLength: Math.random() > 0.6 ? 4 + Math.random() * 10 : 0,
    });
  }

  /**
   * Iconic Doodle Army 2 Jetpack Propulsion
   */
  public addJetpackEffect(x: number, y: number, isRight: boolean, nearGround: boolean = false) {
    const nozzleX = isRight ? x - 13 : x + 13;
    const nozzleY = y + 16;

    // 1. High-velocity Jet Flames (Dual orange & cyan core)
    const flameColor = Math.random() > 0.4 ? '#f97316' : '#38bdf8';
    this.particles.push({
      x: nozzleX + (Math.random() * 6 - 3),
      y: nozzleY,
      vx: (Math.random() * 36 - 18),
      vy: 200 + Math.random() * 140,
      radius: 4.5 + Math.random() * 3,
      color: flameColor,
      alpha: 0.95,
      life: 0,
      maxLife: 0.16 + Math.random() * 0.08,
      type: 'fire',
    });

    // Inner bright yellow flame needle
    this.particles.push({
      x: nozzleX + (Math.random() * 3 - 1.5),
      y: nozzleY,
      vx: (Math.random() * 14 - 7),
      vy: 240 + Math.random() * 100,
      radius: 2.5,
      color: '#fef08a',
      alpha: 1,
      life: 0,
      maxLife: 0.12,
      type: 'spark',
    });

    // 2. Billowing Cartoon White / Slate Smoke Cloud Rings
    if (Math.random() < 0.6) {
      this.particles.push({
        x: nozzleX + (Math.random() * 6 - 3),
        y: nozzleY + 12,
        vx: (Math.random() * 45 - 22.5),
        vy: 45 + Math.random() * 50,
        radius: 6,
        color: Math.random() > 0.3 ? '#cbd5e1' : '#94a3b8',
        alpha: 0.75,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        type: 'smoke',
        growth: 22,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 4,
      });
    }

    // 3. Ground Dust Kickup if boosting near ground
    if (nearGround || Math.random() < 0.25) {
      this.particles.push({
        x: nozzleX + (Math.random() * 20 - 10),
        y: nozzleY + 30,
        vx: (Math.random() * 70 - 35),
        vy: -(10 + Math.random() * 25),
        radius: 5,
        color: '#b5ab9b',
        alpha: 0.5,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        type: 'dust',
        growth: 14,
      });
    }
  }

  public addLandingDust(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y - 2,
        vx: dir * (30 + Math.random() * 70),
        vy: -(12 + Math.random() * 22),
        radius: 4.5 + Math.random() * 3,
        color: '#b5ab9b',
        alpha: 0.65,
        life: 0,
        maxLife: 0.35,
        type: 'dust',
        growth: 14,
      });
    }
  }

  public addWoodenDebris(x: number, y: number) {
    const woodColors = ['#a16207', '#b45309', '#92400e', '#78350f', '#d97706'];
    const count = 12 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 140 + Math.random() * 240;
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 16 - 8),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120, // biased upward
        radius: 3 + Math.random() * 4,
        color: woodColors[Math.floor(Math.random() * woodColors.length)],
        alpha: 1.0,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.5,
        type: 'splinter',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 14,
        width: 7 + Math.random() * 8,
        height: 4 + Math.random() * 6,
      });
    }

    // Add wooden dust cloud puff
    for (let d = 0; d < 5; d++) {
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: (Math.random() * 60 - 30),
        vy: -(25 + Math.random() * 45),
        radius: 10 + Math.random() * 6,
        color: '#d97706',
        alpha: 0.65,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.3,
        type: 'smoke',
        growth: 20,
      });
    }
  }

  /**
   * Spawns an authentic dropped weapon magazine that ejects during reload
   */
  public addMagazineDrop(x: number, y: number, isRight: boolean, weapon: string) {
    const dir = isRight ? -1 : 1;
    let magColor = '#1e293b';
    let magWidth = 5;
    let magHeight = 10;

    if (weapon === 'pistol') {
      magColor = '#334155';
      magWidth = 3.5;
      magHeight = 7;
    } else if (weapon === 'rifle') {
      magColor = '#475569';
      magWidth = 5;
      magHeight = 12;
    } else if (weapon === 'sniper') {
      magColor = '#0f172a';
      magWidth = 6;
      magHeight = 11;
    } else if (weapon === 'shotgun') {
      // 12 gauge shell red hull
      magColor = '#dc2626';
      magWidth = 3.5;
      magHeight = 8;
    } else if (weapon === 'rocket') {
      magColor = '#14532d';
      magWidth = 8;
      magHeight = 14;
    }

    this.particles.push({
      x: x + (isRight ? 6 : -6),
      y: y + 8,
      vx: dir * (30 + Math.random() * 40),
      vy: 10 + Math.random() * 30,
      radius: 4,
      color: magColor,
      alpha: 0.95,
      life: 0,
      maxLife: 2.2 + Math.random() * 0.6,
      type: 'magazine',
      rotation: (Math.random() - 0.5) * 0.5,
      rotationSpeed: dir * (4 + Math.random() * 6),
      width: magWidth,
      height: magHeight,
    });

    // Small dust or slide click puff
    this.particles.push({
      x: x + (isRight ? 6 : -6),
      y: y + 8,
      vx: (Math.random() - 0.5) * 20,
      vy: -15,
      radius: 4,
      color: '#cbd5e1',
      alpha: 0.5,
      life: 0,
      maxLife: 0.25,
      type: 'smoke',
      growth: 12,
    });
  }

  /**
   * Weapon Muzzle Flash, Dynamic Gunpowder Smoke, Spark Streaks & Shell Casings tailored per weapon type
   */
  public addWeaponFireEffect(
    weaponType: string,
    barrelX: number,
    barrelY: number,
    aimAngle: number,
    gunOriginX: number,
    gunOriginY: number,
    isRight: boolean
  ) {
    if (weaponType === 'shotgun') {
      // Shotgun: Huge explosive blast cone! 14 incandescent spark needles, fiery tongue, expanding dual smoke puffs
      for (let i = 0; i < 14; i++) {
        const spreadAngle = aimAngle + (Math.random() * 0.9 - 0.45);
        const speed = 180 + Math.random() * 320;
        const sparkColors = ['#fef08a', '#fde047', '#f59e0b', '#ef4444', '#ffffff'];
        this.particles.push({
          x: barrelX,
          y: barrelY,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          radius: 3.2 + Math.random() * 3.5,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          alpha: 1,
          life: 0,
          maxLife: 0.14 + Math.random() * 0.1,
          type: 'spark',
        });
      }

      // Fiery muzzle core flame
      this.particles.push({
        x: barrelX + Math.cos(aimAngle) * 6,
        y: barrelY + Math.sin(aimAngle) * 6,
        vx: Math.cos(aimAngle) * 90,
        vy: Math.sin(aimAngle) * 90,
        radius: 12,
        color: '#f97316',
        alpha: 0.95,
        life: 0,
        maxLife: 0.12,
        type: 'fire',
      });

      // Dense billowing gunpowder smoke cloud ring
      for (let s = 0; s < 3; s++) {
        const sSpread = aimAngle + (Math.random() * 0.6 - 0.3);
        this.particles.push({
          x: barrelX + Math.cos(aimAngle) * (6 + s * 10),
          y: barrelY + Math.sin(aimAngle) * (6 + s * 10),
          vx: Math.cos(sSpread) * (50 + s * 25),
          vy: Math.sin(sSpread) * (50 + s * 25) - 15,
          radius: 9 + s * 3,
          color: Math.random() > 0.4 ? '#cbd5e1' : '#94a3b8',
          alpha: 0.75,
          life: 0,
          maxLife: 0.38 + Math.random() * 0.2,
          type: 'smoke',
          growth: 28,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 5,
        });
      }

      // Red shotgun hull shell casing with brass base
      this.addShellCasing(gunOriginX, gunOriginY, isRight, '#dc2626', 4, 7);

    } else if (weaponType === 'sniper') {
      // Sniper Rifle (AWM): Supersonic muzzle brake discharge!
      // 1. Lateral high-velocity gas jets (sparks and smoke shooting out perpendicular from the muzzle brake)
      const leftVentAngle = aimAngle - Math.PI * 0.45;
      const rightVentAngle = aimAngle + Math.PI * 0.45;

      for (const ventAngle of [leftVentAngle, rightVentAngle]) {
        for (let v = 0; v < 4; v++) {
          const vSpread = ventAngle + (Math.random() * 0.3 - 0.15);
          const speed = 140 + Math.random() * 180;
          this.particles.push({
            x: barrelX,
            y: barrelY,
            vx: Math.cos(vSpread) * speed,
            vy: Math.sin(vSpread) * speed,
            radius: 2.5 + Math.random() * 2,
            color: '#fde047',
            alpha: 1,
            life: 0,
            maxLife: 0.11,
            type: 'spark',
          });
        }
        // Lateral smoke jet
        this.particles.push({
          x: barrelX,
          y: barrelY,
          vx: Math.cos(ventAngle) * 75,
          vy: Math.sin(ventAngle) * 75,
          radius: 6,
          color: '#e2e8f0',
          alpha: 0.7,
          life: 0,
          maxLife: 0.26,
          type: 'smoke',
          growth: 18,
        });
      }

      // 2. High-velocity supersonic forward shockwave & piercing sparks
      this.particles.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(aimAngle) * 110,
        vy: Math.sin(aimAngle) * 110,
        radius: 8,
        growth: 220,
        color: '#38bdf8',
        alpha: 0.95,
        life: 0,
        maxLife: 0.18,
        type: 'shockwave',
      });

      for (let i = 0; i < 8; i++) {
        const spreadAngle = aimAngle + (Math.random() * 0.18 - 0.09);
        const speed = 260 + Math.random() * 300;
        this.particles.push({
          x: barrelX,
          y: barrelY,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          radius: 3.5 + Math.random() * 2,
          color: Math.random() > 0.3 ? '#38bdf8' : '#ffffff',
          alpha: 1,
          life: 0,
          maxLife: 0.12,
          type: 'spark',
        });
      }

      // Forward dense vapor needle smoke
      for (let s = 1; s <= 3; s++) {
        this.particles.push({
          x: barrelX + Math.cos(aimAngle) * s * 18,
          y: barrelY + Math.sin(aimAngle) * s * 18,
          vx: Math.cos(aimAngle) * (80 + s * 20),
          vy: Math.sin(aimAngle) * (80 + s * 20) - 10,
          radius: 6 + s * 2.5,
          color: '#f8fafc',
          alpha: 0.85,
          life: 0,
          maxLife: 0.32,
          type: 'smoke',
          growth: 18,
        });
      }

      // Heavy .50 cal brass casing
      this.addShellCasing(gunOriginX, gunOriginY, isRight, '#fbbf24', 4.5, 9);

    } else if (weaponType === 'rocket') {
      // RPG Rocket: Roaring backblast flame + dark turbulent smoke behind character
      const backAngle = aimAngle + Math.PI;
      for (let b = 0; b < 16; b++) {
        const spreadAngle = backAngle + (Math.random() * 0.7 - 0.35);
        const speed = 120 + Math.random() * 260;
        this.particles.push({
          x: gunOriginX - Math.cos(aimAngle) * 16,
          y: gunOriginY - Math.sin(aimAngle) * 16,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          radius: 6 + Math.random() * 6,
          color: Math.random() > 0.35 ? '#ea580c' : '#facc15',
          alpha: 1,
          life: 0,
          maxLife: 0.28 + Math.random() * 0.16,
          type: 'fire',
        });
      }

      // Heavy dark backblast exhaust smoke
      for (let s = 0; s < 6; s++) {
        this.particles.push({
          x: gunOriginX - Math.cos(aimAngle) * (20 + s * 8),
          y: gunOriginY - Math.sin(aimAngle) * (20 + s * 8),
          vx: Math.cos(backAngle) * (70 + s * 15) + (Math.random() * 40 - 20),
          vy: Math.sin(backAngle) * (70 + s * 15) + (Math.random() * 40 - 20),
          radius: 10 + s * 2,
          color: Math.random() > 0.3 ? '#1e293b' : '#334155',
          alpha: 0.88,
          life: 0,
          maxLife: 0.55,
          type: 'smoke',
          growth: 36,
        });
      }

      // Forward ignition launch ring
      this.particles.push({
        x: barrelX,
        y: barrelY,
        vx: Math.cos(aimAngle) * 90,
        vy: Math.sin(aimAngle) * 90,
        radius: 10,
        color: '#fde047',
        alpha: 1,
        life: 0,
        maxLife: 0.16,
        type: 'fire',
      });

      this.particles.push({
        x: barrelX + Math.cos(aimAngle) * 12,
        y: barrelY + Math.sin(aimAngle) * 12,
        vx: Math.cos(aimAngle) * 40,
        vy: Math.sin(aimAngle) * 40 - 15,
        radius: 8,
        color: '#e2e8f0',
        alpha: 0.7,
        life: 0,
        maxLife: 0.35,
        type: 'smoke',
        growth: 24,
      });

    } else if (weaponType === 'rifle') {
      // Assault Rifle (M4): 8-10 high-velocity incandescent spark needles, dual smoke puff, brass casing
      for (let i = 0; i < 8; i++) {
        const spreadAngle = aimAngle + (Math.random() * 0.45 - 0.22);
        const speed = 160 + Math.random() * 220;
        const sparkColor = Math.random() > 0.4 ? '#fbbf24' : '#f97316';
        this.particles.push({
          x: barrelX,
          y: barrelY,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          radius: 3 + Math.random() * 2.5,
          color: sparkColor,
          alpha: 1,
          life: 0,
          maxLife: 0.11 + Math.random() * 0.05,
          type: 'spark',
        });
      }

      // Propellant gunpowder smoke puff (rises and curls)
      for (let s = 0; s < 2; s++) {
        this.particles.push({
          x: barrelX + Math.cos(aimAngle) * (8 + s * 10),
          y: barrelY + Math.sin(aimAngle) * (8 + s * 10),
          vx: Math.cos(aimAngle) * (35 + s * 20) + (Math.random() * 20 - 10),
          vy: Math.sin(aimAngle) * (35 + s * 20) - 22,
          radius: 5 + s * 3,
          color: Math.random() > 0.3 ? '#cbd5e1' : '#94a3b8',
          alpha: 0.65,
          life: 0,
          maxLife: 0.28 + Math.random() * 0.15,
          type: 'smoke',
          growth: 16,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 4,
        });
      }

      // Rapid spinning brass shell casing
      this.addShellCasing(gunOriginX, gunOriginY, isRight, '#fbbf24', 2.8, 5.5);

    } else {
      // Pistol / Handgun: Snappy bright spark needles, clean translucent white smoke puff
      for (let i = 0; i < 5; i++) {
        const spreadAngle = aimAngle + (Math.random() * 0.4 - 0.2);
        const speed = 120 + Math.random() * 160;
        this.particles.push({
          x: barrelX,
          y: barrelY,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          radius: 2.8 + Math.random() * 2.2,
          color: Math.random() > 0.3 ? '#fde047' : '#f59e0b',
          alpha: 1,
          life: 0,
          maxLife: 0.09,
          type: 'spark',
        });
      }

      // Translucent smoke puff drifting up
      this.particles.push({
        x: barrelX + Math.cos(aimAngle) * 8,
        y: barrelY + Math.sin(aimAngle) * 8,
        vx: Math.cos(aimAngle) * 22,
        vy: Math.sin(aimAngle) * 22 - 18,
        radius: 4.5,
        color: '#e2e8f0',
        alpha: 0.55,
        life: 0,
        maxLife: 0.24,
        type: 'smoke',
        growth: 14,
      });

      this.addShellCasing(gunOriginX, gunOriginY, isRight, '#fbbf24', 2.4, 4.5);
    }
  }

  public addMuzzleFlash(x: number, y: number, angle: number, color: string = '#fbbf24') {
    for (let i = 0; i < 4; i++) {
      const spreadAngle = angle + (Math.random() * 0.4 - 0.2);
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        radius: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.08,
        type: 'spark',
      });
    }

    this.particles.push({
      x: x + Math.cos(angle) * 10,
      y: y + Math.sin(angle) * 10,
      vx: Math.cos(angle) * 30,
      vy: Math.sin(angle) * 30 - 15,
      radius: 4,
      color: '#cbd5e1',
      alpha: 0.5,
      life: 0,
      maxLife: 0.25,
      type: 'smoke',
      growth: 10,
    });
  }

  public addShellCasing(
    x: number,
    y: number,
    facingRight: boolean,
    casingColor: string = '#fbbf24',
    width: number = 2.5,
    height: number = 5
  ) {
    const dir = facingRight ? -1 : 1;
    this.particles.push({
      x,
      y,
      vx: dir * (65 + Math.random() * 85),
      vy: -(130 + Math.random() * 90),
      radius: width,
      width,
      height,
      color: casingColor,
      alpha: 1,
      life: 0,
      maxLife: 0.65 + Math.random() * 0.25,
      type: 'casing',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: dir * (8 + Math.random() * 12),
    });
  }

  /**
   * Surface Impacts (Rock, Metal, Wood Splinters)
   */
  public addSurfaceImpact(x: number, y: number, surfaceType: string, normalX: number = 0, normalY: number = -1) {
    if (surfaceType === 'wood') {
      // Wood splinters
      for (let i = 0; i < 7; i++) {
        const angle = Math.atan2(normalY, normalX) + (Math.random() * 1.6 - 0.8);
        const speed = 70 + Math.random() * 160;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2,
          width: 2.2,
          height: 6 + Math.random() * 5,
          color: Math.random() > 0.4 ? '#92400e' : '#b45309',
          alpha: 1,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.2,
          type: 'splinter',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 12,
        });
      }
    } else if (surfaceType === 'metal') {
      // Heavy welding ricochet sparks
      for (let i = 0; i < 9; i++) {
        const angle = Math.atan2(normalY, normalX) + (Math.random() * 1.4 - 0.7);
        const speed = 120 + Math.random() * 240;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 2.5,
          color: Math.random() > 0.3 ? '#fef08a' : '#38bdf8',
          alpha: 1,
          life: 0,
          maxLife: 0.2 + Math.random() * 0.15,
          type: 'spark',
        });
      }
    } else {
      // Rock/Ground dust & pebble debris
      for (let i = 0; i < 5; i++) {
        const angle = Math.atan2(normalY, normalX) + (Math.random() * 1.6 - 0.8);
        const speed = 60 + Math.random() * 130;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 2.5,
          color: '#857b6b',
          alpha: 1,
          life: 0,
          maxLife: 0.35 + Math.random() * 0.2,
          type: 'debris',
        });
      }

      this.particles.push({
        x,
        y,
        vx: normalX * 20,
        vy: normalY * 20,
        radius: 6,
        color: '#b5ab9b',
        alpha: 0.65,
        life: 0,
        maxLife: 0.35,
        type: 'dust',
        growth: 18,
      });
    }
  }

  public addHitSparks(x: number, y: number, normalX: number = 0, normalY: number = -1) {
    for (let i = 0; i < 7; i++) {
      const angle = Math.atan2(normalY, normalX) + (Math.random() * 1.5 - 0.75);
      const speed = 90 + Math.random() * 190;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.2 + Math.random() * 2.2,
        color: '#fde047',
        alpha: 1,
        life: 0,
        maxLife: 0.2 + Math.random() * 0.15,
        type: 'spark',
      });
    }
  }

  public addBlood(x: number, y: number, dirX: number, dirY: number, count: number = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(dirY, dirX) + (Math.random() * 1.5 - 0.75);
      const speed = 90 + Math.random() * 220;
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        radius: 2.5 + Math.random() * 3.5,
        color: Math.random() > 0.35 ? '#dc2626' : (Math.random() > 0.5 ? '#b91c1c' : '#991b1b'),
        alpha: 0.95,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.45,
        type: 'blood',
      });
    }

    // Direct close-range ground/wall splat if standing on or near surface
    this.addBloodSplatDecal(x + (Math.random() * 16 - 8), y + (Math.random() * 16 - 8), '#991b1b', 4 + Math.random() * 4, dirX, dirY);
  }

  public addMeleeEffect(x: number, y: number, angle: number) {
    // Kinetic punch shockwave ring
    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * 80,
      vy: Math.sin(angle) * 80,
      radius: 8,
      growth: 150,
      color: '#facc15',
      alpha: 0.95,
      life: 0,
      maxLife: 0.15,
      type: 'shockwave',
    });

    // Impact sparks
    for (let i = 0; i < 9; i++) {
      const spAngle = angle + (Math.random() - 0.5) * 1.5;
      const speed = 130 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(spAngle) * speed,
        vy: Math.sin(spAngle) * speed,
        radius: 3.5,
        color: '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 0.22,
        type: 'spark',
      });
    }
  }

  /**
   * Cinematic Multi-Layer Cartoon Explosion
   */
  public addExplosion(x: number, y: number, isLarge: boolean = false) {
    const fireCount = isLarge ? 36 : 22;

    // 1. Primary White-Hot Expanding Shockwave Ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 8,
      color: '#fef08a',
      alpha: 0.95,
      life: 0,
      maxLife: isLarge ? 0.38 : 0.28,
      type: 'shockwave',
      growth: isLarge ? 550 : 360,
    });

    // Secondary inner shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 4,
      color: '#f97316',
      alpha: 0.9,
      life: 0,
      maxLife: isLarge ? 0.28 : 0.2,
      type: 'shockwave',
      growth: isLarge ? 380 : 240,
    });

    // 2. Fiery Expanding Spherical Cores (White -> Yellow -> Orange -> Red)
    for (let i = 0; i < fireCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (isLarge ? 130 : 80) + Math.random() * (isLarge ? 260 : 160);
      const colors = ['#ffffff', '#fef08a', '#facc15', '#f97316', '#ef4444'];
      this.particles.push({
        x: x + Math.cos(angle) * 8,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: (isLarge ? 9 : 6) + Math.random() * (isLarge ? 10 : 6),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.32 + Math.random() * 0.3,
        type: 'fire',
      });
    }

    // 3. Dense Billowing Slate & Charcoal Smoke Clouds
    const smokeCount = isLarge ? 24 : 14;
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 95;
      this.particles.push({
        x: x + Math.cos(angle) * 14,
        y: y + Math.sin(angle) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35, // upward thermal lift
        radius: 14 + Math.random() * 14,
        color: Math.random() > 0.5 ? '#334155' : '#475569',
        alpha: 0.85,
        life: 0,
        maxLife: 0.7 + Math.random() * 0.45,
        type: 'smoke',
        growth: 32,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 3,
      });
    }

    // 4. Flying Shrapnel / Burning Embers
    const debrisCount = isLarge ? 18 : 10;
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 160 + Math.random() * 280;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 90,
        radius: 2.5 + Math.random() * 3.5,
        color: Math.random() > 0.3 ? '#f97316' : '#1e293b',
        alpha: 1,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.35,
        type: 'debris',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 14,
      });
    }
  }

  public addRocketSmoke(x: number, y: number, vx: number, vy: number) {
    this.particles.push({
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 4 - 2),
      vx: -vx * 0.15 + (Math.random() * 20 - 10),
      vy: -vy * 0.15 + (Math.random() * 20 - 10),
      radius: 4.5,
      color: '#e2e8f0',
      alpha: 0.75,
      life: 0,
      maxLife: 0.38 + Math.random() * 0.16,
      type: 'smoke',
      growth: 20,
    });

    if (Math.random() < 0.45) {
      this.particles.push({
        x,
        y,
        vx: -vx * 0.2,
        vy: -vy * 0.2,
        radius: 3.5,
        color: '#f97316',
        alpha: 0.95,
        life: 0,
        maxLife: 0.12,
        type: 'fire',
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#fde047') {
    this.floatingTexts.push({
      id: this.nextTextId++,
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
      vy: -55,
    });
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}
