import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, Settings as SettingsIcon, Shield, Zap } from 'lucide-react';
import { settingsManager, TacticalSettings } from '../utils/settingsManager';
import { soundManager } from '../audio/soundManager';

import { FirebaseUser } from '../lib/firebase';

interface GameHeaderProps {
  onOpenSettings: () => void;
  onOpenAuth?: () => void;
  currentUser?: FirebaseUser | null;
  title?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ onOpenSettings, onOpenAuth, currentUser, title }) => {
  const [settings, setSettings] = useState<TacticalSettings>(() => settingsManager.getSettings());

  useEffect(() => {
    const unsub = settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });
    return unsub;
  }, []);

  const toggleMute = () => {
    const newMute = !settings.isMuted;
    soundManager.setMuted(newMute);
    if (!newMute) soundManager.playButtonClick();
    settingsManager.updateSettings({ isMuted: newMute });
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-[#0c140f]/95 backdrop-blur-xl border-b border-[#253928] shadow-lg">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: Logo & Player Rank Info */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/images/app_logo.jpg"
            alt="Mini Militia Combat"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#3b5940] shadow-md shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-wider truncate">
                {settings.playerName}
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/40">
                LVL {settings.playerRank}
              </span>
            </div>
            {/* Rank XP Bar */}
            <div className="w-20 sm:w-28 h-1.5 bg-[#070d09] rounded-full overflow-hidden mt-0.5 border border-[#1e2f21]">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-3/4" />
            </div>
          </div>
        </div>

        {/* Center: Currency & Resources Bar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-[#121c15] px-2 sm:px-2.5 py-1 rounded-lg border border-[#273d2b] shadow-inner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
              <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
              <path d="M12 6v12M15 9.5H10.5a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3H9" />
            </svg>
            <span className="text-[11px] sm:text-xs font-black text-amber-400 font-mono">
              {settings.coins.toLocaleString()}
            </span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 bg-[#121c15] px-2 sm:px-2.5 py-1 rounded-lg border border-[#273d2b] shadow-inner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
              <path d="M6 3h12l4 6-10 12L2 9z" fill="currentColor" fillOpacity="0.25" />
              <path d="M11 3v18M2 9h20M6 9l6 12 6-12" />
            </svg>
            <span className="text-[11px] sm:text-xs font-black text-cyan-400 font-mono">
              {settings.gems}
            </span>
          </div>

          {/* Nitro Fuel Bar */}
          <div className="hidden sm:flex items-center gap-1 bg-[#121c15] px-2 py-1 rounded-lg border border-[#273d2b]">
            <Zap size={14} className="text-cyan-400" />
            <div className="w-12 h-2 bg-[#070d09] rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-cyan-400 rounded-full w-4/5 shadow-[0_0_6px_#00daf3]" />
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Sound Mute Button */}
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-xl bg-[#142218] hover:bg-[#1d3023] text-gray-300 hover:text-white flex items-center justify-center border border-[#2b4430] transition-colors"
            title={settings.isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          >
            {settings.isMuted ? (
              <VolumeX size={17} className="text-red-400" />
            ) : (
              <Volume2 size={17} className="text-emerald-400" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl bg-[#1a2d20] hover:bg-[#253f2d] text-amber-400 hover:text-amber-300 flex items-center justify-center border border-amber-500/40 shadow-sm active:scale-95 transition-all"
            title="إعدادات المعركة والتكتيك"
          >
            <SettingsIcon size={18} className="animate-spin-slow" />
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              if (onOpenAuth) onOpenAuth();
            }}
            className={`relative w-9 h-9 rounded-xl overflow-hidden border-2 ${
              currentUser ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'border-amber-500 shadow-md'
            } active:scale-95 transition-all`}
            title={currentUser ? 'الملف الشخصي (متصل)' : 'تسجيل الدخول لحفظ التقدم'}
          >
            <img
              src={currentUser?.photoURL || '/images/commando_avatar.jpg'}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {currentUser && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#0c140f] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Subbar: Region status */}
      <div className="max-w-4xl mx-auto px-3 pb-1 flex items-center justify-between text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-white uppercase">{title || 'MINI MILITIA ARENA'}</span>
        </div>
        <span className="text-emerald-400 font-bold">خوادم الشرق الأوسط: متصل • 24ms</span>
      </div>
    </header>
  );
};
