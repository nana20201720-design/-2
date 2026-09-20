import { Platform, Pickup, ExplosiveBarrel, WoodenCrate, TacticalCover } from '../types';

export const MAP_WIDTH = 4000;
export const MAP_HEIGHT = 2000;

export interface GuideMarker {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'up-right' | 'up-left' | 'down-right' | 'down-left';
  labelAr: string;
  labelEn: string;
  color: string;
}

export interface MapData {
  width: number;
  height: number;
  name: string;
  nameAr: string;
  platforms: Platform[];
  pickups: Pickup[];
  barrels: ExplosiveBarrel[];
  crates: WoodenCrate[];
  tacticalCovers?: TacticalCover[];
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
    guideMarkers?: GuideMarker[];
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
    // 1. LEFT REGION: Grassy Hill, Concrete Bunker & Drop Chute #1
    // ==========================================
    // Solid Left Hill Base Terrain (x: 0 to 450)
    { x: 0, y: 820, width: 450, height: 460, type: 'ground' },
    // Parkour Step-Up Ledge for Left Hill (x: 100, y: 700)
    { x: 100, y: 700, width: 130, height: 22, type: 'wood', oneWay: true },
    // Concrete Bunker Roof Ledge
    { x: 250, y: 590, width: 420, height: 26, type: 'metal', oneWay: true },
    // Concrete Bunker Floor Walkable Hatch (One-Way platform allowing drop-down into catacombs)
    { x: 250, y: 820, width: 450, height: 26, type: 'metal', oneWay: true },

    // --- NEW: West Radar Watchtower High Tier ---
    { x: 120, y: 480, width: 110, height: 20, type: 'wood', oneWay: true },
    { x: 200, y: 380, width: 320, height: 26, type: 'metal', oneWay: true },

    // Open Drop Chute #1 Parkour Pathways into Catacombs (x: 500 to 950 open gap)
    { x: 500, y: 1020, width: 320, height: 26, type: 'wood', oneWay: true },
    { x: 720, y: 1150, width: 170, height: 22, type: 'rock', oneWay: true },
    { x: 800, y: 1380, width: 170, height: 22, type: 'rock', oneWay: true },

    // ==========================================
    // 2. CENTER REGION: Floating Rock Island & High Central Watchtower
    // ==========================================
    // Mid-Air Parkour Stepping Stones connecting Left Hill and Floating Rock
    { x: 1050, y: 760, width: 150, height: 24, type: 'ground', oneWay: true },
    { x: 1680, y: 760, width: 150, height: 24, type: 'ground', oneWay: true },

    // Center Floating Rock Island ("The Rock") - Suspended in Open Sky
    { x: 1250, y: 500, width: 500, height: 50, type: 'ground', oneWay: true },

    // --- NEW: High Central Watchtower Upper Decks (طوابق علوية جديدة لبرج المراقبة المركزي) ---
    { x: 1220, y: 410, width: 120, height: 20, type: 'wood', oneWay: true },
    { x: 1780, y: 410, width: 120, height: 20, type: 'wood', oneWay: true },
    { x: 1380, y: 320, width: 340, height: 26, type: 'metal', oneWay: true }, // Tier 1 Deck
    { x: 1360, y: 240, width: 90, height: 20, type: 'metal', oneWay: true },
    { x: 1480, y: 160, width: 180, height: 24, type: 'metal', oneWay: true }, // Tier 2 Crow's Nest Apex

    // Solid Earth Center Valley Floor ("The Basin") with Central Drop Shaft Gap
    { x: 950, y: 1020, width: 750, height: 260, type: 'ground' },
    // Central Drop Chute One-Way Hatch Bridge (x: 1700 to 2000)
    { x: 1700, y: 1020, width: 300, height: 26, type: 'wood', oneWay: true },
    { x: 2000, y: 1020, width: 600, height: 260, type: 'ground' },

    // High Floating Wooden Supply Bridge over Valley Basin
    { x: 1850, y: 640, width: 580, height: 26, type: 'wood', oneWay: true },

    // ==========================================
    // 3. RIGHT REGION: High Sniper Cliff & Timber Outpost Decks
    // ==========================================
    // High Sniper Cliff Ledge (x: 2600 to 3050 at y: 520)
    { x: 2600, y: 520, width: 450, height: 40, type: 'ground', oneWay: true },

    // Right Hill Base Ground (y: 920)
    { x: 2600, y: 920, width: 500, height: 360, type: 'ground' },

    // Open Drop Chute #3 Parkour Stepping Ledges into Underground Catacombs
    { x: 3120, y: 1120, width: 160, height: 22, type: 'rock', oneWay: true },
    { x: 3200, y: 1400, width: 160, height: 22, type: 'rock', oneWay: true },

    // Right Timber Outpost Step-Up Parkour Ledge
    { x: 3220, y: 760, width: 150, height: 22, type: 'wood', oneWay: true },

    // Solid Earth Far Right Outpost Base (y: 880)
    { x: 3300, y: 880, width: 700, height: 400, type: 'ground' },

    // Right Timber Outpost Roof Ledge
    { x: 3450, y: 650, width: 450, height: 26, type: 'wood', oneWay: true },

    // --- NEW: East Outpost Guard Tower Upper Level Decks (طابقين علويين إضافيين للمعسكر الشرقي) ---
    { x: 3280, y: 530, width: 100, height: 20, type: 'wood', oneWay: true },
    { x: 3800, y: 530, width: 100, height: 20, type: 'wood', oneWay: true },
    { x: 3400, y: 420, width: 380, height: 26, type: 'metal', oneWay: true }, // Tier 2 Deck
    { x: 3520, y: 240, width: 220, height: 22, type: 'metal', oneWay: true }, // Tier 3 Apex Sniper Nest

    // ==========================================
    // 4. SUBTERRANEAN CATACOMBS & SECRET TUNNELS (ممرات وسراديب سرية للقتال القريب)
    // ==========================================
    // Cavern Rock Ceiling Foundation - Split into sections with open drop chutes!
    { x: 0, y: 1280, width: 450, height: 60, type: 'rock' },
    // (Open Chute #1 at x: 450 to 950)
    { x: 950, y: 1280, width: 750, height: 60, type: 'rock' },
    // (Open Center Shaft at x: 1700 to 2000)
    { x: 2000, y: 1280, width: 1050, height: 60, type: 'rock' },
    // (Open Chute #3 at x: 3050 to 3300)
    { x: 3300, y: 1280, width: 700, height: 60, type: 'rock' },

    // --- NEW: Upper Secret Tunnel Passage Tier (الممر السري العلوي للقتال القريب - y: 1420) ---
    { x: 220, y: 1420, width: 380, height: 26, type: 'rock', oneWay: true },
    { x: 1100, y: 1420, width: 600, height: 26, type: 'wood', oneWay: true },
    { x: 2150, y: 1420, width: 550, height: 26, type: 'rock', oneWay: true },
    { x: 3000, y: 1420, width: 480, height: 26, type: 'wood', oneWay: true },

    // --- NEW: Deep Subterranean Secret Armory & CQC Arena Platforms (y: 1620) ---
    { x: 120, y: 1620, width: 300, height: 26, type: 'rock', oneWay: true },
    { x: 700, y: 1620, width: 450, height: 26, type: 'rock', oneWay: true },
    { x: 1500, y: 1620, width: 680, height: 26, type: 'rock', oneWay: true },
    { x: 2550, y: 1620, width: 500, height: 26, type: 'rock', oneWay: true },

    // Tactical Tunnel Choke Point Walls (جدران تكتيكية للممر السري)
    { x: 650, y: 1480, width: 28, height: 180, type: 'rock' },
    { x: 2300, y: 1480, width: 28, height: 180, type: 'rock' },

    // Deep Cave Solid Bedrock Floor (at y: 1750)
    { x: 0, y: 1750, width: MAP_WIDTH, height: 250, type: 'rock' },

    // Subterranean Floating Rock & Wood Parkour Ledges inside Catacombs
    { x: 380, y: 1520, width: 320, height: 28, type: 'rock', oneWay: true },
    { x: 880, y: 1540, width: 220, height: 24, type: 'wood', oneWay: true },
    { x: 1450, y: 1550, width: 420, height: 28, type: 'rock', oneWay: true },
    { x: 2050, y: 1540, width: 220, height: 24, type: 'wood', oneWay: true },
    { x: 2450, y: 1540, width: 380, height: 28, type: 'rock', oneWay: true },
  ],
  crates: [
    // Left Bunker Floor
    { id: 1, x: 280, y: 782, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    { id: 2, x: 340, y: 782, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    // --- NEW: West Radar High Deck Crate ---
    { id: 10, x: 360, y: 342, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    // Left Cavern Supply Bridge
    { id: 3, x: 550, y: 982, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    // Center Floating Rock Island
    { id: 4, x: 1380, y: 462, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'grenade' },
    // --- NEW: High Watchtower Apex Crate ---
    { id: 11, x: 1540, y: 122, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    // Center Valley Floor
    { id: 5, x: 1800, y: 982, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'boost' },
    // High Supply Bridge
    { id: 6, x: 2100, y: 602, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    // Sniper Cliff
    { id: 7, x: 2750, y: 482, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    // Timber Outpost Base
    { id: 8, x: 3650, y: 842, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    // --- NEW: East Outpost Apex Crate ---
    { id: 12, x: 3600, y: 202, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rifle' },
    // Underground Catacombs Ledge
    { id: 9, x: 1520, y: 1512, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'grenade' },
    // --- NEW: Secret Subterranean Vault Crate ---
    { id: 13, x: 800, y: 1582, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
  ],
  pickups: [
    // High Sniper Cliff
    { id: 1, type: 'weapon', weapon: 'sniper', x: 2850, y: 474, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Concrete Bunker Roof
    { id: 2, type: 'weapon', weapon: 'rocket', x: 380, y: 544, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Center Floating Rock Island
    { id: 3, type: 'weapon', weapon: 'shotgun', x: 1480, y: 454, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Right Timber Outpost Roof
    { id: 4, type: 'weapon', weapon: 'rifle', x: 3620, y: 604, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // --- NEW: High Watchtower Crow's Nest Sniper Rifle ---
    { id: 15, type: 'weapon', weapon: 'sniper', x: 1560, y: 114, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // --- NEW: East Outpost Apex Rocket Launcher ---
    { id: 16, type: 'weapon', weapon: 'rocket', x: 3640, y: 194, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // --- NEW: Secret Subterranean Arsenal Shotgun ---
    { id: 17, type: 'weapon', weapon: 'shotgun', x: 1750, y: 1574, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // --- NEW: West Radar High Deck Rifle ---
    { id: 18, type: 'weapon', weapon: 'rifle', x: 260, y: 334, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Left Cavern Supply Bridge
    { id: 11, type: 'weapon', weapon: 'rifle', x: 620, y: 974, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Deep Catacombs Ledge
    { id: 12, type: 'weapon', weapon: 'shotgun', x: 1620, y: 1504, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Valley Bowl
    { id: 13, type: 'weapon', weapon: 'rocket', x: 2000, y: 974, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Underground Tunnel Ledge
    { id: 14, type: 'weapon', weapon: 'sniper', x: 2520, y: 1494, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Center Valley Health
    { id: 5, type: 'health', x: 1600, y: 974, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Left Bunker Health
    { id: 6, type: 'health', x: 450, y: 774, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Catacombs Boost
    { id: 7, type: 'boost', x: 1650, y: 1704, width: 32, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    // Right Ground Ammo
    { id: 8, type: 'ammo', x: 2800, y: 874, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    // Left Cave Grenade
    { id: 9, type: 'grenade', x: 500, y: 1474, width: 32, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    // Far Left Spawn Area
    { id: 10, type: 'ammo', x: 150, y: 774, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
  ],
  barrels: [
    { id: 1, x: 520, y: 776, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 2, x: 2180, y: 976, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 3, x: 3480, y: 836, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 4, x: 1750, y: 1706, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 5, x: 1450, y: 276, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 }, // High Central Watchtower
    { id: 6, x: 820, y: 1576, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 }, // Secret Subterranean Tunnel
  ],
  tacticalCovers: [
    // 1. Concrete Bunker Sandbag Barrier
    { id: 'cover_1', x: 480, y: 772, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس أكياس رمال بوبكر', bulletProof: true },
    // 2. Center Valley Armored Steel Jersey Barrier
    { id: 'cover_2', x: 1750, y: 972, width: 95, height: 48, type: 'concrete_jersey', labelAr: 'حاجز خرساني تكتيكي', bulletProof: true },
    // 3. Outpost Camp Reinforced Cargo Container
    { id: 'cover_3', x: 3320, y: 800, width: 120, height: 80, type: 'cargo_container', labelAr: 'حاوية إمدادات مقواة', bulletProof: true },
    // 4. Center-Left Mid Ground Steel Barricade
    { id: 'cover_4', x: 1200, y: 972, width: 85, height: 48, type: 'steel_barrier', labelAr: 'دشمة فولاذية مضادة للرصاص', bulletProof: true },
    // 5. Right Timber Outpost Roof Sandbags
    { id: 'cover_5', x: 3520, y: 602, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس القناصة العلمي', bulletProof: true },
    // 6. High Floating Supply Island Missile Container Pod
    { id: 'cover_6', x: 1950, y: 570, width: 85, height: 70, type: 'missile_pod', labelAr: 'منصة صواريخ تكتيكية', bulletProof: true },
    // 7. Catacombs Subterranean Heavy Barrier
    { id: 'cover_7', x: 1480, y: 1702, width: 90, height: 48, type: 'concrete_jersey', labelAr: 'حاجز النفق المظلم', bulletProof: true },
    // 8. NEW: High Watchtower Crow's Nest Sandbags
    { id: 'cover_8', x: 1520, y: 112, width: 85, height: 48, type: 'sandbag_bunker', labelAr: 'مترس القناصة العالي 🎯', bulletProof: true },
    // 9. NEW: Secret Tunnel CQC Steel Barrier
    { id: 'cover_9', x: 1620, y: 1572, width: 85, height: 48, type: 'steel_barrier', labelAr: 'دشمة الممر السري 🔑', bulletProof: true },
  ],
  playerSpawns: [
    { x: 350, y: 750, team: 'ffa' },   // Concrete Bunker Floor
    { x: 2750, y: 450, team: 'ffa' },  // High Right Sniper Cliff
    { x: 1800, y: 950, team: 'ffa' },  // Center Valley
    { x: 3600, y: 790, team: 'ffa' },  // Right Timber Outpost Ground
    { x: 1650, y: 1680, team: 'ffa' }, // Catacombs Cave Floor
  ],
  botSpawns: [
    { x: 450, y: 750, team: 'ffa' },   // Bunker Floor
    { x: 2850, y: 450, team: 'ffa' },  // Sniper Cliff
    { x: 1900, y: 950, team: 'ffa' },  // Valley Floor
    { x: 3700, y: 790, team: 'ffa' },  // Outpost Base
    { x: 1550, y: 1680, team: 'ffa' }, // Catacombs Floor
  ],
  scenery: {
    trees: [
      { x: 100, y: 820, scale: 1.1, type: 1 },
      { x: 1400, y: 1020, scale: 1.0, type: 2 },
      { x: 2200, y: 1020, scale: 1.1, type: 1 },
      { x: 3800, y: 880, scale: 1.2, type: 2 },
    ],
    bushes: [
      { x: 180, y: 820, width: 85, height: 46 },
      { x: 1300, y: 500, width: 85, height: 46 },
      { x: 1650, y: 1020, width: 90, height: 46 },
      { x: 2800, y: 920, width: 85, height: 46 },
      { x: 800, y: 1750, width: 80, height: 42 },
      { x: 1850, y: 1750, width: 85, height: 42 },
    ],
    leftBunker: { x: 250, y: 590, width: 420, height: 230 },
    rightOutpost: { x: 3450, y: 650, width: 360, height: 230 },
    woodPiles: [
      { x: 120, y: 800 },
      { x: 2420, y: 1000 },
      { x: 3380, y: 860 },
    ],
    lamps: [
      // Aboveground lamps - mounted on ceilings/structures
      { x: 460, y: 616, color: '#ef4444' }, // Red military warning beacon inside Left Bunker
      { x: 1500, y: 560, color: '#38bdf8' }, // Cool cyan floating rock spotlight
      { x: 2820, y: 560, color: '#22c55e' }, // Green beacon at High Right Sniper Cliff
      { x: 3650, y: 676, color: '#fb923c' }, // Orange lamp on Right Timber Outpost
      
      // NEW: High Watchtower & Apex Decks Lights
      { x: 1570, y: 160, color: '#38bdf8' }, // Cyan beacon on High Watchtower Crow's Nest
      { x: 3610, y: 240, color: '#a855f7' }, // Purple beacon on East Outpost Apex
      { x: 360, y: 380, color: '#ef4444' }, // Red beacon on West Radar Deck

      // Underground catacomb ceiling lanterns & Secret Tunnel Lights
      { x: 550, y: 1280, color: '#f59e0b' },
      { x: 1100, y: 1280, color: '#fbbf24' },
      { x: 1650, y: 1280, color: '#f59e0b' },
      { x: 2200, y: 1280, color: '#fbbf24' },
      { x: 2750, y: 1280, color: '#f59e0b' },
      { x: 1400, y: 1420, color: '#22c55e' }, // Emerald green tactical light in Secret Tunnel
      { x: 2400, y: 1420, color: '#38bdf8' }, // Cyan light in East Secret Passage
    ],
    signs: [
      { x: 200, y: 800, text: 'OUTPOST BASE' },
      { x: 1750, y: 1000, text: 'VALLEY BOWL' },
      { x: 3550, y: 860, text: 'EAST CAMP' },
      { x: 1500, y: 300, text: 'WATCHTOWER CROW NEST' },
      { x: 1400, y: 1400, text: 'SECRET CQC TUNNEL' },
    ],
    chains: [
      { x: 1900, y1: 0, y2: 640 },
      { x: 2400, y1: 0, y2: 640 },
      { x: 520, y1: 820, y2: 1020 },
      { x: 780, y1: 820, y2: 1020 },
      { x: 1520, y1: 0, y2: 160 }, // Hanging chains for Watchtower Apex
      { x: 3600, y1: 0, y2: 240 },
    ],
    guideMarkers: [
      { x: 280, y: 550, direction: 'up-right', labelAr: 'مسار القفز العلوي ⬆', labelEn: 'HIGH PARKOUR', color: '#22d3ee' },
      { x: 1510, y: 140, direction: 'up', labelAr: 'برج المراقبة العالي 🏰', labelEn: 'APEX WATCHTOWER', color: '#38bdf8' },
      { x: 3550, y: 220, direction: 'up-right', labelAr: 'سطح المعسكر الشرقي ⬆', labelEn: 'EAST OUTPOST APEX', color: '#a855f7' },
      { x: 800, y: 980, direction: 'down-right', labelAr: 'مدخل الأنفاق ⬇', labelEn: 'CATACOMBS', color: '#f59e0b' },
      { x: 1300, y: 440, direction: 'right', labelAr: 'الصخرة الطائرة ➡', labelEn: 'FLOATING ROCK', color: '#10b981' },
      { x: 1950, y: 580, direction: 'right', labelAr: 'الجسر العلوي ➡', labelEn: 'HIGH BRIDGE', color: '#38bdf8' },
      { x: 1700, y: 960, direction: 'down', labelAr: 'وادي القتال ⬇', labelEn: 'VALLEY BOWL', color: '#34d399' },
      { x: 2700, y: 460, direction: 'up-right', labelAr: 'منصة القناصة ⬆', labelEn: 'SNIPER CLIFF', color: '#f43f5e' },
      { x: 3450, y: 610, direction: 'right', labelAr: 'المعسكر الشرقي ➡', labelEn: 'EAST OUTPOST', color: '#fb923c' },
      { x: 1200, y: 1320, direction: 'right', labelAr: 'الممر السري المغلق 🔑', labelEn: 'SECRET CQC TUNNEL', color: '#a855f7' },
      { x: 2400, y: 1320, direction: 'up-right', labelAr: 'مخرج الأنفاق ⬆', labelEn: 'TUNNEL EXIT', color: '#06b6d4' },
      { x: 1450, y: 1600, direction: 'down-right', labelAr: 'غرفة الخزانة السرية 🗝️', labelEn: 'SECRET ARMORY VAULT', color: '#f59e0b' },
    ],
  },
};
