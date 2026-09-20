import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  LogOut,
  Volume2,
  VolumeX,
  Vibrate,
  Shield,
  Crosshair,
  Sparkles,
  Camera,
  Layers,
  Settings,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { settingsManager } from '../utils/settingsManager';
import { ThreeSoldierCanvas } from './ThreeSoldierCanvas';
import { CharacterState } from '../types';

interface InGame3DPauseModalProps {
  isOpen: boolean;
  player: CharacterState | null;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onToggleCamera3D?: () => void;
  is3DCameraMode?: boolean;
}

export const InGame3DPauseModal: React.FC<InGame3DPauseModalProps> = ({
  isOpen,
  player,
  onResume,
  onRestart,
  onQuit,
  onToggleCamera3D,
  is3DCameraMode = true,
}) => {
  const [settings, setSettings] = useState(settingsManager.getSettings());
  const [is3DMode, setIs3DMode] = useState(is3DCameraMode);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextMuted = !settings.isMuted;
    soundManager.setMuted(nextMuted);
    settingsManager.updateSettings({ isMuted: nextMuted });
    setSettings({ ...settings, isMuted: nextMuted });
  };

  const handleToggleHaptics = () => {
    const nextHaptics = !settings.haptics;
    settingsManager.updateSettings({ haptics: nextHaptics });
    setSettings({ ...settings, haptics: nextHaptics });
  };

  const handleToggleCamera = () => {
    setIs3DMode(!is3DMode);
    onToggleCamera3D?.();
    soundManager.play('menu_select');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.85, rotateY: 15, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        exit={{ scale: 0.85, rotateY: -15, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        style={{ perspective: 1200 }}
        className="relative z-10 w-full max-w-2xl rounded-3xl bg-neutral-950/95 border border-cyan-500/40 p-6 md:p-8 shadow-[0_0_60px_rgba(6,182,212,0.35)] backdrop-blur-2xl text-white flex flex-col gap-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-mono tracking-wider text-cyan-300">
                قائمة المعركة ثلاثية الأبعاد
              </h2>
              <p className="text-xs text-neutral-400">PAUSE & TACTICAL CONTROL CENTER</p>
            </div>
          </div>

          <button
            onClick={onResume}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content: 3D Soldier preview + Match quick controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: 3D Soldier interactive inspect */}
          <div className="flex flex-col items-center bg-neutral-900/60 rounded-2xl border border-white/10 p-3 relative overflow-hidden">
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
              SOLDIER STATUS: {player ? `${player.health} HP` : 'READY'}
            </div>
            <ThreeSoldierCanvas
              height={220}
              camoColor={player?.camoColor || '#365314'}
              headgear={player?.headgear || 'camo_helmet'}
              bodyArmor={player?.bodyArmor || 'molle_vest'}
              eyewear={player?.eyewear || 'aviators'}
              beard={player?.beard || 'stubble'}
              jetpackStyle={player?.jetpackStyle || 'military_dual'}
              skinTone={player?.skinTone || '#fbb587'}
              weapon={player?.weapons?.[player?.currentWeaponIndex || 0] || 'pistol'}
              trailColor={player?.trailColor || '#a855f7'}
              interactive={true}
              showPedestal={true}
            />
            <div className="text-[11px] text-neutral-400 font-mono mt-1">
              اسحب للتدوير 360° | عاين البطل في المعركة
            </div>
          </div>

          {/* Right: Tactical Toggles & Settings */}
          <div className="flex flex-col gap-3">
            {/* 3D Camera toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-cyan-200">كاميرا ديناميكية 3D</div>
                  <div className="text-[11px] text-neutral-400">تتبع حركي بزوايا عمق ثلاثية الأبعاد</div>
                </div>
              </div>
              <button
                onClick={handleToggleCamera}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  is3DMode
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'bg-neutral-800 text-neutral-400 border border-white/10'
                }`}
              >
                {is3DMode ? 'مفعل ON' : 'كلاسيكي'}
              </button>
            </div>

            {/* Sound toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-neutral-300">
                  {!settings.isMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">المؤثرات الصوتية</div>
                  <div className="text-[11px] text-neutral-400">أصوات إطلاق النار والانفجارات</div>
                </div>
              </div>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  !settings.isMuted
                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-neutral-800 text-neutral-400 border border-white/10'
                }`}
              >
                {!settings.isMuted ? 'مفعل' : 'صامت'}
              </button>
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-neutral-300">
                  <Vibrate className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">الاهتزاز التكتيكي</div>
                  <div className="text-[11px] text-neutral-400">تفاعل لمسي عند إطلاق النار</div>
                </div>
              </div>
              <button
                onClick={handleToggleHaptics}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  settings.haptics
                    ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'bg-neutral-800 text-neutral-400 border border-white/10'
                }`}
              >
                {settings.haptics ? 'مفعل' : 'معطل'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onQuit}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 hover:border-red-400 text-red-300 font-bold transition-all active:scale-95 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج إلى القائمة الرئيسية</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white font-bold transition-all active:scale-95 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تشغيل</span>
            </button>

            <button
              onClick={onResume}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black transition-all active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.6)] text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>متابعة القتال 3D</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
