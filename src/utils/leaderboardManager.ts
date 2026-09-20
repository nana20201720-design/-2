import { db, collection, getDocs } from '../lib/firebase';
import { PlayerLifetimeStats, statsManager } from './statsManager';
import { PlayerCustomization } from '../types';

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  avatarColor: string;
  totalScore: number;
  totalKills: number;
  totalWins: number;
  totalMatches: number;
  rankTitle: string;
  rankBadge: string;
  isCurrentUser?: boolean;
}

// Fallback arena champions to fill top 10 if fewer than 10 players exist in Firestore
const DEFAULT_TOP_BOTS: LeaderboardEntry[] = [];

export const leaderboardManager = {
  async getTop10Players(
    currentUserId?: string | null,
    sortBy: 'totalScore' | 'totalKills' | 'totalWins' = 'totalScore'
  ): Promise<{ players: LeaderboardEntry[]; currentUserRank: number | null }> {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);

      const realPlayers: LeaderboardEntry[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const stats: PlayerLifetimeStats = data.stats || {
          totalKills: 0,
          totalHeadshots: 0,
          totalWins: 0,
          totalMatches: 0,
          totalDeaths: 0,
          longestKillStreak: 0,
          totalDamageDealt: 0,
          highestSurvivalWave: 1,
          matchHistory: [],
        };

        const customization: PlayerCustomization = data.customization || {};
        const calculatedScore =
          data.totalScore ||
          Math.floor(
            stats.totalKills * 100 +
              stats.totalHeadshots * 50 +
              stats.totalWins * 300 +
              stats.totalMatches * 40 +
              stats.totalDamageDealt * 0.1
          );

        const rank = statsManager.getRank(stats.totalKills || 0);

        realPlayers.push({
          uid: docSnap.id,
          displayName:
            data.displayName ||
            customization.playerName ||
            `مقاتل #${docSnap.id.substring(0, 5)}`,
          avatarColor: customization.camoColor || '#15803d',
          totalScore: calculatedScore,
          totalKills: stats.totalKills || 0,
          totalWins: stats.totalWins || 0,
          totalMatches: stats.totalMatches || 0,
          rankTitle: rank.titleAr,
          rankBadge: rank.badge,
          isCurrentUser: currentUserId === docSnap.id,
        });
      });

      // Combine real players with bots if real players < 10
      let combined = [...realPlayers];
      if (combined.length < 10) {
        const existingUids = new Set(combined.map((p) => p.uid));
        for (const bot of DEFAULT_TOP_BOTS) {
          if (!existingUids.has(bot.uid)) {
            combined.push({
              ...bot,
              isCurrentUser: currentUserId === bot.uid,
            });
          }
        }
      }

      // Sort by the chosen metric
      combined.sort((a, b) => {
        if (sortBy === 'totalKills') return b.totalKills - a.totalKills;
        if (sortBy === 'totalWins') return b.totalWins - a.totalWins;
        return b.totalScore - a.totalScore;
      });

      // Find current user rank
      let currentUserRank: number | null = null;
      if (currentUserId) {
        const index = combined.findIndex((p) => p.uid === currentUserId);
        if (index !== -1) {
          currentUserRank = index + 1;
        }
      }

      // Slice top 10
      const top10 = combined.slice(0, 10);

      return {
        players: top10,
        currentUserRank,
      };
    } catch (e) {
      console.error('Failed to fetch leaderboard from Firestore:', e);
      // Return fallback bots sorted
      const fallback = [...DEFAULT_TOP_BOTS].sort((a, b) => {
        if (sortBy === 'totalKills') return b.totalKills - a.totalKills;
        if (sortBy === 'totalWins') return b.totalWins - a.totalWins;
        return b.totalScore - a.totalScore;
      });

      return {
        players: fallback.slice(0, 10),
        currentUserRank: null,
      };
    }
  },
};
