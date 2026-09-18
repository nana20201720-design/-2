import { WeaponType } from '../types';
import { drawWeaponSprite2D } from './weaponSprites';

export interface SoldierVisualOptions {
  camoColor?: string;
  headgear?: string;
  bodyArmor?: string;
  eyewear?: string;
  sunglasses?: boolean;
  beard?: string;
  jetpackStyle?: string;
  skinTone?: string;
  weapon?: WeaponType | 'fists' | string;
  aimAngle?: number;
  isFacingRight?: boolean;
  isJetpacking?: boolean;
  isGrounded?: boolean;
  walkCycle?: number;
  isCrouching?: boolean;
  recoilOffset?: number;
  muzzleFlashTimer?: number;
  trailColor?: string;
  animTime?: number;
  charAvatarIndex?: number;
  scale?: number;
  isSaluting?: boolean;
  saluteTime?: number;
}

/**
 * Draws the high-detail authentic Mini Militia 2D Commando Soldier.
 * Usable seamlessly on both the live interactive dressing canvas and in-game matches!
 */
export function drawSoldier2D(ctx: CanvasRenderingContext2D, opt: SoldierVisualOptions) {
  const {
    camoColor = '#365314',
    headgear = 'camo_helmet',
    bodyArmor = 'molle_vest',
    eyewear = 'aviators',
    beard = 'stubble',
    jetpackStyle = 'military_dual',
    skinTone = '#fbb587',
    weapon = 'pistol',
    aimAngle = 0,
    isFacingRight = true,
    isJetpacking = false,
    isGrounded = true,
    walkCycle = 0,
    isCrouching = false,
    recoilOffset = 0,
    muzzleFlashTimer = 0,
    trailColor = '#a855f7',
    animTime = 0,
    charAvatarIndex = 1,
    scale = 1.0,
    isSaluting = false,
    saluteTime = 0,
  } = opt;

  ctx.save();
  ctx.scale(scale, scale);

  const facingMultiplier = isFacingRight ? 1 : -1;
  const crouchShift = isCrouching ? 8 : 0;

  ctx.scale(facingMultiplier, 1);

  // ==========================================
  // 1. JETPACK & EXHAUST THRUST
  // ==========================================
  const jetpackX = -14;
  const jetpackY = -6 + crouchShift;

  // Resolve Trail / Jet Flame colors
  let primaryFlameColor = '#f97316';
  let innerFlameColor = '#fef08a';
  let smokeRingColor = 'rgba(255, 255, 255, 0.7)';

  if (trailColor === '#a855f7' || trailColor === 'neon_purple') {
    primaryFlameColor = '#a855f7';
    innerFlameColor = '#f0abfc';
    smokeRingColor = 'rgba(216, 180, 254, 0.7)';
  } else if (trailColor === '#10b981' || trailColor === 'toxic_acid') {
    primaryFlameColor = '#22c55e';
    innerFlameColor = '#86efac';
    smokeRingColor = 'rgba(134, 239, 172, 0.7)';
  } else if (trailColor === '#ef4444' || trailColor === 'inferno') {
    primaryFlameColor = '#ef4444';
    innerFlameColor = '#fde047';
    smokeRingColor = 'rgba(254, 215, 170, 0.7)';
  } else if (trailColor === '#0284c7' || trailColor === 'arc_plasma') {
    primaryFlameColor = '#06b6d4';
    innerFlameColor = '#e0f2fe';
    smokeRingColor = 'rgba(186, 230, 253, 0.7)';
  } else if (trailColor === '#eab308' || trailColor === 'gold_sunfire') {
    primaryFlameColor = '#eab308';
    innerFlameColor = '#fef08a';
    smokeRingColor = 'rgba(254, 240, 138, 0.8)';
  }

  // Draw Thruster Exhaust Flames & Smoke Rings
  if (isJetpacking) {
    const flameLen = 22 + Math.sin(animTime * 34) * 8;

    // Outer Thruster Flame Cone
    ctx.fillStyle = primaryFlameColor;
    ctx.beginPath();
    ctx.moveTo(jetpackX - 5, jetpackY + 22);
    ctx.lineTo(jetpackX + 2, jetpackY + 22 + flameLen);
    ctx.lineTo(jetpackX + 9, jetpackY + 22);
    ctx.fill();

    // Inner Core
    ctx.fillStyle = innerFlameColor;
    ctx.beginPath();
    ctx.moveTo(jetpackX - 2, jetpackY + 22);
    ctx.lineTo(jetpackX + 2, jetpackY + 20 + flameLen * 0.68);
    ctx.lineTo(jetpackX + 6, jetpackY + 22);
    ctx.fill();

    // Trailing Smoke Puffs
    ctx.strokeStyle = smokeRingColor;
    ctx.fillStyle = smokeRingColor.replace('0.7', '0.35').replace('0.8', '0.4');
    ctx.lineWidth = 2;
    for (let s = 1; s <= 3; s++) {
      const offset = (animTime * 55 + s * 16) % 50;
      const r = 4 + offset * 0.28;
      ctx.beginPath();
      ctx.arc(jetpackX + 2, jetpackY + 22 + flameLen + offset, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Jetpack Canister Unit Rendering based on Style
  if (jetpackStyle === 'cyber_plasma' || headgear === 'cyber_commando') {
    // Cyber Plasma Hex Engine
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY - 2, 17, 24, 4);
    ctx.fill();
    ctx.stroke();
    // Neon cooling lines
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(jetpackX - 3, jetpackY + 4, 13, 3);
    ctx.fillRect(jetpackX - 3, jetpackY + 11, 13, 3);
    // Cyan Core Light
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(jetpackX + 3.5, jetpackY + 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (jetpackStyle === 'golden_falcon') {
    // Royal Golden Wing Jetpack
    ctx.fillStyle = '#ca8a04';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 6, jetpackY - 3, 19, 26, 5);
    ctx.fill();
    ctx.stroke();
    // Golden Wing Trim
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(jetpackX - 6, jetpackY + 2);
    ctx.lineTo(jetpackX - 14, jetpackY - 4);
    ctx.lineTo(jetpackX - 6, jetpackY + 10);
    ctx.closePath();
    ctx.fill();

  } else if (jetpackStyle === 'toxic_jets') {
    // Biohazard Dual Canister
    ctx.fillStyle = '#14532d';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY - 1, 17, 24, 4);
    ctx.fill();
    ctx.stroke();
    // Acid Warning Stripe
    ctx.fillStyle = '#84cc16';
    ctx.fillRect(jetpackX - 3, jetpackY + 6, 13, 4);

  } else {
    // Standard Heavy Military Dual Turbine
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY, 17, 23, 4);
    ctx.fill();
    ctx.stroke();

    // Twin metal turbine exhausts
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(jetpackX - 4, jetpackY + 18, 6, 6);
    ctx.fillRect(jetpackX + 5, jetpackY + 18, 6, 6);

    // Indicator Fuel LED
    const isFuelBlink = Math.sin(animTime * 6) > 0;
    ctx.fillStyle = isFuelBlink ? '#10b981' : '#047857';
    ctx.beginPath();
    ctx.arc(jetpackX + 3.5, jetpackY + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================
  // 2. BOOTS & LEGS ANIMATION
  // ==========================================
  const legY = isCrouching ? 12 : 16;
  const walkSin = isGrounded ? Math.sin(walkCycle) * 6 : 0;

  // Back Boot
  ctx.fillStyle = '#1c1917';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(-6 + (isJetpacking ? -2 : walkSin), legY, 7.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Boot sole & tread
  ctx.fillStyle = '#44403c';
  ctx.fillRect(-10 + (isJetpacking ? -2 : walkSin), legY + 2, 9, 3);

  // Front Boot
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(4 + (isJetpacking ? 2 : -walkSin), legY, 7.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#44403c';
  ctx.fillRect(0 + (isJetpacking ? 2 : -walkSin), legY + 2, 9, 3);

  // ==========================================
  // 3. SOLDIER TORSO & BODY ARMOR
  // ==========================================
  const torsoW = 19;
  const torsoH = 22 - (isCrouching ? 6 : 0);
  const torsoX = -9.5;
  const torsoY = -8 + crouchShift;

  // Base Combat Uniform Underlayer
  ctx.fillStyle = camoColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(torsoX, torsoY, torsoW, torsoH, 7);
  ctx.fill();
  ctx.stroke();

  // Camo Texture Splotches on Uniform
  ctx.fillStyle = '#142918';
  ctx.beginPath();
  ctx.arc(-3, -1 + crouchShift, 3.8, 0, Math.PI * 2);
  ctx.arc(4, 4 + crouchShift, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Render Body Armor Style
  if (bodyArmor === 'juggernaut') {
    // HEAVY JUGGERNAUT PLATED ARMOR
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    // Heavy Chest Plate
    ctx.beginPath();
    ctx.roundRect(-9, -5 + crouchShift, 18, 14, 3);
    ctx.fill();
    ctx.stroke();
    // Blast Plate Ribs
    ctx.fillStyle = '#334155';
    ctx.fillRect(-7, -3 + crouchShift, 14, 3);
    ctx.fillRect(-7, 2 + crouchShift, 14, 3);
    // Heavy Shoulder Pauldron
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-8, -4 + crouchShift, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

  } else if (bodyArmor === 'chest_harness') {
    // CHEST HARNESS & 50CAL BRASS BANDOLIER
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, -6 + crouchShift);
    ctx.lineTo(8, 9 + crouchShift);
    ctx.stroke();
    // Shiny Brass Cartridges
    ctx.fillStyle = '#facc15';
    for (let bi = 0; bi < 4; bi++) {
      ctx.fillRect(-5 + bi * 3.8, -4 + bi * 3.8 + crouchShift, 2.5, 4);
    }
    // Combat Dagger Sheath on chest
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 0 + crouchShift, 4, 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-7, -2 + crouchShift, 2, 3);

  } else if (bodyArmor === 'cyber_rig') {
    // CYBER EXOSKELETON RIG
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-8.5, -4 + crouchShift, 17, 13, 4);
    ctx.fill();
    ctx.stroke();
    // Glowing Arc Reactor in chest center
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(0, 2 + crouchShift, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 2 + crouchShift, 1.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (bodyArmor === 'hazmat_suit') {
    // HAZMAT BIO SUIT HARNESS
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-8, -4 + crouchShift, 16, 12, 3);
    ctx.fill();
    ctx.stroke();
    // Biohazard Symbol on chest
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 1 + crouchShift, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // STANDARD MOLLE TACTICAL KEVLAR VEST
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(-8.5, -5 + crouchShift, 17, 13, 4);
    ctx.fill();
    ctx.stroke();
    // 3 Front Ammo Pouches
    ctx.fillStyle = '#334155';
    for (let pi = 0; pi < 3; pi++) {
      ctx.fillRect(-6 + pi * 4.5, 0 + crouchShift, 3.5, 6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-6 + pi * 4.5, 0 + crouchShift, 3.5, 1.5);
      ctx.fillStyle = '#334155';
    }
  }

  // Tactical Belt & Buckle
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-9.5, 4 + crouchShift, 19, 4.5);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-2, 4 + crouchShift, 4, 4.5);

  // ==========================================
  // 4. SOLDIER HEAD & FACE
  // ==========================================
  const headX = 0;
  const headY = -15 + crouchShift;
  const headRadius = 13.5;

  // Skin Base
  ctx.fillStyle = skinTone;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ear
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(headX - 11, headY, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big Cartoon Combat Eyes
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  // Front Eye
  ctx.beginPath();
  ctx.ellipse(headX + 5, headY - 1, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Back Eye
  ctx.beginPath();
  ctx.ellipse(headX - 2, headY - 1, 4.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dynamic Aim Pupils
  const eyeLookAngle = isFacingRight ? aimAngle : Math.PI - aimAngle;
  const pupilOffsetX = Math.cos(eyeLookAngle) * 1.8;
  const pupilOffsetY = Math.sin(eyeLookAngle) * 1.5;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(headX + 5.5 + pupilOffsetX, headY - 1 + pupilOffsetY, 2.2, 0, Math.PI * 2);
  ctx.arc(headX - 1.5 + pupilOffsetX, headY - 1 + pupilOffsetY, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Eye catchlight glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(headX + 5.5 + pupilOffsetX - 0.7, headY - 1 + pupilOffsetY - 0.7, 0.8, 0, Math.PI * 2);
  ctx.arc(headX - 1.5 + pupilOffsetX - 0.7, headY - 1 + pupilOffsetY - 0.7, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Fierce Eyebrows
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(headX - 5, headY - 6);
  ctx.lineTo(headX + 1, headY - 4);
  ctx.moveTo(headX + 2, headY - 4);
  ctx.lineTo(headX + 9, headY - 6);
  ctx.stroke();

  // Gritted Teeth Mouth (Iconic Mini Militia Expression)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.8;
  ctx.fillRect(headX + 1, headY + 5, 8.5, 4.5);
  ctx.strokeRect(headX + 1, headY + 5, 8.5, 4.5);
  // Teeth grid
  ctx.beginPath();
  ctx.moveTo(headX + 3.8, headY + 5);
  ctx.lineTo(headX + 3.8, headY + 9.5);
  ctx.moveTo(headX + 6.5, headY + 5);
  ctx.lineTo(headX + 6.5, headY + 9.5);
  ctx.moveTo(headX + 1, headY + 7.2);
  ctx.lineTo(headX + 9.5, headY + 7.2);
  ctx.stroke();

  // ==========================================
  // 5. BEARD, STUBBLE & CIGAR
  // ==========================================
  if (beard === 'stubble' || beard === 'full_beard' || charAvatarIndex === 4) {
    // 5 o'clock shadow stubble
    ctx.fillStyle = 'rgba(28, 25, 23, 0.35)';
    ctx.beginPath();
    ctx.arc(headX + 1, headY + 7, 8, 0, Math.PI * 0.95);
    ctx.fill();

    if (beard === 'full_beard') {
      // Full badass commando beard
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect(headX - 4, headY + 6, 14, 6, 3);
      ctx.fill();
    }
  }

  if (beard === 'cigar') {
    // Burning Combat Cigar
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.fillRect(headX + 6, headY + 6, 8, 2.8);
    ctx.strokeRect(headX + 6, headY + 6, 8, 2.8);
    // Glowing red ember tip
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(headX + 14, headY + 6, 2, 2.8);
    // Rising cigar smoke wisp
    const smokeSway = Math.sin(animTime * 4) * 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(headX + 15, headY + 5);
    ctx.quadraticCurveTo(headX + 17 + smokeSway, headY - 2, headX + 15 + smokeSway * 2, headY - 10);
    ctx.stroke();
  }

  // ==========================================
  // 6. EYEWEAR (Aviator Sunglasses / Ballistic Goggles)
  // ==========================================
  if (eyewear === 'aviators' || opt.sunglasses) {
    // Dark Mirror Aviator Sunglasses
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    // Front lens
    ctx.beginPath();
    ctx.roundRect(headX + 3, headY - 3, 7.5, 6, 2);
    ctx.fill();
    ctx.stroke();
    // Back lens
    ctx.beginPath();
    ctx.roundRect(headX - 4, headY - 3, 6.5, 6, 2);
    ctx.fill();
    ctx.stroke();
    // Sunglasses Bridge
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX + 2.5, headY - 1);
    ctx.lineTo(headX + 3.5, headY - 1);
    ctx.stroke();
    // Lens Glint Shine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(headX + 4.5, headY - 2);
    ctx.lineTo(headX + 8.5, headY + 1.5);
    ctx.stroke();

  } else if (eyewear === 'ballistic_goggles') {
    // High-Tech Ballistic Combat Goggles
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(headX - 6, headY - 4, 17, 7, 3);
    ctx.fill();
    ctx.stroke();
    // Strap wrapping around head
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(headX - 13, headY - 3, 8, 4);
  }

  // ==========================================
  // 7. REALISTIC HEADGEAR & HELMETS
  // ==========================================
  if (headgear === 'nvg_helmet') {
    // TACTICAL NVG NIGHT VISION GOGGLES HELMET
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 15.5, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // NVG Mount Arm Bracket
    ctx.fillStyle = '#475569';
    ctx.fillRect(headX + 3, headY - 9, 7, 5);
    // Quad Tube Glowing Night Vision Goggles
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(headX + 6, headY - 6, 8, 6, 2);
    ctx.fill();
    ctx.stroke();
    // Glowing Green NVG Tube Optics
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(headX + 11, headY - 3, 2, 0, Math.PI * 2);
    ctx.fill();

  } else if (headgear === 'pilot_helmet') {
    // STEALTH JET FIGHTER PILOT HELMET WITH TINTED VISOR
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 16, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Gold/Emerald Mirror Pilot Visor
    ctx.fillStyle = '#047857';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(headX - 3, headY - 6, 15, 8, 3);
    ctx.fill();
    ctx.stroke();
    // Oxygen Hose Mount
    ctx.fillStyle = '#475569';
    ctx.fillRect(headX - 8, headY + 2, 6, 5);

  } else if (headgear === 'gas_mask') {
    // HEAVY BIOHAZARD GAS MASK
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(headX - 3, headY - 1, 16, 14, 5);
    ctx.fill();
    ctx.stroke();
    // Tinted circular breathing filter canister
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(headX + 9, headY + 8, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Filter intake grill lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(headX + 6, headY + 8); ctx.lineTo(headX + 12, headY + 8);
    ctx.moveTo(headX + 9, headY + 5); ctx.lineTo(headX + 9, headY + 11);
    ctx.stroke();

  } else if (headgear === 'beret_green' || charAvatarIndex === 3) {
    // SPECIAL FORCES GREEN BERET
    ctx.fillStyle = '#365314';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(headX + 2, headY - 9, 16, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Beret Leather Rim
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX - 12, headY - 6, 24, 4);
    // Silver Crest Badge
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(headX + 7, headY - 9, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (headgear === 'beret_red' || charAvatarIndex === 4) {
    // COMMANDO RED BERET
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(headX + 2, headY - 9, 16, 8, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX - 12, headY - 6, 24, 4);
    // Gold Star Crest
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX + 7, headY - 9, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (headgear === 'bandana' || charAvatarIndex === 2) {
    // RAMBO COMBAT BANDANA
    ctx.fillStyle = '#854d0e'; // Hair fringe
    ctx.beginPath();
    ctx.arc(headX, headY - 4, 14.5, Math.PI * 0.9, Math.PI * 2.1, false);
    ctx.fill();
    // Olive Headband
    ctx.fillStyle = '#4d7c0f';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(headX - 14, headY - 7, 28, 6.5, 2);
    ctx.fill();
    ctx.stroke();
    // Dangling Knot Tails
    ctx.beginPath();
    ctx.moveTo(headX - 12, headY - 5);
    ctx.lineTo(headX - 19, headY + 1);
    ctx.lineTo(headX - 14, headY - 2);
    ctx.stroke();

  } else if (headgear === 'skull_mask') {
    // GHOST SKULL COMBAT BALACLAVA
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 15, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Skull jaw paint
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(headX + 1, headY + 4, 9, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(headX + 3, headY + 5, 1.5, 4);
    ctx.fillRect(headX + 6, headY + 5, 1.5, 4);

  } else if (headgear === 'ninja_mask') {
    // SHADOW NINJA HOOD
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 2, 15.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Eye slit opening
    ctx.fillStyle = skinTone;
    ctx.fillRect(headX - 5, headY - 3, 15, 6);

  } else {
    // MILITARY CAMO COMBAT HELMET
    ctx.fillStyle = camoColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 15, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Helmet Lower Camo Rim
    ctx.fillStyle = '#1e3a2f';
    ctx.beginPath();
    ctx.roundRect(headX - 15, headY - 4, 30, 4.5, 2);
    ctx.fill();
    ctx.stroke();

    // Chin Strap
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(headX - 10, headY);
    ctx.lineTo(headX - 4, headY + 11);
    ctx.stroke();
  }

  // ==========================================
  // 8. ARMS, HANDS & WEAPON WITH REALISTIC RECOIL
  // ==========================================
  ctx.save();
  ctx.translate(0, crouchShift);

  let baseGunAngle = aimAngle;
  if (!isFacingRight) baseGunAngle = Math.PI - aimAngle;

  if (isSaluting) {
    // Victory Salute Stance
    const saluteArmAngle = -Math.PI * 0.45;
    ctx.rotate(saluteArmAngle);
    ctx.translate(14, -8);
    // Draw Hand touching brow
    ctx.fillStyle = skinTone;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.rotate(baseGunAngle);
    ctx.translate(-recoilOffset, 0);

    const wStr = (weapon as string).toLowerCase();

    if (wStr !== 'fists' && wStr !== 'none') {
      // Draw Authentic 2D Weapon Sprite
      drawWeaponSprite2D(ctx, (weapon as WeaponType) || 'pistol', 1.0);

      // Back Gripping Hand with Thumb
      ctx.fillStyle = skinTone;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(3, 2, 5, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ea9c6d';
      ctx.beginPath();
      ctx.arc(4, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Front Support Hand
      ctx.fillStyle = skinTone;
      let frontHandX = 14;
      if (wStr.includes('sniper')) frontHandX = 26;
      else if (wStr.includes('rifle') || wStr.includes('m4')) frontHandX = 18;
      else if (wStr.includes('shotgun')) frontHandX = 19;
      else if (wStr.includes('rocket') || wStr.includes('rpg')) frontHandX = 15;
      else if (wStr.includes('pistol') || wStr.includes('desert')) frontHandX = 5;

      ctx.beginPath();
      ctx.ellipse(frontHandX, 2, 5, 4, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ea9c6d';
      ctx.beginPath();
      ctx.arc(frontHandX + 1, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Brawler Fists Stance
      ctx.fillStyle = skinTone;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(8, -4, 6, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(16, 2, 6.5, 5.5, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Muzzle Flash Effect
    if (muzzleFlashTimer > 0) {
      const barrelLen = 32;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(barrelLen + 8, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(barrelLen + 8, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barrelLen + 2, -10); ctx.lineTo(barrelLen + 20, 0); ctx.lineTo(barrelLen + 2, 10);
      ctx.stroke();
    }
  }

  ctx.restore();
  ctx.restore();
}
