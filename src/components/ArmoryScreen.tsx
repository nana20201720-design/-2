import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { AnimatedCrateCutsceneModal, UnlockedItemPayload } from './AnimatedCrateCutsceneModal';

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

export default function ArmoryScreen() {
  const [activeTab, setActiveTab] = useState<ArmoryTab>('arsenal');
  const [weapons, setWeapons] = useState<WeaponItem[]>(INITIAL_WEAPONS);
  const [selectedWeaponId, setSelectedWeaponId] = useState('sniper');
  const [equippedPrimary, setEquippedPrimary] = useState(
    () => settingsManager.getSettings().equippedPrimaryWeapon || 'sniper'
  );
  const [equippedSecondary, setEquippedSecondary] = useState(
    () => settingsManager.getSettings().equippedSecondaryWeapon || 'dual_uzi'
  );
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: 'check' | 'upgrade' } | null>(null);
  const [upgradedCutscenePayload, setUpgradedCutscenePayload] = useState<UnlockedItemPayload | null>(null);
  const [showCutsceneModal, setShowCutsceneModal] = useState(false);

  const currentWeapon =
    weapons.find((w) => w.id === selectedWeaponId) || weapons[0];

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
    return <WeaponSpriteSVG weapon={id} className={className} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 pb-36 sm:pb-32 pt-2 select-none"
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
          {/* 1. INTERACTIVE PEGBOARD RACK (8 WEAPONS DISPLAY) */}
          <ArsenalPegboardRack
            weapons={weapons}
            selectedWeaponId={selectedWeaponId}
            equippedPrimary={equippedPrimary}
            equippedSecondary={equippedSecondary}
            onSelectWeapon={handleSelectWeapon}
          />

          {/* 2. INTERACTIVE LIVE SHOOTING RANGE (TEST-FIRE AT TARGET) */}
          <WeaponFiringRange weapon={currentWeapon} />

          {/* 3. SELECTED WEAPON INSPECTION BENCH */}
          <section className="bg-gradient-to-b from-[#142318] to-[#0d1610] border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-[#233526] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-[#08120a] border border-amber-500/50 rounded-xl flex items-center justify-center p-1.5 shadow-inner shrink-0">
                  <WeaponSpriteSVG weapon={currentWeapon.id} className="w-12 h-8 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {currentWeapon.name}
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded border border-amber-500/40">
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

            {/* Ballistic Gauges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Damage */}
              <div className="space-y-1 bg-[#0e1711] p-2.5 rounded-xl border border-[#223525]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-300">الضرر الإجمالي</span>
                  <span className="text-red-400 font-mono">{currentWeapon.damage}/100</span>
                </div>
                <div className="h-2 bg-[#070d09] rounded-full overflow-hidden p-0.5 border border-[#1b2b1e]">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                    style={{ width: `${currentWeapon.damage}%` }}
                  />
                </div>
              </div>

              {/* Range */}
              <div className="space-y-1 bg-[#0e1711] p-2.5 rounded-xl border border-[#223525]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-300">المدى والتصويب</span>
                  <span className="text-cyan-400 font-mono">{currentWeapon.range}/100</span>
                </div>
                <div className="h-2 bg-[#070d09] rounded-full overflow-hidden p-0.5 border border-[#1b2b1e]">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                    style={{ width: `${currentWeapon.range}%` }}
                  />
                </div>
              </div>

              {/* Reload */}
              <div className="space-y-1 bg-[#0e1711] p-2.5 rounded-xl border border-[#223525]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-300">سرعة التلقيم</span>
                  <span className="text-amber-400 font-mono">{currentWeapon.reload}/100</span>
                </div>
                <div className="h-2 bg-[#070d09] rounded-full overflow-hidden p-0.5 border border-[#1b2b1e]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                    style={{ width: `${currentWeapon.reload}%` }}
                  />
                </div>
              </div>

              {/* Mag Size */}
              <div className="space-y-1 bg-[#0e1711] p-2.5 rounded-xl border border-[#223525]">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-300">سعة الخزنة</span>
                  <span className="text-emerald-400 font-mono">{currentWeapon.magSize} طلقة</span>
                </div>
                <div className="h-2 bg-[#070d09] rounded-full overflow-hidden p-0.5 border border-[#1b2b1e]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                    style={{ width: `${Math.min(100, currentWeapon.magSize * 2.5)}%` }}
                  />
                </div>
              </div>
            </div>

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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {weapons.map((w) => {
                const isSelected = w.id === selectedWeaponId;
                const isPrim = w.id === equippedPrimary;
                const isSec = w.id === equippedSecondary;

                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      soundManager.playButtonClick();
                      haptics.light();
                      setSelectedWeaponId(w.id);
                    }}
                    className={`bg-[#121c15] p-3 rounded-2xl border text-right cursor-pointer transition-all flex flex-col justify-between select-none ${
                      isSelected
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20 scale-[1.02] bg-[#1a291f]'
                        : 'border-[#223525] hover:border-[#38533d] hover:bg-[#16251c]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] bg-black/60 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-[#233526]">
                        LVL {w.level}
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

                    <div className="my-2 h-14 flex items-center justify-center bg-[#070e0a] rounded-xl border border-[#1a291e] overflow-hidden p-1.5 relative group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      {w.id === 'desert_eagle_gold' ? (
                        <WeaponSpriteSVG weapon="desert_eagle_gold" className="w-16 h-10 filter drop-shadow-[0_2px_4px_rgba(250,204,21,0.3)] transition-transform group-hover:scale-110" />
                      ) : (
                        <WeaponSpriteSVG weapon={w.id} className="w-16 h-10 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-110" />
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-black text-white truncate">{w.name}</h5>
                      <span className="text-[10px] text-gray-400 block truncate">{w.nameEn}</span>
                    </div>

                    <div className="mt-2 pt-1 border-t border-[#1d2d20] flex items-center justify-between text-[10px]">
                      <span className="text-red-400 font-bold">ضرر: {w.damage}</span>
                      <span className="text-cyan-400 font-bold">مدى: {w.range}</span>
                    </div>
                  </div>
                );
              })}
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
  );
}
