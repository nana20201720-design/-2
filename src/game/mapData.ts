import { Platform, Pickup, ExplosiveBarrel, WoodenCrate } from '../types';

export const MAP_WIDTH = 4000;
export const MAP_HEIGHT = 2000;

export interface MapData {
  width: number;
  height: number;
  name: string;
  nameAr: string;
  platforms: Platform[];
  pickups: Pickup[];
  barrels: ExplosiveBarrel[];
  crates: WoodenCrate[];
  playerSpawns: { x: number; y: number; team: 'blue' | 'red' | 'ffa' }[];
  botSpawns: { x: number; y: number; team: 'blue' | 'red' | 'ffa' }[];
  scenery: {
    trees: { x: number; y: number; scale: number; type: number }[];
    bushes: { x: number; y: number; width: number; height: number }[];
    leftBunker?: { x: number; y: number; width: number; height: number };
    rightOutpost?: { x: number; y: number; width: number; height: number };
    woodPiles?: { x: number; y: number }[];
    lamps: { x: number; y: number; color: string }[];
    signs: { x: number; y: number; text: string }[];
    chains?: { x: number; y1: number; y2: number }[];
  };
}

export const ARENA_MAP: MapData = {
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  name: 'Outpost',
  nameAr: 'أوتبوست الكلاسيكية',
  platforms: [
    // World Boundaries
    { x: -100, y: 0, width: 100, height: MAP_HEIGHT, type: 'rock' },
    { x: MAP_WIDTH, y: 0, width: 100, height: MAP_HEIGHT, type: 'rock' },
    { x: 0, y: -100, width: MAP_WIDTH, height: 100, type: 'rock' },
    { x: 0, y: 1900, width: MAP_WIDTH, height: 100, type: 'rock' },

    // ==========================================
    // 1. LEFT REGION (Concrete Bunker & High Plateau)
    // ==========================================
    // Left High Plateau (Beneath Concrete Bunker)
    { x: 250, y: 620, width: 850, height: 140, type: 'ground' }, // Widened
    // Concrete Bunker Roof (Walkable one-way deck)
    { x: 380, y: 350, width: 450, height: 24, type: 'metal', oneWay: true }, // Widened
    // Concrete Bunker Floor / Base
    { x: 340, y: 560, width: 550, height: 60, type: 'metal' }, // Widened

    // Left Rock Arch Pillars (Creating the two hollow cavern legs under plateau)
    { x: 320, y: 760, width: 160, height: 480, type: 'rock' },
    { x: 880, y: 760, width: 180, height: 480, type: 'rock' }, // Moved right to make cavern wider
    
    // Ramp connecting ground to left plateau
    { x: 650, y: 1250, width: 250, height: 100, type: 'rock' }, // Mid-step
    { x: 900, y: 1150, width: 350, height: 100, type: 'ground' }, // Connection

    // Floating Wooden Supply Bridge in Left Cavern
    { x: 550, y: 1020, width: 300, height: 26, type: 'wood', oneWay: true }, // Widened

    // Far Left Ground Base
    { x: 0, y: 1350, width: 1200, height: 450, type: 'ground' }, // Greatly widened to reduce parkour

    // ==========================================
    // 2. CENTER-LEFT REGION (Spire & Floating Island)
    // ==========================================
    // Floating Medium Island with grassy top
    { x: 1420, y: 440, width: 500, height: 120, type: 'ground', oneWay: true }, // Widened
    // Island Under-Rock support
    { x: 1610, y: 560, width: 120, height: 140, type: 'rock' },

    // Center-Left Mid Ground Basin
    { x: 1250, y: 880, width: 600, height: 120, type: 'ground' }, // Widened
    // Connecting rock pillar under basin
    { x: 1480, y: 1000, width: 120, height: 350, type: 'rock' },

    // Floating Metal Supply Platform in Drop Chute
    { x: 1310, y: 1150, width: 400, height: 26, type: 'metal', oneWay: true }, // Widened
    { x: 1710, y: 1150, width: 200, height: 26, type: 'metal', oneWay: true }, // Extra step to bridge gap

    // ==========================================
    // 3. CENTER REGION (The Bowl Valley & High Supply Deck)
    // ==========================================
    // Bridge between Center-Left Basin and Center Valley
    { x: 1630, y: 880, width: 370, height: 26, type: 'wood', oneWay: true },
    // High Floating Supply Rock Island over Valley (Grassy-top classic rock island)
    { x: 1980, y: 520, width: 500, height: 80, type: 'ground', oneWay: true }, // Widened

    // Center Grassy Valley Bowl (West lip, bottom, East lip)
    { x: 1850, y: 750, width: 400, height: 90, type: 'ground', oneWay: true }, // Widened
    { x: 2000, y: 920, width: 600, height: 120, type: 'ground' }, // Widened
    { x: 2500, y: 750, width: 350, height: 90, type: 'ground', oneWay: true }, // Widened & moved

    // Main Ground Strip between Center and Right
    { x: 2480, y: 1150, width: 1000, height: 250, type: 'ground' }, // Widened

    // ==========================================
    // 4. RIGHT REGION (High Cliff, Angled Ramp & Log Outpost)
    // ==========================================
    // Top Right High Sniper Ledge
    { x: 2850, y: 460, width: 500, height: 90, type: 'ground', oneWay: true }, // Widened
    // Floating Mid-Ledge under High Sniper
    { x: 2900, y: 840, width: 450, height: 80, type: 'ground', oneWay: true }, // Widened

    // Far Right High Cliff Overhang
    { x: 3450, y: 480, width: 550, height: 80, type: 'ground', oneWay: true }, // Widened

    // Far Right Outpost Timber Base Ground
    { x: 3200, y: 1150, width: 800, height: 350, type: 'ground' }, // Widened
    // Right Timber Outpost Roof Deck
    { x: 3450, y: 880, width: 550, height: 24, type: 'wood', oneWay: true }, // Widened

    // ==========================================
    // 5. CATACOMBS / UNDERGROUND TUNNEL SYSTEM (Widened Spacious Caverns)
    // ==========================================
    // Left Cave Floor & Ceiling (widened drop shaft on left)
    { x: 550, y: 1320, width: 650, height: 60, type: 'rock' }, // Ceiling
    { x: 400, y: 1700, width: 900, height: 120, type: 'rock' }, // Floor

    // Center Underground Tunnel Pathway (Wider clearance)
    { x: 1200, y: 1420, width: 850, height: 50, type: 'rock' }, // Ceiling
    { x: 1200, y: 1780, width: 1250, height: 120, type: 'rock' }, // Floor

    // Center-Right Tunnel Dip
    { x: 2050, y: 1450, width: 550, height: 60, type: 'rock' },

    // Floating Rock Ledges inside Catacombs
    { x: 750, y: 1520, width: 220, height: 26, type: 'rock', oneWay: true },
    { x: 1550, y: 1600, width: 280, height: 26, type: 'rock', oneWay: true },
    { x: 2350, y: 1620, width: 260, height: 26, type: 'rock', oneWay: true },

    // Deep Cave Bottom Foundation
    { x: 0, y: 1880, width: MAP_WIDTH, height: 120, type: 'rock' },
  ],
  crates: [
    // Left Bunker Deck
    { id: 1, x: 440, y: 312, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    // Left Bunker Inside Floor (New tactical cover)
    { id: 101, x: 520, y: 522, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    // Left Cavern Supply Bridge
    { id: 2, x: 610, y: 982, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    // Center Floating Island
    { id: 3, x: 1480, y: 402, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'grenade' },
    // Center Chute Supply Deck
    { id: 4, x: 1410, y: 1112, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'boost' },
    // Valley High Deck
    { id: 5, x: 2110, y: 482, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    // Sniper Cliff
    { id: 6, x: 2850, y: 422, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    // Timber Outpost Base
    { id: 7, x: 3680, y: 1112, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    // Right Timber Outpost Roof Deck (New strategic high cover)
    { id: 102, x: 3600, y: 842, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    // Underground Catacombs Ledge
    { id: 8, x: 1620, y: 1502, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'grenade' },
  ],
  pickups: [
    // High Sniper Cliff
    { id: 1, type: 'weapon', weapon: 'sniper', x: 2750, y: 410, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Concrete Bunker Ledge
    { id: 2, type: 'weapon', weapon: 'rocket', x: 480, y: 300, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Center Floating Island
    { id: 3, type: 'weapon', weapon: 'shotgun', x: 1520, y: 390, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Right Timber Outpost
    { id: 4, type: 'weapon', weapon: 'rifle', x: 3620, y: 830, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Left Cavern Supply Bridge
    { id: 11, type: 'weapon', weapon: 'rifle', x: 720, y: 970, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Deep Catacombs Ledge
    { id: 12, type: 'weapon', weapon: 'shotgun', x: 1580, y: 1500, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Valley Lower Chute
    { id: 13, type: 'weapon', weapon: 'rocket', x: 2200, y: 1140, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Underground Tunnel Ledge
    { id: 14, type: 'weapon', weapon: 'sniper', x: 2420, y: 1520, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Center Bowl Valley
    { id: 5, type: 'health', x: 2100, y: 870, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Left Arch Cavern
    { id: 6, type: 'health', x: 550, y: 1150, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Catacombs Center
    { id: 7, type: 'boost', x: 1650, y: 1670, width: 32, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Right Ground
    { id: 8, type: 'ammo', x: 2800, y: 1100, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    // Left Cave Grenade
    { id: 9, type: 'grenade', x: 800, y: 1410, width: 32, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    // Far Left Spawn Area
    { id: 10, type: 'ammo', x: 200, y: 1300, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
  ],
  barrels: [
    { id: 1, x: 620, y: 576, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 2, x: 2080, y: 876, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 3, x: 3480, y: 1106, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 4, x: 1750, y: 1676, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
  ],
  playerSpawns: [
    { x: 420, y: 560, team: 'ffa' },   // Concrete Bunker
    { x: 2750, y: 400, team: 'ffa' },  // High Right Sniper Cliff
    { x: 1650, y: 1660, team: 'ffa' }, // Underground Catacombs
    { x: 3600, y: 1090, team: 'ffa' }, // Right Timber Outpost
  ],
  botSpawns: [
    { x: 500, y: 560, team: 'ffa' },
    { x: 2850, y: 400, team: 'ffa' },
    { x: 1550, y: 1660, team: 'ffa' },
    { x: 3700, y: 1090, team: 'ffa' },
  ],
  scenery: {
    trees: [
      { x: 280, y: 620, scale: 1.1, type: 1 },
      { x: 1950, y: 750, scale: 0.9, type: 2 },
      { x: 2600, y: 1150, scale: 1.1, type: 1 },
      { x: 3800, y: 1150, scale: 1.2, type: 2 },
    ],
    bushes: [
      { x: 520, y: 620, width: 85, height: 46 },
      { x: 1450, y: 440, width: 85, height: 46 },
      { x: 2150, y: 920, width: 90, height: 46 },
      { x: 2900, y: 1150, width: 85, height: 46 },
      { x: 800, y: 1650, width: 80, height: 42 },
      { x: 1850, y: 1720, width: 85, height: 42 },
    ],
    leftBunker: { x: 350, y: 350, width: 440, height: 230 },
    rightOutpost: { x: 3500, y: 880, width: 360, height: 270 },
    woodPiles: [
      { x: 280, y: 600 },
      { x: 2520, y: 1130 },
      { x: 3380, y: 1130 },
    ],
    lamps: [
      // Aboveground tactical spotlights/lamps
      { x: 570, y: 410, color: '#ef4444' }, // Red military warning beacon inside Left Bunker
      { x: 720, y: 310, color: '#fbbf24' }, // Warm bunker watchtower lamp
      { x: 1450, y: 360, color: '#38bdf8' }, // Cool cyan platform signal spotlight
      { x: 2780, y: 380, color: '#22c55e' }, // Green beacon at High Right Sniper Cliff
      { x: 3680, y: 840, color: '#fb923c' }, // Orange flame/torch on Right Timber Outpost
      { x: 3380, y: 1100, color: '#fbbf24' }, // Outpost approach lamp
      
      // Underground catacomb emergency lights
      { x: 550, y: 1400, color: '#f59e0b' },
      { x: 1050, y: 1600, color: '#fbbf24' },
      { x: 1600, y: 1500, color: '#f59e0b' },
      { x: 2100, y: 1600, color: '#fbbf24' },
      { x: 2400, y: 1520, color: '#f59e0b' },
      { x: 2850, y: 1500, color: '#fbbf24' },
    ],
    signs: [
      { x: 450, y: 600, text: 'OUTPOST BASE' },
      { x: 2050, y: 900, text: 'VALLEY' },
      { x: 3550, y: 1130, text: 'CAMP 2' },
    ],
    chains: [
      { x: 540, y1: 760, y2: 1020 },
      { x: 730, y1: 760, y2: 1020 },
      { x: 1330, y1: 880, y2: 1150 },
      { x: 1530, y1: 880, y2: 1150 },
      { x: 2020, y1: 0, y2: 520 },
      { x: 2240, y1: 0, y2: 520 },
    ],
  },
};
