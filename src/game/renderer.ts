import { CharacterState, Projectile, Pickup, ExplosiveBarrel, WoodenCrate, Platform, WeaponType, BloodDecal, TacticalCover } from '../types';
import { ParticleSystem } from './particles';
import { MAP_WIDTH, MAP_HEIGHT, MapData } from './mapData';
import { WEAPON_CONFIGS } from './weapons';
import { drawWeaponSprite2D } from './weaponSprites';
import { drawSoldier2D } from './soldierVisuals';
import { settingsManager } from '../utils/settingsManager';
import { weatherSystem } from './weatherEngine';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private camera = { x: 0, y: 0, width: 800, height: 450, zoom: 1 };
  private screenShake = 0;
  private animTime = 0;
  private hitMarkers: Array<{
    x: number;
    y: number;
    isHeadshot: boolean;
    damage: number;
    time: number;
    maxTime: number;
  }> = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public addHitMarker(x: number, y: number, isHeadshot: boolean, damage: number) {
    this.hitMarkers.push({
      x,
      y,
      isHeadshot,
      damage,
      time: 0.28,
      maxTime: 0.28,
    });
    if (this.hitMarkers.length > 8) {
      this.hitMarkers.shift();
    }
  }

  private updateHitMarkers(dt: number) {
    for (let i = this.hitMarkers.length - 1; i >= 0; i--) {
      this.hitMarkers[i].time -= dt;
      if (this.hitMarkers[i].time <= 0) {
        this.hitMarkers.splice(i, 1);
      }
    }
  }

  public setDimensions(width: number, height: number) {
    this.camera.width = width;
    this.camera.height = height;
  }

  public getCamera() {
    return this.camera;
  }

  public updateCamera(
    targetX: number,
    targetY: number,
    dt: number,
    lookAheadX: number = 0,
    lookAheadY: number = 0,
    targetZoom: number = 1
  ) {
    this.animTime += dt;
    this.updateHitMarkers(dt);
    
    // Smooth zoom lerp
    const zoomLerpSpeed = 4 * dt;
    this.camera.zoom += (targetZoom - this.camera.zoom) * zoomLerpSpeed;
    
    // Smooth camera follow with look-ahead, factoring in zoom
    const visibleW = this.camera.width / this.camera.zoom;
    const visibleH = this.camera.height / this.camera.zoom;
    const targetCamX = (targetX + lookAheadX) - visibleW / 2;
    const targetCamY = (targetY + lookAheadY) - visibleH / 2;

    // Bounds clamp (ensures camera stays cleanly inside the arena)
    const minX = 0;
    const maxX = Math.max(0, MAP_WIDTH - visibleW);
    const minY = 0;
    const maxY = Math.max(0, MAP_HEIGHT - visibleH);

    const lerpSpeed = 6.5 * dt;
    this.camera.x += (Math.max(minX, Math.min(maxX, targetCamX)) - this.camera.x) * lerpSpeed;
    this.camera.y += (Math.max(minY, Math.min(maxY, targetCamY)) - this.camera.y) * lerpSpeed;

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 20 * dt);
    }

    // Update dynamic weather simulation
    weatherSystem.update(dt);
  }

  public addScreenShake(amount: number) {
    // Screen shake completely disabled per user request for rock-solid, smooth camera
    this.screenShake = 0;
  }

  public render(
    map: MapData,
    player: CharacterState,
    bots: CharacterState[],
    projectiles: Projectile[],
    particles: ParticleSystem,
    crosshairPos?: { x: number; y: number },
    scopeLevel: number = 1,
    skipCharacters: boolean = false
  ) {
    const ctx = this.ctx;
    const w = this.camera.width;
    const h = this.camera.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply Screen Shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() * 2 - 1) * this.screenShake;
      shakeY = (Math.random() * 2 - 1) * this.screenShake;
    }

    // 1. Draw Parallax Background (Sky, Mountains, Rolling Hills, Clouds)
    this.renderParallaxBackground(ctx, w, h);

    // Translate to World coordinates and apply zoom
    ctx.save();
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x + shakeX / this.camera.zoom, -this.camera.y + shakeY / this.camera.zoom);

    // 1.5 Draw Underground Tunnel Back-Walls & Depth Layering (Underground interior depth)
    this.renderTunnelDepthBackdrop(ctx);

    // 1.8 Draw Suspension Chains for floating decks
    if (map.scenery.chains) {
      this.renderChains(ctx, map.scenery.chains);
    }

    // 2. Draw Map Structures & Platforms (Foreground terrain)
    this.renderPlatforms(ctx, map.platforms);

    // 2.2 Draw Permanent/Decaying Blood Splat Decals on stone & ground surfaces
    this.renderBloodDecals(ctx, particles.getDecals());

    // 2.5 Draw Dynamic 3D Projected Ground Shadows for characters and pickups
    this.renderDynamic3DShadows(ctx, map.platforms, [player, ...bots], map.pickups);

    // 3. Draw Scenery (Bunkers, Outposts, Log Piles, Trees, Signs)
    this.renderScenery(ctx, map.scenery);

    // 4. Draw Explosive Barrels
    this.renderBarrels(ctx, map.barrels);

    // 4.5 Draw Destructible Wooden Crates
    if (map.crates) {
      this.renderCrates(ctx, map.crates);
    }

    // 4.8 Draw 3D Tactical Covers (Midground Pass)
    if (map.tacticalCovers) {
      this.renderTacticalCovers(ctx, map.tacticalCovers, false);
    }

    // 5. Draw Pickups
    this.renderPickups(ctx, map.pickups);

    // 6. Draw Characters (Player and Bots)
    if (!skipCharacters) {
      for (const bot of bots) {
        if (!bot.isDead) {
          this.renderCharacter(ctx, bot);
        }
      }
      if (!player.isDead) {
        this.renderCharacter(ctx, player, crosshairPos);
      }
    }

    // 6.2 Draw 3D Tactical Cover Foreground Occlusion Pass (Rendered OVER crouching players)
    if (map.tacticalCovers) {
      this.renderTacticalCovers(ctx, map.tacticalCovers, true);
    }

    // 6.5 Draw Camouflage Bushes (Rendered in front of soldiers so they can hide inside!)
    if (map.scenery.bushes && map.scenery.bushes.length > 0) {
      this.renderBushes(ctx, map.scenery.bushes);
    }

    // Spawn subterranean falling dust motes
    particles.spawnSubterraneanDust(this.camera.x, this.camera.y, w / this.camera.zoom, h / this.camera.zoom);

    // 7. Draw Projectiles (Bullets, Rockets, Grenades)
    this.renderProjectiles(ctx, projectiles);

    // 8. Draw Particles (Jetpack flames, smoke rings, blood, sparks, shockwaves)
    this.renderParticles(ctx, particles);

    // 9. Draw Atmospheric Lighting & Tunnel Occlusion Shadows
    this.renderLightingOverlay(ctx, map.scenery.lamps, map.scenery.guideMarkers);

    ctx.restore(); // Restore world translation

    // 9.8 Draw Dynamic Weather Particles & Atmospheric Tint Overlay
    weatherSystem.renderOverlay(ctx, w, h);

    // 10. Draw Floating Damage Texts (World coordinates mapped)
    this.renderFloatingTexts(ctx, particles);

    // 11. Draw Offscreen Enemy Indicators (Mini Militia Radar Arrows)
    this.renderOffscreenEnemyIndicators(ctx, player, bots);

    // 11.5 Draw Tactical Weather Control & Status Badge
    weatherSystem.renderHUD(ctx, w, h);

    // 12. Draw Sniper Scope Vignette & Tactical Reticle when zoomed in
    if (scopeLevel > 1) {
      const cx = w / 2;
      const cy = h / 2;
      const outerRadius = Math.sqrt(cx * cx + cy * cy);
      // Contract circle based on scope zoom depth
      const innerRadius = scopeLevel === 2 ? outerRadius * 0.45 : outerRadius * 0.3;

      const grad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
      grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Draw Sniper Tactical crosshairs
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Horizontal
      ctx.moveTo(cx - outerRadius * 0.3, cy);
      ctx.lineTo(cx + outerRadius * 0.3, cy);
      // Vertical
      ctx.moveTo(cx, cy - outerRadius * 0.3);
      ctx.lineTo(cx, cy + outerRadius * 0.3);
      ctx.stroke();

      // Tactical green circles and lock-on indicator
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius + 15, 0, Math.PI * 2);
      ctx.stroke();

      // Tactical HUD scope labels
      ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`TARGET ACQUIRED • ${scopeLevel}X SCOPE`, cx, cy - 35);
      ctx.fillText('CAMERA STABILIZED', cx, cy + 45);

      ctx.restore();
    }

    // 13. Render Dynamic High-Impact Hit Marker Overlay
    this.renderHitMarkers(ctx, crosshairPos);

    ctx.restore();
  }

  private renderHitMarkers(ctx: CanvasRenderingContext2D, crosshairPos?: { x: number; y: number }) {
    if (this.hitMarkers.length === 0) return;

    ctx.save();

    for (const hm of this.hitMarkers) {
      const progress = Math.max(0, hm.time / hm.maxTime); // 1.0 down to 0
      const alpha = Math.min(1, progress * 1.6);
      const scale = 0.8 + (1 - progress) * 0.7; // Snappy spring scale animation

      const isHead = hm.isHeadshot;
      const markerColor = isHead ? `rgba(244, 63, 94, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      const glowColor = isHead ? `rgba(239, 68, 68, ${alpha * 0.9})` : `rgba(56, 189, 248, ${alpha * 0.8})`;

      // 1. World Space Hit Marker Overlay at Impact Point
      const screenX = (hm.x - this.camera.x) * this.camera.zoom;
      const screenY = (hm.y - this.camera.y) * this.camera.zoom;

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.scale(scale, scale);

      ctx.strokeStyle = markerColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isHead ? 16 : 10;
      ctx.lineWidth = isHead ? 3.8 : 2.8;
      ctx.lineCap = 'round';

      const size = isHead ? 14 : 10;
      const gap = 3.5;

      ctx.beginPath();
      // Top-Left
      ctx.moveTo(-size, -size); ctx.lineTo(-gap, -gap);
      // Top-Right
      ctx.moveTo(size, -size); ctx.lineTo(gap, -gap);
      // Bottom-Left
      ctx.moveTo(-size, size); ctx.lineTo(-gap, gap);
      // Bottom-Right
      ctx.moveTo(size, size); ctx.lineTo(gap, gap);
      ctx.stroke();

      if (isHead) {
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. HUD Screen-Center / Crosshair Dynamic Hit Marker Indicator
      const hudX = crosshairPos ? crosshairPos.x : this.camera.width / 2;
      const hudY = crosshairPos ? crosshairPos.y : this.camera.height / 2;

      ctx.save();
      ctx.translate(hudX, hudY);
      ctx.scale(scale * 1.2, scale * 1.2);

      ctx.strokeStyle = markerColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isHead ? 20 : 12;
      ctx.lineWidth = isHead ? 3.5 : 2.5;
      ctx.lineCap = 'round';

      const hudSize = isHead ? 18 : 13;
      const hudGap = 4.2;

      ctx.beginPath();
      ctx.moveTo(-hudSize, -hudSize); ctx.lineTo(-hudGap, -hudGap);
      ctx.moveTo(hudSize, -hudSize); ctx.lineTo(hudGap, -hudGap);
      ctx.moveTo(-hudSize, hudSize); ctx.lineTo(-hudGap, hudGap);
      ctx.moveTo(hudSize, hudSize); ctx.lineTo(hudGap, hudGap);
      ctx.stroke();

      if (isHead) {
        ctx.font = '900 11px Chakra Petch, sans-serif';
        ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText('🎯 HEADSHOT!', 0, -hudSize - 8);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // 1. Dynamic weather sky gradient (smoothly transitions between clear, sandstorm, fog, and dusk)
    const skyGrad = weatherSystem.getSkyGradients(ctx, h);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    const worldW = w + 1400;
    // Vertical parallax offset: smooth natural transition as camera ascends/descends
    const vOffset = Math.min(130, -this.camera.y * 0.16);

    // 2. Distant Atmospheric Sun Corona & Subtle Volumetric God Rays
    const sunX = (w * 0.72 - this.camera.x * 0.015 + worldW) % worldW;
    const sunY = h * 0.28 + vOffset * 0.4;
    
    // Outer atmospheric glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 420);
    sunGlow.addColorStop(0, 'rgba(255, 250, 230, 0.45)');
    sunGlow.addColorStop(0.2, 'rgba(255, 240, 200, 0.25)');
    sunGlow.addColorStop(0.6, 'rgba(235, 245, 255, 0.08)');
    sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);

    // Sun Core
    ctx.fillStyle = '#fffdf0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Volumetric Sun Beams
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#fffae0';
    for (let angle = 0.4; angle < 2.2; angle += 0.35) {
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX + Math.cos(angle) * 700 - 60, sunY + Math.sin(angle) * 700);
      ctx.lineTo(sunX + Math.cos(angle) * 700 + 60, sunY + Math.sin(angle) * 700);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. High-Altitude Cirrus & Realistic Cumulus Cloud Layers
    // Wispy Cirrus (Speed: 0.01)
    const cirrusOffset = (this.animTime * 4 + this.camera.x * 0.01) % worldW;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    this.drawWispyCloud(ctx, (worldW - cirrusOffset + 150) % worldW - 200, 45 + vOffset * 0.2, 280, 25);
    this.drawWispyCloud(ctx, (worldW - cirrusOffset + 700) % worldW - 200, 75 + vOffset * 0.2, 340, 30);
    ctx.restore();

    // Mid-Altitude Layered Cumulus Clouds (Speed: 0.025)
    const cloudOffset = (this.animTime * 9 + this.camera.x * 0.025) % worldW;
    this.drawRealisticCloud(ctx, (worldW - cloudOffset + 80) % worldW - 200, 90 + vOffset * 0.32, 220);
    this.drawRealisticCloud(ctx, (worldW - cloudOffset + 560) % worldW - 200, 130 + vOffset * 0.32, 290);
    this.drawRealisticCloud(ctx, (worldW - cloudOffset + 1050) % worldW - 200, 70 + vOffset * 0.32, 240);

    // Distant Flocking Recon Drones / Tactical Birds
    this.renderDistantBirds(ctx, (this.animTime * 25 + this.camera.x * 0.03) % worldW, 110 + vOffset * 0.3);

    // 4. Layer 1: Distant Majestic Jagged Alpine Mountains (Speed: 0.04)
    // Mountain Gradient with atmospheric haze
    const mGrad1 = ctx.createLinearGradient(0, h - 350, 0, h);
    mGrad1.addColorStop(0, '#5f7587');
    mGrad1.addColorStop(0.6, '#7e96a6');
    mGrad1.addColorStop(1, '#a8bdc7');
    ctx.fillStyle = mGrad1;

    const mOffset = (this.camera.x * 0.04) % worldW;
    const mBaseY = h - 160 + vOffset * 0.65;
    ctx.beginPath();
    ctx.moveTo(0 - mOffset, mBaseY);
    ctx.lineTo(240 - mOffset, mBaseY - 260);
    ctx.lineTo(380 - mOffset, mBaseY - 180);
    ctx.lineTo(590 - mOffset, mBaseY - 330);
    ctx.lineTo(820 - mOffset, mBaseY - 140);
    ctx.lineTo(1080 - mOffset, mBaseY - 380);
    ctx.lineTo(1320 - mOffset, mBaseY - 190);
    ctx.lineTo(1540 - mOffset, mBaseY - 290);
    ctx.lineTo(1820 - mOffset, mBaseY - 120);
    ctx.lineTo(worldW, mBaseY);
    ctx.lineTo(worldW, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Snow Cap Highlights & Ridge Shadows on Distant Peaks
    ctx.fillStyle = 'rgba(240, 248, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(240 - mOffset, mBaseY - 260);
    ctx.lineTo(270 - mOffset, mBaseY - 200);
    ctx.lineTo(230 - mOffset, mBaseY - 210);
    ctx.closePath();
    ctx.moveTo(590 - mOffset, mBaseY - 330);
    ctx.lineTo(630 - mOffset, mBaseY - 250);
    ctx.lineTo(560 - mOffset, mBaseY - 260);
    ctx.closePath();
    ctx.moveTo(1080 - mOffset, mBaseY - 380);
    ctx.lineTo(1125 - mOffset, mBaseY - 290);
    ctx.lineTo(1040 - mOffset, mBaseY - 300);
    ctx.closePath();
    ctx.fill();

    // 5. Layer 2: Mid-Ground Pine Forest Ridges & Military Antenna Silhouettes (Speed: 0.10)
    const mGrad2 = ctx.createLinearGradient(0, h - 250, 0, h);
    mGrad2.addColorStop(0, '#3e5845');
    mGrad2.addColorStop(0.5, '#4e6d56');
    mGrad2.addColorStop(1, '#688c72');
    ctx.fillStyle = mGrad2;

    const hOffset = (this.camera.x * 0.10) % worldW;
    const hBaseY = h - 120 + vOffset * 0.85;
    ctx.beginPath();
    ctx.moveTo(0 - hOffset, hBaseY);
    ctx.lineTo(310 - hOffset, hBaseY - 190);
    ctx.lineTo(680 - hOffset, hBaseY - 60);
    ctx.lineTo(1040 - hOffset, hBaseY - 220);
    ctx.lineTo(1420 - hOffset, hBaseY - 80);
    ctx.lineTo(1780 - hOffset, hBaseY - 180);
    ctx.lineTo(worldW, hBaseY);
    ctx.lineTo(worldW, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // 5.5 High-Definition Outpost Military Command Complex & Industrial Hangars (Speed: 0.07)
    const outpostOffset = (this.camera.x * 0.07) % worldW;
    const outpostBaseY = h - 110 + vOffset * 0.8;

    // Military Industrial Hangar
    ctx.fillStyle = '#26332c';
    const hangarX = (1150 - outpostOffset + worldW) % worldW;
    ctx.beginPath();
    ctx.roundRect(hangarX, outpostBaseY - 75, 140, 75, [12, 12, 0, 0]);
    ctx.fill();
    // Hangar roof ribs
    ctx.strokeStyle = '#3d4f44';
    ctx.lineWidth = 2.5;
    for (let hx = hangarX + 20; hx < hangarX + 120; hx += 25) {
      ctx.beginPath();
      ctx.moveTo(hx, outpostBaseY - 75);
      ctx.lineTo(hx, outpostBaseY);
      ctx.stroke();
    }

    // Military Radar / Satellite Dish
    const radarX = (450 - outpostOffset + worldW) % worldW;
    const radarY = outpostBaseY - 95;
    ctx.strokeStyle = '#34453b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(radarX, radarY + 95);
    ctx.lineTo(radarX, radarY + 35);
    ctx.stroke();
    // Rotating Dish
    ctx.fillStyle = '#4a5e50';
    ctx.beginPath();
    ctx.arc(radarX, radarY + 30, 22, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Dish signal beam line
    const dishAngle = Math.sin(this.animTime * 2) * 0.6;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radarX, radarY + 30);
    ctx.lineTo(radarX + Math.cos(dishAngle) * 90, radarY + 30 + Math.sin(dishAngle) * 90);
    ctx.stroke();

    // Tactical Watchtower with Sweeping Searchlight Beam
    const towerX = (1580 - outpostOffset + worldW) % worldW;
    const towerY = outpostBaseY - 130;
    ctx.fillStyle = '#222d26';
    ctx.beginPath();
    ctx.moveTo(towerX - 15, outpostBaseY);
    ctx.lineTo(towerX - 6, towerY + 35);
    ctx.lineTo(towerX + 6, towerY + 35);
    ctx.lineTo(towerX + 15, outpostBaseY);
    ctx.fill();
    // Watchtower Cabin
    ctx.fillRect(towerX - 18, towerY, 36, 35);
    // Sweeping Searchlight Cone
    const sweepAngle = -Math.PI / 4 + Math.sin(this.animTime * 1.5) * 0.45;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 200, 0.12)';
    ctx.beginPath();
    ctx.moveTo(towerX, towerY + 15);
    ctx.lineTo(towerX + Math.cos(sweepAngle - 0.2) * 350, towerY + 15 + Math.sin(sweepAngle - 0.2) * 350);
    ctx.lineTo(towerX + Math.cos(sweepAngle + 0.2) * 350, towerY + 15 + Math.sin(sweepAngle + 0.2) * 350);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Military Radar / Radio Tower on Ridge
    const radioTowerX = (780 - hOffset + worldW) % worldW;
    const radioTowerY = hBaseY - 140;
    ctx.strokeStyle = '#27382c';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(radioTowerX - 12, radioTowerY + 90);
    ctx.lineTo(radioTowerX, radioTowerY);
    ctx.lineTo(radioTowerX + 12, radioTowerY + 90);
    // Crossbars
    ctx.moveTo(radioTowerX - 9, radioTowerY + 65);
    ctx.lineTo(radioTowerX + 9, radioTowerY + 65);
    ctx.moveTo(radioTowerX - 6, radioTowerY + 40);
    ctx.lineTo(radioTowerX + 6, radioTowerY + 40);
    ctx.moveTo(radioTowerX - 3, radioTowerY + 18);
    ctx.lineTo(radioTowerX + 3, radioTowerY + 18);
    ctx.stroke();
    // Blinking Red Warning Beacon
    const beaconPulse = Math.sin(this.animTime * 4) > 0;
    if (beaconPulse) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(radioTowerX, radioTowerY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Depth of Field (DoF) Atmospheric Haze & Horizon Mist Overlay
    const dofGrad = ctx.createLinearGradient(0, h - 220, 0, h - 30);
    dofGrad.addColorStop(0, 'rgba(200, 215, 225, 0)');
    dofGrad.addColorStop(0.6, 'rgba(180, 200, 215, 0.25)');
    dofGrad.addColorStop(1, 'rgba(160, 185, 200, 0.55)');
    ctx.fillStyle = dofGrad;
    ctx.fillRect(0, h - 220, w, 190);

    // 6. Layer 3: Closer Pine & Spruce Tree Silhouettes on Ridge (Speed: 0.18)
    ctx.fillStyle = '#2f4534';
    for (let tx = 0; tx < worldW; tx += 45) {
      const treeX = (tx - this.camera.x * 0.18 + worldW * 2) % worldW;
      const treeY = hBaseY - 15 - Math.sin(tx * 0.012) * 30;
      const tHeight = 45 + ((tx * 17) % 35);
      const tWidth = 16 + ((tx * 7) % 8);

      ctx.beginPath();
      ctx.moveTo(treeX, treeY);
      ctx.lineTo(treeX + tWidth / 2, treeY - tHeight);
      ctx.lineTo(treeX + tWidth, treeY);
      ctx.fill();
    }

    // 7. Layer 4: Foreground Parallax Mossy Ground & Foliage Canopies (Speed: 0.32)
    ctx.fillStyle = 'rgba(38, 59, 39, 0.55)';
    const fgOffset = (this.camera.x * 0.32) % worldW;
    const fgBaseY = h - 35 + vOffset;
    for (let fx = 0; fx < worldW; fx += 190) {
      const bushX = (fx - fgOffset + worldW) % worldW;
      ctx.beginPath();
      ctx.ellipse(bushX, fgBaseY, 65, 30, 0, 0, Math.PI * 2);
      ctx.ellipse(bushX + 45, fgBaseY + 8, 48, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawWispyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.3, y - 4, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.7, y + 3, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRealisticCloud(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
    ctx.save();
    // Shaded Cloud Underside
    ctx.fillStyle = 'rgba(200, 215, 225, 0.75)';
    ctx.beginPath();
    ctx.arc(x, y + 4, width * 0.22, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + width * 0.28, y - width * 0.08 + 4, width * 0.28, Math.PI * 0.9, Math.PI * 2);
    ctx.arc(x + width * 0.65, y - width * 0.04 + 4, width * 0.24, Math.PI * 1, Math.PI * 2.1);
    ctx.arc(x + width, y + 4, width * 0.2, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();

    // Bright White Illuminated Cloud Top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.arc(x, y, width * 0.2, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + width * 0.28, y - width * 0.1, width * 0.27, Math.PI * 0.9, Math.PI * 2);
    ctx.arc(x + width * 0.65, y - width * 0.06, width * 0.23, Math.PI * 1, Math.PI * 2.1);
    ctx.arc(x + width, y, width * 0.19, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderDistantBirds(ctx: CanvasRenderingContext2D, baseX: number, baseY: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 55, 65, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const bx = baseX + i * 40;
      const by = baseY + Math.sin(this.animTime * 3 + i) * 12 + i * 8;
      const wingFlap = Math.sin(this.animTime * 6 + i * 1.5) * 5;
      ctx.beginPath();
      ctx.moveTo(bx - 7, by - wingFlap);
      ctx.quadraticCurveTo(bx - 3, by, bx, by + 1);
      ctx.quadraticCurveTo(bx + 3, by, bx + 7, by - wingFlap);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renders a continuous, seamless, rich subterranean bedrock backdrop
   * covering the entire underground canyon and cavern world (0 to MAP_WIDTH, y: 620 to 2000).
   * Features realistic rock textures, stratified mineral veins, hanging stalactites,
   * cave moss/vines, industrial girders, and glowing parkour tunnel entrance arches.
   */
  private renderTunnelDepthBackdrop(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Full continuous subterranean bedrock backwall spanning the lower world
    // Deep stone gradient: realistic basalt, slate catacomb rock, and mineral veins
    const caveBackGrad = ctx.createLinearGradient(0, 620, 0, MAP_HEIGHT);
    caveBackGrad.addColorStop(0, '#544a3c');
    caveBackGrad.addColorStop(0.18, '#3d372c');
    caveBackGrad.addColorStop(0.55, '#28241d');
    caveBackGrad.addColorStop(0.85, '#181612');
    caveBackGrad.addColorStop(1, '#0e0d0a');
    ctx.fillStyle = caveBackGrad;
    ctx.fillRect(0, 620, MAP_WIDTH, MAP_HEIGHT - 620);

    // 2. Organic scalloped canyon rim transition along upper boundary (y: 560 - 640)
    ctx.fillStyle = '#544a3c';
    for (let rx = 0; rx < MAP_WIDTH; rx += 80) {
      const rimH = 40 + ((rx * 13) % 42);
      ctx.beginPath();
      ctx.ellipse(rx + 40, 620, 55, rimH, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Underground Geological Rock Strata & Quartz/Copper Mineral Veins
    for (let sy = 680; sy < MAP_HEIGHT - 40; sy += 70) {
      // Dark fissure fracture
      ctx.strokeStyle = '#12100d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, sy + Math.sin(sy * 0.05) * 10);
      for (let sx = 0; sx < MAP_WIDTH; sx += 140) {
        const midY = sy + Math.sin((sx + sy) * 0.016) * 20;
        const endY = sy + Math.sin((sx + sy + 70) * 0.016) * 20;
        ctx.lineTo(sx + 70, midY);
        ctx.lineTo(sx + 140, endY);
      }
      ctx.stroke();

      // Quartz / copper mineral highlight vein
      ctx.strokeStyle = (sy % 140 === 0) ? '#ca8a04' : '#6b5c49';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, sy - 3 + Math.sin(sy * 0.05) * 10);
      for (let sx = 0; sx < MAP_WIDTH; sx += 140) {
        const midY = sy - 3 + Math.sin((sx + sy) * 0.016) * 20;
        const endY = sy - 3 + Math.sin((sx + sy + 70) * 0.016) * 20;
        ctx.lineTo(sx + 70, midY);
        ctx.lineTo(sx + 140, endY);
      }
      ctx.stroke();
    }

    // 4. Subterranean Cavern Depth Pillars & Carved Tunnel Arches
    ctx.fillStyle = '#221e17';
    // Left Support Pillars
    ctx.beginPath();
    ctx.roundRect(460, 680, 115, 640, 14);
    ctx.roundRect(690, 680, 105, 640, 14);
    ctx.fill();

    // Tunnel Arch Recesses (Parkour Tunnel Entrances)
    // Left Chute Tunnel Entrance
    ctx.fillStyle = '#1a1712';
    ctx.beginPath();
    ctx.ellipse(800, 1100, 140, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center Valley Tunnel Entrance
    ctx.beginPath();
    ctx.ellipse(1800, 1150, 220, 200, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Right Drop Chute Tunnel Entrance
    ctx.beginPath();
    ctx.ellipse(3200, 1120, 150, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 5. Realistic Subterranean Hanging Stalactites & Floor Stalagmites
    // Ceilings Stalactites
    ctx.fillStyle = '#3f382d';
    for (let stX = 40; stX < MAP_WIDTH - 40; stX += 55) {
      const stY = 620 + Math.sin(stX * 0.03) * 12;
      const stH = 22 + ((stX * 13) % 36);
      const stW = 12 + ((stX * 7) % 10);
      ctx.beginPath();
      ctx.moveTo(stX, stY);
      ctx.lineTo(stX + stW / 2, stY + stH);
      ctx.lineTo(stX + stW, stY);
      ctx.closePath();
      ctx.fill();
    }
    // Floor Stalagmites rising from cave bed (y: 1750)
    ctx.fillStyle = '#312b23';
    for (let smX = 80; smX < MAP_WIDTH - 80; smX += 75) {
      const smY = 1750;
      const smH = 25 + ((smX * 17) % 40);
      const smW = 14 + ((smX * 9) % 12);
      ctx.beginPath();
      ctx.moveTo(smX, smY);
      ctx.lineTo(smX + smW / 2, smY - smH);
      ctx.lineTo(smX + smW, smY);
      ctx.closePath();
      ctx.fill();
    }

    // 6. Natural Subterranean Vines & Moss draped over cave walls
    ctx.fillStyle = '#4d7c0f';
    ctx.strokeStyle = '#3f6212';
    ctx.lineWidth = 2;
    for (let vx = 300; vx < MAP_WIDTH - 300; vx += 240) {
      const vineY = 650 + Math.sin(vx) * 30;
      ctx.beginPath();
      ctx.moveTo(vx, vineY);
      ctx.quadraticCurveTo(vx + 15, vineY + 40, vx + 5, vineY + 80);
      ctx.stroke();
      // Moss leaves
      ctx.beginPath();
      ctx.arc(vx + 5, vineY + 80, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Cavern Depth Vignettes and Ambient Cave Shadows
    const leftShadow = ctx.createRadialGradient(600, 960, 50, 600, 960, 360);
    leftShadow.addColorStop(0, 'rgba(8, 7, 5, 0.72)');
    leftShadow.addColorStop(1, 'rgba(8, 7, 5, 0)');
    ctx.fillStyle = leftShadow;
    ctx.fillRect(250, 650, 750, 650);

    const centerShadow = ctx.createRadialGradient(2160, 1060, 60, 2160, 1060, 420);
    centerShadow.addColorStop(0, 'rgba(8, 7, 5, 0.78)');
    centerShadow.addColorStop(1, 'rgba(8, 7, 5, 0)');
    ctx.fillStyle = centerShadow;
    ctx.fillRect(1800, 720, 720, 680);

    // Deep Catacombs Ambient Fog (y: 1350 to 1950)
    const deepCaveFog = ctx.createLinearGradient(0, 1350, 0, 1850);
    deepCaveFog.addColorStop(0, 'rgba(8, 7, 5, 0)');
    deepCaveFog.addColorStop(0.5, 'rgba(8, 7, 5, 0.5)');
    deepCaveFog.addColorStop(1, 'rgba(8, 7, 5, 0.85)');
    ctx.fillStyle = deepCaveFog;
    ctx.fillRect(0, 1350, MAP_WIDTH, 650);

    ctx.restore();
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]) {
    const visibleW = (this.camera.width / this.camera.zoom) + 200;
    const visibleH = (this.camera.height / this.camera.zoom) + 200;
    const minX = this.camera.x - 100;
    const maxX = this.camera.x + visibleW;
    const minY = this.camera.y - 100;
    const maxY = this.camera.y + visibleH;

    for (const p of platforms) {
      if (
        p.x + p.width < minX ||
        p.x > maxX ||
        p.y + p.height < minY ||
        p.y > maxY
      ) continue;
      
      ctx.save();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      
      if (p.type === 'ground' || p.type === 'rock') {
        // 1. Classic Mini Militia Outpost: Multi-Layered Stone & Rock Base
        const stoneGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        stoneGrad.addColorStop(0, '#6b5c4c');
        stoneGrad.addColorStop(0.3, '#544638');
        stoneGrad.addColorStop(1, '#3b3025');
        ctx.fillStyle = stoneGrad;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 10);
        // Create organic, bumpy top edge
        for (let x = p.x; x <= p.x + p.width; x += 35) {
          ctx.quadraticCurveTo(x + 17.5, p.y - 8 + (Math.sin(x * 0.05) * 8), x + 35, p.y + 10);
        }
        ctx.lineTo(p.x + p.width, p.y + p.height);
        ctx.lineTo(p.x, p.y + p.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Organic Rock Crack Highlights inside stone platforms
        ctx.strokeStyle = '#2b2219';
        ctx.lineWidth = 1.8;
        for (let cx = p.x + 30; cx < p.x + p.width - 30; cx += 80) {
          ctx.beginPath();
          ctx.moveTo(cx, p.y + 18);
          ctx.lineTo(cx + 15, p.y + 35);
          ctx.lineTo(cx + 5, p.y + 55);
          ctx.stroke();
        }

        // Decorative pebbles/gravel on ground surface
        ctx.fillStyle = '#a3927f';
        for (let ix = p.x + 15; ix < p.x + p.width - 15; ix += 35) {
          ctx.beginPath();
          ctx.ellipse(ix, p.y + 8, 5 + Math.sin(ix) * 3, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add organic grass on top surface platforms
        if (!p.oneWay && p.y < 1200) {
          ctx.fillStyle = '#65a30d';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + 5);
          for (let x = p.x; x <= p.x + p.width; x += 18) {
            ctx.quadraticCurveTo(x + 9, p.y - 6 + (Math.cos(x) * 5), x + 18, p.y + 5);
          }
          ctx.lineTo(p.x + p.width, p.y + 12);
          ctx.lineTo(p.x, p.y + 12);
          ctx.closePath();
          ctx.fill();

          // Grass blade details
          ctx.strokeStyle = '#84cc16';
          ctx.lineWidth = 1.8;
          for (let gx = p.x + 10; gx < p.x + p.width - 10; gx += 25) {
            ctx.beginPath();
            ctx.moveTo(gx, p.y + 4);
            ctx.lineTo(gx - 3, p.y - 6);
            ctx.moveTo(gx + 5, p.y + 4);
            ctx.lineTo(gx + 8, p.y - 8);
            ctx.stroke();
          }
        }

        // Glowing Parkour Indicator strips for One-Way Rock Parkour Stepping Ledges
        if (p.oneWay) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p.x, p.y, p.width, 4);
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(p.x + 10, p.y + 1, p.width - 20, 2);
          ctx.shadowBlur = 0;
        }

        // Cave ceiling stalactites
        if (p.y >= 1150 && p.height >= 35) {
          ctx.fillStyle = '#3d3429';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          for (let sx = 25; sx < p.width - 25; sx += 50) {
            const sLen = 6 + ((sx * 3) % 10);
            ctx.beginPath();
            ctx.moveTo(p.x + sx, p.y + p.height);
            ctx.lineTo(p.x + sx + 10, p.y + p.height + sLen);
            ctx.lineTo(p.x + sx + 20, p.y + p.height);
            ctx.fill();
            ctx.stroke();
          }
        }
      } else if (p.type === 'wood') {
        // Floating wooden suspension deck / Parkour Bridge
        ctx.fillStyle = '#a16207';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(p.x, p.y, p.width, 5);

        // Plank divisions
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.2;
        for (let wx = 24; wx < p.width; wx += 28) {
          ctx.beginPath();
          ctx.moveTo(p.x + wx, p.y);
          ctx.lineTo(p.x + wx, p.y + p.height);
          ctx.stroke();
        }

        // Parkour Green/Cyan Edge Highlight for quick visual parkour guidance
        ctx.fillStyle = '#10b981';
        ctx.fillRect(p.x, p.y, p.width, 3);

        // Steel end brackets
        ctx.fillStyle = '#64748b';
        ctx.fillRect(p.x, p.y, 8, p.height);
        ctx.fillRect(p.x + p.width - 8, p.y, 8, p.height);

      } else if (p.type === 'metal') {
        // Metallic steel suspension deck (Military concrete gray-blue)
        ctx.fillStyle = '#8ba3b0';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(p.x, p.y, p.width, 4);

        // Cross-brace rivets
        ctx.fillStyle = '#0f172a';
        for (let mx = 12; mx < p.width - 8; mx += 26) {
          ctx.beginPath();
          ctx.arc(p.x + mx, p.y + p.height / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Caution strip on bottom
        ctx.fillStyle = '#eab308';
        ctx.fillRect(p.x, p.y + p.height - 6, p.width, 6);
        ctx.fillStyle = '#000000';
        for (let hx = p.x; hx < p.x + p.width; hx += 16) {
          ctx.fillRect(hx, p.y + p.height - 6, 8, 6);
        }
      }
      
      ctx.strokeRect(p.x, p.y, p.width, p.height);
      ctx.restore();
    }
  }

  // Draw Persistent / Decaying Surface Blood Splat Decals on stone platforms
  private renderBloodDecals(ctx: CanvasRenderingContext2D, decals: BloodDecal[]) {
    if (!decals || decals.length === 0) return;
    const visibleW = (this.camera.width / this.camera.zoom) + 200;
    const visibleH = (this.camera.height / this.camera.zoom) + 200;
    const minX = this.camera.x - 100;
    const maxX = this.camera.x + visibleW;
    const minY = this.camera.y - 100;
    const maxY = this.camera.y + visibleH;

    ctx.save();
    for (const d of decals) {
      if (
        d.x + d.radius < minX ||
        d.x - d.radius > maxX ||
        d.y + d.radius < minY ||
        d.y - d.radius > maxY
      ) {
        continue;
      }

      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.strokeStyle = '#3b0707';
      ctx.lineWidth = 1.0;

      // Main central impact blotch
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();

      // Surrounding organic splat droplets
      for (const sp of d.splatPoints) {
        ctx.beginPath();
        ctx.arc(d.x + sp.dx, d.y + sp.dy, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Downward drip streak if present on wall/ledge
      if (d.dripLength && d.dripLength > 0) {
        ctx.beginPath();
        ctx.moveTo(d.x - 1.5, d.y);
        ctx.lineTo(d.x - 0.8, d.y + d.dripLength);
        ctx.arc(d.x, d.y + d.dripLength, 1.6, 0, Math.PI);
        ctx.lineTo(d.x + 1.5, d.y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  // Draw Steel Chains for floating suspension decks
  private renderChains(ctx: CanvasRenderingContext2D, chains: NonNullable<MapData['scenery']['chains']>) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#64748b';

    for (const chain of chains) {
      const linkH = 14;
      const linkW = 8;
      for (let cy = chain.y1; cy < chain.y2; cy += linkH) {
        ctx.beginPath();
        ctx.roundRect(chain.x - linkW / 2, cy, linkW, linkH, 4);
        ctx.fill();
        ctx.stroke();

        // Inner hollow hole
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(chain.x - linkW / 4, cy + 3, linkW / 2, linkH - 6, 2);
        ctx.fill();
        ctx.fillStyle = '#64748b';
      }
    }
    ctx.restore();
  }

  // Draw Destructible Wooden Crates
  private renderCrates(ctx: CanvasRenderingContext2D, crates: WoodenCrate[]) {
    for (const c of crates) {
      if (c.destroyed) continue;

      ctx.save();
      ctx.translate(c.x + c.width / 2, c.y + c.height / 2);

      // Wooden Crate Body
      ctx.fillStyle = '#92400e'; // pine wood
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
      ctx.strokeRect(-c.width / 2, -c.height / 2, c.width, c.height);

      // Inner lighter wood panel
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-c.width / 2 + 5, -c.height / 2 + 5, c.width - 10, c.height - 10);
      ctx.strokeRect(-c.width / 2 + 5, -c.height / 2 + 5, c.width - 10, c.height - 10);

      // Cross Diagonal Bracing (X)
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-c.width / 2 + 5, -c.height / 2 + 5);
      ctx.lineTo(c.width / 2 - 5, c.height / 2 - 5);
      ctx.moveTo(c.width / 2 - 5, -c.height / 2 + 5);
      ctx.lineTo(-c.width / 2 + 5, c.height / 2 - 5);
      ctx.stroke();

      // Steel Corner Brackets
      ctx.fillStyle = '#475569';
      const bSize = 8;
      // Top Left
      ctx.fillRect(-c.width / 2, -c.height / 2, bSize, bSize);
      // Top Right
      ctx.fillRect(c.width / 2 - bSize, -c.height / 2, bSize, bSize);
      // Bottom Left
      ctx.fillRect(-c.width / 2, c.height / 2 - bSize, bSize, bSize);
      // Bottom Right
      ctx.fillRect(c.width / 2 - bSize, c.height / 2 - bSize, bSize, bSize);

      // Stencil Loot Type Icon
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (c.lootType === 'health') {
        ctx.fillStyle = '#ef4444';
        ctx.fillText('➕', 0, 0);
      } else if (c.lootType === 'boost') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('⚡', 0, 0);
      } else if (c.lootType === 'grenade') {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('💣', 0, 0);
      } else {
        ctx.fillStyle = '#facc15';
        ctx.fillText('📦', 0, 0);
      }

      // Health bar if damaged
      if (c.health < c.maxHealth) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(-16, -c.height / 2 - 8, 32, 5);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-16, -c.height / 2 - 8, (c.health / c.maxHealth) * 32, 5);
      }

      ctx.restore();
    }
  }

  private renderScenery(ctx: CanvasRenderingContext2D, scenery: MapData['scenery']) {
    // 1. Left Concrete Fortress Bunker (x: 350, y: 350, w: 440, h: 230)
    if (scenery.leftBunker) {
      const bk = scenery.leftBunker;
      ctx.save();
      // Main concrete base
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.fillRect(bk.x, bk.y, bk.width, bk.height);
      ctx.strokeRect(bk.x, bk.y, bk.width, bk.height);

      // Top parapet concrete bevel
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bk.x - 15, bk.y - 12, bk.width + 30, 20);
      ctx.strokeRect(bk.x - 15, bk.y - 12, bk.width + 30, 20);

      // Smooth, Low Tactical Sandbags on Bunker Roof (Clean, flat walkable roof)
      ctx.fillStyle = '#854d0e';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      for (let rx = bk.x + 10; rx < bk.x + bk.width - 20; rx += 45) {
        ctx.beginPath();
        ctx.roundRect(rx, bk.y - 20, 42, 10, 4);
        ctx.fill();
        ctx.stroke();
      }

      // 3 Black Observation Window Slits (Mini Militia iconic bunker windows)
      ctx.fillStyle = '#0f172a';
      const slitW = 55;
      const slitH = 34;
      const startSlitX = bk.x + 60;
      for (let i = 0; i < 3; i++) {
        const sx = startSlitX + i * 110;
        ctx.fillRect(sx, bk.y + 45, slitW, slitH);
        ctx.strokeRect(sx, bk.y + 45, slitW, slitH);
        // Metal mesh grill
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + slitW / 2, bk.y + 45);
        ctx.lineTo(sx + slitW / 2, bk.y + 45 + slitH);
        ctx.moveTo(sx, bk.y + 45 + slitH / 2);
        ctx.lineTo(sx + slitW, bk.y + 45 + slitH / 2);
        ctx.stroke();
      }

      // Concrete panel seams & warning stripes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bk.x, bk.y + 120);
      ctx.lineTo(bk.x + bk.width, bk.y + 120);
      ctx.stroke();

      // Hazard yellow-black stripes on entrance
      ctx.fillStyle = '#eab308';
      ctx.fillRect(bk.x + 30, bk.y + bk.height - 24, bk.width - 60, 16);
      ctx.fillStyle = '#000000';
      for (let hx = bk.x + 30; hx < bk.x + bk.width - 60; hx += 24) {
        ctx.beginPath();
        ctx.moveTo(hx, bk.y + bk.height - 8);
        ctx.lineTo(hx + 12, bk.y + bk.height - 24);
        ctx.lineTo(hx + 20, bk.y + bk.height - 24);
        ctx.lineTo(hx + 8, bk.y + bk.height - 8);
        ctx.fill();
      }

      // Tall Watchtower Flagpole
      const poleX = bk.x + 80;
      const poleY1 = bk.y - 12;
      const poleY2 = poleY1 - 85;
      
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(poleX, poleY1);
      ctx.lineTo(poleX, poleY2);
      ctx.stroke();

      // Golden flagpole top sphere
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(poleX, poleY2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Fluttering Military Flag (Double-wave sine animation)
      ctx.fillStyle = '#dc2626'; // Deep Crimson Red
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(poleX, poleY2);
      
      const flagW = 54;
      const flagH = 34;
      for (let fx = 0; fx <= flagW; fx += 3) {
        // Double-wave sine equation
        const wave = Math.sin(fx * 0.12 - this.animTime * 11) * 4.5 * (fx / flagW);
        ctx.lineTo(poleX + fx, poleY2 + wave);
      }
      for (let fx = flagW; fx >= 0; fx -= 3) {
        const wave = Math.sin(fx * 0.12 - this.animTime * 11) * 4.5 * (fx / flagW);
        ctx.lineTo(poleX + fx, poleY2 + flagH + wave);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Stencil Star symbol on Red Flag
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const midWave = Math.sin(27 * 0.12 - this.animTime * 11) * 4.5 * (27 / flagW);
      ctx.fillText('★', poleX + 22, poleY2 + flagH / 2 + midWave);

      ctx.restore();
    }

    // 2. Right Timber Outpost Building (x: 3500, y: 880, w: 360, h: 270)
    if (scenery.rightOutpost) {
      const op = scenery.rightOutpost;
      ctx.save();
      // Stacked wooden logs facade
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      const logH = 26;
      for (let ly = op.y; ly < op.y + op.height; ly += logH) {
        const isDark = Math.floor((ly - op.y) / logH) % 2 === 0;
        ctx.fillStyle = isDark ? '#5c4331' : '#70533d';
        ctx.fillRect(op.x, ly, op.width, logH);
        ctx.strokeRect(op.x, ly, op.width, logH);

        // Circular cut log ends on edges
        ctx.fillStyle = '#8f6c53';
        ctx.beginPath();
        ctx.ellipse(op.x - 6, ly + logH / 2, 8, logH / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(op.x + op.width + 6, ly + logH / 2, 8, logH / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Outpost 3 Black Window Slits
      ctx.fillStyle = '#0f172a';
      const slitW = 46;
      const slitH = 32;
      for (let i = 0; i < 3; i++) {
        const sx = op.x + 40 + i * 105;
        ctx.fillRect(sx, op.y + 40, slitW, slitH);
        ctx.strokeRect(sx, op.y + 40, slitW, slitH);
      }

      // Rock corner reinforcements on Timber outpost
      ctx.fillStyle = '#a0a0a0';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.4;
      for (let rx = op.x - 10; rx < op.x + op.width + 10; rx += 45) {
        ctx.beginPath();
        ctx.arc(rx, op.y - 4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Tactical Draped Camouflage Netting
      ctx.fillStyle = '#166534'; // Forest Green
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.moveTo(op.x - 25, op.y + 12);
      ctx.lineTo(op.x + 85, op.y - 10);
      ctx.lineTo(op.x + 180, op.y + 15);
      
      // Hanging sway tassels/gaps
      const canopySegments = 16;
      const canopyStep = 205 / canopySegments;
      for (let i = canopySegments; i >= 0; i--) {
        const segX = op.x - 25 + i * canopyStep;
        // Swaying wave on bottom
        const sway = Math.sin(i * 0.5 + this.animTime * 3) * 5 + 14;
        ctx.lineTo(segX, op.y + sway + 16);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Khaki patch overlays on Camo Net
      ctx.fillStyle = '#854d0e'; // Khaki brown patches
      for (let i = 0; i < 4; i++) {
        const px = op.x - 15 + i * 48;
        const py = op.y + 4 + Math.sin(i + this.animTime) * 2;
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Cut Wood Log Piles
    if (scenery.woodPiles) {
      for (const wp of scenery.woodPiles) {
        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#92400e';

        // Bottom row logs
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(wp.x + i * 22, wp.y - 12, 22, 14);
          ctx.strokeRect(wp.x + i * 22, wp.y - 12, 22, 14);
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.ellipse(wp.x + i * 22, wp.y - 5, 4, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#92400e';
        }
        // Top row log
        ctx.fillRect(wp.x + 11, wp.y - 24, 22, 14);
        ctx.strokeRect(wp.x + 11, wp.y - 24, 22, 14);
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(wp.x + 11, wp.y - 17, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Trees
    if (scenery.trees) {
      for (const tree of scenery.trees) {
        ctx.save();
        ctx.translate(tree.x, tree.y);
        ctx.scale(tree.scale, tree.scale);

        // Trunk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-10, -90, 20, 90);

        // Lush leafy canopy circles
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(-22, -110, 36, 0, Math.PI * 2);
        ctx.arc(22, -110, 36, 0, Math.PI * 2);
        ctx.arc(0, -145, 45, 0, Math.PI * 2);
        ctx.fill();

        // Highlight leaves
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-10, -140, 25, 0, Math.PI * 2);
        ctx.arc(15, -120, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 5. Signs
    if (scenery.signs) {
      for (const sign of scenery.signs) {
        ctx.save();
        ctx.fillStyle = '#475569';
        ctx.fillRect(sign.x + 8, sign.y, 4, 25); // post
        
        // Board
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(sign.x - 36, sign.y - 20, 92, 22);
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2;
        ctx.strokeRect(sign.x - 36, sign.y - 20, 92, 22);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px Chakra Petch, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sign.text, sign.x + 10, sign.y - 6);
        ctx.restore();
      }
    }

    // 6. Mounted Tactical Spotlights & Cavern Ceiling Lanterns
    if (scenery.lamps) {
      for (const lamp of scenery.lamps) {
        ctx.save();
        // Radial Glow Light Pool
        const lampGlow = ctx.createRadialGradient(lamp.x, lamp.y + 8, 4, lamp.x, lamp.y + 8, 140);
        lampGlow.addColorStop(0, lamp.color + '77');
        lampGlow.addColorStop(0.4, lamp.color + '22');
        lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y + 8, 140, 0, Math.PI * 2);
        ctx.fill();

        // Ceiling/Structure Mounting Wire
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lamp.x, lamp.y - 22);
        ctx.lineTo(lamp.x, lamp.y);
        ctx.stroke();

        // Iron Lamp Housing Box
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(lamp.x - 7, lamp.y, 14, 10);
        ctx.strokeRect(lamp.x - 7, lamp.y, 14, 10);

        // Glowing Bulb Core
        ctx.fillStyle = lamp.color;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y + 10, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 7. Directional Light Guide Markers (Parkour & Navigation Beacons)
    this.renderGuideMarkers(ctx, scenery.guideMarkers);
  }

  // Render Glowing Directional Guide Markers for smooth parkour and path navigation
  private renderGuideMarkers(ctx: CanvasRenderingContext2D, guideMarkers?: MapData['scenery']['guideMarkers']) {
    if (!guideMarkers || guideMarkers.length === 0) return;

    for (const gm of guideMarkers) {
      if (
        gm.x < this.camera.x - 120 ||
        gm.x > this.camera.x + this.camera.width + 120 ||
        gm.y < this.camera.y - 120 ||
        gm.y > this.camera.y + this.camera.height + 120
      ) {
        continue;
      }

      ctx.save();
      const pulse = Math.sin(this.animTime * 5.5 + gm.x * 0.05) * 0.25 + 0.75;
      const arrowShift = Math.sin(this.animTime * 7.5) * 4.5;

      ctx.translate(gm.x, gm.y);

      // Glowing Neon Glass Badge
      const boxW = 160;
      const boxH = 32;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = gm.color;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = gm.color;
      ctx.shadowBlur = 14 * pulse;

      ctx.beginPath();
      ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Side Neon Light Bars
      ctx.fillStyle = gm.color;
      ctx.fillRect(-boxW / 2 + 3, -boxH / 2 + 4, 3, boxH - 8);
      ctx.fillRect(boxW / 2 - 6, -boxH / 2 + 4, 3, boxH - 8);
      ctx.restore();

      // Draw Glowing Animated Arrow Chevrons
      ctx.save();
      ctx.strokeStyle = gm.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = gm.color;
      ctx.shadowBlur = 12 * pulse;

      const iconX = -boxW / 2 + 22;
      ctx.translate(iconX, 0);

      if (gm.direction === 'up' || gm.direction === 'up-right' || gm.direction === 'up-left') {
        const offset = (gm.direction === 'up-right') ? arrowShift : -arrowShift;
        ctx.beginPath();
        ctx.moveTo(-6, 4 + offset * 0.5);
        ctx.lineTo(0, -5 + offset * 0.5);
        ctx.lineTo(6, 4 + offset * 0.5);
        ctx.stroke();
      } else if (gm.direction === 'down' || gm.direction === 'down-right' || gm.direction === 'down-left') {
        ctx.beginPath();
        ctx.moveTo(-6, -4 + arrowShift * 0.5);
        ctx.lineTo(0, 5 + arrowShift * 0.5);
        ctx.lineTo(6, -4 + arrowShift * 0.5);
        ctx.stroke();
      } else if (gm.direction === 'right') {
        ctx.beginPath();
        ctx.moveTo(-5 + arrowShift * 0.5, -6);
        ctx.lineTo(4 + arrowShift * 0.5, 0);
        ctx.lineTo(-5 + arrowShift * 0.5, 6);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(5 - arrowShift * 0.5, -6);
        ctx.lineTo(-4 - arrowShift * 0.5, 0);
        ctx.lineTo(5 - arrowShift * 0.5, 6);
        ctx.stroke();
      }
      ctx.restore();

      // Render Arabic Directional Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(gm.labelAr, 12, 0);

      ctx.restore();
    }
  }

  // Camouflage Bushes (Rendered in front of characters so soldiers can hide inside!)
  private renderBushes(ctx: CanvasRenderingContext2D, bushes: MapData['scenery']['bushes']) {
    for (const b of bushes) {
      // Frustum culling
      if (
        b.x + b.width < this.camera.x - 50 ||
        b.x > this.camera.x + this.camera.width + 50 ||
        b.y + b.height < this.camera.y - 50 ||
        b.y > this.camera.y + this.camera.height + 50
      ) {
        continue;
      }

      ctx.save();
      // Semi-transparent so players can see their silhouette inside
      ctx.globalAlpha = 0.88;

      const clusterCount = 5;
      const radius = b.height * 0.55;

      // Dark foliage background layer
      ctx.fillStyle = '#14532d';
      for (let i = 0; i < clusterCount; i++) {
        const cx = b.x + (b.width / (clusterCount + 1)) * (i + 1);
        const cy = b.y - b.height * 0.35 + (i % 2 === 0 ? -4 : 4);
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mid vibrant cartoon leaves
      ctx.fillStyle = '#16a34a';
      for (let i = 0; i < clusterCount; i++) {
        const cx = b.x + (b.width / (clusterCount + 1)) * (i + 1) + (i % 2 === 0 ? -3 : 3);
        const cy = b.y - b.height * 0.42;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      // Top sun-kissed leaf highlights
      ctx.fillStyle = '#4ade80';
      for (let i = 0; i < clusterCount; i++) {
        const cx = b.x + (b.width / (clusterCount + 1)) * (i + 1);
        const cy = b.y - b.height * 0.55;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Leaf cluster specks
      ctx.fillStyle = '#86efac';
      for (let i = 0; i < clusterCount; i++) {
        const cx = b.x + (b.width / (clusterCount + 1)) * (i + 1) + 4;
        const cy = b.y - b.height * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderTacticalCovers(ctx: CanvasRenderingContext2D, covers?: TacticalCover[], isForegroundPass: boolean = false) {
    if (!covers || covers.length === 0) return;

    for (const c of covers) {
      if (c.destroyed) continue;

      ctx.save();
      ctx.translate(c.x, c.y);

      if (!isForegroundPass) {
        // Back/Base 3D Depth Pass (Draw ground contact shadow, rear structure, top bevel)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(c.width / 2, c.height + 4, c.width / 2 + 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (c.type === 'sandbag_bunker') {
          const bagRows = 3;
          const bagH = c.height / bagRows;
          for (let r = 0; r < bagRows; r++) {
            const ry = r * bagH;
            const cols = 3 + (r % 2);
            const bagW = c.width / cols;
            for (let i = 0; i < cols; i++) {
              const bx = i * bagW;
              ctx.fillStyle = r % 2 === 0 ? '#854d0e' : '#a16207';
              ctx.strokeStyle = '#3f2c00';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.roundRect(bx + 1, ry + 1, bagW - 2, bagH - 2, 4);
              ctx.fill();
              ctx.stroke();

              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(bx + 4, ry + bagH / 2);
              ctx.lineTo(bx + bagW - 4, ry + bagH / 2);
              ctx.stroke();
            }
          }

          ctx.fillStyle = '#b45309';
          ctx.strokeStyle = '#3f2c00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-4, -4, c.width + 8, 12, 5);
          ctx.fill();
          ctx.stroke();
        } else if (c.type === 'steel_barrier' || c.type === 'concrete_jersey') {
          const isSteel = c.type === 'steel_barrier';
          ctx.fillStyle = isSteel ? '#334155' : '#64748b';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.2;

          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(c.width - 12, 0);
          ctx.lineTo(c.width, c.height);
          ctx.lineTo(0, c.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSteel ? '#475569' : '#94a3b8';
          ctx.fillRect(12, 0, c.width - 24, 10);

          ctx.fillStyle = '#facc15';
          ctx.fillRect(4, c.height - 18, c.width - 8, 12);
          ctx.fillStyle = '#000000';
          for (let sx = 8; sx < c.width - 12; sx += 18) {
            ctx.beginPath();
            ctx.moveTo(sx, c.height - 6);
            ctx.lineTo(sx + 8, c.height - 18);
            ctx.lineTo(sx + 14, c.height - 18);
            ctx.lineTo(sx + 6, c.height - 6);
            ctx.fill();
          }

          if (!isSteel) {
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(20, -4, 6, Math.PI, 0);
            ctx.arc(c.width - 20, -4, 6, Math.PI, 0);
            ctx.stroke();
          }
        } else if (c.type === 'cargo_container') {
          ctx.fillStyle = '#1e3a8a';
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 2.5;
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.strokeRect(0, 0, c.width, c.height);

          ctx.fillStyle = '#1d4ed8';
          for (let rx = 8; rx < c.width - 8; rx += 14) {
            ctx.fillRect(rx, 2, 6, c.height - 4);
          }

          ctx.fillStyle = '#facc15';
          ctx.font = '900 9px Chakra Petch, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(c.labelAr || 'U.S. ARMY 3D', c.width / 2, c.height / 2);
        } else if (c.type === 'missile_pod') {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.strokeRect(0, 0, c.width, c.height);

          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(10, 10, c.width - 20, 8);
          ctx.shadowBlur = 0;
        }
      } else {
        // Foreground Occlusion Pass (Rendered OVER crouching players)
        if (c.type === 'sandbag_bunker') {
          ctx.fillStyle = '#78350f';
          ctx.strokeStyle = '#271900';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(0, c.height - 24, c.width, 24, 4);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(12, c.height - 24);
          ctx.lineTo(12, c.height);
          ctx.moveTo(c.width - 12, c.height - 24);
          ctx.lineTo(c.width - 12, c.height);
          ctx.stroke();
        } else if (c.type === 'steel_barrier' || c.type === 'concrete_jersey') {
          ctx.fillStyle = c.type === 'steel_barrier' ? '#1e293b' : '#475569';
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 2;
          ctx.fillRect(0, c.height - 22, c.width, 22);
          ctx.strokeRect(0, c.height - 22, c.width, 22);
        } else if (c.type === 'cargo_container') {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(2, c.height - 22, c.width - 4, 20);
        }
      }

      ctx.restore();
    }
  }

  private renderBarrels(ctx: CanvasRenderingContext2D, barrels: ExplosiveBarrel[]) {
    for (const b of barrels) {
      if (b.exploded) continue;

      ctx.save();
      ctx.translate(b.x + b.width / 2, b.y + b.height / 2);

      // Red explosive barrel body
      const barrelGrad = ctx.createLinearGradient(-b.width / 2, 0, b.width / 2, 0);
      barrelGrad.addColorStop(0, '#991b1b');
      barrelGrad.addColorStop(0.5, '#dc2626');
      barrelGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = barrelGrad;

      // Rounded barrel cylinder
      ctx.beginPath();
      ctx.roundRect(-b.width / 2, -b.height / 2, b.width, b.height, 6);
      ctx.fill();

      // Metal bands
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-b.width / 2, -b.height / 2 + 8, b.width, 4);
      ctx.fillRect(-b.width / 2, b.height / 2 - 12, b.width, 4);

      // Yellow hazard flame symbol
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔥', 0, 0);

      // Health bar if damaged
      if (b.health < b.maxHealth) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-16, -b.height / 2 - 8, 32, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-16, -b.height / 2 - 8, (b.health / b.maxHealth) * 32, 5);
      }

      ctx.restore();
    }
  }

  private renderDynamic3DShadows(
    ctx: CanvasRenderingContext2D,
    platforms: Platform[],
    characters: CharacterState[],
    pickups: Pickup[]
  ) {
    ctx.save();
    
    // 3D Shadows for Characters
    for (const char of characters) {
      if (char.isDead) continue;
      const charFeetX = char.x + char.width / 2;
      const charFeetY = char.y + char.height;

      let nearestGroundY = Infinity;
      for (const plat of platforms) {
        if (charFeetX >= plat.x && charFeetX <= plat.x + plat.width) {
          if (plat.y >= charFeetY - 12 && plat.y < nearestGroundY) {
            nearestGroundY = plat.y;
          }
        }
      }

      if (nearestGroundY !== Infinity) {
        const altitude = Math.max(0, nearestGroundY - charFeetY);
        if (altitude < 380) {
          const altitudeRatio = altitude / 380;
          const shadowScaleX = (1.0 - altitudeRatio * 0.35) * (char.isCrouching ? 1.2 : 1.0);
          const shadowScaleY = (1.0 - altitudeRatio * 0.45);
          const shadowAlpha = Math.max(0.06, 0.44 * (1.0 - altitudeRatio));

          ctx.fillStyle = `rgba(5, 10, 15, ${shadowAlpha})`;
          ctx.beginPath();
          ctx.ellipse(charFeetX, nearestGroundY + 1, 16 * shadowScaleX, 5.5 * shadowScaleY, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3D Shadows for floating dropped weapons & pickups
    for (const p of pickups) {
      if (!p.active) continue;
      const pCenterX = p.x + p.width / 2;
      const pBottomY = p.y + p.height;

      let nearestGroundY = Infinity;
      for (const plat of platforms) {
        if (pCenterX >= plat.x && pCenterX <= plat.x + plat.width) {
          if (plat.y >= pBottomY - 10 && plat.y < nearestGroundY) {
            nearestGroundY = plat.y;
          }
        }
      }

      if (nearestGroundY !== Infinity) {
        const altitude = Math.max(0, nearestGroundY - pBottomY);
        if (altitude < 280) {
          const altRatio = altitude / 280;
          const sScale = 1.0 - altRatio * 0.3;
          const sAlpha = Math.max(0.08, 0.38 * (1.0 - altRatio));
          ctx.fillStyle = `rgba(5, 10, 15, ${sAlpha})`;
          ctx.beginPath();
          ctx.ellipse(pCenterX, nearestGroundY + 1, 14 * sScale, 4.5 * sScale, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  private renderPickups(ctx: CanvasRenderingContext2D, pickups: Pickup[]) {
    for (const p of pickups) {
      if (!p.active) continue;

      ctx.save();
      const bobY = Math.sin(this.animTime * 3.5 + p.id) * 5;
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2 + bobY);

      // Radial Ground Glow Aura
      const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
      if (p.type === 'health') {
        glow.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
        glow.addColorStop(1, 'rgba(34, 197, 94, 0)');
      } else if (p.type === 'boost') {
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (p.type === 'weapon') {
        if (p.weapon === 'rocket') {
          glow.addColorStop(0, 'rgba(234, 179, 8, 0.6)');
        } else if (p.weapon === 'sniper') {
          glow.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        } else if (p.weapon === 'shotgun') {
          glow.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
        } else {
          glow.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
        }
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        glow.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
        glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
      }
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();

      if (p.type === 'health') {
        // Authentic Medkit Pack
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.roundRect(-15, -11, 30, 22, 4);
        ctx.fill();
        ctx.stroke();

        // Steel Latches
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-11, -13, 5, 4);
        ctx.fillRect(6, -13, 5, 4);

        // Bold Red Cross
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-3, -7, 6, 14);
        ctx.fillRect(-7, -3, 14, 6);

        // Name tag
        this.renderItemBadge(ctx, '➕ MEDKIT', '#22c55e', 0, -22);

      } else if (p.type === 'boost') {
        // Fuel / Nitro Booster Canister
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.roundRect(-9, -15, 18, 30, 6);
        ctx.fill();
        ctx.stroke();

        // Gauge / Level glass
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-5, -8, 10, 16);

        // Nozzle top
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-4, -18, 8, 4);

        // Lightning Bolt Symbol
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);

        this.renderItemBadge(ctx, '⚡ NITRO BOOST', '#38bdf8', 0, -26);

      } else if (p.type === 'ammo') {
        // Heavy Olive Drab Ammo Can
        ctx.fillStyle = '#166534';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.roundRect(-16, -11, 32, 22, 3);
        ctx.fill();
        ctx.stroke();

        // Metal Top Handle
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, -14, 16, 4);

        // Stencil Text
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 9px Chakra Petch, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AMMO', 0, 1);

        this.renderItemBadge(ctx, '📦 AMMO PACK', '#eab308', 0, -24);

      } else if (p.type === 'weapon' && p.weapon) {
        // 3D FLOATING & SPINNING WEAPON HOLOGRAM (NO BOXES!)
        ctx.save();
        const spinCos = Math.cos(this.animTime * 2.2 + p.id); // 3D Y-axis spinning perspective

        // 3D Holographic projection ring on ground underneath
        const discColor = p.weapon === 'rocket' ? '#f59e0b' : p.weapon === 'sniper' ? '#06b6d4' : p.weapon === 'shotgun' ? '#a855f7' : '#22c55e';
        ctx.strokeStyle = discColor;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 16, 20, 6, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Holographic vertical emitter ray
        const beamGrad = ctx.createLinearGradient(0, 16, 0, -20);
        beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-16, 16);
        ctx.lineTo(16, 16);
        ctx.lineTo(8, -20);
        ctx.lineTo(-8, -20);
        ctx.closePath();
        ctx.fill();

        // 3D Perspective Rotation for Weapon
        ctx.save();
        const clampedScaleX = Math.abs(spinCos) > 0.2 ? spinCos * 1.15 : 0.2 * Math.sign(spinCos || 1) * 1.15;
        ctx.scale(clampedScaleX, 1.15);
        this.renderWeaponSprite(ctx, p.weapon);
        ctx.restore();

        // 3D floating badge
        const badgeColor = p.weapon === 'rocket' ? '#f59e0b' : p.weapon === 'sniper' ? '#38bdf8' : p.weapon === 'shotgun' ? '#c084fc' : '#4ade80';
        const wName = WEAPON_CONFIGS[p.weapon]?.nameAr || p.weapon.toUpperCase();
        this.renderItemBadge(ctx, `⚔️ ${wName}`, badgeColor, 0, -24);

        ctx.restore();

      } else if (p.type === 'grenade') {
        // Detailed Pineapple Frag Grenade
        ctx.fillStyle = '#166534';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Grid Segments
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 2); ctx.lineTo(10, 2);
        ctx.moveTo(0, -9); ctx.lineTo(0, 13);
        ctx.stroke();

        // Safety lever & pin cap
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(-3, -12, 6, 6);
        ctx.strokeRect(-3, -12, 6, 6);

        // Blinking Red LED
        const blink = Math.sin(this.animTime * 14) > 0;
        ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        this.renderItemBadge(ctx, '💣 GRENADE', '#22c55e', 0, -22);
      }

      ctx.restore();
    }
  }

  private renderItemBadge(ctx: CanvasRenderingContext2D, text: string, color: string, x: number, y: number) {
    ctx.save();
    ctx.font = 'bold 10px Chakra Petch, Cairo, sans-serif';
    const textW = ctx.measureText(text).width;
    const padW = textW + 14;
    const padH = 16;

    // Dark pill container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - padW / 2, y - padH / 2, padW, padH, 6);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * Renders the iconic Mini Militia style 2D cartoon soldier with custom avatars!
   */
  private renderCharacter(
    ctx: CanvasRenderingContext2D,
    char: CharacterState,
    crosshairPos?: { x: number; y: number }
  ) {
    ctx.save();
    const centerX = char.x + char.width / 2;
    const centerY = char.y + char.height / 2;
    ctx.translate(centerX, centerY);

    const isFacingRight = char.facingRight;
    const facingMultiplier = isFacingRight ? 1 : -1;

    // Draw sliding holographic shadows behind the player
    if (char.isSliding) {
      const dir = char.slideDirection || (char.facingRight ? 1 : -1);
      const trailCount = 2;
      for (let t = 1; t <= trailCount; t++) {
        ctx.save();
        // Shift back along direction of slide
        ctx.translate(-dir * t * 14, 0);
        
        // Draw a glowing silhouette of the sliding torso and head
        ctx.fillStyle = `rgba(56, 189, 248, ${0.35 / t})`;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.5 / t})`;
        ctx.lineWidth = 1.8;
        
        // Crouching Torso Silhouette
        const torsoW = 19;
        const torsoH = 15; // Crouched height
        ctx.beginPath();
        ctx.roundRect(-torsoW / 2, 0, torsoW, torsoH, 7.5);
        ctx.fill();
        ctx.stroke();
        
        // Head Silhouette
        const headX = 2;
        const headY = -12;
        ctx.beginPath();
        ctx.roundRect(headX - 10.5, headY - 10.5, 21, 21, 10.5); // Squircle head
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // Dynamic 3D Environment Motion: Landing Squash & Stretch + Crouch Shift
    let crouchShift = char.isCrouching ? 8 : 0;
    let squashX = 1.0;
    let squashY = 1.0;

    if (char.landingFlexTimer && char.landingFlexTimer > 0) {
      const flexPhase = char.landingFlexTimer / 0.22; // 1.0 down to 0.0
      const flexFactor = Math.sin(flexPhase * Math.PI);
      crouchShift += flexFactor * 7.5; // knee cushion compression
      squashY = 1.0 - flexFactor * 0.16; // compressed height
      squashX = 1.0 + flexFactor * 0.14; // expanded width
    } else if (char.isJetpacking && char.vy < -200) {
      // Upward flight stretch
      squashY = 1.08;
      squashX = 0.94;
    }

    ctx.scale(squashX, squashY);

    // Aerodynamic Flight Tilt Angle (tilts body dynamically into direction of flight or climb)
    if (char.flightTiltAngle) {
      ctx.rotate(char.flightTiltAngle);
    }

    // Laser Sight Line & Dynamic Accuracy Crosshair
    if (char.isPlayer || char.aiProfile) {
      ctx.save();
      const currW = char.weapons[char.currentWeaponIndex] || 'pistol';
      const aimDist = currW === 'sniper' ? 440 : 280;
      const muzzleX = Math.cos(char.aimAngle) * 28;
      const muzzleY = Math.sin(char.aimAngle) * 28 + crouchShift;
      ctx.strokeStyle = char.isPlayer ? 'rgba(56, 189, 248, 0.5)' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(muzzleX, muzzleY);
      ctx.lineTo(
        muzzleX + Math.cos(char.aimAngle) * aimDist,
        muzzleY + Math.sin(char.aimAngle) * aimDist
      );
      ctx.stroke();

      // Dynamic Weapon Accuracy Crosshair (expands when moving/firing, shrinks when standing still)
      if (char.isPlayer) {
        const isMoving = Math.abs(char.vx) > 0.4 || Math.abs(char.vy) > 0.4;
        const isFiring = char.muzzleFlashTimer > 0;
        const spreadRadius = 6 + (isMoving ? 10 : 0) + (isFiring ? 14 : 0);
        const targetX = muzzleX + Math.cos(char.aimAngle) * aimDist;
        const targetY = muzzleY + Math.sin(char.aimAngle) * aimDist;
        const crosshairColor = (isMoving || isFiring) ? '#f59e0b' : '#38bdf8';
        const holoGlow = (isMoving || isFiring) ? 'rgba(245, 158, 11, ' : 'rgba(56, 189, 248, ';
        const holoPulse = 0.85 + Math.sin(this.animTime * 6) * 0.15;

        ctx.save();

        // 3D Holographic Outer Collimator Ring with Rotating Brackets
        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate(this.animTime * 1.8);
        ctx.strokeStyle = `${holoGlow}${0.45 * holoPulse})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, spreadRadius + 10, -Math.PI * 0.25, Math.PI * 0.25);
        ctx.arc(0, 0, spreadRadius + 10, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        // Outer Cyber Corner Triangles
        ctx.fillStyle = `${holoGlow}${0.6 * holoPulse})`;
        ctx.beginPath();
        ctx.moveTo(0, -spreadRadius - 12);
        ctx.lineTo(-3, -spreadRadius - 16);
        ctx.lineTo(3, -spreadRadius - 16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Solid crosshair precision brackets
        ctx.strokeStyle = crosshairColor;
        ctx.fillStyle = crosshairColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        const tickLen = 6;
        // Top tick
        ctx.beginPath();
        ctx.moveTo(targetX, targetY - spreadRadius - tickLen);
        ctx.lineTo(targetX, targetY - spreadRadius);
        // Bottom tick
        ctx.moveTo(targetX, targetY + spreadRadius);
        ctx.lineTo(targetX, targetY + spreadRadius + tickLen);
        // Left tick
        ctx.moveTo(targetX - spreadRadius - tickLen, targetY);
        ctx.lineTo(targetX - spreadRadius, targetY);
        // Right tick
        ctx.moveTo(targetX + spreadRadius, targetY);
        ctx.lineTo(targetX + spreadRadius + tickLen, targetY);
        ctx.stroke();

        // Center precision glowing dot
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Holographic Target Range & Status Tag
        const distanceM = (aimDist / 20).toFixed(1);
        ctx.font = '900 7.5px Chakra Petch, monospace';
        ctx.fillStyle = `${holoGlow}0.95)`;
        ctx.textAlign = 'center';
        ctx.fillText(`RNG: ${distanceM}m • LOCKED`, targetX, targetY + spreadRadius + 16);

        ctx.restore();
      } else {
        // Bot crosshair dot
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(
          muzzleX + Math.cos(char.aimAngle) * aimDist,
          muzzleY + Math.sin(char.aimAngle) * aimDist,
          3.5, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
    }

    const currWeapon = char.weapons[char.currentWeaponIndex] || "pistol";
    drawSoldier2D(ctx, {
      skinId: char.skinId || (char.isPlayer ? settingsManager.getSettings().equippedSkin : undefined) || 'woodland_camo',
      camoColor: char.camoColor,
      headgear: char.headgear,
      bodyArmor: char.bodyArmor,
      eyewear: char.eyewear,
      sunglasses: char.sunglasses,
      beard: char.beard,
      jetpackStyle: char.jetpackStyle,
      skinTone: char.skinTone,
      weapon: currWeapon,
      aimAngle: char.aimAngle,
      isFacingRight: char.facingRight,
      isJetpacking: char.isJetpacking,
      isGrounded: char.isGrounded,
      walkCycle: char.walkCycle,
      isCrouching: char.isCrouching,
      recoilOffset: char.recoilOffset,
      muzzleFlashTimer: char.muzzleFlashTimer,
      trailColor: char.trailColor,
      animTime: this.animTime,
      charAvatarIndex: char.charAvatarIndex,
      scale: 1.0,
    });

    // Restore character body transform
    ctx.restore();
    
    // Player Tag & Overhead Health Bar (Zoom-independent & Perfectly Stable/Crisp)
    ctx.save();
    const currentZoom = this.camera.zoom || 1.0;
    // Translate in world space relative to character top center
    ctx.translate(Math.round(char.x + char.width / 2), Math.round(char.y - 12));
    ctx.scale(1 / currentZoom, 1 / currentZoom);

    if (char.inBush) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px Cairo, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌿', 0, -32);
    }
    if (char.isPlayer) {
      const bob = Math.sin(this.animTime * 8) * 3;
      // Golden Crown / Star Tag for Main Character
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-6, -30 + bob);
      ctx.lineTo(6, -30 + bob);
      ctx.lineTo(0, -22 + bob);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing Cyan Beacon Pointer
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -32 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = 'bold 12px Cairo, Arial, sans-serif';
    ctx.textAlign = 'center';
    let badgeColor = '#38bdf8';
    if (char.id === 'player-1') badgeColor = '#22c55e';
    else if (char.id === 'player-2') badgeColor = '#ef4444';
    else if (char.id === 'player-3') badgeColor = '#f59e0b';
    else if (char.id === 'player-4') badgeColor = '#a855f7';
    
    // Add black text border to make names super clear and non-glitched on any background
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.strokeText(char.name, 0, -8);
    ctx.fillStyle = badgeColor;
    ctx.fillText(char.name, 0, -8);
    
    const barW = 44;
    const barH = 6;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(-barW / 2, -4, barW, barH);
    const hpPct = Math.max(0, Math.min(1, char.health / char.maxHealth));
    ctx.fillStyle = hpPct > 0.5 ? '#10b981' : (hpPct > 0.25 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(-barW / 2, -4, barW * hpPct, barH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-barW / 2, -4, barW, barH);

    // Overhead Jetpack Fuel Gauge (reveals itself dynamically when fuel is consumed)
    if (char.fuel < (char.maxFuel || 100)) {
      const fBarW = 44;
      const fBarH = 4;
      const fBarY = 4; // Positioned immediately below the health bar (which spans y=-4 to y=2)
      
      // Draw background track
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(-fBarW / 2, fBarY, fBarW, fBarH);
      
      const fuelPct = Math.max(0, Math.min(1, char.fuel / (char.maxFuel || 100)));
      // Dynamic color theme: Red on depletion lock, Warning Amber on low fuel, Neon Cyan on active charge
      const fuelColor = char.isFuelDepleted ? '#ef4444' : (fuelPct < 0.3 ? '#f59e0b' : '#06b6d4');
      ctx.fillStyle = fuelColor;
      ctx.fillRect(-fBarW / 2, fBarY, fBarW * fuelPct, fBarH);
      
      // Draw border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-fBarW / 2, fBarY, fBarW, fBarH);
    }

    // Overhead Tactical Reload Progress Bar (Gives outstanding combat feedback)
    if (char.isReloading) {
      const reloadProg = Math.max(0, Math.min(1, 1 - (char.reloadTimer / (char.reloadDuration || 1))));
      ctx.save();
      ctx.translate(0, -22); // Positioned high above health bar

      const rBarW = 54;
      const rBarH = 6;
      
      // Draw background track
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-rBarW / 2, -rBarH / 2, rBarW, rBarH);
      
      // Draw smooth progress fill
      const reloadColor = reloadProg > 0.85 ? '#22c55e' : '#facc15';
      ctx.fillStyle = reloadColor;
      ctx.fillRect(-rBarW / 2, -rBarH / 2, rBarW * reloadProg, rBarH);
      
      // Draw border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-rBarW / 2, -rBarH / 2, rBarW, rBarH);

      // Draw pulsing Arabic reloading text overlay
      ctx.font = '900 8px Cairo, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.8;
      ctx.strokeText('🔄 تلقيم...', 0, -8);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🔄 تلقيم...', 0, -8);

      ctx.restore();
    }

    ctx.restore();
  }

  private render3DHolographicWeaponHUD(
    ctx: CanvasRenderingContext2D,
    char: CharacterState,
    weapon: WeaponType,
    weaponScale: number,
    isFacingRight: boolean
  ) {
    const currentAmmo = char.ammo[weapon] ?? 0;
    const reserveAmmo = char.reserveAmmo[weapon] ?? 0;
    const cfg = WEAPON_CONFIGS[weapon];
    const magSize = cfg?.magazineSize || 10;
    const ammoPct = Math.max(0, Math.min(1, currentAmmo / magSize));

    // Holographic animation pulse
    const holoPulse = 0.85 + Math.sin(this.animTime * 6) * 0.15;
    const scanlineY = ((this.animTime * 35) % 24) - 12;
    const isLowAmmo = currentAmmo <= 3 && !char.isReloading;
    const isCriticalEmpty = currentAmmo === 0 && !char.isReloading;
    const isFiring = char.muzzleFlashTimer > 0;
    const hitFlinch = (char.hitFlinchTimer || 0) > 0;

    // Primary holographic HUD colors
    let holoBaseColor = 'rgba(6, 182, 212, '; // Cyan
    let holoBorderColor = '#38bdf8';
    let holoTextColor = '#e0f2fe';
    let glowColor = '#06b6d4';

    if (isCriticalEmpty) {
      holoBaseColor = 'rgba(239, 68, 68, ';
      holoBorderColor = '#f87171';
      holoTextColor = '#fecaca';
      glowColor = '#ef4444';
    } else if (isLowAmmo) {
      holoBaseColor = 'rgba(245, 158, 11, ';
      holoBorderColor = '#fbbf24';
      holoTextColor = '#fef3c7';
      glowColor = '#f59e0b';
    } else if (char.isReloading) {
      holoBaseColor = 'rgba(168, 85, 247, ';
      holoBorderColor = '#c084fc';
      holoTextColor = '#f3e8ff';
      glowColor = '#a855f7';
    }

    // Jitter/Glitch offset when taking damage or firing
    let glitchDx = 0;
    let glitchDy = 0;
    if (hitFlinch || isFiring) {
      glitchDx = (Math.random() - 0.5) * 2.5;
      glitchDy = (Math.random() - 0.5) * 2.5;
    }

    ctx.save();
    // Anchor on weapon receiver/barrel rail
    const holoAnchorX = 14 + glitchDx;
    const holoAnchorY = -22 + glitchDy;

    // 1. Holographic Laser Projection Emitter Rays from gun receiver
    ctx.save();
    ctx.strokeStyle = `${holoBaseColor}${0.45 * holoPulse})`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(holoAnchorX - 16, holoAnchorY + 12);
    ctx.moveTo(18, -2);
    ctx.lineTo(holoAnchorX + 16, holoAnchorY + 12);
    ctx.stroke();
    ctx.restore();

    // Emitter base micro-nodes on gun rail
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(6, -2, 1.5, 0, Math.PI * 2);
    ctx.arc(18, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. 3D Floating Isometric Holographic Panel
    ctx.translate(holoAnchorX, holoAnchorY);
    
    // 3D Perspective Skew & elevation
    ctx.transform(1, 0, -0.16, 0.94, 0, 0);

    if (char.isReloading) {
      // ==========================================
      // 3D HOLOGRAPHIC RELOAD MATRIX RING
      // ==========================================
      const reloadProg = Math.max(0, Math.min(1, 1 - (char.reloadTimer / (char.reloadDuration || 1))));
      
      // Hologram Disc Ambient Glow
      const reloadGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
      reloadGlow.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      reloadGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = reloadGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Outer cyber ring with rotating brackets
      ctx.save();
      ctx.rotate(this.animTime * 4.5);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 16, Math.PI, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();

      // Inner Active Reload Progress Arc
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + reloadProg * Math.PI * 2);
      ctx.stroke();

      // Digital % text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 8.5px Chakra Petch, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(reloadProg * 100)}%`, 0, 0);

      // Floating Arabic Reload Text
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 7px Cairo, sans-serif';
      ctx.fillText('جاري التلقيم ⚡', 0, -20);
    } else {
      // ==========================================
      // 3D HOLOGRAPHIC AMMO & CHAMBER HUD CARD
      // ==========================================
      const cardW = 46;
      const cardH = 22;

      // Holographic Translucent Backplate
      ctx.fillStyle = `${holoBaseColor}${0.2 * holoPulse})`;
      ctx.beginPath();
      ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, [4, 1, 4, 1]);
      ctx.fill();

      // Holographic Grid scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(-cardW / 2 + 2, -cardH / 2 + 4, cardW - 4, 1);
      ctx.fillRect(-cardW / 2 + 2, -cardH / 2 + 10, cardW - 4, 1);
      ctx.fillRect(-cardW / 2 + 2, -cardH / 2 + 16, cardW - 4, 1);

      // Active vertical scanning beam
      ctx.fillStyle = `${holoBaseColor}${0.45 * holoPulse})`;
      ctx.fillRect(-cardW / 2 + 1, scanlineY, cardW - 2, 1.5);

      // Cyber Corner Brackets [ ]
      ctx.strokeStyle = holoBorderColor;
      ctx.lineWidth = 1.4;
      const bracketSize = 4;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(-cardW / 2 + bracketSize, -cardH / 2);
      ctx.lineTo(-cardW / 2, -cardH / 2);
      ctx.lineTo(-cardW / 2, -cardH / 2 + bracketSize);
      // Top-Right
      ctx.moveTo(cardW / 2 - bracketSize, -cardH / 2);
      ctx.lineTo(cardW / 2, -cardH / 2);
      ctx.lineTo(cardW / 2, -cardH / 2 + bracketSize);
      // Bottom-Left
      ctx.moveTo(-cardW / 2, cardH / 2 - bracketSize);
      ctx.lineTo(-cardW / 2, cardH / 2);
      ctx.lineTo(-cardW / 2 + bracketSize, cardH / 2);
      // Bottom-Right
      ctx.moveTo(cardW / 2, cardH / 2 - bracketSize);
      ctx.lineTo(cardW / 2, cardH / 2);
      ctx.lineTo(cardW / 2 - bracketSize, cardH / 2);
      ctx.stroke();

      // Digital Monospace Ammo Numbers
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 11.5px Chakra Petch, monospace';
      
      // Ammo Text Shadow Glow & Main Text
      ctx.fillStyle = `${holoBaseColor}0.8)`;
      ctx.fillText(`${currentAmmo}`, -9, -1.5);
      ctx.fillStyle = holoTextColor;
      ctx.fillText(`${currentAmmo}`, -9, -1.5);

      // Separator slash & Reserve ammo
      ctx.font = 'bold 8px Chakra Petch, monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.95)';
      ctx.fillText(`/${reserveAmmo}`, 11, -1.5);

      // Holographic Segmented Ammo Gauge Ticks (under the numbers)
      const numTicks = 6;
      const tickW = 4.5;
      const tickH = 2.5;
      const tickSpacing = 5.6;
      const startX = -((numTicks * tickSpacing) / 2) + tickW / 2;
      const filledTicks = Math.ceil(ammoPct * numTicks);

      for (let i = 0; i < numTicks; i++) {
        const tx = startX + i * tickSpacing;
        const isFilled = i < filledTicks;
        ctx.fillStyle = isFilled ? (isLowAmmo ? '#f59e0b' : '#38bdf8') : 'rgba(71, 85, 105, 0.4)';
        ctx.fillRect(tx, cardH / 2 - 5, tickW, tickH);
      }

      // Top Header Weapon Holo-Badge (floating above card)
      ctx.fillStyle = holoBorderColor;
      ctx.font = '900 6.5px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      const tagText = isCriticalEmpty ? '⚠️ EMPTY' : isLowAmmo ? '⚠️ LOW AMMO' : `${weapon.toUpperCase()}`;
      ctx.fillText(tagText, 0, -cardH / 2 - 3.5);
    }

    ctx.restore();
  }

  private render3DHolographicSoldierHUD(
    ctx: CanvasRenderingContext2D,
    char: CharacterState,
    weapon: WeaponType,
    isFacingRight: boolean,
    crouchShift: number
  ) {
    const hpPct = Math.max(0, Math.min(1, char.health / char.maxHealth));
    const fuelPct = Math.max(0, Math.min(1, char.fuel / (char.maxFuel || 100)));
    const holoPulse = 0.85 + Math.sin(this.animTime * 5) * 0.15;
    const isCriticalHp = hpPct < 0.25;
    const isDamaged = hpPct < 0.5;

    ctx.save();
    // Center above soldier
    ctx.translate(0, -22 + crouchShift);

    // 1. 3D Holographic Curved Health Arc (Floating on Left/Front Side)
    const healthArcRadius = 24;
    const healthColor = isCriticalHp ? '#ef4444' : isDamaged ? '#f59e0b' : '#10b981';
    const healthGlow = isCriticalHp ? 'rgba(239, 68, 68, ' : isDamaged ? 'rgba(245, 158, 11, ' : 'rgba(16, 185, 129, ';

    ctx.save();
    // 3D Perspective Elliptical Tilt
    ctx.scale(1.15, 0.82);

    // Hologram Background Arc (Shield/Health Track)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-6, 0, healthArcRadius, Math.PI * 0.7, Math.PI * 1.35);
    ctx.stroke();

    // Active Health Glow Arc
    ctx.strokeStyle = `${healthGlow}${0.9 * holoPulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const healthStartAngle = Math.PI * 1.35;
    const healthEndAngle = healthStartAngle - (hpPct * Math.PI * 0.65);
    ctx.beginPath();
    ctx.arc(-6, 0, healthArcRadius, healthStartAngle, healthEndAngle, true);
    ctx.stroke();

    // 2. 3D Holographic Jetpack Fuel Arc (Floating on Right/Thrusters Side)
    const fuelArcRadius = 24;
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(6, 0, fuelArcRadius, -Math.PI * 0.35, Math.PI * 0.3);
    ctx.stroke();

    // Active Fuel Energy Arc
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.9 * holoPulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const fuelStartAngle = -Math.PI * 0.35;
    const fuelEndAngle = fuelStartAngle + (fuelPct * Math.PI * 0.65);
    ctx.beginPath();
    ctx.arc(6, 0, fuelArcRadius, fuelStartAngle, fuelEndAngle);
    ctx.stroke();

    ctx.restore();

    // 3. Holographic ECG Vital Signs Line / HP Numerical HUD floating above
    ctx.save();
    const hpTextY = -24;
    
    // Translucent micro-badge
    ctx.fillStyle = `${healthGlow}0.18)`;
    ctx.strokeStyle = healthColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-22, hpTextY - 8, 44, 14, 3);
    ctx.fill();
    ctx.stroke();

    // 3D Tactical Cover Holographic Badge
    if (char.isInCover) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-38, hpTextY - 22, 76, 11, 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 7px Chakra Petch, sans-serif';
      ctx.fillStyle = '#6ee7b7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️ احتماء تكتيكي (-85%)', 0, hpTextY - 17);
      ctx.restore();
    }

    // ECG Heartbeat wave animation
    ctx.strokeStyle = `${healthGlow}${0.7 * holoPulse})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const waveOffset = (this.animTime * 25) % 18;
    ctx.moveTo(-18, hpTextY);
    ctx.lineTo(-12 + waveOffset * 0.2, hpTextY);
    ctx.lineTo(-8 + waveOffset * 0.2, hpTextY - 3);
    ctx.lineTo(-4 + waveOffset * 0.2, hpTextY + 3);
    ctx.lineTo(0 + waveOffset * 0.2, hpTextY);
    ctx.lineTo(6, hpTextY);
    ctx.stroke();

    // Digital HP Number
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 8.5px Chakra Petch, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(char.health)}`, 18, hpTextY);

    // Heart Icon
    ctx.fillStyle = healthColor;
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('❤️', -20, hpTextY + 1);

    // 4. 3D Floating Holographic Network Ping & Sync Indicator (Floating above HP)
    const pingValue = Math.floor(22 + Math.sin(this.animTime * 1.5) * 6);
    const pingColor = pingValue < 50 ? '#10b981' : '#f59e0b';
    ctx.font = '900 7px Chakra Petch, monospace';
    ctx.textAlign = 'center';
    
    // Holographic Translucent Backplate for Ping
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(-24, hpTextY - 21, 48, 10, 2);
    ctx.fill();
    ctx.stroke();

    // Live Signal Pulse Dot
    ctx.fillStyle = pingColor;
    ctx.beginPath();
    ctx.arc(-18, hpTextY - 16, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(`PING ${pingValue}ms • 3D SYNC`, 2, hpTextY - 16);

    ctx.restore();

    ctx.restore();
  }

  private renderWeaponSprite(ctx: CanvasRenderingContext2D, weapon: string, scale: number = 1.0, skinId?: string) {
    drawWeaponSprite2D(ctx, weapon as WeaponType, scale, skinId);
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.weaponType === 'rocket') {
        // RPG Rocket
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        // Rocket body
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-12, -4, 20, 8);

        // Yellow nose cone
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(16, 0);
        ctx.lineTo(8, 4);
        ctx.fill();

        // Stabilizer fins
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, -7, 4, 14);

        // Glowing motor exhaust
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(-14, 0, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.weaponType === 'grenade') {
        // Bouncing Frag Grenade
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pin / cap
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-2, -8, 4, 4);

        // Blinking red fuse LED
        const blink = Math.sin(this.animTime * 20) > 0;
        ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Bullet / Pellet / Sniper Tracer
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);

        // Neon tracer
        const bulletLen = p.weaponType === 'sniper' ? 24 : (p.weaponType === 'shotgun' ? 8 : 14);
        const grad = ctx.createLinearGradient(-bulletLen, 0, 0, 0);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, p.color);
        ctx.fillStyle = grad;
        ctx.fillRect(-bulletLen, -p.radius, bulletLen, p.radius * 2);

        // Bright tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D, system: ParticleSystem) {
    const particles = system.getParticles();
    for (const pt of particles) {
      ctx.save();
      const alpha = Math.max(0, Math.min(1, pt.alpha));
      ctx.globalAlpha = alpha;

      if (pt.type === 'shockwave') {
        // High-energy kinetic shockwave ring
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = Math.max(1.5, 4 * alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, pt.radius), 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing wash
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, pt.radius * 0.9), 0, Math.PI * 2);
        ctx.fill();

      } else if (pt.type === 'casing') {
        // Tumbling Brass/Red Shell Casing
        ctx.translate(pt.x, pt.y);
        if (pt.rotation) ctx.rotate(pt.rotation);
        const w = pt.width || 2.5;
        const h = pt.height || 5;

        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        // Primer rim
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-w / 2, -h / 2, w, 1.5);

      } else if (pt.type === 'magazine') {
        // Dropped / Ejected Weapon Magazine
        ctx.translate(pt.x, pt.y);
        if (pt.rotation) ctx.rotate(pt.rotation);
        const w = pt.width || 4.5;
        const h = pt.height || 10;

        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 1.5);
        ctx.fill();
        ctx.stroke();

        // Magazine Grip Ribs
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(-w / 2 + 0.8, -h / 4, w - 1.6, 1.5);
        ctx.fillRect(-w / 2 + 0.8, 0, w - 1.6, 1.5);
        ctx.fillRect(-w / 2 + 0.8, h / 4, w - 1.6, 1.5);

        // Feed lips metallic gleam
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-w / 2 + 1, -h / 2, w - 2, 1.2);

      } else if (pt.type === 'splinter') {
        // Tumbling Wood Splinter Shard
        ctx.translate(pt.x, pt.y);
        if (pt.rotation) ctx.rotate(pt.rotation);
        const w = pt.width || 2.2;
        const h = pt.height || 7;

        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else if (pt.type === 'smoke') {
        // Multi-lobed Cartoon Smoke Cloud
        ctx.translate(pt.x, pt.y);
        if (pt.rotation) ctx.rotate(pt.rotation);

        ctx.fillStyle = pt.color;
        const r = Math.max(1, pt.radius);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.arc(-r * 0.35, -r * 0.25, r * 0.65, 0, Math.PI * 2);
        ctx.arc(r * 0.35, -r * 0.25, r * 0.65, 0, Math.PI * 2);
        ctx.arc(0, r * 0.35, r * 0.6, 0, Math.PI * 2);
        ctx.fill();

      } else if (pt.type === 'dust') {
        // Sandy / Ground Dust Puff
        ctx.fillStyle = pt.color;
        const r = Math.max(1, pt.radius);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();

      } else if (pt.type === 'fire') {
        // Fiery Fireball with Bright White/Yellow Center
        const r = Math.max(1, pt.radius);
        const grad = ctx.createRadialGradient(pt.x, pt.y, r * 0.2, pt.x, pt.y, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, pt.color);
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();

      } else if (pt.type === 'blood') {
        // Teardrop Cartoon Blood Splatter
        ctx.fillStyle = pt.color;
        const r = Math.max(1, pt.radius);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();

      } else if (pt.type === 'debris') {
        // Angular Stone Pebble Shard
        ctx.translate(pt.x, pt.y);
        if (pt.rotation) ctx.rotate(pt.rotation);
        const r = Math.max(1, pt.radius);
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.5);
        ctx.lineTo(r * 0.5, -r);
        ctx.lineTo(r, r * 0.3);
        ctx.lineTo(-r * 0.2, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

      } else {
        // High-velocity incandescent spark streak or 4-Point Diamond Spark / Flash
        const speed = Math.hypot(pt.vx || 0, pt.vy || 0);
        if (speed > 35) {
          const angle = Math.atan2(pt.vy, pt.vx);
          const streakLen = Math.min(26, Math.max(5, speed * 0.045));
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(angle);
          
          // Incandescent spark streak
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = Math.max(1.2, pt.radius * 0.7);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-streakLen, 0);
          ctx.lineTo(0, 0);
          ctx.stroke();

          // Brilliant white-hot core at lead tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(1, pt.radius * 0.55), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // 4-Point Diamond Spark / Flash
          const r = Math.max(1, pt.radius);
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - r * 1.5);
          ctx.lineTo(pt.x + r * 0.6, pt.y);
          ctx.lineTo(pt.x, pt.y + r * 1.5);
          ctx.lineTo(pt.x - r * 0.6, pt.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  private fcnGlowColor(hex: string, intensity: number): string {
    return hex;
  }

  private renderLightingOverlay(
    ctx: CanvasRenderingContext2D,
    lamps: MapData['scenery']['lamps'],
    guideMarkers?: MapData['scenery']['guideMarkers']
  ) {
    const visibleW = (this.camera.width / this.camera.zoom) + 200;
    const visibleH = (this.camera.height / this.camera.zoom) + 200;
    const minX = this.camera.x - 120;
    const maxX = this.camera.x + visibleW;
    const minY = this.camera.y - 120;
    const maxY = this.camera.y + visibleH;

    ctx.save();

    // 1. Calculate and Draw Ambient Tactical Darkness Tint (Based on Depth)
    // Deep underground (y > 1100) is slightly shaded, above ground is fully bright daylight!
    const depthY = this.camera.y + visibleH / 2;
    const yRatio = Math.max(0, Math.min(1, (depthY - 1100) / 700));
    const ambientAlpha = yRatio * 0.22; // 0 above ground -> 0.22 in deep caves
    
    if (ambientAlpha > 0) {
      ctx.fillStyle = `rgba(6, 12, 24, ${ambientAlpha})`;
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    }

    // 2. Draw Physical Hanging Lamp Fixtures
    if (lamps) {
      for (const lamp of lamps) {
        if (
          lamp.x < minX ||
          lamp.x > maxX ||
          lamp.y < minY ||
          lamp.y > maxY
        ) {
          continue;
        }

        // Ceiling anchor
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(lamp.x - 8, lamp.y - 35, 16, 6);
        ctx.strokeRect(lamp.x - 8, lamp.y - 35, 16, 6);

        // Hanging electrical cord / chain
        ctx.beginPath();
        ctx.moveTo(lamp.x, lamp.y - 29);
        ctx.lineTo(lamp.x, lamp.y - 10);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Metallic Lamp Dome Shade (Military style)
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(lamp.x - 16, lamp.y - 10);
        ctx.lineTo(lamp.x + 16, lamp.y - 10);
        ctx.lineTo(lamp.x + 22, lamp.y - 2);
        ctx.lineTo(lamp.x - 22, lamp.y - 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Bulb Core with rapid dynamic flicker
        const flicker = 0.8 + 0.2 * Math.sin(this.animTime * 16 + lamp.x * 0.2) * (Math.sin(this.animTime * 42) > 0.88 ? 0.25 : 1.0);
        ctx.fillStyle = this.fcnGlowColor(lamp.color, flicker);
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y - 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // 3. Draw Volumetric Flickering Light Cones and Spotlights (Screen composite operation)
    ctx.globalCompositeOperation = 'screen';
    if (lamps) {
      for (const lamp of lamps) {
      if (
        lamp.x < minX ||
        lamp.x > maxX ||
        lamp.y < minY ||
        lamp.y > maxY
      ) {
        continue;
      }

      const flicker = 0.85 + 0.15 * Math.sin(this.animTime * 14 + lamp.x * 0.1) * (Math.sin(this.animTime * 38) > 0.9 ? 0.3 : 1.0);
      const radius = 170 * flicker;

      // Radial Core Glow around bulb
      const radialGlow = ctx.createRadialGradient(lamp.x, lamp.y, 6, lamp.x, lamp.y, radius * 0.45);
      radialGlow.addColorStop(0, lamp.color + 'aa');
      radialGlow.addColorStop(0.4, lamp.color + '44');
      radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Volumetric Spotlight Beam Cone (Casting Downward)
      const beamGlow = ctx.createLinearGradient(lamp.x, lamp.y - 2, lamp.x, lamp.y + radius * 1.4);
      beamGlow.addColorStop(0, lamp.color + '77');
      beamGlow.addColorStop(0.3, lamp.color + '2c');
      beamGlow.addColorStop(0.7, lamp.color + '10');
      beamGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = beamGlow;
      ctx.beginPath();
      ctx.moveTo(lamp.x, lamp.y - 2);
      ctx.lineTo(lamp.x - radius * 0.72, lamp.y + radius * 1.4);
      ctx.lineTo(lamp.x + radius * 0.72, lamp.y + radius * 1.4);
      ctx.closePath();
      ctx.fill();

      // Atmospheric dynamic dust particles inside light cone for depth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      for (let i = 0; i < 4; i++) {
        const px = lamp.x + Math.sin(this.animTime * 0.5 + i + lamp.x) * radius * 0.45;
        const py = lamp.y + 15 + ((this.animTime * 15 + i * 40) % (radius * 1.2));
        // Check if inside cone area
        const halfWidthAtY = ((py - lamp.y) / (radius * 1.4)) * (radius * 0.72);
        if (Math.abs(px - lamp.x) < halfWidthAtY) {
          ctx.beginPath();
          ctx.arc(px, py, 1.8 * flicker, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    }

    // Volumetric Glow for Directional Guide Markers
    if (guideMarkers) {
      for (const gm of guideMarkers) {
        if (gm.x < minX || gm.x > maxX || gm.y < minY || gm.y > maxY) continue;
        const pulse = 0.85 + 0.15 * Math.sin(this.animTime * 6 + gm.x);
        const radius = 130 * pulse;
        const radialGlow = ctx.createRadialGradient(gm.x, gm.y, 4, gm.x, gm.y, radius);
        radialGlow.addColorStop(0, gm.color + 'aa');
        radialGlow.addColorStop(0.4, gm.color + '38');
        radialGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(gm.x, gm.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D, system: ParticleSystem) {
    const texts = system.getFloatingTexts();
    for (const t of texts) {
      const screenX = t.x - this.camera.x;
      const screenY = t.y - this.camera.y;

      if (screenX < -50 || screenX > this.camera.width + 50 || screenY < -50 || screenY > this.camera.height + 50) {
        continue;
      }

      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.font = 'bold 16px Chakra Petch, Cairo, sans-serif';
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, screenX, screenY);
      ctx.fillText(t.text, screenX, screenY);
      ctx.restore();
    }
  }

  /**
   * Mini Militia Radar Arrows: Shows offscreen enemies with directional pointer, distance in meters,
   * mini health bar, and jetpack icon when airborne.
   */
  private renderOffscreenEnemyIndicators(
    ctx: CanvasRenderingContext2D,
    player: CharacterState,
    bots: CharacterState[]
  ) {
    if (player.isDead) return;

    const w = this.camera.width;
    const h = this.camera.height;
    const zoom = this.camera.zoom;
    const margin = 45;

    // Filter enemy targets
    const enemies = bots.filter((b) => !b.isDead && (b.team === 'ffa' || b.team !== player.team));

    for (const opp of enemies) {
      // Screen space position of opponent center
      const oppWorldCenterX = opp.x + opp.width / 2;
      const oppWorldCenterY = opp.y + opp.height / 2;
      const screenX = (oppWorldCenterX - this.camera.x) * zoom;
      const screenY = (oppWorldCenterY - this.camera.y) * zoom;

      // Check if enemy is offscreen (or near edge)
      const isOffScreen =
        screenX < margin || screenX > w - margin || screenY < margin || screenY > h - margin;

      if (!isOffScreen) continue;

      // Calculate direction vector from screen center
      const cx = w / 2;
      const cy = h / 2;
      const dx = screenX - cx;
      const dy = screenY - cy;
      const angle = Math.atan2(dy, dx);
      const worldDist = Math.hypot(oppWorldCenterX - (player.x + player.width / 2), oppWorldCenterY - (player.y + player.height / 2));
      const distMeters = Math.max(1, Math.round(worldDist / 25));

      // Clamp indicator arrow to screen perimeter
      const padX = margin + 15;
      const padY = margin + 15;
      let indX = cx + Math.cos(angle) * (w / 2 - padX);
      let indY = cy + Math.sin(angle) * (h / 2 - padY);

      indX = Math.max(padX, Math.min(w - padX, indX));
      indY = Math.max(padY, Math.min(h - padY, indY));

      ctx.save();
      ctx.translate(indX, indY);

      // 1. Draw Directional Pointer Arrowhead
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = opp.isJetpacking ? '#f59e0b' : '#ef4444';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-10, -9);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-10, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 2. Draw Mini Badge Background
      const hpPercent = Math.max(0, opp.health / opp.maxHealth);
      const isFlying = opp.isJetpacking;
      const labelText = `${isFlying ? '🚀 ' : ''}${opp.name} (${distMeters}m)`;

      ctx.font = 'bold 11px Cairo, sans-serif';
      const textMetrics = ctx.measureText(labelText);
      const badgeW = Math.max(75, textMetrics.width + 16);
      const badgeH = 26;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = isFlying ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, -badgeH - 8, badgeW, badgeH, 8);
      ctx.fill();
      ctx.stroke();

      // 3. Mini Health Bar inside badge
      ctx.fillStyle = '#334155';
      ctx.fillRect(-badgeW / 2 + 4, -12, badgeW - 8, 4);
      ctx.fillStyle = hpPercent > 0.4 ? '#22c55e' : '#ef4444';
      ctx.fillRect(-badgeW / 2 + 4, -12, (badgeW - 8) * hpPercent, 4);

      // 4. Name & Distance Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.strokeText(labelText, 0, -18);
      ctx.fillText(labelText, 0, -18);

      ctx.restore();
    }
  }
}
