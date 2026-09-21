import { Platform, Pickup, ExplosiveBarrel, WoodenCrate, TacticalCover, WeaponType } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, MapData, ARENA_MAP } from './mapData';

// ============================================================================
// 1. CATACOMBS MAP (سراديب الكهوف الصخرية)
// Dense underground stone cavern, multi-level rock terraces, suspended wood bridges,
// high stalactite ledges, and CQC shotgun / grenade choke points.
// ============================================================================
export const CATACOMBS_MAP: MapData = {
  id: 'catacombs',
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  name: 'Catacombs Cavern',
  nameAr: 'سراديب الكهوف الصخرية',
  theme: 'catacombs',
  descriptionAr: 'متاهة كهوف صخرية عميقة تضم أقواس حجرية معلقة وجسور خشبية وممرات ضيقة للقتال القريب.',
  terrainTypeAr: 'أقواس صخرية، جسور معلقة، وسراديب ضيقة',
  accentColor: '#f59e0b',
  platforms: [
    // World Boundaries
    { x: -100, y: 0, width: 100, height: MAP_HEIGHT, type: 'rock' },
    { x: MAP_WIDTH, y: 0, width: 100, height: MAP_HEIGHT, type: 'rock' },
    { x: 0, y: -100, width: MAP_WIDTH, height: 100, type: 'rock' },
    { x: 0, y: 1900, width: MAP_WIDTH, height: 100, type: 'rock' },

    // Top Cavern Vault Ledges (High Ceiling Parkour)
    { x: 150, y: 400, width: 420, height: 26, type: 'rock', oneWay: true },
    { x: 800, y: 350, width: 350, height: 26, type: 'rock', oneWay: true },
    { x: 1450, y: 320, width: 500, height: 26, type: 'rock', oneWay: true },
    { x: 2350, y: 350, width: 380, height: 26, type: 'rock', oneWay: true },
    { x: 3100, y: 400, width: 450, height: 26, type: 'rock', oneWay: true },

    // Upper Cavern Terraces (y: 650 - 750)
    { x: 0, y: 720, width: 550, height: 350, type: 'rock' },
    { x: 650, y: 680, width: 220, height: 24, type: 'wood', oneWay: true },
    { x: 980, y: 640, width: 450, height: 32, type: 'rock', oneWay: true },
    { x: 1550, y: 620, width: 320, height: 24, type: 'wood', oneWay: true },
    { x: 1980, y: 640, width: 450, height: 32, type: 'rock', oneWay: true },
    { x: 2550, y: 680, width: 220, height: 24, type: 'wood', oneWay: true },
    { x: 2900, y: 720, width: 600, height: 350, type: 'rock' },

    // Central Megalith Spire & Suspended Rope Bridges (y: 950 - 1050)
    { x: 450, y: 980, width: 300, height: 26, type: 'wood', oneWay: true },
    { x: 850, y: 920, width: 480, height: 40, type: 'rock', oneWay: true },
    { x: 1450, y: 950, width: 280, height: 26, type: 'wood', oneWay: true },
    // Center Cavern Spire Base
    { x: 1800, y: 900, width: 400, height: 320, type: 'rock' },
    { x: 2280, y: 950, width: 280, height: 26, type: 'wood', oneWay: true },
    { x: 2650, y: 920, width: 480, height: 40, type: 'rock', oneWay: true },
    { x: 3220, y: 980, width: 300, height: 26, type: 'wood', oneWay: true },

    // Deep Subterranean Chasm Arches (y: 1320 - 1450)
    { x: 0, y: 1300, width: 600, height: 50, type: 'rock' },
    { x: 750, y: 1350, width: 380, height: 26, type: 'rock', oneWay: true },
    { x: 1250, y: 1380, width: 450, height: 26, type: 'wood', oneWay: true },
    { x: 1850, y: 1340, width: 300, height: 26, type: 'rock', oneWay: true },
    { x: 2300, y: 1380, width: 450, height: 26, type: 'wood', oneWay: true },
    { x: 2880, y: 1350, width: 380, height: 26, type: 'rock', oneWay: true },
    { x: 3400, y: 1300, width: 600, height: 50, type: 'rock' },

    // Secret Armory Ledges (y: 1560)
    { x: 300, y: 1560, width: 350, height: 24, type: 'rock', oneWay: true },
    { x: 950, y: 1580, width: 420, height: 24, type: 'wood', oneWay: true },
    { x: 1650, y: 1560, width: 700, height: 26, type: 'rock', oneWay: true },
    { x: 2600, y: 1580, width: 420, height: 24, type: 'wood', oneWay: true },
    { x: 3300, y: 1560, width: 350, height: 24, type: 'rock', oneWay: true },

    // Solid Cavern Bedrock Floor
    { x: 0, y: 1750, width: MAP_WIDTH, height: 250, type: 'rock' },
  ],
  crates: [
    { id: 101, x: 250, y: 682, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'shotgun' },
    { id: 102, x: 1100, y: 602, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    { id: 103, x: 1950, y: 862, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    { id: 104, x: 2800, y: 602, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'grenade' },
    { id: 105, x: 3200, y: 682, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rifle' },
    { id: 106, x: 1800, y: 1522, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'boost' },
  ],
  pickups: [
    { id: 101, type: 'weapon', weapon: 'shotgun', x: 1600, y: 274, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 102, type: 'weapon', weapon: 'rocket', x: 1950, y: 854, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 103, type: 'weapon', weapon: 'sniper', x: 2450, y: 304, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 104, type: 'weapon', weapon: 'rifle', x: 1050, y: 594, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 105, type: 'health', x: 2100, y: 574, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 106, type: 'ammo', x: 750, y: 634, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 107, type: 'grenade', x: 2600, y: 634, width: 32, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 108, type: 'boost', x: 2000, y: 1704, width: 32, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 109, type: 'health', x: 400, y: 1514, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
  ],
  barrels: [
    { id: 101, x: 500, y: 936, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 102, x: 2100, y: 856, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 103, x: 3350, y: 936, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 104, x: 1950, y: 1706, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
  ],
  tacticalCovers: [
    { id: 'cat_c1', x: 320, y: 672, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس كهفي', bulletProof: true },
    { id: 'cat_c2', x: 1850, y: 852, width: 95, height: 48, type: 'concrete_jersey', labelAr: 'دشمة البرج الصخري', bulletProof: true },
    { id: 'cat_c3', x: 3050, y: 672, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس القناصة الشرقي', bulletProof: true },
    { id: 'cat_c4', x: 1700, y: 1512, width: 95, height: 48, type: 'steel_barrier', labelAr: 'حاجز السراديب الفولاذي', bulletProof: true },
  ],
  playerSpawns: [
    { x: 250, y: 660, team: 'ffa' },
    { x: 3100, y: 660, team: 'ffa' },
    { x: 1900, y: 840, team: 'ffa' },
    { x: 1050, y: 580, team: 'ffa' },
    { x: 1950, y: 1680, team: 'ffa' },
  ],
  botSpawns: [
    { x: 350, y: 660, team: 'ffa' },
    { x: 3200, y: 660, team: 'ffa' },
    { x: 2000, y: 840, team: 'ffa' },
    { x: 2150, y: 580, team: 'ffa' },
    { x: 1800, y: 1680, team: 'ffa' },
  ],
  scenery: {
    trees: [],
    bushes: [
      { x: 350, y: 720, width: 80, height: 42 },
      { x: 2950, y: 720, width: 80, height: 42 },
      { x: 1750, y: 1750, width: 85, height: 42 },
    ],
    woodPiles: [
      { x: 400, y: 700 },
      { x: 3100, y: 700 },
    ],
    lamps: [
      { x: 450, y: 720, color: '#f59e0b' },
      { x: 1200, y: 640, color: '#fbbf24' },
      { x: 2000, y: 640, color: '#f59e0b' },
      { x: 2800, y: 640, color: '#fbbf24' },
      { x: 1900, y: 900, color: '#ef4444' },
      { x: 1300, y: 1380, color: '#10b981' },
      { x: 2400, y: 1380, color: '#10b981' },
    ],
    signs: [
      { x: 200, y: 700, text: 'WEST CAVERN' },
      { x: 1950, y: 880, text: 'THE MONOLITH' },
      { x: 3100, y: 700, text: 'EAST GROTTO' },
    ],
    chains: [
      { x: 700, y1: 0, y2: 680 },
      { x: 2600, y1: 0, y2: 680 },
      { x: 1500, y1: 0, y2: 620 },
      { x: 1750, y1: 0, y2: 900 },
    ],
    guideMarkers: [
      { x: 680, y: 640, direction: 'up-right', labelAr: 'ممر الصخرة العلوية ⬆', labelEn: 'UPPER ARCH', color: '#f59e0b' },
      { x: 2000, y: 860, direction: 'down', labelAr: 'المغارة العميقة ⬇', labelEn: 'DEEP GROTTO', color: '#10b981' },
      { x: 1550, y: 580, direction: 'right', labelAr: 'جسر الحبال ➡', labelEn: 'ROPE BRIDGE', color: '#38bdf8' },
    ],
  },
};

// ============================================================================
// 2. APEX CITADEL MAP (أبراج القلعة المعلقة)
// Twin high-tech industrial towers, triple sky bridges, floating jump barges,
// high sniper perches, and intense jetpack aerial combat.
// ============================================================================
export const CITADEL_MAP: MapData = {
  id: 'citadel',
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  name: 'Apex Citadel',
  nameAr: 'أبراج القلعة المعلقة',
  theme: 'citadel',
  descriptionAr: 'برجان فولاذيان شاهقان متعددا الطوابق يربط بينهما جسر سماوي معلق لمعارك الطيران النفاث والقنص.',
  terrainTypeAr: 'أبراج فولاذية شاهقة، جسور معلقة، ومنصات قفز',
  accentColor: '#38bdf8',
  platforms: [
    // Boundaries
    { x: -100, y: 0, width: 100, height: MAP_HEIGHT, type: 'metal' },
    { x: MAP_WIDTH, y: 0, width: 100, height: MAP_HEIGHT, type: 'metal' },
    { x: 0, y: -100, width: MAP_WIDTH, height: 100, type: 'metal' },
    { x: 0, y: 1900, width: MAP_WIDTH, height: 100, type: 'metal' },

    // --- TOWER ALPHA (WEST TOWER - x: 100 to 1100) ---
    // Ground Base
    { x: 0, y: 1350, width: 900, height: 400, type: 'metal' },
    // Tier 1 Deck
    { x: 150, y: 1080, width: 680, height: 26, type: 'metal', oneWay: true },
    // Tier 2 Mid Deck
    { x: 200, y: 800, width: 600, height: 26, type: 'metal', oneWay: true },
    // Tier 3 High Gantry
    { x: 150, y: 520, width: 680, height: 26, type: 'metal', oneWay: true },
    // Tower Alpha Apex Sniper Perch
    { x: 300, y: 260, width: 380, height: 24, type: 'metal', oneWay: true },

    // --- TOWER OMEGA (EAST TOWER - x: 2900 to 3900) ---
    // Ground Base
    { x: 3100, y: 1350, width: 900, height: 400, type: 'metal' },
    // Tier 1 Deck
    { x: 3170, y: 1080, width: 680, height: 26, type: 'metal', oneWay: true },
    // Tier 2 Mid Deck
    { x: 3200, y: 800, width: 600, height: 26, type: 'metal', oneWay: true },
    // Tier 3 High Gantry
    { x: 3170, y: 520, width: 680, height: 26, type: 'metal', oneWay: true },
    // Tower Omega Apex Sniper Perch
    { x: 3320, y: 260, width: 380, height: 24, type: 'metal', oneWay: true },

    // --- CENTRAL SKY LINK & SUSPENDED BRIDGES ---
    // Upper Sky Bridge (Connecting Tier 3 Gantries)
    { x: 1200, y: 520, width: 1600, height: 28, type: 'metal', oneWay: true },
    // Mid Sky Transport Deck
    { x: 1500, y: 880, width: 1000, height: 28, type: 'wood', oneWay: true },
    // Lower Valley Sky Bridge
    { x: 1350, y: 1220, width: 1300, height: 28, type: 'metal', oneWay: true },

    // Floating Mid-Air Jump Barges
    { x: 950, y: 700, width: 180, height: 22, type: 'metal', oneWay: true },
    { x: 2870, y: 700, width: 180, height: 22, type: 'metal', oneWay: true },
    { x: 1100, y: 1050, width: 180, height: 22, type: 'metal', oneWay: true },
    { x: 2720, y: 1050, width: 180, height: 22, type: 'metal', oneWay: true },

    // Central Valley Drop Depot (Center Floor)
    { x: 1200, y: 1550, width: 1600, height: 200, type: 'metal' },

    // Industrial Solid Bedrock
    { x: 0, y: 1750, width: MAP_WIDTH, height: 250, type: 'metal' },
  ],
  crates: [
    { id: 201, x: 450, y: 222, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    { id: 202, x: 3450, y: 222, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    { id: 203, x: 2000, y: 482, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    { id: 204, x: 2000, y: 842, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'boost' },
    { id: 205, x: 450, y: 1042, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    { id: 206, x: 3450, y: 1042, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
  ],
  pickups: [
    { id: 201, type: 'weapon', weapon: 'sniper', x: 480, y: 214, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 202, type: 'weapon', weapon: 'sniper', x: 3480, y: 214, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 203, type: 'weapon', weapon: 'rocket', x: 2000, y: 474, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 204, type: 'weapon', weapon: 'rifle', x: 1750, y: 834, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 205, type: 'weapon', weapon: 'shotgun', x: 2000, y: 1504, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 206, type: 'health', x: 2200, y: 834, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 207, type: 'boost', x: 2000, y: 1174, width: 32, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 208, type: 'ammo', x: 500, y: 764, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 209, type: 'ammo', x: 3500, y: 764, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
  ],
  barrels: [
    { id: 201, x: 1400, y: 476, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 202, x: 2600, y: 476, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 203, x: 2000, y: 1506, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
  ],
  tacticalCovers: [
    { id: 'cit_c1', x: 420, y: 752, width: 85, height: 48, type: 'steel_barrier', labelAr: 'دشمة البرج الغربي', bulletProof: true },
    { id: 'cit_c2', x: 3450, y: 752, width: 85, height: 48, type: 'steel_barrier', labelAr: 'دشمة البرج الشرقي', bulletProof: true },
    { id: 'cit_c3', x: 1950, y: 472, width: 95, height: 48, type: 'concrete_jersey', labelAr: 'حاجز الجسر السماوي', bulletProof: true },
    { id: 'cit_c4', x: 1850, y: 1470, width: 120, height: 80, type: 'cargo_container', labelAr: 'حاوية المستودع المركزي', bulletProof: true },
  ],
  playerSpawns: [
    { x: 450, y: 750, team: 'ffa' },
    { x: 3500, y: 750, team: 'ffa' },
    { x: 2000, y: 470, team: 'ffa' },
    { x: 2000, y: 1490, team: 'ffa' },
    { x: 450, y: 1030, team: 'ffa' },
  ],
  botSpawns: [
    { x: 550, y: 750, team: 'ffa' },
    { x: 3400, y: 750, team: 'ffa' },
    { x: 1800, y: 470, team: 'ffa' },
    { x: 2200, y: 1490, team: 'ffa' },
    { x: 3500, y: 1030, team: 'ffa' },
  ],
  scenery: {
    trees: [],
    bushes: [],
    woodPiles: [],
    lamps: [
      { x: 480, y: 260, color: '#38bdf8' },
      { x: 3480, y: 260, color: '#38bdf8' },
      { x: 1400, y: 520, color: '#06b6d4' },
      { x: 2000, y: 520, color: '#38bdf8' },
      { x: 2600, y: 520, color: '#06b6d4' },
      { x: 2000, y: 880, color: '#f59e0b' },
      { x: 1600, y: 1550, color: '#ef4444' },
      { x: 2400, y: 1550, color: '#ef4444' },
    ],
    signs: [
      { x: 350, y: 500, text: 'TOWER ALPHA' },
      { x: 2000, y: 500, text: 'SKY BRIDGE' },
      { x: 3400, y: 500, text: 'TOWER OMEGA' },
    ],
    chains: [
      { x: 1400, y1: 0, y2: 520 },
      { x: 1800, y1: 0, y2: 520 },
      { x: 2200, y1: 0, y2: 520 },
      { x: 2600, y1: 0, y2: 520 },
    ],
    guideMarkers: [
      { x: 500, y: 240, direction: 'right', labelAr: 'الجسر السماوي ➡', labelEn: 'SKY BRIDGE', color: '#38bdf8' },
      { x: 2000, y: 480, direction: 'down', labelAr: 'مستودع الوادي ⬇', labelEn: 'VALLEY DEPOT', color: '#a855f7' },
      { x: 3480, y: 240, direction: 'left', labelAr: 'برج ألفا ⬅', labelEn: 'TOWER ALPHA', color: '#38bdf8' },
    ],
  },
};

// ============================================================================
// 3. DESERT CANYON MAP (وادي الكثبان الصحراوية)
// Stepped sandstone pyramid mesa, canyon sandstone ledges, fortified desert bunker,
// long-range sniper vista dunes and desert sandbag outposts.
// ============================================================================
export const DESERT_MAP: MapData = {
  id: 'desert',
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  name: 'Desert Canyon',
  nameAr: 'وادي الكثبان الصحراوية',
  theme: 'desert',
  descriptionAr: 'معسكر صحراوي مفتوح يضم هضبة رملية مدرجة كالأهرامات وخنادق ترابية وحواجز تكتيكية مقواة.',
  terrainTypeAr: 'مدرجات صخرية رملية، خنادق، ومضيق مفتوح',
  accentColor: '#eab308',
  platforms: [
    // World Boundaries
    { x: -100, y: 0, width: 100, height: MAP_HEIGHT, type: 'ground' },
    { x: MAP_WIDTH, y: 0, width: 100, height: MAP_HEIGHT, type: 'ground' },
    { x: 0, y: -100, width: MAP_WIDTH, height: 100, type: 'ground' },
    { x: 0, y: 1900, width: MAP_WIDTH, height: 100, type: 'ground' },

    // Left Sandstone Dune Ridge
    { x: 0, y: 700, width: 750, height: 450, type: 'ground' },
    { x: 200, y: 550, width: 350, height: 24, type: 'wood', oneWay: true },
    { x: 650, y: 880, width: 220, height: 22, type: 'rock', oneWay: true },

    // Central Stepped Sandstone Pyramid Mesa
    // Tier 1 Base Platform
    { x: 1100, y: 1250, width: 1800, height: 280, type: 'ground' },
    // Tier 2 Sandstone Step
    { x: 1350, y: 1000, width: 1300, height: 32, type: 'rock', oneWay: true },
    // Tier 3 Sandstone Step
    { x: 1600, y: 740, width: 800, height: 30, type: 'rock', oneWay: true },
    // Apex Altar Peak
    { x: 1800, y: 480, width: 400, height: 28, type: 'rock', oneWay: true },

    // Mid-Air Parkour Stepping Stones
    { x: 850, y: 750, width: 160, height: 22, type: 'wood', oneWay: true },
    { x: 2950, y: 750, width: 160, height: 22, type: 'wood', oneWay: true },
    { x: 1000, y: 980, width: 150, height: 22, type: 'rock', oneWay: true },
    { x: 2820, y: 980, width: 150, height: 22, type: 'rock', oneWay: true },

    // Right Fortified Sandstone Cliff & Watchpost
    { x: 3200, y: 700, width: 800, height: 450, type: 'ground' },
    { x: 3400, y: 550, width: 350, height: 24, type: 'wood', oneWay: true },
    { x: 3100, y: 880, width: 220, height: 22, type: 'rock', oneWay: true },

    // Subterranean Sand Tomb Trenches (y: 1480 - 1620)
    { x: 300, y: 1520, width: 450, height: 26, type: 'rock', oneWay: true },
    { x: 1350, y: 1550, width: 600, height: 26, type: 'wood', oneWay: true },
    { x: 2150, y: 1550, width: 600, height: 26, type: 'wood', oneWay: true },
    { x: 3250, y: 1520, width: 450, height: 26, type: 'rock', oneWay: true },

    // Solid Canyon Floor
    { x: 0, y: 1750, width: MAP_WIDTH, height: 250, type: 'ground' },
  ],
  crates: [
    { id: 301, x: 350, y: 512, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    { id: 302, x: 1980, y: 442, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    { id: 303, x: 3550, y: 512, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rifle' },
    { id: 304, x: 1600, y: 702, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    { id: 305, x: 2350, y: 702, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    { id: 306, x: 2000, y: 1512, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'grenade' },
  ],
  pickups: [
    { id: 301, type: 'weapon', weapon: 'rocket', x: 2000, y: 434, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 302, type: 'weapon', weapon: 'sniper', x: 380, y: 504, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 303, type: 'weapon', weapon: 'sniper', x: 3600, y: 504, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 304, type: 'weapon', weapon: 'shotgun', x: 2000, y: 1204, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 305, type: 'weapon', weapon: 'rifle', x: 1800, y: 694, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 306, type: 'health', x: 1500, y: 954, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 307, type: 'health', x: 2450, y: 954, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 308, type: 'ammo', x: 2000, y: 694, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 309, type: 'boost', x: 2000, y: 1704, width: 32, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
  ],
  barrels: [
    { id: 301, x: 1450, y: 956, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 302, x: 2500, y: 956, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 303, x: 2000, y: 956, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 304, x: 700, y: 656, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 305, x: 3300, y: 656, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
  ],
  tacticalCovers: [
    { id: 'des_c1', x: 450, y: 652, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس الكثيب الغربي', bulletProof: true },
    { id: 'des_c2', x: 1950, y: 432, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس قمة الهرم', bulletProof: true },
    { id: 'des_c3', x: 3450, y: 652, width: 90, height: 48, type: 'sandbag_bunker', labelAr: 'مترس الكثيب الشرقي', bulletProof: true },
    { id: 'des_c4', x: 1750, y: 952, width: 95, height: 48, type: 'concrete_jersey', labelAr: 'حاجز المدرج التكتيكي', bulletProof: true },
    { id: 'des_c5', x: 2150, y: 952, width: 95, height: 48, type: 'concrete_jersey', labelAr: 'حاجز المدرج الشرقي', bulletProof: true },
  ],
  playerSpawns: [
    { x: 350, y: 640, team: 'ffa' },
    { x: 3550, y: 640, team: 'ffa' },
    { x: 2000, y: 430, team: 'ffa' },
    { x: 1600, y: 950, team: 'ffa' },
    { x: 2400, y: 950, team: 'ffa' },
  ],
  botSpawns: [
    { x: 450, y: 640, team: 'ffa' },
    { x: 3450, y: 640, team: 'ffa' },
    { x: 1850, y: 430, team: 'ffa' },
    { x: 1700, y: 950, team: 'ffa' },
    { x: 2300, y: 950, team: 'ffa' },
  ],
  scenery: {
    trees: [],
    bushes: [
      { x: 500, y: 700, width: 85, height: 46 },
      { x: 3400, y: 700, width: 85, height: 46 },
    ],
    woodPiles: [
      { x: 200, y: 680 },
      { x: 3600, y: 680 },
    ],
    lamps: [
      { x: 500, y: 550, color: '#f59e0b' },
      { x: 2000, y: 480, color: '#ef4444' },
      { x: 3500, y: 550, color: '#f59e0b' },
      { x: 1500, y: 1000, color: '#fbbf24' },
      { x: 2500, y: 1000, color: '#fbbf24' },
      { x: 2000, y: 1250, color: '#ef4444' },
    ],
    signs: [
      { x: 300, y: 680, text: 'WEST DUNE' },
      { x: 2000, y: 460, text: 'PYRAMID APEX' },
      { x: 3500, y: 680, text: 'EAST OUTPOST' },
    ],
    chains: [
      { x: 1850, y1: 0, y2: 480 },
      { x: 2150, y1: 0, y2: 480 },
    ],
    guideMarkers: [
      { x: 450, y: 520, direction: 'up-right', labelAr: 'قمة الهرم الصحراوي ⬆', labelEn: 'PYRAMID APEX', color: '#eab308' },
      { x: 2000, y: 450, direction: 'down', labelAr: 'مدرجات الوادي ⬇', labelEn: 'CANYON VALLEY', color: '#f97316' },
      { x: 3500, y: 520, direction: 'up-left', labelAr: 'قمة الهرم الصحراوي ⬆', labelEn: 'PYRAMID APEX', color: '#eab308' },
    ],
  },
};

// ============================================================================
// 4. CYBER REACTOR CORE MAP (مفاعل الطاقة المتطور)
// Futuristic military facility, dual generator decks, central suspended plasma deck,
// high-voltage conduit walkways, neon-lit corridors, and cybernetic missile pods.
// ============================================================================
export const CYBER_MAP: MapData = {
  id: 'cyber',
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  name: 'Cyber Reactor',
  nameAr: 'مفاعل الطاقة المتطور',
  theme: 'cyber',
  descriptionAr: 'منشأة عسكرية متطورة تضم مفاعلين طاقة وأروقة فولاذية معلقة ومسارات نيون عالية الجهد.',
  terrainTypeAr: 'أروقة فولاذية، مفاعل طاقة، ومسارات نيون',
  accentColor: '#a855f7',
  platforms: [
    // World Boundaries
    { x: -100, y: 0, width: 100, height: MAP_HEIGHT, type: 'metal' },
    { x: MAP_WIDTH, y: 0, width: 100, height: MAP_HEIGHT, type: 'metal' },
    { x: 0, y: -100, width: MAP_WIDTH, height: 100, type: 'metal' },
    { x: 0, y: 1900, width: MAP_WIDTH, height: 100, type: 'metal' },

    // Upper High-Voltage Conduit Bridge (x: 1000 to 3000 at y: 320)
    { x: 1100, y: 320, width: 1800, height: 26, type: 'metal', oneWay: true },

    // Left Core Generator Wing (x: 100 to 1000)
    { x: 0, y: 1250, width: 850, height: 500, type: 'metal' },
    { x: 150, y: 980, width: 650, height: 26, type: 'metal', oneWay: true },
    { x: 250, y: 680, width: 550, height: 26, type: 'metal', oneWay: true },
    { x: 350, y: 420, width: 450, height: 24, type: 'metal', oneWay: true },

    // Central Suspended Plasma Core Platform
    { x: 1450, y: 680, width: 1100, height: 36, type: 'metal', oneWay: true },
    // Core Stabilizer Ring Sub-Deck
    { x: 1650, y: 1050, width: 700, height: 30, type: 'metal', oneWay: true },

    // Mid-air Plasma Jump Pads
    { x: 950, y: 820, width: 180, height: 22, type: 'metal', oneWay: true },
    { x: 2870, y: 820, width: 180, height: 22, type: 'metal', oneWay: true },

    // Right Core Generator Wing (x: 3000 to 3900)
    { x: 3150, y: 1250, width: 850, height: 500, type: 'metal' },
    { x: 3200, y: 980, width: 650, height: 26, type: 'metal', oneWay: true },
    { x: 3200, y: 680, width: 550, height: 26, type: 'metal', oneWay: true },
    { x: 3200, y: 420, width: 450, height: 24, type: 'metal', oneWay: true },

    // Subterranean Coolant Trench Walkways (y: 1450 - 1620)
    { x: 200, y: 1520, width: 500, height: 26, type: 'metal', oneWay: true },
    { x: 1250, y: 1480, width: 1500, height: 28, type: 'metal', oneWay: true },
    { x: 3300, y: 1520, width: 500, height: 26, type: 'metal', oneWay: true },

    // Solid Armored Facility Floor
    { x: 0, y: 1750, width: MAP_WIDTH, height: 250, type: 'metal' },
  ],
  crates: [
    { id: 401, x: 2000, y: 282, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'sniper' },
    { id: 402, x: 2000, y: 642, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'rocket' },
    { id: 403, x: 500, y: 642, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'health' },
    { id: 404, x: 3500, y: 642, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'ammo' },
    { id: 405, x: 2000, y: 1012, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'boost' },
    { id: 406, x: 2000, y: 1442, width: 38, height: 38, health: 35, maxHealth: 35, destroyed: false, respawnTimer: 0, lootType: 'weapon', weapon: 'shotgun' },
  ],
  pickups: [
    { id: 401, type: 'weapon', weapon: 'rocket', x: 2000, y: 634, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 402, type: 'weapon', weapon: 'sniper', x: 2000, y: 274, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 403, type: 'weapon', weapon: 'shotgun', x: 2000, y: 1434, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 404, type: 'weapon', weapon: 'rifle', x: 500, y: 384, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 405, type: 'weapon', weapon: 'rifle', x: 3500, y: 384, width: 44, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 406, type: 'health', x: 1750, y: 634, width: 36, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 407, type: 'ammo', x: 2250, y: 634, width: 36, height: 32, active: true, respawnTimer: 0, floatOffset: 0 },
    { id: 408, type: 'boost', x: 2000, y: 1704, width: 32, height: 36, active: true, respawnTimer: 0, floatOffset: 0 },
  ],
  barrels: [
    { id: 401, x: 1700, y: 636, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 402, x: 2300, y: 636, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
    { id: 403, x: 2000, y: 1436, width: 36, height: 44, health: 30, maxHealth: 30, exploded: false, respawnTimer: 0 },
  ],
  tacticalCovers: [
    { id: 'cyb_c1', x: 450, y: 632, width: 85, height: 48, type: 'steel_barrier', labelAr: 'دشمة المولد الغربي', bulletProof: true },
    { id: 'cyb_c2', x: 1950, y: 632, width: 95, height: 48, type: 'missile_pod', labelAr: 'منصة التحكم بالبلازما', bulletProof: true },
    { id: 'cyb_c3', x: 3450, y: 632, width: 85, height: 48, type: 'steel_barrier', labelAr: 'دشمة المولد الشرقي', bulletProof: true },
    { id: 'cyb_c4', x: 1950, y: 1432, width: 95, height: 48, type: 'concrete_jersey', labelAr: 'حاجز نفق التبريد', bulletProof: true },
  ],
  playerSpawns: [
    { x: 500, y: 630, team: 'ffa' },
    { x: 3500, y: 630, team: 'ffa' },
    { x: 2000, y: 630, team: 'ffa' },
    { x: 2000, y: 1430, team: 'ffa' },
    { x: 2000, y: 270, team: 'ffa' },
  ],
  botSpawns: [
    { x: 600, y: 630, team: 'ffa' },
    { x: 3400, y: 630, team: 'ffa' },
    { x: 1800, y: 630, team: 'ffa' },
    { x: 2200, y: 1430, team: 'ffa' },
    { x: 1700, y: 270, team: 'ffa' },
  ],
  scenery: {
    trees: [],
    bushes: [],
    woodPiles: [],
    lamps: [
      { x: 500, y: 420, color: '#a855f7' },
      { x: 3500, y: 420, color: '#a855f7' },
      { x: 1500, y: 320, color: '#38bdf8' },
      { x: 2500, y: 320, color: '#38bdf8' },
      { x: 2000, y: 680, color: '#a855f7' },
      { x: 2000, y: 1050, color: '#06b6d4' },
      { x: 1600, y: 1480, color: '#ef4444' },
      { x: 2400, y: 1480, color: '#ef4444' },
    ],
    signs: [
      { x: 400, y: 400, text: 'CORE ALPHA' },
      { x: 2000, y: 300, text: 'PLASMA REACTOR' },
      { x: 3400, y: 400, text: 'CORE BETA' },
    ],
    chains: [
      { x: 1500, y1: 0, y2: 320 },
      { x: 2500, y1: 0, y2: 320 },
    ],
    guideMarkers: [
      { x: 2000, y: 280, direction: 'down', labelAr: 'المفاعل المركزي ⬇', labelEn: 'REACTOR CORE', color: '#a855f7' },
      { x: 500, y: 640, direction: 'right', labelAr: 'ممر البلازما ➡', labelEn: 'PLASMA BRIDGE', color: '#38bdf8' },
      { x: 3500, y: 640, direction: 'left', labelAr: 'ممر البلازما ⬅', labelEn: 'PLASMA BRIDGE', color: '#38bdf8' },
    ],
  },
};

// ============================================================================
// ALL TACTICAL MAPS REPOSITORY
// ============================================================================
export const TACTICAL_MAPS: MapData[] = [
  ARENA_MAP,     // 1. Classic Outpost
  CATACOMBS_MAP, // 2. Subterranean Cavern
  CITADEL_MAP,   // 3. Apex Citadel Sky Towers
  DESERT_MAP,    // 4. Desert Canyon
  CYBER_MAP,     // 5. Cyber Reactor Core
];

/**
 * Procedurally applies dynamic platform layout terrain variations to any base map,
 * altering platform elevation, width, and positions slightly each time a new battle begins!
 */
export function applyDynamicTerrainVariations(baseMap: MapData): MapData {
  const map: MapData = JSON.parse(JSON.stringify(baseMap));

  // Small organic jitter seed per match (-20px to +20px)
  const randomShiftY = (Math.random() - 0.5) * 24;
  const randomShiftX = (Math.random() - 0.5) * 36;

  // Jitter floating one-way platforms slightly so platform parkour feels fresh
  map.platforms = map.platforms.map((plat) => {
    // Keep borders and bedrock strictly fixed
    if (plat.y >= 1700 || plat.height >= 1000 || plat.width >= 3500) {
      return plat;
    }
    if (plat.oneWay) {
      const dy = Math.round((Math.random() - 0.5) * 16);
      const dx = Math.round((Math.random() - 0.5) * 20);
      return {
        ...plat,
        x: Math.max(100, Math.min(MAP_WIDTH - plat.width - 100, plat.x + dx)),
        y: Math.max(150, Math.min(1680, plat.y + dy)),
      };
    }
    return plat;
  });

  // Randomize weapon pickups slightly for tactical variety
  const weaponPool: WeaponType[] = ['sniper', 'rocket', 'shotgun', 'rifle'];
  map.pickups = map.pickups.map((p) => {
    if (p.type === 'weapon' && Math.random() < 0.25) {
      const newW = weaponPool[Math.floor(Math.random() * weaponPool.length)];
      return { ...p, weapon: newW };
    }
    return p;
  });

  return map;
}

/**
 * Returns a random map, guaranteeing a change from the previous map when requested.
 */
export function getRandomTacticalMap(excludeId?: string): MapData {
  const pool = excludeId
    ? TACTICAL_MAPS.filter((m) => m.id !== excludeId)
    : TACTICAL_MAPS;
  const chosen = pool[Math.floor(Math.random() * pool.length)] || TACTICAL_MAPS[0];
  return applyDynamicTerrainVariations(chosen);
}

/**
 * Returns a specific map by its identifier, with dynamic terrain variations.
 */
export function getTacticalMapById(id: string): MapData {
  const found = TACTICAL_MAPS.find((m) => m.id === id) || ARENA_MAP;
  return applyDynamicTerrainVariations(found);
}
