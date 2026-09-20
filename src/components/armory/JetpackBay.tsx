import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Flame,
  Gauge,
  Check,
  RotateCcw,
  Sparkles,
  Wind,
  Shield,
  Layers,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';
import { TacticalItemGraphic } from './TacticalItemGraphic';

interface JetpackItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  boostVelocity: number;
  fuelCapacity: number;
  rechargeSpeed: number;
  level: number;
  desc: string;
  isEquipped: boolean;
}

const INITIAL_JETPACKS: JetpackItem[] = [
  {
    id: 'turbo_nozzles',
    name: 'فوهات الدفع التوربيني المزدوج',
    nameEn: 'Dual Turbo Thrust Nozzles',
    category: 'سرعة صعود / توربيني',
    boostVelocity: 95,
    fuelCapacity: 80,
    rechargeSpeed: 85,
    level: 5,
    desc: 'فوهات سيراميكية مزدوجة تمنحك قوة دفع خارقة للصعود وتفادي صواريخ RPG في أجزاء من الثانية.',
    isEquipped: true,
  },
  {
    id: 'nitro_tank',
    name: 'خزان وقود النيتروجين النقي',
    nameEn: 'High-Capacity Nitro Fuel Tank',
    category: 'سعة وقود / طيران طويل',
    boostVelocity: 82,
    fuelCapacity: 98,
    rechargeSpeed: 75,
    level: 4,
    desc: 'سعة وقود نفاثة ضخمة تمكنك من التحليق المستمر فوق ساحة المعركة واقتناص الأعداء من الجو.',
    isEquipped: true,
  },
  {
    id: 'agility_fins',
    name: 'زعانف المناورة الجوية الحركية',
    nameEn: 'Aerodynamic Vector Fins',
    category: 'مناورة هوائية / رشاقة',
    boostVelocity: 88,
    fuelCapacity: 85,
    rechargeSpeed: 90,
    level: 3,
    desc: 'زعانف تيتانيوم متكيفة تتيح تغيير مسار الطيران المفاجئ والمراوغة بزاوية 90 درجة في الهواء.',
    isEquipped: false,
  },
  {
    id: 'cryo_cooler',
    name: 'مُبرد النفاثة الكريوجيني السريع',
    nameEn: 'Cryogenic Rapid Recharger',
    category: 'إعادة شحن / تبريد',
    boostVelocity: 80,
    fuelCapacity: 85,
    rechargeSpeed: 98,
    level: 4,
    desc: 'نظام تبريد بالغاز المضغوط يعيد ملء خزان النفاثة بالكامل خلال 1.5 ثانية فقط بعد الهبوط.',
    isEquipped: false,
  },
];

export const JetpackBay: React.FC = () => {
  const [jetpacks, setJetpacks] = useState<JetpackItem[]>(INITIAL_JETPACKS);
  const [selectedId, setSelectedId] = useState<string>('turbo_nozzles');
  const [isThrusting, setIsThrusting] = useState(false);
  const [thrustPower, setThrustPower] = useState(0);

  const currentItem = jetpacks.find((j) => j.id === selectedId) || jetpacks[0];

  const handleSelect = (id: string) => {
    soundManager.playButtonClick();
    haptics.light();
    setSelectedId(id);
    stopThrust();
  };

  const handleToggleEquip = (id: string) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setJetpacks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEquipped: !item.isEquipped } : item))
    );
  };

  const startThrust = () => {
    if (isThrusting) return;
    setIsThrusting(true);
    soundManager.startJetpack();
    haptics.combatPulse();
  };

  const stopThrust = () => {
    if (!isThrusting) return;
    setIsThrusting(false);
    soundManager.stopJetpack();
    haptics.light();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isThrusting) {
      interval = setInterval(() => {
        setThrustPower((prev) => Math.min(100, prev + 12));
      }, 50);
    } else {
      interval = setInterval(() => {
        setThrustPower((prev) => Math.max(0, prev - 15));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isThrusting]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      soundManager.stopJetpack();
    };
  }, []);

  return (
    <div className="space-y-4 select-none">
      {/* Jetpack Header */}
      <div className="bg-[#0f1712] border border-[#223525] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#162519] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                ورشة تعديل النفاثة الصاروخية (JETPACK HYPER-DRIVE)
              </h3>
              <span className="bg-amber-950 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                NITRO BOOST
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              تطوير فوهات الاحتراق، خزانات النيتروجين وأنظمة المناورة الجوية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-gray-400">
            الترقيات النشطة:{' '}
            <strong className="text-amber-400 font-black">
              {jetpacks.filter((j) => j.isEquipped).length} / {jetpacks.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Interactive Thruster Ignition Stage */}
      <div className="bg-gradient-to-b from-[#121c15] to-[#09100c] border-2 border-amber-500/40 rounded-2xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Thrust Visual Chamber (Cols 5) */}
        <div className="md:col-span-5 bg-[#070c09] border border-[#1d2d20] rounded-xl p-3 flex flex-col justify-between h-[250px] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono">THRUST BENCH</span>
            <span className="text-amber-400 font-bold">{currentItem.category}</span>
          </div>

          {/* Jetpack Exhaust Flame VFX */}
          <div className="relative flex-1 flex flex-col items-center justify-center my-1">
            <motion.div
              animate={
                isThrusting
                  ? {
                      y: [-8, 2, -8],
                      scale: [1, 1.05, 1],
                    }
                  : { y: 0, scale: 1 }
              }
              transition={{ duration: 0.15, repeat: isThrusting ? Infinity : 0 }}
              className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1b2b1d] to-[#0c150e] border-2 border-amber-500/40 flex flex-col items-center justify-center shadow-2xl z-10"
            >
              <TacticalItemGraphic id={currentItem.id} className="w-16 h-16 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            </motion.div>

            {/* Twin Exhaust Jet Flames */}
            {isThrusting && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: [1, 1.4, 1] }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="flex items-center gap-6 mt-[-4px] pointer-events-none z-0"
              >
                <div className="w-4 h-14 bg-gradient-to-b from-cyan-300 via-amber-400 to-transparent rounded-full blur-[1px] animate-pulse" />
                <div className="w-4 h-14 bg-gradient-to-b from-cyan-300 via-amber-400 to-transparent rounded-full blur-[1px] animate-pulse" />
              </motion.div>
            )}
          </div>

          {/* Thrust Power Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-gray-400">قوة الدفع الحالية:</span>
              <span className="text-amber-400 font-black">{thrustPower}%</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-[#1e2f21]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-75"
                style={{ width: `${thrustPower}%` }}
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b2b1e]">
            <button
              onClick={() => handleToggleEquip(currentItem.id)}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                currentItem.isEquipped
                  ? 'bg-amber-500 text-black border border-amber-400'
                  : 'bg-[#142217] hover:bg-[#1b2f20] text-gray-300 border border-[#273d2b]'
              }`}
            >
              <Check size={14} />
              <span>{currentItem.isEquipped ? 'مُركب بالنفاثة' : 'تركيب الترقية'}</span>
            </button>

            <button
              onMouseDown={startThrust}
              onMouseUp={stopThrust}
              onTouchStart={startThrust}
              onTouchEnd={stopThrust}
              className={`py-2 px-2 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 border active:scale-95 ${
                isThrusting
                  ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 hover:brightness-110'
              }`}
            >
              <Flame size={14} className={isThrusting ? 'animate-bounce' : ''} />
              <span>{isThrusting ? 'إطلاق الدفع!' : 'اضغط لاختبار الدفع'}</span>
            </button>
          </div>
        </div>

        {/* Specs & Performance Telemetry (Cols 7) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-start justify-between border-b border-[#213524] pb-2">
            <div>
              <h4 className="text-base font-black text-white">{currentItem.name}</h4>
              <span className="text-xs text-gray-400 font-mono">{currentItem.nameEn}</span>
            </div>
            <span className="bg-amber-950 text-amber-300 text-xs font-mono font-black px-2.5 py-1 rounded-xl border border-amber-500/40">
              LVL {currentItem.level} / 5
            </span>
          </div>

          <p className="text-xs text-gray-300 bg-[#070d0a] p-2.5 rounded-xl border border-[#1b2b1e]">
            {currentItem.desc}
          </p>

          {/* Jetpack Gauges */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">سرعة الصعود</span>
                <span className="text-amber-400 font-mono">{currentItem.boostVelocity}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${currentItem.boostVelocity}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">سعة الخزان</span>
                <span className="text-cyan-400 font-mono">{currentItem.fuelCapacity}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${currentItem.fuelCapacity}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">سرعة الشحن</span>
                <span className="text-emerald-400 font-mono">{currentItem.rechargeSpeed}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${currentItem.rechargeSpeed}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#080e0a] p-2.5 rounded-xl border border-[#1a291e] flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles size={13} />
              <span>استهلاك وقود النفاثة أثناء التحليق: منخفض ومتوازن</span>
            </span>
            <span className="font-mono text-[10px] text-gray-500">REALTIME AERO ENGINE</span>
          </div>
        </div>
      </div>

      {/* Jetpacks Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {jetpacks.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1b271d] border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-[#0e1610] border-[#223525] hover:border-[#38533e]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold bg-black/60 text-amber-300 px-1.5 py-0.5 rounded border border-[#213524]">
                  LVL {item.level}
                </span>
                {item.isEquipped && (
                  <span className="text-[9px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded">
                    مُركب
                  </span>
                )}
              </div>

              <div className="h-14 flex items-center justify-center bg-[#070d0a] rounded-xl border border-[#1d2d20] my-1">
                <TacticalItemGraphic id={item.id} className="w-12 h-12" />
              </div>

              <div>
                <h5 className="text-xs font-black text-white truncate">{item.name}</h5>
                <span className="text-[10px] text-gray-400 block truncate">{item.nameEn}</span>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#1a2b1e] flex items-center justify-between text-[10px]">
                <span className="text-amber-400 font-bold">دفع: {item.boostVelocity}%</span>
                <span className="text-cyan-400 font-bold">خزان: {item.fuelCapacity}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
