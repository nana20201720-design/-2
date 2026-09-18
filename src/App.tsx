import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Swords, Users, Shield, Package, Zap } from 'lucide-react';
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
import { soundManager } from './audio/soundManager';
import { settingsManager } from './utils/settingsManager';
import { haptics } from './utils/haptics';
import { cloudSyncManager } from './utils/cloudSyncManager';
import { SplashScreen } from './components/SplashScreen';
import { FirebaseUser } from './lib/firebase';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    oldLevel: number;
    rankTitleAr: string;
    skillPointsGained: number;
  } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleLevelUp = (e: CustomEvent) => {
      setLevelUpData({
        level: e.detail.level,
        oldLevel: e.detail.oldLevel,
        rankTitleAr: e.detail.rankTitleAr,
        skillPointsGained: e.detail.skillPointsGained,
      });
    };

    window.addEventListener('soldier-level-up', handleLevelUp as any);

    // Initialize Cloud Sync Manager
    cloudSyncManager.init((user) => {
      setCurrentUser(user);
    });

    return () => {
      window.removeEventListener('soldier-level-up', handleLevelUp as any);
    };
  }, []);

  useEffect(() => {
    // Apply initial settings sound volume
    const s = settingsManager.getSettings();
    soundManager.setVolume(s.soundVolume / 100);
    soundManager.setMuted(s.isMuted);
  }, []);

  // Smooth scroll to top on every screen transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const getScreenTitle = () => {
    switch (location.pathname) {
      case '/lobby':
        return 'اللوبي وقاعات اللعب الجماعي';
      case '/armory':
        return 'ترسانة الأسلحة والمعدات';
      case '/customize':
        return 'تخصيص المحارب والنفاثة';
      case '/store':
        return 'متجر الإمدادات والصناديق';
      default:
        return 'ساحة المعركة الميدانية';
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
    <div className="relative min-h-screen bg-[#0a110c] text-white font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* Ambient Military Background Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 bg-cover bg-center mix-blend-luminosity z-0"
        style={{ backgroundImage: 'url("/images/splash_background.jpg")' }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#0a110c]/80 via-[#0a110c]/95 to-[#0a110c] z-0" />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Persistent Authentic Header with Coins, Rank, Logo, and Settings button */}
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

      {/* Main Content Area with Smooth Route Transitions and generous bottom space */}
      <main className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 pb-36 sm:pb-32">
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

      {/* Floating Tactical Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0e1611]/95 backdrop-blur-xl border-t border-[#253928] shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
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
                  `relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 select-none ${
                    isActive
                      ? 'text-amber-400 font-black scale-105 bg-[#17261b] border border-amber-500/40 shadow-md shadow-amber-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#121c15]'
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
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"
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
