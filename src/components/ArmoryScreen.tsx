import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Shield,
  Zap,
  Target,
  Flame,
  Crosshair,
  Check,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Swords,
  Wrench,
  Bomb,
  Layers,
  Coins,
  Radio,
  Scale,
} from 'lucide-react';
import { WeaponItem } from '../types';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';
import { haptics } from '../utils/haptics';
import { WeaponSpriteSVG } from '../game/weaponSprites';
import { ArsenalPegboardRack } from './armory/ArsenalPegboardRack';
import { WeaponFiringRange } from './armory/WeaponFiringRange';
import { ArmorWorkshop } from './armory/ArmorWorkshop';
import { ThrowablesBay } from './armory/ThrowablesBay';
import { JetpackBay } from './armory/JetpackBay';
import { WeaponSkinCarousel } from './armory/WeaponSkinCarousel';
import { ThreeDWeaponViewer } from './armory/ThreeDWeaponViewer';
import { AnimatedCrateCutsceneModal, UnlockedItemPayload } from './AnimatedCrateCutsceneModal';
import {
  getWeaponRarityTier,
  WEAPON_RARITY_THEMES,
  WeaponGlowBackdrop,
  DynamicRarityScreenBackdrop,
  WeaponRarityTier,
} from '../utils/weaponRarityThemes';
import {
  getWeaponBiome,
  WEAPON_BIOMES,
  WeaponBiomeId,
} from '../utils/weaponEnvironmentThemes';
import { WeaponEnvironmentBackdrop } from './WeaponEnvironmentBackdrop';

// High-fidelity glowing circular gauge for tactical weapon stats
function CircularGauge({
  value,
  max = 100,
  label,
  colorClass,
  trailColor,
  icon: Icon,
  unit = '',
}: {
  value: number;
  max?: number;
  label: string;
  colorClass: string;
  trailColor: string;
  icon: React.ComponentType<any>;
  unit?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#09110b] border border-[#213523]/80 hover:border-amber-500/40 transition-all duration-300 shadow-inner group">
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* SVG gauge tracks */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            className={`${trailColor} stroke-[3.5] fill-none`}
          />
          <motion.circle
            cx="28"
            cy="28"
            r={radius}
            className={`${colorClass} stroke-[4.5] fill-none stroke-linecap-round`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute flex items-center justify-center">
          <Icon size={14} className="text-white group-hover:scale-110 transition-transform" />
        </div>
      </div>
      <span className="text-[10px] font-black text-gray-400 mt-2 block">{label}</span>
      <span className="text-xs font-black text-white mt-0.5 font-mono">
        {value}
        {unit && <span className="text-[9px] text-gray-500 mr-0.5 font-bold">{unit}</span>}
      </span>
    </div>
  );
}

const INITIAL_WEAPONS: WeaponItem[] = [
  {
    id: 'sniper',
    name: 'بندقية القنص التكتيكية .50',
    nameEn: 'Sniper Rifle .50 BMG',
    category: 'أسطوري / بعيد المدى',
    damage: 98,
    range: 99,
    reload: 45,
    magSize: 6,
    level: 4,
    cards: 80,
    maxCards: 100,
    upgradeCost: 2500,
    desc: 'منظار تكبير 8x مع ليزر تصويب استراتيجي ورصاصة واحدة قاتلة في الصدر أو الرأس.',
  },
  {
    id: 'rocket',
    name: 'قاذف الصواريخ RPG-7',
    nameEn: 'Rocket Launcher RPG-7',
    category: 'متفجر / أسطوري',
    damage: 100,
    range: 85,
    reload: 35,
    magSize: 2,
    level: 3,
    cards: 45,
    maxCards: 60,
    upgradeCost: 1800,
    desc: 'قذائف متفجرة تدمر المخابئ الحصينة ومجموعات الأعداء في دائرة انفجار واسعة.',
  },
  {
    id: 'riot_shield',
    name: 'درع الصد التكتيكي Riot Shield',
    nameEn: 'Bulletproof Riot Shield',
    category: 'دفاعي / صد رصاص',
    damage: 40,
    range: 20,
    reload: 95,
    magSize: 1,
    level: 4,
    cards: 60,
    maxCards: 75,
    upgradeCost: 1600,
    desc: 'صد 80% من الرصاص والشظايا مع إمكانية استخدام مسدس إطلاق يدوي للدفاع.',
  },
  {
    id: 'dual_uzi',
    name: 'رشاش مزدوج Dual Uzi',
    nameEn: 'Dual Tactical Uzis',
    category: 'سريع / مواجهات قريبة',
    damage: 75,
    range: 60,
    reload: 80,
    magSize: 60,
    level: 4,
    cards: 70,
    maxCards: 80,
    upgradeCost: 1500,
    desc: 'حمل سلاحين في آن واحد بكثافة نيران خارقة تمزق دروع الخصوم في ثوانٍ.',
  },
  {
    id: 'desert_eagle_gold',
    name: 'ديزرت إيجل الذهب الملكي',
    nameEn: 'Desert Eagle Golden Edition',
    category: 'ذهبي خاص / سلاح فتاك',
    damage: 95,
    range: 75,
    reload: 65,
    magSize: 14,
    level: 5,
    cards: 100,
    maxCards: 100,
    upgradeCost: 3500,
    desc: 'نسخة ميدانية مذهبة بضرر فتاك وسرعة إطلاق مضاعفة مع تأثير إقصاء خاص.',
    isSpecial: true,
  },
  {
    id: 'shotgun',
    name: 'الشوزن الفتاك Combat Shotgun',
    nameEn: 'Pump-Action Shotgun',
    category: 'قريب المدى / قوة مدمرة',
    damage: 92,
    range: 45,
    reload: 60,
    magSize: 8,
    level: 5,
    cards: 90,
    maxCards: 90,
    upgradeCost: 2000,
    desc: 'انتشار شظايا فتاك يقضي على أي عدو يقترب منك في الممرات والأنفاق الضيقة.',
  },
  {
    id: 'saw_gun',
    name: 'منشار القتل SAW Machine Gun',
    nameEn: 'Heavy Squad SAW Gun',
    category: 'سلاح ثقيل / ذخيرة لا تنتهي',
    damage: 82,
    range: 78,
    reload: 50,
    magSize: 100,
    level: 3,
    cards: 40,
    maxCards: 50,
    upgradeCost: 2200,
    desc: 'مخزن دائري ضخم يوفر غطاء نيران متواصلاً بدون الحاجة لتلقيم متكرر.',
  },
  {
    id: 'm4_rifle',
    name: 'بندقية M4 الهجومية',
    nameEn: 'M4 Tactical Assault Rifle',
    category: 'هجومي / توازن مثالي',
    damage: 80,
    range: 82,
    reload: 75,
    magSize: 30,
    level: 4,
    cards: 65,
    maxCards: 80,
    upgradeCost: 1700,
    desc: 'السلاح الميداني الأكثر اتزاناً ودقة للمناورات السريعة ومسافات الاشتباك المتنوعة.',
  },
];

type ArmoryTab = 'arsenal' | 'armor' | 'throwables' | 'jetpack';
type WeaponCategory = 'primary' | 'secondary' | 'special';

export default function ArmoryScreen() {
  const [activeTab, setActiveTab] = useState<ArmoryTab>('arsenal');
  const [weaponCategory, setWeaponCategory] = useState<WeaponCategory>('primary');
  const [weapons, setWeapons] = useState<WeaponItem[]>(INITIAL_WEAPONS);
  const [selectedWeaponId, setSelectedWeaponId] = useState('sniper');
  const [compareWeaponId, setCompareWeaponId] = useState<string | null>(null);
  const [equippedPrimary, setEquippedPrimary] = useState(
    () => settingsManager.getSettings().equippedPrimaryWeapon || 'sniper'
  );
  const [equippedSecondary, setEquippedSecondary] = useState(
    () => settingsManager.getSettings().equippedSecondaryWeapon || 'dual_uzi'
  );
  const [settings, setSettings] = useState(() => settingsManager.getSettings());
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: 'check' | 'upgrade' } | null>(null);
  const [upgradedCutscenePayload, setUpgradedCutscenePayload] = useState<UnlockedItemPayload | null>(null);
  const [showCutsceneModal, setShowCutsceneModal] = useState(false);
  const [hoveredWeaponTier, setHoveredWeaponTier] = useState<WeaponRarityTier | null>(null);
  const [hoveredWeaponId, setHoveredWeaponId] = useState<string | null>(null);
  const [isAutoBiome, setIsAutoBiome] = useState(true);
  const [selectedBiome, setSelectedBiome] = useState<WeaponBiomeId>('jungle_forest');

  const currentWeapon =
    weapons.find((w) => w.id === selectedWeaponId) || weapons[0];

  const activeWeaponForBiome = hoveredWeaponId
    ? weapons.find((w) => w.id === hoveredWeaponId) || currentWeapon
    : currentWeapon;
  const detectedBiome = getWeaponBiome(activeWeaponForBiome);
  const activeBiome: WeaponBiomeId = isAutoBiome ? detectedBiome : selectedBiome;

  const selectedRarityTier = getWeaponRarityTier(currentWeapon);
  const activeScreenTier: WeaponRarityTier = hoveredWeaponTier || selectedRarityTier;
  const activeRarityTheme = WEAPON_RARITY_THEMES[activeScreenTier];

  const getPowerProgressionData = (weapon: WeaponItem) => {
    const progression = [];
    // Backtrack base damage at level 1 dynamically
    const baseDamage = Math.round(weapon.damage / (1 + (weapon.level - 1) * 0.08));
    for (let lvl = 1; lvl <= 5; lvl++) {
      const dmg = Math.round(baseDamage * (1 + (lvl - 1) * 0.08));
      progression.push({
        level: `مستوى ${lvl}`,
        'الضرر الإجمالي': dmg,
        isCurrent: lvl === weapon.level,
      });
    }
    return progression;
  };

  const comparedWeapon = compareWeaponId ? weapons.find((w) => w.id === compareWeaponId) : null;

  const filteredWeapons = weapons.filter((w) => {
    if (weaponCategory === 'special') return w.isSpecial || w.id === 'riot_shield';
    if (weaponCategory === 'secondary') return w.id === 'dual_uzi';
    if (weaponCategory === 'primary') return !w.isSpecial && w.id !== 'riot_shield' && w.id !== 'dual_uzi';
    return true;
  });

  const handleTabChange = (tab: ArmoryTab) => {
    soundManager.playButtonClick();
    haptics.light();
    setActiveTab(tab);
  };

  const handleSelectWeapon = (id: string) => {
    setSelectedWeaponId(id);
  };

  const handleEquipPrimary = () => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedPrimary(currentWeapon.id);
    settingsManager.updateSettings({ equippedPrimaryWeapon: currentWeapon.id });
    showToast(`تم تجهيز ${currentWeapon.name} كسلاح قتال رئيسي!`, 'check');
  };

  const handleEquipSecondary = () => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedSecondary(currentWeapon.id);
    settingsManager.updateSettings({ equippedSecondaryWeapon: currentWeapon.id });
    showToast(`تم تجهيز ${currentWeapon.name} كسلاح قتال ثانوي!`, 'check');
  };

  const handleUpgrade = () => {
    if (currentWeapon.level >= 5) {
      showToast(`${currentWeapon.name} في أقصى مستوى تطوير حالياً!`, 'check');
      return;
    }
    soundManager.playVictory();
    haptics.victory();

    const nextLevel = currentWeapon.level + 1;
    const oldDmg = currentWeapon.damage;
    const newDmg = Math.min(100, currentWeapon.damage + 2);

    setWeapons((prev) =>
      prev.map((w) => {
        if (w.id === currentWeapon.id) {
          return {
            ...w,
            level: nextLevel,
            damage: newDmg,
            range: Math.min(100, w.range + 1),
            cards: 0,
            maxCards: w.maxCards + 25,
            upgradeCost: w.upgradeCost + 500,
          };
        }
        return w;
      })
    );

    // Trigger Cutscene Modal
    setUpgradedCutscenePayload({
      title: '🔥 ترقية سلاح تكتيكية ناجحة!',
      subtitle: `تمت زيادة القوة البالستية وفتح المستوى ${nextLevel}`,
      type: 'weapon_upgrade',
      rarity: nextLevel >= 5 ? 'legendary' : nextLevel >= 4 ? 'epic' : 'rare',
      itemName: `${currentWeapon.name}`,
      itemNameEn: `${currentWeapon.nameEn} • Level ${nextLevel}`,
      badge: `LEVEL UP ${nextLevel} ⚡`,
      statGains: [
        { label: 'قوة الضرر البالستي', oldVal: `${oldDmg}`, newVal: `${newDmg}` },
        { label: 'المدى الفعال', oldVal: `${currentWeapon.range}m`, newVal: `${Math.min(100, currentWeapon.range + 1)}m` },
        { label: 'مستوى الترقية', oldVal: `Lvl ${currentWeapon.level}`, newVal: `Lvl ${nextLevel}` },
      ],
    });
    setShowCutsceneModal(true);

    showToast(`تمت ترقية ${currentWeapon.name} إلى المستوى ${nextLevel}!`, 'upgrade');
  };

  const showToast = (text: string, icon: 'check' | 'upgrade') => {
    setToastMessage({ text, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const getWeaponIcon = (id: string, className: string = 'w-10 h-7') => {
    return (
      <WeaponSpriteSVG
        weapon={id}
        skinId={settings.weaponSkins?.[id]}
        lightingMode={settings.armoryLightingMode || 'pbr'}
        environmentId={settings.armoryEnvironment || 'training_range'}
        className={className}
      />
    );
  };

  return (
    <WeaponEnvironmentBackdrop
      biomeId={activeBiome}
      isAutoMode={isAutoBiome}
      onSelectBiome={(bId) => {
        setIsAutoBiome(false);
        setSelectedBiome(bId);
      }}
      onToggleAutoMode={() => setIsAutoBiome((prev) => !prev)}
      subTitle={`البيئة المتكيفة: ${WEAPON_BIOMES[activeBiome].nameAr} • متوافقة مع ${activeWeaponForBiome.name}`}
      className="pb-36 sm:pb-32 pt-2"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 select-none"
      >
        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => handleTabChange('arsenal')}
          className={`px-4 py-2 rounded-xl text-xs font-black shadow-md shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'arsenal'
              ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-black shadow-emerald-500/20'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Crosshair size={14} />
          <span>ترسانة الأسلحة (Arsenal)</span>
        </button>

        <button
          onClick={() => handleTabChange('armor')}
          className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'armor'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-black shadow-blue-500/20'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Shield size={14} />
          <span>الدروع والمعدات (Armor)</span>
        </button>

        <button
          onClick={() => handleTabChange('throwables')}
          className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'throwables'
              ? 'bg-gradient-to-r from-red-600 to-amber-500 text-black shadow-red-500/20'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Bomb size={14} />
          <span>القنابل والغاز (Throwables)</span>
        </button>

        <button
          onClick={() => handleTabChange('jetpack')}
          className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'jetpack'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/20'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Zap size={14} />
          <span>ترقيات النفاثة (Jetpack)</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'arsenal' && (
        <>
          {/* Sub-Category Filters for Arsenal */}
          <div className="flex items-center gap-2 mb-2 bg-[#0a120d] p-1.5 rounded-xl border border-[#1e2f21]">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setWeaponCategory('primary');
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 ${
                weaponCategory === 'primary'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Swords size={12} />
              <span>أسلحة أساسية (Primary)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setWeaponCategory('secondary');
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 ${
                weaponCategory === 'secondary'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Target size={12} />
              <span>أسلحة ثانوية (Secondary)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setWeaponCategory('special');
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 ${
                weaponCategory === 'special'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={12} />
              <span>أسلحة خاصة (Special)</span>
            </button>
          </div>

          {/* 1. 3D GUNSMITH & WEAPON PODIUM (Three.js WebGL Real-time 360° Studio) */}
          <ThreeDWeaponViewer
            weapon={currentWeapon}
            skinId={settings.weaponSkins?.[currentWeapon.id]}
            onSelectSkin={() => setSettings(settingsManager.getSettings())}
          />

          {/* 2. 3D TACTICAL WEAPON VAULT RACK (8 WEAPONS DISPLAY) */}
          <ArsenalPegboardRack
            weapons={filteredWeapons}
            selectedWeaponId={selectedWeaponId}
            equippedPrimary={equippedPrimary}
            equippedSecondary={equippedSecondary}
            onSelectWeapon={handleSelectWeapon}
            onHoverWeapon={(id) => {
              setHoveredWeaponId(id);
              setHoveredWeaponTier(id ? getWeaponRarityTier({ id }) : null);
            }}
            onEquipPrimary={(id) => {
              setSelectedWeaponId(id);
              setEquippedPrimary(id);
              settingsManager.updateSettings({ equippedPrimaryWeapon: id });
              const w = weapons.find((item) => item.id === id);
              showToast(`تم تجهيز ${w?.name || id} كسلاح قتال رئيسي 1!`, 'check');
            }}
            onEquipSecondary={(id) => {
              setSelectedWeaponId(id);
              setEquippedSecondary(id);
              settingsManager.updateSettings({ equippedSecondaryWeapon: id });
              const w = weapons.find((item) => item.id === id);
              showToast(`تم تجهيز ${w?.name || id} كسلاح قتال ثانوي 2!`, 'check');
            }}
          />

          {/* 3. INTERACTIVE LIVE SHOOTING RANGE (TEST-FIRE AT TARGET) */}
          <WeaponFiringRange weapon={currentWeapon} />

          {/* 4. SELECTED WEAPON INSPECTION BENCH WITH DYNAMIC RARITY GLOW */}
          <section
            className="bg-gradient-to-b from-[#142318] to-[#0d1610] border-2 rounded-2xl p-4 shadow-xl space-y-4 transition-all duration-700"
            style={{
              borderColor: `${activeRarityTheme.accentHex}88`,
              boxShadow: `0 0 30px ${activeRarityTheme.accentHex}20`,
            }}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="relative w-20 h-14 bg-[#08120a] rounded-xl flex items-center justify-center p-1.5 shadow-inner shrink-0 overflow-hidden border transition-colors duration-500"
                  style={{
                    borderColor: `${activeRarityTheme.accentHex}88`,
                    boxShadow: `0 0 20px ${activeRarityTheme.accentHex}30`,
                  }}
                >
                  {/* Dynamic Glow Halo Behind Weapon */}
                  <WeaponGlowBackdrop tier={selectedRarityTier} size="sm" intensity="high" />

                  <div className="relative z-10">
                    <WeaponSpriteSVG
                      weapon={currentWeapon.id}
                      skinId={settings.weaponSkins?.[currentWeapon.id]}
                      lightingMode={settings.armoryLightingMode || 'pbr'}
                      environmentId={settings.armoryEnvironment || 'training_range'}
                      className="w-14 h-9 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {currentWeapon.name}
                    </h3>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded border transition-colors duration-500"
                      style={{
                        backgroundColor: `${activeRarityTheme.accentHex}22`,
                        borderColor: `${activeRarityTheme.accentHex}77`,
                        color: activeRarityTheme.accentHex,
                      }}
                    >
                      {activeRarityTheme.arabicLabel} ★
                    </span>
                    <span className="text-[10px] bg-neutral-800/80 text-gray-300 font-bold px-2 py-0.5 rounded border border-neutral-700">
                      {currentWeapon.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono tracking-wider block mt-0.5">
                    {currentWeapon.nameEn}
                  </span>
                </div>
              </div>

              <div className="bg-[#0b120d] px-3 py-1.5 rounded-xl border border-emerald-500/40 text-right">
                <span className="text-[10px] text-gray-400 block">المستوى الحالي</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  LVL {currentWeapon.level}
                  <span className="text-xs text-gray-500">/5</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-[#0b120d] p-3 rounded-xl border border-[#1e2f21]">
              {currentWeapon.desc}
            </p>

            {/* Ballistic Gauges Grid using Small Circular Charts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <CircularGauge
                value={currentWeapon.damage}
                max={100}
                label="الضرر البالستي"
                colorClass="stroke-red-500"
                trailColor="stroke-red-950/40"
                icon={Flame}
              />
              <CircularGauge
                value={currentWeapon.range}
                max={100}
                label="المدى الفعال"
                colorClass="stroke-cyan-400"
                trailColor="stroke-cyan-950/40"
                icon={Target}
              />
              <CircularGauge
                value={currentWeapon.reload}
                max={100}
                label="سرعة التلقيم"
                colorClass="stroke-amber-400"
                trailColor="stroke-amber-950/40"
                icon={Zap}
              />
              <CircularGauge
                value={currentWeapon.magSize}
                max={100}
                label="سعة الخزنة"
                colorClass="stroke-emerald-400"
                trailColor="stroke-emerald-950/40"
                icon={Shield}
                unit=" طلقة"
              />
            </div>

            {/* Power Progression Area Chart with Recharts */}
            <div className="bg-[#0b120d] p-3.5 rounded-xl border border-[#223526] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-300 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span>تطور قوة الضرر البالستي عبر المستويات (Power Progression)</span>
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-black">
                  معاينة الترقية مستقبلاً 📈
                </span>
              </div>
              
              <p className="text-[10px] text-gray-400 leading-relaxed text-right">
                رسم بياني يوضح الزيادة المتوقعة في الضرر البالستي الإجمالي المكتسب مع كل ترقية تكتيكية لمستوى السلاح (مستوى 1 إلى 5) قبل صرف الذهب والبطاقات.
              </p>

              <div className="h-32 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getPowerProgressionData(currentWeapon)}
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorDamageProgression" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="level"
                      stroke="#4b5563"
                      fontSize={9}
                      tickLine={false}
                      axisLine={{ stroke: '#1f2937' }}
                    />
                    <YAxis
                      stroke="#4b5563"
                      fontSize={9}
                      tickLine={false}
                      axisLine={{ stroke: '#1f2937' }}
                      domain={['dataMin - 15', 'dataMax + 10']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0c140f',
                        borderColor: '#223526',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#fff',
                        textAlign: 'right',
                      }}
                      formatter={(value: any) => [`${value} نقطة ضرر`, 'الضرر البالستي']}
                    />
                    <Area
                      type="monotone"
                      dataKey="الضرر الإجمالي"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDamageProgression)"
                      activeDot={{ r: 5, strokeWidth: 0, fill: '#f59e0b' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tactical Weapon Comparison Tool */}
            <div className="bg-[#0b120d] p-3 rounded-xl border border-[#223526] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-300 flex items-center gap-1.5">
                  <Scale size={14} className="text-amber-400" />
                  <span>مقارنة تكتيكية للمؤشرات (Weapon Comparison)</span>
                </span>
                {compareWeaponId && (
                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      setCompareWeaponId(null);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                  >
                    إلغاء المقارنة ✕
                  </button>
                )}
              </div>
              
              <select
                value={compareWeaponId || ''}
                onChange={(e) => {
                  soundManager.playButtonClick();
                  haptics.light();
                  setCompareWeaponId(e.target.value || null);
                }}
                className="w-full bg-[#070d08] border border-[#233526] text-white text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="">-- اختر سلاحاً آخر للمقارنة المباشرة --</option>
                {weapons.filter(w => w.id !== currentWeapon.id).map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {comparedWeapon && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d1611] p-3.5 rounded-xl border border-amber-500/30 space-y-3"
              >
                <h4 className="text-xs font-black text-amber-400 border-b border-[#233526] pb-1.5 flex items-center gap-1">
                  <span>📊 مقارنة بالستية:</span>
                  <span className="text-white">{currentWeapon.name}</span>
                  <span className="text-gray-400">ضد</span>
                  <span className="text-cyan-400">{comparedWeapon.name}</span>
                </h4>
                
                <div className="space-y-3">
                  {/* Damage Compare */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-300">الضرر الإجمالي</span>
                      <div className="flex gap-2">
                        <span className="text-white font-mono">{currentWeapon.damage}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-cyan-400 font-mono">{comparedWeapon.damage}</span>
                        <span className={`font-mono font-black ${currentWeapon.damage - comparedWeapon.damage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({currentWeapon.damage - comparedWeapon.damage >= 0 ? '+' : ''}{currentWeapon.damage - comparedWeapon.damage})
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#070d09] rounded-full overflow-hidden flex p-0.5 border border-[#1b2b1e]">
                      <div className="h-full bg-amber-500 rounded-l" style={{ width: `${(currentWeapon.damage / (currentWeapon.damage + comparedWeapon.damage)) * 100}%` }} />
                      <div className="h-full bg-cyan-400 rounded-r" style={{ width: `${(comparedWeapon.damage / (currentWeapon.damage + comparedWeapon.damage)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Range Compare */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-300">المدى والتصويب</span>
                      <div className="flex gap-2">
                        <span className="text-white font-mono">{currentWeapon.range}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-cyan-400 font-mono">{comparedWeapon.range}</span>
                        <span className={`font-mono font-black ${currentWeapon.range - comparedWeapon.range >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({currentWeapon.range - comparedWeapon.range >= 0 ? '+' : ''}{currentWeapon.range - comparedWeapon.range})
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#070d09] rounded-full overflow-hidden flex p-0.5 border border-[#1b2b1e]">
                      <div className="h-full bg-amber-500 rounded-l" style={{ width: `${(currentWeapon.range / (currentWeapon.range + comparedWeapon.range)) * 100}%` }} />
                      <div className="h-full bg-cyan-400 rounded-r" style={{ width: `${(comparedWeapon.range / (currentWeapon.range + comparedWeapon.range)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Reload Compare */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-300">سرعة التلقيم (Reload Speed)</span>
                      <div className="flex gap-2">
                        <span className="text-white font-mono">{currentWeapon.reload}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-cyan-400 font-mono">{comparedWeapon.reload}</span>
                        <span className={`font-mono font-black ${currentWeapon.reload - comparedWeapon.reload >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({currentWeapon.reload - comparedWeapon.reload >= 0 ? '+' : ''}{currentWeapon.reload - comparedWeapon.reload})
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#070d09] rounded-full overflow-hidden flex p-0.5 border border-[#1b2b1e]">
                      <div className="h-full bg-amber-500 rounded-l" style={{ width: `${(currentWeapon.reload / (currentWeapon.reload + comparedWeapon.reload)) * 100}%` }} />
                      <div className="h-full bg-cyan-400 rounded-r" style={{ width: `${(comparedWeapon.reload / (currentWeapon.reload + comparedWeapon.reload)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Mag Size Compare */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-300">سعة الخزنة</span>
                      <div className="flex gap-2">
                        <span className="text-white font-mono">{currentWeapon.magSize}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-cyan-400 font-mono">{comparedWeapon.magSize}</span>
                        <span className={`font-mono font-black ${currentWeapon.magSize - comparedWeapon.magSize >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ({currentWeapon.magSize - comparedWeapon.magSize >= 0 ? '+' : ''}{currentWeapon.magSize - comparedWeapon.magSize})
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#070d09] rounded-full overflow-hidden flex p-0.5 border border-[#1b2b1e]">
                      <div className="h-full bg-amber-500 rounded-l" style={{ width: `${(currentWeapon.magSize / (currentWeapon.magSize + comparedWeapon.magSize)) * 100}%` }} />
                      <div className="h-full bg-cyan-400 rounded-r" style={{ width: `${(comparedWeapon.magSize / (currentWeapon.magSize + comparedWeapon.magSize)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Upgrade Bench & Equip Buttons */}
            <div className="bg-[#0b120d] p-3 rounded-xl border border-[#223526] space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Layers size={14} className="text-cyan-400" />
                  <span>بطاقات الترقية التكتيكية:</span>
                </span>
                <span className="text-cyan-400 font-mono">
                  {currentWeapon.cards} / {currentWeapon.maxCards} بطاقة
                </span>
              </div>

              <div className="h-2 bg-[#070d09] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-cyan-400 rounded-full shadow-[0_0_6px_#00daf3]"
                  style={{
                    width: `${Math.min(100, (currentWeapon.cards / currentWeapon.maxCards) * 100)}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  onClick={handleUpgrade}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <TrendingUp size={16} />
                  <span>ترقية ({currentWeapon.upgradeCost} ذهب)</span>
                </button>

                <button
                  onClick={handleEquipPrimary}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                    equippedPrimary === currentWeapon.id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-[#16251b] hover:bg-[#203527] text-gray-200 border-[#2b4430]'
                  }`}
                >
                  <Check size={16} />
                  <span>
                    {equippedPrimary === currentWeapon.id ? 'سلاح رئيسي مُجهز' : 'تجهيز كسلاح 1'}
                  </span>
                </button>

                <button
                  onClick={handleEquipSecondary}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                    equippedSecondary === currentWeapon.id
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-[#16251b] hover:bg-[#203527] text-gray-200 border-[#2b4430]'
                  }`}
                >
                  <Check size={16} />
                  <span>
                    {equippedSecondary === currentWeapon.id ? 'سلاح ثانوي مُجهز' : 'تجهيز كسلاح 2'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* 4. WEAPONS LIST GRID CARDS */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-gray-300">
                اختر سلاحاً من الترسانة لمعاينته وتجهيزه:
              </h4>
              <span className="text-[10px] text-gray-400">8 أسلحة متوفرة</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-h-[140px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={weaponCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="col-span-full grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                >
                  {filteredWeapons.map((w, idx) => {
                    const isSelected = w.id === selectedWeaponId;
                    const isPrim = w.id === equippedPrimary;
                    const isSec = w.id === equippedSecondary;
                    const wTier = getWeaponRarityTier(w);
                    const wTheme = WEAPON_RARITY_THEMES[wTier];

                    return (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          soundManager.playButtonClick();
                          haptics.light();
                          setSelectedWeaponId(w.id);
                        }}
                        onMouseEnter={() => {
                          setHoveredWeaponId(w.id);
                          setHoveredWeaponTier(wTier);
                        }}
                        onMouseLeave={() => {
                          setHoveredWeaponId(null);
                          setHoveredWeaponTier(null);
                        }}
                        className={`p-3 rounded-2xl border text-right cursor-pointer transition-all flex flex-col justify-between select-none relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#1a291f] ring-2 ring-white/20'
                            : 'bg-[#121c15] hover:bg-[#16251c]'
                        }`}
                        style={{
                          borderColor: isSelected ? wTheme.accentHex : `${wTheme.accentHex}44`,
                          boxShadow: isSelected
                            ? `0 0 20px ${wTheme.accentHex}40`
                            : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded border"
                            style={{
                              backgroundColor: `${wTheme.accentHex}20`,
                              borderColor: `${wTheme.accentHex}60`,
                              color: wTheme.accentHex,
                            }}
                          >
                            {wTheme.arabicLabel}
                          </span>
                          {(isPrim || isSec) && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                isPrim ? 'bg-amber-500 text-black' : 'bg-cyan-400 text-black'
                              }`}
                            >
                              {isPrim ? 'سلاح 1' : 'سلاح 2'}
                            </span>
                          )}
                        </div>

                        <div className="my-2 h-16 flex items-center justify-center bg-[#070e0a] rounded-xl border border-white/10 overflow-hidden p-1.5 relative group">
                          {/* Glow behind weapon sprite */}
                          <WeaponGlowBackdrop tier={wTier} size="sm" intensity="high" />

                          <div className="relative z-10">
                            <WeaponSpriteSVG
                              weapon={w.id}
                              skinId={settings.weaponSkins?.[w.id]}
                              lightingMode={settings.armoryLightingMode || 'pbr'}
                              environmentId={settings.armoryEnvironment || 'training_range'}
                              className="w-16 h-10 transition-transform group-hover:scale-110 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]"
                            />
                          </div>
                        </div>

                        <div>
                          <h5 className="text-xs font-black text-white truncate">{w.name}</h5>
                          <span className="text-[10px] text-gray-400 block truncate">{w.nameEn}</span>
                        </div>

                        <div className="mt-2 pt-1 border-t border-[#1d2d20] flex items-center justify-between text-[10px]">
                          <span className="text-red-400 font-bold">ضرر: {w.damage}</span>
                          <span className="text-cyan-400 font-bold">مدى: {w.range}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </>
      )}

      {/* TAB: ARMOR */}
      {activeTab === 'armor' && <ArmorWorkshop />}

      {/* TAB: THROWABLES */}
      {activeTab === 'throwables' && <ThrowablesBay />}

      {/* TAB: JETPACK */}
      {activeTab === 'jetpack' && <JetpackBay />}

      {/* Floating Tactical Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-amber-300"
          >
            {toastMessage.icon === 'upgrade' ? (
              <TrendingUp size={16} className="text-black" />
            ) : (
              <CheckCircle2 size={16} className="text-black" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

        {/* WEAPON UPGRADE ANIMATED CUTSCENE MODAL */}
        <AnimatedCrateCutsceneModal
          isOpen={showCutsceneModal}
          itemPayload={upgradedCutscenePayload}
          onClose={() => {
            setShowCutsceneModal(false);
            setUpgradedCutscenePayload(null);
          }}
          onClaim={() => {
            setShowCutsceneModal(false);
          }}
        />
      </motion.div>
    </WeaponEnvironmentBackdrop>
  );
}
