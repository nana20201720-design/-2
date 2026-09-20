import React, { useState } from 'react';
import {
  Play,
  Users,
  Shield,
  Palette,
  Settings as SettingsIcon,
  HelpCircle,
  Volume2,
  VolumeX,
  Vibrate,
  Flame,
  Crosshair,
  Sparkles,
  Trophy,
  User,
  Target,
  Trash2,
  Zap,
  Star,
  Globe,
  Share2,
  Check,
  Cloud,
  Award,
  Swords,
  CheckCircle2,
  Lock,
  Crown,
} from 'lucide-react';
import { GameMode, PlayerCustomization, GameSettings } from '../types';
import { soundManager } from '../audio/soundManager';
import { statsManager, PlayerLifetimeStats } from '../utils/statsManager';
import { soldierProgressionManager } from '../utils/soldierProgressionManager';
import { PWAInstallButton } from './PWAInstallButton';
import { DailyMissions } from './DailyMissions';
import { AuthModal } from './AuthModal';
import { FriendsManager } from './FriendsManager';
import { CustomRoomsLobby } from './CustomRoomsLobby';
import { AchievementsPanel } from './AchievementsPanel';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { InviteNotificationBanner } from './InviteNotificationBanner';
import { achievementsManager, ACHIEVEMENTS_LIST } from '../utils/achievementsManager';
import { cloudSyncManager } from '../utils/cloudSyncManager';
import { FirebaseUser, db, doc, getDoc, setDoc } from '../lib/firebase';

const MilitaryArenaBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* Main Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/military_arena_bg_1789831118619.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
          style={{ animation: 'slowZoom 30s ease-in-out infinite' }}
          onError={(e) => {
            (e.target as any).src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop';
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-neutral-950/40 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-transparent to-neutral-950/80" />
      </div>

      {/* Atmospheric Particles / Embers */}
      <div className="absolute inset-0 z-1">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/40 rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulseGlow ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Light Sweeps */}
      <div className="absolute inset-0 z-2 opacity-20">
        <div className="absolute top-0 -left-[10%] w-[120%] h-32 bg-amber-500/10 blur-[60px] rotate-[15deg] transform -translate-y-1/2" />
        <div className="absolute bottom-0 -right-[10%] w-[120%] h-32 bg-emerald-500/10 blur-[60px] -rotate-[15deg] transform translate-y-1/2" />
      </div>
    </div>
  );
};

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
  customization: PlayerCustomization;
  onUpdateCustomization: (updated: PlayerCustomization) => void;
  settings: GameSettings;
  onUpdateSettings: (updated: GameSettings) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  customization,
  onUpdateCustomization,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'play' | 'rooms' | 'leaderboard' | 'friends' | 'missions' | 'achievements' | 'profile' | 'custom' | 'settings' | 'help'>('dashboard');
  const [selectedMode, setSelectedMode] = useState<GameMode>('deathmatch');
  const [stats, setStats] = useState<PlayerLifetimeStats>(() => statsManager.getStats());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [targetRoomCode, setTargetRoomCode] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Admin Panel States
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminNewVersion, setAdminNewVersion] = useState('1.1.0');
  const [adminDownloadUrl, setAdminDownloadUrl] = useState('');
  const [adminChangelogAr, setAdminChangelogAr] = useState('');
  const [adminIsMandatory, setAdminIsMandatory] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);

  const handleOpenAdminPanel = async () => {
    setIsAdminPanelOpen(true);
    setAdminLoading(true);
    setAdminSuccess(false);
    try {
      const configRef = doc(db, 'system', 'config');
      const snap = await getDoc(configRef);
      if (snap.exists()) {
        const data = snap.data();
        setAdminNewVersion(data.latestVersion || '1.1.0');
        setAdminDownloadUrl(data.updateUrl || '');
        setAdminChangelogAr(data.changelogAr || '');
        setAdminIsMandatory(!!data.isMandatory);
      }
    } catch (e) {
      console.error('Failed to load version config in Admin panel:', e);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSaveAdminConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminSuccess(false);
    try {
      const configRef = doc(db, 'system', 'config');
      await setDoc(configRef, {
        latestVersion: adminNewVersion.trim(),
        updateUrl: adminDownloadUrl.trim(),
        changelogAr: adminChangelogAr.trim() || 'إصلاحات عامة وتحسينات لسرعة اللعبة',
        changelogEn: 'General fixes and performance improvements',
        isMandatory: adminIsMandatory,
      }, { merge: true });
      
      setAdminSuccess(true);
      setTimeout(() => setAdminSuccess(false), 3000);
      try {
        soundManager.playVictory();
      } catch { /* ignore */ }
    } catch (e) {
      console.error('Failed to save version config:', e);
      alert('تعذر حفظ التعديلات. تحقق من صلاحيات الاتصال بقاعدة البيانات.');
    } finally {
      setAdminLoading(false);
    }
  };

  React.useEffect(() => {
    cloudSyncManager.init((user) => {
      setCurrentUser(user);
      setStats(statsManager.getStats());
    });

    // Check URL query parameters for ?room=ROOM-XXXX
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setTargetRoomCode(roomParam);
        setActiveTab('rooms');
      }
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (currentUser) {
        cloudSyncManager.syncToCloud().then((success) => {
          if (success) {
            console.log('Online reconnection: Syncing offline data to Cloud...');
            setStats(statsManager.getStats());
          }
        });
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  const handleShareGame = async () => {
    let shareUrl = window.location.href;
    // Replace private dev platform link with public share link if needed
    if (shareUrl.includes('aistudio.google.com') || shareUrl.includes('ais-dev-')) {
      shareUrl = 'https://ais-pre-5bjlprp7tccw5lc6h5wcnd-209807462470.europe-west2.run.app';
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mini Battle Arena 2D',
          text: 'تعال نلعب ضد بعض في لعبة ميني باتل أرينا 2D حماسية! ⚔️🔥',
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      alert(`رابط اللعبة لإرساله لأصدقائك:\n${shareUrl}`);
    }
  };

  const camoColors = [
    { name: 'غابة عسكرية', value: '#15803d' },
    { name: 'صحراوي تكتيكي', value: '#b45309' },
    { name: 'قوات خاصة كحلي', value: '#1d4ed8' },
    { name: 'كوماندوز أحمر', value: '#b91c1c' },
    { name: 'عمليات ليلية سوداء', value: '#1e293b' },
  ];

  const headgears: { id: PlayerCustomization['headgear']; nameAr: string }[] = [
    { id: 'helmet', nameAr: 'خوذة قتال كلاسيكية' },
    { id: 'beret', nameAr: 'بيريه كوماندوز أحمر' },
    { id: 'bandana', nameAr: 'عصابة رأس رامبو' },
    { id: 'cap', nameAr: 'قبعة عسكرية تكتيكية' },
  ];

  const handleStart = (mode: GameMode) => {
    soundManager.playPistol();
    onStartGame(mode);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-row p-4 md:p-6 overflow-hidden select-none border-4 border-neutral-700 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
      <MilitaryArenaBackground />
      <div className="absolute inset-0 bg-neutral-950/20 pointer-events-none z-5" />

      {/* Side Navigation for better landscape use */}
      <div className="relative z-10 w-48 md:w-64 flex flex-col gap-2 shrink-0 border-r border-neutral-800 pr-4 overflow-y-auto scrollbar-thin">
        {/* Title */}
        <div className="text-center py-4 mb-2">
            <h1 className="text-xl font-black text-white tracking-tighter">MINI ARENA</h1>
            <span className="text-[9px] text-amber-500 font-bold tracking-widest uppercase">2D COMBAT</span>
        </div>
        
        {/* Navigation Tabs */}
        {[
            { id: 'dashboard', label: 'الرئيسية', icon: Shield },
            { id: 'play', label: 'القتال السريع', icon: Play },
            { id: 'rooms', label: 'السيرفرات', icon: Globe },
            { id: 'leaderboard', label: 'الصدارة', icon: Crown },
            { id: 'friends', label: 'الأصدقاء', icon: Users },
            { id: 'missions', label: 'المهام', icon: Target },
            { id: 'profile', label: 'الملف الشخصي', icon: User },
            { id: 'custom', label: 'تخصيص', icon: Palette },
            { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:bg-neutral-800'
                }`}
            >
                <tab.icon className="w-4 h-4" />
                {tab.label}
            </button>
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto p-4">
        {/* Top bar for status */}
        <div className="flex justify-between items-center mb-4 bg-black/40 p-3 rounded-2xl border border-neutral-800">
           <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
              <span className="text-amber-500">🪙</span> {stats.coins}
           </div>
           <PWAInstallButton />
        </div>
        
        {/* Content Body */}
        <div className="flex-1 w-full flex justify-center">
            {activeTab === 'dashboard' && (
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-5 pb-6">
                    {/* ZONE 1: PLAY COMMAND CENTER */}
                    <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div>
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-4">
                          <h3 className="text-sm md:text-base font-black text-amber-400 flex items-center gap-2">
                            <Swords className="w-5 h-5 text-amber-500 animate-pulse" />
                            <span>غرفة القيادة واللعب (Play Zone)</span>
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                          احشد قواك وانطلق إلى خريطة "المخفر العسكري والكهوف"! اختر طور اللعب المفضل لديك وابدأ الحرب الآن.
                        </p>
                        <button
                          id="btn-dashboard-start"
                          onClick={() => handleStart(selectedMode)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-neutral-950 font-black text-xs md:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-95 transition-all"
                        >
                          <Play className="w-4 h-4 fill-neutral-950" />
                          <span>انطلق الآن ⚔️</span>
                        </button>
                      </div>
                    </div>

            {/* ZONE 2: SOLDIER HEADQUARTERS & PROFILE (منطقة مظهر وملف الجندي) */}
            <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-4">
                  <h3 className="text-sm md:text-base font-black text-emerald-400 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    <span>مقر قيادة ومظهر الجندي (Profile)</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black font-mono border border-emerald-500/20">
                    رتبة: {statsManager.getXPInfo(stats).level}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-neutral-950/50 p-3.5 border border-neutral-800/80 rounded-xl mb-4">
                  {/* Avatar Mini Display Box with customized color indicator */}
                  <div
                    className="w-14 h-14 rounded-2xl border-2 border-amber-400 flex items-center justify-center relative overflow-hidden shrink-0 shadow-lg"
                    style={{ backgroundColor: customization.camoColor }}
                  >
                    <div
                      className="w-9 h-9 rounded-full border border-neutral-950 flex items-center justify-center relative shadow-inner"
                      style={{ backgroundColor: customization.skinTone }}
                    >
                      {customization.sunglasses && (
                        <div className="absolute w-6.5 h-2 bg-neutral-950 rounded-xs top-3.5 z-10 flex gap-0.5 justify-center">
                          <div className="w-2.5 h-1.5 bg-cyan-400/50 rounded-xs" />
                          <div className="w-2.5 h-1.5 bg-cyan-400/50 rounded-xs" />
                        </div>
                      )}
                      <div className="text-[10px] absolute bottom-1 text-neutral-950/30 select-none">MIL</div>
                    </div>
                  </div>

                  {(() => {
                    const xpInfo = statsManager.getXPInfo(stats);
                    const rank = statsManager.getRank(xpInfo.totalXP, stats.totalMatches);
                    return (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white truncate block">{customization.playerName}</span>
                          <span className="text-[11px] text-amber-400 font-bold">
                            {rank.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          الرتبة العسكرية: <span className="text-amber-400 font-bold">{rank.titleAr}</span>
                        </span>

                        {/* XP Progress Slider representation */}
                        <div className="w-full mt-2.5">
                          <div className="flex justify-between text-[9px] font-mono text-neutral-400 mb-0.5">
                            <span>الخبرة: {xpInfo.xpInCurrentLevel} / {xpInfo.nextLevelXP - xpInfo.currentLevelXP} XP</span>
                            <span>{xpInfo.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden p-0.5 border border-neutral-800/80">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${xpInfo.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-800/60 mt-auto">
                <button
                  onClick={() => setActiveTab('custom')}
                  className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Palette className="w-4 h-4" />
                  <span>تعديل السكن والزي والمظهر 🎨</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all border border-neutral-700/50"
                >
                  عرض الإحصائيات 👤
                </button>
              </div>
            </div>

            {/* ZONE 3: SQUADS & ONLINE LOBBY (منطقة الغرف والتحالف) */}
            <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-4">
                  <h3 className="text-sm md:text-base font-black text-blue-400 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>كتيبة الأصدقاء والغرف الأونلاين (Friends & Lobby)</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold border border-blue-500/20">
                    نشط أونلاين 🌐
                  </span>
                </div>

                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  أنشئ غرف مخصصة والعب 1v1 أو مع أصدقائك في السيرفر! انقل الكود الخاص بك أو انضم لغرف أصدقائك بلمسة واحدة.
                </p>

                {/* Share Action Block inside Card */}
                <div className="bg-neutral-950/60 border border-neutral-800 p-3 rounded-xl flex items-center justify-between gap-2.5">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-neutral-400 font-bold block">مشاركة رابط التحدي المباشر</span>
                    <span className="text-[9px] text-neutral-500 truncate block mt-0.5">انسخ الرابط وأرسله لخصمك ليدخل الغرفة فوراً</span>
                  </div>
                  <button
                    onClick={handleShareGame}
                    className="px-3 py-1.5 bg-blue-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shrink-0 transition-all active:scale-95 shadow-md shadow-blue-500/10"
                  >
                    {copiedShareLink ? 'تم النسخ! ✓' : 'نسخ الرابط 🔗'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-800/60 mt-auto">
                <button
                  onClick={() => setActiveTab('rooms')}
                  className="flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>دخول سيرفرات اللعب أونلاين 🌐</span>
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all border border-neutral-700/50"
                >
                  قائمة الأصدقاء 👥
                </button>
              </div>
            </div>

            {/* ZONE 4: DAILY MISSIONS & TROPHIES (منطقة العمليات الخاصة والمهام) */}
            <div className="bg-neutral-900/80 border-2 border-neutral-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group hover:border-yellow-500/50 transition-all shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-4">
                  <h3 className="text-sm md:text-base font-black text-yellow-400 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500 animate-spin-slow" />
                    <span>المهام الاستكشافية والإنجازات (Missions Zone)</span>
                  </h3>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                </div>

                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  احصل على مكافآت ونقاط خبرة XP كبيرة بمجرد إتمام المهام اليومية (إصابات رأس، تصفية جنود، النجاة).
                </p>

                {/* Unlocked badges list */}
                <div className="grid grid-cols-2 gap-2 bg-neutral-950/40 p-2.5 border border-neutral-800 rounded-xl text-[10px]">
                  <div className="flex items-center justify-between text-neutral-400 px-1">
                    <span>المهام النشطة اليوم:</span>
                    <span className="text-yellow-400 font-bold font-mono">3 مهام 🎯</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 px-1">
                    <span>أوسمة محققة:</span>
                    <span className="text-amber-400 font-bold font-mono">
                      {achievementsManager.getUnlockedAchievements(stats).length} / {ACHIEVEMENTS_LIST.length} 🏆
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-800/60 mt-auto">
                <button
                  onClick={() => setActiveTab('missions')}
                  className="flex-1 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Target className="w-4 h-4 text-yellow-500" />
                  <span>تفقد مهام القتال واستلام الجوائز 🎯</span>
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all border border-neutral-700/50"
                >
                  عرض الأوسمة 🏆
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FRIENDS MANAGER */}
        {activeTab === 'friends' && (
          <div className="w-full max-w-3xl">
            <FriendsManager
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onJoinRoomByCode={(code) => {
                setTargetRoomCode(code);
                setActiveTab('rooms');
              }}
            />
          </div>
        )}

        {/* TAB: CUSTOM ROOMS LOBBY */}
        {activeTab === 'rooms' && (
          <div className="w-full max-w-3xl">
            <CustomRoomsLobby
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              initialRoomCode={targetRoomCode}
              onStartCustomGame={(room, myTeam) => {
                let mode: GameMode = 'deathmatch';
                if (room.mode === '1v1' || room.mode === '2v2' || room.mode === '3v3') {
                  mode = 'team';
                }
                onStartGame(mode);
              }}
            />
          </div>
        )}

        {/* TAB: GLOBAL LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="w-full max-w-4xl">
            <GlobalLeaderboard />
          </div>
        )}

        {/* TAB: ACHIEVEMENTS & BADGES */}
        {activeTab === 'achievements' && (
          <div className="w-full max-w-3xl">
            <AchievementsPanel stats={stats} />
          </div>
        )}

        {/* TAB: DAILY MISSIONS */}
        {activeTab === 'missions' && (
          <div className="w-full max-w-3xl">
            <DailyMissions onRewardClaimed={() => setStats(statsManager.getStats())} />
          </div>
        )}

        {/* TAB: PLAYER PROFILE & LIFETIME STATS */}
        {activeTab === 'profile' && (
          <div className="w-full max-w-3xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-5">
            {(() => {
              const xpInfo = statsManager.getXPInfo(stats);
              const rank = statsManager.getRank(xpInfo.totalXP, stats.totalMatches);
              const kdRatio = stats.totalDeaths === 0 ? stats.totalKills.toFixed(1) : (stats.totalKills / stats.totalDeaths).toFixed(2);
              const headshotRatio = stats.totalKills === 0 ? '0.0' : ((stats.totalHeadshots / stats.totalKills) * 100).toFixed(1);
              const winRate = stats.totalMatches === 0 ? '0.0' : ((stats.totalWins / stats.totalMatches) * 100).toFixed(1);
              const unlockedBadges = achievementsManager.getUnlockedAchievements(stats);

              return (
                <>
                  {/* Header Rank Banner */}
                  <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Avatar & Player Name */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div
                        className="w-16 h-16 rounded-2xl border-2 border-amber-400 flex items-center justify-center relative shadow-lg overflow-hidden shrink-0"
                        style={{ backgroundColor: customization.camoColor }}
                      >
                        <div
                          className="w-10 h-10 rounded-full border border-neutral-900 flex items-center justify-center relative"
                          style={{ backgroundColor: customization.skinTone }}
                        >
                          {customization.sunglasses && (
                            <div className="w-7 h-2.5 bg-neutral-950 rounded-sm mt-0.5 z-10" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-white">{customization.playerName}</h3>
                          <span className="text-sm">{rank.badge}</span>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black font-mono">
                            LVL {xpInfo.level}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                          <span>{rank.titleAr}</span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-neutral-400 font-mono text-[11px]">{rank.titleEn}</span>
                        </p>
                      </div>
                    </div>

                    {/* Rank Progression Bar */}
                    <div className="w-full md:w-64 bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-neutral-400">التقدم للرتبة التالية</span>
                        <span className="text-amber-400 font-mono">{rank.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-neutral-700">
                        <div
                          className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${rank.progressPercent}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-neutral-500 text-left font-mono dir-ltr flex justify-between items-center dir-rtl">
                        <span>{stats.totalKills} / {rank.nextRankKills} Kills</span>
                        <button
                          onClick={() => setActiveTab('leaderboard')}
                          className="text-amber-400 hover:text-amber-300 font-bold underline text-[10px]"
                        >
                          ترتيبك العالمي 🏆
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* UNLOCKED BADGES SHOWCASE ON PROFILE */}
                  <div className="bg-neutral-950/80 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>الأوسمة المفتوحة في ملفك ({unlockedBadges.length} / {ACHIEVEMENTS_LIST.length})</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('achievements')}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        عرض لوحة الإنجازات الكاملة ➔
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {ACHIEVEMENTS_LIST.map((ach) => {
                        const isUnlocked = ach.condition(stats);
                        return (
                          <div
                            key={ach.id}
                            title={`${ach.titleAr}: ${ach.descriptionAr}`}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                              isUnlocked
                                ? `bg-gradient-to-r ${ach.color} text-white border-transparent shadow-md`
                                : 'bg-neutral-900/60 border-neutral-800 text-neutral-600 opacity-40 grayscale'
                            }`}
                          >
                            <span>{ach.badgeIcon}</span>
                            <span>{ach.titleAr}</span>
                            {isUnlocked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />
                            ) : (
                              <Lock className="w-3 h-3 text-neutral-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* VISUAL XP PROGRESSION BAR & LEVEL STATUS */}
                  <div className="bg-gradient-to-br from-amber-950/40 via-neutral-950 to-neutral-950 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                          <Zap className="w-5 h-5 fill-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">مستوى الخبرة (Player Level)</span>
                            <span className="text-xs font-black text-amber-400 font-mono">مستوى {xpInfo.level}</span>
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            إجمالي نقاط الخبرة المكتسبة: <strong className="text-amber-300 font-mono">{xpInfo.totalXP.toLocaleString()} XP</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <span className="text-xs text-neutral-400 block dir-ltr">
                          متبقي <strong className="text-amber-400">{xpInfo.xpNeededForNextLevel.toLocaleString()} XP</strong> للمستوى القادم
                        </span>
                      </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>XP الحالي: {xpInfo.xpInCurrentLevel} XP</span>
                        <span className="text-amber-400 font-bold">{xpInfo.progressPercent}% Complete</span>
                      </div>
                      <div className="w-full bg-neutral-900 h-3.5 rounded-full overflow-hidden p-0.5 border border-amber-500/30 shadow-inner relative">
                        <div
                          className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                          style={{ width: `${xpInfo.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Interactive Level Up Simulator */}
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playButtonClick();
                          
                          // 1. Award simulated combat stats to statsManager (which recalculates totalXP dynamically)
                          const currentStats = statsManager.getStats();
                          const updatedStats = {
                            ...currentStats,
                            totalKills: currentStats.totalKills + 5,
                            totalHeadshots: currentStats.totalHeadshots + 2,
                            totalWins: currentStats.totalWins + 1,
                            totalMatches: currentStats.totalMatches + 1,
                            totalDamageDealt: currentStats.totalDamageDealt + 500,
                          };
                          statsManager.saveStats(updatedStats);
                          setStats(updatedStats);

                          // 2. Add matching XP to soldierProgressionManager which broadcasts the soldier-level-up event!
                          soldierProgressionManager.addXP(650, 'تدريب ميداني عسكري مكثف');
                        }}
                        className="w-full py-2 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black animate-spin" style={{ animationDuration: '3s' }} />
                        <span>شحن +650 XP وتجربة ترقية المستوى الفورية ⚡</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/60 pt-2">
                      <span>⚡ يكسب اللاعب: 100 XP للقتل | 50 XP هيدشوت | 300 XP للفوز</span>
                      <span className="font-mono">LVL {xpInfo.level} ➔ LVL {xpInfo.level + 1}</span>
                    </div>
                  </div>

                  {/* Core Lifetime Headline Stat Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Total Kills */}
                    <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold">إجمالي القتلى</span>
                        <Crosshair className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">{stats.totalKills}</span>
                      <span className="text-[10px] text-neutral-500 mt-1">معدل K/D: {kdRatio}</span>
                    </div>

                    {/* Total Headshots */}
                    <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold">إصابات الرأس</span>
                        <Target className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-2xl font-black text-amber-400 font-mono">{stats.totalHeadshots}</span>
                      <span className="text-[10px] text-neutral-500 mt-1">نسبة الدقة: {headshotRatio}%</span>
                    </div>

                    {/* Total Wins */}
                    <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-sky-500/40 transition-all">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold">الانتصارات</span>
                        <Trophy className="w-4 h-4 text-sky-400" />
                      </div>
                      <span className="text-2xl font-black text-sky-400 font-mono">{stats.totalWins}</span>
                      <span className="text-[10px] text-neutral-500 mt-1">نسبة الفوز: {winRate}%</span>
                    </div>

                    {/* Longest Kill Streak */}
                    <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/40 transition-all">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-bold">أطول سلسلة قتلات</span>
                        <Flame className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="text-2xl font-black text-rose-500 font-mono">{stats.longestKillStreak}</span>
                      <span className="text-[10px] text-neutral-500 mt-1">قتلات متتالية دون موت</span>
                    </div>
                  </div>

                  {/* Secondary Lifetime Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-neutral-400 mb-0.5">المباريات الملعوبة</span>
                      <span className="text-base font-black text-white font-mono">{stats.totalMatches}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-neutral-400 mb-0.5">إجمالي الوفيات</span>
                      <span className="text-base font-black text-rose-400 font-mono">{stats.totalDeaths}</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-neutral-400 mb-0.5">إجمالي الضرر</span>
                      <span className="text-base font-black text-yellow-400 font-mono">{stats.totalDamageDealt.toLocaleString()} HP</span>
                    </div>
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-neutral-400 mb-0.5">أعلى موجة بقاء</span>
                      <span className="text-base font-black text-purple-400 font-mono">الموجة {stats.highestSurvivalWave}</span>
                    </div>
                  </div>

                  {/* Match History Table / List */}
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400 mb-2 flex items-center justify-between">
                      <span>سجل المعارك الأخيرة ({stats.matchHistory?.length || 0})</span>
                      <span className="text-[10px] text-neutral-500">محفوظ تلقائياً في المتصفح 💾</span>
                    </h4>

                    {(!stats.matchHistory || stats.matchHistory.length === 0) ? (
                      <div className="bg-neutral-950 border border-neutral-800/80 rounded-2xl p-6 text-center text-xs text-neutral-500">
                        لا توجد معارك مسجلة بعد. ابدأ القتال لتسجيل إحصائياتك! ⚔️
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {stats.matchHistory.map((m) => (
                          <div
                            key={m.id}
                            className="bg-neutral-950 border border-neutral-800/70 rounded-xl p-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  m.isVictory
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {m.isVictory ? 'انتصار' : 'هزيمة'}
                              </span>
                              <span className="text-neutral-300 font-bold uppercase text-[11px]">
                                {m.mode === 'deathmatch' ? 'موت عشوائي' : m.mode === 'team' ? 'فرق 3v3' : 'بقاء'}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
                              <span>🎯 {m.kills} قتلى</span>
                              <span>💀 {m.deaths}</span>
                              <span className="text-amber-400 font-bold">💥 {m.headshots} هيدشوت</span>
                              <span className="text-neutral-500 text-[10px]">
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    {!showResetConfirm ? (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="text-xs font-bold text-rose-500/80 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>إعادة ضبط الإحصائيات (Reset Stats)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-400">تأكيد مسح كافة الإحصائيات؟</span>
                        <button
                          onClick={() => {
                            const fresh = statsManager.resetStats();
                            setStats(fresh);
                            setShowResetConfirm(false);
                          }}
                          className="px-2.5 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-500"
                        >
                          نعم، تصفير
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-2.5 py-1 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-lg hover:bg-neutral-700"
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* TAB 1: PLAY & MODES */}
        {activeTab === 'play' && (
          <div className="w-full max-w-4xl flex flex-col gap-4">
            {/* Quick Online Servers & Custom Rooms Banner */}
            <div className="w-full bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/20 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                  <Globe className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white">السيرفرات العامة والغرف الخاصة 🌐</h4>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                      نشط 🟢
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    العب أونلاين ضد لاعبين حقيقيين في الشرق الأوسط وأوروبا، أو أنشئ غرفتك الخاصة (1v1, 2v2)!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('rooms')}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 active:scale-95"
              >
                <Swords className="w-4 h-4" />
                <span>فتح قائمة السيرفرات والغرف ⚔️</span>
              </button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free For All (Deathmatch) */}
            <div
              onClick={() => setSelectedMode('deathmatch')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedMode === 'deathmatch'
                  ? 'bg-neutral-900 border-amber-400 shadow-xl shadow-amber-500/10 scale-102'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Crosshair className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">موت عشوائي (FFA)</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  الكل ضد الكل! 4 مقاتلين آليين أذكياء في الساحة. الهدف: تحقيق 15 قتلة قبل انتهاء الوقت.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-amber-400 font-bold">
                <span>4 جنود AI</span>
                <span>3 دقائق</span>
              </div>
            </div>

            {/* Team Battle */}
            <div
              onClick={() => setSelectedMode('team')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedMode === 'team'
                  ? 'bg-neutral-900 border-blue-500 shadow-xl shadow-blue-500/10 scale-102'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">معركة الفرق (Team)</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  الفريق الأزرق ضد الفريق الأحمر! تعاون مع حلفائك الآليين لهزيمة فرقة الأعداء (25 قتلة).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-blue-400 font-bold">
                <span>3 ضد 3</span>
                <span>فريق أزرق vs أحمر</span>
              </div>
            </div>

            {/* Survival Mode */}
            <div
              onClick={() => setSelectedMode('survival')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedMode === 'survival'
                  ? 'bg-neutral-900 border-rose-500 shadow-xl shadow-rose-500/10 scale-102'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">وضع البقاء (Survival)</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  موجات متتالية من جنود الميليشيا تهاجمك! تزداد الشراسة والعدد مع كل موجة تصمد فيها.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-rose-400 font-bold">
                <span>موجات لا نهائية</span>
                <span>صعوبة متزايدة</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 2: CHARACTER CUSTOMIZATION */}
        {activeTab === 'custom' && (
          <div className="w-full max-w-2xl bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 items-center">
            {/* Live Soldier Avatar Visual Box */}
            <div className="w-44 h-56 rounded-2xl bg-neutral-950 border-2 border-neutral-800 flex flex-col items-center justify-center relative p-3 shadow-inner">
              <div className="absolute top-2 left-2 text-[9px] font-bold text-neutral-500">
                معاينة
              </div>
              {/* Soldier Cartoon Miniature */}
              <div className="relative flex flex-col items-center">
                {/* Head with headgear */}
                <div
                  className="w-14 h-14 rounded-full border-2 border-neutral-900 relative flex items-center justify-center shadow-md"
                  style={{ backgroundColor: customization.skinTone }}
                >
                  {/* Headgear visual */}
                  {customization.headgear === 'helmet' && (
                    <div
                      className="absolute -top-3 w-16 h-8 rounded-t-full border-b-2 border-neutral-900"
                      style={{ backgroundColor: customization.camoColor }}
                    />
                  )}
                  {customization.headgear === 'beret' && (
                    <div className="absolute -top-3 -right-2 w-16 h-7 rounded-full bg-red-600 border border-neutral-900 rotate-12" />
                  )}
                  {customization.headgear === 'bandana' && (
                    <div className="absolute -top-1 w-16 h-3 bg-red-600" />
                  )}
                  {/* Sunglasses */}
                  {customization.sunglasses && (
                    <div className="w-10 h-4 bg-neutral-950 rounded-sm mt-1 z-10 border border-neutral-800 shadow" />
                  )}
                </div>

                {/* Body Fatigues */}
                <div
                  className="w-16 h-16 rounded-xl border-2 border-neutral-900 mt-1 relative flex items-center justify-center shadow"
                  style={{ backgroundColor: customization.camoColor }}
                >
                  {/* Combat vest */}
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700" />
                </div>
              </div>

              <div className="mt-3 text-xs font-bold text-amber-400">
                {customization.playerName}
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              {/* Name Input */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">اسم المقاتل</label>
                <input
                  type="text"
                  value={customization.playerName}
                  onChange={(e) => onUpdateCustomization({ ...customization, playerName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  maxLength={15}
                />
              </div>

              {/* Camo Colors */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">لون الزي العسكري</label>
                <div className="flex items-center gap-2">
                  {camoColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => onUpdateCustomization({ ...customization, camoColor: c.value })}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                        customization.camoColor === c.value ? 'scale-110 border-white ring-2 ring-amber-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Character Avatar Style (Iconic 4 Soldiers) */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">شخصية المقاتل الأيقونية</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 1, name: 'جندي الخوذة (الكلاسيكي)' },
                    { id: 2, name: 'كوماندوز العصابة' },
                    { id: 3, name: 'بيريه أخضر (صاعقة)' },
                    { id: 4, name: 'قائد الثوار (بيريه أحمر)' },
                  ].map((av) => (
                    <button
                      key={av.id}
                      onClick={() => onUpdateCustomization({ ...customization, charAvatarIndex: av.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-right ${
                        (customization.charAvatarIndex || 1) === av.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {av.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headgear */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">غطاء الرأس</label>
                <div className="grid grid-cols-2 gap-2">
                  {headgears.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => onUpdateCustomization({ ...customization, headgear: h.id })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-right ${
                        customization.headgear === h.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {h.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunglasses Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-neutral-300">نظارات شمسية تكتيكية</span>
                <input
                  type="checkbox"
                  checked={customization.sunglasses}
                  onChange={(e) => onUpdateCustomization({ ...customization, sunglasses: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="w-full max-w-lg bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-2">
              إعدادات اللعبة والصوت
            </h3>

            {/* Sound Volume */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundVolume > 0 ? (
                  <Volume2 className="w-5 h-5 text-amber-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-neutral-500" />
                )}
                <span className="text-sm font-semibold text-neutral-200">مؤثرات الصوت (SFX)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ ...settings, soundVolume: val });
                  soundManager.setVolume(val);
                }}
                className="accent-amber-500 w-32 cursor-pointer"
              />
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-semibold text-neutral-200">الاهتزاز التفاعلي (Haptics)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.haptics}
                onChange={(e) => onUpdateSettings({ ...settings, haptics: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Auto Fire */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-semibold text-neutral-200">إطلاق تلقائي عند سحب عصا التصويب</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoFire}
                onChange={(e) => onUpdateSettings({ ...settings, autoFire: e.target.checked })}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Language */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <span className="text-sm font-semibold text-neutral-200">اللغة / Language</span>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => onUpdateSettings({ ...settings, language: 'ar' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    settings.language === 'ar' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    settings.language === 'en' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HELP & GUIDE */}
        {activeTab === 'help' && (
          <div className="w-full max-w-2xl bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-amber-400">دليل التحكم وأسلوب اللعب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-300">
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="font-bold text-white block mb-1">عصا التحكم اليسرى:</span>
                التحرك يساراً ويميناً، والنزول من المنصات.
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="font-bold text-white block mb-1">عصا التحكم اليمنى:</span>
                التصويب بزاوية 360 درجة مع خط ليزر إرشادي، والإطلاق التلقائي.
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="font-bold text-white block mb-1">زر النفاثة (Jetpack):</span>
                الطيران السلس في الهواء. يستهلك الوقود ويعود للشحن عند الهبوط.
              </div>
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <span className="font-bold text-white block mb-1">البراميل المتفجرة:</span>
                أطلق النار على البراميل الحمراء لتفجير الأعداء المتجمعين حولها!
              </div>
            </div>

            <h3 className="text-base font-bold text-amber-400 pt-2">الأسلحة المتاحة في الساحة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-neutral-300">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                <span className="font-black text-amber-400 block">بندقية M4</span>
                رشاش آلي متوازن
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                <span className="font-black text-rose-500 block">شوزن قتالي</span>
                شديد الفتك عن قرب
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                <span className="font-black text-yellow-400 block">قاذف RPG</span>
                انفجار هائل ومساحة ضرر
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                <span className="font-black text-cyan-400 block">قناصة AWM</span>
                مدى فائق ودقة مطلقة
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="border-t border-neutral-800 pt-3 shrink-0 flex items-center justify-between gap-3 mt-auto flex-wrap">
        <div className="text-[10px] md:text-xs text-neutral-500 flex items-center gap-1.5 flex-wrap">
          <span>خريطة: المخفر والكهوف العسكرية 🗺️</span>
          <span className="hidden md:inline">•</span>
          <span>تطوير وإشراف المطور: <strong className="text-amber-400 font-extrabold text-[11px]">محمد أحمد السيد</strong> 🛡️</span>
          <span className="hidden md:inline">•</span>
          <span>دعم اللمس، اللوحات والماوس 🎮</span>
        </div>

        {activeTab !== 'rooms' && (
          <button
            id="btn-main-start-game"
            onClick={() => handleStart(selectedMode)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-neutral-950 font-black text-xs md:text-sm shadow-xl shadow-amber-500/15 flex items-center gap-1.5 hover:opacity-95 active:scale-95 transition-all shrink-0"
          >
            <Play className="w-4 h-4 fill-neutral-950" />
            <span>بدء المعركة الآن ⚔️</span>
          </button>
        )}
      </div>

      {/* Cloud Auth & Progress Save Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Developer Update Control Board Modal */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-right">
          <div className="relative w-full max-w-md overflow-hidden bg-neutral-900 border-2 border-amber-500 rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] p-6">
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <button
                onClick={() => setIsAdminPanelOpen(false)}
                className="text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                إغلاق ✕
              </button>
              <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5 justify-end">
                <span>لوحة التحكم وإدارة تحديثات اللعبة 👑</span>
              </h3>
            </div>

            {adminLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-xs text-neutral-400">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <span>جاري قراءة وتعديل قاعدة البيانات السحابية...</span>
              </div>
            )}

            {!adminLoading && (
              <form onSubmit={handleSaveAdminConfig} className="space-y-4">
                {adminSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-xl p-3 text-center animate-pulse">
                    ✓ تم نشر التحديث وحفظ البيانات في السحابة بنجاح!
                  </div>
                )}

                <p className="text-[11px] text-neutral-400 leading-relaxed text-right">
                  أهلاً بك يا بطل <strong>محمد السيد</strong>! يمكنك هنا رفع إصدار اللعبة، وضع رابط التحميل الجديد، وسيقوم التطبيق بإخطار جميع أصدقائك فوراً وتلقائياً بالخلفية عند فتح اللعبة!
                </p>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 font-bold block">رقم الإصدار الجديد (Version Number):</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 1.1.0"
                    value={adminNewVersion}
                    onChange={(e) => setAdminNewVersion(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 font-bold block">رابط تحميل ملف الـ APK الجديد:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/game.apk"
                    value={adminDownloadUrl}
                    onChange={(e) => setAdminDownloadUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 font-bold block">ملاحظات التحديث والمميزات المضافة (بالعربية):</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="مثال: إضافة نظام البحث السريع وحل مشاكل انقطاع المزامنة"
                    value={adminChangelogAr}
                    onChange={(e) => setAdminChangelogAr(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500 resize-none font-medium leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <input
                    type="checkbox"
                    id="adminIsMandatory"
                    checked={adminIsMandatory}
                    onChange={(e) => setAdminIsMandatory(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="adminIsMandatory" className="text-xs font-bold text-neutral-300 cursor-pointer">
                    هل هذا التحديث إجباري لمنع اللعب بالإصدارات السابقة؟
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-neutral-950 text-xs font-black rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                >
                  نشر التحديث لجميع اللاعبين الآن 🚀 (PUBLISH)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      </div> {/* Closing relative z-10 flex flex-col h-full w-full wrapper */}
    </div>
  );
};
