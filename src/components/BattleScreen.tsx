import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Users,
  Shield,
  Zap,
  Flame,
  Crosshair,
  Award,
  Play,
  RotateCcw,
  Eye,
  Radio,
  Timer,
  CheckCircle2,
  Sparkles,
  Target,
  ArrowLeft,
  X,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';
import { haptics } from '../utils/haptics';
import BattleStatsDashboard from './BattleStatsDashboard';
import { BattleArena } from './BattleArena';
import { LiveSoldierCanvas } from './LiveSoldierCanvas';
import { ThreeSoldierCanvas } from './ThreeSoldierCanvas';
import { FriendsList } from './FriendsList';
import { GameMode } from '../types';

const getCamoHexFromSkinId = (skinId?: string) => {
  switch (skinId) {
    case 'desert_tan': return '#c2a66c';
    case 'urban_grey': return '#4b5563';
    case 'navy_seal': return '#1e3a8a';
    case 'cyber_cyan': return '#0891b2';
    case 'royal_gold': return '#ca8a04';
    case 'woodland_camo':
    default: return '#2d4a22';
  }
};

interface CombatantProfile {
  id: string;
  name: string;
  role: string;
  kills: number;
  health: number;
  weapon: string;
  subWeapon: string;
  location: string;
}

export default function BattleScreen() {
  const [matchSearching, setMatchSearching] = useState(false);
  const [matchTimer, setMatchTimer] = useState(222);
  const [spawnNotification, setSpawnNotification] = useState<string | null>(null);
  
  // Game Mode & Player Count Selector State
  const [selectedMode, setSelectedMode] = useState<GameMode>('deathmatch');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(4);

  // Interactive Active Battle Arena state
  const [activeArenaMatch, setActiveArenaMatch] = useState<{
    mode: GameMode;
    isSpectator?: boolean;
    title: string;
  } | null>(null);

  // Interactive Modals
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [seasonRewardClaimed, setSeasonRewardClaimed] = useState(false);
  const [selectedCombatant, setSelectedCombatant] = useState<CombatantProfile | null>(null);
  const [showLoadoutModal, setShowLoadoutModal] = useState(false);
  const [equippedPrimary, setEquippedPrimary] = useState('ديزرت إيجل الذهبي');
  const [equippedSecondary, setEquippedSecondary] = useState('قاذف صواريخ RPG-7');

  // Daily Tactical Challenges State
  interface DailyChallenge {
    id: string;
    title: string;
    desc: string;
    target: number;
    current: number;
    rewardCoins: number;
    rewardGems: number;
    completed: boolean;
    claimed: boolean;
    iconType: 'kills' | 'headshots' | 'survival' | 'grenade';
  }

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => {
    const saved = localStorage.getItem('mini_militia_daily_challenges_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: 'dc1',
        title: 'قناص الظل (Shadow Sniper)',
        desc: 'تصفية 3 جنود نخبة باستخدام بندقية القنص القتالية.',
        target: 3,
        current: 1,
        rewardCoins: 400,
        rewardGems: 15,
        completed: false,
        claimed: false,
        iconType: 'kills'
      },
      {
        id: 'dc2',
        title: 'قناص الرؤوس المزدوج (Headshot Specialist)',
        desc: 'تنفيذ ضربتين قتالية في الرأس (Headshots) مباشرة.',
        target: 2,
        current: 0,
        rewardCoins: 500,
        rewardGems: 20,
        completed: false,
        claimed: false,
        iconType: 'headshots'
      },
      {
        id: 'dc3',
        title: 'مدرع الصمود التكتيكي (Tactical Juggernaut)',
        desc: 'البقاء حياً بنسبة صحة 100% لمدة 45 ثانية في القتال الحر.',
        target: 1,
        current: 0,
        rewardCoins: 350,
        rewardGems: 10,
        completed: false,
        claimed: false,
        iconType: 'survival'
      }
    ];
  });

  const [challengeResetTime, setChallengeResetTime] = useState('');
  const [lastMatchCompleted, setLastMatchCompleted] = useState(false);

  useEffect(() => {
    localStorage.setItem('mini_militia_daily_challenges_v1', JSON.stringify(dailyChallenges));
  }, [dailyChallenges]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setChallengeResetTime(`${h}س و ${m}د`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync Daily Challenge progress when a match in the Arena is completed
  useEffect(() => {
    if (activeArenaMatch) {
      setLastMatchCompleted(true);
    } else if (lastMatchCompleted) {
      setLastMatchCompleted(false);
      setDailyChallenges((prev) => {
        return prev.map(c => {
          if (c.completed) return c;
          
          // Randomly advance progress as a reward for playing the match
          const nextVal = Math.min(c.target, c.current + 1);
          const completed = nextVal >= c.target;
          
          if (completed) {
            triggerNotification(`🎉 اكتمل التحدي اليومي: "${c.title}"! جاهز للاستلام!`);
          } else {
            triggerNotification(`🎯 أحرزت تقدماً في التحدي اليومي: "${c.title}" (+1)`);
          }
          
          return {
            ...c,
            current: nextVal,
            completed,
          };
        });
      });
    }
  }, [activeArenaMatch, lastMatchCompleted]);

  const handleLaunchChallenge = (title: string) => {
    soundManager.playRocketLaunch();
    haptics.heavy();
    setActiveArenaMatch({
      mode: 'deathmatch',
      isSpectator: false,
      title: `تحدي تكتيكي: ${title}`,
    });
  };

  const handleClaimChallengeReward = (id: string) => {
    setDailyChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id && c.completed && !c.claimed) {
          soundManager.playVictory();
          haptics.victory();
          
          const cur = settingsManager.getSettings();
          settingsManager.updateSettings({
            coins: cur.coins + c.rewardCoins,
            gems: cur.gems + c.rewardGems,
          });

          triggerNotification(`🎁 تم استلام الجائزة: +${c.rewardCoins}🪙 و +${c.rewardGems}💎`);
          return { ...c, claimed: true };
        }
        return c;
      })
    );
  };

  const handleReloadChallenges = () => {
    const cur = settingsManager.getSettings();
    if (cur.coins < 150) {
      soundManager.playButtonClick();
      triggerNotification('❌ رصيد الكوينز غير كافٍ! لإعادة تعيين التحديات تحتاج 150 🪙');
      return;
    }
    
    soundManager.playVictory();
    haptics.heavy();
    
    settingsManager.updateSettings({
      coins: cur.coins - 150,
    });

    const newChallenges: DailyChallenge[] = [
      {
        id: 'dc_new_1',
        title: 'صياد الرشاشات (SMG Hunter)',
        desc: 'تصفية 4 مقاتلين باستخدام الرشاش المزدوج (Dual Uzi).',
        target: 4,
        current: 0,
        rewardCoins: 450,
        rewardGems: 15,
        completed: false,
        claimed: false,
        iconType: 'kills'
      },
      {
        id: 'dc_new_2',
        title: 'الضربة الجوية للقاذف (RPG Air Strike)',
        desc: 'تدمير هدفين أثناء التحليق بحقيبة الطيران الجت باك.',
        target: 2,
        current: 0,
        rewardCoins: 600,
        rewardGems: 25,
        completed: false,
        claimed: false,
        iconType: 'grenade'
      },
      {
        id: 'dc_new_3',
        title: 'بطل البقاء الأبدي (Infinite Survival)',
        desc: 'الصمود لثلاث موجات متتالية دون دروع إضافية.',
        target: 3,
        current: 0,
        rewardCoins: 500,
        rewardGems: 20,
        completed: false,
        claimed: false,
        iconType: 'survival'
      }
    ];

    setDailyChallenges(newChallenges);
    triggerNotification('🔄 تم شحن وتحديث قائمة التحديات التكتيكية اليومية بنجاح!');
  };

  const combatants: CombatantProfile[] = [
    {
      id: 'c1',
      name: 'الكوماندوز (أنت)',
      role: 'مقاتل هجومي خفيف',
      kills: 14,
      health: 100,
      weapon: 'ديزرت إيجل الذهبي',
      subWeapon: 'قاذف صواريخ RPG',
      location: 'البرج المرتفع',
    },
    {
      id: 'c2',
      name: 'قناص الغابة (Ghost)',
      role: 'قناصة ومراقبة تكتيكية',
      kills: 9,
      health: 85,
      weapon: 'بندقية قنص حرارية .50',
      subWeapon: 'مسدس كاتم للصوت',
      location: 'ممر الكهوف والنفق',
    },
    {
      id: 'c3',
      name: 'جندي الدعم الثقيل (Rex)',
      role: 'اقتحام ودروع ثقيلة',
      kills: 11,
      health: 90,
      weapon: 'شوتغان قتالي Spas-12',
      subWeapon: 'قنابل غاز مسيل للدموع',
      location: 'المستودع الرئيسي',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchTimer((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleQuickPlay = () => {
    soundManager.playButtonClick();
    haptics.combatPulse();
    setMatchSearching(true);
    setTimeout(() => {
      soundManager.playRocketLaunch();
      setMatchSearching(false);
      const modeNameAr = selectedMode === 'deathmatch' ? 'موت عشوائي (FFA)' : selectedMode === 'team' ? 'معركة الفرق' : 'وضع البقاء';
      setActiveArenaMatch({
        mode: selectedMode,
        isSpectator: false,
        title: `${modeNameAr} • ${selectedPlayerCount} لاعبين - حلبة Outpost`,
      });
    }, 700);
  };

  const triggerNotification = (msg: string) => {
    setSpawnNotification(msg);
    setTimeout(() => {
      setSpawnNotification(null);
    }, 3200);
  };

  const handleClaimSeasonReward = () => {
    if (seasonRewardClaimed) return;
    soundManager.playVictory();
    haptics.victory();
    setSeasonRewardClaimed(true);
    triggerNotification('تمت إضافة 250 عملة تكتيكية ومضاعف XP بنجاح!');
  };

  // If a battle match is active, render the real 2D Canvas BattleArena!
  if (activeArenaMatch) {
    return (
      <BattleArena
        mode={activeArenaMatch.mode}
        isSpectator={activeArenaMatch.isSpectator}
        arenaTitle={activeArenaMatch.title}
        onQuit={() => {
          setActiveArenaMatch(null);
          soundManager.playButtonClick();
          haptics.light();
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 pb-36 sm:pb-32 pt-2 select-none"
    >
      {/* Top Tactical Announcement Banner (Interactive) */}
      <button
        onClick={() => {
          soundManager.playButtonClick();
          haptics.light();
          setShowSeasonModal(true);
        }}
        className="w-full text-right flex items-center justify-between bg-[#121d15] hover:bg-[#18271c] px-3.5 py-2.5 rounded-xl border border-[#273d2c] hover:border-amber-500/50 shadow-md transition-all active:scale-98 cursor-pointer"
        title="انقر لعرض مكافآت الموسم 4"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
            موسم الهيمنة 4 (Dominance Season)
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">• ينتهي خلال 4 أيام</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#09100c] px-2 py-1 rounded-lg border border-[#1b2b1e]">
          <Zap size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-black text-cyan-300">مضاعفة النقاط x2</span>
        </div>
      </button>

      {/* Hero Showcase: Floating Chibi Commando & Battle Stats */}
      <section className="relative bg-gradient-to-b from-[#142318] to-[#0c150f] rounded-2xl p-4 border-2 border-[#2b4430] shadow-xl overflow-hidden">
        {/* Background Aura */}
        <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1f3324] border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white">العقيد صخر</h2>
                <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded font-black text-[9px]">
                  VIP
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block">
                الكتيبة 77 - الصاعقة الصحراوية
              </span>
            </div>
          </div>

          <div className="bg-[#0e1711] px-2.5 py-1 rounded-xl border border-[#273d2b] text-right">
            <span className="text-[11px] font-black text-amber-400 block font-mono">
              نقيب • رتبة 24
            </span>
            <span className="text-[9px] text-gray-400">4,850 / 6,000 XP</span>
          </div>
        </div>

        {/* Center Soldier Interactive 3D WebGL Canvas reflecting custom loadout */}
        <div className="relative flex flex-col items-center justify-center my-2">
          <div className="absolute w-44 h-44 bg-cyan-400/15 rounded-full blur-2xl animate-pulse pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {(() => {
              const saved = settingsManager.getSettings();
              return (
                <div
                  className="w-full max-w-[300px] h-[260px] relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-emerald-500/20 bg-black/40 shadow-inner"
                  title="اسحب لتدوير المحارب 3D بزاوية 360 درجة"
                >
                  <ThreeSoldierCanvas
                    camoColor={getCamoHexFromSkinId(saved.equippedSkin)}
                    headgear={saved.equippedHeadgear || 'camo_helmet'}
                    bodyArmor={saved.equippedArmor || 'molle_vest'}
                    eyewear={saved.equippedEyewear || 'aviators'}
                    beard={saved.equippedBeard || 'stubble'}
                    jetpackStyle={saved.equippedJetpack || 'military_dual'}
                    trailColor={saved.equippedTrail || '#06b6d4'}
                    weapon={saved.equippedPrimaryWeapon || 'sniper'}
                    height={260}
                    interactive={true}
                    autoRotate={true}
                    showPedestal={true}
                  />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 pointer-events-none">
                    <Sparkles size={10} className="text-amber-400" />
                    <span>مجسم 3D حي</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Loadout strip */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setShowLoadoutModal(true);
            }}
            className="relative z-20 flex items-center gap-2 mt-1 bg-[#09100c]/90 hover:bg-[#121c15] backdrop-blur px-3.5 py-1.5 rounded-full border border-[#233526] hover:border-amber-500/60 transition-colors cursor-pointer"
          >
            <Zap size={14} className="text-cyan-400" />
            <span className="text-xs text-gray-300">
              العتاد المخصص: <strong className="text-amber-400">{equippedPrimary}</strong>
            </span>
            <span className="text-[10px] text-gray-400 bg-neutral-800 px-1.5 py-0.5 rounded">تغيير</span>
          </button>
        </div>

        {/* Combat Ballistic Stats Bento */}
        <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-[#1d2f21]">
          <div className="flex flex-col items-center bg-[#0e1711] py-2 px-1 rounded-xl border border-[#223525]">
            <span className="text-[10px] text-gray-400">معدل الفوز</span>
            <span className="text-base font-black text-emerald-400 font-mono">68%</span>
            <span className="text-[9px] text-gray-500">184 معركة</span>
          </div>

          <div className="flex flex-col items-center bg-[#0e1711] py-2 px-1 rounded-xl border border-[#223525]">
            <span className="text-[10px] text-gray-400">نسبة القتل/الموت</span>
            <span className="text-base font-black text-amber-400 font-mono">2.41 K/D</span>
            <span className="text-[9px] text-gray-500">1,420 قتيل</span>
          </div>

          <div className="flex flex-col items-center bg-[#0e1711] py-2 px-1 rounded-xl border border-[#223525]">
            <span className="text-[10px] text-gray-400">الدقة الشاملة</span>
            <span className="text-base font-black text-cyan-400 font-mono">74%</span>
            <span className="text-[9px] text-gray-500">رأس 31%</span>
          </div>
        </div>
      </section>

      {/* RECHARTS VISUAL STATISTICS DASHBOARD */}
      <BattleStatsDashboard />

      {/* GAME MODE & PLAYER COUNT SELECTOR CARD */}
      <section className="bg-[#121c15] border-2 border-[#2b4430] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#233526] pb-2.5">
          <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
            <Target size={15} className="text-amber-500 animate-pulse" />
            <span>اختر وضع اللعب وعدد المقاتلين في الساحة ⚔️</span>
          </h3>
          <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
            مخصص بالكامل
          </span>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'deathmatch', label: 'موت عشوائي (FFA)', icon: Crosshair, desc: 'الكل ضد الكل' },
            { id: 'team', label: 'معركة الفرق (Team)', icon: Users, desc: 'فريق أزرق vs أحمر' },
            { id: 'survival', label: 'وضع البقاء (Survival)', icon: Shield, desc: 'موجات لا نهائية' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setSelectedMode(mode.id as GameMode);
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                selectedMode === mode.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10 scale-102'
                  : 'bg-[#09100c] border-[#1d2f21] text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <mode.icon size={16} className={selectedMode === mode.id ? 'text-amber-400 mb-1' : 'text-neutral-500 mb-1'} />
              <span className="text-xs font-black">{mode.label}</span>
              <span className="text-[9px] opacity-75">{mode.desc}</span>
            </button>
          ))}
        </div>

        {/* Player Count Selector (1, 2, 4, 6) */}
        <div className="pt-2 border-t border-[#233526]">
          <span className="text-[11px] font-bold text-gray-300 block mb-2">عدد المقاتلين في الحلبة (Player Count):</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { count: 1, label: '1 لاعب (تدريب)' },
              { count: 2, label: 'لاعبين (1v1)' },
              { count: 4, label: '4 لاعبين (FFA)' },
              { count: 6, label: '6 لاعبين (3v3)' },
            ].map((pc) => (
              <button
                key={pc.count}
                onClick={() => {
                  soundManager.playButtonClick();
                  haptics.light();
                  setSelectedPlayerCount(pc.count);
                }}
                className={`py-2 px-1 rounded-xl border text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                  selectedPlayerCount === pc.count
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-[#09100c] border-[#1d2f21] text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span className="text-sm font-black font-mono">{pc.count}</span>
                <span className="text-[9px] opacity-80">{pc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Giant High-Energy Quick Play CTA - Launches Real Arena! */}
      <button
        onClick={handleQuickPlay}
        disabled={matchSearching}
        className="relative w-full overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-black p-4 rounded-2xl shadow-xl shadow-amber-500/20 border-b-4 border-amber-700 flex items-center justify-between transition-all cursor-pointer"
        title="دخول فوري إلى معركة قتال حر في حلبة Outpost"
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center text-black">
            <Swords size={28} className={matchSearching ? 'animate-spin' : ''} />
          </div>
          <div className="text-right">
            <span className="text-lg font-black tracking-wide block leading-tight">
              {matchSearching ? 'جارٍ تحميل الحلبة والمقاتلين...' : 'قتال سريع (QUICK PLAY)'}
            </span>
            <span className="text-xs font-bold text-black/75">
              سيرفرات الشرق الأوسط • استجابة 24ms فائقة • دخول فوري
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/20 px-3.5 py-2 rounded-xl relative z-10">
          <span className="text-xs font-black uppercase">انطلاق الآن</span>
          <ArrowLeft size={16} />
        </div>
      </button>

      {/* DAILY TACTICAL CHALLENGES BLOCK */}
      <section className="bg-[#121c15] border-2 border-[#2b4430] rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#233526] pb-3 flex-wrap gap-2">
          <div className="space-y-0.5 text-right">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Target size={16} className="text-amber-500 animate-pulse" />
              <span>مهام التحدي اليومي التكتيكية (Daily Challenges)</span>
            </h3>
            <p className="text-[10px] text-gray-400">
              أكمل المهام لربح عملات تكتيكية وجواهر حصرية. تتجدد خلال: <span className="font-mono text-amber-400 font-bold">{challengeResetTime}</span>
            </p>
          </div>
          <button
            onClick={handleReloadChallenges}
            className="px-2.5 py-1.5 rounded-lg bg-[#1a2d1f] hover:bg-amber-500 hover:text-black border border-amber-500/30 text-[10px] font-black text-amber-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            title="تحديث قائمة المهام بقيمة 150 عملة تكتيكية"
          >
            <RotateCcw size={12} />
            <span>شحن مهام جديدة (150 🪙)</span>
          </button>
        </div>

        <div className="space-y-3">
          {dailyChallenges.map((c) => {
            const percentage = Math.min(100, Math.round((c.current / c.target) * 100));
            const isCompleted = c.completed;
            const isClaimed = c.claimed;

            return (
              <div
                key={c.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all ${
                  isClaimed
                    ? 'bg-[#101712]/30 border-[#1f2f22]/50 opacity-55'
                    : isCompleted
                    ? 'bg-[#1b3423] border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-[#0a110c] border-[#223525]'
                }`}
              >
                {/* Left side: Icon + Title & Desc */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0 text-right">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    isClaimed
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-600'
                      : isCompleted
                      ? 'bg-amber-500 text-black border-amber-400'
                      : 'bg-[#121f15] border-emerald-500/30 text-emerald-400'
                  }`}>
                    {c.iconType === 'kills' && <Swords size={16} />}
                    {c.iconType === 'headshots' && <Crosshair size={16} />}
                    {c.iconType === 'survival' && <Shield size={16} />}
                    {c.iconType === 'grenade' && <Flame size={16} />}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className={`text-xs font-black block truncate ${isCompleted && !isClaimed ? 'text-amber-300' : 'text-white'}`}>
                      {c.title}
                    </span>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {c.desc}
                    </p>
                    
                    {/* Progress details & bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 h-2 bg-[#060b07] rounded-full overflow-hidden p-0.5 border border-[#1b2b1e]">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCompleted ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-black text-gray-300 shrink-0">
                        {c.current} / {c.target}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Rewards & CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-[#233526] pt-2.5 sm:pt-0">
                  {/* Rewards Badge */}
                  <div className="flex items-center gap-1.5 bg-[#070d08] px-2.5 py-1.5 rounded-lg border border-[#233526]">
                    <span className="text-[10px] font-black text-amber-400 font-mono flex items-center gap-0.5">
                      🪙 {c.rewardCoins}
                    </span>
                    <span className="text-gray-500 text-[9px] font-black">•</span>
                    <span className="text-[10px] font-black text-cyan-400 font-mono flex items-center gap-0.5">
                      💎 {c.rewardGems}
                    </span>
                  </div>

                  {/* CTA Action button */}
                  {isClaimed ? (
                    <button
                      disabled
                      className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-600 text-[10px] font-black cursor-not-allowed"
                    >
                      مستلمة ✓
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimChallengeReward(c.id)}
                      className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black hover:brightness-110 active:scale-95 transition-all shadow cursor-pointer"
                    >
                      استلام المكافأة 🎁
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunchChallenge(c.title)}
                      className="px-3.5 py-2 rounded-lg bg-[#1a2d1f] border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 text-[10px] font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Swords size={12} />
                      <span>خوض المعركة</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LIVE COMBAT VIEWPORT (Interactive launch on click) */}
      <section className="bg-[#121e15] border-2 border-[#2b4430] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Viewport Header */}
        <div className="p-3.5 bg-[#16261b] border-b border-[#2b4430] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black text-white tracking-wide">
              مشهد المعركة الميدانية الحية • LIVE ARENA MATCH
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded border border-red-800">
              خريطة البؤرة Outpost
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
              <Timer size={14} />
              <span>{formatTimer(matchTimer)}</span>
            </div>
          </div>
        </div>

        {/* Live Combat Graphic Showcase - Clickable to Spawn directly! */}
        <div
          onClick={() => {
            soundManager.playRocketLaunch();
            haptics.heavy();
            setActiveArenaMatch({
              mode: 'deathmatch',
              isSpectator: false,
              title: 'إنزال مباشر في قلب المعركة',
            });
          }}
          className="relative w-full aspect-[16/9] max-h-[360px] bg-black overflow-hidden cursor-pointer group"
          title="انقر للدخول المباشر إلى قلب المعركة"
        >
          <img
            src="/images/active_combat.jpg"
            alt="Active Combat Gameplay"
            className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-500"
          />

          {/* Tactical Scrim Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1611] via-transparent to-black/40" />

          {/* Center Play Indicator on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 group-hover:bg-amber-500 text-white group-hover:text-black px-4 py-2 rounded-2xl border-2 border-white/20 group-hover:border-amber-400 flex items-center gap-2 shadow-2xl transition-all scale-95 group-hover:scale-105">
              <Swords size={20} />
              <span className="text-xs sm:text-sm font-black">انقر للهبوط والقتال مباشرة في الحلبة!</span>
            </div>
          </div>

          {/* Live HUD Badges on image */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur border border-[#2b4430] px-2.5 py-1 rounded-xl text-right">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <Crosshair size={14} />
              <span>الكوماندوز: 14 إقصاء</span>
            </div>
          </div>

          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur border border-cyan-500/40 px-2.5 py-1 rounded-xl text-left">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
              <Eye size={14} /> 4 مقاتلين في الحلبة
            </span>
          </div>

          {/* Live Bottom Banner */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <div className="bg-black/80 backdrop-blur px-3 py-1 rounded-xl border border-amber-500/40 flex items-center gap-1.5">
              <Crosshair size={14} className="text-amber-300" />
              <span className="text-xs font-black text-amber-300">DUAL SMG + RPG-7</span>
            </div>
            <div className="bg-emerald-950/90 border border-emerald-500 px-3 py-1 rounded-xl text-emerald-300 text-xs font-black">
              منطقة القلعة: مشتعلة بالمعارك
            </div>
          </div>
        </div>

        {/* Action Controls for Arena */}
        <div className="p-3.5 bg-[#0e1711] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              soundManager.playRocketLaunch();
              haptics.heavy();
              setActiveArenaMatch({
                mode: 'deathmatch',
                isSpectator: false,
                title: 'إنزال فوري - حلبة Outpost',
              });
            }}
            className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <Swords size={18} />
            <span>الانضمام للمعركة فوراً (SPAWN IN ARENA)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.medium();
              setActiveArenaMatch({
                mode: 'deathmatch',
                isSpectator: true,
                title: 'وضع المشاهدة الحرة التكتيكية',
              });
            }}
            className="py-3.5 px-4 rounded-xl bg-[#1c2c20] hover:bg-[#253d2c] text-cyan-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#35523b] active:scale-98 transition-all cursor-pointer"
          >
            <Eye size={18} />
            <span>وضع المشاهدة الحرة (SPECTATE)</span>
          </button>
        </div>

        {/* Active Combatants list in match (Interactive inspection) */}
        <div className="p-3.5 bg-[#121e15] border-t border-[#233526] space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-gray-300">
            <span>المقاتلون النشطون في ساحة القتال (انقر للاطلاع أو النزول كبديل):</span>
            <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              4 متصلين
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {combatants.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  haptics.light();
                  setSelectedCombatant(c);
                }}
                className="bg-[#0a110c] hover:bg-[#121d14] p-2.5 rounded-xl border border-emerald-500/40 hover:border-emerald-400 flex flex-col justify-between cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">{c.kills} Kills</span>
                </div>
                <span className="text-[10px] text-gray-400">صحة {c.health}% • {c.weapon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Grid (Interactive match launches) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            haptics.medium();
            setActiveArenaMatch({
              mode: 'team',
              isSpectator: false,
              title: 'معركة الفرق (Team Deathmatch)',
            });
          }}
          className="bg-[#121d15] hover:bg-[#192b1d] p-3.5 rounded-xl border border-[#273d2c] hover:border-red-500/50 text-right transition-all group flex flex-col justify-between cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="bg-red-950 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800">
              4 ضد 4
            </span>
            <Swords size={20} className="text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-white block">معركة الفرق</span>
            <span className="text-[11px] text-gray-400">اشتباك جماعي وفوز بالنقاط</span>
          </div>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            haptics.medium();
            setActiveArenaMatch({
              mode: 'survival',
              isSpectator: false,
              title: 'اللعب المحلي LAN - موجات البقاء',
            });
          }}
          className="bg-[#121d15] hover:bg-[#192b1d] p-3.5 rounded-xl border border-[#273d2c] hover:border-cyan-500/50 text-right transition-all group flex flex-col justify-between cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="bg-cyan-950 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800">
              بدون نت / أوفلاين
            </span>
            <Radio size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-white block">اللعب المحلي LAN</span>
            <span className="text-[11px] text-gray-400">تدريب وبقاء ضد مقاتلي النخبة</span>
          </div>
        </button>
      </div>
      
      {/* Friends List Component */}
      <FriendsList />

      {/* SEASON 4 PERKS MODAL */}
      <AnimatePresence>
        {showSeasonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1611] border-2 border-[#2b4430] rounded-2xl p-5 shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-[#233526] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-400" size={20} />
                  <h3 className="text-base font-black text-white">موسم الهيمنة 4 (Dominance Season)</h3>
                </div>
                <button
                  onClick={() => setShowSeasonModal(false)}
                  className="p-1 rounded-lg bg-neutral-800 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#142217] border border-emerald-500/30 flex items-start gap-2.5">
                  <Zap className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <strong className="text-white block">مضاعفة نقاط الخبرة (Double XP)</strong>
                    <span className="text-gray-300">تحصل على 2x XP لكل إقصاء وفوز في حلبة Outpost.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#142217] border border-amber-500/30 flex items-start gap-2.5">
                  <Target className="text-amber-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <strong className="text-white block">صندوق الذخيرة الملكي المتفجر</strong>
                    <span className="text-gray-300">ظهور صناديق صواريخ RPG وقنابل غاز كل دقيقتين.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#142217] border border-cyan-500/30 flex items-start gap-2.5">
                  <Shield className="text-cyan-400 shrink-0 mt-0.5" size={16} />
                  <div>
                    <strong className="text-white block">رتبة الشرف للكتيبة 77</strong>
                    <span className="text-gray-300">شارة مميزة باللون الذهبي بجانب اسمك في شريط القتل.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#233526] flex items-center justify-between">
                <button
                  onClick={handleClaimSeasonReward}
                  disabled={seasonRewardClaimed}
                  className={`py-2.5 px-4 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                    seasonRewardClaimed
                      ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg hover:brightness-110'
                  }`}
                >
                  {seasonRewardClaimed ? (
                    <>
                      <Check size={14} />
                      <span>تم استلام المكافأة</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>استلام مكافأة الموسم المجانية (250 عملة)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowSeasonModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 text-gray-300 font-bold text-xs hover:bg-neutral-700"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMBATANT DOSSIER / INSPECT MODAL */}
      <AnimatePresence>
        {selectedCombatant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1611] border-2 border-[#2b4430] rounded-2xl p-5 shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-[#233526] pb-3">
                <div>
                  <h3 className="text-base font-black text-white">{selectedCombatant.name}</h3>
                  <span className="text-xs text-emerald-400 font-bold">{selectedCombatant.role}</span>
                </div>
                <button
                  onClick={() => setSelectedCombatant(null)}
                  className="p-1 rounded-lg bg-neutral-800 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#142217] border border-[#223525]">
                  <span className="text-gray-400 block text-[10px]">السلاح الأساسي:</span>
                  <strong className="text-amber-400">{selectedCombatant.weapon}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#142217] border border-[#223525]">
                  <span className="text-gray-400 block text-[10px]">السلاح الثانوي:</span>
                  <strong className="text-cyan-300">{selectedCombatant.subWeapon}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#142217] border border-[#223525]">
                  <span className="text-gray-400 block text-[10px]">مستوى الصحة:</span>
                  <strong className="text-emerald-400">{selectedCombatant.health}%</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#142217] border border-[#223525]">
                  <span className="text-gray-400 block text-[10px]">الموقع التكتيكي:</span>
                  <strong className="text-white">{selectedCombatant.location}</strong>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    const mode = 'deathmatch';
                    setSelectedCombatant(null);
                    soundManager.playRocketLaunch();
                    haptics.heavy();
                    setActiveArenaMatch({
                      mode,
                      isSpectator: false,
                      title: `النزول بدلاً من ${selectedCombatant.name}`,
                    });
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <Swords size={16} />
                  <span>النزول والقتال في مكانه</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedCombatant(null);
                    soundManager.playButtonClick();
                    haptics.medium();
                    setActiveArenaMatch({
                      mode: 'deathmatch',
                      isSpectator: true,
                      title: `مشاهدة ${selectedCombatant.name}`,
                    });
                  }}
                  className="py-3 px-4 rounded-xl bg-neutral-800 text-cyan-300 font-bold text-xs hover:bg-neutral-700 active:scale-95 cursor-pointer"
                >
                  مشاهدة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK LOADOUT CUSTOMIZER MODAL */}
      <AnimatePresence>
        {showLoadoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1611] border-2 border-[#2b4430] rounded-2xl p-5 shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-[#233526] pb-3">
                <div className="flex items-center gap-2">
                  <Crosshair className="text-amber-400" size={20} />
                  <h3 className="text-base font-black text-white">تجهيز عتاد المعركة الميداني</h3>
                </div>
                <button
                  onClick={() => setShowLoadoutModal(false)}
                  className="p-1 rounded-lg bg-neutral-800 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-300 font-bold block mb-1">اختر السلاح الأساسي:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['ديزرت إيجل الذهبي', 'بندقية كلاشينكوف AK-47', 'شوتغان Spas-12', 'قناص القوات الخاصة .50'].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setEquippedPrimary(w);
                          soundManager.playPistol();
                        }}
                        className={`p-2.5 rounded-xl border text-right font-bold transition-all ${
                          equippedPrimary === w
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-300 font-bold block mb-1">اختر السلاح الثانوي:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['قاذف صواريخ RPG-7', 'رشاش SMG مزدوج', 'قنابل غاز مسيل', 'قنابل متفجرة C4'].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setEquippedSecondary(w);
                          soundManager.playRocketLaunch();
                        }}
                        className={`p-2.5 rounded-xl border text-right font-bold transition-all ${
                          equippedSecondary === w
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#233526] flex items-center justify-between">
                <button
                  onClick={() => {
                    soundManager.playVictory();
                    setShowLoadoutModal(false);
                    triggerNotification(`تم حفظ وتجهيز العتاد بنجاح!`);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-md hover:brightness-110 active:scale-95"
                >
                  حفظ وتجهيز المقاتل
                </button>

                <button
                  onClick={() => setShowLoadoutModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 text-gray-300 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Notification Toast */}
      {spawnNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-amber-600"
        >
          <Flame size={16} className="text-amber-950 fill-amber-950" />
          <span>{spawnNotification}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

