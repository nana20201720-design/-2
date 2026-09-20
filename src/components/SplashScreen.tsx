import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Shield, Target, Play, Volume2, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import militaryArenaBg from '../assets/images/military_arena_bg_1789831118619.jpg';

const GAME_TIPS = [
  'السر في الفوز هو استخدام طاقة الجيت باك (Jetpack) بحكمة، لا تجعل خزان الوقود يفرغ في منتصف المعركة! 🚀',
  'استخدم قنبلة الغاز السام (Gas Grenade) لإجبار الأعداء على الخروج من المخابئ والأنفاق الضيقة! 💨',
  'سلاح الرشاش المزدوج (Dual SMG) مدمر في المسافات القريبة، ولكنه يفقد دقة التصويب في المسافات البعيدة! 🔫🔫',
  'عند تفعيل السكوب (Scope)، سيتم تعتيم أطراف الشاشة (Vignette) لزيادة التركيز وتخفيف حركة الكاميرا لتسهيل التصويب! 🎯',
  'الوقوف فوق برج المراقبة الأوسط يمنحك أفضلية تكتيكية لمراقبة الساحة بالكامل واصطياد الأعداء! 🏰',
  'تذكر دائماً أن إعادة تعبئة الذخيرة (Reload) في مكان آمن أفضل من مواجهة الأعداء بخزنة فارغة! 🔄',
  'يمكنك دعوة أصدقائك وتحديهم عبر السيرفرات والغرف الخاصة بمشاركة رابط اللعبة مباشرة! 👥',
  'تابع المهام اليومية باستمرار لتحصيل نقاط الخبرة (XP) الإضافية وترقية رتبتك التكتيكية بسرعة! 🏆',
  'استعن بسلاح القناص (Sniper) لإصابة الأهداف البعيدة بضربة واحدة قاتلة في الرأس! 💀',
  'استخدام الحواجز والغطاء في الممر السفلي للأنفاق يحميك من نيران الرشاشات الثقيلة! 🛡️'
];

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [randomTip, setRandomTip] = useState('');
  const [loadingPhase, setLoadingPhase] = useState<'loading' | 'ready' | 'starting'>('loading');
  const [isShaking, setIsShaking] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Cycle through tactical tips while loading
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * GAME_TIPS.length);
      setRandomTip(GAME_TIPS[randomIndex]);
    }, 3000); // Change tip every 3 seconds
    
    // Initial set
    setRandomTip(GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)]);
    
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar from 0 to 100
  useEffect(() => {
    const duration = 2500; // 2.5 seconds loading time
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setLoadingPhase('ready');
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const handleStartGame = () => {
    if (loadingPhase !== 'ready') return;
    
    // Play sound effects
    soundManager.playButtonClick();
    setTimeout(() => {
      soundManager.playExplosion(true);
    }, 100);

    // Set cinematic transition state
    setLoadingPhase('starting');
    setIsShaking(true);
    setShowFlash(true);

    // Wait for the epic white explosion flash to peak, then call onComplete
    setTimeout(() => {
      onComplete();
    }, 900);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-neutral-950 text-white select-none overflow-hidden p-6 md:p-12 transition-all duration-300 ${
      isShaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''
    }`}>
      
      {/* Cinematic Background Image with Ken Burns Zoom Effect */}
      <motion.div 
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.15 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${militaryArenaBg})`,
          filter: 'brightness(0.55) contrast(1.1) saturate(0.9)'
        }}
      />
      
      {/* Dynamic Animated Particle/Overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,rgba(0,0,0,0.9)_80%)] animate-pulse"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[spin_20s_linear_infinite]"></div>
      </div>
      
      {/* Multi-layered Gradients for Deep Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-950/70 to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,rgba(0,0,0,0.85)_80%)] pointer-events-none" />

      {/* Cyber Tactical Overlay Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* TOP HEADER STATUS */}
      <div className="w-full max-w-4xl flex justify-between items-center z-10 opacity-80 backdrop-blur-sm bg-black/30 px-4 py-2 rounded-xl border border-emerald-500/10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase">SECURE_INITIALIZE_OK</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">MEMBERS_ACTIVE</span>
          <span className="text-[10px] font-mono text-emerald-400 font-black">v2.5.0_PROD</span>
        </div>
      </div>

      {/* CENTER LOGO, BADGE, AND GLOWING BADGE */}
      <div className="flex flex-col items-center text-center z-10 max-w-xl my-auto">
        {/* Animated Badge & Custom Brand Logo Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", damping: 12 }}
          className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 p-1 shadow-[0_0_50px_rgba(245,158,11,0.55)] flex items-center justify-center mb-6 relative group"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
          <div className="w-full h-full rounded-[1.8rem] bg-neutral-950 flex items-center justify-center relative z-10 border border-amber-400/30 overflow-hidden">
            <img 
              src="/public/images/app_logo.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover opacity-80"
              onError={(e) => {
                // Fallback to flame icon if image fails
                (e.target as any).style.display = 'none';
              }}
            />
            <Flame className="w-16 h-16 text-amber-400 fill-amber-500/10 animate-[bounce_2s_infinite] absolute" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-neutral-950 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
          </div>
        </motion.div>

        {/* Game Title with Burning Orange Gradient */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-ops"
          style={{ fontFamily: "'Black Ops One', sans-serif" }}
        >
          MINI BATTLE ARENA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xs md:text-sm text-amber-200/90 mt-2 font-black tracking-wide max-w-md bg-black/45 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/20"
        >
          معركة الساحة المصغرة الأسطورية 2D • النفاثات والحروب التكتيكية الملحمية
        </motion.p>
      </div>

      {/* BOTTOM LOADING BAR / INTERACTIVE START BUTTON */}
      <div className="w-full max-w-lg flex flex-col items-center z-10 gap-6">
        {/* TACTICAL TIP BLOCK */}
        <AnimatePresence mode="wait">
          {randomTip && (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-black/60 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-md relative shadow-2xl"
            >
              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-amber-500 text-neutral-950 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Target className="w-3.5 h-3.5" />
                <span>نصيحة تكتيكية مخصصة ⚔️</span>
              </div>
              <p className="text-xs md:text-sm text-emerald-200 leading-relaxed text-center font-bold pt-1.5">
                {randomTip}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* INTERACTIVE COMPONENT SWITCH */}
        <div className="w-full min-h-[90px] flex flex-col items-center justify-center">
          {loadingPhase === 'loading' ? (
            /* Progress Bar Display */
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-mono text-emerald-300 font-bold tracking-wider animate-pulse">جاري تهيئة ساحة المعركة التكتيكية...</span>
                <span className="text-xs font-mono font-black text-amber-400">{Math.round(progress)}%</span>
              </div>

              {/* Progress bar outer */}
              <div className="w-full h-3 bg-neutral-950 border border-emerald-500/30 rounded-full p-0.5 overflow-hidden shadow-inner">
                {/* Progress bar inner */}
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 shadow-[0_0_15px_rgba(52,211,153,0.7)]"
                  style={{ width: `${progress}%` }}
                  transition={{ type: "tween", ease: "linear" }}
                />
              </div>
            </div>
          ) : loadingPhase === 'ready' ? (
            /* Glowing Click-to-Start Button */
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGame}
              className="w-full max-w-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-black text-lg py-4 px-8 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.65)] hover:brightness-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 border-2 border-yellow-300"
            >
              <Play className="w-6 h-6 fill-neutral-950 text-neutral-950 animate-ping" style={{ animationDuration: '3s' }} />
              <span>دخول ساحة القتال ⚔️</span>
              <Volume2 className="w-5 h-5 opacity-70" />
            </motion.button>
          ) : (
            /* Epic Explosive Entry */
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.15, opacity: 0 }}
              className="text-amber-400 font-black text-2xl tracking-widest animate-pulse flex items-center gap-2"
            >
              <Flame className="w-7 h-7 text-amber-500 animate-bounce" />
              <span>انطلاق المعركة... 💥</span>
            </motion.div>
          )}
        </div>

        {/* CREATOR SIGNATURE & ENCRYPTION DECORATION */}
        <div className="flex flex-col items-center gap-1.5 text-center bg-black/20 p-2.5 rounded-xl border border-emerald-500/5 w-full">
          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
            <span>تطوير البطل المبدع:</span>
            <span className="underline decoration-amber-500 decoration-2 underline-offset-4">محمد أحمد السيد 🎖️</span>
          </span>
          <span className="text-[8px] font-mono text-emerald-500/70 select-none tracking-tight uppercase">
            SECURE ENCRYPTED SESSION INITIALIZATION • FIRESTORE SYNC CONNECTED
          </span>
        </div>
      </div>

      {/* Screen White Flash Overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[110] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Shake CSS inject */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          71% { transform: translate(2px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};
