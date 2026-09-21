/**
 * Mini Battle Arena - Lifetime Statistics Manager & Rank System
 */

import { missionsManager } from './missionsManager';
import { cloudSyncManager } from './cloudSyncManager';

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  mode: string;
  kills: number;
  deaths: number;
  headshots: number;
  maxStreak: number;
  isVictory: boolean;
  score: number;
  damage?: number;
}

export interface PlayerLifetimeStats {
  totalKills: number;
  totalHeadshots: number;
  totalWins: number;
  totalMatches: number;
  totalDeaths: number;
  longestKillStreak: number;
  totalDamageDealt: number;
  highestSurvivalWave: number;
  matchHistory: MatchHistoryItem[];
  coins: number;
  // Personal Best Records (الأرقام القياسية الشخصية)
  bestKills: number;
  bestMatchTimeSeconds: number;
  bestAccuracy: number;
}

export interface RankInfo {
  titleAr: string;
  titleEn: string;
  badge: string; // Emoji / Icon symbol
  color: string;
  minKills: number;
  nextRankKills: number;
  progressPercent: number;
  minXP?: number;
  minMatches?: number;
  nextRankXP?: number;
  nextRankMatches?: number;
}

export interface XPInfo {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

const DEFAULT_STATS: PlayerLifetimeStats = {
  totalKills: 0,
  totalHeadshots: 0,
  totalWins: 0,
  totalMatches: 0,
  totalDeaths: 0,
  longestKillStreak: 0,
  totalDamageDealt: 0,
  highestSurvivalWave: 1,
  matchHistory: [],
  coins: 100, // 100 starting welcome coins!
  bestKills: 0,
  bestMatchTimeSeconds: 0,
  bestAccuracy: 0,
};

const STORAGE_KEY = 'mini_battle_lifetime_stats_v1';

export const statsManager = {
  getStats(): PlayerLifetimeStats {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_STATS;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_STATS,
        ...parsed,
        matchHistory: parsed.matchHistory || [],
        coins: parsed.coins !== undefined ? parsed.coins : 100,
        bestKills: parsed.bestKills || (parsed.matchHistory && parsed.matchHistory.length > 0 ? Math.max(...parsed.matchHistory.map((m: any) => m.kills || 0)) : 0),
        bestMatchTimeSeconds: parsed.bestMatchTimeSeconds || 0,
        bestAccuracy: parsed.bestAccuracy || (parsed.totalHeadshots && parsed.totalKills ? Math.min(100, Math.round((parsed.totalHeadshots / Math.max(1, parsed.totalKills)) * 100)) : 0),
      };
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: PlayerLifetimeStats): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save lifetime stats:', e);
    }
  },

  recordMatch(match: {
    mode: string;
    kills: number;
    deaths: number;
    headshots: number;
    maxStreak: number;
    damage: number;
    isVictory: boolean;
    score: number;
    wave?: number;
    durationSeconds?: number;
    accuracy?: number;
  }): PlayerLifetimeStats {
    const current = this.getStats();
    const currentCoins = current.coins !== undefined ? current.coins : 100;
    const earnedCoins = 50 + (match.isVictory ? 100 : 0) + (match.kills * 15) + (match.headshots * 10);

    const matchDuration = match.durationSeconds || 0;
    const currentBestTime = current.bestMatchTimeSeconds || 0;
    const newBestTime = match.isVictory && matchDuration > 0
      ? (currentBestTime === 0 ? matchDuration : Math.min(currentBestTime, matchDuration))
      : currentBestTime;

    const calculatedAccuracy = match.accuracy !== undefined
      ? match.accuracy
      : (match.kills > 0 ? Math.min(100, Math.round((match.headshots / Math.max(1, match.kills)) * 100)) : 0);

    const updated: PlayerLifetimeStats = {
      ...current,
      totalKills: current.totalKills + match.kills,
      totalHeadshots: current.totalHeadshots + match.headshots,
      totalWins: current.totalWins + (match.isVictory ? 1 : 0),
      totalMatches: current.totalMatches + 1,
      totalDeaths: current.totalDeaths + match.deaths,
      longestKillStreak: Math.max(current.longestKillStreak, match.maxStreak),
      totalDamageDealt: current.totalDamageDealt + match.damage,
      highestSurvivalWave: Math.max(current.highestSurvivalWave, match.wave || 1),
      bestKills: Math.max(current.bestKills || 0, match.kills),
      bestMatchTimeSeconds: newBestTime,
      bestAccuracy: Math.max(current.bestAccuracy || 0, calculatedAccuracy),
      matchHistory: [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          mode: match.mode,
          kills: match.kills,
          deaths: match.deaths,
          headshots: match.headshots,
          maxStreak: match.maxStreak,
          isVictory: match.isVictory,
          score: match.score,
          damage: match.damage,
        },
        ...(current.matchHistory || []),
      ].slice(0, 15), // Keep last 15 matches
      coins: currentCoins + earnedCoins,
    };

    this.saveStats(updated);

    // Update Daily Missions Progress automatically
    missionsManager.updateMissionsProgress({
      kills: match.kills,
      headshots: match.headshots,
      maxStreak: match.maxStreak,
      damage: match.damage,
      isVictory: match.isVictory,
    });

    // Auto sync to cloud if user is logged in
    cloudSyncManager.syncToCloud();

    return updated;
  },

  resetStats(): PlayerLifetimeStats {
    this.saveStats(DEFAULT_STATS);
    return DEFAULT_STATS;
  },

  getRank(xpOrKills: number, matches: number = 0): RankInfo {
    const ranks = [
      { titleAr: 'مجند جديد', titleEn: 'Recruit', badge: '🎖️', color: '#9ca3af', minXP: 0, minMatches: 0, minKills: 0 },
      { titleAr: 'عريف تكتيكي', titleEn: 'Corporal', badge: '🎗️', color: '#4ade80', minXP: 500, minMatches: 2, minKills: 15 },
      { titleAr: 'رقيب صاعقة', titleEn: 'Sergeant', badge: '🥉', color: '#38bdf8', minXP: 1800, minMatches: 5, minKills: 45 },
      { titleAr: 'ملازم قتالي', titleEn: 'Lieutenant', badge: '🥈', color: '#a855f7', minXP: 4500, minMatches: 12, minKills: 90 },
      { titleAr: 'نقيب الفرقة', titleEn: 'Captain', badge: '🥇', color: '#facc15', minXP: 10000, minMatches: 25, minKills: 160 },
      { titleAr: 'رائد عمليات', titleEn: 'Major', badge: '⭐', color: '#f97316', minXP: 20000, minMatches: 50, minKills: 260 },
      { titleAr: 'عقيد ميليشيا', titleEn: 'Colonel', badge: '🌟', color: '#ef4444', minXP: 38000, minMatches: 90, minKills: 400 },
      { titleAr: 'عميد أسطوري', titleEn: 'Brigadier', badge: '👑', color: '#ec4899', minXP: 65000, minMatches: 140, minKills: 600 },
      { titleAr: 'لواء الساحة', titleEn: 'General', badge: '⚔️', color: '#06b6d4', minXP: 100000, minMatches: 200, minKills: 900 },
      { titleAr: 'مارشال القتال الأسطوري', titleEn: 'Field Marshal', badge: '🔥', color: '#eab308', minXP: 160000, minMatches: 300, minKills: 1300 },
    ];

    let xp = xpOrKills;
    let finalMatches = matches;
    if (matches === 0 && xpOrKills < 2500) {
      // Legacy totalKills backward compatibility
      const kills = xpOrKills;
      xp = Math.floor(kills * 120 + Math.floor(kills / 4) * 40);
      finalMatches = Math.max(0, Math.floor(kills / 3));
    }

    let currentRankIndex = 0;
    for (let i = 0; i < ranks.length; i++) {
      if (xp >= ranks[i].minXP && finalMatches >= ranks[i].minMatches) {
        currentRankIndex = i;
      } else {
        break;
      }
    }

    const currentRank = ranks[currentRankIndex];
    const nextRank = ranks[currentRankIndex + 1];

    if (!nextRank) {
      return {
        ...currentRank,
        nextRankKills: currentRank.minKills,
        nextRankXP: currentRank.minXP,
        nextRankMatches: currentRank.minMatches,
        progressPercent: 100,
      };
    }

    const rangeXP = nextRank.minXP - currentRank.minXP;
    const progressXP = xp - currentRank.minXP;
    const percentXP = rangeXP > 0 ? Math.min(100, Math.max(0, (progressXP / rangeXP) * 100)) : 100;

    const rangeMatches = nextRank.minMatches - currentRank.minMatches;
    const progressMatches = finalMatches - currentRank.minMatches;
    const percentMatches = rangeMatches > 0 ? Math.min(100, Math.max(0, (progressMatches / rangeMatches) * 100)) : 100;

    // Average the progress of both constraints
    const percent = Math.floor((percentXP + percentMatches) / 2);

    return {
      ...currentRank,
      nextRankKills: nextRank.minKills,
      nextRankXP: nextRank.minXP,
      nextRankMatches: nextRank.minMatches,
      progressPercent: percent,
    };
  },

  getXPInfo(stats: PlayerLifetimeStats): XPInfo {
    // Calculate total XP earned from gameplay actions
    const totalXP = Math.floor(
      stats.totalKills * 100 +
      stats.totalHeadshots * 50 +
      stats.totalWins * 300 +
      stats.totalMatches * 40 +
      stats.totalDamageDealt * 0.1
    );

    // Progressive XP formula for levels: Base 500 XP per level + 250 scaling per level
    let level = 1;
    let accumulatedXP = 0;

    const getXPForLevel = (lvl: number) => 400 + (lvl - 1) * 200;

    while (true) {
      const needed = getXPForLevel(level);
      if (totalXP >= accumulatedXP + needed) {
        accumulatedXP += needed;
        level++;
      } else {
        break;
      }
    }

    const xpForThisLevel = getXPForLevel(level);
    const xpInCurrentLevel = totalXP - accumulatedXP;
    const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpForThisLevel) * 100));

    return {
      level,
      totalXP,
      currentLevelXP: accumulatedXP,
      nextLevelXP: accumulatedXP + xpForThisLevel,
      xpInCurrentLevel,
      xpNeededForNextLevel: xpForThisLevel - xpInCurrentLevel,
      progressPercent,
    };
  },
};
