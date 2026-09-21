import React from 'react';
import { WeaponType } from '../types';

/**
 * High-Contrast Stylized 2D Weapon Sprite Renderer for Canvas
 * Mini Militia / Doodle Army 2 authentic comic military aesthetic.
 */
export function drawWeaponSprite2D(
  ctx: CanvasRenderingContext2D,
  weapon: WeaponType | 'grenade',
  scale: number = 1,
  skinId?: string
) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.4 / scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Dynamic color palette for professional PUBG-style weapon skins
  let camoGreen = '#365314';
  let gunMetal = '#1e293b';
  let silverChrome = '#e2e8f0';
  let woodBrown = '#92400e';
  let darkWood = '#78350f';
  let orangeBakelite = '#d97706';
  let bulletYellow = '#fbbf24';
  let scopeBody = '#0f172a';
  let scopeGlint = '#38bdf8';
  let sniperBody = '#15803d';
  let sniperStock = '#166534';
  let uziBlue = '#475569';
  let sliderHighlight = '#ffffff';
  let lowerFrame = '#334155';
  let uziGrip = '#d97706';

  if (skinId) {
    if (skinId === 'glacier') {
      camoGreen = '#0ea5e9';
      gunMetal = '#38bdf8';
      silverChrome = '#e0f2fe';
      woodBrown = '#0284c7';
      darkWood = '#0369a1';
      orangeBakelite = '#7dd3fc';
      bulletYellow = '#e0f2fe';
      scopeBody = '#0284c7';
      scopeGlint = '#ffffff';
      sniperBody = '#bae6fd';
      sniperStock = '#0284c7';
      uziBlue = '#0284c7';
      sliderHighlight = '#f0f9ff';
      lowerFrame = '#0284c7';
      uziGrip = '#0ea5e9';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'pharaoh') {
      camoGreen = '#d97706';
      gunMetal = '#ca8a04';
      silverChrome = '#fbbf24';
      woodBrown = '#1e3a8a';
      darkWood = '#172554';
      orangeBakelite = '#eab308';
      bulletYellow = '#fbbf24';
      scopeBody = '#ca8a04';
      scopeGlint = '#eab308';
      sniperBody = '#ca8a04';
      sniperStock = '#1e3a8a';
      uziBlue = '#fbbf24';
      sliderHighlight = '#fef08a';
      lowerFrame = '#ca8a04';
      uziGrip = '#1e3a8a';
      ctx.shadowColor = 'rgba(251, 191, 36, 0.85)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'hellfire') {
      camoGreen = '#7f1d1d';
      gunMetal = '#111827';
      silverChrome = '#991b1b';
      woodBrown = '#451a03';
      darkWood = '#311005';
      orangeBakelite = '#dc2626';
      bulletYellow = '#ef4444';
      scopeBody = '#18181b';
      scopeGlint = '#f87171';
      sniperBody = '#7f1d1d';
      sniperStock = '#450a0a';
      uziBlue = '#450a0a';
      sliderHighlight = '#ef4444';
      lowerFrame = '#18181b';
      uziGrip = '#dc2626';
      ctx.shadowColor = 'rgba(220, 38, 38, 0.9)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'pumpkin') {
      camoGreen = '#7c2d12';
      gunMetal = '#111827';
      silverChrome = '#ea580c';
      woodBrown = '#451a03';
      darkWood = '#311005';
      orangeBakelite = '#f97316';
      bulletYellow = '#fb923c';
      scopeBody = '#18181b';
      scopeGlint = '#fdba74';
      sniperBody = '#c2410c';
      sniperStock = '#7c2d12';
      uziBlue = '#7c2d12';
      sliderHighlight = '#f97316';
      lowerFrame = '#111827';
      uziGrip = '#f97316';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.85)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'cyberpunk') {
      camoGreen = '#4a044e';
      gunMetal = '#3b0764';
      silverChrome = '#06b6d4';
      woodBrown = '#ec4899';
      darkWood = '#9d174d';
      orangeBakelite = '#d946ef';
      bulletYellow = '#67e8f9';
      scopeBody = '#4a044e';
      scopeGlint = '#22d3ee';
      sniperBody = '#701a75';
      sniperStock = '#4a044e';
      uziBlue = '#06b6d4';
      sliderHighlight = '#d946ef';
      lowerFrame = '#3b0764';
      uziGrip = '#ec4899';
      ctx.shadowColor = 'rgba(6, 182, 212, 0.9)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'gold') {
      camoGreen = '#b45309';
      gunMetal = '#fbbf24';
      silverChrome = '#fef08a';
      woodBrown = '#78350f';
      darkWood = '#451a03';
      orangeBakelite = '#fbbf24';
      bulletYellow = '#ffffff';
      scopeBody = '#b45309';
      scopeGlint = '#facc15';
      sniperBody = '#fbbf24';
      sniperStock = '#78350f';
      uziBlue = '#fbbf24';
      sliderHighlight = '#fef08a';
      lowerFrame = '#fbbf24';
      uziGrip = '#78350f';
      ctx.shadowColor = 'rgba(250, 204, 21, 0.85)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'neon') {
      camoGreen = '#06b6d4';
      gunMetal = '#0f172a';
      silverChrome = '#22d3ee';
      ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'inferno') {
      camoGreen = '#991b1b';
      gunMetal = '#180808';
      silverChrome = '#f43f5e';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'obsidian') {
      camoGreen = '#1e1b4b';
      gunMetal = '#020617';
      silverChrome = '#38bdf8';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
      ctx.shadowBlur = 8;
    } else if (skinId === 'hazard') {
      camoGreen = '#451a03';
      gunMetal = '#1c1917';
      silverChrome = '#eab308';
      ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
      ctx.shadowBlur = 8;
    }
  }

  if (weapon === 'pistol') {
    // ==========================================
    // HEAVY COMBAT MAGNUM / DESERT EAGLE (PISTOL)
    // ==========================================
    // 1. Heavy Chrome / Gunmetal Slide
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, -5, 20, 6);
    ctx.strokeRect(0, -5, 20, 6);

    // Slide Top Highlight & Serrations
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -5, 18, 1.8);
    ctx.fillStyle = '#64748b';
    for (let s = 2; s <= 7; s += 2.2) {
      ctx.fillRect(s, -4, 1.2, 4);
    }

    // 2. Lower Frame & Trigger Guard
    ctx.fillStyle = '#334155';
    ctx.fillRect(1, 0, 14, 3);
    ctx.strokeRect(1, 0, 14, 3);

    // Trigger Guard & Trigger
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(7, 3, 3.5, 0, Math.PI * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(6.5, 1, 1.5, 2.5);

    // 3. Ergonomic Wood/Polymer Combat Grip
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(6, 1);
    ctx.lineTo(4.5, 10);
    ctx.lineTo(-0.5, 9.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grip texture checkering
    ctx.fillStyle = '#78350f';
    ctx.fillRect(1.5, 3, 3, 5);

    // 4. Hammer & Front Iron Sight
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-1.5, -4, 2.5, 3); // hammer
    ctx.fillRect(18, -7, 2, 2.5); // front sight post

  } else if (weapon === ( 'desert_eagle_gold' as any)) {
    // ROYAL GOLD DESERT EAGLE MAGNUM
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, -6, 22, 7);
    ctx.strokeRect(0, -6, 22, 7);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(1, -5.5, 20, 2);
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(1, 1); ctx.lineTo(6, 1); ctx.lineTo(4.5, 11); ctx.lineTo(-1, 10.5); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(1, 0, 15, 3); ctx.strokeRect(1, 0, 15, 3);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(20, -3, 2, 2); // red laser sight

  } else if (weapon === ('dual_uzi' as any)) {
    // TWIN TACTICAL UZI SUBMACHINE GUNS
    ctx.fillStyle = '#475569';
    ctx.fillRect(-6, -3, 19, 8);
    ctx.strokeRect(-6, -3, 19, 8);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-5, -5, 8, 2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(13, -1.5, 9, 3.5);
    ctx.strokeRect(13, -1.5, 9, 3.5);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 5, 4.5, 13);
    ctx.strokeRect(0, 5, 4.5, 13);

  } else if (weapon === ('riot_shield' as any)) {
    // BALLISTIC REINFORCED RIOT SHIELD
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -14, 24, 28);
    ctx.strokeRect(-12, -14, 24, 28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7, -9, 14, 6);
    ctx.strokeRect(-7, -9, 14, 6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-5, 3, 10, 3);

  } else if (weapon === ('saw_gun' as any)) {
    // DIAMOND CUTTER SAW GUN
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-10, -5, 22, 10);
    ctx.strokeRect(-10, -5, 22, 10);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(16, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(16, 0, 4, 0, Math.PI * 2); ctx.fill();

  } else if (weapon === 'rifle' || weapon === ('m4_rifle' as any)) {
    // ==========================================
    // ASSAULT RIFLE / MACHINE GUN (AK-47 & M4 HYBRID)
    // ==========================================
    // 1. Wooden Fixed Stock
    ctx.fillStyle = woodBrown;
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-14, 1);
    ctx.lineTo(-14, 7);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Stock Buttplate
    ctx.fillStyle = gunMetal;
    ctx.fillRect(-15, 0, 2, 8);
    ctx.strokeRect(-15, 0, 2, 8);

    // 2. Gunmetal Receiver Body
    ctx.fillStyle = gunMetal;
    ctx.fillRect(-4, -4, 20, 7);
    ctx.strokeRect(-4, -4, 20, 7);
    // Dust cover & Bolt Handle
    ctx.fillStyle = scopeBody;
    ctx.fillRect(-2, -5, 12, 2);
    ctx.fillStyle = silverChrome;
    ctx.fillRect(5, -4, 3, 1.5); // silver charging handle

    // 3. Iconic Curved Banana Magazine (High-Contrast Orange-Bakelite or Steel)
    ctx.fillStyle = orangeBakelite;
    ctx.beginPath();
    ctx.moveTo(6, 3);
    ctx.quadraticCurveTo(11, 8, 8, 14);
    ctx.lineTo(3.5, 13);
    ctx.quadraticCurveTo(6, 7, 2, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mag ribs
    ctx.strokeStyle = woodBrown;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4.5, 6); ctx.lineTo(7.5, 7);
    ctx.moveTo(4, 9); ctx.lineTo(7, 10);
    ctx.stroke();
    ctx.lineWidth = 2.4 / scale;

    // 4. Wooden Lower Handguard & Gas Tube
    ctx.fillStyle = woodBrown;
    ctx.fillRect(16, -2, 13, 5);
    ctx.strokeRect(16, -2, 13, 5);
    ctx.fillStyle = scopeBody;
    ctx.fillRect(16, -5, 11, 3); // upper handguard gas tube
    ctx.strokeRect(16, -5, 11, 3);

    // 5. Long Steel Barrel & Front Sight Post
    ctx.fillStyle = scopeBody;
    ctx.fillRect(29, -3, 11, 3);
    ctx.strokeRect(29, -3, 11, 3);
    // Front triangular sight & Muzzle Slanted Compensator
    ctx.fillStyle = scopeBody;
    ctx.beginPath();
    ctx.moveTo(35, -3);
    ctx.lineTo(37, -8);
    ctx.lineTo(39, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(39, -4, 3, 4.5); // slanted brake

    // 6. Pistol Grip
    ctx.fillStyle = darkWood;
    ctx.fillRect(0, 3, 4.5, 7.5);
    ctx.strokeRect(0, 3, 4.5, 7.5);

  } else if (weapon === 'shotgun') {
    // ==========================================
    // COMBAT TACTICAL PUMP SHOTGUN
    // ==========================================
    // 1. Heavy Combat Wood/Composite Stock
    ctx.fillStyle = darkWood;
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(-15, 2);
    ctx.lineTo(-15, 8);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Rubber Recoil Pad
    ctx.fillStyle = scopeBody;
    ctx.fillRect(-16.5, 1, 2.5, 8);
    ctx.strokeRect(-16.5, 1, 2.5, 8);

    // 2. High-Contrast Receiver with Red Ejection Port
    ctx.fillStyle = gunMetal;
    ctx.fillRect(-4, -4, 18, 8);
    ctx.strokeRect(-4, -4, 18, 8);
    // Red 12-Gauge Shell Ejection Port
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(2, -2.5, 6, 3);
    ctx.strokeRect(2, -2.5, 6, 3);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(2, -2.5, 2, 3); // brass rim

    // 3. Dual Heavy Barrels (Main Barrel + Mag Tube)
    ctx.fillStyle = gunMetal;
    ctx.fillRect(14, -4, 22, 4); // main top barrel
    ctx.strokeRect(14, -4, 22, 4);
    ctx.fillStyle = scopeBody;
    ctx.fillRect(14, 0, 18, 3.5); // bottom magazine tube
    ctx.strokeRect(14, 0, 18, 3.5);

    // 4. Ribbed Pump Forend Slider
    ctx.fillStyle = scopeBody;
    ctx.fillRect(17, -1, 10, 5.5);
    ctx.strokeRect(17, -1, 10, 5.5);
    // Grip ribs
    ctx.fillStyle = '#64748b';
    for (let rx = 19; rx <= 25; rx += 2.5) {
      ctx.fillRect(rx, 0, 1.2, 3.5);
    }

    // 5. Front Bead Sight & Muzzle Crown
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(35, -5.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pistol grip
    ctx.fillStyle = scopeBody;
    ctx.fillRect(0, 4, 4.5, 6);
    ctx.strokeRect(0, 4, 4.5, 6);

  } else if (weapon === 'sniper') {
    // ==========================================
    // SNIPER RIFLE (AWM / ARCTIC WARFARE MAGNUM)
    // ==========================================
    // 1. Tactical Camo-Green Thumbhole Stock
    ctx.fillStyle = sniperStock;
    ctx.beginPath();
    ctx.moveTo(-6, -3);
    ctx.lineTo(-18, -1);
    ctx.lineTo(-18, 7);
    ctx.lineTo(-11, 7);
    ctx.lineTo(-8, 3);
    ctx.lineTo(-6, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Cheek Rest Pad
    ctx.fillStyle = scopeBody;
    ctx.fillRect(-16, -4, 7, 3);

    // 2. Long Military Green Chassis & Receiver
    ctx.fillStyle = sniperBody;
    ctx.fillRect(-6, -3, 30, 6);
    ctx.strokeRect(-6, -3, 30, 6);

    // Straight Box Magazine
    ctx.fillStyle = gunMetal;
    ctx.fillRect(4, 3, 7, 6);
    ctx.strokeRect(4, 3, 7, 6);

    // 3. High-Power Tactical Scope with Cyan Glint
    ctx.fillStyle = scopeBody;
    // Scope tube
    ctx.fillRect(2, -10, 22, 5);
    ctx.strokeRect(2, -10, 22, 5);
    // Eyepiece bell & Objective bell
    ctx.fillRect(0, -11, 4, 7);
    ctx.strokeRect(0, -11, 4, 7);
    ctx.fillRect(21, -11.5, 5, 8);
    ctx.strokeRect(21, -11.5, 5, 8);
    // Scope mount rings
    ctx.fillRect(6, -5, 2.5, 2.5);
    ctx.fillRect(17, -5, 2.5, 2.5);
    // Bright Optical Cyan Glint
    ctx.fillStyle = scopeGlint;
    ctx.fillRect(24, -10, 1.8, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, -9.5, 1.2, 2);

    // 4. Heavy Fluted Free-Floating Barrel & Massive Muzzle Brake
    ctx.fillStyle = gunMetal;
    ctx.fillRect(24, -2, 24, 3.5);
    ctx.strokeRect(24, -2, 24, 3.5);
    // Heavy Ported Muzzle Brake
    ctx.fillStyle = scopeBody;
    ctx.fillRect(46, -4.5, 6, 8);
    ctx.strokeRect(46, -4.5, 6, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(48, -3, 2, 5); // muzzle side ports

    // Folded Bipod Legs under barrel
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8 / scale;
    ctx.beginPath();
    ctx.moveTo(34, 2); ctx.lineTo(39, 4);
    ctx.moveTo(34, 2); ctx.lineTo(41, 1);
    ctx.stroke();

  } else if (weapon === 'rocket') {
    // ==========================================
    // RPG-7 ROCKET LAUNCHER
    // ==========================================
    // 1. Olive Military Steel Launch Tube
    ctx.fillStyle = '#166534';
    ctx.fillRect(-12, -6, 36, 11);
    ctx.strokeRect(-12, -6, 36, 11);

    // Wooden Heat Shield Sleeve
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-4, -7, 16, 13);
    ctx.strokeRect(-4, -7, 16, 13);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, -6.5, 8, 12);

    // 2. Flared Conical Exhaust Vent (Backblast Nozzle)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-12, -6);
    ctx.lineTo(-18, -9);
    ctx.lineTo(-18, 9);
    ctx.lineTo(-12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Forward Bell Ring & Optical Sight
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, -7.5, 5, 14);
    ctx.strokeRect(20, -7.5, 5, 14);
    // PGO-7 Optical Sight
    ctx.fillRect(4, -11, 6, 4);
    ctx.strokeRect(4, -11, 6, 4);

    // 4. Protruding High-Explosive PG-7V Warhead
    // Olive/Steel Booster Rod
    ctx.fillStyle = '#475569';
    ctx.fillRect(24, -3, 6, 6);
    ctx.strokeRect(24, -3, 6, 6);

    // Ogive High-Explosive Rocket Cone (Bright Yellow/Olive)
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(30, -7);
    ctx.lineTo(38, -8);
    ctx.lineTo(48, 0); // sharp pointed nose
    ctx.lineTo(38, 8);
    ctx.lineTo(30, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Warhead Red Stripe & Fuse Tip
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(36, -7.5, 3, 15);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(46, -1, 3.5, 2); // piezoelectric impact fuse

    // 5. Dual Pistol Grips
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, 5, 4, 7);
    ctx.strokeRect(-2, 5, 4, 7);
    ctx.fillRect(12, 5, 4, 7);
    ctx.strokeRect(12, 5, 4, 7);

  } else if (weapon === 'grenade') {
    // ==========================================
    // PINEAPPLE FRAG GRENADE
    // ==========================================
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(0, 1, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Segment Grid Lines
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-9, 1); ctx.lineTo(9, 1);
    ctx.moveTo(-8, -4); ctx.lineTo(8, -4);
    ctx.moveTo(-8, 6); ctx.lineTo(8, 6);
    ctx.moveTo(0, -9); ctx.lineTo(0, 11);
    ctx.stroke();

    // Fuse cap & handle
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillRect(-3, -13, 6, 6);
    ctx.strokeRect(-3, -13, 6, 6);

    // Blinking LED
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 1, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Realistic In-Game Weapon Skin Tint & Shaders (Subtle Glow without ugly box outline)
  if (skinId && skinId !== 'standard') {
    ctx.save();
    if (skinId === 'gold') {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
      ctx.shadowBlur = 6;
    } else if (skinId === 'neon') {
      ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      ctx.shadowBlur = 6;
    } else if (skinId === 'inferno') {
      ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
      ctx.shadowBlur = 6;
    } else if (skinId === 'obsidian') {
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 5;
    } else if (skinId === 'hazard') {
      ctx.shadowColor = 'rgba(234, 179, 8, 0.6)';
      ctx.shadowBlur = 6;
    }
    ctx.restore();
  }

  ctx.restore();
}

/**
 * High-Contrast Stylized SVG Component for HUD and UI Cards
 */
export const WeaponSpriteSVG: React.FC<{
  weapon: WeaponType | string;
  className?: string;
  skinId?: string;
  lightingMode?: 'pbr' | 'toon';
  environmentId?: 'training_range' | 'night_ops' | 'cyber_tech' | 'desert_outpost';
}> = ({ weapon, className = 'w-10 h-7', skinId, lightingMode = 'pbr', environmentId = 'training_range' }) => {
  let skinFilter = '';
  if (skinId === 'gold') {
    skinFilter = 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.75)) brightness(1.22) sepia(0.85) hue-rotate(5deg) saturate(2.4)';
  } else if (skinId === 'neon') {
    skinFilter = 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.8)) brightness(1.2) hue-rotate(155deg) saturate(2.2)';
  } else if (skinId === 'inferno') {
    skinFilter = 'drop-shadow(0 0 14px rgba(244, 63, 94, 0.85)) brightness(1.15) hue-rotate(335deg) saturate(2.4)';
  } else if (skinId === 'obsidian') {
    skinFilter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5)) brightness(0.65) contrast(1.4)';
  } else if (skinId === 'hazard') {
    skinFilter = 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.75)) brightness(1.15) hue-rotate(45deg) saturate(2.2)';
  }

  // Adjust combined filter based on lightingMode (PBR vs Toon)
  let combinedFilter = skinFilter;
  if (lightingMode === 'toon') {
    const toonAdd = 'contrast(1.3) saturate(1.35) drop-shadow(0 3px 0px rgba(0,0,0,0.95))';
    combinedFilter = combinedFilter ? `${combinedFilter} ${toonAdd}` : toonAdd;
  } else if (lightingMode === 'pbr') {
    const pbrAdd = 'contrast(1.08) brightness(1.05) drop-shadow(0 8px 16px rgba(0,0,0,0.85))';
    combinedFilter = combinedFilter ? `${combinedFilter} ${pbrAdd}` : pbrAdd;
  }

  // Apply environmental ambient lighting hue and tone
  if (environmentId === 'night_ops') {
    const nightFilter = 'brightness(0.92) contrast(1.15) drop-shadow(0 0 12px rgba(30, 58, 138, 0.45))';
    combinedFilter = combinedFilter ? `${combinedFilter} ${nightFilter}` : nightFilter;
  } else if (environmentId === 'cyber_tech') {
    const cyberFilter = 'brightness(1.08) drop-shadow(0 0 14px rgba(6, 182, 212, 0.4))';
    combinedFilter = combinedFilter ? `${combinedFilter} ${cyberFilter}` : cyberFilter;
  } else if (environmentId === 'desert_outpost') {
    const desertFilter = 'brightness(1.05) sepia(0.2) drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))';
    combinedFilter = combinedFilter ? `${combinedFilter} ${desertFilter}` : desertFilter;
  }

  const renderContent = () => {
    if (weapon === 'desert_eagle_gold') {
      return (
        <svg viewBox="-10 -12 42 26" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="deGoldSlide" x1="0" y1="-6" x2="0" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
            <linearGradient id="deGoldBevel" x1="0" y1="-6" x2="22" y2="-6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF9C3" />
              <stop offset="50%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="deGrip" x1="0" y1="0" x2="6" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="100%" stopColor="#0c0a09" />
            </linearGradient>
          </defs>
          {/* Slide Cast Drop Shadow */}
          <rect x="0" y="-4" width="22" height="7" rx="1.5" fill="#000000" opacity="0.4" />
          {/* Main 24K Gold Slide */}
          <rect x="0" y="-6" width="22" height="7.5" rx="1.5" fill="url(#deGoldSlide)" stroke="#713F12" strokeWidth="1.2" />
          {/* Specular Slide Bevel Highlight */}
          <rect x="0.8" y="-5.5" width="20.4" height="2" rx="0.5" fill="url(#deGoldBevel)" />
          {/* Slide Serrations */}
          <rect x="2" y="-4.5" width="1.2" height="4.5" fill="#713F12" opacity="0.8" />
          <rect x="4.5" y="-4.5" width="1.2" height="4.5" fill="#713F12" opacity="0.8" />
          <rect x="7" y="-4.5" width="1.2" height="4.5" fill="#713F12" opacity="0.8" />
          <rect x="9.5" y="-4.5" width="1.2" height="4.5" fill="#713F12" opacity="0.8" />
          {/* Ejection Port */}
          <rect x="11.5" y="-5" width="4.5" height="3" fill="#1C1917" stroke="#854D0E" strokeWidth="0.8" />
          {/* Lower Gold Frame */}
          <rect x="1" y="0" width="15" height="3.5" rx="0.8" fill="url(#deGoldSlide)" stroke="#713F12" strokeWidth="1.2" />
          {/* Trigger Guard & Gold Trigger */}
          <path d="M4 1.5 C4 4.5 9 4.5 9 1.5" stroke="#713F12" strokeWidth="1.4" fill="none" />
          <path d="M6 1.8 C6.5 3 6.8 3.5 7.5 3.5" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" />
          {/* Textured Ergonomic Combat Grip */}
          <path d="M1 1.2 L6.2 1.2 L5.2 11.5 L-1.2 11 Z" fill="url(#deGrip)" stroke="#1c1917" strokeWidth="1.4" />
          <rect x="0.8" y="3" width="3.4" height="6.5" rx="0.8" fill="#44403C" opacity="0.7" />
          {/* Gold Inlaid Medallion */}
          <circle cx="2.5" cy="6.2" r="1.4" fill="#FACC15" stroke="#713F12" strokeWidth="0.6" />
          {/* Hammer & Front Iron Sight */}
          <rect x="-1.8" y="-4.5" width="2.6" height="3.5" rx="0.5" fill="#713F12" />
          <rect x="20" y="-8" width="1.8" height="2.5" rx="0.4" fill="#713F12" />
          {/* Barrel Crown */}
          <circle cx="22" cy="-2.5" r="1.5" fill="#1C1917" stroke="#713F12" strokeWidth="0.8" />
        </svg>
      );
    }

    if (weapon === 'dual_uzi') {
      return (
        <svg viewBox="-14 -14 52 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="uziSteel" x1="0" y1="-5" x2="0" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="uziFrontSteel" x1="0" y1="-5" x2="0" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="35%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="uziMag" x1="0" y1="5" x2="4" y2="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          {/* Rear Uzi with 3D Depth Offset */}
          <g opacity="0.65" transform="translate(7, -5) scale(0.92)">
            <rect x="-6" y="-3" width="18" height="8" rx="1.2" fill="url(#uziSteel)" stroke="#000000" strokeWidth="1.2" />
            <rect x="12" y="-1.5" width="8" height="3" fill="#0F172A" stroke="#000000" strokeWidth="1.2" />
            <rect x="0" y="5" width="4.5" height="12" fill="#B45309" stroke="#000000" strokeWidth="1.2" />
            <path d="M-6 -2 L-11 -2 L-11 -7 L4 -7" stroke="#475569" strokeWidth="1.4" fill="none" />
          </g>

          {/* Front Main Tactical Uzi */}
          <rect x="-6" y="-3" width="19" height="8.5" rx="1.5" fill="url(#uziFrontSteel)" stroke="#000000" strokeWidth="1.5" />
          {/* Top Receiver Plate Highlight */}
          <rect x="-5" y="-5" width="9" height="2.2" rx="0.5" fill="#64748B" stroke="#000000" strokeWidth="1.2" />
          <rect x="-4" y="-4.5" width="7" height="1" fill="#E2E8F0" />
          {/* Cooling Vents */}
          <rect x="1" y="-1.5" width="2" height="4" rx="0.4" fill="#0F172A" />
          <rect x="4.5" y="-1.5" width="2" height="4" rx="0.4" fill="#0F172A" />
          <rect x="8" y="-1.5" width="2" height="4" rx="0.4" fill="#0F172A" />
          {/* Barrel & Flash Suppressor */}
          <rect x="13" y="-1.5" width="9.5" height="3.8" rx="0.8" fill="#0F172A" stroke="#000000" strokeWidth="1.4" />
          <rect x="22.5" y="-2.5" width="2.5" height="6" rx="0.8" fill="#475569" stroke="#000000" strokeWidth="1" />
          {/* Wire Stock */}
          <path d="M-6 -1 L-11 -1 L-11 -7 L5 -7" stroke="#94A3B8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* Extended High-Capacity Mag */}
          <rect x="0" y="5" width="4.8" height="13.5" rx="1" fill="url(#uziMag)" stroke="#000000" strokeWidth="1.4" />
          {/* Mag Ribs */}
          <line x1="0.5" y1="8" x2="4.3" y2="8" stroke="#78350F" strokeWidth="1" />
          <line x1="0.5" y1="11" x2="4.3" y2="11" stroke="#78350F" strokeWidth="1" />
          <line x1="0.5" y1="14" x2="4.3" y2="14" stroke="#78350F" strokeWidth="1" />
          {/* Tactical Grip Base */}
          <path d="M-1.5 3.5 L5.5 3.5 L4.5 10 L-2.5 9 Z" fill="#0F172A" stroke="#000000" strokeWidth="1.4" />
        </svg>
      );
    }

    if (weapon === 'riot_shield') {
      return (
        <svg viewBox="-18 -18 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldPlate" x1="-15" y1="-15" x2="15" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="30%" stopColor="#1E293B" />
              <stop offset="70%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="shieldGlass" x1="-8" y1="-9" x2="8" y2="-3" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="shieldRim" x1="-15" y1="-15" x2="15" y2="-15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* 3D Drop Shadow */}
          <rect x="-14" y="-12" width="30" height="30" rx="5" fill="#000000" opacity="0.5" filter="blur(2px)" />
          {/* Heavy Curved Ballistic Plate */}
          <rect x="-15" y="-15" width="30" height="30" rx="5" fill="url(#shieldPlate)" stroke="#000000" strokeWidth="2.2" />
          {/* Reinforced Specular Outer Rim */}
          <rect x="-13.5" y="-13.5" width="27" height="27" rx="3.5" fill="none" stroke="url(#shieldRim)" strokeWidth="1.2" opacity="0.6" />
          {/* Internal Armor Core */}
          <rect x="-12" y="-12" width="24" height="24" rx="2.5" fill="#1E293B" stroke="#334155" strokeWidth="1" />
          {/* Laminated Bulletproof Polycarbonate Viewport */}
          <rect x="-9" y="-9.5" width="18" height="7" rx="1.5" fill="url(#shieldGlass)" stroke="#38BDF8" strokeWidth="1.2" />
          {/* Bulletproof Glass Specular Glares */}
          <line x1="-7" y1="-7.5" x2="7" y2="-7.5" stroke="#F0F9FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          <line x1="-5" y1="-5.5" x2="4" y2="-5.5" stroke="#BAE6FD" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
          {/* Heavy Machined Hex Bolts */}
          <circle cx="-11" cy="-11" r="1.4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
          <circle cx="11" cy="-11" r="1.4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
          <circle cx="-11" cy="11" r="1.4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
          <circle cx="11" cy="11" r="1.4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
          {/* High-Visibility Tactical Stencils */}
          <path d="M-6 2.5 L0 7.5 L6 2.5" stroke="#FACC15" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-6 7.5 L0 12.5 L6 7.5" stroke="#FACC15" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (weapon === 'saw_gun') {
      return (
        <svg viewBox="-18 -18 52 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sawBlade" x1="10" y1="-10" x2="30" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#CBD5E1" />
              <stop offset="70%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="sawBody" x1="-10" y1="-6" x2="14" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          {/* Machine Housing */}
          <rect x="-12" y="-6" width="26" height="12" rx="2.5" fill="url(#sawBody)" stroke="#000000" strokeWidth="2" />
          <rect x="-10" y="-4" width="8" height="8" rx="1" fill="#451A03" stroke="#78350F" strokeWidth="1" />
          <rect x="0" y="6" width="5.5" height="9" rx="1" fill="#1E293B" stroke="#000000" strokeWidth="1.8" />
          {/* Rotating High-Speed Diamond Saw Blade */}
          <circle cx="21" cy="0" r="11" fill="url(#sawBlade)" stroke="#000000" strokeWidth="2" />
          <circle cx="21" cy="0" r="5" fill="#DC2626" stroke="#000000" strokeWidth="1.5" />
          <circle cx="21" cy="0" r="2" fill="#FEE2E2" />
          {/* Diamond Saw Teeth Cutouts */}
          <path d="M21 -11 L23 -15 L25 -11 L29 -13 L29 -9 L33 -8 L31 -4 L35 -1 L31 2 L33 6 L29 7 L29 11 L25 9 L23 13 L21 9 L19 13 L17 9 L13 11 L13 7 L9 6 L11 2 L7 -1 L11 -4 L9 -8 L13 -9 L13 -13 L17 -11 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="0.8" />
          {/* Carry Handle */}
          <path d="M-6 -6 L-6 -10 L6 -10 L6 -6" stroke="#1E293B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      );
    }

    if (weapon === 'pistol') {
      return (
        <svg viewBox="-10 -12 40 26" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pistolSlide" x1="0" y1="-6" x2="0" y2="1" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="pistolWood" x1="0" y1="1" x2="6" y2="11" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <rect x="0" y="-6" width="21" height="7" rx="1.4" fill="url(#pistolSlide)" stroke="#000000" strokeWidth="1.6" />
          <rect x="1" y="-5.5" width="19" height="1.8" rx="0.4" fill="#FFFFFF" />
          {/* Slide Serrations */}
          <rect x="2" y="-4.5" width="1.2" height="4.2" fill="#64748B" />
          <rect x="4.5" y="-4.5" width="1.2" height="4.2" fill="#64748B" />
          <rect x="7" y="-4.5" width="1.2" height="4.2" fill="#64748B" />
          {/* Receiver */}
          <rect x="1" y="0" width="14.5" height="3.5" rx="0.8" fill="#334155" stroke="#000000" strokeWidth="1.5" />
          {/* Wooden Checkered Grip */}
          <path d="M1 1.2 L6.2 1.2 L4.8 11 L-0.8 10.5 Z" fill="url(#pistolWood)" stroke="#000000" strokeWidth="1.6" />
          <rect x="1.5" y="3.5" width="3.2" height="5.5" rx="0.6" fill="#451A03" opacity="0.6" />
          <rect x="-1.8" y="-4.5" width="2.5" height="3.5" fill="#0F172A" />
          <rect x="19" y="-8" width="2" height="2.5" fill="#0F172A" />
        </svg>
      );
    }

    if (weapon === 'rifle' || weapon === 'm4_rifle') {
      return (
        <svg viewBox="-20 -14 66 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="m4Metal" x1="0" y1="-5" x2="0" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="m4Rail" x1="16" y1="-4" x2="30" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="m4Mag" x1="3" y1="3" x2="11" y2="15" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          {/* Tactical Adjustable Stock */}
          <path d="M-4 -2.5 L-15 1 L-15 7.5 L-4 4.5 Z" fill="#1E293B" stroke="#000000" strokeWidth="1.8" />
          <rect x="-16.5" y="0" width="2.8" height="8.5" rx="0.8" fill="#0F172A" stroke="#000000" strokeWidth="1.4" />
          <line x1="-12" y1="1" x2="-6" y2="3.5" stroke="#475569" strokeWidth="1.5" />
          {/* Main Upper/Lower Receiver */}
          <rect x="-4" y="-4.5" width="21" height="8" rx="1.5" fill="url(#m4Metal)" stroke="#000000" strokeWidth="1.8" />
          <rect x="-2" y="-5.5" width="13" height="2.2" rx="0.5" fill="#64748B" />
          <rect x="5" y="-4.2" width="3.5" height="1.6" rx="0.4" fill="#E2E8F0" />
          {/* Curved High-Capacity 30-Round Magazine */}
          <path d="M6 3.2 Q11.5 8.5 8.5 15 L3.5 14 Q6.5 7.5 2 3.2 Z" fill="url(#m4Mag)" stroke="#000000" strokeWidth="1.8" />
          {/* Picatinny Handguard */}
          <rect x="17" y="-3.5" width="14" height="6.5" rx="1" fill="url(#m4Rail)" stroke="#000000" strokeWidth="1.8" />
          <line x1="18" y1="-1" x2="29" y2="-1" stroke="#94A3B8" strokeWidth="0.9" />
          <line x1="18" y1="1" x2="29" y2="1" stroke="#94A3B8" strokeWidth="0.9" />
          {/* Heavy Steel Fluted Barrel */}
          <rect x="31" y="-3" width="12" height="3.4" fill="#0F172A" stroke="#000000" strokeWidth="1.8" />
          {/* A2 Birdcage Flash Hider */}
          <rect x="42" y="-4.2" width="4" height="5.8" rx="0.8" fill="#334155" stroke="#000000" strokeWidth="1.6" />
          <rect x="43.5" y="-3.2" width="1" height="3.8" fill="#F8FAFC" />
          {/* Front Sight Post */}
          <path d="M37 -3 L39 -8.5 L41 -3 Z" fill="#0F172A" stroke="#000000" strokeWidth="1.4" />
          {/* Ergonomic Textured Pistol Grip */}
          <rect x="0" y="3.5" width="4.8" height="8" rx="1" fill="#1E293B" stroke="#000000" strokeWidth="1.6" />
          <rect x="1" y="5" width="2.8" height="5" rx="0.5" fill="#475569" opacity="0.6" />
        </svg>
      );
    }

    if (weapon === 'shotgun') {
      return (
        <svg viewBox="-22 -12 64 28" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shotgunWood" x1="-16" y1="1" x2="-4" y2="7" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="50%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
            <linearGradient id="shotgunBarrel" x1="14" y1="-4.5" x2="38" y2="3.5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="35%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          {/* Hardwood Combat Stock */}
          <path d="M-4 -2.5 L-16 1.8 L-16 8.5 L-4 5.5 Z" fill="url(#shotgunWood)" stroke="#000000" strokeWidth="1.8" />
          <rect x="-17.5" y="1" width="2.8" height="8.5" rx="0.8" fill="#0F172A" stroke="#000000" strokeWidth="1.4" />
          {/* Receiver */}
          <rect x="-4" y="-4.5" width="19" height="8.5" rx="1.5" fill="#1E293B" stroke="#000000" strokeWidth="1.8" />
          {/* Ejection Port with Red Shell */}
          <rect x="2" y="-3" width="6.5" height="3.5" rx="0.5" fill="#DC2626" stroke="#000000" strokeWidth="1.2" />
          <rect x="6" y="-3" width="2.5" height="3.5" fill="#FACC15" />
          {/* Heavy Dual Barrels */}
          <rect x="15" y="-4.5" width="23" height="4.2" rx="0.6" fill="url(#shotgunBarrel)" stroke="#000000" strokeWidth="1.8" />
          <rect x="15" y="-0.2" width="20" height="3.8" rx="0.6" fill="url(#shotgunBarrel)" stroke="#000000" strokeWidth="1.6" />
          {/* Ribbed Pump Forend Handle */}
          <rect x="18" y="-1.2" width="11" height="6" rx="1.2" fill="#0F172A" stroke="#000000" strokeWidth="1.6" />
          <line x1="21" y1="-0.5" x2="21" y2="4.2" stroke="#475569" strokeWidth="1.2" />
          <line x1="24" y1="-0.5" x2="24" y2="4.2" stroke="#475569" strokeWidth="1.2" />
          <line x1="27" y1="-0.5" x2="27" y2="4.2" stroke="#475569" strokeWidth="1.2" />
          {/* Brass Front Bead Sight */}
          <circle cx="37" cy="-5.5" r="1.6" fill="#FACC15" stroke="#713F12" strokeWidth="0.8" />
          <rect x="0" y="4" width="4.8" height="6.5" rx="1" fill="#0F172A" stroke="#000000" strokeWidth="1.6" />
        </svg>
      );
    }

    if (weapon === 'sniper') {
      return (
        <svg viewBox="-24 -16 80 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sniperChassis" x1="-6" y1="-3" x2="26" y2="5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="50%" stopColor="#166534" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>
            <linearGradient id="sniperScopeGlass" x1="21" y1="-12" x2="26" y2="-4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="sniperBarrel" x1="24" y1="-2" x2="52" y2="2" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          {/* Ergonomic Skeletonized Camo Stock */}
          <path d="M-6 -3.5 L-20 -1 L-20 7.5 L-12 7.5 L-9 3.5 L-6 3.5 Z" fill="#166534" stroke="#000000" strokeWidth="1.8" />
          <rect x="-18" y="-4.5" width="8" height="3.5" rx="0.8" fill="#0F172A" />
          {/* Main Heavy .50 BMG Chassis */}
          <rect x="-6" y="-3.5" width="31" height="7" rx="1.5" fill="url(#sniperChassis)" stroke="#000000" strokeWidth="1.8" />
          <rect x="4" y="3.5" width="7.5" height="7" rx="1" fill="#1E293B" stroke="#000000" strokeWidth="1.6" />
          {/* High-Powered Mil-Dot Optical Scope with Lens Reflection */}
          <rect x="2" y="-11" width="23" height="5.5" rx="1.2" fill="#0F172A" stroke="#000000" strokeWidth="1.8" />
          <rect x="0" y="-12" width="4.5" height="7.5" rx="1" fill="#1E293B" stroke="#000000" strokeWidth="1.6" />
          <rect x="22" y="-12.5" width="5.5" height="8.5" rx="1" fill="#1E293B" stroke="#000000" strokeWidth="1.6" />
          <rect x="25" y="-11" width="2" height="5.5" rx="0.5" fill="url(#sniperScopeGlass)" />
          {/* Scope Mount Rings */}
          <rect x="6" y="-5.5" width="3" height="2.8" rx="0.5" fill="#0F172A" />
          <rect x="17" y="-5.5" width="3" height="2.8" rx="0.5" fill="#0F172A" />
          {/* Long Match-Grade Fluted Barrel */}
          <rect x="25" y="-2.2" width="26" height="3.8" rx="0.6" fill="url(#sniperBarrel)" stroke="#000000" strokeWidth="1.8" />
          {/* Massive Multislot Muzzle Brake */}
          <rect x="49" y="-5" width="7" height="9.5" rx="1.2" fill="#0F172A" stroke="#000000" strokeWidth="1.8" />
          <line x1="51.5" y1="-3.5" x2="51.5" y2="3.5" stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1="54" y1="-3.5" x2="54" y2="3.5" stroke="#FFFFFF" strokeWidth="1.2" />
          {/* Foldable Bipod Mount */}
          <path d="M29 2 L26 8 L32 8" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    }

    if (weapon === 'rocket') {
      return (
        <svg viewBox="-22 -16 76 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rocketTube" x1="-14" y1="-6" x2="24" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="50%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <linearGradient id="rocketWarhead" x1="32" y1="-8" x2="50" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="40%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
          </defs>
          {/* Main Launcher Olive Tube */}
          <rect x="-14" y="-6.5" width="38" height="12" rx="2" fill="url(#rocketTube)" stroke="#000000" strokeWidth="2" />
          {/* Heat Insulation Wood Shield Rings */}
          <rect x="-5" y="-7.5" width="18" height="14" rx="1.5" fill="#92400E" stroke="#000000" strokeWidth="1.8" />
          <line x1="1" y1="-7.5" x2="1" y2="6.5" stroke="#78350F" strokeWidth="1.4" />
          <line x1="7" y1="-7.5" x2="7" y2="6.5" stroke="#78350F" strokeWidth="1.4" />
          {/* Rear Venturi Blast Exhaust Conical Nozzle */}
          <path d="M-14 -6.5 L-20 -9.5 L-20 9.5 L-14 6.5 Z" fill="#0F172A" stroke="#000000" strokeWidth="2" />
          {/* Front Launch Ring */}
          <rect x="22" y="-8" width="5.5" height="15" rx="1.5" fill="#0F172A" stroke="#000000" strokeWidth="2" />
          {/* Aerodynamic Conical Warhead with Nose Fuze */}
          <path d="M31 -7.5 L40 -8.5 L50 0 L40 8.5 L31 7.5 Z" fill="url(#rocketWarhead)" stroke="#000000" strokeWidth="2" />
          <rect x="38" y="-8.2" width="3.5" height="16.4" fill="#DC2626" />
          <rect x="49" y="-1.5" width="4" height="3" rx="0.5" fill="#F8FAFC" stroke="#000000" strokeWidth="1" />
          {/* Dual Ergonomic Grips */}
          <rect x="-3" y="5.5" width="4.5" height="8" rx="1" fill="#0F172A" stroke="#000000" strokeWidth="1.6" />
          <rect x="12" y="5.5" width="4.5" height="8" rx="1" fill="#0F172A" stroke="#000000" strokeWidth="1.6" />
          {/* Optical Sight Prism */}
          <rect x="4" y="-10.5" width="6" height="4.5" rx="0.8" fill="#1E293B" stroke="#000000" strokeWidth="1.4" />
        </svg>
      );
    }

    if (weapon === 'minigun') {
      return (
        <svg viewBox="-22 -16 70 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mgBarrels" x1="0" y1="-8" x2="36" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="40%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="mgBody" x1="-12" y1="-8" x2="10" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>
          {/* Vulcan Motor Receiver */}
          <rect x="-14" y="-8" width="22" height="16" rx="2.5" fill="url(#mgBody)" stroke="#000000" strokeWidth="2" />
          <rect x="-12" y="-10" width="18" height="4" rx="1" fill="#475569" stroke="#000" strokeWidth="1" />
          {/* Rotary Multi-Barrel Assembly */}
          <rect x="8" y="-7" width="32" height="14" rx="1" fill="url(#mgBarrels)" stroke="#000000" strokeWidth="1.8" />
          <line x1="8" y1="-4" x2="40" y2="-4" stroke="#e2e8f0" strokeWidth="1.2" />
          <line x1="8" y1="0" x2="40" y2="0" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="8" y1="4" x2="40" y2="4" stroke="#e2e8f0" strokeWidth="1.2" />
          {/* Clamp Rings */}
          <rect x="18" y="-8" width="4" height="16" rx="1" fill="#1e293b" stroke="#000" strokeWidth="1.2" />
          <rect x="32" y="-8" width="4" height="16" rx="1" fill="#1e293b" stroke="#000" strokeWidth="1.2" />
          {/* Ammo Belt Chute */}
          <path d="M -8 8 L -14 16 L -6 18 L 0 10 Z" fill="#ca8a04" stroke="#78350f" strokeWidth="1.2" />
          {/* Top Handle Grip */}
          <path d="M -6 -8 L -6 -13 L 8 -13 L 8 -8" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    }

    if (weapon === 'flamethrower' || weapon === 'flame') {
      return (
        <svg viewBox="-22 -16 70 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ftTank" x1="-12" y1="-8" x2="6" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="60%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          {/* Twin Pressurized Fuel Tanks */}
          <rect x="-14" y="-8" width="18" height="7" rx="3.5" fill="url(#ftTank)" stroke="#000000" strokeWidth="1.6" />
          <rect x="-14" y="1" width="18" height="7" rx="3.5" fill="url(#ftTank)" stroke="#000000" strokeWidth="1.6" />
          {/* Tank Straps & Fuel Line */}
          <rect x="-8" y="-9" width="3" height="18" fill="#1e293b" />
          <path d="M 4 -4 C 10 -4, 10 4, 16 4 L 38 4" stroke="#f59e0b" strokeWidth="2" fill="none" />
          {/* Barrel & Igniter Nozzle */}
          <rect x="4" y="-5" width="28" height="6" rx="1.2" fill="#334155" stroke="#000000" strokeWidth="1.8" />
          <rect x="32" y="-7" width="6" height="10" rx="1" fill="#0f172a" stroke="#000000" strokeWidth="1.5" />
          {/* Pilot Light Flame */}
          <polygon points="38,-3 45,-1 38,1 42,4 38,5" fill="#f97316" className="animate-pulse" />
          <polygon points="38,-1 42,-1 38,1" fill="#fef08a" />
        </svg>
      );
    }

    if (weapon === 'laser') {
      return (
        <svg viewBox="-20 -14 66 28" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lsBody" x1="-10" y1="-6" x2="30" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#083344" />
              <stop offset="50%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#155e75" />
            </linearGradient>
          </defs>
          <rect x="-12" y="-6" width="32" height="12" rx="2" fill="url(#lsBody)" stroke="#06b6d4" strokeWidth="1.8" />
          <rect x="4" y="-4" width="12" height="8" rx="1" fill="#06b6d4" opacity="0.8" className="animate-pulse" />
          <rect x="20" y="-3.5" width="18" height="7" rx="1" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
          <line x1="22" y1="0" x2="36" y2="0" stroke="#67e8f9" strokeWidth="2" />
          <rect x="38" y="-5" width="4" height="10" rx="1" fill="#06b6d4" />
        </svg>
      );
    }

    if (weapon === 'ak47') {
      return (
        <svg viewBox="-20 -14 66 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="akWood" x1="-12" y1="-2" x2="-2" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <path d="M-4 -2.5 L-16 1 L-16 8 L-4 4 Z" fill="url(#akWood)" stroke="#000000" strokeWidth="1.8" />
          <rect x="-4" y="-4.5" width="18" height="8" rx="1.5" fill="#334155" stroke="#000000" strokeWidth="1.8" />
          <path d="M4 3.5 Q8 10 5 16 L0 15 Q3 9 -1 3.5 Z" fill="#d97706" stroke="#000000" strokeWidth="1.6" />
          <rect x="14" y="-3.5" width="12" height="5.5" fill="url(#akWood)" stroke="#000000" strokeWidth="1.6" />
          <rect x="26" y="-2.5" width="16" height="3.2" fill="#0f172a" stroke="#000000" strokeWidth="1.6" />
          <rect x="42" y="-3.5" width="3" height="5.2" fill="#334155" />
        </svg>
      );
    }

    // Frag Grenade
    return (
      <svg viewBox="-14 -16 28 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="0" cy="1" r="10" fill="#166534" stroke="#000000" strokeWidth="2" />
        <line x1="-9" y1="1" x2="9" y2="1" stroke="#14532D" strokeWidth="1.5" />
        <line x1="0" y1="-9" x2="0" y2="11" stroke="#14532D" strokeWidth="1.5" />
        <rect x="-3" y="-13" width="6" height="6" fill="#64748B" stroke="#000000" strokeWidth="1.8" />
        <circle cx="0" cy="1" r="3" fill="#EF4444" />
      </svg>
    );
  };

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={combinedFilter ? { filter: combinedFilter } : undefined}
    >
      {renderContent()}
    </span>
  );
};
