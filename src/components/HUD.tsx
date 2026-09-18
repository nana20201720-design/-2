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
}

export const HUD: React.FC<HUDProps> = ({
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
}) => {
  const [announcerMsg, setAnnouncerMsg] = React.useState<{ text: string, color: string, id: number } | null>(null);
  const [showScoreboard, setShowScoreboard] = React.useState(false);

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

  if (!player) return null;

  const currWeapon = player.weapons[player.currentWeaponIndex] || 'pistol';
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

  const activeIndex = matchInfo.activePlayerIndex ?? 0;

  // Render a single kill feed item
  const renderKillFeedItem = (item: KillFeedItem) => {
    const killerName = item.isKillerBot ? `[BOT] ${item.killerName}` : item.killerName;
    const victimName = item.isVictimBot ? `[BOT] ${item.victimName}` : item.victimName;
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/10 text-[10px] md:text-xs mb-1"
      >
        <span className={`${item.isKillerBot ? 'text-neutral-400' : 'text-sky-400'} font-bold`}>{killerName}</span>
        <div className="flex items-center gap-1 opacity-80">
          <WeaponSpriteSVG weapon={item.weapon as WeaponType} className="w-5 h-3 text-white" />
        </div>
        <span className={`${item.isVictimBot ? 'text-neutral-400' : 'text-rose-400'} font-bold`}>{victimName}</span>
      </motion.div>
    );
  };

  return (
    <div id="game-hud-layer" className="absolute inset-0 pointer-events-none p-3 select-none flex flex-col justify-between z-20">
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

      {/* TOP BAR: Exact Mini Militia Classic Layout */}
      <div className="flex items-start justify-between w-full">
        {/* TOP LEFT: Zoom Scope Button + Classic Health/Fuel Trapezoid Gauge + Pause Circle */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Scope Zoom Circle */}
          <button
            onClick={onToggleScope}
            className="w-10 h-10 rounded-full border-2 border-neutral-400 bg-neutral-200 text-neutral-800 font-black text-[11px] shadow-lg cursor-pointer hover:bg-neutral-300 active:scale-90 transition-all flex flex-col items-center justify-center relative"
            title="تغيير المنظور (1X / 2X / 3X)"
          >
            <span className="text-[8px] text-neutral-500 font-sans tracking-tighter leading-none">SCOPE</span>
            <span className="text-[11px] font-black leading-none">{scopeLevel}x</span>
          </button>

          {/* Mini Militia Classic Health & Boost Bar Container (Metallic Gray skewed) */}
          <div className="bg-neutral-200 border-2 border-neutral-400 p-1.5 px-3.5 shadow-lg flex flex-col gap-1.5 min-w-[155px] max-w-[190px] transform -skew-x-12 rounded-xl relative">
            {/* Top Bar: Hot Pink/Magenta Health Bar with Heart Icon */}
            <div className="flex items-center gap-1.5 transform skew-x-12">
              <span className="text-xs shrink-0">❤️</span>
              <div className="flex-1 bg-neutral-400/40 rounded-full h-3 p-0.5 border border-neutral-400 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-[#d946ef]"
                  style={{ width: `${Math.max(0, Math.min(100, player.health))}%` }}
                />
              </div>
            </div>

            {/* Bottom Bar: Electric Blue Boost / Jetpack Fuel with Wings/Jetpack Icon */}
            <div className="flex items-center gap-1.5 transform skew-x-12">
              <span className="text-xs shrink-0">⚡</span>
              <div className="flex-1 bg-neutral-400/40 rounded-full h-2 p-0.5 border border-neutral-400 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-75 bg-[#2563eb]"
                  style={{ width: `${Math.max(0, Math.min(100, player.fuel))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Circular Pause Button attached next to the trapezoid gauge */}
          <button
            id="btn-pause-game"
            onClick={onPause}
            className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-neutral-400 text-neutral-800 flex items-center justify-center hover:bg-neutral-300 active:scale-90 shadow-md cursor-pointer transform -skew-x-12 -ml-2 z-10"
            title="إيقاف مؤقت"
          >
            <span className="text-[10px] font-black font-mono">⏸</span>
          </button>
        </div>

        {/* TOP CENTER: Match Timer */}
        <div className="flex flex-col items-center gap-1">
          {/* Timer & Players Switcher */}
          <button
            onClick={() => setShowScoreboard(!showScoreboard)}
            className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-800 border border-white/40 rounded-full px-3 py-1 shadow-md pointer-events-auto cursor-pointer transition-all active:scale-95"
            title="انقر لفتح لوحة الصدارة الكاملة"
          >
            <span className="text-white font-mono font-black text-xs">⏱️ {timerStr}</span>
            <span className="text-amber-400 text-[10px] font-black border-l border-white/20 pl-1.5 ml-1">🏆 الصدارة</span>
          </button>
          {matchInfo.players && matchInfo.players.length > 1 && (
            <div className="flex items-center gap-1 ml-2 bg-neutral-900/40 p-0.5 rounded-full pointer-events-auto mt-1">
              {matchInfo.players.map((p, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlayer?.(idx)}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-black cursor-pointer ${
                      isCurrent
                        ? 'bg-sky-500 text-white font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    P{idx + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TOP RIGHT: Kill Feed & Weapon HUD */}
        <div className="flex items-start gap-4 pointer-events-auto">
          {/* Dynamic Kill Feed Overlay */}
          <div className="flex flex-col items-end pointer-events-none mr-2 hidden md:flex">
            <AnimatePresence mode="popLayout">
              {killFeed.slice(-5).map((item) => renderKillFeedItem(item))}
            </AnimatePresence>
          </div>

          {/* Mini Militia Classic Symmetrical Weapon HUD */}
          <div className="flex items-center gap-1">
          {/* Weapon Metallic Frame (Symmetrical skew) */}
          <div
            onClick={onSwitchWeapon}
            className="bg-neutral-200 border-2 border-neutral-400 px-3.5 py-1.5 shadow-lg flex items-center gap-3 cursor-pointer transform skew-x-12 rounded-xl hover:scale-105 active:scale-95 transition-all"
            title="انقر لتبديل السلاح"
          >
            {/* Ammo status in black/white digital monospace font */}
            <div className="transform -skew-x-12 flex flex-col items-start font-mono text-neutral-900 leading-none">
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] font-black tracking-tight">
                  {String(currentAmmo).padStart(3, '0')}
                </span>
                <span className="text-[9px] text-neutral-500 font-bold">
                  {String(reserveAmmo).padStart(3, '0')}
                </span>
              </div>
              <span className="text-[7px] font-black text-neutral-500 uppercase leading-none mt-1">
                {currWeapon.toUpperCase()}
              </span>
            </div>

            {/* Weapon silhouette sprite */}
            <div className="w-10 h-6 flex items-center justify-center transform -skew-x-12">
              {renderWeaponIcon(currWeapon, "w-9 h-5 text-neutral-800")}
            </div>
          </div>

          {/* Circular Quick Action Grenade / Reload Button attached directly next to it */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReload();
            }}
            className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-neutral-400 text-neutral-800 flex items-center justify-center hover:bg-neutral-300 active:scale-90 shadow-md cursor-pointer transform skew-x-12 -ml-2 z-10"
            title="تلقيم السلاح"
          >
            <span className="text-[11px]">🔄</span>
          </button>
        </div>
      </div>
    </div>

    {/* BOTTOM LEFT: WEAPON CARD & AMMO */}
      <div className="flex flex-col items-start gap-1.5 pointer-events-auto">
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

        <div className="flex items-end gap-2.5">
          {/* Active Weapon Card */}
          <motion.div
            key={`active-weapon-box-${currWeapon}`}
            initial={{ scale: 0.94, y: 4, opacity: 0.8 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            onClick={(e) => {
              e.stopPropagation();
              onReload();
            }}
            className={`backdrop-blur-md border-2 rounded-2xl p-2.5 shadow-xl flex items-center gap-3 cursor-pointer select-none transition-all ${
              player.isReloading 
                ? 'bg-neutral-900/95 border-amber-500/80 ring-2 ring-amber-500/20' 
                : 'bg-neutral-900/90 border-neutral-700 hover:border-amber-400/60 active:scale-98'
            }`}
          >
            {/* Animated Weapon Icon */}
            <div className="relative w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`weapon-svg-${currWeapon}`}
                  initial={{ rotate: -10, scale: 0.7, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 10, scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {renderWeaponIcon(currWeapon)}
                </motion.div>
              </AnimatePresence>

              {/* Reload overlay spinning icon */}
              {player.isReloading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  >
                    <RefreshCw className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Ammo & Status */}
            <div className="flex flex-col min-w-[70px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-neutral-200">
                  {currCfg.nameAr}
                </span>
                {player.isReloading && (
                  <span className="text-[9px] font-black text-amber-400 animate-pulse font-mono">
                    تلقيم...
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-black font-mono transition-colors ${
                  player.isReloading 
                    ? 'text-amber-500/70' 
                    : currentAmmo <= 3 
                      ? 'text-rose-500 animate-pulse' 
                      : 'text-amber-400'
                }`}>
                  {currentAmmo}
                </span>
                <span className="text-xs font-semibold text-neutral-400 font-mono">
                  / {reserveAmmo}
                </span>
              </div>

              {/* Reloading Progress Bar */}
              {player.isReloading ? (
                <div className="w-full bg-neutral-950 rounded-full h-1.5 mt-1 overflow-hidden p-[1px] border border-neutral-800">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                    style={{
                      width: `${Math.max(0, Math.min(100, 100 - (player.reloadTimer / (player.reloadDuration || 1)) * 100))}%`
                    }}
                  />
                </div>
              ) : (
                <div className="w-full bg-neutral-800/40 rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentAmmo === 0 
                        ? 'bg-rose-500 w-full animate-pulse' 
                        : 'bg-neutral-600'
                    }`}
                    style={{
                      width: `${(currentAmmo / (currCfg.magazineSize || 1)) * 100}%`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons: Reload and Drop */}
            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReload();
                }}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  player.isReloading
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 animate-spin'
                    : 'bg-neutral-800 border-neutral-600 text-amber-400 hover:bg-neutral-700 hover:border-amber-400'
                }`}
                title="تلقيم (R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {onDropWeapon && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDropWeapon();
                  }}
                  className="w-7 h-7 rounded-lg bg-neutral-800/90 border border-amber-500/40 flex items-center justify-center text-amber-300 hover:bg-neutral-700 hover:border-amber-400 active:scale-90 cursor-pointer transition-all"
                  title="رمي السلاح (Z / X)"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Secondary Weapon Quick Swap Slot */}
          {nextWeapon ? (
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
              className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 hover:border-sky-400 rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-90 cursor-pointer transition-all group"
              title="تبديل السلاح (Q / E / Scroll / Click)"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                <WeaponSpriteSVG weapon={nextWeapon} className="w-7 h-5 text-neutral-300 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[8px] font-bold text-neutral-400 group-hover:text-sky-300 transition-colors">تبديل [Q]</span>
            </motion.button>
          ) : (
            <div
              className="bg-neutral-900/40 backdrop-blur-xs border border-dashed border-neutral-700/80 rounded-xl px-2 py-1.5 flex flex-col items-center justify-center gap-0.5"
              title="ابحث في الخريطة عن سلاح ثانوي"
            >
              <div className="w-7 h-7 rounded-lg bg-neutral-950/40 border border-dashed border-neutral-700 flex items-center justify-center text-neutral-500">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-[7px] font-bold text-neutral-400 whitespace-nowrap">سلاح ٢ فارغ</span>
            </div>
          )}

          {/* Frag Grenades Indicator */}
          <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
            <Bomb className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white font-mono">{player.grenades}</span>
          </div>
        </div>
      </div>

      {/* Floating Live Compact Scoreboard Under Health Bar (Absolute position) */}
      {sortedPlayers.length > 0 && (
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
};
