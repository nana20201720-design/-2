import { WeaponType } from '../types';
import { drawWeaponSprite2D } from './weaponSprites';

export interface SoldierVisualOptions {
  skinId?: string;
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
 * Draws the iconic Doodle Army 2: Mini Militia authentic 2D soldier.
 * Features the signature squircle cartoon head, expressive oval eyes,
 * floating bean combat boots, floating circular hands, twin-exhaust jetpack,
 * and high-fidelity custom skins (Pharaoh, Tesla, Ninja, Joker, Ghillie, Spec-Ops).
 */
export function drawSoldier2D(ctx: CanvasRenderingContext2D, opt: SoldierVisualOptions) {
  const {
    skinId = 'woodland_camo',
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
  } = opt;

  ctx.save();
  ctx.scale(scale, scale);

  const facingMultiplier = isFacingRight ? 1 : -1;
  const crouchShift = isCrouching ? 8 : 0;

  ctx.scale(facingMultiplier, 1);

  // =========================================================================
  // 1. JETPACK & EXHAUST THRUSTER FLAMES (Mini Militia Signature Flight)
  // =========================================================================
  const jetpackX = -14;
  const jetpackY = -6 + crouchShift;

  // Resolve jet flame colors
  let primaryFlameColor = '#f97316';
  let innerFlameColor = '#fef08a';
  let smokeRingColor = 'rgba(255, 255, 255, 0.75)';

  if (skinId === 'pharaoh_suit' || jetpackStyle === 'golden_falcon') {
    primaryFlameColor = '#eab308';
    innerFlameColor = '#fef08a';
    smokeRingColor = 'rgba(254, 240, 138, 0.8)';
  } else if (skinId === 'tesla_suit' || jetpackStyle === 'cyber_plasma') {
    primaryFlameColor = '#06b6d4';
    innerFlameColor = '#e0f2fe';
    smokeRingColor = 'rgba(186, 230, 253, 0.75)';
  } else if (skinId === 'ninja_suit') {
    primaryFlameColor = '#7e22ce';
    innerFlameColor = '#d8b4fe';
    smokeRingColor = 'rgba(192, 132, 252, 0.65)';
  } else if (skinId === 'joker_suit') {
    primaryFlameColor = '#ec4899';
    innerFlameColor = '#a3e635';
    smokeRingColor = 'rgba(244, 114, 182, 0.75)';
  } else if (trailColor === '#10b981' || trailColor === 'toxic_acid') {
    primaryFlameColor = '#22c55e';
    innerFlameColor = '#86efac';
    smokeRingColor = 'rgba(134, 239, 172, 0.75)';
  } else if (trailColor === '#ef4444' || trailColor === 'inferno') {
    primaryFlameColor = '#ef4444';
    innerFlameColor = '#fde047';
    smokeRingColor = 'rgba(254, 215, 170, 0.75)';
  } else if (trailColor === '#0284c7' || trailColor === 'arc_plasma') {
    primaryFlameColor = '#06b6d4';
    innerFlameColor = '#e0f2fe';
    smokeRingColor = 'rgba(186, 230, 253, 0.75)';
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

    // Inner Core Flame
    ctx.fillStyle = innerFlameColor;
    ctx.beginPath();
    ctx.moveTo(jetpackX - 2, jetpackY + 22);
    ctx.lineTo(jetpackX + 2, jetpackY + 20 + flameLen * 0.68);
    ctx.lineTo(jetpackX + 6, jetpackY + 22);
    ctx.fill();

    // Trailing White Expanding Smoke Rings / Puffs (Signature Mini Militia)
    ctx.strokeStyle = smokeRingColor;
    ctx.fillStyle = smokeRingColor.replace('0.75', '0.35').replace('0.8', '0.4').replace('0.65', '0.3');
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

  // Jetpack Canister Unit Drawing
  if (skinId === 'pharaoh_suit' || jetpackStyle === 'golden_falcon') {
    // Royal Golden Falcon Wing Jetpack
    ctx.fillStyle = '#ca8a04';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 6, jetpackY - 3, 19, 26, 5);
    ctx.fill();
    ctx.stroke();

    // Golden Wing Trim & Turquoise Inlay
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(jetpackX - 6, jetpackY + 2);
    ctx.lineTo(jetpackX - 14, jetpackY - 4);
    ctx.lineTo(jetpackX - 6, jetpackY + 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(jetpackX + 3.5, jetpackY + 8, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (skinId === 'tesla_suit' || jetpackStyle === 'cyber_plasma') {
    // Tesla Cyber Plasma Engine
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY - 2, 17, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Neon Cooling Ribs
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(jetpackX - 3, jetpackY + 4, 13, 3);
    ctx.fillRect(jetpackX - 3, jetpackY + 11, 13, 3);

    // Glowing Cyan Core Light
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(jetpackX + 3.5, jetpackY + 18, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (skinId === 'joker_suit') {
    // Whimsical Carnival Rocket Canister with hazard stripes
    ctx.fillStyle = '#701a75';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY - 2, 17, 24, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#a3e635';
    ctx.fillRect(jetpackX - 3, jetpackY + 5, 13, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(jetpackX - 3, jetpackY + 12, 13, 3);
  } else if (skinId === 'ninja_suit') {
    // Stealth Shadow Smoke Canister
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY - 1, 17, 23, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7e22ce';
    ctx.fillRect(jetpackX - 3, jetpackY + 7, 13, 3);
  } else if (skinId === 'ghillie_suit') {
    // Ghillie Foliage Camo Canister
    ctx.fillStyle = '#14532d';
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY - 1, 17, 23, 4);
    ctx.fill();
    ctx.stroke();

    // Moss / Burlap Tuft
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.arc(jetpackX - 3, jetpackY + 5, 3.5, 0, Math.PI * 2);
    ctx.arc(jetpackX + 8, jetpackY + 11, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Classic Heavy Military Dual Turbine (Authentic Mini Militia)
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(jetpackX - 5, jetpackY, 17, 23, 4);
    ctx.fill();
    ctx.stroke();

    // Twin Exhausts
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(jetpackX - 4, jetpackY + 18, 6, 6);
    ctx.fillRect(jetpackX + 5, jetpackY + 18, 6, 6);

    // Fuel Status LED
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(jetpackX + 3.5, jetpackY + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================================================================
  // 2. FLOATING BEAN COMBAT BOOTS (Doodle Army 2 Signature Floating Feet)
  // =========================================================================
  const legY = isCrouching ? 12 : 16;
  const walkSin = isGrounded ? Math.sin(walkCycle) * 6 : 0;
  const jetLegOffset = isJetpacking ? 2.5 : 0;

  // Boot Colors based on Skin
  let bootColor = '#1c1917';
  let bootSoleColor = '#44403c';
  let bootTrimColor = '#78716c';

  if (skinId === 'pharaoh_suit') {
    bootColor = '#ca8a04'; // Gilded gold boots
    bootSoleColor = '#0284c7'; // Royal blue sole
    bootTrimColor = '#fef08a'; // Golden trim
  } else if (skinId === 'tesla_suit') {
    bootColor = '#0f172a'; // Carbon black
    bootSoleColor = '#06b6d4'; // Glowing cyan sole
    bootTrimColor = '#22d3ee'; // Cyan LED strip
  } else if (skinId === 'ninja_suit') {
    bootColor = '#09090b'; // Pitch black ninja tabi
    bootSoleColor = '#18181b';
    bootTrimColor = '#dc2626'; // Red ankle wrap
  } else if (skinId === 'joker_suit') {
    bootColor = '#581c87'; // Purple gangster boot
    bootSoleColor = '#f8fafc'; // Ivory white spat
    bootTrimColor = '#fbbf24';
  } else if (skinId === 'desert_camo') {
    bootColor = '#785434'; // Desert tan suede
    bootSoleColor = '#452a16';
    bootTrimColor = '#a88050';
  } else if (skinId === 'ghillie_suit') {
    bootColor = '#27391c'; // Olive camouflage
    bootSoleColor = '#14200f';
    bootTrimColor = '#4d7c0f';
  }

  // Back Boot
  const bbx1 = -6 + (isJetpacking ? -2 : walkSin);
  const bby1 = legY + jetLegOffset;
  ctx.fillStyle = bootColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.roundRect(bbx1 - 5.5, bby1 - 4, 11, 8, 3.5);
  ctx.fill();
  ctx.stroke();
  // Sole
  ctx.fillStyle = bootSoleColor;
  ctx.fillRect(bbx1 - 5.5, bby1 + 2.6, 11, 2.2);
  // Boot lace / accent
  ctx.strokeStyle = bootTrimColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(bbx1 - 1, bby1 - 2.5);
  ctx.lineTo(bbx1 - 1, bby1 + 1);
  ctx.stroke();

  // Front Boot
  const bbx2 = 4 + (isJetpacking ? 2 : -walkSin);
  const bby2 = legY + jetLegOffset;
  ctx.fillStyle = bootColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.roundRect(bbx2 - 5.5, bby2 - 4, 11, 8, 3.5);
  ctx.fill();
  ctx.stroke();
  // Sole
  ctx.fillStyle = bootSoleColor;
  ctx.fillRect(bbx2 - 5.5, bby2 + 2.6, 11, 2.2);
  // Boot lace / accent
  ctx.strokeStyle = bootTrimColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(bbx2 - 1, bby2 - 2.5);
  ctx.lineTo(bbx2 - 1, bby2 + 1);
  ctx.stroke();

  // =========================================================================
  // 3. SOLDIER TORSO & SKIN OUTFIT (Mini Militia Compact Pill Torso)
  // =========================================================================
  const torsoW = 19;
  const torsoH = 22 - (isCrouching ? 6 : 0);
  const torsoX = -9.5;
  const torsoY = -8 + crouchShift;

  // Resolve Torso Base Color according to Skin
  let torsoBaseColor = camoColor;
  if (skinId === 'pharaoh_suit') torsoBaseColor = '#ca8a04';
  else if (skinId === 'tesla_suit') torsoBaseColor = '#0f172a';
  else if (skinId === 'ninja_suit') torsoBaseColor = '#09090b';
  else if (skinId === 'joker_suit') torsoBaseColor = '#581c87';
  else if (skinId === 'ghillie_suit') torsoBaseColor = '#14532d';
  else if (skinId === 'urban_digital') torsoBaseColor = '#374151';
  else if (skinId === 'desert_camo') torsoBaseColor = '#9a7b4f';
  else if (skinId === 'stealth_black') torsoBaseColor = '#111827';
  else if (skinId === 'navy_seal') torsoBaseColor = '#1e3a8a';
  else if (skinId === 'cyber_cyan') torsoBaseColor = '#0891b2';
  else if (skinId === 'woodland_camo') torsoBaseColor = '#2d4a22';

  // Base Torso Capsule
  ctx.fillStyle = torsoBaseColor;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.roundRect(torsoX, torsoY, torsoW, torsoH, 7.5);
  ctx.fill();
  ctx.stroke();

  // Render Skin Details on Torso
  if (skinId === 'pharaoh_suit') {
    // 👑 PHARAOH X-SUIT: Royal Wesekh Collar & Scarab Cuirass
    // Wesekh Broad Collar (Concentric Gold, Turquoise, Lapis bands)
    ctx.fillStyle = '#0284c7'; // Lapis Lazuli band
    ctx.fillRect(torsoX + 1, torsoY + 1, torsoW - 2, 4);

    ctx.fillStyle = '#06b6d4'; // Turquoise band
    ctx.fillRect(torsoX + 2, torsoY + 5, torsoW - 4, 3);

    // Winged Scarab Gold Breastplate
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, torsoY + 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Wings spreading out
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-7, torsoY + 9);
    ctx.lineTo(0, torsoY + 10);
    ctx.lineTo(7, torsoY + 9);
    ctx.lineTo(4, torsoY + 13);
    ctx.lineTo(-4, torsoY + 13);
    ctx.closePath();
    ctx.fill();

    // Royal Blue Kilt Drape & Gold Belt
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(torsoX, torsoY + torsoH - 5, torsoW, 4.5);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-3, torsoY + torsoH - 4.5, 6, 4);

  } else if (skinId === 'tesla_suit') {
    // ⚡ TESLA CYBER-ARMOR: Carbon Plate & Glowing Arc Reactor
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.8;
    // Circuit Conduits
    ctx.beginPath();
    ctx.moveTo(-6, torsoY + 3); ctx.lineTo(-2, torsoY + 7); ctx.lineTo(-2, torsoY + 14);
    ctx.moveTo(6, torsoY + 3); ctx.lineTo(2, torsoY + 7); ctx.lineTo(2, torsoY + 14);
    ctx.stroke();

    // Pulsating Arc Reactor Core
    const arcPulse = 0.8 + Math.sin(animTime * 12) * 0.2;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.beginPath();
    ctx.arc(0, torsoY + 8, 5.5 * arcPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(0, torsoY + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, torsoY + 8, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Belt
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(torsoX, torsoY + torsoH - 4, torsoW, 3.5);

  } else if (skinId === 'ninja_suit') {
    // 🥷 SHADOW NINJA: Crossed Dogi, Shurikens, & Blood-Red Sash
    // Crossed Lapel Folds
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(torsoX + 2, torsoY); ctx.lineTo(torsoX + torsoW - 2, torsoY + 11);
    ctx.moveTo(torsoX + torsoW - 2, torsoY); ctx.lineTo(torsoX + 2, torsoY + 11);
    ctx.stroke();

    // Silver Shuriken Stars in chest bandolier
    ctx.fillStyle = '#cbd5e1';
    for (let si = 0; si < 2; si++) {
      const sx = -4 + si * 8;
      const sy = torsoY + 5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 2.5); ctx.lineTo(sx + 1, sy - 1);
      ctx.lineTo(sx + 2.5, sy); ctx.lineTo(sx + 1, sy + 1);
      ctx.lineTo(sx, sy + 2.5); ctx.lineTo(sx - 1, sy + 1);
      ctx.lineTo(sx - 2.5, sy); ctx.lineTo(sx - 1, sy - 1);
      ctx.closePath();
      ctx.fill();
    }

    // Blood-Red Obi Sash
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(torsoX, torsoY + torsoH - 5.5, torsoW, 5);
    // Dangling Knot Tails
    ctx.fillRect(-2, torsoY + torsoH - 5, 4, 8);

  } else if (skinId === 'joker_suit') {
    // 🤡 SINISTER JOKER: Tailored Purple Tuxedo & Neon-Green Vest
    // Neon Chartreuse Vest Underneath
    ctx.fillStyle = '#a3e635';
    ctx.beginPath();
    ctx.moveTo(-5, torsoY + 3);
    ctx.lineTo(0, torsoY + 12);
    ctx.lineTo(5, torsoY + 3);
    ctx.closePath();
    ctx.fill();

    // Turquoise Tie
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(-1.5, torsoY + 4, 3, 7);

    // Purple Jacket Lapels
    ctx.fillStyle = '#701a75';
    ctx.beginPath();
    ctx.moveTo(torsoX, torsoY);
    ctx.lineTo(-4, torsoY + 11);
    ctx.lineTo(torsoX, torsoY + 11);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(torsoX + torsoW, torsoY);
    ctx.lineTo(4, torsoY + 11);
    ctx.lineTo(torsoX + torsoW, torsoY + 11);
    ctx.closePath();
    ctx.fill();

    // Yellow Joke Lapel Flower
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(6, torsoY + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(6, torsoY + 5, 1.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'ghillie_suit') {
    // 🌿 TACTICAL GHILLIE: Shaggy Organic 3D Leafy Foliage
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(torsoX, torsoY, torsoW, torsoH, 7.5);
    ctx.clip();

    // Multi-tone leafy clumps
    const leafColors = ['#14532d', '#15803d', '#365314', '#4d7c0f', '#713f12'];
    for (let li = 0; li < 14; li++) {
      const lx = torsoX + 2 + (li * 5.2) % (torsoW - 3);
      const ly = torsoY + 2 + Math.floor(li / 3) * 4;
      ctx.fillStyle = leafColors[li % leafColors.length];
      ctx.beginPath();
      ctx.ellipse(lx, ly, 3.8, 2.2, 0.35 * (li % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

  } else if (skinId === 'urban_digital') {
    // 🏢 URBAN DIGITAL: High-Contrast Pixelated Spec-Ops Camo
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(torsoX, torsoY, torsoW, torsoH, 7.5);
    ctx.clip();

    ctx.fillStyle = '#1f2937'; // Dark Charcoal blocks
    ctx.fillRect(torsoX + 2, torsoY + 2, 5, 4);
    ctx.fillRect(torsoX + 11, torsoY + 6, 6, 4);
    ctx.fillRect(torsoX + 3, torsoY + 12, 5, 4);

    ctx.fillStyle = '#9ca3af'; // Silver Gray blocks
    ctx.fillRect(torsoX + 7, torsoY + 1, 5, 4);
    ctx.fillRect(torsoX + 1, torsoY + 8, 4, 4);
    ctx.fillRect(torsoX + 9, torsoY + 11, 5, 3);
    ctx.restore();

    // SWAT Black Vest
    ctx.fillStyle = '#111827';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(torsoX + 1.5, torsoY + 3, torsoW - 3, 11, 3);
    ctx.fill();
    ctx.stroke();

  } else if (skinId === 'desert_camo') {
    // 🏜️ DESERT CAMO: Chocolate-Chip Desert Camouflage Pattern
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(torsoX, torsoY, torsoW, torsoH, 7.5);
    ctx.clip();

    // Brown spots
    ctx.fillStyle = '#5c3d2e';
    ctx.beginPath();
    ctx.arc(torsoX + 5, torsoY + 5, 3.5, 0, Math.PI * 2);
    ctx.arc(torsoX + 14, torsoY + 11, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Pebble clusters (White pebbles with black accent)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(torsoX + 7, torsoY + 6, 1.2, 0, Math.PI * 2);
    ctx.arc(torsoX + 13, torsoY + 12, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Coyote Tan Tactical Webbing
    ctx.fillStyle = '#785434';
    ctx.fillRect(-5, torsoY + 5, 10, 8);

  } else {
    // 🌲 CLASSIC MINI MILITIA MILITARY WOODLAND CAMO (Doodle Army 2)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(torsoX, torsoY, torsoW, torsoH, 7.5);
    ctx.clip();

    // Rich Forest Green Spots
    ctx.fillStyle = '#142918';
    ctx.beginPath();
    ctx.arc(-4, -1 + crouchShift, 4.5, 0, Math.PI * 2);
    ctx.arc(5, 5 + crouchShift, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Soil Mud Brown Spots
    ctx.fillStyle = '#45220d';
    ctx.beginPath();
    ctx.arc(3, -4 + crouchShift, 3.8, 0, Math.PI * 2);
    ctx.arc(-5, 4 + crouchShift, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Standard Tactical MOLLE Ammo Pouches
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-7.5, -4 + crouchShift, 15, 11, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    for (let pi = 0; pi < 3; pi++) {
      ctx.fillRect(-5 + pi * 4, 0 + crouchShift, 3, 5);
    }
  }

  // Tactical Belt & Metallic Buckle (Every Mini Militia soldier wears it!)
  if (skinId !== 'pharaoh_suit' && skinId !== 'ninja_suit') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(torsoX, torsoY + torsoH - 4.5, torsoW, 4.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2, torsoY + torsoH - 4.5, 4, 4.5);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-2, torsoY + torsoH - 4.5, 4, 4.5);
  }

  // =========================================================================
  // 4. SOLDIER HEAD & FACE (The Iconic Doodle Army 2 Squircle Head)
  // =========================================================================
  const headX = 0;
  const headY = -15 + crouchShift;

  // Resolve Skin Tone
  let currentSkinTone = skinTone;
  if (skinId === 'joker_suit') currentSkinTone = '#f8fafc'; // Chalk white clown face paint
  else if (skinId === 'pharaoh_suit') currentSkinTone = '#d97706'; // Sun-kissed golden Egyptian bronze

  // Base Squircle Head with Heavy Black Outline
  ctx.fillStyle = currentSkinTone;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.roundRect(headX - 14, headY - 13, 28, 26, 9.5);
  ctx.fill();
  ctx.stroke();

  // Ear (Semi-circle on back of head)
  if (skinId !== 'ninja_suit') {
    ctx.fillStyle = currentSkinTone;
    ctx.beginPath();
    ctx.arc(headX - 11, headY, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // =========================================================================
  // 5. EYES & EXPRESSION (Mini Militia Iconic Eyes)
  // =========================================================================
  const eyeLookAngle = isFacingRight ? aimAngle : Math.PI - aimAngle;
  const pupilOffsetX = Math.cos(eyeLookAngle) * 1.5;
  const pupilOffsetY = Math.sin(eyeLookAngle) * 1.2;

  if (skinId === 'ninja_suit') {
    // 🥷 NINJA: Fierce Glowing Ruby/Crimson Eyes in Dark Eye-Slit
    ctx.fillStyle = '#09090b';
    ctx.fillRect(headX - 10, headY - 5, 20, 8);

    // Glowing Red Eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(headX + 4.5, headY - 1.5, 3.2, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(headX - 3.5, headY - 1.5, 3.2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright White Core Slits
    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.arc(headX + 4.5, headY - 1.5, 1.2, 0, Math.PI * 2);
    ctx.arc(headX - 3.5, headY - 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'joker_suit') {
    // 🤡 JOKER: Dark Purple Diamond Face Paint & Maniacal Eyes
    ctx.fillStyle = '#701a75';
    // Diamond marks above and below eyes
    ctx.beginPath();
    ctx.moveTo(headX + 4.5, headY - 8); ctx.lineTo(headX + 7, headY - 1.5); ctx.lineTo(headX + 4.5, headY + 4); ctx.lineTo(headX + 2, headY - 1.5);
    ctx.moveTo(headX - 3.5, headY - 8); ctx.lineTo(headX - 1, headY - 1.5); ctx.lineTo(headX - 3.5, headY + 4); ctx.lineTo(headX - 6, headY - 1.5);
    ctx.closePath();
    ctx.fill();

    // Wide Crazy Cartoon Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(headX + 4.5, headY - 1.5, 3.2, 5.2, 0, 0, Math.PI * 2);
    ctx.ellipse(headX - 3.5, headY - 1.5, 3.2, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX + 4.5 - 0.7, headY - 2.8, 1.1, 0, Math.PI * 2);
    ctx.arc(headX - 3.5 - 0.7, headY - 2.8, 1.0, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // CLASSIC MINI MILITIA COMBAT EYES: Solid-Black Vertical Capsules
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(headX + 4.5, headY - 1.5, 3.2, 5.2, 0, 0, Math.PI * 2);
    ctx.ellipse(headX - 3.5, headY - 1.5, 3.2, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX + 4.5 + pupilOffsetX * 0.4 - 0.7, headY - 2.8 + pupilOffsetY * 0.4, 0.9, 0, Math.PI * 2);
    ctx.arc(headX - 3.5 + pupilOffsetX * 0.4 - 0.7, headY - 2.8 + pupilOffsetY * 0.4, 0.8, 0, Math.PI * 2);
    ctx.fill();

    if (skinId === 'pharaoh_suit') {
      // Eye of Horus Winged Kohl Eyeliner
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(headX + 8, headY - 2);
      ctx.lineTo(headX + 13, headY - 4); // Upper wing
      ctx.moveTo(headX + 8, headY);
      ctx.lineTo(headX + 11, headY + 3); // Lower wing
      ctx.stroke();
    }
  }

  // Fierce Eyebrows (Downward slanted determined cartoon brows)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headX - 8, headY - 6.5);
  ctx.lineTo(headX, headY - 3.5);
  ctx.moveTo(headX + 1, headY - 3.5);
  ctx.lineTo(headX + 9, headY - 6.5);
  ctx.stroke();

  // =========================================================================
  // 6. MOUTH & FACIAL DETAILS
  // =========================================================================
  if (skinId === 'joker_suit') {
    // 🤡 Maniacal Oversized Bloody-Red Clown Grin with Sharp Teeth
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(headX + 4, headY + 6.5, 9.5, 4.5, 0.1, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sharp Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX - 2, headY + 5.5, 12, 3);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    for (let ti = 0; ti < 4; ti++) {
      ctx.beginPath();
      ctx.moveTo(headX + ti * 3, headY + 5.5);
      ctx.lineTo(headX + ti * 3, headY + 8.5);
      ctx.stroke();
    }

  } else if (skinId === 'ninja_suit') {
    // Mouth hidden behind ninja face wrap!

  } else if (skinId === 'pharaoh_suit') {
    // Stoic Royal Golden Beard
    ctx.fillStyle = '#ca8a04';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.rect(headX + 3, headY + 7, 5, 8);
    ctx.fill();
    ctx.stroke();
    // Blue ring bands
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(headX + 3, headY + 9, 5, 1.8);
    ctx.fillRect(headX + 3, headY + 12, 5, 1.8);

    // Mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(headX + 1, headY + 5);
    ctx.lineTo(headX + 9, headY + 5);
    ctx.stroke();

  } else {
    // Iconic Mini Militia Gritted Teeth Commando Mouth
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.8;
    ctx.fillRect(headX + 1, headY + 5, 8, 4.5);
    ctx.strokeRect(headX + 1, headY + 5, 8, 4.5);
    // Teeth grid
    ctx.beginPath();
    ctx.moveTo(headX + 3.5, headY + 5);
    ctx.lineTo(headX + 3.5, headY + 9.5);
    ctx.moveTo(headX + 6.0, headY + 5);
    ctx.lineTo(headX + 6.0, headY + 9.5);
    ctx.moveTo(headX + 1, headY + 7.2);
    ctx.lineTo(headX + 9, headY + 7.2);
    ctx.stroke();

    // Grimace line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(headX - 1, headY + 4.8);
    ctx.lineTo(headX + 10, headY + 4.8);
    ctx.stroke();
  }

  // Stubble / Beard / Cigar
  if (beard === 'cigar') {
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.2;
    ctx.fillRect(headX + 6, headY + 6, 8, 2.8);
    ctx.strokeRect(headX + 6, headY + 6, 8, 2.8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(headX + 14, headY + 6, 2, 2.8);
    // Smoke
    const smokeSway = Math.sin(animTime * 4) * 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(headX + 15, headY + 5);
    ctx.quadraticCurveTo(headX + 17 + smokeSway, headY - 2, headX + 15 + smokeSway * 2, headY - 10);
    ctx.stroke();
  } else if (beard === 'stubble' && skinId !== 'joker_suit' && skinId !== 'ninja_suit') {
    ctx.fillStyle = 'rgba(28, 25, 23, 0.28)';
    ctx.beginPath();
    ctx.arc(headX + 1, headY + 7, 8, 0, Math.PI * 0.95);
    ctx.fill();
  }

  // Eyewear (Sunglasses)
  if ((eyewear === 'aviators' || opt.sunglasses) && skinId !== 'ninja_suit') {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(headX + 3, headY - 3, 7.5, 6, 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(headX - 4, headY - 3, 6.5, 6, 2);
    ctx.fill();
    ctx.stroke();

    // Glint
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(headX + 4.5, headY - 2);
    ctx.lineTo(headX + 8.5, headY + 1.5);
    ctx.stroke();
  }

  // =========================================================================
  // 7. HEADGEAR & HELMETS (Custom Crafted per Skin & Options)
  // =========================================================================
  if (skinId === 'pharaoh_suit') {
    // 👑 PHARAOH X-SUIT NEMES HEADDRESS
    // Blue & Gold Striped Drapery flaring around head
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 16.5, Math.PI, 0, false);
    ctx.lineTo(headX + 16, headY + 8);
    ctx.lineTo(headX + 12, headY + 10);
    ctx.lineTo(headX - 12, headY + 10);
    ctx.lineTo(headX - 16, headY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Alternating Gold Stripes
    ctx.fillStyle = '#facc15';
    for (let sti = 0; sti < 5; sti++) {
      ctx.fillRect(headX - 14, headY - 14 + sti * 5, 28, 2.5);
    }

    // Golden Uraeus Cobra Crest on Forehead
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX, headY - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Ruby Cobra Eye
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(headX, headY - 14, 1.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (skinId === 'tesla_suit') {
    // ⚡ TESLA CYBER-HELMET
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 16, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Electric Cyan Visor with HUD waves
    ctx.fillStyle = '#0891b2';
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(headX - 4, headY - 6, 16, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Tesla Ear Antenna Coils
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(headX - 13, headY - 5); ctx.lineTo(headX - 17, headY - 12);
    ctx.moveTo(headX + 13, headY - 5); ctx.lineTo(headX + 17, headY - 12);
    ctx.stroke();

  } else if (skinId === 'ninja_suit') {
    // 🥷 SHADOW NINJA HOOD
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(headX, headY - 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Headband
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(headX - 14, headY - 7, 28, 4);

    // Fluttering Headband Tails streaming behind
    const tailWave = Math.sin(animTime * 6) * 3;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(headX - 14, headY - 6);
    ctx.quadraticCurveTo(headX - 22, headY - 3 + tailWave, headX - 26, headY + 4 + tailWave);
    ctx.lineTo(headX - 24, headY + 8 + tailWave);
    ctx.quadraticCurveTo(headX - 20, headY - 1 + tailWave, headX - 14, headY - 3);
    ctx.closePath();
    ctx.fill();

  } else if (skinId === 'joker_suit') {
    // 🤡 TOXIC-GREEN WILD CURLY JOKER HAIR
    ctx.fillStyle = '#65a30d'; // Acid lime green hair
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.4;

    // Hair Tuft Blobs
    const curls = [
      { x: headX - 12, y: headY - 8, r: 6.5 },
      { x: headX - 8, y: headY - 14, r: 7.2 },
      { x: headX, y: headY - 16, r: 7.8 },
      { x: headX + 8, y: headY - 14, r: 7.2 },
      { x: headX + 13, y: headY - 8, r: 6.5 },
    ];
    for (const c of curls) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

  } else if (skinId === 'ghillie_suit') {
    // 🌿 GHILLIE SNIPER HOOD
    ctx.fillStyle = '#14532d';
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 16.5, Math.PI * 0.85, Math.PI * 2.15, false);
    ctx.fill();
    ctx.stroke();

    // Hanging Burlap Moss and Leaves
    const leaves = ['#365314', '#15803d', '#4d7c0f', '#713f12'];
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = leaves[i % leaves.length];
      const lx = headX - 12 + i * 3.2;
      const ly = headY - 8 + (i % 3) * 3;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4, 2.5, 0.4 * (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (headgear === 'nvg_helmet') {
    // NVG Helmet
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 15.5, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(headX + 6, headY - 6, 8, 6, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(headX + 11, headY - 3, 2, 0, Math.PI * 2);
    ctx.fill();

  } else if (headgear === 'pilot_helmet') {
    // Pilot Helmet
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 16, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#047857';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(headX - 3, headY - 6, 15, 8, 3);
    ctx.fill();
    ctx.stroke();

  } else if (headgear === 'gas_mask') {
    // Gas Mask
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(headX - 3, headY - 1, 16, 14, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(headX + 9, headY + 8, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

  } else if (headgear === 'beret_red') {
    // Commando Red Beret
    ctx.fillStyle = '#991b1b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(headX + 2, headY - 9, 16, 8, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX - 12, headY - 6, 24, 4);

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX + 7, headY - 9, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (headgear === 'beret_green') {
    // Green Beret
    ctx.fillStyle = '#365314';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(headX + 2, headY - 9, 16, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(headX - 12, headY - 6, 24, 4);

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(headX + 7, headY - 9, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (headgear === 'bandana') {
    // Rambo Bandana
    ctx.fillStyle = '#4d7c0f';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(headX - 14, headY - 7, 28, 6.5, 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(headX - 12, headY - 5);
    ctx.lineTo(headX - 19, headY + 1);
    ctx.lineTo(headX - 14, headY - 2);
    ctx.stroke();

  } else {
    // CLASSIC MILITARY CAMO COMBAT HELMET (Authentic Mini Militia)
    ctx.fillStyle = camoColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(headX, headY - 3, 15, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Helmet Lower Rim
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(headX - 15, headY - 4, 30, 4.5, 2);
    ctx.fill();
    ctx.stroke();

    // Chin Strap
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(headX - 10, headY);
    ctx.lineTo(headX - 4, headY + 11);
    ctx.stroke();
  }

  // =========================================================================
  // 8. FLOATING HANDS & WEAPONS (Mini Militia Disembodied Circular Hands)
  // =========================================================================
  ctx.save();
  ctx.translate(0, crouchShift);

  let baseGunAngle = aimAngle;
  if (!isFacingRight) baseGunAngle = Math.PI - aimAngle;

  // Resolve Hand Color based on Skin
  let handColor = currentSkinTone;
  if (skinId === 'pharaoh_suit') handColor = '#facc15'; // Gilded gold gloves
  else if (skinId === 'tesla_suit') handColor = '#06b6d4'; // Glowing blue gauntlets
  else if (skinId === 'ninja_suit') handColor = '#18181b'; // Black ninja wraps
  else if (skinId === 'joker_suit') handColor = '#ffffff'; // White clown magician gloves
  else if (skinId === 'ghillie_suit') handColor = '#365314'; // Camo sniper gloves

  if (isSaluting) {
    // Victory Salute Stance
    const saluteArmAngle = -Math.PI * 0.45;
    ctx.rotate(saluteArmAngle);
    ctx.translate(14, -8);
    ctx.fillStyle = handColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.rotate(baseGunAngle);
    ctx.translate(-recoilOffset, 0);

    const wStr = (weapon as string).toLowerCase();

    if (wStr !== 'fists' && wStr !== 'none') {
      // Draw 2D Weapon Sprite
      drawWeaponSprite2D(ctx, (weapon as WeaponType) || 'pistol', 1.0);

      // Back Gripping Hand: Purely disembodied floating circle (Mini Militia Signature)
      ctx.fillStyle = handColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.arc(3, 2, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Front Support Hand: Purely disembodied floating circle
      let frontHandX = 14;
      if (wStr.includes('sniper')) frontHandX = 26;
      else if (wStr.includes('rifle') || wStr.includes('m4')) frontHandX = 18;
      else if (wStr.includes('shotgun')) frontHandX = 19;
      else if (wStr.includes('rocket') || wStr.includes('rpg')) frontHandX = 15;
      else if (wStr.includes('pistol') || wStr.includes('desert')) frontHandX = 5;

      ctx.beginPath();
      ctx.arc(frontHandX, 2, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

    } else {
      // Brawler Fists Stance: Floating circles
      ctx.fillStyle = handColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.arc(8, -4, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(16, 2, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Fiery Muzzle Flash
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
