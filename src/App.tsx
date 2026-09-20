import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Swords, Users, Shield, Package, Zap, Eye, Video } from 'lucide-react';
import CharacterCustomization from './components/CharacterCustomization';
import StoreScreen from './components/StoreScreen';
import BattleScreen from './components/BattleScreen';
import LobbyScreen from './components/LobbyScreen';
import ArmoryScreen from './components/ArmoryScreen';
import { GameHeader } from './components/GameHeader';
import { SettingsModal } from './components/SettingsModal';
import { DailyLoginModal } from './components/DailyLoginModal';
import { LevelUpModal } from './components/LevelUpModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { ThreeMenuHangarWorld } from './components/ThreeMenuHangarWorld';
import { soundManager } from './audio/soundManager';
import { settingsManager } from './utils/settingsManager';
import { haptics } from './utils/haptics';
import { cloudSyncManager } from './utils/cloudSyncManager';
import { friendsAndRoomsManager } from './utils/friendsAndRoomsManager';
import { SplashScreen } from './components/SplashScreen';
import { FirebaseUser, auth, onAuthStateChanged } from './lib/firebase';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw } from 'lucide-react';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.12,
        ease: 'easeOut',
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDailyOpen, setIsDailyOpen] = useState(true);
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    oldLevel: number;
    rankTitleAr: string;
    skillPointsGained: number;
  } | null>(null);
  const location = useLocation();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('✅ Service Worker Registered');
    },
    onRegisterError(error) {
      console.error('❌ SW Registration error:', error);
    },
  });

  useEffect(() => {
    const handleLevelUp = (e: CustomEvent) => {
      setLevelUpData({
        level: e.detail.level,
        oldLevel: e.detail.oldLevel,
        rankTitleAr: e.detail.rankTitleAr,
        skillPointsGained: e.detail.skillPointsGained,
      });
    };

    const handleCinematicToggle = (e: CustomEvent) => {
      setIsCinematicMode(Boolean(e.detail?.active));
    };

    window.addEventListener('soldier-level-up', handleLevelUp as any);
    window.addEventListener('toggle-cinematic-3d-view', handleCinematicToggle as any);

    // Initialize Cloud Sync Manager
    cloudSyncManager.init(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // تنفيذ مقارنة البيانات (Reconciliation) عند بدء التشغيل
        const reconciledData = await cloudSyncManager.loadFromCloud(user.uid);
        if (reconciledData) {
          console.log('🛡️ تم التحقق من البيانات ومزامنتها بنجاح.');
        }
      }
    });

    // 💓 Auth Heartbeat: للتأكد من استمرار الجلسة
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('💓 Auth Heartbeat:', user ? 'Active' : 'Expired');
      if (user) setCurrentUser(user);
    });

    return () => {
      window.removeEventListener('soldier-level-up', handleLevelUp as any);
      window.removeEventListener('toggle-cinematic-3d-view', handleCinematicToggle as any);
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const s = settingsManager.getSettings();
    soundManager.setVolume(s.soundVolume / 100);
    soundManager.setMuted(s.isMuted);
  }, []);

  // Smooth scroll to top on every screen transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Firebase Live Player Status Sync (Online, In Battle, In Store)
  useEffect(() => {
    if (!currentUser) return;

    let status: 'online' | 'in_game' | 'in_store' | 'offline' = 'online';
    const path = location.pathname;

    if (path === '/store') {
      status = 'in_store';
    } else if (path === '/' || path === '/battle') {
      status = 'in_game';
    } else {
      status = 'online';
    }

    friendsAndRoomsManager.updateOnlineStatus(status);

    const interval = setInterval(() => {
      friendsAndRoomsManager.updateOnlineStatus(status);
    }, 30000);

    const handleUnload = () => {
      friendsAndRoomsManager.updateOnlineStatus('offline');
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [location.pathname, currentUser]);

  const getScreenTitle = () => {
    switch (location.pathname) {
      case '/lobby':
        return 'اللوبي وقاعات اللعب الجماعي';
      case '/armory':
        return 'ترسانة الأسلحة والمعدات 3D';
      case '/customize':
        return 'تخصيص المحارب والنفاثة 3D';
      case '/store':
        return 'متجر الإمدادات والصناديق 3D';
      default:
        return 'ساحة المعركة الميدانية 3D';
    }
  };

  const navItems = [
    { path: '/', name: 'المعركة', icon: Swords },
    { path: '/lobby', name: 'اللوبي', icon: Users },
    { path: '/armory', name: 'الترسانة', icon: Shield },
    { path: '/customize', name: 'المحارب', icon: Zap },
    { path: '/store', name: 'المتجر', icon: Package },
  ];

  return (
    <div className="relative min-h-screen bg-[#040705] text-white font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* 🟢 PWA Update Prompt */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 sm:bottom-28 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-[100] bg-gradient-to-br from-amber-500 to-yellow-600 p-4 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.4)] border-2 border-amber-300/50 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-black/20 p-2 rounded-xl">
                <RefreshCcw size={20} className="text-white animate-spin-slow" />
              </div>
              <div>
                <p className="text-black font-black text-sm">تحديث جديد متاح!</p>
                <p className="text-black/80 text-[11px] leading-tight font-bold">قم بتحديث التطبيق للحصول على الميزات الجديدة.</p>
              </div>
            </div>
            <button
              onClick={() => updateServiceWorker(true)}
              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-transform whitespace-nowrap"
            >
              تحديث الآن
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D CONTINUOUS HANGAR WORLD & CAMERA CONTROLLER */}
      <ThreeMenuHangarWorld />

      {/* Protective Tactical Atmospheric Overlay - Deep Stealth Bunker Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#040705]/92 via-[#040705]/75 to-[#040705]/96" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,7,5,0.85)_100%)]" />
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Persistent Authentic Header with Coins, Rank, Logo, and Settings button */}
      <div className={`transition-opacity duration-300 ${isCinematicMode ? 'opacity-20 hover:opacity-100 pointer-events-auto' : 'opacity-100'}`}>
        <GameHeader
          title={getScreenTitle()}
          onOpenSettings={() => {
            soundManager.playButtonClick();
            setIsSettingsOpen(true);
          }}
          onOpenAuth={() => {
            soundManager.playButtonClick();
            setIsAuthOpen(true);
          }}
          currentUser={currentUser}
        />
      </div>

      {/* Main Content Area with Smooth Route Transitions and generous bottom space */}
      <main
        className={`relative z-10 max-w-4xl mx-auto px-3 sm:px-4 pb-36 sm:pb-32 transition-all duration-300 ${
          isCinematicMode
            ? 'opacity-0 pointer-events-none scale-95'
            : 'opacity-100 scale-100'
        }`}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <BattleScreen />
                </PageTransition>
              }
            />
            <Route
              path="/lobby"
              element={
                <PageTransition>
                  <LobbyScreen />
                </PageTransition>
              }
            />
            <Route
              path="/armory"
              element={
                <PageTransition>
                  <ArmoryScreen />
                </PageTransition>
              }
            />
            <Route
              path="/customize"
              element={
                <PageTransition>
                  <CharacterCustomization />
                </PageTransition>
              }
            />
            <Route
              path="/store"
              element={
                <PageTransition>
                  <StoreScreen />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Floating Tactical Bottom Navigation Bar with 3D Indicator */}
      <nav
        className={`fixed bottom-0 inset-x-0 z-40 bg-[#0e1611]/90 backdrop-blur-xl border-t border-[#253928] shadow-[0_-8px_20px_rgba(0,0,0,0.6)] transition-all duration-300 ${
          isCinematicMode ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-md mx-auto flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  soundManager.playButtonClick();
                  haptics.light();
                }}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-300 select-none ${
                    isActive
                      ? 'text-amber-400 font-black scale-105 bg-[#17261b]/80 border border-amber-500/50 shadow-md shadow-amber-500/15'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#121c15]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
                    <span className="text-[10px] tracking-wide">{item.name}</span>
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Floating Exit Cinematic Mode Overlay Button */}
      {isCinematicMode && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-auto">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setIsCinematicMode(false);
              window.dispatchEvent(new CustomEvent('toggle-cinematic-3d-view', { detail: { active: false } }));
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-sm rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer border-2 border-amber-300"
          >
            <Eye size={16} />
            <span>العودة لواجهة القوائم</span>
          </button>
        </div>
      )}

      {/* Comprehensive Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
      />

      {/* Daily Login Reward Modal */}
      <DailyLoginModal isOpen={isDailyOpen} onClose={() => setIsDailyOpen(false)} />

      {/* Dynamic Celebratory Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpData !== null}
        level={levelUpData?.level || 1}
        oldLevel={levelUpData?.oldLevel || 1}
        rankTitleAr={levelUpData?.rankTitleAr || 'مجند'}
        skillPointsGained={levelUpData?.skillPointsGained || 1}
        onClose={() => setLevelUpData(null)}
      />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <AppContent />
      )}
    </Router>
  );
}
