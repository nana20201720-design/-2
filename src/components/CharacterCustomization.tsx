import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Flame,
  Crosshair,
  Sparkles,
  Check,
  CheckCircle2,
  Crown,
  Eye,
  Award,
  Layers,
  Shirt,
  Smile,
  RefreshCw,
  Star,
  Activity,
  Rocket,
  BatteryCharging,
  TrendingUp,
  Coins,
  ChevronUp,
  ShieldAlert,
  X,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { settingsManager } from '../utils/settingsManager';
import { haptics } from '../utils/haptics';
import { LiveSoldierCanvas } from './LiveSoldierCanvas';
import { GLTFSoldierPreview } from './GLTFSoldierPreview';
import { EnvironmentSwitcher } from './EnvironmentSwitcher';
import { TacticalGearIcon } from './TacticalGearIcon';
import {
  soldierProgressionManager,
  SKILL_DEFINITIONS,
  SKILL_UPGRADE_COSTS,
  SkillDefinition,
} from '../utils/soldierProgressionManager';
import { SoldierProgression, SoldierSkills } from '../types';
import {
  PreviewEnvironmentType,
  PREVIEW_ENVIRONMENTS,
} from '../game/threeEnvironments';

type CustomTab = 'skills' | 'headgear' | 'armor' | 'cape' | 'camo' | 'face' | 'jetpack' | 'trails' | 'environment' | 'gltf';

interface EquipmentOption {
  id: string;
  name: string;
  nameEn: string;
  rarity: string;
  rarityColor: string;
  perk: string;
  icon: string;
  unlocked: boolean;
  cost?: string;
  camoHex?: string;
}

const CAPE_OPTIONS: EquipmentOption[] = [
  {
    id: 'full_set',
    name: 'عتاد الكوماندوز المكتمل + قلادة الهوية (Full Tactical Set)',
    nameEn: 'Full Cape, Scarf & Dog Tags',
    rarity: 'خرافي ★★★★★',
    rarityColor: 'text-amber-300 border-amber-400',
    perk: 'عباءة تكتيكية + وشاح حركي + قلادة الهوية الميدانية بتأثيرات حركة واقعية',
    icon: '🧣🪖',
    unlocked: true,
  },
  {
    id: 'tactical_cape',
    name: 'عباءة القوات الخاصة الديناميكية (Dynamic Tactical Cape)',
    nameEn: 'Special Ops Tactical Cape',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'انسيابية فيزياء القماش عند تدوير المحارب في الـ 3D',
    icon: '🦸‍♂️',
    unlocked: true,
  },
  {
    id: 'commando_scarf',
    name: 'وشاح الكوماندوز الأحمر الثوري (Red Commando Scarf)',
    nameEn: 'Red Commando Scarf',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-red-400 border-red-500',
    perk: 'رفرفة ديناميكية خفيفة مع الحركة والدوران',
    icon: '🧣',
    unlocked: true,
  },
  {
    id: 'none',
    name: 'بدون عباءة (No Cape)',
    nameEn: 'No Cape',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-gray-400 border-gray-500',
    perk: 'مظهر القتال المباشر بدون إكسسوارات إضافية',
    icon: '🚫',
    unlocked: true,
  },
];

const HEADGEARS: EquipmentOption[] = [
  {
    id: 'camo_helmet',
    name: 'خوذة الكوماندوز الميدانية',
    nameEn: 'Camo Combat Helmet',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: '+10% حماية من ضربات الرأس',
    icon: '🪖',
    unlocked: true,
  },
  {
    id: 'cyber_samurai',
    name: 'خوذة الساموراي السيبرانية المضيئة',
    nameEn: 'Cyber Samurai Horned Helmet',
    rarity: 'خرافي ★★★★★',
    rarityColor: 'text-rose-400 border-rose-500',
    perk: '+20% حماية من ضربات الرأس واندفاع نيون خاطف',
    icon: '👺',
    unlocked: true,
  },
  {
    id: 'golden_crown',
    name: 'التاج الذهبي للملياردير العسكري',
    nameEn: 'Militia Billionaire Golden Crown',
    rarity: 'خرافي ★★★★★',
    rarityColor: 'text-yellow-300 border-yellow-400',
    perk: '+15% قطع نقدية إضافية عند قتل الأعداء',
    icon: '👑',
    unlocked: true,
  },
  {
    id: 'captain_hat',
    name: 'قبعة القبطان الحربية الكلاسيكية',
    nameEn: 'Classic War Captain Hat',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-indigo-400 border-indigo-500',
    perk: '+10% معنويات قتالية وسرعة تجديد وقود النفاثة',
    icon: '👨‍✈️',
    unlocked: true,
  },
  {
    id: 'nvg_helmet',
    name: 'خوذة الرؤية الليلية NVG',
    nameEn: 'Night Vision Tactical Helmet',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'كشف الأعداء المخفيين في الظلام والكهوف',
    icon: '🥽',
    unlocked: true,
  },
  {
    id: 'beret_green',
    name: 'قبعة البيريه الأخضر للصاعقة',
    nameEn: 'Special Forces Green Beret',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: '+8% سرعة ركض ومناورة',
    icon: '🎖️',
    unlocked: true,
  },
  {
    id: 'beret_red',
    name: 'قبعة الكوماندوز الحمراء',
    nameEn: 'Red Commando Beret',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-red-400 border-red-500',
    perk: '+12% سرعة تبديل الأسلحة',
    icon: '🔴',
    unlocked: true,
  },
  {
    id: 'pilot_helmet',
    name: 'خوذة الطيار النفاث',
    nameEn: 'Stealth Jet Pilot Helmet',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-blue-400 border-blue-500',
    perk: '+15% كفاءة استهلاك وقود النفاثة',
    icon: '🧑‍✈️',
    unlocked: true,
  },
  {
    id: 'gas_mask',
    name: 'قناع الغاز والكيماوي الواقي',
    nameEn: 'Biohazard Gas Mask',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-amber-400 border-amber-500',
    perk: 'مناعة 100% ضد قنابل الغاز والدخان',
    icon: '☣️',
    unlocked: true,
  },
  {
    id: 'bandana',
    name: 'عصبة الرأس القتالية (رامبو)',
    nameEn: 'Combat Commando Bandana',
    rarity: 'نادر ★★★',
    rarityColor: 'text-yellow-400 border-yellow-500',
    perk: '+10% ثبات تصويب عند إطلاق النار المستمر',
    icon: '🎗️',
    unlocked: true,
  },
  {
    id: 'skull_mask',
    name: 'قناع شبح الجمجمة التكتيكي',
    nameEn: 'Ghost Skull Mask',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-purple-400 border-purple-500',
    perk: 'تخويف الخصوم وتقليل ارتداد القناصة',
    icon: '💀',
    unlocked: true,
  },
  {
    id: 'ninja_mask',
    name: 'قناع نينجا الظل',
    nameEn: 'Shadow Ninja Hood',
    rarity: 'خاص ★★★★★',
    rarityColor: 'text-gray-300 border-gray-400',
    perk: 'حركة صامتة واندفاع سريع',
    icon: '🥷',
    unlocked: false,
    cost: 'مستوى 30',
  },
];

const BODY_ARMORS: EquipmentOption[] = [
  {
    id: 'molle_vest',
    name: 'سترة الكيفلار التكتيكية (MOLLE)',
    nameEn: 'Tactical MOLLE Vest',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: 'حمل ذخيرة إضافية وامتصاص الرصاص',
    icon: '🦺',
    unlocked: true,
  },
  {
    id: 'juggernaut',
    name: 'درع الجغرنوت الفولاذي الثقيل',
    nameEn: 'Heavy Juggernaut Plated Armor',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-amber-400 border-amber-500',
    perk: '+35% صد للشظايا والانفجارات القريبة',
    icon: '🛡️',
    unlocked: true,
  },
  {
    id: 'chest_harness',
    name: 'حزام وخراطيش العيار الثقيل .50',
    nameEn: 'Heavy Ammo Bandolier & Harness',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-yellow-400 border-yellow-500',
    perk: '+20% سرعة تلقيم للبنادق والرشاشات',
    icon: '⚔️',
    unlocked: true,
  },
  {
    id: 'cyber_rig',
    name: 'درع الهيكل السيبراني الخارق',
    nameEn: 'Cyber Exoskeleton Battle Rig',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'تجديد درع سريع بنسبة 15%',
    icon: '🤖',
    unlocked: true,
  },
  {
    id: 'hazmat_suit',
    name: 'بذلة الحماية من الإشعاع والمواد الخطرة',
    nameEn: 'Hazmat Bio-Suit',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: 'مقاومة براميل المتفجرات والمواد السامة',
    icon: '🧪',
    unlocked: true,
  },
];

const CAMO_PATTERNS: EquipmentOption[] = [
  {
    id: 'woodland_camo',
    name: 'التمويه الغابي العسكري (Woodland)',
    nameEn: 'Military Woodland Olive',
    rarity: 'كلاسيكي ★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: 'التخفي المثالي بين أشجار وأعشاب المعركة',
    icon: '🌲',
    camoHex: '#2d4a22',
    unlocked: true,
  },
  {
    id: 'desert_camo',
    name: 'التمويه الصحراوي التكتيكي (Desert Tan)',
    nameEn: 'Desert Tan Camo',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-amber-400 border-amber-500',
    perk: 'اندماج كامل مع صخور وجبال الحلبة',
    icon: '🏜️',
    camoHex: '#9a7b4f',
    unlocked: true,
  },
  {
    id: 'urban_digital',
    name: 'التمويه الحضري الرقمي (Urban Grey)',
    nameEn: 'Urban Digital Ops',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-gray-300 border-gray-400',
    perk: 'تمويه داخل المنشآت والمستودعات الحديدية',
    icon: '🏢',
    camoHex: '#374151',
    unlocked: true,
  },
  {
    id: 'stealth_black',
    name: 'تمويه العمليات الليلية الأسود (Black Ops)',
    nameEn: 'Stealth Black Ops',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-purple-400 border-purple-500',
    perk: 'صعوبة الرؤية في الكهوف والممرات المظلمة',
    icon: '🌑',
    camoHex: '#111827',
    unlocked: true,
  },
  {
    id: 'navy_seal',
    name: 'تمويه القوات البحرية الأزرق (Navy Seal)',
    nameEn: 'Navy Seal Blue',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-blue-400 border-blue-500',
    perk: '+5% سرعة حركة',
    icon: '🌊',
    camoHex: '#1e3a8a',
    unlocked: true,
  },
  {
    id: 'cyber_cyan',
    name: 'درع التيتانيوم السيبراني المضيء',
    nameEn: 'Cyber Cyan Armor',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'هالة تكنولوجية متقدمة',
    icon: '💠',
    camoHex: '#0891b2',
    unlocked: true,
  },
  {
    id: 'royal_gold',
    name: 'الدرع الذهبي الملكي الخالص',
    nameEn: 'Royal Golden Plating',
    rarity: 'خرافي ★★★★★',
    rarityColor: 'text-yellow-300 border-yellow-400',
    perk: 'مظهر القائد الأسطوري المهيب',
    icon: '👑',
    camoHex: '#ca8a04',
    unlocked: false,
    cost: '200 💎',
  },
  {
    id: 'pharaoh_suit',
    name: 'بدلة الفرعون الملكية الخرافية (Pharaoh X-Suit)',
    nameEn: 'Royal Pharaoh X-Suit',
    rarity: 'خرافي 👑 ★★★★★',
    rarityColor: 'text-amber-400 border-amber-500 animate-pulse',
    perk: 'مظهر الإله الذهبي الفرعوني بتأثيرات البلازما الغامضة',
    icon: '👑',
    camoHex: '#eab308',
    unlocked: false,
    cost: 'صندوق الغنائم 📦',
  },
  {
    id: 'tesla_suit',
    name: 'درع تسلا السيبراني المستقبلي (Tesla Cyber-Armor)',
    nameEn: 'Tesla Exo Cyber-Armor',
    rarity: 'أسطوري ⚡ ★★★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'درع معدني مشحون بومضات البرق والكهرباء الزرقاء',
    icon: '🤖',
    camoHex: '#0ea5e9',
    unlocked: false,
    cost: 'صندوق الغنائم 📦',
  },
  {
    id: 'ninja_suit',
    name: 'بدلة نينجا العمليات الخاصة (Shadow Ninja)',
    nameEn: 'Shadow Ninja Combat Suit',
    rarity: 'أسطوري 🥷 ★★★★★',
    rarityColor: 'text-gray-300 border-gray-400',
    perk: 'زي ممتص للضوء بالكامل للتسلل والاغتيال في العتمة',
    icon: '🥷',
    camoHex: '#09090b',
    unlocked: false,
    cost: 'صندوق الغنائم 📦',
  },
  {
    id: 'joker_suit',
    name: 'بدلة الجوكر المهرج المرعب (Sinister Joker)',
    nameEn: 'Sinister Joker Clown Suit',
    rarity: 'ملحمي 🤡 ★★★★',
    rarityColor: 'text-purple-400 border-purple-500',
    perk: 'هيبة مرعبة ومظهر ساخر يربك الأعداء في ساحة القتال',
    icon: '🤡',
    camoHex: '#701a75',
    unlocked: false,
    cost: 'صندوق الغنائم 📦',
  },
  {
    id: 'ghillie_suit',
    name: 'بدلة التمويه العشبي العسكري الكامل (Ghillie Suit)',
    nameEn: 'Tactical Ghillie Suit',
    rarity: 'نادر 🌿 ★★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: 'التلاشي والتمويه العشبي المطلق للقناصة المحترفين',
    icon: '🌿',
    camoHex: '#14532d',
    unlocked: false,
    cost: 'صندوق الغنائم 📦',
  },
];

const FACE_ACCESSORIES: EquipmentOption[] = [
  {
    id: 'aviators_stubble',
    name: 'نظارات طيارين + لحية خفيفة',
    nameEn: 'Aviators & Commando Stubble',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'المظهر الكلاسيكي الأصلي لأبطال الكوماندوز',
    icon: '🕶️',
    unlocked: true,
  },
  {
    id: 'full_beard',
    name: 'لحية كوماندوز كاملة مهيبة',
    nameEn: 'Full Veteran Beard',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-amber-400 border-amber-500',
    perk: 'مظهر المحارب المخضرم',
    icon: '🧔',
    unlocked: true,
  },
  {
    id: 'cigar_badass',
    name: 'سيجار المعركة المشتعل بالدخان',
    nameEn: 'Smoking Combat Cigar',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-red-400 border-red-500',
    perk: 'دخان يتصاعد أثناء القتال مع هيبة طاغية',
    icon: '🚬',
    unlocked: true,
  },
  {
    id: 'goggles_only',
    name: 'نظارات باليستية واقية',
    nameEn: 'Ballistic Combat Goggles',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-blue-400 border-blue-500',
    perk: 'حماية العينين من الغبار والرذاذ',
    icon: '🥽',
    unlocked: true,
  },
  {
    id: 'clean_face',
    name: 'وجه صافٍ عسكري رسمي',
    nameEn: 'Clean Shaven Recruit',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-gray-400 border-gray-500',
    perk: 'مظهر الانضباط التكتيكي الميداني',
    icon: '🙂',
    unlocked: true,
  },
];

const JETPACK_ENGINES: EquipmentOption[] = [
  {
    id: 'military_dual',
    name: 'التوربين المزدوج العسكري (Dual Turbine)',
    nameEn: 'Heavy Military Jetpack',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: 'توازن واستقرار فائق أثناء المناورات الجوية',
    icon: '🚀',
    unlocked: true,
  },
  {
    id: 'cyber_plasma',
    name: 'نفاثة البلازما السيبرانية (Cyber Plasma)',
    nameEn: 'Cyber Plasma Jets',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: '+15% سرعة ارتفاع واستهلاك وقود أقل',
    icon: '⚡',
    unlocked: true,
  },
  {
    id: 'toxic_jets',
    name: 'نفاثة الغاز السام (Biohazard Jets)',
    nameEn: 'Toxic Bio Jets',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-green-400 border-green-500',
    perk: 'انبعاث غاز أخضر يربك الخصوم من خلفك',
    icon: '☣️',
    unlocked: true,
  },
  {
    id: 'golden_falcon',
    name: 'نفاثة الصقر الذهبي الملكي (Golden Falcon)',
    nameEn: 'Golden Falcon Winged Jets',
    rarity: 'خرافي ★★★★★',
    rarityColor: 'text-yellow-400 border-yellow-500',
    perk: 'أجنحة ذهبية مع شرارات شمسية مبهرة',
    icon: '🦅',
    unlocked: false,
    cost: '150 💎',
  },
];

const NITRO_TRAILS: EquipmentOption[] = [
  {
    id: 'neon_purple',
    name: 'لهب البنفسج النيوني (Neon Pulse)',
    nameEn: 'Neon Purple Flames',
    rarity: 'ملحمي ★★★★',
    rarityColor: 'text-purple-400 border-purple-500',
    perk: '+18% اندفاع وتسارع نفاث',
    icon: '💜🔥',
    camoHex: '#a855f7',
    unlocked: true,
  },
  {
    id: 'toxic_acid',
    name: 'الغاز الأخضر السام (Toxic Acid)',
    nameEn: 'Acid Green Vapor',
    rarity: 'نادر ★★★★',
    rarityColor: 'text-emerald-400 border-emerald-500',
    perk: '+15% دوام زمن الطيران',
    icon: '💚🔥',
    camoHex: '#10b981',
    unlocked: true,
  },
  {
    id: 'inferno',
    name: 'اللهب البركاني المتفجر (Inferno Fire)',
    nameEn: 'Volcanic Inferno Flames',
    rarity: 'أسطوري ★★★★★',
    rarityColor: 'text-orange-400 border-orange-500',
    perk: 'لهب ناري ساطع وصوت محرك هادر',
    icon: '🔥🌋',
    camoHex: '#ef4444',
    unlocked: true,
  },
  {
    id: 'arc_plasma',
    name: 'البرق التكتيكي الأزرق (Plasma Arc)',
    nameEn: 'Blue Plasma Arc',
    rarity: 'أساسي ★★★',
    rarityColor: 'text-cyan-400 border-cyan-500',
    perk: 'اللهب الكلاسيكي الأصلي المعتمد',
    icon: '⚡🔵',
    camoHex: '#0284c7',
    unlocked: true,
  },
  {
    id: 'gold_sunfire',
    name: 'الشعاع الذهبي الملكي (Sunfire Gold)',
    nameEn: 'Royal Sunfire Trail',
    rarity: 'خرافي ★★★★★',
    rarityColor: 'text-yellow-400 border-yellow-500',
    perk: 'هالة شمسية ساطعة تسحر ساحة المعركة',
    icon: '👑✨',
    camoHex: '#eab308',
    unlocked: false,
    cost: '100 💎',
  },
];

export default function CharacterCustomization({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<CustomTab>('skills');

  // Soldier Progression & XP State
  const [progression, setProgression] = useState<SoldierProgression>(() => soldierProgressionManager.getProgression());
  const [coins, setCoins] = useState(() => settingsManager.getSettings().coins || 0);
  const [levelUpToast, setLevelUpToast] = useState<{ level: number; rankTitle: string } | null>(null);

  useEffect(() => {
    const unsub = soldierProgressionManager.subscribe((p) => {
      setProgression(p);
    });

    const handleLevelUp = (e: any) => {
      soundManager.playVictory();
      haptics.heavy();
      setLevelUpToast({
        level: e.detail.level,
        rankTitle: e.detail.rankTitleAr,
      });
      setTimeout(() => setLevelUpToast(null), 4000);
    };

    const handleSettingsUpdated = () => {
      setCoins(settingsManager.getSettings().coins || 0);
    };

    window.addEventListener('soldier-level-up', handleLevelUp);
    window.addEventListener('tactical-settings-updated', handleSettingsUpdated);

    return () => {
      unsub();
      window.removeEventListener('soldier-level-up', handleLevelUp);
      window.removeEventListener('tactical-settings-updated', handleSettingsUpdated);
    };
  }, []);

  // Load active customization from SettingsManager
  const [camoColor, setCamoColor] = useState<string>(() => {
    const s = settingsManager.getSettings();
    const c = CAMO_PATTERNS.find((p) => p.id === s.equippedSkin);
    return c?.camoHex || '#2d4a22';
  });
  const [equippedSkinId, setEquippedSkinId] = useState(() => settingsManager.getSettings().equippedSkin || 'woodland_camo');
  const [equippedHeadgear, setEquippedHeadgear] = useState(() => settingsManager.getSettings().equippedHeadgear || 'camo_helmet');
  const [equippedArmor, setEquippedArmor] = useState(() => settingsManager.getSettings().equippedArmor || 'molle_vest');
  const [equippedEyewear, setEquippedEyewear] = useState(() => settingsManager.getSettings().equippedEyewear || 'aviators');
  const [equippedBeard, setEquippedBeard] = useState(() => settingsManager.getSettings().equippedBeard || 'stubble');
  const [equippedJetpack, setEquippedJetpack] = useState(() => settingsManager.getSettings().equippedJetpack || 'military_dual');
  const [equippedTrail, setEquippedTrail] = useState(() => settingsManager.getSettings().equippedTrail || 'neon_purple');
  const [equippedPrimary, setEquippedPrimary] = useState(() => settingsManager.getSettings().equippedPrimaryWeapon || 'sniper');
  const [equippedCape, setEquippedCape] = useState<'none' | 'tactical_cape' | 'commando_scarf' | 'full_set'>('full_set');
  const [enablePhysics, setEnablePhysics] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'3d' | '2d'>('2d');
  const [selectedEnv, setSelectedEnv] = useState<PreviewEnvironmentType>(
    () => settingsManager.getSettings().previewEnvironment || 'training_grounds'
  );

  const [gltfModelUrl, setGltfModelUrl] = useState<string>(() => settingsManager.getSettings().gltfModelUrl || '');
  const [gltfUrlInput, setGltfUrlInput] = useState<string>(() => settingsManager.getSettings().gltfModelUrl || '');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleUpgradeSkill = (skillId: keyof SoldierSkills) => {
    soundManager.playButtonClick();
    haptics.medium();
    const result = soldierProgressionManager.upgradeSkill(skillId);
    if (result.success) {
      soundManager.playVictory();
      haptics.heavy();
      showToast(`⭐ ${result.message}`);
      setCoins(settingsManager.getSettings().coins || 0);
    } else {
      showToast(`⚠️ ${result.message}`);
    }
  };

  const handleDrillTraining = () => {
    soundManager.playRifle();
    haptics.heavy();
    soldierProgressionManager.addXP(250, 'مناورة رماية تدريبية');
    showToast('🎯 +250 XP من تمرين الرماية والمناورة الميدانية!');
  };

  // Equip Handlers
  const handleEquipHeadgear = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedHeadgear(item.id);
    settingsManager.updateSettings({ equippedHeadgear: item.id });
    showToast(`🪖 تم تجهيز: ${item.name}!`);
  };

  const handleEquipArmor = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedArmor(item.id);
    settingsManager.updateSettings({ equippedArmor: item.id });
    showToast(`🛡️ تم تجهيز الدرع: ${item.name}!`);
  };

  const handleEquipCamo = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedSkinId(item.id);
    if (item.camoHex) setCamoColor(item.camoHex);
    settingsManager.updateSettings({ equippedSkin: item.id });
    showToast(`🎨 تم ارتداء الزي والتمويه: ${item.name}!`);
  };

  const handleEquipFace = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    if (item.id === 'aviators_stubble') {
      setEquippedEyewear('aviators');
      setEquippedBeard('stubble');
      settingsManager.updateSettings({ equippedEyewear: 'aviators', equippedBeard: 'stubble' });
    } else if (item.id === 'full_beard') {
      setEquippedEyewear('aviators');
      setEquippedBeard('full_beard');
      settingsManager.updateSettings({ equippedEyewear: 'aviators', equippedBeard: 'full_beard' });
    } else if (item.id === 'cigar_badass') {
      setEquippedEyewear('aviators');
      setEquippedBeard('cigar');
      settingsManager.updateSettings({ equippedEyewear: 'aviators', equippedBeard: 'cigar' });
    } else if (item.id === 'goggles_only') {
      setEquippedEyewear('ballistic_goggles');
      setEquippedBeard('clean');
      settingsManager.updateSettings({ equippedEyewear: 'ballistic_goggles', equippedBeard: 'clean' });
    } else {
      setEquippedEyewear('none');
      setEquippedBeard('clean');
      settingsManager.updateSettings({ equippedEyewear: 'none', equippedBeard: 'clean' });
    }
    showToast(`🕶️ تم تجهيز ملامح وإكسسوارات: ${item.name}!`);
  };

  const handleEquipJetpack = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedJetpack(item.id);
    settingsManager.updateSettings({ equippedJetpack: item.id });
    showToast(`🚀 تم تجهيز نفاثة: ${item.name}!`);
  };

  const handleEquipTrail = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedTrail(item.id);
    settingsManager.updateSettings({ equippedTrail: item.id });
    showToast(`🔥 تم تجهيز تأثير لهب النفاثة: ${item.name}!`);
  };

  const handleEquipCape = (item: EquipmentOption) => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    setEquippedCape(item.id as any);
    showToast(`🧣 تم تجهيز عتاد القماش والعباءة: ${item.name}!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 pb-28 pt-1 select-none max-w-4xl mx-auto w-full"
    >
      {/* 1. TACTICAL SOLDIER CUSTOMIZATION PREVIEW SHOWCASE FRAME (إطار معاينة التجهيزات التكتيكية) */}
      <section className="relative w-full rounded-3xl bg-gradient-to-b from-[#18291c] via-[#0f1d13] to-[#070e08] border-4 border-amber-500/60 p-3 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col items-center overflow-hidden">
        {/* Tactical Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

        {/* Top Header & Status Bar */}
        <div className="w-full flex items-center justify-between mb-3 border-b border-amber-500/30 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/60 px-3 py-1 rounded-full text-xs font-black shadow-md">
              <Sparkles size={13} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              🎯 معاينة المحارب التكتيكي ثلاثي الأبعاد (3D GLTF SOLDIER)
            </span>

            {/* 3D / 2D View Switcher Pill */}
            <div className="flex items-center bg-black/80 rounded-xl p-0.5 border border-white/10 shadow-inner">
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setPreviewMode('3d');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  previewMode === '3d'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>3D مجسم</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setPreviewMode('2d');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  previewMode === '2d'
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>2D رسم</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onClose();
                }}
                className="bg-red-600/80 hover:bg-red-500 text-white p-1.5 rounded-xl border border-red-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-lg"
                title="إغلاق التخصيص والعودة للوبي"
              >
                <X size={16} />
              </button>
            )}
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black bg-black/80 px-3 py-1 rounded-xl border border-amber-500/50 shadow-inner">
              <span className="text-base">{progression.rankIcon}</span>
              <span>{progression.rankTitleAr}</span>
              <span className="bg-amber-500 text-black text-[10px] px-1.5 py-0.2 rounded-md font-extrabold">
                LVL {progression.level}
              </span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-black bg-black/70 px-2.5 py-1 rounded-xl border border-yellow-500/40">
              <Coins size={13} className="text-yellow-400" />
              <span>{coins.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Live Interactive 3D GLTF / 2D Canvas Studio Frame */}
        <div className="w-full relative flex flex-col items-center">
          {previewMode === '3d' ? (
            <GLTFSoldierPreview
              camoColor={camoColor}
              headgear={equippedHeadgear}
              bodyArmor={equippedArmor}
              eyewear={equippedEyewear}
              beard={equippedBeard}
              jetpackStyle={equippedJetpack}
              trailColor={equippedTrail}
              weapon={equippedPrimary}
              capeStyle={equippedCape}
              enableClothingPhysics={enablePhysics}
              environment={selectedEnv}
              onEnvironmentChange={(env) => setSelectedEnv(env)}
              gltfModelUrl={gltfModelUrl}
              height={360}
              interactive={true}
              showPedestal={true}
              autoRotateDefault={true}
              onActionToast={showToast}
            />
          ) : (
            <LiveSoldierCanvas
              skinId={equippedSkinId}
              camoColor={camoColor}
              headgear={equippedHeadgear}
              bodyArmor={equippedArmor}
              eyewear={equippedEyewear}
              beard={equippedBeard}
              jetpackStyle={equippedJetpack}
              trailColor={equippedTrail}
              weapon={equippedPrimary}
              onActionToast={showToast}
            />
          )}

          {/* Dynamic Clothing Physics Quick Control Badge */}
          {previewMode === '3d' && (
            <div className="mt-2 w-full flex items-center justify-between bg-black/80 border border-emerald-500/40 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-300 shadow-md flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-emerald-400 animate-pulse" />
                <span>فيزياء القماش والعباءة (Cloth Motion Simulation):</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">تجاوب مع دوران الـ 3D:</span>
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setEnablePhysics(!enablePhysics);
                    showToast(
                      !enablePhysics
                        ? '⚡ تم تفعيل فيزياء حركة الملابس والعباءة عند الدوران!'
                        : '⏸️ تم إيقاف محاكي فيزياء القماش'
                    );
                  }}
                  className={`px-3 py-1 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    enablePhysics
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-gray-800 text-gray-400 border border-gray-600'
                  }`}
                >
                  <span>{enablePhysics ? 'مُفعّل ⚡' : 'معطّل ⏸️'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time XP Progress Bar under canvas */}
        <div className="w-full bg-[#08100a] p-2.5 rounded-2xl border border-emerald-500/30 mt-3 flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-amber-400 flex items-center gap-1">
              <TrendingUp size={13} />
              الخبرة القتالية (XP Progression): {progression.xp} / {progression.xpToNextLevel} XP
            </span>
            <span className="text-emerald-400 font-mono">
              {Math.min(100, Math.round((progression.xp / Math.max(1, progression.xpToNextLevel)) * 100))}%
            </span>
          </div>
          <div className="w-full h-3 bg-black/90 rounded-full overflow-hidden border border-amber-500/30 relative p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full shadow-[0_0_14px_rgba(234,179,8,0.6)]"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (progression.xp / Math.max(1, progression.xpToNextLevel)) * 100)}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Active Loadout Detailed Showcase Badges */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-amber-500/30 text-[11px]">
          <div className="bg-[#0a140c] p-2.5 rounded-xl border border-emerald-500/40 text-right shadow-md">
            <span className="text-gray-400 block text-[10px] font-bold">🪖 الخوذة والمظهر:</span>
            <strong className="text-amber-300 truncate block font-extrabold mt-0.5">
              {HEADGEARS.find((h) => h.id === equippedHeadgear)?.name || 'الخوذة الميدانية'}
            </strong>
          </div>

          <div className="bg-[#0a140c] p-2.5 rounded-xl border border-emerald-500/40 text-right shadow-md">
            <span className="text-gray-400 block text-[10px] font-bold">🛡️ السترة والدرع:</span>
            <strong className="text-cyan-300 truncate block font-extrabold mt-0.5">
              {BODY_ARMORS.find((b) => b.id === equippedArmor)?.name || 'سترة الكيفلار'}
            </strong>
          </div>

          <div className="bg-[#0a140c] p-2.5 rounded-xl border border-emerald-500/40 text-right shadow-md">
            <span className="text-gray-400 block text-[10px] font-bold">🎨 الزي والتمويه:</span>
            <strong className="text-emerald-300 truncate block font-extrabold mt-0.5">
              {CAMO_PATTERNS.find((c) => c.id === equippedSkinId)?.name || 'تمويه عسكري'}
            </strong>
          </div>

          <div className="bg-[#0a140c] p-2.5 rounded-xl border border-emerald-500/40 text-right shadow-md">
            <span className="text-gray-400 block text-[10px] font-bold">🚀 النفاثة والشعلة:</span>
            <strong className="text-purple-300 truncate block font-extrabold mt-0.5">
              {JETPACK_ENGINES.find((j) => j.id === equippedJetpack)?.name || 'نفاثة عسكرية'}
            </strong>
          </div>
        </div>
      </section>

      {/* 2. DRESSING ROOM CATEGORY TABS (TABS BAR) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('skills');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
              : 'bg-[#1a251c] text-amber-300 hover:text-white border border-amber-500/40'
          }`}
        >
          <Star size={14} className={activeTab === 'skills' ? 'fill-black' : 'fill-amber-400 text-amber-400'} />
          <span>المهارات والترقيات (XP)</span>
          {progression.skillPoints > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
              {progression.skillPoints}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('headgear');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'headgear'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <span>🪖</span>
          <span>الخوذات والقبعات</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('armor');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'armor'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Shield size={14} />
          <span>السترات والدروع</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('cape');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'cape'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Activity size={14} />
          <span>العباءات وفيزياء الحركة</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('camo');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'camo'
              ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-black shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Shirt size={14} />
          <span>الأزياء والتمويه</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('face');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'face'
              ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Smile size={14} />
          <span>الملامح والنظارات واللحية</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('jetpack');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'jetpack'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Zap size={14} />
          <span>محركات النفاثة</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('trails');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'trails'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <Flame size={14} />
          <span>لهب النفاثة (Nitro)</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('environment');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'environment'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
              : 'bg-[#132018] text-amber-300 hover:text-white border border-[#3d321d]'
          }`}
        >
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>البيئة والاستوديو 3D</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('gltf');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gltf'
              ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-black shadow-md ring-2 ring-cyan-400'
              : 'bg-[#132018] text-cyan-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          <span>👾</span>
          <span>نموذج 3D شخصية مخصصة</span>
        </button>
      </div>

      {/* 3. EQUIPMENT & SKILLS ITEMS GRID */}
      <section className="bg-[#0c150e] border-2 border-[#223525] rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1c2c1e] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-xs sm:text-sm font-black text-white">
              {activeTab === 'skills' && 'شجرة مهارات الجندي وترقيات الأداء الميداني:'}
              {activeTab === 'headgear' && 'اختر الخوذة أو غطاء الرأس الميداني:'}
              {activeTab === 'armor' && 'اختر سترة الكيفلار أو الدرع التكتيكي:'}
              {activeTab === 'camo' && 'اختر بدلة التمويه واللون العسكري:'}
              {activeTab === 'face' && 'اختر النظارات الباليستية واللحية والسيجار:'}
              {activeTab === 'jetpack' && 'اختر طراز محرك ونفاثة الظهر:'}
              {activeTab === 'trails' && 'اختر لون وتأثير لهب النفاثة (Nitro Trail):'}
              {activeTab === 'environment' && 'اختر استوديو وبيئة المعاينة ثلاثية الأبعاد (3D Backdrop):'}
              {activeTab === 'gltf' && 'تحميل نموذج شخصية ثلاثي الأبعاد مخصص (GLTF/GLB):'}
            </h3>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold">
            {activeTab === 'skills'
              ? `نقاط المهارة المتاحة: ${progression.skillPoints} ⭐`
              : activeTab === 'environment'
              ? 'يتم تطبيق البيئة فورياً على نموذج 3D'
              : 'انقر للإلباس الفوري والتطبيق'}
          </span>
        </div>

        {/* TAB 0: SOLDIER SKILLS & XP UPGRADES */}
        {activeTab === 'skills' && (
          <div className="space-y-3.5">
            {/* Progression & Rank Summary Banner */}
            <div className="bg-gradient-to-r from-[#182a1e] via-[#132218] to-[#0c1810] border-2 border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-black/70 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 shrink-0">
                  {progression.rankIcon}
                </div>
                <div className="text-right space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-black text-amber-300">
                      {progression.rankTitleAr}
                    </h4>
                    <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                      المستوى {progression.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    النقاط المتاحة للتوزيع:{' '}
                    <strong className="text-emerald-400 font-mono text-sm">
                      {progression.skillPoints} نقطة
                    </strong>
                  </p>
                </div>
              </div>

              {/* Quick Drill & Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDrillTraining}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>مناورة تدريب (+250 XP)</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.medium();
                    const res = soldierProgressionManager.resetSkills();
                    if (res.success) {
                      soundManager.playVictory();
                      showToast(`✨ تمت استعادة ${res.refundedPoints} نقطة مهارة بنجاح!`);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-[#1a231b] hover:bg-[#253327] text-gray-400 hover:text-white font-bold text-xs border border-[#2b3d2e] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="إعادة تعيين نقاط المهارات"
                >
                  <RefreshCw size={13} />
                  <span>إعادة ضبط</span>
                </button>
              </div>
            </div>

            {/* Skills Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.values(SKILL_DEFINITIONS) as SkillDefinition[]).map((s) => {
                const currentLevel = progression.skills[s.id] || 1;
                const isMaxLevel = currentLevel >= 5;
                const nextCost = !isMaxLevel ? SKILL_UPGRADE_COSTS[currentLevel as 1 | 2 | 3 | 4] : null;
                const canAfford =
                  !isMaxLevel &&
                  nextCost &&
                  progression.skillPoints >= nextCost.skillPoints &&
                  coins >= nextCost.coins;

                // Dynamic stat value calculation
                const statBonusText = s.getPerLevelBonus(currentLevel);
                const nextBonusText = !isMaxLevel ? `المستوى ${currentLevel + 1}: ${s.getPerLevelBonus(currentLevel + 1)}` : '';

                return (
                  <div
                    key={s.id}
                    className="bg-[#121d15] border-2 border-[#233827] hover:border-[#38533d] rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md"
                  >
                    <div className="space-y-2">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-center text-xl">
                            {s.id === 'jetpackSpeed' && <Rocket size={20} className="text-cyan-400" />}
                            {s.id === 'jetpackEndurance' && <BatteryCharging size={20} className="text-emerald-400" />}
                            {s.id === 'armorResilience' && <ShieldAlert size={20} className="text-amber-400" />}
                            {s.id === 'reloadAgility' && <Zap size={20} className="text-yellow-400" />}
                          </div>
                          <div className="text-right">
                            <h4 className="text-xs sm:text-sm font-black text-white">{s.titleAr}</h4>
                            <span className="text-[10px] text-gray-400">{s.titleEn}</span>
                          </div>
                        </div>

                        {/* Stars Level Indicator */}
                        <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg border border-[#1f3022]">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <Star
                              key={lvl}
                              size={12}
                              className={`${
                                lvl <= currentLevel
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                                  : 'text-gray-600 fill-transparent'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Description & Current Bonus */}
                      <p className="text-[11px] text-gray-300 leading-relaxed text-right">
                        {s.descAr}
                      </p>

                      <div className="bg-[#09100a] p-2 rounded-xl border border-[#1c2c1e] text-right space-y-0.5">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                          <span>{statBonusText}</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700">
                            مستوى {currentLevel} / 5
                          </span>
                        </div>
                        {!isMaxLevel && (
                          <div className="text-[10px] text-amber-300/80 font-mono">
                            ⚡ {nextBonusText}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upgrade Action Button */}
                    <div className="mt-3 pt-2 border-t border-[#1c2c1e]">
                      {isMaxLevel ? (
                        <div className="w-full py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-black text-center flex items-center justify-center gap-1.5 shadow-inner">
                          <Crown size={14} className="text-amber-400" />
                          <span>تم الوصول للحد الأقصى (MAX LEVEL ⭐)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgradeSkill(s.id)}
                          className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black active:scale-95 shadow-amber-500/20'
                              : 'bg-[#18231a] text-gray-400 border border-[#273d2b] hover:bg-[#1e2d21]'
                          }`}
                        >
                          <ChevronUp size={15} className={canAfford ? 'text-black' : 'text-amber-400'} />
                          <span>
                            ترقية للمستوى {currentLevel + 1} ({nextCost?.skillPoints} ⭐ + {nextCost?.coins.toLocaleString()} 🪙)
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: HEADGEAR */}
        {activeTab === 'headgear' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HEADGEARS.map((h) => {
              const isEquipped = equippedHeadgear === h.id;
              const isUnlocked = h.unlocked || (settingsManager.getSettings().unlockedHeadgears || []).includes(h.id);
              return (
                <div
                  key={h.id}
                  onClick={() => isUnlocked && handleEquipHeadgear(h)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-cyan-400 bg-[#14282c] shadow-lg shadow-cyan-500/20'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${h.rarityColor}`}>
                      {h.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-cyan-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check size={10} /> مجهز
                      </span>
                    )}
                  </div>

                  <div className="h-16 bg-[#070e0a] rounded-xl flex items-center justify-center border border-[#1b2b1e] my-1 p-1">
                    <TacticalGearIcon id={h.id} type="headgear" className="w-12 h-12 filter drop-shadow" />
                  </div>

                  <div className="text-right space-y-0.5">
                    <h4 className="text-xs font-black text-white truncate">{h.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{h.perk}</p>
                  </div>

                  <button
                    disabled={!isUnlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isUnlocked) handleEquipHeadgear(h);
                    }}
                    className={`w-full mt-2 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                        : isUnlocked
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-black active:scale-95'
                        : 'bg-[#161c17] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'مُفعل حالياً' : isUnlocked ? 'إلباس الجندي' : `مغلق (${h.cost || 'صندوق الغنائم 📦'})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: BODY ARMOR */}
        {activeTab === 'armor' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {BODY_ARMORS.map((a) => {
              const isEquipped = equippedArmor === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => a.unlocked && handleEquipArmor(a)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-amber-400 bg-[#242013] shadow-lg shadow-amber-500/20'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${a.rarityColor}`}>
                      {a.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check size={10} /> مجهز
                      </span>
                    )}
                  </div>

                  <div className="h-16 bg-[#070e0a] rounded-xl flex items-center justify-center border border-[#1b2b1e] my-1 p-1">
                    <TacticalGearIcon id={a.id} type="armor" className="w-12 h-12 filter drop-shadow" />
                  </div>

                  <div className="text-right space-y-0.5">
                    <h4 className="text-xs font-black text-white truncate">{a.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{a.perk}</p>
                  </div>

                  <button
                    disabled={!a.unlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (a.unlocked) handleEquipArmor(a);
                    }}
                    className={`w-full mt-2 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-amber-950 text-amber-300 border border-amber-600'
                        : a.unlocked
                        ? 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'
                        : 'bg-[#161c17] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'مُفعل حالياً' : a.unlocked ? 'إلباس الدرع' : `مغلق`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2.5: CAPE & DYNAMIC CLOTH PHYSICS */}
        {activeTab === 'cape' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CAPE_OPTIONS.map((c) => {
              const isEquipped = equippedCape === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleEquipCape(c)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-purple-400 bg-[#21152a] shadow-lg shadow-purple-500/25'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${c.rarityColor}`}>
                      {c.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-purple-400 text-black text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1">
                        <Check size={12} /> مجهز حالياً
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="w-14 h-14 bg-[#070e0a] rounded-2xl flex items-center justify-center border border-purple-500/30 text-2xl shadow-inner shrink-0">
                      {c.icon}
                    </div>
                    <div className="text-right space-y-1">
                      <h4 className="text-sm font-black text-white">{c.name}</h4>
                      <p className="text-xs text-purple-200/80 leading-relaxed">{c.perk}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEquipCape(c);
                    }}
                    className={`w-full mt-2 py-2 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-purple-950 text-purple-300 border border-purple-600'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95 shadow-md'
                    }`}
                  >
                    {isEquipped ? 'مُفعل مع فيزياء القماش' : 'تجهيز العتاد الديناميكي'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: CAMO PATTERNS & UNIFORMS */}
        {activeTab === 'camo' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CAMO_PATTERNS.map((c) => {
              const isEquipped = equippedSkinId === c.id;
              const isUnlocked = c.unlocked || (settingsManager.getSettings().unlockedSkins || []).includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => isUnlocked && handleEquipCamo(c)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-emerald-400 bg-[#152a1b] shadow-lg shadow-emerald-500/20'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${c.rarityColor}`}>
                      {c.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-emerald-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check size={10} /> مجهز
                      </span>
                    )}
                  </div>

                  <div className="h-16 bg-[#070e0a] rounded-xl flex items-center justify-center border border-[#1b2b1e] my-1 p-1">
                    <TacticalGearIcon id={c.id} type="camo" colorHex={c.camoHex} className="w-12 h-12 filter drop-shadow" />
                  </div>

                  <div className="text-right space-y-0.5">
                    <h4 className="text-xs font-black text-white truncate">{c.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{c.perk}</p>
                  </div>

                  <button
                    disabled={!isUnlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isUnlocked) handleEquipCamo(c);
                    }}
                    className={`w-full mt-2 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : isUnlocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-black active:scale-95'
                        : 'bg-[#161c17] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'مُفعل حالياً' : isUnlocked ? 'ارتداء الزي' : `مغلق (${c.cost || 'صندوق الغنائم 📦'})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: FACIAL FEATURES, EYEWEAR & BEARDS */}
        {activeTab === 'face' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FACE_ACCESSORIES.map((f) => {
              const isEquipped =
                (f.id === 'aviators_stubble' && equippedEyewear === 'aviators' && equippedBeard === 'stubble') ||
                (f.id === 'full_beard' && equippedBeard === 'full_beard') ||
                (f.id === 'cigar_badass' && equippedBeard === 'cigar') ||
                (f.id === 'goggles_only' && equippedEyewear === 'ballistic_goggles') ||
                (f.id === 'clean_face' && equippedEyewear === 'none' && equippedBeard === 'clean');

              return (
                <div
                  key={f.id}
                  onClick={() => f.unlocked && handleEquipFace(f)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-red-400 bg-[#2a1717] shadow-lg shadow-red-500/20'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${f.rarityColor}`}>
                      {f.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-red-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check size={10} /> مجهز
                      </span>
                    )}
                  </div>

                  <div className="h-16 bg-[#070e0a] rounded-xl flex items-center justify-center border border-[#1b2b1e] my-1 p-1">
                    <TacticalGearIcon id={f.id} type="face" className="w-12 h-12 filter drop-shadow" />
                  </div>

                  <div className="text-right space-y-0.5">
                    <h4 className="text-xs font-black text-white truncate">{f.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{f.perk}</p>
                  </div>

                  <button
                    disabled={!f.unlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (f.unlocked) handleEquipFace(f);
                    }}
                    className={`w-full mt-2 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-red-950 text-red-300 border border-red-600'
                        : f.unlocked
                        ? 'bg-red-600 hover:bg-red-500 text-white active:scale-95'
                        : 'bg-[#161c17] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'مُفعل حالياً' : f.unlocked ? 'تطبيق المظهر' : `مغلق`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: JETPACK ENGINES */}
        {activeTab === 'jetpack' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {JETPACK_ENGINES.map((j) => {
              const isEquipped = equippedJetpack === j.id;
              return (
                <div
                  key={j.id}
                  onClick={() => j.unlocked && handleEquipJetpack(j)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-blue-400 bg-[#13222e] shadow-lg shadow-blue-500/20'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${j.rarityColor}`}>
                      {j.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-blue-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check size={10} /> مجهز
                      </span>
                    )}
                  </div>

                  <div className="h-16 bg-[#070e0a] rounded-xl flex items-center justify-center border border-[#1b2b1e] my-1 p-1">
                    <TacticalGearIcon id={j.id} type="jetpack" className="w-12 h-12 filter drop-shadow" />
                  </div>

                  <div className="text-right space-y-0.5">
                    <h4 className="text-xs font-black text-white truncate">{j.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{j.perk}</p>
                  </div>

                  <button
                    disabled={!j.unlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (j.unlocked) handleEquipJetpack(j);
                    }}
                    className={`w-full mt-2 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-blue-950 text-blue-300 border border-blue-600'
                        : j.unlocked
                        ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                        : 'bg-[#161c17] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'مُفعل حالياً' : j.unlocked ? 'تركيب النفاثة' : `مغلق (${j.cost})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 6: NITRO TRAILS */}
        {activeTab === 'trails' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {NITRO_TRAILS.map((t) => {
              const isEquipped = equippedTrail === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => t.unlocked && handleEquipTrail(t)}
                  className={`bg-[#121d15] border-2 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isEquipped
                      ? 'border-purple-400 bg-[#25152c] shadow-lg shadow-purple-500/20'
                      : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251b]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${t.rarityColor}`}>
                      {t.rarity}
                    </span>
                    {isEquipped && (
                      <span className="bg-purple-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check size={10} /> مجهز
                      </span>
                    )}
                  </div>

                  <div className="h-16 bg-[#070e0a] rounded-xl flex items-center justify-center border border-[#1b2b1e] my-1 p-1">
                    <TacticalGearIcon id={t.id} type="trails" colorHex={t.camoHex} className="w-12 h-12 filter drop-shadow" />
                  </div>

                  <div className="text-right space-y-0.5">
                    <h4 className="text-xs font-black text-white truncate">{t.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{t.perk}</p>
                  </div>

                  <button
                    disabled={!t.unlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (t.unlocked) handleEquipTrail(t);
                    }}
                    className={`w-full mt-2 py-1.5 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-purple-950 text-purple-300 border border-purple-600'
                        : t.unlocked
                        ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                        : 'bg-[#161c17] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'مُفعل حالياً' : t.unlocked ? 'تجهيز اللهب' : `مغلق (${t.cost})`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 7: 3D PREVIEW ENVIRONMENTS (استوديو وبيئات المعاينة 3D) */}
        {activeTab === 'environment' && (
          <div className="space-y-4">
            <EnvironmentSwitcher
              currentEnvironment={selectedEnv}
              onSelectEnvironment={(env) => {
                setSelectedEnv(env);
                settingsManager.updateSettings({ previewEnvironment: env });
                showToast(`🗺️ تم تبديل البيئة إلى: ${PREVIEW_ENVIRONMENTS[env].nameAr}`);
              }}
              showDetails={true}
            />

            {/* Tactical Environment Specs & Features Info Box */}
            <div className="bg-gradient-to-r from-[#111e14] via-[#0c1810] to-[#070e08] border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-lg text-right space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400 animate-spin" />
                  ميزات وإضاءة البيئة النشطة ({PREVIEW_ENVIRONMENTS[selectedEnv].nameEn}):
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  {PREVIEW_ENVIRONMENTS[selectedEnv].badge}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedEnv === 'training_grounds' &&
                  '• ميادين الرماية والتدريب: إضاءة شمسية نهارية دافئة مع سواتر وأكياس رمل عسكرية، أهداف رماية خشبية، حواجز مضادة للمدرعات، وتأثيرات غبار تكتيكي متطاير.'}
                {selectedEnv === 'military_bunker' &&
                  '• المخبأ العسكري المصفح: جدران وأعمدة فولاذية مدعمة، أضواء إنذار حمراء وبرتقالية وامضة، أنابيب طاقة صناعية، منصة شبكية حديدية، وصناديق ذخيرة مصفحة.'}
                {selectedEnv === 'tech_lab' &&
                  '• المختبر التقني المتطور: حلقات هولوجرام عائمة بزاوية 360°، أعمدة بلازما كهربائية مع زجاج فيزيائي، شبكات ليزرية متوهجة، وانبعاثات طاقة كمية سماوية وبنفسجية.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 8: CUSTOM 3D GLTF MODEL (تحميل نموذج شخصية مخصص) */}
        {activeTab === 'gltf' && (
          <div className="space-y-4 text-right">
            <div className="bg-[#111e14] border border-cyan-500/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                  🕹️ التحكم بالنموذج ثلاثي الأبعاد المخصص:
                </span>
                {gltfModelUrl && (
                  <button
                    onClick={() => {
                      soundManager.playSwitchWeapon();
                      setGltfModelUrl('');
                      setGltfUrlInput('');
                      settingsManager.updateSettings({ gltfModelUrl: '' });
                      showToast('🗑️ تم إلغاء تجهيز النموذج والعودة للجندي الأساسي!');
                    }}
                    className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full hover:bg-red-500 hover:text-black font-bold transition-all cursor-pointer"
                  >
                    إلغاء التجهيز (Reset)
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                يمكنك تحميل أي نموذج شخصية ثلاثي الأبعاد بصيغة <strong>GLTF</strong> أو <strong>GLB</strong> ليلعب مكان الجندي في اللعبة ومعاينة التخصيص! أدخل رابط الـ URL المباشر للنموذج بالأسفل أو اختر من النماذج التجريبية الجاهزة فوراً.
              </p>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 block">رابط النموذج المباشر (Direct GLTF/GLB URL):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gltfUrlInput}
                    onChange={(e) => setGltfUrlInput(e.target.value)}
                    placeholder="https://example.com/character.glb"
                    className="flex-1 bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 font-mono text-left"
                    style={{ direction: 'ltr' }}
                  />
                  <button
                    onClick={() => {
                      if (!gltfUrlInput.trim()) {
                        showToast('⚠️ يرجى إدخال رابط صالح أولاً!');
                        return;
                      }
                      soundManager.playButtonClick();
                      setGltfModelUrl(gltfUrlInput);
                      settingsManager.updateSettings({ gltfModelUrl: gltfUrlInput });
                      showToast('🔄 جاري معاينة النموذج المخصص...');
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    تطبيق (Apply)
                  </button>
                </div>
              </div>

              {/* Predefined Beautiful Tactical Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 block">نماذج وهولوجرامات قتالية جاهزة للاستخدام (Ready Presets):</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb';
                      soundManager.playButtonClick();
                      setGltfUrlInput(url);
                      setGltfModelUrl(url);
                      settingsManager.updateSettings({ gltfModelUrl: url });
                      showToast('🤖 تم تطبيق الروبوت القتالي المتحرك!');
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                      gltfModelUrl === 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-black">🤖 الروبوت التعبيري (Expressive Mech)</span>
                    <span className="text-[10px] text-gray-400 font-medium">كامل مع تأثيرات وحركات تعبيرية مذهلة</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb';
                      soundManager.playButtonClick();
                      setGltfUrlInput(url);
                      setGltfModelUrl(url);
                      settingsManager.updateSettings({ gltfModelUrl: url });
                      showToast('👾 تم تطبيق سايبورغ المعركة!');
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                      gltfModelUrl === 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF-Binary/BrainStem.glb'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-black">👾 سايبورغ المعركة (Battle Cyborg)</span>
                    <span className="text-[10px] text-gray-400 font-medium">جهاز قتالي ميكانيكي هولوجرامي متطور</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb';
                      soundManager.playButtonClick();
                      setGltfUrlInput(url);
                      setGltfModelUrl(url);
                      settingsManager.updateSettings({ gltfModelUrl: url });
                      showToast('🦊 الثعلب القتالي السريع!');
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-1 cursor-pointer ${
                      gltfModelUrl === 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-black">🦊 الثعلب النفاث (Tactical Fox)</span>
                    <span className="text-[10px] text-gray-400 font-medium">نموذج ذو حجم مثالي مع حركات ركض ديناميكية</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1710] border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-300">
              <span className="text-lg">💡</span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold">نصائح ومعلومات الأداء والاستقرار:</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  يتم معالجة النماذج المخصصة تلقائياً عبر نظام <strong>LOD</strong> المحسن ومحركات الذخائر والمؤثرات، لحمايتها من الاختفاء أو بطء الاستجابة. لضمان أداء ثابت وتفادي أي بطء في معدل الفريمات (FPS) على الأجهزة المتوسطة والضعيفة، يفضل أن يكون حجم ملف النموذج أقل من 5 ميغابايت.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Level Up Celebratory Toast */}
      <AnimatePresence>
        {levelUpToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-2xl flex items-center gap-3 border-2 border-white pointer-events-none ring-4 ring-amber-400/50"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-amber-300 flex items-center justify-center text-xl shadow">
              🏆
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-amber-950 font-black">
                ترقية عسكرية جديدة! LEVEL UP!
              </div>
              <div className="text-sm font-black">
                بلغت المستوى {levelUpToast.level} • {levelUpToast.rankTitle} (+1 ⭐)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-black px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-emerald-300 pointer-events-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
