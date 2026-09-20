/**
 * Tactical Settings Manager for Mini Militia Battle Arena
 * Persists and manages player configuration in localStorage
 */

export interface TacticalSettings {
  language: 'ar' | 'en';
  soundVolume: number; // 0 - 100
  musicVolume: number; // 0 - 100
  isMuted: boolean;
  aimSensitivity: number; // 10 - 100
  fireMode: 'dual' | 'swipe';
  aimAssist: boolean;
  jetpackBoost: boolean;
  autoWeaponSwap: boolean;
  haptics: boolean;
  hudScale: number; // 80 - 130
  hudOpacity: number; // 40 - 100
  fps: 30 | 60 | 120;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  batterySaver: boolean;
  performanceMode?: boolean; // Toggles ultra-cheap materials/meshes specifically on mobile
  playerName: string;
  playerRank: number;
  coins: number;
  gems: number;
  equippedSkin: string;
  equippedHeadgear: string;
  equippedArmor: string;
  equippedEyewear: string;
  equippedBeard: string;
  equippedJetpack: string;
  equippedTrail: string;
  equippedPrimaryWeapon: string;
  equippedSecondaryWeapon: string;
  gltfModelUrl?: string;
  weaponSkins?: Record<string, string>;
  armoryLightingMode?: 'pbr' | 'toon';
  armoryEnvironment?: 'training_range' | 'night_ops' | 'cyber_tech' | 'desert_outpost';
  previewEnvironment?: 'training_grounds' | 'military_bunker' | 'tech_lab';
  holographicHUD?: boolean;
  enable3DCharactersInBattle?: boolean;
  isLandscapeMode?: boolean;
  controlLayout: {
    grenadeBtn: { bottom: number; left: number };
    meleeBtn: { bottom: number; right: number };
    shootBtn: { bottom: number; right: number };
  };
  isDraggingControls?: boolean;
  unlockedWeapons?: string[];
  hasPremiumPass?: boolean;
  claimedPassRewards?: string[];
  killFeedIconStyle: 'classic' | 'bold' | 'neon' | 'minimalist';
}

const SETTINGS_STORAGE_KEY = 'mini_militia_tactical_settings_v1';

export const DEFAULT_SETTINGS: TacticalSettings = {
  language: 'ar',
  soundVolume: 90,
  musicVolume: 65,
  isMuted: false,
  aimSensitivity: 75,
  fireMode: 'dual',
  aimAssist: true,
  jetpackBoost: true,
  autoWeaponSwap: true,
  haptics: true,
  hudScale: 100,
  hudOpacity: 85,
  fps: 120,
  graphicsQuality: 'high',
  batterySaver: false,
  performanceMode: false,
  playerName: 'العقيد صخر',
  playerRank: 28,
  coins: 1500,
  gems: 50,
  equippedSkin: 'woodland_camo',
  equippedHeadgear: 'camo_helmet',
  equippedArmor: 'molle_vest',
  equippedEyewear: 'aviators',
  equippedBeard: 'stubble',
  equippedJetpack: 'military_dual',
  equippedTrail: 'neon_purple',
  equippedPrimaryWeapon: 'm4_rifle',
  equippedSecondaryWeapon: 'm4_rifle',
  unlockedWeapons: ['m4_rifle'],
  hasPremiumPass: false,
  claimedPassRewards: [],
  armoryLightingMode: 'pbr',
  armoryEnvironment: 'training_range',
  previewEnvironment: 'training_grounds',
  holographicHUD: true,
  enable3DCharactersInBattle: false,
  isLandscapeMode: false,
  killFeedIconStyle: 'classic',
  controlLayout: {
    grenadeBtn: { bottom: 12, left: 80 },
    meleeBtn: { bottom: 12, right: 80 },
    shootBtn: { bottom: 12, right: 160 },
  },
  isDraggingControls: false,
};

class SettingsManager {
  private settings: TacticalSettings;
  private listeners: Array<(settings: TacticalSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): TacticalSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore JSON error
    }
    return { ...DEFAULT_SETTINGS };
  }

  public getSettings(): TacticalSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<TacticalSettings>): TacticalSettings {
    this.settings = { ...this.settings, ...partial };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage quota or error
    }
    this.notifyListeners();
    return this.settings;
  }

  public resetDefaults(): TacticalSettings {
    this.settings = { ...DEFAULT_SETTINGS };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage error
    }
    this.notifyListeners();
    return this.settings;
  }

  public subscribe(listener: (settings: TacticalSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.settings);
    }
  }
}

export const settingsManager = new SettingsManager();
