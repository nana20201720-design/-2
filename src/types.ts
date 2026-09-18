/**
 * Mini Battle Arena - Types & Interfaces
 */

export interface Friend {
  id: string;
  name: string;
  status: 'online' | 'in-match' | 'offline';
  lastSeen?: number;
}

export type Team = 'blue' | 'red' | 'ffa';
export type GameMode = 'deathmatch' | 'survival' | 'capture' | 'team';
export type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'rocket' | 'sniper';

export interface WeaponConfig {
  id: WeaponType;
  name: string;
  nameAr: string;
  damage: number;
  fireRate: number; // shots per second
  magazineSize: number;
  reloadTime: number; // in seconds
  spread: number; // in radians
  bulletSpeed: number;
  bulletCount: number; // e.g. 6 for shotgun
  bulletLife: number; // in seconds
  recoil: number;
  range: number;
  isAutomatic: boolean;
  color: string;
  barrelLength: number;
  splashRadius?: number;
  splashDamage?: number;
  iconName: string;
}

export interface SoldierSkills {
  jetpackSpeed: number;     // Level 1 to 5 (+8% to +40% flight thrust & max air speed)
  jetpackEndurance: number; // Level 1 to 5 (+15% to +75% fuel stamina & recharge rate)
  armorResilience: number;  // Level 1 to 5 (+10 to +50 HP & damage absorption)
  reloadAgility: number;    // Level 1 to 5 (-10% to -40% reload time & +8% to +30% sprint speed)
}

export interface SoldierProgression {
  level: number;
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  rankTitleAr: string;
  rankTitleEn: string;
  rankIcon: string;
  skills: SoldierSkills;
}

export interface PlayerCustomization {
  camoColor: string; // outfit color hex
  headgear: string; // 'helmet' | 'beret' | 'bandana' | 'cap' | 'pilot' | 'gasmask' | 'nvg' | 'ghillie' | 'ninja' | 'skull'
  bodyArmor?: string; // 'vest' | 'juggernaut' | 'harness' | 'cyber' | 'hazmat' | 'recon'
  skinTone: string;
  sunglasses: boolean;
  eyewear?: string; // 'none' | 'aviators' | 'goggles' | 'eyepatch'
  beard?: string; // 'none' | 'stubble' | 'full' | 'mustache' | 'cigar'
  jetpackStyle?: string; // 'classic' | 'cyber' | 'military' | 'inferno' | 'toxic' | 'golden'
  trailColor?: string;
  playerName: string;
  charAvatarIndex?: number;
  primaryWeapon?: WeaponType;
  secondaryWeapon?: WeaponType;
  skills?: SoldierSkills;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform extends Rect {
  type: 'ground' | 'rock' | 'metal' | 'wood' | 'hazard';
  oneWay?: boolean; // can jump through from below
  color?: string;
  label?: string;
}

export interface Projectile {
  id: number;
  ownerId: string;
  ownerTeam: Team;
  weaponType: WeaponType | 'grenade';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  bounces?: number;
  splashRadius?: number;
  splashDamage?: number;
  smokeTimer?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'smoke' | 'fire' | 'blood' | 'debris' | 'shockwave' | 'casing' | 'magazine' | 'splinter' | 'dust' | 'subterranean-dust';
  growth?: number;
  rotation?: number;
  rotationSpeed?: number;
  width?: number;
  height?: number;
  weaponType?: WeaponType;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  vy: number;
}

export interface BloodDecal {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  splatPoints: { dx: number; dy: number; r: number }[];
  dripLength?: number;
}

export interface Pickup {
  id: number;
  type: 'health' | 'boost' | 'ammo' | 'weapon' | 'grenade';
  weapon?: WeaponType;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  respawnTimer: number;
  floatOffset: number;
  ammo?: number;
  reserveAmmo?: number;
  vx?: number;
  vy?: number;
  isDropped?: boolean;
  pickupDelay?: number;
  droppedBy?: string;
}

export interface NearbyWeaponInfo {
  pickupId: number;
  weapon: WeaponType;
  nameAr: string;
  nameEn: string;
  ammo: number;
  reserveAmmo: number;
}

export interface ExplosiveBarrel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  exploded: boolean;
  respawnTimer: number;
}

export interface WoodenCrate {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  destroyed: boolean;
  respawnTimer: number;
  lootType: 'ammo' | 'health' | 'grenade' | 'boost' | 'weapon';
  weapon?: WeaponType;
}

export interface CharacterState {
  id: string;
  name: string;
  isPlayer: boolean;
  team: Team;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facingRight: boolean;
  aimAngle: number; // in radians
  isGrounded: boolean;
  isJetpacking: boolean;
  jetpackPower?: number; // 0.0 to 1.0 smooth thruster power lerp
  flightTiltAngle?: number; // aerodynamic flight tilt in radians
  landingFlexTimer?: number; // landing cushion knee flex timer
  prevGrounded?: boolean; // track airborne-to-ground transition
  isCrouching?: boolean;
  meleeTimer?: number;
  inBush?: boolean;
  
  // Health & Fuel
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  isDead: boolean;
  respawnTimer: number;
  timeSinceLastDamage?: number;
  skills?: SoldierSkills;

  // Weapons & Inventory
  weapons: WeaponType[];
  currentWeaponIndex: number;
  ammo: Record<WeaponType, number>;
  reserveAmmo: Record<WeaponType, number>;
  isReloading: boolean;
  reloadTimer: number;
  reloadDuration: number;
  weaponSwitchTimer?: number;
  weaponSwitchDuration?: number;
  weaponSwitchPrevWeapon?: WeaponType;
  lastShotTime: number;
  grenades: number;
  
  // Kill Streaks & Announcer
  killStreak: number;
  multiKillCount: number;
  lastKillTime: number;

  // Visual & Animation
  walkCycle: number;
  camoColor: string;
  headgear: string;
  bodyArmor?: string;
  sunglasses: boolean;
  eyewear?: string;
  beard?: string;
  jetpackStyle?: string;
  trailColor?: string;
  skinTone: string;
  charAvatarIndex?: number;
  recoilOffset: number;
  muzzleFlashTimer: number;
  hitFlinchTimer: number;
  
  // Stats
  kills: number;
  deaths: number;
  damageDealt: number;
  headshots: number;
  maxKillStreak: number;

  // AI Behavior (if bot)
  aiProfile?: {
    personality: 'rusher' | 'sniper' | 'flier' | 'balanced';
    targetId: string | null;
    stateTimer: number;
    preferredDistance: number;
    reactionDelay: number;
    accuracySpread: number;
  };
}

export interface KillFeedItem {
  id: number;
  killerName: string;
  victimName: string;
  weapon: WeaponType | 'grenade' | 'barrel';
  time: number;
  isPlayerInvolved: boolean;
  isKillerBot: boolean;
  isVictimBot: boolean;
}

export interface GameSettings {
  language: 'ar' | 'en';
  soundVolume: number;
  musicVolume: number;
  haptics: boolean;
  autoFire: boolean;
  aimAssist: boolean;
  joystickFixed: boolean;
}

export interface MatchStats {
  mode: GameMode;
  kills: number;
  deaths: number;
  damage: number;
  headshots: number;
  maxKillStreak: number;
  accuracy: number;
  durationSeconds: number;
  isVictory: boolean;
  playerScore: number;
  botScore: number;
  wave?: number; // for survival mode
}

export interface WeaponItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  damage: number;
  range: number;
  reload: number;
  magSize: number;
  level: number;
  cards: number;
  maxCards: number;
  upgradeCost: number;
  desc: string;
  isSpecial?: boolean;
}
