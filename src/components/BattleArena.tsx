import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Pause,
  LogOut,
  Eye,
  Crosshair,
  Volume2,
  VolumeX,
  Target,
  Zap,
  Shield,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import { GameEngine, GameEngineEvents } from '../game/gameEngine';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { LiveMatchLeaderboard } from './LiveMatchLeaderboard';
import { InGame3DPauseModal } from './InGame3DPauseModal';
import { TacticalHologram3DWheel } from './TacticalHologram3DWheel';
import { GameOverModal } from './GameOverModal';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';
import { statsManager } from '../utils/statsManager';
import { playerStatsManager } from '../utils/playerStatsManager';
import { soldierProgressionManager } from '../utils/soldierProgressionManager';
import { matchSyncManager } from '../utils/matchSyncManager';
import { haptics } from '../utils/haptics';
import { GameMode, PlayerCustomization, GameSettings, CharacterState, KillFeedItem, NearbyWeaponInfo } from '../types';

interface BattleArenaProps {
  mode?: GameMode;
  isSpectator?: boolean;
  arenaTitle?: string;
  roomCode?: string;
  onQuit: () => void;
  customization?: Partial<PlayerCustomization>;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  mode = 'deathmatch',
  isSpectator = false,
  arenaTitle = 'حلبة البؤرة (Outpost)',
  roomCode = 'arena_global_match',
  onQuit,
  customization,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [activeEngine, setActiveEngine] = useState<GameEngine | null>(null);

  // Modal states
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTacticalWheelOpen, setIsTacticalWheelOpen] = useState(false);

  // Spectator / Camera toggle state
  const [spectatorMode, setSpectatorMode] = useState(isSpectator);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);

  // Nearby weapon on ground state
  const [nearbyWeapon, setNearbyWeapon] = useState<NearbyWeaponInfo | null>(null);

  // Game over state cache
  const [gameOverData, setGameOverData] = useState<{
    isVictory: boolean;
    score: number;
    kills: number;
    deaths: number;
    wave?: number;
    mvpName?: string;
    mvpKills?: number;
    allPlayersStats?: Array<{
      id: string;
      name: string;
      kills: number;
      deaths: number;
      damageDealt: number;
      headshots: number;
      maxKillStreak: number;
      camoColor: string;
      isPlayer: boolean;
      team: string;
    }>;
  }>({
    isVictory: false,
    score: 0,
    kills: 0,
    deaths: 0,
  });

  // Reactive HUD states
  const [playerState, setPlayerState] = useState<CharacterState | null>(null);
  const [matchInfo, setMatchInfo] = useState<{
    timer: number;
    blueScore: number;
    redScore: number;
    playerKills: number;
    playerDeaths: number;
    wave: number;
    mode: string;
    activePlayerIndex?: number;
    players?: Array<{
      id: string;
      name: string;
      kills: number;
      deaths: number;
      health: number;
      maxHealth: number;
      fuel: number;
      camo?: string;
      isPlayer: boolean;
    }>;
  }>({
    timer: 180,
    blueScore: 0,
    redScore: 0,
    playerKills: 0,
    playerDeaths: 0,
    wave: 1,
    mode,
  });
  const [killFeed, setKillFeed] = useState<KillFeedItem[]>([]);
  const [scopeLevel, setScopeLevel] = useState<number>(1);
  const [shotsFiredCount, setShotsFiredCount] = useState(0);

  // Dynamic player customization from settingsManager
  const savedSettings = settingsManager.getSettings();

  const getCamoHexFromSkinId = (skinId?: string) => {
    switch (skinId) {
      case 'desert_camo': return '#9a7b4f';
      case 'urban_digital': return '#374151';
      case 'stealth_black': return '#111827';
      case 'navy_seal': return '#1e3a8a';
      case 'cyber_cyan': return '#0891b2';
      case 'royal_gold': return '#ca8a04';
      case 'pharaoh_suit': return '#eab308';
      case 'tesla_suit': return '#0ea5e9';
      case 'ninja_suit': return '#09090b';
      case 'joker_suit': return '#701a75';
      case 'ghillie_suit': return '#14532d';
      case 'woodland_camo':
      default: return '#2d4a22';
    }
  };

  const activeCustomization: PlayerCustomization = {
    skinId: customization?.skinId || savedSettings.equippedSkin || 'woodland_camo',
    camoColor: customization?.camoColor || getCamoHexFromSkinId(savedSettings.equippedSkin),
    headgear: customization?.headgear || savedSettings.equippedHeadgear || 'camo_helmet',
    bodyArmor: customization?.bodyArmor || savedSettings.equippedArmor || 'molle_vest',
    eyewear: customization?.eyewear || savedSettings.equippedEyewear || 'aviators',
    beard: customization?.beard || savedSettings.equippedBeard || 'stubble',
    jetpackStyle: customization?.jetpackStyle || savedSettings.equippedJetpack || 'military_dual',
    trailColor: customization?.trailColor || savedSettings.equippedTrail || 'neon_purple',
    skinTone: customization?.skinTone || '#fbb587',
    sunglasses: customization?.sunglasses ?? true,
    playerName: customization?.playerName || savedSettings.playerName || 'العقيد صخر (أنت)',
    charAvatarIndex: customization?.charAvatarIndex || 1,
    primaryWeapon: (savedSettings.equippedPrimaryWeapon as any) || 'sniper',
    secondaryWeapon: (savedSettings.equippedSecondaryWeapon as any) || 'dual_uzi',
    gltfModelUrl: customization?.gltfModelUrl || savedSettings.gltfModelUrl,
    skills: customization?.skills || soldierProgressionManager.getProgression().skills,
  };

  const activeSettings: GameSettings = {
    language: savedSettings.language || 'ar',
    soundVolume: savedSettings.soundVolume ?? 90,
    musicVolume: savedSettings.musicVolume ?? 65,
    haptics: savedSettings.haptics ?? true,
    autoFire: savedSettings.fireMode === 'dual',
    aimAssist: savedSettings.aimAssist ?? true,
    joystickFixed: false,
  };

  // Initialize and run the GameEngine
  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;

    // Cleanup previous engine if restarting
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
      setActiveEngine(null);
    }

    const events: GameEngineEvents = {
      onKillFeed: (item: KillFeedItem) => {
        setKillFeed((prev) => [item, ...prev].slice(0, 5));
      },
      onGameOver: (
        isVictory: boolean,
        score: number,
        kills: number,
        deaths: number,
        headshots: number,
        maxStreak: number,
        damage: number,
        mvpName?: string,
        mvpKills?: number,
        allPlayersStats?: Array<{
          id: string;
          name: string;
          kills: number;
          deaths: number;
          damageDealt: number;
          headshots: number;
          maxKillStreak: number;
          camoColor: string;
          isPlayer: boolean;
          team: string;
        }>
      ) => {
        const accuracy = Math.min(95, Math.max(45, Math.round((kills * 12) / Math.max(1, kills * 12 + 10) * 100)));
        
        // Save stats to both lifetime and ballistic dashboard managers
        try {
          statsManager.recordMatch({
            mode,
            kills,
            deaths,
            headshots,
            maxStreak,
            damage,
            isVictory,
            score,
            wave: 1,
          });

          playerStatsManager.recordSimulatedMatch(isVictory, accuracy, kills, deaths);

          // Award match completion XP to the soldier
          const matchXP = (isVictory ? 500 : 200) + (kills * 50) + (headshots * 30);
          soldierProgressionManager.addXP(matchXP, isVictory ? 'نصر عسكري ساحق' : 'مشاركة قتالية');
        } catch (e) {
          console.error('Error saving match stats:', e);
        }

        setGameOverData({
          isVictory,
          score,
          kills,
          deaths,
          wave: 1,
          mvpName: mvpName || (isVictory ? activeCustomization.playerName : 'الشبح (Ghost)'),
          mvpKills: mvpKills || (isVictory ? kills : Math.max(kills + 2, 7)),
          allPlayersStats,
        });
        setIsGameOver(true);

        if (isVictory) {
          soundManager.playVictory();
        }
      },
    };

    const engine = new GameEngine(
      canvasRef.current,
      mode,
      activeCustomization,
      activeSettings,
      events
    );

    // Initial resize to match full window viewport
    const width = Math.max(320, window.innerWidth || containerRef.current?.clientWidth || 800);
    const height = Math.max(240, window.innerHeight || containerRef.current?.clientHeight || 600);
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
    engine.resize(width, height);

    if (spectatorMode) {
      // Allow spectator by unbinding player lock and showing player 0 or 1
      engine.setActivePlayerIndex(0);
    }

    // Enable 3D Three.js environment renderer for full 3D interactive map
    if (containerRef.current) {
      engine.enable3DRenderer(containerRef.current);
    }

    engine.start();
    engineRef.current = engine;
    setActiveEngine(engine);
    setIsPaused(false);
    setIsGameOver(false);
  }, [mode, spectatorMode]);

  // Lock background body scroll while active in arena
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Handle resizing and mobile orientation changes
  useEffect(() => {
    const handleResize = () => {
      if (!engineRef.current) return;
      const w = Math.max(320, window.innerWidth);
      const h = Math.max(240, window.innerHeight);
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;
      }
      engineRef.current.resize(w, h);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Initialize game and real-time multiplayer sync on mount
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      initEngine();
    });

    // Connect real-time match sync listener
    matchSyncManager.startMatchSync(
      roomCode,
      activeCustomization.playerName,
      activeCustomization.camoColor,
      (remotePlayers) => {
        if (engineRef.current) {
          engineRef.current.syncRemotePlayers(remotePlayers);
        }
      }
    );

    return () => {
      cancelAnimationFrame(frameId);
      matchSyncManager.stopMatchSync();
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
        setActiveEngine(null);
      }
    };
  }, [initEngine, roomCode]);

  // Track previous states with refs to eliminate redundant React re-renders
  const lastPlayerSyncRef = useRef<{
    health: number;
    maxHealth: number;
    fuel: number;
    weaponKey: string;
    ammoCount: number;
    grenades: number;
    isReloading: boolean;
    isDead: boolean;
    kills: number;
    deaths: number;
  } | null>(null);

  const lastMatchSyncRef = useRef<{
    timerSec: number;
    blueScore: number;
    redScore: number;
    wave: number;
    activePlayerIdx?: number;
    playerCount: number;
  } | null>(null);

  const lastNearbyPickupIdRef = useRef<number | null>(null);
  const lastScopeLevelRef = useRef<number>(1);
  const lastNetworkBroadcastTimeRef = useRef<number>(0);

  // Sync state from engine to React HUD (optimized RAF ticker with diff checking)
  useEffect(() => {
    let animId: number;
    let lastTick = 0;

    const syncTick = (time: number) => {
      if (engineRef.current && !isPaused && !isGameOver) {
        // Run HUD diff-check at ~30 FPS
        if (time - lastTick >= 33) {
          lastTick = time;
          const currentP = engineRef.current.getPlayerState();

          if (currentP) {
            // Throttled Network Broadcast (~8-10 times per second)
            if (time - lastNetworkBroadcastTimeRef.current >= 120) {
              lastNetworkBroadcastTimeRef.current = time;
              try {
                matchSyncManager.sendLocalPlayerState(currentP);
              } catch {
                // Gracefully ignore transient sync errors
              }
            }

            // Check if player stats changed before dispatching React state
            const currWeapon = currentP.weapons[currentP.currentWeaponIndex] || 'pistol';
            const currAmmo = currentP.ammo[currWeapon] ?? 0;
            const prev = lastPlayerSyncRef.current;

            const hasPlayerChanged =
              !prev ||
              prev.health !== currentP.health ||
              prev.maxHealth !== currentP.maxHealth ||
              Math.floor(prev.fuel) !== Math.floor(currentP.fuel) ||
              prev.weaponKey !== currWeapon ||
              prev.ammoCount !== currAmmo ||
              prev.grenades !== currentP.grenades ||
              prev.isReloading !== currentP.isReloading ||
              prev.isDead !== currentP.isDead ||
              prev.kills !== currentP.kills ||
              prev.deaths !== currentP.deaths;

            if (hasPlayerChanged) {
              lastPlayerSyncRef.current = {
                health: currentP.health,
                maxHealth: currentP.maxHealth,
                fuel: currentP.fuel,
                weaponKey: currWeapon,
                ammoCount: currAmmo,
                grenades: currentP.grenades,
                isReloading: currentP.isReloading,
                isDead: currentP.isDead,
                kills: currentP.kills,
                deaths: currentP.deaths,
              };
              setPlayerState({ ...currentP });
            }
          }

          // Check match info diff
          const mInfo = engineRef.current.getMatchInfo();
          if (mInfo) {
            const timerSec = Math.floor(mInfo.timer);
            const prevM = lastMatchSyncRef.current;
            const pCount = mInfo.players ? mInfo.players.length : 0;

            const hasMatchChanged =
              !prevM ||
              prevM.timerSec !== timerSec ||
              prevM.blueScore !== mInfo.blueScore ||
              prevM.redScore !== mInfo.redScore ||
              prevM.wave !== mInfo.wave ||
              prevM.activePlayerIdx !== mInfo.activePlayerIndex ||
              prevM.playerCount !== pCount;

            if (hasMatchChanged) {
              lastMatchSyncRef.current = {
                timerSec,
                blueScore: mInfo.blueScore,
                redScore: mInfo.redScore,
                wave: mInfo.wave,
                activePlayerIdx: mInfo.activePlayerIndex,
                playerCount: pCount,
              };
              setMatchInfo(mInfo);
            }
          }

          // Check scope diff
          const currScope = engineRef.current.scopeLevel;
          if (currScope !== lastScopeLevelRef.current) {
            lastScopeLevelRef.current = currScope;
            setScopeLevel(currScope);
          }

          // Check nearby weapon pickup diff
          const nb = engineRef.current.getNearbyWeaponPickup();
          const newPickupId = nb ? nb.pickupId : null;
          if (newPickupId !== lastNearbyPickupIdRef.current) {
            lastNearbyPickupIdRef.current = newPickupId;
            setNearbyWeapon(nb);
          }
        }
      }
      animId = requestAnimationFrame(syncTick);
    };

    animId = requestAnimationFrame(syncTick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isGameOver]);

  // Keyboard shortcut for Quick Ground Weapon Swap [F], Tactical Hologram Wheel [T], and Drop Weapon [Z / X]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        if (engineRef.current && !isPaused && !isGameOver) {
          const didSwap = engineRef.current.swapWithNearbyWeapon();
          if (didSwap) {
            haptics.medium();
          }
        }
      } else if (e.code === 'KeyZ' || e.code === 'KeyX') {
        if (engineRef.current && !isPaused && !isGameOver) {
          engineRef.current.dropPlayerWeapon();
        }
      } else if (e.code === 'KeyT' || e.code === 'KeyQ') {
        if (!isGameOver) {
          setIsTacticalWheelOpen(prev => !prev);
          soundManager.playButtonClick();
          haptics.light();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver]);

  // Handlers for HUD actions with tactical haptics (stabilized with useCallback)
  const handlePause = useCallback(() => {
    soundManager.playButtonClick();
    haptics.light();
    if (engineRef.current) {
      engineRef.current.setPaused(true);
    }
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    soundManager.playButtonClick();
    haptics.light();
    if (engineRef.current) {
      engineRef.current.setPaused(false);
    }
    setIsPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    soundManager.playButtonClick();
    haptics.medium();
    initEngine();
  }, [initEngine]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      return next;
    });
    haptics.light();
  }, []);

  const handleSwitchWeapon = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.switchPlayerWeapon();
    }
  }, []);

  const handleDropWeapon = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.dropPlayerWeapon();
    }
  }, []);

  const handleSwapWeapon = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.swapWithNearbyWeapon();
    }
  }, []);

  const handleReload = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.reloadPlayer();
    }
  }, []);

  const handleToggleScope = useCallback(() => {
    haptics.light();
    if (engineRef.current) {
      const nextLevel = engineRef.current.cycleScopeLevel();
      setScopeLevel(nextLevel);
    }
  }, []);

  const handleSelectPlayer = useCallback((idx: number) => {
    if (engineRef.current) {
      soundManager.playButtonClick();
      haptics.light();
      engineRef.current.setActivePlayerIndex(idx);
      setSelectedPlayerIdx(idx);
    }
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      id="battle-arena-container"
      className="fixed inset-0 z-[9999] bg-[#0a110c] overflow-hidden select-none flex flex-col items-center justify-center touch-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 9999,
      }}
    >
      {/* Real 2D Canvas */}
      <canvas
        ref={canvasRef}
        id="battle-canvas"
        className="w-full h-full block bg-[#0a110c] cursor-crosshair"
      />

      {/* Top Header Quick-Bar for Match Navigation */}
      <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none z-40">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Exit / Back Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              if (engineRef.current) {
                engineRef.current.stop();
              }
              onQuit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/85 hover:bg-neutral-800 text-rose-300 hover:text-rose-200 border border-neutral-700/80 backdrop-blur-md shadow-lg font-black text-xs active:scale-95 transition-all cursor-pointer"
            title="مغادرة المعركة والعودة للقائمة الرئيسية"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">إنهاء وخروج</span>
          </button>
        </div>

        {/* Tactical Spectator / Player Switcher Strip */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {spectatorMode && matchInfo.players && (
            <div className="hidden md:flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-xl border border-cyan-500/40">
              <Eye size={14} className="text-cyan-400 ml-1" />
              <span className="text-[10px] text-cyan-300 font-bold ml-1">الكاميرا:</span>
              {matchInfo.players.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlayer(idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    matchInfo.activePlayerIndex === idx
                      ? 'bg-cyan-500 text-black shadow-sm font-black'
                      : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Sound Mute Quick Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/80 backdrop-blur-md shadow-lg active:scale-95 transition-all"
            title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={handlePause}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black border border-amber-400 backdrop-blur-md shadow-lg font-black active:scale-95 transition-all"
            title="إيقاف مؤقت"
          >
            <Pause size={15} className="fill-black" />
          </button>
        </div>
      </div>

      {/* Main HUD overlay */}
      <HUD
        player={playerState}
        scopeLevel={scopeLevel}
        onToggleScope={handleToggleScope}
        matchInfo={matchInfo}
        killFeed={killFeed}
        onPause={handlePause}
        onReload={handleReload}
        onSwitchWeapon={handleSwitchWeapon}
        onDropWeapon={handleDropWeapon}
        onSwapWeapon={handleSwapWeapon}
        nearbyWeapon={nearbyWeapon}
        onSelectPlayer={handleSelectPlayer}
        onOpenTacticalWheel={() => {
          soundManager.playButtonClick();
          haptics.light();
          setIsTacticalWheelOpen(true);
        }}
      />

      {/* Dual Joystick & Touch / Keyboard Controls */}
      <TouchControls
        engine={activeEngine}
        onPause={handlePause}
        grenadesCount={playerState?.grenades ?? 2}
      />

      {/* 3D Holographic In-Game Tactical Weapon & Boost Wheel */}
      <TacticalHologram3DWheel
        isOpen={isTacticalWheelOpen}
        onClose={() => setIsTacticalWheelOpen(false)}
        currentWeapon={playerState?.weapons[playerState?.currentWeaponIndex || 0] || 'pistol'}
        secondaryWeapon={playerState?.weapons[1]}
        health={playerState?.health || 100}
        maxHealth={playerState?.maxHealth || 100}
        fuel={playerState?.fuel || 100}
        onSelectWeapon={(w) => {
          if (engineRef.current) {
            engineRef.current.setPlayerWeaponDirectly(w);
          }
        }}
        onUseTacticalBoost={(type) => {
          if (engineRef.current) {
            engineRef.current.applyTacticalBoost(type);
          }
        }}
      />

      {/* In-Game 3D Pause Modal with interactive 3D ThreeSoldierCanvas preview */}
      <InGame3DPauseModal
        isOpen={isPaused}
        player={playerState}
        onResume={handleResume}
        onRestart={handleRestart}
        onQuit={() => {
          if (engineRef.current) {
            engineRef.current.stop();
          }
          onQuit();
        }}
      />

      {/* Game Over Modal */}
      {isGameOver && (
        <GameOverModal
          isVictory={gameOverData.isVictory}
          score={gameOverData.score}
          kills={gameOverData.kills}
          deaths={gameOverData.deaths}
          mode={mode}
          wave={gameOverData.wave}
          mvpName={gameOverData.mvpName}
          mvpKills={gameOverData.mvpKills}
          allPlayersStats={gameOverData.allPlayersStats}
          onRestart={handleRestart}
          onQuit={() => {
            if (engineRef.current) {
              engineRef.current.stop();
            }
            onQuit();
          }}
        />
      )}
    </div>,
    document.body
  );
};

export default BattleArena;
