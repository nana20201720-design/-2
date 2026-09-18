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
  ShoppingBag
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { settingsManager } from '../utils/settingsManager';
import { Store3DPreviewModal, PreviewableStoreItem } from './Store3DPreviewModal';
import { WeaponSpriteSVG } from '../game/weaponSprites';
import { AnimatedCrateCutsceneModal, UnlockedItemPayload } from './AnimatedCrateCutsceneModal';
import { toastManager } from '../utils/toastManager';

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
  const [activeCategory, setActiveCategory] = useState<'all' | 'crates' | 'gems' | 'vip' | 'weapons'>('all');
  const [previewItem, setPreviewItem] = useState<PreviewableStoreItem | null>(null);

  const cratesRef = useRef<HTMLDivElement>(null);
  const gemsRef = useRef<HTMLDivElement>(null);
  const vipRef = useRef<HTMLDivElement>(null);
  const weaponsRef = useRef<HTMLDivElement>(null);

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

  const handleCategoryClick = (category: 'all' | 'crates' | 'gems' | 'vip') => {
    soundManager.playButtonClick();
    setActiveCategory(category);

    if (category === 'crates' && cratesRef.current) {
      cratesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category === 'gems' && gemsRef.current) {
      gemsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (category === 'vip' && vipRef.current) {
      vipRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenCrate = (type: 'supply' | 'elite' | 'mystery') => {
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
        itemImage: '/images/crate_elite.jpg',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 pb-28 pt-2 select-none"
    >
      {/* Category Pills */}
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
          onClick={() => handleCategoryClick('crates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            activeCategory === 'crates'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/20 font-black'
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

      {/* DAILY SPECIAL / FEATURED HERO BANNER (desert_eagle_gold.jpg) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#1f3020] via-[#162319] to-[#0e1711] p-4 border-2 border-amber-500/60 shadow-2xl">
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
                سلاح النخبة المذهب الأسطوري ★★★
              </span>
              <h2 className="text-base sm:text-xl font-black text-white uppercase">
                DESERT EAGLE • طراز الذهب الملكي
              </h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              نسخة ميدانية مذهبة بضرر فتاك وسرعة إطلاق مضاعفة مع ليزر تصويب استراتيجي وتأثير إقصاء خاص.
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
                <span>معاينة 3D</span>
              </button>
            </div>
          </div>

          <div
            onClick={() => {
              soundManager.playButtonClick();
              setPreviewItem(STORE_WEAPONS[0]);
            }}
            className="w-full sm:w-48 h-40 relative flex items-center justify-center bg-[#070e0a] rounded-2xl overflow-hidden border border-[#2b4430] p-2 group cursor-pointer"
          >
            <img
              src="/images/desert_eagle_gold.jpg"
              alt="Golden Desert Eagle"
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(255,185,85,0.45)] group-hover:scale-105 transition-transform"
            />
            <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
              <RotateCw size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>تدوير 360°</span>
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-500/40">
              أسطوري ★★★
            </span>
          </div>
        </div>
      </section>

      {/* SECTION: 3D INTERACTIVE WEAPONS ARMORY STORE (ترسانة الأسلحة المتاحة للشراء والمعاينة) */}
      <section ref={weaponsRef} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              ترسانة الأسلحة المتاحة والمعاينة 3D (Tactical Armory)
            </h3>
            <p className="text-[11px] text-gray-400">
              اختر السلاح لتدويره بزاوية 360 درجة ومعاينة سرعة الإطلاق والضرر قبل الشراء
            </p>
          </div>
          <span className="text-[10px] bg-[#121c15] text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30">
            معاينة حية حرة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {STORE_WEAPONS.map((w) => (
            <div
              key={w.id}
              className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all relative overflow-hidden group ${
                w.rarity === 'legendary'
                  ? 'bg-gradient-to-b from-[#18140c] to-[#0c0905] border-amber-500/70 shadow-lg hover:border-amber-400'
                  : w.rarity === 'epic'
                  ? 'bg-gradient-to-b from-[#140e1f] to-[#0a0712] border-purple-500/60 shadow-lg hover:border-purple-400'
                  : 'bg-gradient-to-b from-[#0f1a13] to-[#080d09] border-emerald-500/50 shadow-lg hover:border-emerald-400'
              }`}
            >
              {/* Rare Item Shimmer Glow Overlay */}
              {w.rarity === 'legendary' && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
              )}

              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                    w.rarity === 'legendary'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : w.rarity === 'epic'
                      ? 'bg-purple-950 text-purple-300 border-purple-700'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  }`}
                >
                  {w.rarity === 'legendary' ? 'أسطوري ★★★' : w.rarity === 'epic' ? 'ملحمي ★★' : 'نادر ★'}
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

              {/* Weapon Visual Canvas Box */}
              <div
                onClick={() => {
                  soundManager.playButtonClick();
                  setPreviewItem(w);
                }}
                className="w-full h-28 my-1 bg-black/60 rounded-xl border border-white/10 flex items-center justify-center p-2 cursor-pointer group-hover:scale-105 transition-transform"
              >
                <WeaponSpriteSVG weapon={w.weaponType || 'pistol'} className="w-28 h-20 filter drop-shadow-[0_6px_12px_rgba(255,215,0,0.5)]" />
              </div>

              <div className="text-right my-1">
                <h4 className="text-xs font-black text-white">{w.name}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-1">{w.description}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
                <button
                  onClick={() => {
                    soundManager.playVictory();
                    haptics.victory();
                    const cur = settingsManager.getSettings();
                    if (w.priceGems) {
                      settingsManager.updateSettings({ gems: cur.gems + w.priceGems });
                    } else if (w.priceCoins) {
                      settingsManager.updateSettings({ coins: cur.coins + w.priceCoins });
                    }
                    setToastMessage(`🎉 تم شراء وحفظ [${w.name}] في ترسانتك الخاصة!`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95 transition-all"
                >
                  <ShoppingBag size={13} />
                  <span>شراء ({w.priceGems ? `${w.priceGems} 💎` : `${w.priceCoins} 🪙`})</span>
                </button>
              </div>
            </div>
          ))}
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
          <div className="bg-[#121e15] border-2 border-[#2b4430] rounded-2xl p-3.5 flex flex-col justify-between shadow-lg hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-black px-2 py-0.5 rounded border border-emerald-800">
                إمداد ميداني
              </span>
              <span className="text-xs text-emerald-400 font-bold">جاهز الآن</span>
            </div>

            <div className="w-full h-36 flex items-center justify-center my-2 bg-[#070e0a] rounded-xl border border-[#1d2d20] overflow-hidden p-2">
              <img
                src="/images/crate_supply.jpg"
                alt="Supply Crate"
                className="max-h-full object-contain filter drop-shadow-[0_6px_10px_rgba(78,124,50,0.5)]"
              />
            </div>

            <div className="text-right space-y-1 mb-3">
              <h4 className="text-xs sm:text-sm font-black text-white">صندوق الإمداد القياسي</h4>
              <p className="text-[11px] text-gray-400">
                يحتوي على 3 بطاقات سلاح متنوعة + 750 كوينز للدروع.
              </p>
            </div>

            <button
              onClick={() => handleOpenCrate('supply')}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span>فتح الصندوق (مجاني)</span>
            </button>
          </div>

          {/* CRATE 2: ELITE GOLDEN CRATE */}
          <div className="bg-[#1c1912] border-2 border-amber-500 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-yellow-300 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
              الأعلى تقييماً ★
            </div>

            <div className="flex items-center justify-between mb-1 mt-1">
              <span className="text-[10px] bg-amber-950 text-amber-300 font-black px-2 py-0.5 rounded border border-amber-800">
                صندوق النخبة
              </span>
              <span className="text-xs text-amber-400 font-bold">مضمون أسطوري</span>
            </div>

            <div className="w-full h-36 flex items-center justify-center my-2 bg-[#0c0a06] rounded-xl border border-amber-500/40 overflow-hidden p-2">
              <img
                src="/images/crate_elite.jpg"
                alt="Elite Golden Crate"
                className="max-h-full object-contain filter drop-shadow-[0_8px_14px_rgba(255,185,85,0.6)]"
              />
            </div>

            <div className="text-right space-y-1 mb-3">
              <h4 className="text-xs sm:text-sm font-black text-amber-400">
                صندوق النخبة الذهبي
              </h4>
              <p className="text-[11px] text-gray-300">
                10 بطاقات سلاح نادرة + 2,500 كوين + فرصة سلاح ذهبي خاص.
              </p>
            </div>

            <button
              onClick={() => handleOpenCrate('elite')}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 active:scale-98 transition-all"
            >
              <span>فتح الصندوق</span>
              <span className="bg-black/30 text-black px-2 py-0.5 rounded font-mono font-bold">
                80 💎
              </span>
            </button>
          </div>

          {/* CRATE 3: MYSTERY CRATE */}
          <div className="bg-[#18121f] border-2 border-purple-500/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] bg-purple-950 text-purple-300 font-black px-2 py-0.5 rounded border border-purple-800">
                سري وغامض
              </span>
              <span className="text-xs text-purple-400 font-bold">بطاقة خارقة</span>
            </div>

            <div className="w-full h-36 flex items-center justify-center my-2 bg-[#0b0710] rounded-xl border border-purple-500/30 overflow-hidden p-2">
              <img
                src="/images/crate_mystery.jpg"
                alt="Mystery Weapon Crate"
                className="max-h-full object-contain filter drop-shadow-[0_6px_12px_rgba(0,218,243,0.5)]"
              />
            </div>

            <div className="text-right space-y-1 mb-3">
              <h4 className="text-xs sm:text-sm font-black text-cyan-300">
                صندوق الأسلحة الغامض
              </h4>
              <p className="text-[11px] text-gray-400">
                ضمان بطاقة ترقية لسلاح ملحمي + تعزيز فوري للنيترو والذخيرة.
              </p>
            </div>

            <button
              onClick={() => handleOpenCrate('mystery')}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span>فك الشيفرة</span>
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

        <button
          onClick={() => {
            soundManager.playVictory();
            setToastMessage('🔥 تم تفعيل حزمة المحترف PRO PACK بنجاح!');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-md whitespace-nowrap active:scale-98 transition-all"
        >
          تفعيل الحزمة ($4.99)
        </button>
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
                settingsManager.updateSettings({ coins: cur.coins + 5000 });
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
                settingsManager.updateSettings({ coins: cur.coins + 25000 });
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
                settingsManager.updateSettings({ coins: cur.coins + 100000 });
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
          settingsManager.updateSettings({
            coins: current.coins + 2500,
            gems: current.gems + 50,
          });
          toastManager.show(
            '📦 صندوق حرب مفتوح بنجاح!',
            'تم استلام +2,500 كوينز و +50 جوهرة وعناصر سلاح نادرة',
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
          const cur = settingsManager.getSettings();
          if (item.priceGems) {
            settingsManager.updateSettings({ gems: cur.gems + item.priceGems });
          } else if (item.priceCoins) {
            settingsManager.updateSettings({ coins: cur.coins + item.priceCoins });
          }
          toastManager.show(
            `🛒 عملية شراء ناجحة!`,
            `تم اقتناء [${item.name}] وإضافته لترسانتك الميدانية`,
            'success'
          );
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
  );
}
