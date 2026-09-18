/**
 * Tactical Combat Statistics Manager for Mini Militia Battle Arena
 * Tracks wins, losses, shots fired, hits, and aim precision telemetry
 */

export interface MatchHistoryEntry {
  id: string;
  mapName: string;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  accuracy: number; // percentage 0-100
  headshots: number;
  timestamp: string;
}

export interface PlayerCombatStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; // percentage
  kills: number;
  deaths: number;
  kdRatio: number;
  shotsFired: number;
  shotsHit: number;
  overallAccuracy: number; // percentage
  headshotRate: number; // percentage
  torsoRate: number; // percentage
  limbRate: number; // percentage
  recentMatches: MatchHistoryEntry[];
  accuracyHistory: {
    matchLabel: string;
    accuracy: number;
    kills: number;
    benchmark: number;
  }[];
}

const STATS_STORAGE_KEY = 'mini_militia_combat_stats_v2';

export const DEFAULT_COMBAT_STATS: PlayerCombatStats = {
  totalMatches: 184,
  wins: 125,
  losses: 59,
  winRate: 68,
  kills: 1420,
  deaths: 589,
  kdRatio: 2.41,
  shotsFired: 5240,
  shotsHit: 3878,
  overallAccuracy: 74,
  headshotRate: 31,
  torsoRate: 45,
  limbRate: 24,
  recentMatches: [
    { id: 'm-7', mapName: 'البؤرة Outpost', result: 'win', kills: 14, deaths: 4, accuracy: 78, headshots: 6, timestamp: 'اليوم، 14:20' },
    { id: 'm-6', mapName: 'المخبأ Bunker', result: 'win', kills: 11, deaths: 5, accuracy: 72, headshots: 4, timestamp: 'اليوم، 13:05' },
    { id: 'm-5', mapName: 'الصحراء Catacombs', result: 'loss', kills: 8, deaths: 7, accuracy: 69, headshots: 2, timestamp: 'أمس، 22:15' },
    { id: 'm-4', mapName: 'البؤرة Outpost', result: 'win', kills: 16, deaths: 3, accuracy: 83, headshots: 7, timestamp: 'أمس، 21:00' },
    { id: 'm-3', mapName: 'البرج Suspended', result: 'loss', kills: 7, deaths: 8, accuracy: 66, headshots: 3, timestamp: 'أمس، 19:40' },
    { id: 'm-2', mapName: 'المخبأ Bunker', result: 'win', kills: 13, deaths: 4, accuracy: 76, headshots: 5, timestamp: '16 سبتمبر' },
    { id: 'm-1', mapName: 'البؤرة Outpost', result: 'win', kills: 15, deaths: 2, accuracy: 81, headshots: 6, timestamp: '15 سبتمبر' },
  ],
  accuracyHistory: [
    { matchLabel: 'معركة 1', accuracy: 81, kills: 15, benchmark: 70 },
    { matchLabel: 'معركة 2', accuracy: 76, kills: 13, benchmark: 70 },
    { matchLabel: 'معركة 3', accuracy: 66, kills: 7, benchmark: 70 },
    { matchLabel: 'معركة 4', accuracy: 83, kills: 16, benchmark: 70 },
    { matchLabel: 'معركة 5', accuracy: 69, kills: 8, benchmark: 70 },
    { matchLabel: 'معركة 6', accuracy: 72, kills: 11, benchmark: 70 },
    { matchLabel: 'معركة 7', accuracy: 78, kills: 14, benchmark: 70 },
  ],
};

class PlayerStatsManager {
  private stats: PlayerCombatStats;

  constructor() {
    this.stats = this.loadStats();
  }

  private loadStats(): PlayerCombatStats {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_COMBAT_STATS, ...JSON.parse(stored) };
      }
    } catch {
      // fallback on error
    }
    return DEFAULT_COMBAT_STATS;
  }

  public getStats(): PlayerCombatStats {
    return { ...this.stats };
  }

  public saveStats(newStats: PlayerCombatStats): void {
    this.stats = newStats;
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      window.dispatchEvent(new Event('player-stats-updated'));
    } catch {
      // storage error handled
    }
  }

  public recordSimulatedMatch(isWin: boolean, accuracy: number, kills: number, deaths: number): PlayerCombatStats {
    const wins = this.stats.wins + (isWin ? 1 : 0);
    const losses = this.stats.losses + (isWin ? 0 : 1);
    const totalMatches = wins + losses;
    const winRate = Math.round((wins / totalMatches) * 100);
    const newKills = this.stats.kills + kills;
    const newDeaths = this.stats.deaths + deaths;
    const kdRatio = Number((newKills / Math.max(1, newDeaths)).toFixed(2));

    const shotsFired = this.stats.shotsFired + 35;
    const newHits = Math.round(35 * (accuracy / 100));
    const shotsHit = this.stats.shotsHit + newHits;
    const overallAccuracy = Math.round((shotsHit / shotsFired) * 100);

    const matchId = `m-${Date.now().toString().slice(-4)}`;
    const newEntry: MatchHistoryEntry = {
      id: matchId,
      mapName: 'البؤرة Outpost',
      result: isWin ? 'win' : 'loss',
      kills,
      deaths,
      accuracy,
      headshots: Math.round(kills * 0.35),
      timestamp: 'الآن',
    };

    const recentMatches = [newEntry, ...this.stats.recentMatches.slice(0, 6)];
    const matchNumber = this.stats.accuracyHistory.length + 1;
    const newAccuracyHistory = [
      ...this.stats.accuracyHistory.slice(-6),
      {
        matchLabel: `معركة ${matchNumber}`,
        accuracy,
        kills,
        benchmark: 70,
      },
    ];

    const updated: PlayerCombatStats = {
      ...this.stats,
      totalMatches,
      wins,
      losses,
      winRate,
      kills: newKills,
      deaths: newDeaths,
      kdRatio,
      shotsFired,
      shotsHit,
      overallAccuracy,
      recentMatches,
      accuracyHistory: newAccuracyHistory,
    };

    this.saveStats(updated);
    return updated;
  }

  public resetToDefault(): PlayerCombatStats {
    this.saveStats(DEFAULT_COMBAT_STATS);
    return DEFAULT_COMBAT_STATS;
  }
}

export const playerStatsManager = new PlayerStatsManager();
