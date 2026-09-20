import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Check,
  CheckCircle2,
  X,
  Award,
  Crown,
  Share2,
  Eye,
  RotateCw,
  ShoppingBag,
  User,
  Flame,
  Crosshair,
  Lock,
  Cpu,
  Target
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { settingsManager } from '../utils/settingsManager';
import { Store3DPreviewModal, PreviewableStoreItem } from './Store3DPreviewModal';
import { ThreeWeaponCanvas } from './ThreeWeaponCanvas';
import { ThreeSoldierCanvas } from './ThreeSoldierCanvas';
import { ThreeCrateCanvas } from './ThreeCrateCanvas';
import { AnimatedCrateCutsceneModal, UnlockedItemPayload } from './AnimatedCrateCutsceneModal';
import { toastManager } from '../utils/toastManager';
import { WeaponSpriteSVG } from '../game/weaponSprites';
import { OperativeGraphicSVG } from './armory/OperativeGraphicSVG';
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

interface OpenedReward {
  title: string;
  crateType: 'supply' | 'elite' | 'mystery';
  coins: number;
  gems: number;
  weaponCards: string;
  perk: string;
}

export default function StoreScreen() {
  const [openedCrate, setOpenedCrate] = useState<OpenedReward | null>(null);
  const [cutscenePayload, setCutscenePayload] = useState<UnlockedItemPayload | null>(null);
  const [showCutsceneModal, setShowCutsceneModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'weapons' | 'characters' | 'crates' | 'gems' | 'vip'>('all');
  const [previewItem, setPreviewItem] = useState<PreviewableStoreItem | null>(null);
  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(settingsManager.getSettings().unlockedWeapons || []);
  const [hasPremiumPass, setHasPremiumPass] = useState(() => settingsManager.getSettings().hasPremiumPass || false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [hoveredWeaponTier, setHoveredWeaponTier] = useState<WeaponRarityTier | null>(null);
  const [hoveredWeapon, setHoveredWeapon] = useState<PreviewableStoreItem | null>(null);
  const [isAutoBiome, setIsAutoBiome] = useState(true);
  const [selectedBiome, setSelectedBiome] = useState<WeaponBiomeId>('royal_palace');

  const previewItemTier = previewItem ? getWeaponRarityTier(previewItem) : null;
  const activeScreenTier: WeaponRarityTier =
    hoveredWeaponTier || previewItemTier || (activeCategory === 'weapons' ? 'legendary' : 'bronze');
  const activeTheme = WEAPON_RARITY_THEMES[activeScreenTier];

  React.useEffect(() => {
    const unsubscribe = settingsManager.subscribe((settings) => {
      setUnlockedWeapons(settings.unlockedWeapons || []);
      setHasPremiumPass(settings.hasPremiumPass || false);
    });
    return unsubscribe;
  }, []);

  const handlePurchase = (item: PreviewableStoreItem) => {
    if (unlockedWeapons.includes(item.id)) return;
    if (purchasingId) return;

    const cur = settingsManager.getSettings();
    const hasGems = item.priceGems ? cur.gems >= item.priceGems : true;
    const hasCoins = item.priceCoins ? cur.coins >= item.priceCoins : true;

    if (!hasGems || !hasCoins) {
      soundManager.playButtonClick();
      haptics.light();
      setToastMessage(`❌ عذراً، رصيدك من الـ ${item.priceGems ? 'مجوهرات' : 'عملات'} غير كافٍ!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    soundManager.playButtonClick();
    haptics.light();
    setPurchasingId(item.id);

    // Simulate 1.2s realistic bank transaction block
    setTimeout(() => {
      const latest = settingsManager.getSettings();
      const updated: Partial<typeof latest> = {
        unlockedWeapons: [...(latest.unlockedWeapons || []), item.id]
      };

      if (item.priceGems) {
        updated.gems = Math.max(0, latest.gems - item.priceGems);
      }
      if (item.priceCoins) {
        updated.coins = Math.max(0, latest.coins - item.priceCoins);
      }

      settingsManager.updateSettings(updated);
      setPurchasingId(null);
      soundManager.playVictory();
      haptics.victory();
      setToastMessage(`🎉 تمت العملية بنجاح! تم فتح [${item.name}] بنجاح.`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  const weaponsRef = useRef<HTMLDivElement>(null);
  const charactersRef = useRef<HTMLDivElement>(null);
  const cratesRef = useRef<HTMLDivElement>(null);
  const gemsRef = useRef<HTMLDivElement>(null);
  const vipRef = useRef<HTMLDivElement>(null);

  const STORE_CHARACTERS: PreviewableStoreItem[] = [
    {
      id: 'cyber_commando',
      name: 'قائد النخبة السيبراني • Cyber Commando',
      nameEn: 'Cybernetic Spec-Ops Commander',
      rarity: 'legendary',
      category: 'character',
      priceGems: 320,
      description: 'جندي المستقبل المزود بخوذة سيبرانية رقمية مع درع الكربون المعزز ونفاثات طيران بلازمية مزدوجة.',
      characterConfig: {
        camoColor: '#06b6d4',
        headgear: 'cyber_helmet',
        bodyArmor: 'carbon_plate',
        eyewear: 'tactical_hud',
        beard: 'stubble',
        jetpackStyle: 'cyber_plasma',
        skinTone: '#fcd34d',
        weapon: 'laser',
        trailColor: '#06b6d4',
      },
    },
    {
      id: 'golden_warlord',
      name: 'أمير الحرب المذهب • Golden Warlord',
      nameEn: 'Royal Gold Supreme Warlord',
      rarity: 'legendary',
      category: 'character',
      priceGems: 300,
      description: 'طراز ذهبي ملكي فاخر مع درع القوة المطلقة وتوربينات وقود ذهبية فائقة السرعة.',
      characterConfig: {
        camoColor: '#f59e0b',
        headgear: 'beret_gold',
        bodyArmor: 'heavy_vest',
        eyewear: 'gold_aviators',
        beard: 'stubble',
        jetpackStyle: 'golden_thrusters',
        skinTone: '#fbb587',
        weapon: 'pistol',
        trailColor: '#fbbf24',
      },
    },
    {
      id: 'desert_phantom',
      name: 'شبح الصحراء التكتيكي • Desert Phantom',
      nameEn: 'Desert Camo Spec-Ops Veteran',
      rarity: 'epic',
      category: 'character',
      priceGems: 180,
      description: 'خبير الاقتحام والعمليات الصحراوية المجهّز بأقنعة الرؤية الحرارية وبندقية قنص قتالية.',
      characterConfig: {
        camoColor: '#ca8a04',
        headgear: 'camo_helmet',
        bodyArmor: 'molle_vest',
        eyewear: 'aviators',
        beard: 'stubble',
        jetpackStyle: 'military_dual',
        skinTone: '#e2a97e',
        weapon: 'sniper',
        trailColor: '#f59e0b',
      },
    },
    {
      id: 'arctic_valkyrie',
      name: 'قناص الفالكيري الجليدي • Arctic Valkyrie',
      nameEn: 'Sub-Zero Combat Specialist',
      rarity: 'epic',
      category: 'character',
      priceGems: 150,
      description: 'محارب البيئات القطبية المتجمدة بدروع مقاومة للصدمات وطاقة طيران نفاثة متطورة.',
      characterConfig: {
        camoColor: '#38bdf8',
        headgear: 'skull_mask',
        bodyArmor: 'molle_vest',
        eyewear: 'aviators',
        beard: 'clean',
        jetpackStyle: 'military_dual',
        skinTone: '#fde047',
        weapon: 'rifle',
        trailColor: '#38bdf8',
      },
    },
  ];

  const STORE_WEAPONS: PreviewableStoreItem[] = [
    {
      id: 'desert_eagle_gold',
      name: 'Desert Eagle • الذهب الملكي',
      nameEn: 'Royal Gold Combat Pistol',
      rarity: 'legendary',
      category: 'weapon',
      weaponType: 'pistol',
      priceGems: 180,
      description: 'مسدس القوة الضاربة المذهب بضرر فتاك وسرعة إطلاق مضاعفة مع ليزر تصويب استراتيجي.',
      stats: { damage: 98, fireRate: 85, range: 75, ammo: '14 طلقة' },
    },
    {
      id: 'sniper',
      name: 'AWM Sniper Rifle .50 BMG',
      nameEn: 'Arctic Warfare Magnum .50',
      rarity: 'legendary',
      category: 'weapon',
      weaponType: 'sniper',
      priceGems: 250,
      description: 'بندقية القنص الثقيلة الخارقة للدروع. طلقة واحدة كفيلة بالقضاء على الهدف من مسافات بعيدة.',
      stats: { damage: 100, fireRate: 25, range: 100, ammo: '5 طلقات' },
    },
    {
      id: 'rocket',
      name: 'قاذف الصواريخ RPG-7',
      nameEn: 'Anti-Tank RPG Launcher',
      rarity: 'epic',
      category: 'weapon',
      weaponType: 'rocket',
      priceGems: 150,
      description: 'سلاح التدمير الشامل بالصواريخ الحرارية الموجهة. ينسف التحصينات والأعداء في نطاق واسع.',
      stats: { damage: 95, fireRate: 30, range: 85, ammo: '3 صواريخ' },
    },
    {
      id: 'dual_uzi',
      name: 'الرشاش المزدوج Dual Uzi',
      nameEn: 'Dual Micro Uzi Submachine',
      rarity: 'epic',
      category: 'weapon',
      weaponType: 'dual_uzi',
      priceGems: 120,
      description: 'إطلاق نار مزدوج بكثافة مرعبة وسرعة تغذية جبارة لحسم المواجهات القريبة.',
      stats: { damage: 70, fireRate: 98, range: 50, ammo: '60 طلقة' },
    },
    {
      id: 'saw_gun',
      name: 'منشار القتل الميداني SAW',
      nameEn: 'Buzzsaw Blade Cannon',
      rarity: 'epic',
      category: 'weapon',
      weaponType: 'saw_gun',
      priceCoins: 15000,
      description: 'يطلق شفرات مسننة ترتد عبر الجدران والممرات الضيقة لإحداث فوضى عارمة.',
      stats: { damage: 85, fireRate: 65, range: 60, ammo: '12 شفرة' },
    },
    {
      id: 'shotgun',
      name: 'شوزن القتال Combat Shotgun',
      nameEn: 'Tactical Pump Shotgun',
      rarity: 'rare',
      category: 'weapon',
      weaponType: 'shotgun',
      priceCoins: 8500,
      description: 'سلاح الاقتحام القريب بانتشار قذائف شتات عالي الضرر.',
      stats: { damage: 90, fireRate: 40, range: 35, ammo: '8 طلقات' },
    },
  ];

  const handleCategoryClick = (category: 'all' | 'weapons' | 'characters' | 'crates' | 'gems' | 'vip') => {
    soundManager.playButtonClick();
    setActiveCategory(category);

    if (category === 'weapons' && weaponsRef.current) {
      weaponsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category === 'characters' && charactersRef.current) {
      charactersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category === 'crates' && cratesRef.current) {
      cratesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category === 'gems' && gemsRef.current) {
      gemsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category === 'vip' && vipRef.current) {
      vipRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenCrate = (type: 'supply' | 'elite' | 'mystery') => {
    const currentSettings = settingsManager.getSettings();

    // Check & deduct currency for paid crates
    if (type === 'elite') {
      if ((currentSettings.gems || 0) < 80) {
        toastManager.show('عذراً! لا تمتلك جواهر كافية', 'تحتاج إلى 80 جوهرة 💎 لفتح صندوق النخبة الذهبي', 'error');
        return;
      }
      settingsManager.updateSettings({ gems: currentSettings.gems - 80 });
    } else if (type === 'mystery') {
      if ((currentSettings.gems || 0) < 180) {
        toastManager.show('عذراً! لا تمتلك جواهر كافية', 'تحتاج إلى 180 جوهرة 💎 لفك أقفال الصندوق الغامض', 'error');
        return;
      }
      settingsManager.updateSettings({ gems: currentSettings.gems - 180 });
    }

    soundManager.playVictory();
    haptics.heavy();

    let payload: UnlockedItemPayload;
    if (type === 'elite') {
      payload = {
        title: 'صندوق النخبة الذهبي الأسطوري!',
        subtitle: 'تمت فك شيفرة الأقفال واستخراج عتاد وسلاح أسطوري',
        type: 'crate',
        rarity: 'legendary',
        itemName: 'ديزرت إيجل الذهب الملكي • Desert Eagle Gold',
        itemNameEn: 'Royal Golden .50 AE Pistol',
        weaponId: 'desert_eagle_gold',
        weaponType: 'pistol',
        itemImage: '/images/desert_eagle_gold.jpg',
        badge: 'LEGENDARY WEAPON 🌟',
        statGains: [
          { label: 'الضرر البالستي', newVal: '98 (+45%)' },
          { label: 'سرعة التغذية', newVal: '85 RPM' },
          { label: 'مدى الليزر', newVal: '75m' },
          { label: 'سعة المخزن', newVal: '14 طلقة' },
        ],
        rewards: [
          { label: 'عملات معركة', value: '+3,500 🪙', color: 'text-emerald-400' },
          { label: 'جواهر نخبة', value: '+75 💎', color: 'text-cyan-400' },
          { label: 'بطاقات سلاح', value: '+30 بطاقة AWM', color: 'text-amber-400' },
          { label: 'ميزة نفاثة', value: 'وقود بلازمي مضاعف', color: 'text-purple-400' },
        ],
      };
    } else if (type === 'mystery') {
      payload = {
        title: 'صندوق الأسلحة السري والغامض!',
        subtitle: 'مستخرج من مخابئ الكتيبة الخاصة',
        type: 'crate',
        rarity: 'epic',
        itemName: 'الرشاش المزدوج Dual Micro-Uzi',
        itemNameEn: 'Dual Tactical Submachine Guns',
        weaponId: 'dual_uzi',
        weaponType: 'dual_uzi',
        itemImage: '/images/dual_uzi.jpg',
        badge: 'EPIC WEAPON 🔥',
        statGains: [
          { label: 'كثافة النيران', newVal: '98 RPM' },
          { label: 'ضرر المواجهة', newVal: '75' },
          { label: 'سعة المشط', newVal: '60 طلقة' },
        ],
        rewards: [
          { label: 'عملات معركة', value: '+2,000 🪙', color: 'text-emerald-400' },
          { label: 'جواهر نخبة', value: '+45 💎', color: 'text-cyan-400' },
        ],
      };
    } else {
      payload = {
        title: 'صندوق الإمداد الميداني المجاني!',
        subtitle: 'إمدادات تكتيكية يومية لمواصلة القتال',
        type: 'crate',
        rarity: 'rare',
        itemName: 'قاذف الصواريخ RPG-7',
        itemNameEn: 'Heavy Anti-Tank Rocket',
        weaponId: 'rocket',
        weaponType: 'rocket',
        itemImage: '/images/crate_supply.jpg',
        badge: 'SUPPLY CHEST 📦',
        statGains: [
          { label: 'ضرر الانفجار', newVal: '100 SP' },
          { label: 'قطر التدمير', newVal: '160m' },
        ],
        rewards: [
          { label: 'عملات معركة', value: '+1,200 🪙', color: 'text-emerald-400' },
          { label: 'جواهر نخبة', value: '+20 💎', color: 'text-cyan-400' },
        ],
      };
    }

    setCutscenePayload(payload);
    setShowCutsceneModal(true);
  };

  const handleClaimReward = () => {
    if (!openedCrate) return;
    soundManager.playVictory();
    const current = settingsManager.getSettings();
    settingsManager.updateSettings({
      coins: current.coins + openedCrate.coins,
      gems: current.gems + openedCrate.gems,
    });
    setToastMessage(
      `🎉 تمت إضافة +${openedCrate.coins.toLocaleString()} كوينز و +${openedCrate.gems} جوهرة لمستودعك!`
    );
    setOpenedCrate(null);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const activeWeaponForBiome = previewItem || hoveredWeapon || STORE_WEAPONS[0];
  const detectedBiome = getWeaponBiome(activeWeaponForBiome);
  const activeBiome: WeaponBiomeId = isAutoBiome ? detectedBiome : selectedBiome;

  return (
    <WeaponEnvironmentBackdrop
      biomeId={activeBiome}
      isAutoMode={isAutoBiome}
      onSelectBiome={(b) => {
        setIsAutoBiome(false);
        setSelectedBiome(b);
      }}
      onToggleAutoMode={() => setIsAutoBiome((prev) => !prev)}
      subTitle={`بيئة العرض: ${WEAPON_BIOMES[activeBiome].nameAr} • متناغمة مع ${activeWeaponForBiome.name}`}
      className="pb-28 pt-2"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 select-none"
      >
        {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => handleCategoryClick('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black shadow-md shrink-0 transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-black shadow-emerald-500/20'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          كل الإمدادات (All Supplies)
        </button>
        <button
          onClick={() => handleCategoryClick('weapons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'weapons'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/20 font-black'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          الأسلحة 3D (Weapons 3D)
        </button>
        <button
          onClick={() => handleCategoryClick('characters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'characters'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-cyan-500/20 font-black'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          الشخصيات 3D (Characters 3D)
        </button>
        <button
          onClick={() => handleCategoryClick('crates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'crates'
              ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-amber-500/20 font-black'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          الصناديق التكتيكية (Crates)
        </button>
        <button
          onClick={() => handleCategoryClick('gems')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'gems'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-cyan-500/20 font-black'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          خزينة الجواهر والكوينز (Gems Vault)
        </button>
        <button
          onClick={() => handleCategoryClick('vip')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'vip'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/20 font-black'
              : 'bg-[#132018] text-gray-300 hover:text-white border border-[#273d2b]'
          }`}
        >
          حزمة المحترف VIP PASS
        </button>
      </div>

      {/* DAILY SPECIAL / FEATURED HERO BANNER WITH REAL 3D CANVAS & RARITY GLOW */}
      <section
        onMouseEnter={() => {
          setHoveredWeaponTier('legendary');
          setHoveredWeapon(STORE_WEAPONS[0]);
        }}
        onMouseLeave={() => {
          setHoveredWeaponTier(null);
          setHoveredWeapon(null);
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#1f3020] via-[#162319] to-[#0e1711] p-4 border-2 border-amber-500/60 shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]"
      >
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/80 text-red-300 rounded-md border border-red-800 text-[10px] font-bold">
            <Clock size={12} className="animate-spin" />
            <span>عرض محدود: ينتهي خلال 08:24:15</span>
          </div>
          <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs rounded-md shadow">
            -40% خصم حصري
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-right space-y-2">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                سلاح النخبة المذهب الأسطوري ثلاثي الأبعاد ★★★
              </span>
              <h2 className="text-base sm:text-xl font-black text-white uppercase">
                DESERT EAGLE • طراز الذهب الملكي 3D
              </h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              مجسم ثلاثي الأبعاد بالكامل WebGL! نسخة مذهبة بضرر فتاك وسرعة إطلاق مضاعفة مع ليزر تصويب استراتيجي وتأثير إقصاء خاص.
            </p>

            {/* Spec Counters */}
            <div className="grid grid-cols-3 gap-2 bg-[#08100b]/80 p-2 rounded-xl border border-[#223526]">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">الضرر الفوري</span>
                <span className="text-xs font-black text-red-400 font-mono">98 / 100</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">معدل الإطلاق</span>
                <span className="text-xs font-black text-cyan-400 font-mono">85 / 100</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400">سعة الخزنة</span>
                <span className="text-xs font-black text-emerald-400 font-mono">14 طلقة</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleOpenCrate('elite')}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>شراء العرض</span>
                <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-lg text-black font-black text-xs font-mono">
                  <span>180</span>
                  <span>💎</span>
                </div>
              </button>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setPreviewItem(STORE_WEAPONS[0]);
                }}
                className="py-2.5 px-3 bg-[#122216] hover:bg-[#1a3020] text-amber-300 border border-amber-500/50 rounded-xl text-xs font-black flex items-center gap-1 shadow cursor-pointer"
              >
                <Eye size={14} />
                <span>معاينة 3D كاملة</span>
              </button>
            </div>
          </div>

          {/* REAL 3D WEAPON VIEWPORT FOR HERO BANNER */}
          <div
            onClick={() => {
              soundManager.playButtonClick();
              setPreviewItem(STORE_WEAPONS[0]);
            }}
            className="w-full sm:w-56 h-48 relative flex items-center justify-center bg-[#070e0a] rounded-2xl overflow-hidden border-2 border-amber-500/60 p-1 group cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.25)]"
          >
            <ThreeWeaponCanvas
              weaponType="pistol"
              rarity="legendary"
              height={180}
              interactive={true}
              autoRotate={true}
              showGlowBackdrop={true}
            />
            <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1 pointer-events-none">
              <RotateCw size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>مجسم 3D تفاعلي</span>
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-500/40 pointer-events-none">
              أسطوري ★★★
            </span>
          </div>
        </div>
      </section>

      {/* SECTION: 3D CHARACTERS & OUTFITS SHOWCASE (أزياء وشخصيات المقاتلين ثلاثية الأبعاد) */}
      <section ref={charactersRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <User size={16} className="text-cyan-400" />
              أزياء وشخصيات المقاتلين 3D (3D Operatives & Skins)
            </h3>
            <p className="text-[11px] text-gray-400">
              مجسمات جنود كاملة قابلة للدوران 360° مع دروع سيبرانية ونفاثات طيران وأسلحة حية
            </p>
          </div>
          <span className="text-[10px] bg-[#0c1c24] text-cyan-400 font-bold px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1">
            <Flame size={12} />
            <span>مجسمات WebGL حقيقية</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STORE_CHARACTERS.map((char) => {
            const isOwned = unlockedWeapons.includes(char.id);
            const isPurchasing = purchasingId === char.id;

            return (
              <div
                key={char.id}
                className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-all relative overflow-hidden group ${
                  char.rarity === 'legendary'
                    ? 'bg-gradient-to-b from-[#18140c] to-[#0c0905] border-amber-500/70 shadow-lg hover:border-amber-400'
                    : 'bg-gradient-to-b from-[#0e1724] to-[#080d14] border-cyan-500/60 shadow-lg hover:border-cyan-400'
                }`}
              >
                {/* Visual lock status indicator at the top left */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  {isOwned ? (
                    <div className="bg-emerald-950/90 text-emerald-400 p-1 rounded-full border border-emerald-500/50 shadow-md">
                      <Check size={11} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="bg-red-950/90 text-red-400 p-1 rounded-full border border-red-500/50 shadow-md">
                      <Lock size={11} />
                    </div>
                  )}
                </div>

                {char.rarity === 'legendary' && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                )}

                <div className="flex items-center justify-between mb-1 pl-6">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                      char.rarity === 'legendary'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    }`}
                  >
                    {char.rarity === 'legendary' ? 'شخصية أسطورية ★★★' : 'شخصية ملحمية ★★'}
                  </span>

                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      setPreviewItem(char);
                    }}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Eye size={12} className="text-cyan-300" />
                    <span>معاينة 3D</span>
                  </button>
                </div>

                {/* 2D Premium Character Card Representation */}
                <div
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.light();
                    setPreviewItem(char);
                  }}
                  className="w-full h-44 my-1 bg-gradient-to-br from-neutral-900 via-[#0d1410] to-[#040805] rounded-xl border border-white/10 flex flex-col items-center justify-center overflow-hidden cursor-pointer group-hover:scale-102 transition-transform relative group"
                >
                  {/* Glowing neon aura matching skin/camo */}
                  <div
                    className="absolute inset-0 opacity-20 blur-2xl group-hover:opacity-35 transition-all duration-300"
                    style={{
                      background: `radial-gradient(circle at center, ${char.characterConfig?.camoColor || '#06b6d4'} 0%, transparent 70%)`
                    }}
                  />
                  {/* Cyber Matrix/Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50" />
                  
                  {/* Large Stylized Monogram overlay in background */}
                  <span className="absolute text-[60px] font-black text-white/5 tracking-wider uppercase select-none pointer-events-none leading-none">
                    {char.id === 'cyber_commando' ? 'CYBER' : char.id === 'golden_warlord' ? 'GOLD' : char.id === 'desert_phantom' ? 'SHD' : 'ICE'}
                  </span>

                  {/* High Detail Realistic 2D Operative Character Graphic */}
                  <div className="relative z-10 my-1 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
                    <OperativeGraphicSVG id={char.id} className="w-24 h-24" />
                  </div>

                  {/* Interactive Hint */}
                  <div className="absolute bottom-2 inset-x-0 text-center z-10">
                    <span className="text-[9px] font-black tracking-wider text-cyan-400 font-mono bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 uppercase">
                      <Eye size={10} className="text-cyan-400 animate-pulse" />
                      <span>معاينة 3D تفاعلية 🔍</span>
                    </span>
                  </div>
                </div>

                <div className="text-right my-1">
                  <h4 className="text-xs font-black text-white">{char.name}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{char.description}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={isOwned || isPurchasing}
                    onClick={() => handlePurchase(char)}
                    className={`w-full py-2 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all ${
                      isOwned
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed'
                        : isPurchasing
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-wait animate-pulse'
                        : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:brightness-110 text-black'
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <RotateCw size={13} className="animate-spin text-amber-400" />
                        <span>جاري المعالجة...</span>
                      </>
                    ) : isOwned ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>مملوك (Owned)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={13} />
                        <span>شراء ({char.priceGems} 💎)</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: 3D INTERACTIVE WEAPONS ARMORY STORE (ترسانة الأسلحة المتاحة للشراء والمعاينة) */}
      <section ref={weaponsRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              ترسانة الأسلحة 3D التفاعلية (3D Tactical Armory)
            </h3>
            <p className="text-[11px] text-gray-400">
              مجسمات أسلحة ثلاثية الأبعاد تفاعلية بزاوية 360 درجة مع حساب الضرر وسرعة الإطلاق
            </p>
          </div>
          <span className="text-[10px] bg-[#121c15] text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
            معاينة 3D حية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {STORE_WEAPONS.map((w) => {
            const wTier = getWeaponRarityTier(w);
            const wTheme = WEAPON_RARITY_THEMES[wTier];

            return (
              <div
                key={w.id}
                onMouseEnter={() => {
                  setHoveredWeaponTier(wTier);
                  setHoveredWeapon(w);
                }}
                onMouseLeave={() => {
                  setHoveredWeaponTier(null);
                  setHoveredWeapon(null);
                }}
                className="p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all relative overflow-hidden group bg-gradient-to-b from-[#121c15] to-[#070e0a]"
                style={{
                  borderColor: `${wTheme.accentHex}88`,
                  boxShadow: `0 0 24px ${wTheme.accentHex}25`,
                }}
              >
                {/* Rarity Shimmer Top Stripe */}
                <div
                  className="absolute top-0 right-0 left-0 h-1 animate-pulse"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${wTheme.accentHex}, transparent)`,
                  }}
                />

                <div className="flex items-center justify-between mb-1">
                  {!unlockedWeapons.includes(w.id) && (
                    <div className="bg-red-950/80 text-red-300 p-1 rounded-full border border-red-500/50 absolute top-2 right-2 z-10">
                      <Lock size={12} />
                    </div>
                  )}
                  <span
                    className="text-[9px] font-black px-2 py-0.5 rounded border transition-colors"
                    style={{
                      backgroundColor: `${wTheme.accentHex}25`,
                      borderColor: `${wTheme.accentHex}70`,
                      color: wTheme.accentHex,
                    }}
                  >
                    {wTheme.arabicLabel} ★★★
                  </span>

                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      setPreviewItem(w);
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Eye size={12} className="text-amber-300" />
                    <span>معاينة 3D</span>
                  </button>
                </div>

                {/* Tactical Weapon Display Area with Optical Glow Halo */}
                <div
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.light();
                    setPreviewItem(w);
                  }}
                  className="w-full h-36 my-1 bg-[#060c08] rounded-xl border flex flex-col items-center justify-center overflow-hidden cursor-pointer group-hover:scale-102 transition-all relative group"
                  style={{
                    borderColor: `${wTheme.accentHex}44`,
                  }}
                >
                  {/* Dynamic Optical Glow Halo behind the weapon */}
                  <WeaponGlowBackdrop tier={wTier} size="md" intensity="high" />

                  {/* High Quality Weapon Sprite SVG */}
                  <div className="relative z-10">
                    <WeaponSpriteSVG
                      weapon={w.id}
                      className="w-24 h-16 filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] transition-transform group-hover:scale-115"
                    />
                  </div>

                  {/* Interactive 3D Inspection Tag */}
                  <div className="absolute bottom-1.5 inset-x-0 text-center z-10">
                    <span
                      className="text-[8px] font-black tracking-widest font-mono border px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-md"
                      style={{
                        backgroundColor: `${wTheme.accentHex}25`,
                        borderColor: `${wTheme.accentHex}77`,
                        color: wTheme.accentHex,
                      }}
                    >
                      <Eye size={9} className="animate-pulse" />
                      <span>عرض ثلاثي الأبعاد 3D</span>
                    </span>
                  </div>
                </div>

                <div className="text-right my-1">
                  <h4 className="text-xs font-black text-white">{w.name}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{w.description}</p>
                </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={unlockedWeapons.includes(w.id) || purchasingId === w.id}
                  onClick={() => handlePurchase(w)}
                  className={`flex-1 py-2 font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer transition-all ${
                    unlockedWeapons.includes(w.id)
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed'
                      : purchasingId === w.id
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-wait animate-pulse'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black'
                  }`}
                >
                  {purchasingId === w.id ? (
                    <>
                      <RotateCw size={13} className="animate-spin text-amber-400" />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : unlockedWeapons.includes(w.id) ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>مملوك (Owned)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={13} />
                      <span>شراء ({w.priceGems ? `${w.priceGems} 💎` : `${w.priceCoins} 🪙`})</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          );
        })}
        </div>
      </section>

      {/* SECTION: 3 TACTICAL CRATES (crate_supply.jpg, crate_elite.jpg, crate_mystery.jpg) */}
      <section ref={cratesRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              صناديق الغنائم القتالية (Tactical Combat Crates)
            </h3>
            <p className="text-[11px] text-gray-400">
              افتح الصناديق للحصول على بطاقات الترقية والعتاد الأسطوري
            </p>
          </div>
          <span className="text-[10px] bg-[#121c15] text-amber-400 font-bold px-2 py-1 rounded-lg border border-[#253928]">
            نسبة حظ أسطوري: 15%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* CRATE 1: SUPPLY CRATE */}
          <div className="bg-gradient-to-b from-[#122217] via-[#0d1811] to-[#070e0a] border-2 border-emerald-500/70 rounded-2xl p-3.5 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all relative overflow-hidden group">
            {/* Top Shimmer Stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500" />
            
            <div className="flex items-center justify-between mb-1 mt-1">
              <span className="text-[10px] bg-emerald-950/90 text-emerald-300 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-sm flex items-center gap-1">
                <span>🟢 نادِر</span>
                <span>•</span>
                <span>إمداد ميداني</span>
              </span>
              <span className="text-xs text-emerald-400 font-black flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>مجاني الآن</span>
              </span>
            </div>

            {/* 3D Illuminated Pedestal Stage */}
            <div className="w-full h-36 flex items-center justify-center my-2.5 bg-gradient-to-b from-[#0a180e] via-[#061009] to-[#030805] rounded-xl border border-emerald-500/30 overflow-hidden relative group-hover:border-emerald-400/60 transition-colors shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.25)_0%,transparent_70%)] pointer-events-none" />
              <ThreeCrateCanvas type="supply" rarity="rare" className="w-full h-full relative z-10" autoRotate={true} />
              <div className="absolute bottom-1 w-24 h-3 bg-emerald-500/30 rounded-full blur-md" />
            </div>

            <div className="text-right space-y-1.5 mb-3">
              <h4 className="text-sm font-black text-white flex items-center justify-between">
                <span>صندوق الإمداد القياسي</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  3x بطاقات 📦
                </span>
              </h4>
              <p className="text-[11px] text-emerald-100/70 leading-snug">
                يحتوي على 3 بطاقات سلاح متنوعة + 750 كوينز للدروع والعتاد الميداني.
              </p>
              {/* Spec Stat Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[9px] bg-black/40 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-900">
                  750 كوينز 🪙
                </span>
                <span className="text-[9px] bg-black/40 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-900">
                  حظ نادِر 100%
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenCrate('supply')}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 hover:brightness-110 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>فتح الصندوق (مجاني 🎁)</span>
            </button>
          </div>

          {/* CRATE 2: ELITE GOLDEN CRATE */}
          <div className="bg-gradient-to-b from-[#241c0e] via-[#1a140a] to-[#0d0a05] border-2 border-amber-400/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:border-amber-300 transition-all relative overflow-hidden group">
            {/* Top Shimmer Stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 animate-pulse" />

            <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 text-black font-black text-[10px] px-3 py-0.5 rounded-full shadow-lg border border-yellow-200 z-10">
              الأعلى تقييماً ★
            </div>

            <div className="flex items-center justify-between mb-1 mt-1">
              <span className="text-[10px] bg-amber-950/90 text-amber-300 font-black px-2.5 py-0.5 rounded-full border border-amber-500/50 shadow-sm flex items-center gap-1">
                <span>⭐ أسطوري</span>
                <span>•</span>
                <span>النخبة 3D</span>
              </span>
              <span className="text-xs text-amber-400 font-black flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>مضمون أسطوري</span>
              </span>
            </div>

            {/* 3D Illuminated Pedestal Stage */}
            <div className="w-full h-36 flex items-center justify-center my-2.5 bg-gradient-to-b from-[#181208] via-[#100c05] to-[#080602] rounded-xl border border-amber-500/40 overflow-hidden relative group-hover:border-amber-400/70 transition-colors shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.3)_0%,transparent_70%)] pointer-events-none" />
              <ThreeCrateCanvas type="elite" rarity="legendary" className="w-full h-full relative z-10" autoRotate={true} />
              <div className="absolute bottom-1 w-24 h-3 bg-amber-500/40 rounded-full blur-md" />
            </div>

            <div className="text-right space-y-1.5 mb-3">
              <h4 className="text-sm font-black text-amber-300 flex items-center justify-between">
                <span>صندوق النخبة الذهبي 3D</span>
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/90 px-2 py-0.5 rounded border border-amber-700">
                  10x بطاقات 👑
                </span>
              </h4>
              <p className="text-[11px] text-amber-100/70 leading-snug">
                10 بطاقات سلاح أسطورية + 2,500 كوينز + فرصة الحصول على سلاح ذهبي خاص.
              </p>
              {/* Spec Stat Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[9px] bg-black/50 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-900">
                  2,500 كوينز 🪙
                </span>
                <span className="text-[9px] bg-black/50 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-900">
                  سلاح ذهبي خاص 🔥
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenCrate('elite')}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-98 transition-all cursor-pointer border border-yellow-200"
            >
              <span>فتح الصندوق الأسطوري</span>
              <span className="bg-black/40 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                80 💎
              </span>
            </button>
          </div>

          {/* CRATE 3: MYSTERY CRATE */}
          <div className="bg-gradient-to-b from-[#1c1229] via-[#140d1e] to-[#0a060f] border-2 border-purple-500/80 rounded-2xl p-3.5 flex flex-col justify-between shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all relative overflow-hidden group">
            {/* Top Shimmer Stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-400 to-cyan-400" />

            <div className="flex items-center justify-between mb-1 mt-1">
              <span className="text-[10px] bg-purple-950/90 text-purple-300 font-black px-2.5 py-0.5 rounded-full border border-purple-500/50 shadow-sm flex items-center gap-1">
                <span>🔮 ملحمي</span>
                <span>•</span>
                <span>سري وغامض</span>
              </span>
              <span className="text-xs text-purple-300 font-black flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>عتاد خارق</span>
              </span>
            </div>

            {/* 3D Illuminated Pedestal Stage */}
            <div className="w-full h-36 flex items-center justify-center my-2.5 bg-gradient-to-b from-[#140a1f] via-[#0d0615] to-[#06030a] rounded-xl border border-purple-500/40 overflow-hidden relative group-hover:border-purple-400/70 transition-colors shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)] pointer-events-none" />
              <ThreeCrateCanvas type="mystery" rarity="epic" className="w-full h-full relative z-10" autoRotate={true} />
              <div className="absolute bottom-1 w-24 h-3 bg-purple-500/30 rounded-full blur-md" />
            </div>

            <div className="text-right space-y-1.5 mb-3">
              <h4 className="text-sm font-black text-cyan-300 flex items-center justify-between">
                <span>صندوق الأسلحة الغامض</span>
                <span className="text-[10px] text-cyan-300 font-mono font-bold bg-purple-950/90 px-2 py-0.5 rounded border border-purple-800">
                  بطاقة ملحمية 🔮
                </span>
              </h4>
              <p className="text-[11px] text-purple-200/70 leading-snug">
                ضمان بطاقة ترقية لسلاح ملحمي + تعزيز فوري لطاقة النيترو والذخيرة.
              </p>
              {/* Spec Stat Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[9px] bg-black/50 text-cyan-300 font-bold px-2 py-0.5 rounded border border-purple-900">
                  تعزيز طيران +50% ⚡
                </span>
                <span className="text-[9px] bg-black/50 text-cyan-300 font-bold px-2 py-0.5 rounded border border-purple-900">
                  ذخيرة بلا حدود 💥
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenCrate('mystery')}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:brightness-110 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-98 transition-all cursor-pointer"
            >
              <span>فك الشيفرة السريّة</span>
              <span className="bg-black/40 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                180 💎
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRO PACK PASS CALLOUT */}
      <section ref={vipRef} className="bg-gradient-to-r from-[#121c15] via-[#1a2b1d] to-[#121c15] border-2 border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 text-right">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-300 flex items-center justify-center text-black shadow-lg shrink-0">
            <Crown size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-white">
                حزمة المحترف (PRO PACK PASS)
              </h4>
              <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-2 py-0.2 rounded border border-emerald-800">
                مدى الحياة
              </span>
            </div>
            <p className="text-xs text-gray-300">
              فتح حمل السلاح المزدوج (Dual Wielding) • نيترو طيران نفاث +50% • صواريخ بلا حدود
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {hasPremiumPass ? (
            <div className="px-5 py-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500 text-amber-400 font-black text-xs flex items-center justify-center gap-1.5 shadow-inner">
              <Crown size={14} className="animate-pulse" />
              <span>الحزمة نشطة ومفعلة مدى الحياة ✓</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                onClick={() => {
                  const cur = settingsManager.getSettings();
                  if (cur.gems < 150) {
                    soundManager.playButtonClick();
                    setToastMessage('❌ رصيد الجواهر غير كافٍ! تحتاج إلى 150 💎');
                    setTimeout(() => setToastMessage(null), 3000);
                    return;
                  }
                  soundManager.playVictory();
                  haptics.victory();
                  settingsManager.updateSettings({
                    gems: cur.gems - 150,
                    hasPremiumPass: true,
                  });
                  setToastMessage('🔥 تم تفعيل حزمة المحترف PRO PACK بنجاح باستخدام الجواهر!');
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:brightness-110 text-black font-black text-xs shadow-md whitespace-nowrap active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>شراء بـ 150 💎</span>
              </button>

              <button
                onClick={() => {
                  const cur = settingsManager.getSettings();
                  if (cur.coins < 5000) {
                    soundManager.playButtonClick();
                    setToastMessage('❌ رصيد الكوينز غير كافٍ! تحتاج إلى 5,000 🪙');
                    setTimeout(() => setToastMessage(null), 3000);
                    return;
                  }
                  soundManager.playVictory();
                  haptics.victory();
                  settingsManager.updateSettings({
                    coins: cur.coins - 5000,
                    hasPremiumPass: true,
                  });
                  setToastMessage('🔥 تم تفعيل حزمة المحترف PRO PACK بنجاح باستخدام الكوينز!');
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-md whitespace-nowrap active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>شراء بـ 5,000 🪙</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CURRENCY VAULT (COIN PACKS) */}
      <section ref={gemsRef} className="space-y-2">
        <h4 className="text-xs font-black text-gray-300">خزينة العملات الذهبية (Coins):</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-[#121d15] p-3 rounded-xl border border-[#233526] flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-white block">5,000 كوينز</span>
              <span className="text-[10px] text-gray-400">حفنة ذخيرة ذهبية للمبتدئين</span>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                const cur = settingsManager.getSettings();
                if (cur.gems < 25) {
                  setToastMessage('❌ رصيد المجوهرات غير كافٍ لشراء الذهب!');
                  setTimeout(() => setToastMessage(null), 2500);
                  return;
                }
                settingsManager.updateSettings({ coins: cur.coins + 5000, gems: cur.gems - 25 });
                setToastMessage('🪙 تمت إضافة 5,000 كوينز!');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="bg-[#1d2d21] hover:bg-[#273d2d] text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#3b5942]"
            >
              25 💎
            </button>
          </div>

          <div className="bg-[#121d15] p-3 rounded-xl border border-amber-500/40 flex items-center justify-between relative">
            <span className="absolute -top-2 left-3 bg-amber-500 text-black font-black text-[9px] px-1.5 rounded">
              شائع
            </span>
            <div>
              <span className="text-xs font-black text-white block">25,000 كوينز</span>
              <span className="text-[10px] text-gray-400">حقيبة الغنائم العسكرية الكبرى</span>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                const cur = settingsManager.getSettings();
                if (cur.gems < 100) {
                  setToastMessage('❌ رصيد المجوهرات غير كافٍ لشراء الذهب!');
                  setTimeout(() => setToastMessage(null), 2500);
                  return;
                }
                settingsManager.updateSettings({ coins: cur.coins + 25000, gems: cur.gems - 100 });
                setToastMessage('🪙 تمت إضافة 25,000 كوينز!');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-black shadow"
            >
              100 💎
            </button>
          </div>

          <div className="bg-[#121d15] p-3 rounded-xl border border-[#233526] flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-white block">100,000 كوينز</span>
              <span className="text-[10px] text-gray-400">كنز الترسانة الملكي الكامل</span>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                const cur = settingsManager.getSettings();
                if (cur.gems < 350) {
                  setToastMessage('❌ رصيد المجوهرات غير كافٍ لشراء الذهب!');
                  setTimeout(() => setToastMessage(null), 2500);
                  return;
                }
                settingsManager.updateSettings({ coins: cur.coins + 100000, gems: cur.gems - 350 });
                setToastMessage('🪙 تمت إضافة 100,000 كوينز!');
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className="bg-[#1d2d21] hover:bg-[#273d2d] text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#3b5942]"
            >
              350 💎
            </button>
          </div>
        </div>
      </section>

      {/* HIGH-IMPACT ANIMATED CINEMATIC CRATE CUTSCENE MODAL */}
      <AnimatedCrateCutsceneModal
        isOpen={showCutsceneModal}
        itemPayload={cutscenePayload}
        onClose={() => {
          setShowCutsceneModal(false);
          setCutscenePayload(null);
        }}
        onClaim={() => {
          const current = settingsManager.getSettings();
          const newUnlocked = [...(current.unlockedWeapons || [])];
          if (cutscenePayload?.weaponId && !newUnlocked.includes(cutscenePayload.weaponId)) {
            newUnlocked.push(cutscenePayload.weaponId);
          }
          const addCoins = cutscenePayload?.rarity === 'legendary' ? 3500 : cutscenePayload?.rarity === 'epic' ? 2000 : 1200;
          const addGems = cutscenePayload?.rarity === 'legendary' ? 75 : cutscenePayload?.rarity === 'epic' ? 45 : 20;

          settingsManager.updateSettings({
            coins: current.coins + addCoins,
            gems: current.gems + addGems,
            unlockedWeapons: newUnlocked,
          });
          toastManager.show(
            '📦 غنيمة مضافة بنجاح إلى ترسانتك!',
            `تم استلام وتجهيز ${cutscenePayload?.itemName || 'السلاح الجديد'} و +${addCoins.toLocaleString()} كوينز و +${addGems} 💎`,
            'crate'
          );
        }}
      />

      {/* STORE 3D INSPECTION MODAL */}
      <Store3DPreviewModal
        item={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        onBuy={(item) => {
          handlePurchase(item);
          setPreviewItem(null);
        }}
      />

        {/* Floating Toast */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-green-500 text-black px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </motion.div>
    </WeaponEnvironmentBackdrop>
  );
}
