import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Bomb,
  Zap,
  Radio,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';

interface ThrowableItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  damage: number;
  radius: number;
  fuseTime: number; // seconds
  level: number;
  desc: string;
  isEquipped: boolean;
  color: string;
}

const INITIAL_THROWABLES: ThrowableItem[] = [
  {
    id: 'frag_grenade',
    name: 'قنبلة الشظايا M67',
    nameEn: 'M67 Fragmentation Grenade',
    category: 'متفجر شظايا / قاتل',
    damage: 100,
    radius: 8.5,
    fuseTime: 2.5,
    level: 5,
    desc: 'انتشار مئات الكرات الفولاذية القاتلة عند الانفجار لتطهير الغرف والخنادق بالكامل.',
    isEquipped: true,
    color: '#ef4444',
  },
  {
    id: 'toxic_gas',
    name: 'قنبلة الغاز السام التكتيكي',
    nameEn: 'Toxic Nerve Gas Canister',
    category: 'كيميائي / استنزاف مستمر',
    damage: 75,
    radius: 12.0,
    fuseTime: 1.8,
    level: 4,
    desc: 'تطلق سحابة دخان خانقة خضراء تحجب الرؤية وتستنزف صحة الأعداء بمقدار 25 نقطة كل ثانية.',
    isEquipped: false,
    color: '#10b981',
  },
  {
    id: 'emp_pulse',
    name: 'قنبلة النبضة الكهرومغناطيسية EMP',
    nameEn: 'EMP Disruption Device',
    category: 'تقني / تعطيل النفاثات',
    damage: 40,
    radius: 10.0,
    fuseTime: 2.0,
    level: 3,
    desc: 'موجة تردد عالي تعطل نفاثات الأعداء وتفرغ دروعهم الواقية وتمنع إطلاق النار لمدة 3.5 ثوانٍ.',
    isEquipped: false,
    color: '#06b6d4',
  },
  {
    id: 'proximity_mine',
    name: 'لغم الاستشعار الليزري الذكي',
    nameEn: 'Proximity Laser Claymore',
    category: 'فخاخ / تفجير تلقائي',
    damage: 95,
    radius: 7.0,
    fuseTime: 0.2,
    level: 4,
    desc: 'لغم تكتيكي يلتصق بالجدران والأرضيات ينفجر فور عبور أي عدو لشعاع الليزر الأحمر.',
    isEquipped: false,
    color: '#f59e0b',
  },
];

export const ThrowablesBay: React.FC = () => {
  const [throwables, setThrowables] = useState<ThrowableItem[]>(INITIAL_THROWABLES);
  const [selectedId, setSelectedId] = useState<string>('frag_grenade');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [blastHits, setBlastHits] = useState(0);

  const currentItem = throwables.find((t) => t.id === selectedId) || throwables[0];

  const handleSelect = (id: string) => {
    soundManager.playButtonClick();
    haptics.light();
    setSelectedId(id);
    setCountdown(null);
    setIsExploding(false);
  };

  const handleToggleEquip = (id: string) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setThrowables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEquipped: !item.isEquipped } : item))
    );
  };

  const handlePullPin = () => {
    if (countdown !== null || isExploding) return;

    soundManager.playMechanicalClick();
    haptics.heavy();
    setCountdown(3);

    // 3 second countdown
    const timer1 = setTimeout(() => {
      soundManager.playButtonClick();
      haptics.medium();
      setCountdown(2);
    }, 800);

    const timer2 = setTimeout(() => {
      soundManager.playButtonClick();
      haptics.medium();
      setCountdown(1);
    }, 1600);

    const timer3 = setTimeout(() => {
      setCountdown(null);
      setIsExploding(true);
      soundManager.playExplosion(true);
      haptics.combatPulse();
      setBlastHits((prev) => prev + 1);

      setTimeout(() => {
        setIsExploding(false);
      }, 700);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="space-y-4 select-none">
      {/* Bay Header */}
      <div className="bg-[#101912] border border-[#243727] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#162519] border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
            <Bomb size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                مستودع القنابل والمتفجرات التكتيكية (THROWABLES & MINES)
              </h3>
              <span className="bg-red-950 text-red-400 border border-red-500/40 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                EXPLOSIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              تجهيز واختبار صمامات القنابل اليدوية وألغام الاستشعار الميدانية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-gray-400">
            القنابل المجهزة:{' '}
            <strong className="text-red-400 font-black">
              {throwables.filter((t) => t.isEquipped).length} / {throwables.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Interactive Detonation Chamber */}
      <div className="bg-gradient-to-b from-[#131d16] to-[#09100c] border-2 border-red-500/40 rounded-2xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Detonation Simulator Chamber (Cols 5) */}
        <div className="md:col-span-5 bg-[#070d0a] border border-[#1d2d20] rounded-xl p-3 flex flex-col justify-between h-[250px] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono">FUSE CHAMBER</span>
            <span className="text-red-400 font-bold">{currentItem.category}</span>
          </div>

          {/* Grenade Visual & Explosion Stage */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <motion.div
              animate={
                countdown !== null
                  ? { scale: [1, 1.15, 1], rotate: [-4, 4, -4] }
                  : isExploding
                  ? { scale: [1, 1.8, 0], opacity: [1, 1, 0] }
                  : {}
              }
              transition={{ duration: countdown !== null ? 0.3 : 0.4, repeat: countdown !== null ? Infinity : 0 }}
              className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1c291e] to-[#0d1610] border-2 border-red-500/40 flex flex-col items-center justify-center shadow-2xl"
            >
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: currentItem.color }}
                className="filter drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"
              >
                <circle cx="12" cy="14" r="6" fill="currentColor" fillOpacity="0.25" />
                <path d="M10 8V6a2 2 0 0 1 4 0v2" />
                <path d="M12 2v2" />
                <path d="M8.5 5.5l1.5 1.5" />
                <path d="M9 14h6" />
                <path d="M12 11v6" />
              </svg>

              {/* Countdown Tag */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-red-950/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl font-mono font-black text-red-400 animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Blast Explosion VFX */}
              {isExploding && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-500 via-red-600 to-amber-300 blur-lg animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-white blur-sm" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b2b1e]">
            <button
              onClick={() => handleToggleEquip(currentItem.id)}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                currentItem.isEquipped
                  ? 'bg-red-600 text-white border border-red-400'
                  : 'bg-[#142217] hover:bg-[#1b2f20] text-gray-300 border border-[#273d2b]'
              }`}
            >
              <Check size={14} />
              <span>{currentItem.isEquipped ? 'مُجهزة كقنبلة رئيسية' : 'تجهيز القنبلة'}</span>
            </button>

            <button
              onClick={handlePullPin}
              disabled={countdown !== null || isExploding}
              className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 border border-red-400/40 disabled:opacity-50"
            >
              <AlertTriangle size={14} className={countdown !== null ? 'animate-bounce text-amber-300' : ''} />
              <span>{countdown !== null ? `تنفجر خلال ${countdown}s` : 'نزع الصمام والتفجير'}</span>
            </button>
          </div>
        </div>

        {/* Throwable Specs & Blast Radius (Cols 7) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-start justify-between border-b border-[#213524] pb-2">
            <div>
              <h4 className="text-base font-black text-white">{currentItem.name}</h4>
              <span className="text-xs text-gray-400 font-mono">{currentItem.nameEn}</span>
            </div>
            <span className="bg-red-950 text-red-300 text-xs font-mono font-black px-2.5 py-1 rounded-xl border border-red-500/40">
              LVL {currentItem.level} / 5
            </span>
          </div>

          <p className="text-xs text-gray-300 bg-[#070d0a] p-2.5 rounded-xl border border-[#1b2b1e]">
            {currentItem.desc}
          </p>

          {/* Blast Gauges */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">القوة الانفجارية</span>
                <span className="text-red-400 font-mono">{currentItem.damage}</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${currentItem.damage}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">نطاق الانفجار</span>
                <span className="text-amber-400 font-mono">{currentItem.radius} m</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${currentItem.radius * 7}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">توقيت الصمام</span>
                <span className="text-cyan-400 font-mono">{currentItem.fuseTime} s</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(currentItem.fuseTime / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Blast History Log */}
          {blastHits > 0 && (
            <div className="bg-red-950/70 border border-red-500/40 text-red-300 text-xs p-2 rounded-xl flex items-center justify-between font-mono">
              <span>تم تسجيل انفجار ناجح بقوة {currentItem.damage} نقطة ضرر!</span>
              <span className="text-[10px] text-gray-400">تجارب التفجير: {blastHits}</span>
            </div>
          )}
        </div>
      </div>

      {/* Throwables Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {throwables.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1a251b] border-red-400 shadow-md shadow-red-500/20'
                  : 'bg-[#0e1610] border-[#223525] hover:border-[#38533e]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold bg-black/60 text-red-300 px-1.5 py-0.5 rounded border border-[#213524]">
                  LVL {item.level}
                </span>
                {item.isEquipped && (
                  <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">
                    مُجهز
                  </span>
                )}
              </div>

              <div className="h-14 flex items-center justify-center bg-[#070d0a] rounded-xl border border-[#1d2d20] my-1">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: item.color }}
                >
                  <circle cx="12" cy="14" r="5" fill="currentColor" fillOpacity="0.2" />
                  <path d="M10 9V7a2 2 0 0 1 4 0v2" />
                  <path d="M12 4v2" />
                </svg>
              </div>

              <div>
                <h5 className="text-xs font-black text-white truncate">{item.name}</h5>
                <span className="text-[10px] text-gray-400 block truncate">{item.nameEn}</span>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#1a2b1e] flex items-center justify-between text-[10px]">
                <span className="text-red-400 font-bold">ضرر: {item.damage}</span>
                <span className="text-amber-400 font-bold">نطاق: {item.radius}m</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
