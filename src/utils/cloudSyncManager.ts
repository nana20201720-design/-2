import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  onAuthStateChanged,
  FirebaseUser,
  isQuotaError,
  isOfflineError,
} from '../lib/firebase';
import { statsManager, PlayerLifetimeStats } from './statsManager';
import { missionsManager, DailyMissionsState } from './missionsManager';
import { PlayerCustomization } from '../types';

export interface CloudUserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  stats: PlayerLifetimeStats;
  totalScore?: number;
  totalKills?: number;
  totalWins?: number;
  customization: PlayerCustomization;
  dailyMissions: DailyMissionsState;
  updatedAt: number;
}

export const cloudSyncManager = {
  currentUser: null as FirebaseUser | null,
  lastSyncTime: 0,

  init(onUserChanged?: (user: FirebaseUser | null) => void) {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadFromCloud(user.uid);
      }
      if (onUserChanged) {
        onUserChanged(user);
      }
    });
  },

  async loadFromCloud(uid: string): Promise<CloudUserData | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      const cloudData = snap.exists() ? (snap.data() as CloudUserData) : null;
      const localData = this.loadLocal(uid);

      let winner: CloudUserData | null = null;

      if (cloudData && localData) {
        // مقارنة البيانات
        if ((localData.updatedAt || 0) > (cloudData.updatedAt || 0)) {
          console.log('🛡️ البيانات المحلية أحدث، سيتم تحديث السحابة.');
          await this.syncToCloud(localData.customization, true);
          winner = localData;
        } else {
          winner = cloudData;
        }
      } else if (localData) {
        winner = localData;
      } else if (cloudData) {
        winner = cloudData;
      } else {
        // مستخدم جديد تماماً
        await this.syncToCloud(undefined, true);
        return null;
      }

      if (winner) {
        if (winner.stats) statsManager.saveStats(winner.stats);
        if (winner.dailyMissions) missionsManager.saveMissions(winner.dailyMissions);
        return winner;
      }
    } catch (e) {
      if (isQuotaError(e)) {
        console.warn('Firestore Quota Exceeded. Using local data.');
        return this.loadLocal(uid);
      } else if (isOfflineError(e)) {
        console.warn('Device is offline. Using local data.');
        return this.loadLocal(uid);
      } else {
        console.error('Failed to load user data:', e);
      }
    }
    return null;
  },

  async syncToCloud(customization?: PlayerCustomization, force: boolean = false): Promise<boolean> {
    if (!auth.currentUser) return false;
    
    // Rate limit: sync at most once every 2 minutes unless forced
    const now = Date.now();
    if (!force && now - this.lastSyncTime < 2 * 60 * 1000) {
      return true; // Pretend it was successful
    }
    
    const uid = auth.currentUser.uid;

    try {
      const stats = statsManager.getStats();
      const dailyMissions = missionsManager.getMissions();
      const savedCustomization = customization || {
        playerName: auth.currentUser.displayName || 'مقاتل الأرينا',
        skinTone: '#fca5a5',
        camoColor: '#15803d',
        headgear: 'helmet',
        sunglasses: true,
      };

      const xpInfo = statsManager.getXPInfo(stats);

      const payload: CloudUserData = {
        uid,
        email: auth.currentUser.email || null,
        displayName: auth.currentUser.displayName || savedCustomization.playerName,
        stats,
        totalScore: xpInfo.totalXP,
        totalKills: stats.totalKills,
        totalWins: stats.totalWins,
        customization: savedCustomization,
        dailyMissions,
        updatedAt: Date.now(),
      };

      // 💾 حفظ محلي كنسخة احتياطية فورية
      localStorage.setItem(`user_data_${uid}`, JSON.stringify(payload));

      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, payload, { merge: true });
      this.lastSyncTime = now;
      return true;
    } catch (e) {
      if (isQuotaError(e)) {
        console.warn('Firestore Quota Exceeded (Daily Limit). Sync paused.');
      } else if (isOfflineError(e)) {
        console.warn('Device is offline. Sync paused until connection is restored.');
      } else {
        console.error('Failed to sync data to cloud:', e);
      }
      return false;
    }
  },

  loadLocal(uid: string): CloudUserData | null {
    const data = localStorage.getItem(`user_data_${uid}`);
    return data ? JSON.parse(data) : null;
  },
};
