import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ShieldAlert,
  Zap,
  Target,
  Swords,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Compass,
  Flame,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

export interface MapBriefingData {
  id: string;
  name: string;
  arName: string;
  subtitle: string;
  hazardLevel: 'منخفض' | 'متوسط' | 'مرتفع جداً' | 'شديد الخطورة ☠️';
  chokepoints: string[];
  keyWeapons: string[];
  gravity: string;
  description: string;
  badgeColor: string;
  accentGradient: string;
}

export const MAP_BRIEFINGS: MapBriefingData[] = [
  {
    id: 'outpost',
    name: 'Outpost Complex',
    arName: 'البؤرة العسكرية 🏰',
    subtitle: 'الموقع الكلاسيكي - برج استطلاع سنترال وأنفاق سفلية',
    hazardLevel: 'متوسط',
    chokepoints: ['فتحة السقوط السريعة (Central Chute)', 'أنفاق Catacombs السفلية', 'أبراج المراقبة'],
    keyWeapons: ['Sniper AWM', 'AK-47', 'Rocket Launcher RPG'],
    gravity: '1.0g (أرضية قياسية)',
    description: 'الموقع القتالي الأكثر شهرة في Mini Militia! يتميز بوجود برج مراقبة مرتفع في المنتصف يمنح أفقاً كاملاً للقناصين، مع فتحة سقوط رأسية للهروب السريع نحو الأنفاق الصخرية.',
    badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/80',
    accentGradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'catacombs',
    name: 'Catacombs Cavern',
    arName: 'السراديب المظلمة 💀',
    subtitle: 'أنفاق ضيقة ومستنقع حمضي شديد الخطورة',
    hazardLevel: 'شديد الخطورة ☠️',
    chokepoints: ['ممر الأحماض السامة (Acid Pits)', 'غرفة الممر الأوسط', 'أعمدة الصخور الصاعدة'],
    keyWeapons: ['Shotgun Sawed-Off', 'Dual Uzi', 'Shield & Pistol'],
    gravity: '1.0g (أنفاق مغلقة)',
    description: 'شبكة أنفاق صخرية ضيقة تتطلب سرعة بديهة واقتحام عن قرب! انتبه لمستنقعات الحمض الأخضر في القاع التي تلتهم دروع وسعادة المحاربين بسرعة.',
    badgeColor: 'border-rose-500 text-rose-400 bg-rose-950/80',
    accentGradient: 'from-rose-600 to-red-900',
  },
  {
    id: 'hightower',
    name: 'High Tower Suspension',
    arName: 'البرج المعلق 🌉',
    subtitle: 'جسور معلقة وسلاسل فولاذية بارتفاع شاهق',
    hazardLevel: 'مرتفع جداً',
    chokepoints: ['الجسر الفولاذي الرئيسي', 'منصة الهليكوبتر العلوية', 'سلاسل التعليق'],
    keyWeapons: ['Sniper AWM', 'RPG Rocket', 'M4 Rifle'],
    gravity: '0.9g (رياح علوية)',
    description: 'قاعدة عسكرية معلقة بين القمم الجبلية. السقوط من المنصات يعني الموت الحتمي ما لم تستخدم طاقة النفاثة بحكمة لإعادة الطيران.',
    badgeColor: 'border-cyan-500 text-cyan-300 bg-cyan-950/80',
    accentGradient: 'from-cyan-600 to-blue-900',
  },
  {
    id: 'lunarbase',
    name: 'Lunar Crater Base',
    arName: 'قاعدة القمر المدارية 🚀',
    subtitle: 'جاذبية منخفضة وطيران نفاث مدعوم لمسافات شاسعة',
    hazardLevel: 'متوسط',
    chokepoints: ['فوهة النيزك المركزية', 'منصات الطاقة الشمسي', 'قبة الأكسجين'],
    keyWeapons: ['Rocket Launcher RPG', 'Laser Sniper', 'Grenades'],
    gravity: '0.35g (جاذبية منخفضة 🌕)',
    description: 'ميدان فضائي مستقبل بسماء مظلمة وجاذبية قمرية منخفضة للغاية. تحكم بالطيران النفاث لمسافات عالية واقذف الصواريخ في الهواء بسهولة!',
    badgeColor: 'border-purple-500 text-purple-300 bg-purple-950/80',
    accentGradient: 'from-purple-600 to-indigo-900',
  },
];

interface TacticalMapBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMapId: string;
  onSelectMap: (map: MapBriefingData) => void;
}

export const TacticalMapBriefingModal: React.FC<TacticalMapBriefingModalProps> = ({
  isOpen,
  onClose,
  selectedMapId,
  onSelectMap,
}) => {
  const [activeTabMap, setActiveTabMap] = useState<MapBriefingData>(
    MAP_BRIEFINGS.find((m) => m.id === selectedMapId) || MAP_BRIEFINGS[0]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
        className="w-full max-w-2xl bg-[#0b140d] border-2 border-[#233f28] rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(16,185,129,0.2)] text-right space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-[#1c3321] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black font-black shadow-lg">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                خريطة المعركة والتخطيط التكتيكي
              </h3>
              <p className="text-[11px] text-gray-400">
                استعرض تفاصيل خرائط Mini Militia ونقاط المواجهة الحامية
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#132216] text-gray-400 hover:text-white hover:bg-[#1c3321] transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Map Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MAP_BRIEFINGS.map((map) => {
            const isActive = activeTabMap.id === map.id;
            return (
              <button
                key={map.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  haptics.light();
                  setActiveTabMap(map);
                }}
                className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-br ${map.accentGradient} text-white border-white shadow-lg`
                    : 'bg-[#101c13] text-gray-400 border-[#1a2d1f] hover:border-emerald-500/50'
                }`}
              >
                <span className="text-[10px] font-bold block opacity-80">{map.name}</span>
                <h4 className="text-xs font-black text-white truncate">{map.arName}</h4>
              </button>
            );
          })}
        </div>

        {/* Active Map Detail Briefing Box */}
        <div className="bg-[#101d14] border border-[#213a26] rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1b3120] pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${activeTabMap.badgeColor}`}>
                  مستوى الخطورة: {activeTabMap.hazardLevel}
                </span>
                <span className="text-[11px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {activeTabMap.gravity}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{activeTabMap.arName}</h3>
              <p className="text-xs text-gray-300">{activeTabMap.subtitle}</p>
            </div>

            <button
              onClick={() => {
                soundManager.playVictory();
                haptics.victory();
                onSelectMap(activeTabMap);
                onClose();
              }}
              className="py-2.5 px-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2 self-end sm:self-auto"
            >
              <CheckCircle2 size={16} />
              <span>اعتماد هذه الخريطة للمعركة</span>
            </button>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-[#09100a] p-3 rounded-xl border border-[#17271a]">
            {activeTabMap.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Chokepoints */}
            <div className="bg-[#0b140e] p-3 rounded-xl border border-[#1a2d1f]">
              <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 mb-2">
                <ShieldAlert size={14} />
                <span>مواقع الاشتباك الحامي (Chokepoints):</span>
              </h4>
              <ul className="space-y-1">
                {activeTabMap.chokepoints.map((cp, idx) => (
                  <li key={idx} className="text-[11px] text-gray-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{cp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Weapon Drops */}
            <div className="bg-[#0b140e] p-3 rounded-xl border border-[#1a2d1f]">
              <h4 className="text-xs font-black text-cyan-400 flex items-center gap-1.5 mb-2">
                <Flame size={14} />
                <span>الأسلحة الساقطة الخارقة في الميدان:</span>
              </h4>
              <ul className="space-y-1">
                {activeTabMap.keyWeapons.map((kw, idx) => (
                  <li key={idx} className="text-[11px] text-gray-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{kw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
