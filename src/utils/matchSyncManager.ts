import {
  db,
  auth,
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from '../lib/firebase';
import { CharacterState } from '../types';

export interface RemotePlayerSyncState {
  uid: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  health: number;
  maxHealth?: number;
  fuel: number;
  maxFuel?: number;
  currentWeapon: string;
  isJetpacking: boolean;
  isDead: boolean;
  camoColor: string;
  kills: number;
  deaths: number;
  team: string;
  lastUpdated: number;
}

export interface NetworkQualityInfo {
  pingMs: number;
  isOnline: boolean;
  status: 'excellent' | 'good' | 'laggy' | 'offline';
  labelAr: string;
  qualityPercent: number;
}

class MatchSyncManager {
  private currentRoomCode: string | null = null;
  private unsubscribeSnapshot: (() => void) | null = null;
  private lastWriteTime = 0;
  private writeIntervalMs = 120; // ~8 updates/sec for smooth network sync without network congestion
  private consecutiveErrors = 0;
  private pingMs = 38; // Initial estimate
  private pingHistory: number[] = [35, 40, 38];
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private remotePlayersMap: Map<string, RemotePlayerSyncState> = new Map();
  private onRemotePlayersChange: ((players: RemotePlayerSyncState[]) => void) | null = null;
  private onNetworkQualityChange: ((quality: NetworkQualityInfo) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyNetworkQuality();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyNetworkQuality();
      });
    }
  }

  public getMyUid(): string {
    return auth.currentUser?.uid || 'local_player_' + Math.floor(Math.random() * 1000);
  }

  public startMatchSync(
    roomCode: string,
    playerName: string,
    camoColor: string,
    onRemotePlayersUpdate: (remotePlayers: RemotePlayerSyncState[]) => void,
    onNetworkQualityUpdate?: (quality: NetworkQualityInfo) => void
  ) {
    this.stopMatchSync();
    this.currentRoomCode = roomCode;
    this.onRemotePlayersChange = onRemotePlayersUpdate;
    this.onNetworkQualityChange = onNetworkQualityUpdate || null;

    const myUid = this.getMyUid();
    const playersRef = collection(db, 'matches', roomCode, 'players');

    // Subscribe to live snapshot updates from all players in room
    this.unsubscribeSnapshot = onSnapshot(
      playersRef,
      (snapshot) => {
        const now = Date.now();
        const updatedRemotePlayers: RemotePlayerSyncState[] = [];

        snapshot.forEach((docSnap) => {
          if (docSnap.id === myUid) return; // Skip local player

          const data = docSnap.data() as RemotePlayerSyncState;
          // Filter out stale player states (e.g. inactive > 8 seconds)
          if (now - (data.lastUpdated || 0) < 8000) {
            this.remotePlayersMap.set(docSnap.id, data);
            updatedRemotePlayers.push(data);
          } else {
            this.remotePlayersMap.delete(docSnap.id);
          }
        });

        if (this.onRemotePlayersChange) {
          this.onRemotePlayersChange(updatedRemotePlayers);
        }
      },
      (err) => {
        console.warn('Real-time match sync snapshot error:', err);
      }
    );

    this.notifyNetworkQuality();
  }

  public sendLocalPlayerState(player: CharacterState) {
    if (!this.currentRoomCode) return;

    const now = Date.now();
    const effectiveInterval = this.consecutiveErrors > 0 
      ? Math.min(2000, this.writeIntervalMs * Math.pow(2, this.consecutiveErrors))
      : this.writeIntervalMs;

    if (now - this.lastWriteTime < effectiveInterval) {
      return; // Throttled to preserve quota and avoid network congestion
    }

    const myUid = this.getMyUid();
    const startTime = performance.now();
    const playerDocRef = doc(db, 'matches', this.currentRoomCode, 'players', myUid);

    const payload: RemotePlayerSyncState = {
      uid: myUid,
      name: player.name || 'مقاتل',
      x: Math.round(player.x),
      y: Math.round(player.y),
      vx: Math.round(player.vx),
      vy: Math.round(player.vy),
      aimAngle: Number(player.aimAngle.toFixed(2)),
      health: Math.round(player.health),
      maxHealth: player.maxHealth,
      fuel: Math.round(player.fuel),
      maxFuel: player.maxFuel,
      currentWeapon: player.weapons[player.currentWeaponIndex] || 'pistol',
      isJetpacking: !!player.isJetpacking,
      isDead: !!player.isDead,
      camoColor: player.camoColor || '#15803d',
      kills: player.kills || 0,
      deaths: player.deaths || 0,
      team: player.team || 'ffa',
      lastUpdated: now,
    };

    this.lastWriteTime = now;

    setDoc(playerDocRef, payload, { merge: true })
      .then(() => {
        this.consecutiveErrors = 0;
        const roundTripMs = Math.round(performance.now() - startTime);
        this.recordPing(roundTripMs);
      })
      .catch((err) => {
        this.consecutiveErrors = Math.min(5, this.consecutiveErrors + 1);
        this.recordPing(300); // Mark elevated latency on error
      });
  }

  private recordPing(sampleMs: number) {
    // Clamp ping value realistically for UI
    const clampedPing = Math.max(15, Math.min(600, sampleMs));
    this.pingHistory.push(clampedPing);
    if (this.pingHistory.length > 5) {
      this.pingHistory.shift();
    }
    this.pingMs = Math.round(
      this.pingHistory.reduce((a, b) => a + b, 0) / this.pingHistory.length
    );
    this.notifyNetworkQuality();
  }

  public getNetworkQuality(): NetworkQualityInfo {
    if (!this.isOnline) {
      return {
        pingMs: 999,
        isOnline: false,
        status: 'offline',
        labelAr: 'غير متصل بالإنترنت ❌',
        qualityPercent: 0,
      };
    }

    if (this.pingMs < 65) {
      return {
        pingMs: this.pingMs,
        isOnline: true,
        status: 'excellent',
        labelAr: 'تزامن ممتاز ⚡',
        qualityPercent: 100,
      };
    } else if (this.pingMs < 140) {
      return {
        pingMs: this.pingMs,
        isOnline: true,
        status: 'good',
        labelAr: 'تزامن مستقر ✓',
        qualityPercent: 80,
      };
    } else {
      return {
        pingMs: this.pingMs,
        isOnline: true,
        status: 'laggy',
        labelAr: 'بطء في المزامنة ⚠️',
        qualityPercent: 40,
      };
    }
  }

  private notifyNetworkQuality() {
    if (this.onNetworkQualityChange) {
      this.onNetworkQualityChange(this.getNetworkQuality());
    }
  }

  public async stopMatchSync() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }

    if (this.currentRoomCode) {
      const myUid = this.getMyUid();
      try {
        const playerDocRef = doc(db, 'matches', this.currentRoomCode, 'players', myUid);
        await deleteDoc(playerDocRef);
      } catch (e) {
        // Ignore exit errors
      }
      this.currentRoomCode = null;
    }

    this.remotePlayersMap.clear();
  }
}

export const matchSyncManager = new MatchSyncManager();
