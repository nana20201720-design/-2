import { SoldierProgression, SoldierSkills } from '../types';
import { settingsManager } from './settingsManager';

const PROGRESSION_STORAGE_KEY = 'mini_militia_soldier_progression_v1';

export interface RankInfo {
  minLevel: number;
  titleAr: string;
  titleEn: string;
  badge: string;
  icon: string;
  color: string;
}

export const MILITARY_RANKS: RankInfo[] = [
  { minLevel: 1, titleAr: 'مجند مستجد', titleEn: 'Recruit', badge: '🪖', icon: 'Shield', color: '#94a3b8' },
  { minLevel: 3, titleAr: 'جندي أول صاعقة', titleEn: 'Private First Class', badge: '🎖️', icon: 'Award', color: '#22c55e' },
  { minLevel: 6, titleAr: 'عريف مقاتل', titleEn: 'Corporal', badge: '🎗️', icon: 'ChevronUp', color: '#38bdf8' },
  { minLevel: 10, titleAr: 'رقيب أول تكتيكي', titleEn: 'Master Sergeant', badge: '⚡', icon: 'Zap', color: '#a855f7' },
  { minLevel: 15, titleAr: 'ملازم استطلاع جوي', titleEn: 'Flight Lieutenant', badge: '🚀', icon: 'Compass', color: '#06b6d4' },
  { minLevel: 20, titleAr: 'نقيب قوات خاصة', titleEn: 'Special Ops Captain', badge: '⭐', icon: 'Star', color: '#eab308' },
  { minLevel: 25, titleAr: 'رائد مظلات حربية', titleEn: 'Airborne Major', badge: '🦅', icon: 'Flame', color: '#f97316' },
  { minLevel: 30, titleAr: 'عقيد العمليات الحربية', titleEn: 'Colonel of Warfare', badge: '👑', icon: 'Crown', color: '#ef4444' },
  { minLevel: 40, titleAr: 'عميد الصقور المقاتلة', titleEn: 'Brigadier Falcon', badge: '🛡️', icon: 'ShieldAlert', color: '#f43f5e' },
  { minLevel: 50, titleAr: 'مشير الساحة الأسطوري', titleEn: 'Supreme Field Marshal', badge: '🌌', icon: 'Sparkles', color: '#8b5cf6' },
];

export interface SkillDefinition {
  id: keyof SoldierSkills;
  titleAr: string;
  titleEn: string;
  descAr: string;
  icon: string;
  color: string;
  baseStat: string;
  maxStat: string;
  unit: string;
  getPerLevelBonus: (lvl: number) => string;
}

export const SKILL_DEFINITIONS: Record<keyof SoldierSkills, SkillDefinition> = {
  jetpackSpeed: {
    id: 'jetpackSpeed',
    titleAr: 'سرعة الدفع النفاث',
    titleEn: 'Jetpack Thrust Speed',
    descAr: 'زيادة قوة تسارع المحرك وسرعة الطيران والمناورة الهوائية بنسبة متصاعدة.',
    icon: 'Rocket',
    color: '#38bdf8',
    baseStat: '100%',
    maxStat: '140%',
    unit: 'سرعة جوية',
    getPerLevelBonus: (lvl: number) => `+${(lvl - 1) * 10}% سرعة طيران ومناورة`,
  },
  jetpackEndurance: {
    id: 'jetpackEndurance',
    titleAr: 'سعة وقود النفاثة والتحمل',
    titleEn: 'Fuel Stamina & Burn Efficiency',
    descAr: 'تمديد زمن الطيران المستمر وتقليل استهلاك الوقود وتسريع إعادة شحن التوربين.',
    icon: 'BatteryCharging',
    color: '#22c55e',
    baseStat: '100%',
    maxStat: '160%',
    unit: 'طاقة الوقود',
    getPerLevelBonus: (lvl: number) => `+${(lvl - 1) * 15}% سعة وقود وتجدد سريع`,
  },
  armorResilience: {
    id: 'armorResilience',
    titleAr: 'الدرع التكتيكي والصمود',
    titleEn: 'Armor Plating & Max Health',
    descAr: 'رفع الحد الأقصى لصحة الجندي ومقاومة ضرر الشظايا والطلقات النارية.',
    icon: 'Shield',
    color: '#eab308',
    baseStat: '100 HP',
    maxStat: '140 HP',
    unit: 'نقاط الصمود',
    getPerLevelBonus: (lvl: number) => `+${(lvl - 1) * 10} نقطة صحة ودرع`,
  },
  reloadAgility: {
    id: 'reloadAgility',
    titleAr: 'سرعة التلقيم والرشاقة',
    titleEn: 'Rapid Reload & Tactical Agility',
    descAr: 'تقليص وقت تلقيم جميع الأسلحة النارية وزيادة سرعة الركض والقفز على الأرض.',
    icon: 'Zap',
    color: '#a855f7',
    baseStat: '100%',
    maxStat: '140%',
    unit: 'سرعة التبديل',
    getPerLevelBonus: (lvl: number) => `-${(lvl - 1) * 8}% وقت التلقيم و+${(lvl - 1) * 6}% حركة`,
  },
};

export const SKILL_UPGRADE_COSTS: Record<number, { skillPoints: number; coins: number }> = {
  1: { skillPoints: 1, coins: 600 },
  2: { skillPoints: 1, coins: 1200 },
  3: { skillPoints: 2, coins: 2400 },
  4: { skillPoints: 2, coins: 4500 },
  5: { skillPoints: 0, coins: 0 }, // Max level
};

export const DEFAULT_SOLDIER_PROGRESSION: SoldierProgression = {
  level: 8,
  xp: 1450,
  xpToNextLevel: 2200,
  skillPoints: 2,
  rankTitleAr: 'رقيب أول تكتيكي',
  rankTitleEn: 'Master Sergeant',
  rankIcon: '⚡',
  skills: {
    jetpackSpeed: 2,
    jetpackEndurance: 3,
    armorResilience: 2,
    reloadAgility: 1,
  },
};

export class SoldierProgressionManager {
  private progression: SoldierProgression;
  private listeners: Array<(progression: SoldierProgression) => void> = [];

  constructor() {
    this.progression = this.loadProgression();
  }

  private calculateXPForLevel(level: number): number {
    return Math.round(level * 350 + Math.pow(level, 1.4) * 50);
  }

  public getRankForLevel(level: number): RankInfo {
    let currentRank = MILITARY_RANKS[0];
    for (const rank of MILITARY_RANKS) {
      if (level >= rank.minLevel) {
        currentRank = rank;
      }
    }
    return currentRank;
  }

  private loadProgression(): SoldierProgression {
    try {
      const stored = localStorage.getItem(PROGRESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const rank = this.getRankForLevel(parsed.level || 8);
        return {
          ...DEFAULT_SOLDIER_PROGRESSION,
          ...parsed,
          rankTitleAr: rank.titleAr,
          rankTitleEn: rank.titleEn,
          rankIcon: rank.badge,
          skills: {
            ...DEFAULT_SOLDIER_PROGRESSION.skills,
            ...(parsed.skills || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    const rank = this.getRankForLevel(DEFAULT_SOLDIER_PROGRESSION.level);
    return {
      ...DEFAULT_SOLDIER_PROGRESSION,
      rankTitleAr: rank.titleAr,
      rankTitleEn: rank.titleEn,
      rankIcon: rank.badge,
    };
  }

  public getProgression(): SoldierProgression {
    return { ...this.progression, skills: { ...this.progression.skills } };
  }

  public saveProgression(newProgression: SoldierProgression): void {
    const rank = this.getRankForLevel(newProgression.level);
    this.progression = {
      ...newProgression,
      rankTitleAr: rank.titleAr,
      rankTitleEn: rank.titleEn,
      rankIcon: rank.badge,
    };
    try {
      localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(this.progression));
      window.dispatchEvent(new CustomEvent('soldier-progression-updated', { detail: this.progression }));
      this.notifyListeners();
    } catch {
      // ignore storage fail
    }
  }

  public addXP(amount: number, reason: string = 'قتال حربي'): { leveledUp: boolean; newLevel: number; oldLevel: number } {
    let { level, xp, skillPoints } = this.progression;
    const oldLevel = level;
    let requiredXP = this.calculateXPForLevel(level);
    xp += amount;

    let leveledUp = false;
    while (xp >= requiredXP) {
      xp -= requiredXP;
      level += 1;
      skillPoints += 1;
      leveledUp = true;
      requiredXP = this.calculateXPForLevel(level);
    }

    const rank = this.getRankForLevel(level);
    const updated: SoldierProgression = {
      ...this.progression,
      level,
      xp,
      xpToNextLevel: requiredXP,
      skillPoints,
      rankTitleAr: rank.titleAr,
      rankTitleEn: rank.titleEn,
      rankIcon: rank.badge,
    };

    this.saveProgression(updated);

    if (leveledUp) {
      window.dispatchEvent(new CustomEvent('soldier-level-up', {
        detail: {
          level,
          oldLevel,
          rankTitleAr: rank.titleAr,
          skillPointsGained: level - oldLevel,
        },
      }));
    }

    window.dispatchEvent(new CustomEvent('soldier-xp-gained', {
      detail: {
        amount,
        reason,
        currentXP: xp,
        xpToNext: requiredXP,
      },
    }));

    return { leveledUp, newLevel: level, oldLevel };
  }

  public upgradeSkill(skillId: keyof SoldierSkills): { success: boolean; message: string } {
    const currentLevel = this.progression.skills[skillId] || 1;
    if (currentLevel >= 5) {
      return { success: false, message: 'وصلت المهارة للحد الأقصى (المستوى 5)' };
    }

    const cost = SKILL_UPGRADE_COSTS[currentLevel];
    if (!cost) {
      return { success: false, message: 'تعذر الترقية حالياً' };
    }

    if (this.progression.skillPoints < cost.skillPoints) {
      return {
        success: false,
        message: `تحتاج ${cost.skillPoints} نقطة مهارة للترقية (المتاح: ${this.progression.skillPoints})`,
      };
    }

    const currentSettings = settingsManager.getSettings();
    if (currentSettings.coins < cost.coins) {
      return {
        success: false,
        message: `العملات غير كافية! تحتاج ${cost.coins.toLocaleString()} عملة (المتاح: ${currentSettings.coins.toLocaleString()})`,
      };
    }

    // Deduct coins & skill points
    settingsManager.updateSettings({ coins: currentSettings.coins - cost.coins });

    const updatedSkills: SoldierSkills = {
      ...this.progression.skills,
      [skillId]: currentLevel + 1,
    };

    const updated: SoldierProgression = {
      ...this.progression,
      skillPoints: this.progression.skillPoints - cost.skillPoints,
      skills: updatedSkills,
    };

    this.saveProgression(updated);
    return {
      success: true,
      message: `تم ترقية ${SKILL_DEFINITIONS[skillId].titleAr} إلى المستوى ${currentLevel + 1}!`,
    };
  }

  public resetSkills(): { success: boolean; refundedPoints: number } {
    const { skills } = this.progression;
    let refundedPoints = 0;
    (Object.keys(skills) as Array<keyof SoldierSkills>).forEach((k) => {
      const lvl = skills[k];
      for (let i = 1; i < lvl; i++) {
        refundedPoints += SKILL_UPGRADE_COSTS[i]?.skillPoints || 1;
      }
    });

    const resetSkillsState: SoldierSkills = {
      jetpackSpeed: 1,
      jetpackEndurance: 1,
      armorResilience: 1,
      reloadAgility: 1,
    };

    const updated: SoldierProgression = {
      ...this.progression,
      skillPoints: this.progression.skillPoints + refundedPoints,
      skills: resetSkillsState,
    };

    this.saveProgression(updated);
    return { success: true, refundedPoints };
  }

  // Multiplier calculation for GameEngine physics & combat
  public getJetpackSpeedMultiplier(skills?: SoldierSkills): number {
    const lvl = skills?.jetpackSpeed || this.progression.skills.jetpackSpeed || 1;
    return 1.0 + (lvl - 1) * 0.10; // Level 5 = +40% flight acceleration & top air speed
  }

  public getJetpackEnduranceMultiplier(skills?: SoldierSkills): number {
    const lvl = skills?.jetpackEndurance || this.progression.skills.jetpackEndurance || 1;
    return 1.0 + (lvl - 1) * 0.15; // Level 5 = +60% max fuel capacity & +30% recharge
  }

  public getArmorHealthBonus(skills?: SoldierSkills): { maxHpBonus: number; damageReduction: number } {
    const lvl = skills?.armorResilience || this.progression.skills.armorResilience || 1;
    return {
      maxHpBonus: (lvl - 1) * 10, // Level 5 = +40 extra Max HP (140 HP total)
      damageReduction: (lvl - 1) * 0.04, // Level 5 = 16% passive incoming damage reduction
    };
  }

  public getReloadAgilityMultiplier(skills?: SoldierSkills): { reloadSpeedFactor: number; sprintBonus: number } {
    const lvl = skills?.reloadAgility || this.progression.skills.reloadAgility || 1;
    return {
      reloadSpeedFactor: Math.max(0.6, 1.0 - (lvl - 1) * 0.08), // Level 5 = -32% reload duration
      sprintBonus: 1.0 + (lvl - 1) * 0.06, // Level 5 = +24% ground movement speed
    };
  }

  public subscribe(callback: (progression: SoldierProgression) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.getProgression()));
  }
}

export const soldierProgressionManager = new SoldierProgressionManager();
