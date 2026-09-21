import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Flame,
  Pause,
  Bomb,
  RotateCcw,
  Zap,
  ShieldAlert,
  Target,
  Crosshair,
  ArrowDownToLine,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { CharacterState, KillFeedItem, WeaponType, NearbyWeaponInfo } from '../types';
import { WEAPON_CONFIGS } from '../game/weapons';
import { WeaponSpriteSVG } from '../game/weaponSprites';
import { settingsManager } from '../utils/settingsManager';
import { NetworkStatusBadge } from './NetworkStatusBadge';

interface HUDProps {
  player: CharacterState | null;
  scopeLevel?: number;
  onToggleScope?: () => void;
  matchInfo: {
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
  };
  killFeed: KillFeedItem[];
  onPause: () => void;
  onReload: () => void;
  onSwitchWeapon: () => void;
  onDropWeapon?: () => void;
  onSwapWeapon?: () => void;
  nearbyWeapon?: NearbyWeaponInfo | null;
  onSelectPlayer?: (index: number) => void;
  onOpenTacticalWheel?: () => void;
}

export const HUD: React.FC<HUDProps> = React.memo(({
  player,
  scopeLevel = 1,
  onToggleScope,
  matchInfo,
  killFeed,
  onPause,
  onReload,
  onSwitchWeapon,
  onDropWeapon,
  onSwapWeapon,
  nearbyWeapon,
  onSelectPlayer,
  onOpenTacticalWheel,
}) => {
  const [announcerMsg, setAnnouncerMsg] = React.useState<{ text: string, color: string, id: number } | null>(null);
  const [showScoreboard, setShowScoreboard] = React.useState(false);
  const [showMiniLeaderboard, setShowMiniLeaderboard] = React.useState(false);
  const [isLandscapeMode, setIsLandscapeMode] = React.useState<boolean>(
    settingsManager.getSettings().isLandscapeMode === true
  );
  const [isHoloHUD, setIsHoloHUD] = React.useState<boolean>(settingsManager.getSettings().holographicHUD !== false);

  React.useEffect(() => {
    const unsub = settingsManager.subscribe((s) => {
      setIsLandscapeMode(s.isLandscapeMode === true);
    });
    return unsub;
  }, []);

  const toggleHoloHUD = () => {
    const current = settingsManager.getSettings().holographicHUD !== false;
    settingsManager.updateSettings({ holographicHUD: !current });
    setIsHoloHUD(!current);
  };

  const sortedPlayers = React.useMemo(() => {
    if (!matchInfo.players) return [];
    return [...matchInfo.players].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  }, [matchInfo.players]);

  React.useEffect(() => {
    if (!player) return;
    
    // Check if multiKillCount or killStreak changed significantly to trigger an announcement
    if (player.multiKillCount > 1) {
      let text = 'DOUBLE KILL!';
      let color = 'text-yellow-400';
      if (player.multiKillCount === 3) { text = 'TRIPLE KILL!'; color = 'text-orange-500'; }
      if (player.multiKillCount >= 4) { text = 'MONSTER KILL!'; color = 'text-red-500'; }
      setAnnouncerMsg({ text, color, id: Date.now() });
    } else if (player.killStreak === 5 || player.killStreak === 10 || (player.killStreak >= 15 && player.killStreak % 5 === 0)) {
       let text = 'RAMPAGE!';
       let color = 'text-purple-500';
       if (player.killStreak === 10) { text = 'UNSTOPPABLE!'; color = 'text-fuchsia-500'; }
       if (player.killStreak >= 15) { text = 'GODLIKE!'; color = 'text-rose-600'; }
       setAnnouncerMsg({ text, color, id: Date.now() });
    }
  }, [player?.multiKillCount, player?.killStreak]);

  React.useEffect(() => {
    if (announcerMsg) {
      const timer = setTimeout(() => setAnnouncerMsg(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [announcerMsg?.id]);

  // --- KILLING SPREE ALERTS ---
  const [spreeAlert, setSpreeAlert] = React.useState<{weapon: WeaponType, count: number, id: number} | null>(null);

  // --- WEAPON SWITCH & PICKUP ANIMATION STATE ---
  const [switchAlert, setSwitchAlert] = React.useState<{
    weapon: WeaponType;
    isPickup: boolean;
    id: number;
  } | null>(null);
  const prevWeaponRef = React.useRef<WeaponType | null>(null);

  // المتغيرات المشتقة من اللاعب
  const currWeapon = player?.weapons[player?.currentWeaponIndex] || 'pistol';

  React.useEffect(() => {
    if (!player) return;
    const currentWep = player.weapons[player.currentWeaponIndex] || 'pistol';
    
    if (prevWeaponRef.current && prevWeaponRef.current !== currentWep) {
      const isPickup = player.weapons.includes(currentWep) && prevWeaponRef.current !== currentWep;
      setSwitchAlert({
        weapon: currentWep,
        isPickup: isPickup,
        id: Date.now(),
      });
    }
    prevWeaponRef.current = currentWep;
  }, [player?.currentWeaponIndex, player?.weapons]);

  React.useEffect(() => {
    if (switchAlert) {
      const timer = setTimeout(() => {
        setSwitchAlert(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [switchAlert?.id]);

  React.useEffect(() => {
    if (player && player.killStreak > 2 && player.killStreak % 3 === 0) {
      setSpreeAlert({ weapon: currWeapon, count: player.killStreak, id: Date.now() });
    }
  }, [player?.killStreak, currWeapon]);
  
  if (!player) return null;

  const currCfg = WEAPON_CONFIGS[currWeapon];
  const currentAmmo = player.ammo[currWeapon] ?? 0;
  const reserveAmmo = player.reserveAmmo[currWeapon] ?? 0;

  const nextWeapon = player.weapons.length > 1
    ? player.weapons[(player.currentWeaponIndex + 1) % player.weapons.length]
    : null;

  // Format timer MM:SS
  const mins = Math.floor(matchInfo.timer / 60);
  const secs = matchInfo.timer % 60;
  const timerStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const renderWeaponIcon = (id: WeaponType, className?: string) => {
    return <WeaponSpriteSVG weapon={id} className={className || "w-8 h-6"} />;
  };

  // Render a single kill feed item
  const renderKillFeedItem = (item: KillFeedItem) => {
    const killerName = item.isKillerBot ? `[BOT] ${item.killerName}` : item.killerName;
    const victimName = item.isVictimBot ? `[BOT] ${item.victimName}` : item.victimName;
    const style = settingsManager.getSettings().killFeedIconStyle;

    let containerStyle = "flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 text-[9px] mb-0.5 shadow-sm opacity-80";
    let killerStyle = `${item.isKillerBot ? 'text-neutral-400' : 'text-sky-400'} font-bold`;
    let victimStyle = `${item.isVictimBot ? 'text-neutral-400' : 'text-rose-400'} font-bold`;
    let iconStyle = "w-3 h-2 text-white";

    if (style === 'bold') {
      containerStyle += " border-white/20";
    } else if (style === 'neon') {
      containerStyle += " border-cyan-500/30 shadow-[0_0_4px_rgba(6,182,212,0.2)]";
      killerStyle = "text-cyan-300 font-bold";
      iconStyle = "w-4 h-3 text-cyan-300";
    } else if (style === 'minimalist') {
      containerStyle = "flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] mb-0.5 opacity-80";
      killerStyle = "text-neutral-400 font-bold";
      victimStyle = "text-neutral-500 font-bold";
      iconStyle = "w-3 h-2 text-neutral-400";
    }
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={containerStyle}
      >
        <span className={killerStyle}>{killerName}</span>
        <div className="flex items-center gap-1 opacity-90">
          <WeaponSpriteSVG weapon={item.weapon as WeaponType} className={iconStyle} />
        </div>
        <span className={victimStyle}>{victimName}</span>
      </motion.div>
    );
  };

  return (
    <div id="game-hud-layer" className="absolute inset-0 pointer-events-none p-3 select-none flex flex-col justify-between z-20">
      
      {/* KILLING SPREE ALERTS (Top Right) */}
      <div className="absolute top-16 right-3 z-30">
        <AnimatePresence>
          {spreeAlert && (
            <motion.div
              key={spreeAlert.id}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-neutral-900/90 border-2 border-amber-500 rounded-xl p-3 flex items-center gap-3 shadow-2xl mb-2"
            >
              <div className="flex flex-col items-center">
                <span className="text-amber-400 font-black text-xs uppercase tracking-tighter">Spreé!</span>
                <span className="text-white font-black text-lg">{spreeAlert.count}</span>
              </div>
              <WeaponSpriteSVG weapon={spreeAlert.weapon} className="w-10 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* JETPACK FUEL SCREEN OVERLAY (PULSING RED WHEN LOW) */}
      <AnimatePresence>
        {player.isJetpacking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: player.fuel < 20 ? 0.35 : 0.15 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 pointer-events-none transition-colors duration-300 z-0 ${
              player.fuel < 20 ? 'bg-red-500/30' : 'bg-blue-500/10'
            }`}
            style={{
              boxShadow: player.fuel < 20 
                ? 'inset 0 0 100px rgba(239, 68, 68, 0.6)' 
                : 'inset 0 0 60px rgba(37, 99, 235, 0.3)'
            }}
          />
        )}
      </AnimatePresence>

      {/* SCOPE SNIPER BLACK VIGNETTE OVERLAY */}
      {scopeLevel > 1 && (
        <div
          id="scope-vignette-overlay"
          className="absolute inset-0 pointer-events-none transition-all duration-300 z-0"
          style={{
            background: `radial-gradient(circle, rgba(0,0,0,0) ${scopeLevel === 2 ? '42%' : '26%'}, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.94) 86%)`,
          }}
        />
      )}
      {/* CENTER SCREEN ANNOUNCER */}
      {announcerMsg && (
        <div key={announcerMsg.id} className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`text-5xl md:text-7xl font-black italic tracking-widest uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${announcerMsg.color} animate-bounce`} style={{
            WebkitTextStroke: '2px black',
            animation: 'zoomInOut 2.5s ease-in-out forwards'
          }}>
            {announcerMsg.text}
          </div>
          <style>{`
            @keyframes zoomInOut {
              0% { transform: scale(0.5); opacity: 0; }
              15% { transform: scale(1.2); opacity: 1; }
              30% { transform: scale(1); opacity: 1; }
              80% { transform: scale(1); opacity: 1; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* TOP BAR: Exact Mini Militia Classic Layout matching reference screenshot */}
      <div className="flex items-start justify-between w-full">
        {/* TOP LEFT: Scope Button + Classic Health/Fuel Trapezoid Gauge + Pause Circle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Scope Zoom Circle (Far Top Left as in screenshot) */}
          <button
            onClick={onToggleScope}
            className="w-9 h-9 rounded-full border-2 border-neutral-500 bg-neutral-300 text-neutral-900 font-black shadow-md cursor-pointer hover:bg-neutral-400 active:scale-95 transition-all flex flex-col items-center justify-center relative transform -skew-x-12"
            title="تغيير المنظور (Scope)"
          >
            <span className="text-[7px] text-neutral-600 font-sans tracking-tighter leading-none transform skew-x-12">SCOPE</span>
            <span className="text-[10px] font-black leading-none transform skew-x-12">{scopeLevel}x</span>
          </button>

          {/* Mini Militia Classic Health & Boost Bar Container */}
          <div className="bg-neutral-300/85 border-2 border-neutral-500 p-1.5 px-2.5 shadow-md flex flex-col gap-1 min-w-[130px] max-w-[150px] transform -skew-x-12 rounded-lg relative">
            {/* Health Bar (Purple like original) */}
            <div className="flex items-center gap-1 transform skew-x-12">
              <span className="text-[9px] shrink-0 font-bold">❤️</span>
              <div className="flex-1 bg-neutral-600/40 rounded-full h-2 p-0.5 border border-neutral-500 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-purple-600 shadow-[0_0_6px_rgba(147,51,234,0.6)]"
                  style={{ width: `${Math.max(0, Math.min(100, player.health))}%` }}
                />
              </div>
            </div>

            {/* Boost Bar (Blue like original) */}
            <div className="flex items-center gap-1 transform skew-x-12">
              <span className="text-[9px] shrink-0 font-bold">⚡</span>
              <div className="flex-1 bg-neutral-600/40 rounded-full h-1.5 p-0.5 border border-neutral-500 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-75 bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.6)]"
                  style={{ width: `${Math.max(0, Math.min(100, player.fuel))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Circular Pause Button */}
          <button
            id="btn-pause-game"
            onClick={onPause}
            className="w-7 h-7 rounded-full bg-neutral-300 border-2 border-neutral-500 text-neutral-900 flex items-center justify-center hover:bg-neutral-400 active:scale-95 shadow-md cursor-pointer transform -skew-x-12 -ml-2 z-10"
            title="إيقاف مؤقت"
          >
            <span className="text-[10px] font-black transform skew-x-12">⏸</span>
          </button>
        </div>

        {/* TOP CENTER: Match Timer (Exact match with screenshot 05:49) */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="flex items-center gap-1 bg-neutral-300/85 border-2 border-neutral-500 rounded-md px-3 py-0.5 shadow-md pointer-events-auto cursor-pointer transition-all active:scale-95 transform -skew-x-12"
            title="انقر لفتح لوحة الصدارة"
          >
            <span className="text-neutral-900 font-mono font-black text-xs transform skew-x-12">{timerStr}</span>
          </button>
        </div>

        {/* TOP RIGHT: Metallic Trapezoid Weapon HUD, Drop Button & Grenade Icon (Exact match with screenshot) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Drop Weapon Button (زر رمي السلاح 🗑️) */}
          <button
            id="btn-hud-drop-weapon"
            onClick={(e) => {
              e.stopPropagation();
              onDropWeapon?.();
            }}
            className="h-8 px-2.5 rounded-lg bg-neutral-300/90 hover:bg-red-500 hover:text-white border-2 border-neutral-500 text-neutral-900 shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-90 transform -skew-x-12 group"
            title="رمي السلاح الحالي (Z / G)"
          >
            <div className="transform skew-x-12 flex items-center gap-1">
              <ArrowDownToLine size={13} className="text-red-600 group-hover:text-white transition-colors" />
              <span className="text-[10px] font-black font-sans leading-none">رمي</span>
              <span className="text-[8px] font-mono opacity-60 bg-black/10 group-hover:bg-white/20 px-1 rounded">[Z]</span>
            </div>
          </button>

          <div
            onClick={onSwitchWeapon}
            className="bg-neutral-300/90 border-2 border-neutral-500 px-3 py-1 shadow-md flex items-center gap-3 cursor-pointer transform -skew-x-12 rounded-lg hover:scale-105 active:scale-95 transition-all"
            title="انقر لتبديل السلاح"
          >
            {/* Current Ammo */}
            <div className="transform -skew-x-12 flex items-baseline gap-1 font-mono text-neutral-900">
              <span className="text-xs font-black tracking-tight">
                {String(currentAmmo).padStart(3, '0')}
              </span>
            </div>

            {/* Weapon silhouette sprite */}
            <div className="w-10 h-5 flex items-center justify-center transform -skew-x-12">
              {renderWeaponIcon(currWeapon, "w-10 h-5 text-neutral-900")}
            </div>

            {/* Reserve Ammo */}
            <div className="transform -skew-x-12 flex items-baseline gap-1 font-mono text-neutral-900">
              <span className="text-xs font-bold tracking-tight">
                {String(reserveAmmo).padStart(3, '0')}
              </span>
            </div>

            {/* Grenade Indicator in Top Right Weapon HUD */}
            <div className="transform -skew-x-12 flex items-center gap-1 pl-1 border-l border-neutral-400">
              <span className="text-xs">💣</span>
              <span className="text-[10px] font-black font-mono text-neutral-900">{player.grenades}</span>
            </div>
          </div>
        </div>
      </div>

    {/* BOTTOM LEFT: WEAPON CARD & AMMO */}
      <div className="flex flex-col items-start gap-1.5 pointer-events-auto">
        {/* Holographic Weapon Switch & Pickup Banner */}
        <AnimatePresence>
          {switchAlert && (
            <motion.div
              key={switchAlert.id}
              initial={{ opacity: 0, x: -50, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 21 }}
              className="bg-neutral-950/95 border-2 border-cyan-400/80 rounded-2xl p-3.5 flex flex-col gap-2 shadow-[0_0_25px_rgba(34,211,238,0.25)] min-w-[210px] max-w-[250px] backdrop-blur-lg mb-1"
            >
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                <span className="text-cyan-400 font-sans text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  {switchAlert.isPickup ? 'تم التقاط سلاح جديد' : 'تم سحب السلاح'}
                </span>
                <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-[8px] font-mono px-1.5 py-0.5 rounded-md">
                  {switchAlert.isPickup ? 'PICKUP' : 'EQUIPPED'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#06b6d4_0%,transparent_70%)] opacity-20" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 border border-dashed border-cyan-400/10 rounded-full scale-90"
                  />
                  <div className="w-8 h-8 flex items-center justify-center relative z-10 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                    {renderWeaponIcon(switchAlert.weapon, "w-8 h-6")}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-white font-black text-xs">
                    {WEAPON_CONFIGS[switchAlert.weapon]?.nameAr}
                  </span>
                  <span className="text-neutral-400 font-mono text-[9px]">
                    {WEAPON_CONFIGS[switchAlert.weapon]?.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-[8px] font-sans text-neutral-300 border-t border-cyan-500/10 pt-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-neutral-400 w-9 text-right font-medium">الضـرر:</span>
                  <div className="flex-1 bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (WEAPON_CONFIGS[switchAlert.weapon]?.damage / 85) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-cyan-400 h-full rounded-full"
                    />
                  </div>
                  <span className="font-mono text-cyan-300 text-[8px] w-4 text-left">
                    {WEAPON_CONFIGS[switchAlert.weapon]?.damage}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-neutral-400 w-9 text-right font-medium">السرعة:</span>
                  <div className="flex-1 bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (WEAPON_CONFIGS[switchAlert.weapon]?.fireRate / 10) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-emerald-400 h-full rounded-full"
                    />
                  </div>
                  <span className="font-mono text-emerald-300 text-[8px] w-4 text-left">
                    {Math.round(WEAPON_CONFIGS[switchAlert.weapon]?.fireRate * 10)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-neutral-400 w-9 text-right font-medium">المدى:</span>
                  <div className="flex-1 bg-neutral-800 rounded-full h-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (WEAPON_CONFIGS[switchAlert.weapon]?.range / 4500) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-amber-400 h-full rounded-full"
                    />
                  </div>
                  <span className="font-mono text-amber-300 text-[8px] w-4 text-left">
                    {Math.round(WEAPON_CONFIGS[switchAlert.weapon]?.range / 10)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby Ground Weapon Swap Notification Badge (when carrying 2 weapons) */}
        {nearbyWeapon && player.weapons.length >= 2 && onSwapWeapon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwapWeapon();
            }}
            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 px-3 py-1.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-amber-300 animate-bounce cursor-pointer transition-all mb-1"
            title="تبديل السلاح النشط بالسلاح الأرضي (اضغط F أو اضغط هنا)"
          >
            <div className="w-6 h-5 flex items-center justify-center shrink-0">
              {renderWeaponIcon(nearbyWeapon.weapon, 'w-6 h-4')}
            </div>
            <span className="font-sans">استبدال بـ {nearbyWeapon.nameAr} ({nearbyWeapon.ammo}/{nearbyWeapon.reserveAmmo}) 🔄</span>
            <span className="bg-black/20 text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black">[F]</span>
          </button>
        )}

        {/* Secondary Weapon Quick Swap Slot & Drop Weapon */}
        <div className="flex items-center gap-2">
          {nextWeapon && (
            <motion.button
              key={`secondary-weapon-btn-${nextWeapon}`}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                onSwitchWeapon();
              }}
              className="bg-neutral-900/90 backdrop-blur-md border border-neutral-600 hover:border-amber-400 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-lg active:scale-90 cursor-pointer transition-all pointer-events-auto"
              title="تبديل السلاح الثانوي (Q)"
            >
              <div className="w-7 h-6 rounded-lg bg-neutral-950 flex items-center justify-center">
                <WeaponSpriteSVG weapon={nextWeapon} className="w-6 h-4 text-neutral-200" />
              </div>
              <span className="text-[10px] font-bold text-amber-300 whitespace-nowrap">تبديل [Q]</span>
            </motion.button>
          )}

          {/* Quick Drop Weapon Button */}
          {onDropWeapon && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                onDropWeapon();
              }}
              className="bg-neutral-900/90 backdrop-blur-md border border-neutral-600 hover:border-red-400 hover:bg-red-950/50 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg active:scale-90 cursor-pointer transition-all pointer-events-auto text-red-300"
              title="رمي السلاح الحالي (Z)"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-bold whitespace-nowrap">رمي السلاح [Z]</span>
            </motion.button>
          )}

          {/* Frag Grenades Indicator */}
          <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
            <Bomb className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white font-mono">{player.grenades}</span>
          </div>
        </div>
      </div>

      {/* Floating Live Compact Scoreboard Under Health Bar (Toggleable to keep HUD clutter-free) */}
      {sortedPlayers.length > 0 && showMiniLeaderboard && (
        <div className="absolute top-24 left-3 flex flex-col gap-1 pointer-events-auto bg-neutral-950/60 border border-white/10 backdrop-blur-md rounded-2xl p-2.5 w-[170px] text-white shadow-2xl transition-all z-20">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1 text-[9px] uppercase tracking-wider font-black text-neutral-300">
            <span>🏆 الترتيب الحالي</span>
            <span className="text-amber-400 text-[8px] animate-pulse">لايف</span>
          </div>
          <div className="flex flex-col gap-1">
            {sortedPlayers.slice(0, 4).map((p, idx) => {
              const isPlayerActive = p.isPlayer;
              const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600', 'text-neutral-400'];
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded-lg transition-all ${
                    isPlayerActive ? 'bg-amber-400/20 font-bold border border-amber-400/30' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className={`font-black ${rankColors[idx] || 'text-neutral-400'}`}>{idx + 1}.</span>
                    <span className="truncate max-w-[80px]" title={p.name}>
                      {isPlayerActive ? 'أنت 👑' : (p.isPlayer ? p.name : `[BOT] ${p.name}`)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-emerald-400 font-bold">{p.kills}🎯</span>
                    <span className="text-neutral-400 text-[9px] font-normal">/{p.deaths}💀</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL SCOREBOARD OVERLAY */}
      <AnimatePresence>
        {showScoreboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto select-none"
            onClick={() => setShowScoreboard(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-900 border-2 border-neutral-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowScoreboard(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl font-bold cursor-pointer transition-all"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <h2 className="text-2xl font-black text-amber-400 flex items-center justify-center gap-2">
                  🏆 لوحة المتصدرين الحالية
                </h2>
                <p className="text-[11px] text-neutral-400 mt-1">
                  ترتيب القتلى والمواجهات المباشرة في المعركة الحالية
                </p>
              </div>

              {/* Leaderboard Table */}
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
                {sortedPlayers.map((p, idx) => {
                  const isPlayerActive = p.isPlayer;
                  const rankIcons = ['🥇', '🥈', '🥉', '🎖️'];
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isPlayerActive
                          ? 'bg-amber-400/15 border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-neutral-800/40 border-neutral-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold w-6 text-center">
                          {rankIcons[idx] || `${idx + 1}`}
                        </span>
                        <div>
                          <div className="font-bold text-neutral-100 flex items-center gap-1.5">
                            {isPlayerActive ? `${p.name} (أنت)` : (p.isPlayer ? p.name : `[BOT] ${p.name}`)}
                            {isPlayerActive ? (
                              <span className="bg-amber-500 text-neutral-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                                Active
                              </span>
                            ) : (!p.isPlayer && (
                              <span className="bg-neutral-800 text-neutral-400 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter border border-neutral-700">
                                AI Bot
                              </span>
                            ))}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            معدل قتل/موت: {p.deaths === 0 ? p.kills : (p.kills / p.deaths).toFixed(1)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase text-neutral-500 font-bold">القتلى</span>
                          <span className="text-xl font-black text-emerald-400 font-mono">{p.kills}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase text-neutral-500 font-bold">الوفيات</span>
                          <span className="text-xl font-black text-rose-500 font-mono">{p.deaths}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowScoreboard(false)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 w-full"
                >
                  إغلاق اللوحة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
