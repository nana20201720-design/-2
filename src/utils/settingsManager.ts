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
  unlockedSkins?: string[];
  unlockedHeadgears?: string[];
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
  unlockedWeapons: ['m4_rifle', 'pistol', 'shotgun', 'rocket', 'sniper'],
  unlockedSkins: ['woodland_camo', 'desert_camo', 'urban_digital', 'stealth_black', 'navy_seal', 'cyber_cyan'],
  unlockedHeadgears: ['camo_helmet', 'pilot_helmet', 'gas_mask'],
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
    grenadeBtn: { bottom: 100, left: 40 },
    meleeBtn: { bottom: 100, right: 40 },
    shootBtn: { bottom: 180, right: 40 },
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
        const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        // FORCE RESET for this specific update to fix the "entering each other" glitch
        // We'll reset if the version is old or if we detect the previous 310/220 values
        if (settings.controlLayout.shootBtn.bottom >= 220 || settings.controlLayout.shootBtn.bottom < 50) {
          settings.controlLayout = { ...DEFAULT_SETTINGS.controlLayout };
        }
        return settings;
      }
    } catch {
      // Ignore JSON error
    }
    return { ...DEFAULT_SETTINGS };
  }

  public getSettings(): TacticalSettings {
    return this.settings;
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
    // Schedule on microtask queue so React listeners aren't called during another component's render phase
    queueMicrotask(() => {
      for (const listener of this.listeners) {
        try {
          listener(this.settings);
        } catch (err) {
          console.error('Settings listener error:', err);
        }
      }
    });
  }
}

export const settingsManager = new SettingsManager();
