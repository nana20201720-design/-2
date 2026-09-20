import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Crosshair,
  Layers,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { haptics } from '../../utils/haptics';
import { TacticalItemGraphic } from './TacticalItemGraphic';

interface ArmorItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  defense: number;
  durability: number;
  weight: number;
  level: number;
  desc: string;
  isEquipped: boolean;
}

const INITIAL_ARMORS: ArmorItem[] = [
  {
    id: 'titanium_helmet',
    name: 'خوذة التيتانيوم البالستية',
    nameEn: 'Titanium Ballistic Helmet',
    category: 'حماية الرأس / خفيف',
    defense: 88,
    durability: 95,
    weight: 20,
    level: 4,
    desc: 'صفائح تيتانيوم مقوى تمنع طلقات القنص القاتلة في الرأس وتشتت ارتداد الشظايا بنسبة 60%.',
    isEquipped: true,
  },
  {
    id: 'heavy_kevlar',
    name: 'سترة الكيفلار العسكرية الثقيلة',
    nameEn: 'Tactical Heavy Kevlar Vest',
    category: 'حماية الصدر / ثقيل',
    defense: 94,
    durability: 90,
    weight: 45,
    level: 5,
    desc: 'طبقات متعددة من ألياف الكيفلار مع صفائح سيراميك لامتصاص طلقات الرشاشات والشوزن القريب.',
    isEquipped: true,
  },
  {
    id: 'nano_plating',
    name: 'درع النانو التكتيكي المضاد للمتفجرات',
    nameEn: 'Nano Blast-Shield Plate',
    category: 'مضاد انفجارات / نانوي',
    defense: 96,
    durability: 85,
    weight: 35,
    level: 3,
    desc: 'مصفوفة نانوية متطورة تمتص طاقة قذائف RPG وانفجارات القنابل اليدوية وتقلل الصعق الحركي.',
    isEquipped: false,
  },
  {
    id: 'assault_boots',
    name: 'أحذية المناورة التكتيكية المصفحة',
    nameEn: 'Combat Maneuver Exo-Boots',
    category: 'حركة ومناورة / خفيف',
    defense: 75,
    durability: 98,
    weight: 15,
    level: 4,
    desc: 'نوابض هيدروليكية مصغرة ترفع سرعة الركض بنسبة 25% وتوفر مناعة من ضرر ألغام الاستشعار.',
    isEquipped: false,
  },
];

export const ArmorWorkshop: React.FC = () => {
  const [armors, setArmors] = useState<ArmorItem[]>(INITIAL_ARMORS);
  const [selectedArmorId, setSelectedArmorId] = useState<string>('titanium_helmet');
  const [isTestingDeflection, setIsTestingDeflection] = useState(false);
  const [testHits, setTestHits] = useState<number>(0);
  const [deflectionLog, setDeflectionLog] = useState<string | null>(null);

  const currentArmor = armors.find((a) => a.id === selectedArmorId) || armors[0];

  const handleSelect = (id: string) => {
    soundManager.playButtonClick();
    haptics.light();
    setSelectedArmorId(id);
    setDeflectionLog(null);
  };

  const handleToggleEquip = (id: string) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setArmors((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isEquipped: !item.isEquipped } : item))
    );
  };

  const handleTestDeflection = () => {
    setIsTestingDeflection(true);
    soundManager.playRifle();
    setTimeout(() => {
      soundManager.playShieldDeflect();
      haptics.heavy();
    }, 90);

    setTestHits((prev) => prev + 1);
    setDeflectionLog(`تم صد الرصاصة بنجاح! نسبة امتصاص الضرر: ${currentArmor.defense}%`);

    setTimeout(() => {
      setIsTestingDeflection(false);
    }, 350);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Workshop Header */}
      <div className="bg-[#0e1711] border border-[#233526] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#152318] border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                ورشة صيانة وتطوير الدروع التكتيكية (ARMOR WORKSHOP)
              </h3>
              <span className="bg-blue-950 text-blue-400 border border-blue-500/40 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                BALANCED
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              تجهيز الدروع الميدانية لتقليل أضرار الرصاص، الشظايا والانفجارات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-gray-400">
            الدروع النشطة:{' '}
            <strong className="text-blue-400 font-black">
              {armors.filter((a) => a.isEquipped).length} / {armors.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Selected Armor Detailed Inspector & Live Deflection Bench */}
      <div className="bg-gradient-to-b from-[#111d14] to-[#0a120c] border-2 border-blue-500/40 rounded-2xl p-4 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Visual Inspection Card (Cols 5) */}
        <div className="md:col-span-5 bg-[#080d09] border border-[#1d2d20] rounded-xl p-3 flex flex-col justify-between h-[250px] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono">SPECIMEN INSPECTOR</span>
            <span className="text-blue-400 font-bold">{currentArmor.category}</span>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-2">
            <motion.div
              animate={isTestingDeflection ? { scale: [1, 1.08, 1], rotate: [-2, 2, 0] } : {}}
              transition={{ duration: 0.2 }}
              className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#18291c] to-[#0c160f] border-2 border-blue-500/40 flex flex-col items-center justify-center shadow-2xl"
            >
              <TacticalItemGraphic id={currentArmor.id} className="w-20 h-20 filter drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />

              {/* Deflection Spark Burst */}
              {isTestingDeflection && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-cyan-400/40 blur-md animate-ping" />
                  <Sparkles size={36} className="text-white animate-spin absolute" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Armor Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b2b1e]">
            <button
              onClick={() => handleToggleEquip(currentArmor.id)}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 ${
                currentArmor.isEquipped
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-[#142217] hover:bg-[#1b2f20] text-gray-300 border border-[#273d2b]'
              }`}
            >
              <Check size={14} />
              <span>{currentArmor.isEquipped ? 'مُجهز ميدانياً' : 'تجهيز الدرع'}</span>
            </button>

            <button
              onClick={handleTestDeflection}
              disabled={isTestingDeflection}
              className="py-2 px-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 border border-cyan-400/40"
            >
              <Crosshair size={14} />
              <span>اختبار الصد الحي</span>
            </button>
          </div>
        </div>

        {/* Armor Telemetry & Stats (Cols 7) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-start justify-between border-b border-[#213524] pb-2">
            <div>
              <h4 className="text-base font-black text-white">{currentArmor.name}</h4>
              <span className="text-xs text-gray-400 font-mono">{currentArmor.nameEn}</span>
            </div>
            <span className="bg-blue-950 text-blue-300 text-xs font-mono font-black px-2.5 py-1 rounded-xl border border-blue-500/40">
              LVL {currentArmor.level} / 5
            </span>
          </div>

          <p className="text-xs text-gray-300 bg-[#080d09] p-2.5 rounded-xl border border-[#1b2b1e]">
            {currentArmor.desc}
          </p>

          {/* Armor Stats Gauges */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">الحماية</span>
                <span className="text-blue-400 font-mono">{currentArmor.defense}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${currentArmor.defense}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">الصلابة</span>
                <span className="text-emerald-400 font-mono">{currentArmor.durability}%</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${currentArmor.durability}%` }}
                />
              </div>
            </div>

            <div className="bg-[#0b140e] p-2 rounded-xl border border-[#1f3323]">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-400">الوزن</span>
                <span className="text-amber-400 font-mono">{currentArmor.weight} kg</span>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${currentArmor.weight * 2}%` }}
                />
              </div>
            </div>
          </div>

          {/* Live Deflection Test Console Feedback */}
          {deflectionLog && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs p-2 rounded-xl flex items-center justify-between font-mono"
            >
              <span>{deflectionLog}</span>
              <span className="text-[10px] text-gray-400">طلقات تم صدها: {testHits}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Armors Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {armors.map((armor) => {
          const isSelected = armor.id === selectedArmorId;
          return (
            <div
              key={armor.id}
              onClick={() => handleSelect(armor.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#18281b] border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-[#0f1812] border-[#223525] hover:border-[#38533e]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold bg-black/60 text-blue-300 px-1.5 py-0.5 rounded border border-[#213524]">
                  LVL {armor.level}
                </span>
                {armor.isEquipped && (
                  <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    مُجهز
                  </span>
                )}
              </div>

              <div className="h-14 flex items-center justify-center bg-[#080d09] rounded-xl border border-[#1d2d20] my-1">
                <TacticalItemGraphic id={armor.id} className="w-12 h-12" />
              </div>

              <div>
                <h5 className="text-xs font-black text-white truncate">{armor.name}</h5>
                <span className="text-[10px] text-gray-400 block truncate">{armor.nameEn}</span>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#1a2b1e] flex items-center justify-between text-[10px]">
                <span className="text-blue-400 font-bold">حماية: {armor.defense}%</span>
                <span className="text-emerald-400 font-bold">صلابة: {armor.durability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
