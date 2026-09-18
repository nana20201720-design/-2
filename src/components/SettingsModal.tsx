import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  Smartphone,
  Shield,
  Zap,
  Crosshair,
  Gauge,
  Sparkles,
  Eye,
  Tv,
  CheckCircle2,
  Flame,
  User,
  Radio,
  Cloud,
  LogOut,
  LogIn,
} from 'lucide-react';
import { settingsManager, TacticalSettings } from '../utils/settingsManager';
import { soundManager } from '../audio/soundManager';
import { FirebaseUser } from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
}

type TabType = 'controls' | 'hud' | 'audio' | 'graphics' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser, onOpenAuth }) => {
  const [settings, setSettings] = useState<TacticalSettings>(() => settingsManager.getSettings());
  const [activeTab, setActiveTab] = useState<TabType>('controls');
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(settingsManager.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSensitivityChange = (delta: number) => {
    soundManager.playButtonClick();
    setSettings((prev) => ({
      ...prev,
      aimSensitivity: Math.max(10, Math.min(100, prev.aimSensitivity + delta)),
    }));
  };

  const handleSave = async () => {
    soundManager.playVictory();
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate([40, 20, 60]);
    }
    settingsManager.updateSettings(settings);
    soundManager.setVolume(settings.soundVolume / 100);
    soundManager.setMuted(settings.isMuted);

    // Sync to cloud if logged in
    try {
      const { cloudSyncManager } = await import('../utils/cloudSyncManager');
      await cloudSyncManager.syncToCloud();
    } catch (e) {
      console.error('Failed to sync settings to cloud:', e);
    }

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    soundManager.playButtonClick();
    const defaults = settingsManager.resetDefaults();
    setSettings(defaults);
    soundManager.setVolume(defaults.soundVolume / 100);
    soundManager.setMuted(defaults.isMuted);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0e1611] border-2 border-[#2b4430] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Military Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#132018] border-b border-[#2b4430]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sliders size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                    إعدادات المعركة والتكتيك
                  </h2>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800">
                    V5.4.0-MIL
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  تخصيص الحساسية، نمط النفاثة، وشاشة التحكم الميدانية HUD
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-[#1b2b20] hover:bg-[#253a2c] text-gray-300 hover:text-white flex items-center justify-center border border-[#37523e] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-2 bg-[#0a100c] border-b border-[#1d2f22] overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('controls');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                activeTab === 'controls'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-[#142018] text-gray-400 hover:text-white hover:bg-[#1a2b20]'
              }`}
            >
              <Crosshair size={16} />
              <span>التحكم (Controls)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('hud');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                activeTab === 'hud'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-[#142018] text-gray-400 hover:text-white hover:bg-[#1a2b20]'
              }`}
            >
              <Tv size={16} />
              <span>محاكي HUD</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('audio');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                activeTab === 'audio'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#142018] text-gray-400 hover:text-white hover:bg-[#1a2b20]'
              }`}
            >
              <Volume2 size={16} />
              <span>الصوتيات (Audio)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('graphics');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                activeTab === 'graphics'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-[#142018] text-gray-400 hover:text-white hover:bg-[#1a2b20]'
              }`}
            >
              <Gauge size={16} />
              <span>الرسومات والأداء</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('account');
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md shadow-amber-600/20'
                  : 'bg-[#142018] text-gray-400 hover:text-white hover:bg-[#1a2b20]'
              }`}
            >
              <User size={16} />
              <span>الحساب (Profile)</span>
            </button>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right">
            {/* TAB 1: CONTROLS */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                {/* Aim Sensitivity Slider */}
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Crosshair size={18} />
                      <span className="text-sm font-black text-white">
                        حساسية عصا التصويب (Aim Sensitivity)
                      </span>
                    </div>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {settings.aimSensitivity}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    تتحكم بسرعة تدوير السلاح وزاوية إطلاق الرصاص عند الاشتباكات القريبة والجوية.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleSensitivityChange(-5)}
                      className="w-9 h-9 rounded-lg bg-[#1f3325] hover:bg-[#2b4633] text-white font-black text-lg flex items-center justify-center border border-[#3b5942] active:scale-95"
                    >
                      -
                    </button>
                    <div className="flex-1 relative h-3 bg-[#0a100c] rounded-full overflow-hidden p-0.5 border border-[#273a2c]">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-150"
                        style={{ width: `${settings.aimSensitivity}%` }}
                      />
                    </div>
                    <button
                      onClick={() => handleSensitivityChange(5)}
                      className="w-9 h-9 rounded-lg bg-[#1f3325] hover:bg-[#2b4633] text-white font-black text-lg flex items-center justify-center border border-[#3b5942] active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Control Layout Editor */}
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-3">
                  <span className="text-sm font-black text-white block">
                    مواقع أزرار التحكم (Control Layout)
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {(['grenadeBtn', 'meleeBtn', 'shootBtn'] as const).map((btn) => (
                      <div key={btn} className="bg-[#0a100c] p-3 rounded-lg border border-[#2b4430]">
                        <span className="font-bold text-gray-300 mb-2 block">{btn === 'grenadeBtn' ? 'القنبلة' : btn === 'meleeBtn' ? 'الضربة' : 'الإطلاق'}</span>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-[10px] text-gray-500 w-12">Bottom:</label>
                          <input 
                            type="number" 
                            value={settings.controlLayout[btn].bottom}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSettings(prev => ({ ...prev, controlLayout: { ...prev.controlLayout, [btn]: { ...prev.controlLayout[btn], bottom: val } } }));
                            }}
                            className="w-full bg-[#142018] border border-[#2b4430] rounded px-2 py-1 text-emerald-400 font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-gray-500 w-12">
                            {btn === 'grenadeBtn' ? 'Left:' : 'Right:'}
                          </label>
                          <input 
                            type="number" 
                            value={btn === 'grenadeBtn' ? settings.controlLayout[btn].left : settings.controlLayout[btn].right}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSettings(prev => ({ 
                                ...prev, 
                                controlLayout: { 
                                  ...prev.controlLayout, 
                                  [btn]: { 
                                    ...prev.controlLayout[btn], 
                                    [btn === 'grenadeBtn' ? 'left' : 'right']: val 
                                  } 
                                } 
                              }));
                            }}
                            className="w-full bg-[#142018] border border-[#2b4430] rounded px-2 py-1 text-emerald-400 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fire Mode Selector */}
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-2">
                  <span className="text-sm font-black text-white block">
                    نمط تشغيل إطلاق النار (Fire Mode)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, fireMode: 'dual' }));
                      }}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        settings.fireMode === 'dual'
                          ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-[#0e1711] border-[#223526] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-white">
                          عصا مزدوجة (Dual Stick)
                        </span>
                        {settings.fireMode === 'dual' && (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        عصا مستقلة للتوجيه مع إطلاق ناري تلقائي ومستمر
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, fireMode: 'swipe' }));
                      }}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        settings.fireMode === 'swipe'
                          ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-[#0e1711] border-[#223526] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-white">
                          السحب والتصويب اليدوي (Swipe Aim)
                        </span>
                        {settings.fireMode === 'swipe' && (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        تمرير الشاشة للتوجيه مع زر إطلاق منفصل
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tactical Toggles List */}
                <div className="bg-[#142018] border border-[#2b4430] rounded-xl divide-y divide-[#223526]">
                  {/* Aim Assist */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          المساعدة التكتيكية في التصويب (Aim Assist)
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-800">
                          موصى به
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        مغناطيسية تصويب ذكية تلتصق بالأعداء أثناء القفز والمناورات الجوية.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, aimAssist: !prev.aimAssist }));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        settings.aimAssist ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Jetpack Boost on drag */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-white block">
                        تسارع طيران النفاثة (Jetpack Auto Boost)
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        تفعيل لهب النفاثة والطيران فور سحب عصا الحركة لأقصى مدى للأعلى.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, jetpackBoost: !prev.jetpackBoost }));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        settings.jetpackBoost ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Auto Weapon Swap */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-white block">
                        تبديل السلاح التلقائي عند نفاد الذخيرة
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        التبديل الفوري إلى السلاح الثانوي أو المسدس بمجرد فراغ المخزن.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, autoWeaponSwap: !prev.autoWeaponSwap }));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        settings.autoWeaponSwap ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Haptics */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-white block">
                        الاهتزاز الميكانيكي الارتدادي (Haptic Feedback)
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        اهتزاز الجهاز اللمسي عند تلقي ضرر أو رمي القنابل اليدوية.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, haptics: !prev.haptics }));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        settings.haptics ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HUD SIMULATION */}
            {activeTab === 'hud' && (
              <div className="space-y-4">
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">
                      محاكي شاشة التحكم الميدانية (HUD Live Viewport)
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">
                      حجم: {settings.hudScale}% | شفافية: {settings.hudOpacity}%
                    </span>
                  </div>

                  {/* Live Mini HUD Preview Mockup */}
                  <div
                    className="relative w-full h-52 bg-[#070e0a] rounded-xl border border-[#233527] overflow-hidden p-3 flex flex-col justify-between select-none shadow-inner"
                    style={{
                      backgroundImage:
                        'radial-gradient(#1c2b20 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  >
                    {/* Top HUD status */}
                    <div
                      className="flex items-center justify-between"
                      style={{ opacity: settings.hudOpacity / 100 }}
                    >
                      {/* Health & Nitro */}
                      <div className="flex flex-col gap-1 w-32">
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
                          <span className="text-[10px] text-red-400 font-bold">HP</span>
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-4/5" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded">
                          <span className="text-[10px] text-cyan-400 font-bold">NITRO</span>
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 w-3/5" />
                          </div>
                        </div>
                      </div>

                      {/* Weapon Status */}
                      <div className="bg-black/70 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-amber-400">DESERT EAGLE</span>
                        <span className="text-xs font-bold text-white">14/28</span>
                      </div>
                    </div>

                    {/* Crosshair Center Decal */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                      <Crosshair size={40} className="text-emerald-400" />
                    </div>

                    {/* Bottom Virtual Controls with Live Scale */}
                    <div
                      className="flex items-end justify-between transition-transform"
                      style={{
                        opacity: settings.hudOpacity / 100,
                        transform: `scale(${settings.hudScale / 100})`,
                        transformOrigin: 'bottom center',
                      }}
                    >
                      {/* Left Movement Stick */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full bg-[#1b2b20]/90 border-2 border-emerald-500/60 flex items-center justify-center shadow-lg cursor-pointer active:scale-95">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/80 text-black flex items-center justify-center text-xs font-bold">
                            <Flame size={16} />
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold">
                          حركة + نفاثة
                        </span>
                      </div>

                      {/* Center Actions */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400 shadow">
                          <span className="text-xs">💣</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow">
                          <span className="text-xs">🥊</span>
                        </div>
                      </div>

                      {/* Right Aim Stick */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full bg-[#1b2b20]/90 border-2 border-amber-500/60 flex items-center justify-center shadow-lg cursor-pointer active:scale-95">
                          <div className="w-7 h-7 rounded-full bg-amber-500/80 text-black flex items-center justify-center text-xs font-bold">
                            <Crosshair size={16} />
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold">
                          تصويب + إطلاق
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HUD Scale Slider */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-gray-300">حجم الأزرار (Button Scale):</span>
                      <span className="text-cyan-400 font-mono">{settings.hudScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="130"
                      step="5"
                      value={settings.hudScale}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hudScale: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-[#0c140f] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* HUD Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-gray-300">شفافية عناصر التحكم (HUD Opacity):</span>
                      <span className="text-cyan-400 font-mono">{settings.hudOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      step="5"
                      value={settings.hudOpacity}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          hudOpacity: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-[#0c140f] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-4">
                  {/* Master Mute Toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#223526]">
                    <div className="flex items-center gap-2">
                      {settings.isMuted ? (
                        <VolumeX size={20} className="text-red-400" />
                      ) : (
                        <Volume2 size={20} className="text-emerald-400" />
                      )}
                      <div>
                        <span className="text-sm font-black text-white block">
                          كتم الصوت العام (Mute Audio)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          إيقاف كافة الأصوات والموسيقى فورياً
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newMute = !settings.isMuted;
                        soundManager.setMuted(newMute);
                        if (!newMute) soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, isMuted: newMute }));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        !settings.isMuted ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* SFX Volume */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-white flex items-center gap-1.5">
                        <span>💥</span> مؤثرات المعركة والأسلحة (Combat SFX)
                      </span>
                      <span className="text-amber-400 font-mono">{settings.soundVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      disabled={settings.isMuted}
                      value={settings.soundVolume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        soundManager.setVolume(val / 100);
                        setSettings((prev) => ({ ...prev, soundVolume: val }));
                      }}
                      className="w-full h-2 bg-[#0c140f] rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => soundManager.playPistol()}
                        className="text-[11px] bg-[#1d2d22] hover:bg-[#283e2f] text-amber-300 px-2.5 py-1 rounded-lg border border-[#39533f]"
                      >
                        🔊 تجربة صوت إطلاق النار
                      </button>
                    </div>
                  </div>

                  {/* Music Volume */}
                  <div className="space-y-1.5 pt-2 border-t border-[#223526]">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-white flex items-center gap-1.5">
                        <span>🎵</span> الموسيقى العسكرية الحماسية (Music)
                      </span>
                      <span className="text-amber-400 font-mono">{settings.musicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      disabled={settings.isMuted}
                      value={settings.musicVolume}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, musicVolume: Number(e.target.value) }))
                      }
                      className="w-full h-2 bg-[#0c140f] rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GRAPHICS */}
            {activeTab === 'graphics' && (
              <div className="space-y-4">
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-4">
                  {/* FPS Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-white block">
                      معدل الإطارات (Target Frame Rate - FPS):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 60, 120].map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            soundManager.playButtonClick();
                            setSettings((prev) => ({ ...prev, fps: f as 30 | 60 | 120 }));
                          }}
                          className={`py-2.5 px-2 rounded-xl text-xs font-black border transition-all ${
                            settings.fps === f
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                              : 'bg-[#0e1711] border-[#223526] text-gray-400 hover:text-white'
                          }`}
                        >
                          {f === 120 ? '120 FPS (فائق)' : `${f} FPS`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Graphics Quality */}
                  <div className="space-y-2 pt-2 border-t border-[#223526]">
                    <span className="text-xs font-black text-white block">
                      جودة الرسومات وتأثيرات اللهب:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'medium', label: 'عادية' },
                        { id: 'high', label: 'عالية' },
                        { id: 'ultra', label: 'فائقة HD' },
                      ].map((q) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            soundManager.playButtonClick();
                            setSettings((prev) => ({
                              ...prev,
                              graphicsQuality: q.id as 'low' | 'medium' | 'high' | 'ultra',
                            }));
                          }}
                          className={`py-2.5 px-2 rounded-xl text-xs font-black border transition-all ${
                            settings.graphicsQuality === q.id
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                              : 'bg-[#0e1711] border-[#223526] text-gray-400 hover:text-white'
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Battery Saver */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#223526]">
                    <div>
                      <span className="text-xs font-black text-white block">
                        وضع توفير شحن البطارية (Battery Saver)
                      </span>
                      <span className="text-[11px] text-gray-400">
                        تقليل المعالجة الرسومية غير الحرجة للحفاظ على طاقة الهاتف
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSettings((prev) => ({ ...prev, batterySaver: !prev.batterySaver }));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        settings.batterySaver ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ACCOUNT & PROFILE */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="bg-[#142018] border border-[#2b4430] p-4 rounded-xl space-y-4">
                  {/* Cloud Sync Status */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    currentUser 
                      ? 'bg-emerald-950/30 border-emerald-500/30' 
                      : 'bg-amber-950/20 border-amber-500/20'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        currentUser ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <Cloud size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">حفظ التقدم السحابي (Cloud Sync)</h4>
                        <p className="text-[10px] text-gray-400">
                          {currentUser 
                            ? 'يتم مزامنة تقدمك تلقائياً مع خوادمنا المؤمنة.' 
                            : 'سجل دخولك لضمان عدم ضياع تقدمك عند حذف اللعبة أو تحديثها.'}
                        </p>
                      </div>
                    </div>

                    {currentUser ? (
                      <div className="flex flex-col gap-3">
                        <div className="bg-[#0a100c] p-3 rounded-lg border border-[#223526] flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500">الحساب المرتبط:</span>
                            <span className="text-xs font-bold text-emerald-400 truncate max-w-[200px]">
                              {currentUser.email || 'حساب Google'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase">متصل</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            onOpenAuth();
                          }}
                          className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={14} />
                          <span>إدارة الحساب / تسجيل الخروج</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          soundManager.playButtonClick();
                          onOpenAuth();
                        }}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <LogIn size={16} />
                        <span>تسجيل الدخول / إنشاء حساب حفظ التقدم</span>
                      </button>
                    )}
                  </div>

                  {/* Player Name */}
                  <div className="space-y-1.5 pt-2 border-t border-[#223526]">
                    <label className="text-xs font-black text-white block">
                      اسم المقاتل / اللقب (Player Callsign):
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={settings.playerName}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, playerName: e.target.value }))
                      }
                      className="w-full bg-[#0a100c] border border-[#2b4430] rounded-xl px-4 py-3 text-sm font-black text-amber-400 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <p className="text-[10px] text-gray-500">سيظهر هذا الاسم للاعبين الآخرين في الروم والليدربورد.</p>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#0b120d] p-3 rounded-xl border border-[#223526]">
                      <span className="text-[10px] text-gray-400 block mb-0.5">الرتبة العسكرية:</span>
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} className="text-amber-500" />
                        <span className="text-xs font-black text-white">مستوى {settings.playerRank}</span>
                      </div>
                    </div>
                    <div className="bg-[#0b120d] p-3 rounded-xl border border-[#223526]">
                      <span className="text-[10px] text-gray-400 block mb-0.5">إجمالي العملات:</span>
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} className="text-cyan-400" />
                        <span className="text-xs font-black text-white">{settings.coins} قطعة</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 opacity-60">
                  <Shield size={12} />
                  <span>تشفير عسكري لحماية بيانات اللاعبين • Firebase Shield</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-[#111c14] border-t border-[#2b4430] flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1a2a1e] hover:bg-[#253c2b] text-gray-300 hover:text-white text-xs font-bold border border-[#334e39] transition-all"
            >
              <RotateCcw size={15} />
              <span>إعادة الضبط الافتراضي</span>
            </button>

            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-black font-black text-sm shadow-lg shadow-amber-500/25 transition-all"
            >
              <Check size={18} />
              <span>حفظ وتطبيق الإعدادات (SAVE SETTINGS)</span>
            </button>
          </div>

          {/* Success Toast */}
          <AnimatePresence>
            {showSavedToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-green-500 text-black px-6 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-2 z-50 pointer-events-none"
              >
                <CheckCircle2 size={20} />
                <span>تم حفظ وتطبيق كافة الإعدادات بنجاح! 🔥</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
