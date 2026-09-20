/**
 * Realistic 3D Weapon Skin Preview Carousel Component for ArmoryScreen
 * Features color-coded rarity borders/tags (Common, Rare, Epic, Legendary, Mythic),
 * realistic 3D perspective tilt, metallic lighting shaders, and extensive skins for all weapons.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  Palette,
  Zap,
  Rotate3d,
  Layers,
  Flame,
  Star,
  Eye,
  SunMedium,
  RotateCcw,
  Compass,
  Play,
  Pause,
  Target,
  Moon,
  Cpu,
  Sun,
  MapPin,
} from 'lucide-react';
import { WeaponItem } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { settingsManager } from '../../utils/settingsManager';
import { haptics } from '../../utils/haptics';
import { WeaponSpriteSVG } from '../../game/weaponSprites';

export type SkinRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type ArmoryEnvironmentId = 'training_range' | 'night_ops' | 'cyber_tech' | 'desert_outpost';

export interface ArmoryEnvironment {
  id: ArmoryEnvironmentId;
  name: string;
  nameEn: string;
  icon: any;
  ambientDescription: string;
  lightingTone: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
  floorColor: string;
  specularColor: string;
}

export const ARMORY_ENVIRONMENTS: ArmoryEnvironment[] = [
  {
    id: 'training_range',
    name: 'ساحة تدريب عسكرية',
    nameEn: 'Military Training Range',
    icon: Target,
    ambientDescription: 'إضاءة استوديو عسكرية داخلية متوازنة لاختبار الأسلحة',
    lightingTone: 'إضاءة نهارية محايدة (5500K Neutral)',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
    accentColor: '#10b981',
    floorColor: 'rgba(16, 185, 129, 0.08)',
    specularColor: 'rgba(255, 255, 255, 0.75)',
  },
  {
    id: 'night_ops',
    name: 'منطقة عسكرية ليلية',
    nameEn: 'Night Ops Stealth Zone',
    icon: Moon,
    ambientDescription: 'إضاءة قمرية كحلية وظلال خافتة لاختبار التخفي والتكتيك الليلي',
    lightingTone: 'إضاءة زرقاء كحلية ليلية (Night Blue / Moonlight)',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-300',
    accentColor: '#3b82f6',
    floorColor: 'rgba(59, 130, 246, 0.12)',
    specularColor: 'rgba(147, 197, 253, 0.85)',
  },
  {
    id: 'cyber_tech',
    name: 'خلفية تقنية سايبر 3D',
    nameEn: 'Cyber Tech Lab',
    icon: Cpu,
    ambientDescription: 'شبكة ليزرية رقمية مع أضواء نيون سايبربانك وبريق كهربائي',
    lightingTone: 'أضواء نيون سماوية وفلورية (Cyan Tech Glow)',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300',
    accentColor: '#06b6d4',
    floorColor: 'rgba(6, 182, 212, 0.15)',
    specularColor: 'rgba(103, 232, 249, 0.9)',
  },
  {
    id: 'desert_outpost',
    name: 'مخفر صحراوي مشمس',
    nameEn: 'Desert Sun Outpost',
    icon: Sun,
    ambientDescription: 'شمس صحراوية حارقة مع انعكاسات كهرمانية ولمعان ترابي ذهبي',
    lightingTone: 'إضاءة شمس دافئة كهرمانية (Amber Sunflare)',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-300',
    accentColor: '#f59e0b',
    floorColor: 'rgba(245, 158, 11, 0.12)',
    specularColor: 'rgba(254, 240, 138, 0.85)',
  },
];

export interface WeaponSkin {
  id: string;
  name: string;
  nameEn: string;
  rarity: SkinRarity;
  material3D: string;
  colorGradient: string;
  accentColor: string;
  glowColor: string;
  perk: string;
  description: string;
}

// Comprehensive Realistic 3D Skins for Every Weapon in the Armory
export const WEAPON_SKINS: Record<string, WeaponSkin[]> = {
  sniper: [
    {
      id: 'standard',
      name: 'الطلاء الميداني التكتيكي',
      nameEn: 'Standard Tactical Camo',
      rarity: 'common',
      material3D: 'سبائك ألمنيوم عسكرية مطفأة (Military Matte Alloy)',
      colorGradient: 'from-neutral-800 to-neutral-950',
      accentColor: '#4ade80',
      glowColor: '#16a34a',
      perk: 'طراز المصنع العسكري مع عدسة منظار متعددة الطبقات',
      description: 'الطلاء الرسمي لقناصة النخبة بلمسات تمويه خضراء تكتيكية.',
    },
    {
      id: 'obsidian',
      name: 'فولاذ الشفق الأسود 3D',
      nameEn: 'Obsidian Carbon Stealth',
      rarity: 'rare',
      material3D: 'ألياف كربون مجسمة 3D تمتص الرادار (Radar-Absorbent Carbon)',
      colorGradient: 'from-neutral-950 via-zinc-900 to-neutral-950',
      accentColor: '#38bdf8',
      glowColor: '#0284c7',
      perk: '+12% سرعة تثبيت المنظار في الظلام',
      description: 'هيكل مضلع من ألياف الكربون مع مسارات ليزر تكتيكية زرقاء.',
    },
    {
      id: 'neon',
      name: 'سايبر نيون بولاريس 3D',
      nameEn: 'Cyber Polaris Plasma',
      rarity: 'epic',
      material3D: 'هيكل بوليمر سايبربانك مع مسارات بلازما مضيئة (Luminescent Plasma)',
      colorGradient: 'from-cyan-950 via-teal-900 to-blue-950',
      accentColor: '#00daf3',
      glowColor: '#06b6d4',
      perk: '+15% مدى رؤية حرارية وتصويب فائق الدقة',
      description: 'تدرج نيون أزرق وسيان مشع ينبض بالطاقة في خضم المعارك.',
    },
    {
      id: 'gold',
      name: 'الذهب الملكي الخالص 24K',
      nameEn: 'Royal Sovereign 24K Gold',
      rarity: 'legendary',
      material3D: 'صفائح ذهب عيار 24 مصقولة عاكسة للضوء (Mirror-Polished 24K Gold)',
      colorGradient: 'from-amber-700 via-yellow-500 to-amber-900',
      accentColor: '#facc15',
      glowColor: '#eab308',
      perk: 'هيبة ملكية مطلقة مع شعار النخبة ووميض ذهبي عند القنص',
      description: 'سلاح المراسم الملكية مذهب بالكامل بنقوش عربية هندسية بديعة.',
    },
    {
      id: 'inferno',
      name: 'لهب التنين البركاني 3D',
      nameEn: 'Volcanic Dragon Breath',
      rarity: 'mythic',
      material3D: 'فولاذ دمشقي بركاني محفور حرارياً بالليزر (Damascus Magma Steel)',
      colorGradient: 'from-red-950 via-rose-900 to-orange-950',
      accentColor: '#f43f5e',
      glowColor: '#e11d48',
      perk: 'تأثير إقصاء بركاني ناري مع شظايا جمر ملتهبة',
      description: 'هيكل محفور بلهب الصهارة البركانية ينبض بحمم النار المتوهجة.',
    },
  ],

  rocket: [
    {
      id: 'standard',
      name: 'الزيتوني العسكري القياسي',
      nameEn: 'Standard Olive Drab RPG',
      rarity: 'common',
      material3D: 'حديد عسكري مصفح ومقاوم للحرارة (Heat-Shielded Iron)',
      colorGradient: 'from-neutral-800 to-stone-950',
      accentColor: '#84cc16',
      glowColor: '#65a30d',
      perk: 'أنبوب إطلاق متين ذو موثوقية ميدانية عالية',
      description: 'الطلاء المعتمد لسلاح الآر بي جي الميداني الكلاسيكي.',
    },
    {
      id: 'hazard',
      name: 'التحذير الإشعاعي الحيوي',
      nameEn: 'Biohazard Yellow Stripe',
      rarity: 'rare',
      material3D: 'طلاء صناعي مقاوم للمواد الكيميائية (Hazard-Resistant Enamel)',
      colorGradient: 'from-yellow-950 via-neutral-900 to-stone-900',
      accentColor: '#eab308',
      glowColor: '#ca8a04',
      perk: '+10% نصف قطر تفجير بصري',
      description: 'خطوط تحذير صفراء وسوداء تكتيكية تدل على حمولة فتاكة.',
    },
    {
      id: 'neon',
      name: 'البلازما التكتيكية الكونية',
      nameEn: 'Cosmic Pulse Launcher',
      rarity: 'epic',
      material3D: 'سبائك تيتانيوم مشعة بأشعة الغاما (Titanium Gamma Alloy)',
      colorGradient: 'from-purple-950 via-indigo-900 to-neutral-950',
      accentColor: '#c084fc',
      glowColor: '#a855f7',
      perk: 'ذيل صاروخي نيون بنفسجي أثناء التحليق',
      description: 'قاذف مستقبلي يطلق رؤوساً حرارية مشحونة بنبضات البلازما.',
    },
    {
      id: 'gold',
      name: 'القاذف الملكي المذهب 24K',
      nameEn: 'Imperial Gold RPG-7',
      rarity: 'legendary',
      material3D: 'طلاء ذهبي براق مع رأس حربي من التيتانيوم المذهب (24K Gold Plated)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-800',
      accentColor: '#fbbf24',
      glowColor: '#f59e0b',
      perk: 'وميض تفجير ذهبي أسطوري يلفت الأنظار في ساحة المعركة',
      description: 'صمم خصيصاً للقادة العسكريين في احتفالات النصر الكبرى.',
    },
    {
      id: 'inferno',
      name: 'جحيم الحمم النووية',
      nameEn: 'Nuclear Core Meltdown',
      rarity: 'mythic',
      material3D: 'درع حراري مضاد للصهر النووي (Thermal Core Exchanger)',
      colorGradient: 'from-rose-950 via-red-900 to-stone-950',
      accentColor: '#fb7185',
      glowColor: '#f43f5e',
      perk: 'دخان احتراق بركاني مع وهج أحمر متفجر',
      description: 'يحمل قوة تفجيرية تذيب الدروع بمجرد الاقتراب من نقطة الاصطدام.',
    },
  ],

  shotgun: [
    {
      id: 'standard',
      name: 'الشوزن الكلاسيكي الخشبي',
      nameEn: 'Classic Walnut Pump',
      rarity: 'common',
      material3D: 'خشب الجوز المعالج وفولاذ أسود مصقول (Treated Walnut & Steel)',
      colorGradient: 'from-stone-800 to-neutral-900',
      accentColor: '#a8a29e',
      glowColor: '#78716c',
      perk: 'مقبض خشبي كلاسيكي وثبات ممتاز أثناء الإطلاق السريع',
      description: 'بندقية صيد واقتحام كلاسيكية تم اختبارها في أقسى الظروف.',
    },
    {
      id: 'obsidian',
      name: 'شوزن الاقتحام الليلي 3D',
      nameEn: 'Night Stalker Carbon',
      rarity: 'rare',
      material3D: 'كربون تكتيكي مضاد للخدوش والانعكاس (Scratch-Proof Carbon)',
      colorGradient: 'from-neutral-900 to-zinc-950',
      accentColor: '#38bdf8',
      glowColor: '#0ea5e9',
      perk: 'طلاء مطفأ يمنع كشف مكانك في الممرات المعتمة',
      description: 'مخصص لوحدات الـ SWAT وفرق الاقتحام السريع الليلية.',
    },
    {
      id: 'neon',
      name: 'سايبر بانك فابور ويف',
      nameEn: 'Vaporwave Neon Blast',
      rarity: 'epic',
      material3D: 'سبائك كروم عاكسة مع أضواء نيون أرجوانية (Chroma Neon)',
      colorGradient: 'from-fuchsia-950 via-purple-900 to-cyan-950',
      accentColor: '#e879f9',
      glowColor: '#d946ef',
      perk: '+10% سرعة تلقيم الخراطيش التكتيكية',
      description: 'تصميم جريء ومستقبلي بألوان النيون الأرجوانية والسيان.',
    },
    {
      id: 'gold',
      name: 'الشوزن الذهبي الإمبراطوري 24K',
      nameEn: 'Imperial Gilded Shotgun',
      rarity: 'legendary',
      material3D: 'ذهب ملكي مصفح مع نقوش نباتية دقيقة (Engraved 24K Gold)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-900',
      accentColor: '#fbbf24',
      glowColor: '#d97706',
      perk: 'شظايا نارية مذهبة تضيء المكان عند كل إطلاق',
      description: 'قطعة فنية نادرة تجمع بين قوة التدمير والجمال الأسطوري.',
    },
  ],

  dual_uzi: [
    {
      id: 'standard',
      name: 'الطلاء الفولاذي القياسي',
      nameEn: 'Standard Anodized Steel',
      rarity: 'common',
      material3D: 'فولاذ مجلفن مقاوم لارتفاع درجات الحرارة (Anodized Steel)',
      colorGradient: 'from-neutral-800 to-neutral-950',
      accentColor: '#94a3b8',
      glowColor: '#64748b',
      perk: 'توازن خفيف وسرعة استجابة فائقة',
      description: 'الطلاء الأصلي للمسدسات الرشاشة المزدوجة.',
    },
    {
      id: 'neon',
      name: 'الوميض السايبراني المزدوج',
      nameEn: 'Dual Cyber Matrix',
      rarity: 'epic',
      material3D: 'دوائر إلكترونية مطبوعة وأضواء سيان (Cybernetic PCB Shell)',
      colorGradient: 'from-cyan-950 via-teal-900 to-slate-900',
      accentColor: '#22d3ee',
      glowColor: '#0891b2',
      perk: 'كثافة نيران مضاعفة مع إشعاع ليزري تكتيكي',
      description: 'سلاحان رشاشان مستقبليان ينبضان بخطوط بيانات متدفقة.',
    },
    {
      id: 'gold',
      name: 'ثنائي الذهب الملكي 24K',
      nameEn: 'Twin Sovereigns 24K Gold',
      rarity: 'legendary',
      material3D: 'ذهب عيار 24 خالص مع مقابض لؤلؤية فاخرة (Gold & Mother-of-Pearl)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-800',
      accentColor: '#facc15',
      glowColor: '#ca8a04',
      perk: 'سلاحان مذهبان بالكامل مع رنين طلقات ذهبية',
      description: 'رمز الثراء والقوة في أيدي قادة المعارك الأكثر مهارة.',
    },
    {
      id: 'inferno',
      name: 'العاصفة النارية المزدوجة',
      nameEn: 'Twin Dragon Blood',
      rarity: 'mythic',
      material3D: 'سبائك بركانية محفورة بدم التنين (Molten Core Alloys)',
      colorGradient: 'from-red-950 via-rose-900 to-neutral-950',
      accentColor: '#f43f5e',
      glowColor: '#be123c',
      perk: 'لهب يخرج من الفوهة المزدوجة مع تأثير احتراق فوري',
      description: 'كثافة نيران خارقة تلتهم دروع الخصوم بحرارة بركانية.',
    },
  ],

  m4_rifle: [
    {
      id: 'standard',
      name: 'التمويه التكتيكي للقوات الخاصة',
      nameEn: 'Spec-Ops Woodland Camo',
      rarity: 'common',
      material3D: 'بوليمر عسكري مقاوم للرطوبة والصدمات (Military Polymer)',
      colorGradient: 'from-neutral-800 to-neutral-900',
      accentColor: '#4ade80',
      glowColor: '#16a34a',
      perk: 'أفضل توازن ميداني لجميع تضاريس المعركة',
      description: 'الطلاء المعتمد لفرق التدخل السريع في الغابات والمدن.',
    },
    {
      id: 'obsidian',
      name: 'الشبح الأسود التكتيكي 3D',
      nameEn: 'Blackout Stealth Edition',
      rarity: 'rare',
      material3D: 'تيتانيوم أسود مطفأ غير عاكس (Anti-Reflective Black Titanium)',
      colorGradient: 'from-zinc-950 to-neutral-950',
      accentColor: '#38bdf8',
      glowColor: '#0284c7',
      perk: '+10% سرعة تصويب وتخفيف الارتداد',
      description: 'طلاء شبحي أسود بالكامل مصمم لمهام التسلل والاقتحام الصامت.',
    },
    {
      id: 'gold',
      name: 'بندقية القائد المذهبة 24K',
      nameEn: 'Commander Golden M4',
      rarity: 'legendary',
      material3D: 'فولاذ مذهب بصفائح الذهب الخالص مع نقوش ماسية (Gilded Damascus)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-900',
      accentColor: '#fbbf24',
      glowColor: '#d97706',
      perk: 'شعار النخبة الذهبي مع دقة إطلاق خارقة',
      description: 'تمنح لأبرز المقاتلين تقديراً لإنجازاتهم العسكرية الاستثنائية.',
    },
    {
      id: 'inferno',
      name: 'الجحيم التكتيكي الهجومي',
      nameEn: 'Molten Core M4A1',
      rarity: 'mythic',
      material3D: 'سبائك مشتعلة بحرارة مستمرة (Self-Igniting Core)',
      colorGradient: 'from-rose-950 via-orange-900 to-neutral-950',
      accentColor: '#fb7185',
      glowColor: '#e11d48',
      perk: 'شرارات نارية متطايرة مع طلقات خارقة للدروع',
      description: 'سلاح هجومي متفجر يمزق دفاعات العدو في لمح البصر.',
    },
  ],

  saw_gun: [
    {
      id: 'standard',
      name: 'الحديد الصناعي الثقيل',
      nameEn: 'Heavy Industrial Steel',
      rarity: 'common',
      material3D: 'فولاذ ثقيل مصفح ومقاوم للتآكل (Heavy Industrial Cast)',
      colorGradient: 'from-neutral-800 to-zinc-900',
      accentColor: '#94a3b8',
      glowColor: '#64748b',
      perk: 'تبريد هوائي ممتاز للمنشار الدائري وخزنة الذخيرة',
      description: 'الطلاء الصناعي القوي لسلاح المنشار الثقيل.',
    },
    {
      id: 'gold',
      name: 'المنشار الملكي الذهبي 24K',
      nameEn: 'Golden Saw Devastator',
      rarity: 'legendary',
      material3D: 'شفرات منشار ماسية مذهبة بذهب 24 قيراط (Diamond-Tipped 24K)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-900',
      accentColor: '#facc15',
      glowColor: '#ca8a04',
      perk: 'دوران ماسي فتاك مع هيبة لا تقاوم',
      description: 'آلة تدمير لا ترحم مطلية بالذهب الملكي الخالص.',
    },
    {
      id: 'inferno',
      name: 'منشار الجحيم المشتعل',
      nameEn: 'Hellfire Heavy Saw',
      rarity: 'mythic',
      material3D: 'شفرات صهارة بركانية لا تنطفئ (Everlasting Magma Blades)',
      colorGradient: 'from-red-950 via-rose-900 to-orange-950',
      accentColor: '#f43f5e',
      glowColor: '#e11d48',
      perk: 'حلقة شفرات لهبية تذيب الحواجز والدروع فوراً',
      description: 'تم حرق هذه الشفرات في أعماق البراكين لتقطيع أي حاجز أمامها.',
    },
  ],

  riot_shield: [
    {
      id: 'standard',
      name: 'الدرع البوليمري التكتيكي',
      nameEn: 'Tactical Polycarbonate Shield',
      rarity: 'common',
      material3D: 'بوليمر شفاف فائق القوة ومقاوم للرصاص (High-Impact Polycarbonate)',
      colorGradient: 'from-neutral-800 to-slate-900',
      accentColor: '#38bdf8',
      glowColor: '#0284c7',
      perk: 'نافذة رؤية واضحة لحماية كامل الجسم',
      description: 'الدرع القياسي لقوات مكافحة الشغب والعمليات الخاصة.',
    },
    {
      id: 'obsidian',
      name: 'درع الكربون الشبحي 3D',
      nameEn: 'Carbon Fiber Aegis',
      rarity: 'rare',
      material3D: 'صفائح كربون منسوجة 3D تمتص الصدمات (Shock-Absorbing Carbon)',
      colorGradient: 'from-neutral-950 to-zinc-900',
      accentColor: '#22d3ee',
      glowColor: '#0891b2',
      perk: '+15% مقاومة للانفجارات والشظايا المرتدة',
      description: 'درع أسود خفيف الوزن وفائق المتانة لصد الرصاص الثقيل.',
    },
    {
      id: 'gold',
      name: 'درع الحارس الملكي الذهبي 24K',
      nameEn: 'Royal Guard Aegis 24K',
      rarity: 'legendary',
      material3D: 'سبائك تيتانيوم مذهبة بالكامل عيار 24 قيراط (24K Gold Titanium)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-900',
      accentColor: '#facc15',
      glowColor: '#d97706',
      perk: 'تأثير ارتداد ذهبي براق عند اصطدام رصاص الأعداء',
      description: 'رمز الحماية المطلقة المحفور بشعارات الصمود العسكري.',
    },
  ],

  desert_eagle_gold: [
    {
      id: 'standard',
      name: 'الذهب الكلاسيكي المصقول',
      nameEn: 'Classic Polished Gold',
      rarity: 'legendary',
      material3D: 'ذهب عيار 24 مصقول بلمعة كلاسيكية (Polished 24K Gold)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-800',
      accentColor: '#fbbf24',
      glowColor: '#d97706',
      perk: 'قوة فتاكة وضرر خارق مع صوت إطلاق مدوٍ',
      description: 'النسخة الأصلية المذهبة من مسدس الديزرت إيجل الأسطوري.',
    },
    {
      id: 'obsidian',
      name: 'الشفق الأسود والأحمر 3D',
      nameEn: 'Obsidian Crimson Eagle',
      rarity: 'epic',
      material3D: 'فولاذ أسود مطفأ مع خطوط حمراء محفورة (Engraved Crimson Steel)',
      colorGradient: 'from-neutral-950 via-zinc-900 to-red-950',
      accentColor: '#f43f5e',
      glowColor: '#e11d48',
      perk: '+10% سرعة سحب السلاح وتوجيه الفوهة',
      description: 'مظهر مهيب يجمع بين سواد الكربون وخطوط اللهب الحمراء.',
    },
    {
      id: 'inferno',
      name: 'لهب الصقر البركاني',
      nameEn: 'Volcanic Falcon Meltdown',
      rarity: 'mythic',
      material3D: 'فولاذ دمشقي منساب بحمم مشتعلة (Flowing Magma Damascus)',
      colorGradient: 'from-rose-950 via-orange-900 to-amber-950',
      accentColor: '#f97316',
      glowColor: '#ea580c',
      perk: 'طلقات متوهجة تشعل النار في محيط الهدف',
      description: 'أقوى مسدس يدوي في ساحة المعركة محمل بحرارة بركانية مستمرة.',
    },
  ],

  default: [
    {
      id: 'standard',
      name: 'الطلاء الميداني القياسي',
      nameEn: 'Standard Factory Finish',
      rarity: 'common',
      material3D: 'فولاذ عسكري متين مطفأ (Matte Military Steel)',
      colorGradient: 'from-neutral-700 to-neutral-900',
      accentColor: '#737373',
      glowColor: '#525252',
      perk: 'طراز المصنع العسكري الأصلي',
      description: 'الطلاء الرسمي المعتمد لفرق القتال في الخطوط الأمامية.',
    },
    {
      id: 'obsidian',
      name: 'فولاذ الشفق الأسود 3D',
      nameEn: 'Obsidian Stealth Carbon',
      rarity: 'rare',
      material3D: 'كربون تكتيكي مضاد لارتداد الضوء (Anti-Glare Carbon)',
      colorGradient: 'from-neutral-950 via-zinc-900 to-neutral-950',
      accentColor: '#38bdf8',
      glowColor: '#0284c7',
      perk: '+10% خفاء بصري في الظلال',
      description: 'فولاذ أسود مطفأ يمتص الأشعة مع خطوط تكتيكية زرقاء.',
    },
    {
      id: 'neon',
      name: 'سايبر نيون السيان 3D',
      nameEn: 'Cyber Neon Cyan',
      rarity: 'epic',
      material3D: 'بوليمر مضيء مع خطوط طاقة كهرومغناطيسية (Electroluminescent)',
      colorGradient: 'from-cyan-950 via-teal-900 to-blue-950',
      accentColor: '#00daf3',
      glowColor: '#06b6d4',
      perk: '+15% سرعة تبديل السلاح',
      description: 'طلاء سايبربانك متطور مع مسارات طاقة زرقاء مضيئة.',
    },
    {
      id: 'gold',
      name: 'الذهب الملكي الخالص 24K',
      nameEn: 'Royal Gold 24K Edition',
      rarity: 'legendary',
      material3D: 'صفائح ذهب عيار 24 مصقولة بدرجة مرآة (24K Mirror Gold)',
      colorGradient: 'from-amber-600 via-yellow-400 to-amber-800',
      accentColor: '#fbbf24',
      glowColor: '#d97706',
      perk: 'هيبة ميدانية مضاعفة + شعار النخبة',
      description: 'مذهب بصفائح الذهب الخالص عيار 24 مع نقوش ملكية فاخرة.',
    },
    {
      id: 'inferno',
      name: 'لهب الجحيم التكتيكي 3D',
      nameEn: 'Inferno Flame Etched',
      rarity: 'mythic',
      material3D: 'فولاذ بركاني محفور بحمم الصهارة (Magma-Infused Damascus)',
      colorGradient: 'from-red-950 via-rose-900 to-orange-950',
      accentColor: '#f43f5e',
      glowColor: '#e11d48',
      perk: 'تأثير إقصاء بركاني ناري في ساحة القتال',
      description: 'نقش لهبي برتقالي وأحمر محفور بالليزر لحروب الصحراء.',
    },
  ],
};

interface WeaponSkinCarouselProps {
  weapon: WeaponItem;
  onSkinChanged?: (skinId: string) => void;
}

export const WeaponSkinCarousel: React.FC<WeaponSkinCarouselProps> = ({ weapon, onSkinChanged }) => {
  const settings = settingsManager.getSettings();
  const weaponSkinsMap = settings.weaponSkins || {};
  const currentEquippedSkinId = weaponSkinsMap[weapon.id] || 'standard';

  const availableSkins = WEAPON_SKINS[weapon.id] || WEAPON_SKINS.default;
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const idx = availableSkins.findIndex((s) => s.id === currentEquippedSkinId);
    return idx >= 0 ? idx : 0;
  });

  // Lighting Mode: 'pbr' (Physically Based Rendering) or 'toon' (Cartoon Game Lighting)
  const [lightingMode, setLightingMode] = useState<'pbr' | 'toon'>(
    () => settings.armoryLightingMode || 'pbr'
  );

  // Armory Lighting Environment Mode
  const [environmentId, setEnvironmentId] = useState<ArmoryEnvironmentId>(
    () => (settings.armoryEnvironment as ArmoryEnvironmentId) || 'training_range'
  );

  // 3D Perspective Rotation Angle (Interactive 360° Touch & Mouse Drag)
  const [rotationY, setRotationY] = useState(-15);
  const [rotationX, setRotationX] = useState(8);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startRotY: number;
    startRotX: number;
  }>({ startX: 0, startY: 0, startRotY: 0, startRotX: 0 });

  // 360-Degree Continuous Auto-Spin Loop
  useEffect(() => {
    if (!autoSpin || isDragging) return;
    let animId: number;
    const tick = () => {
      setRotationY((prev) => (prev + 0.65) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoSpin, isDragging]);

  // Global window listeners to gracefully release drag even outside the stage
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalRelease = () => {
      setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, [isDragging]);

  const activeSkin = availableSkins[selectedIndex] || availableSkins[0];
  const isEquipped = activeSkin.id === currentEquippedSkinId;

  // Normalized 0° to 359° Angle for Compass Dial & Facing Direction
  const normalizedAngle = Math.round(((rotationY % 360) + 360) % 360);
  const getFacingDirection = (deg: number) => {
    if (deg >= 315 || deg < 45) return 'الواجهة الأمامية 360° (Front)';
    if (deg >= 45 && deg < 135) return 'الجانب الأيمن (Right Profile)';
    if (deg >= 135 && deg < 225) return 'الجهة الخلفية 360° (Rear Reverse)';
    return 'الجانب الأيسر (Left Profile)';
  };

  // Touch and Mouse Event Handlers for 360° Continuous Rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    dragStartRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      startRotY: rotationY,
      startRotX: rotationX,
    };
    setIsDragging(true);
    setAutoSpin(false);
    setHasInteracted(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const t = e.touches[0];
    const deltaX = t.clientX - dragStartRef.current.startX;
    const deltaY = t.clientY - dragStartRef.current.startY;
    setRotationY(dragStartRef.current.startRotY + deltaX * 0.9);
    setRotationX(Math.max(-35, Math.min(35, dragStartRef.current.startRotX - deltaY * 0.5)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRotY: rotationY,
      startRotX: rotationX,
    };
    setIsDragging(true);
    setAutoSpin(false);
    setHasInteracted(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setRotationY(dragStartRef.current.startRotY + deltaX * 0.9);
    setRotationX(Math.max(-35, Math.min(35, dragStartRef.current.startRotX - deltaY * 0.5)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetAngle = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playButtonClick();
    haptics.light();
    setRotationY(-15);
    setRotationX(8);
    setAutoSpin(false);
  };

  const toggleAutoSpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playButtonClick();
    haptics.light();
    setAutoSpin((prev) => !prev);
  };

  const toggleLightingMode = (mode: 'pbr' | 'toon') => {
    soundManager.playButtonClick();
    haptics.light();
    setLightingMode(mode);
    settingsManager.updateSettings({ armoryLightingMode: mode });
  };

  const changeEnvironment = (envId: ArmoryEnvironmentId) => {
    soundManager.playButtonClick();
    haptics.light();
    setEnvironmentId(envId);
    settingsManager.updateSettings({ armoryEnvironment: envId });
  };

  const activeEnvironment =
    ARMORY_ENVIRONMENTS.find((e) => e.id === environmentId) || ARMORY_ENVIRONMENTS[0];

  const handlePrev = () => {
    soundManager.playButtonClick();
    haptics.light();
    setSelectedIndex((prev) => (prev === 0 ? availableSkins.length - 1 : prev - 1));
  };

  const handleNext = () => {
    soundManager.playButtonClick();
    haptics.light();
    setSelectedIndex((prev) => (prev === availableSkins.length - 1 ? 0 : prev + 1));
  };

  const handleEquip = () => {
    soundManager.playSwitchWeapon();
    haptics.medium();
    const updatedMap = { ...weaponSkinsMap, [weapon.id]: activeSkin.id };
    settingsManager.updateSettings({ weaponSkins: updatedMap });
    if (onSkinChanged) {
      onSkinChanged(activeSkin.id);
    }
  };

  // Helper for color-coded rarity styling: borders, tags, glows
  const getRarityVisuals = (rarity: SkinRarity) => {
    switch (rarity) {
      case 'mythic':
        return {
          borderClass: 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.45)] ring-1 ring-rose-500/50',
          tagClass: 'bg-rose-950/80 text-rose-300 border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
          badgeText: 'خرافي • MYTHIC ★★★',
          icon: <Flame size={12} className="text-rose-400 animate-pulse" />,
          shimmerEffect: 'bg-gradient-to-r from-rose-600 via-orange-500 to-red-600',
        };
      case 'legendary':
        return {
          borderClass: 'border-amber-400 shadow-[0_0_26px_rgba(251,191,36,0.45)] ring-1 ring-amber-400/50',
          tagClass: 'bg-amber-950/80 text-amber-300 border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
          badgeText: 'أسطوري • LEGENDARY ★★',
          icon: <Sparkles size={12} className="text-amber-400 animate-spin" />,
          shimmerEffect: 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600',
        };
      case 'epic':
        return {
          borderClass: 'border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.35)] ring-1 ring-purple-400/40',
          tagClass: 'bg-purple-950/80 text-purple-300 border-purple-400/70 shadow-[0_0_10px_rgba(192,132,252,0.25)]',
          badgeText: 'ملحمي • EPIC ★',
          icon: <Zap size={12} className="text-purple-400" />,
          shimmerEffect: 'bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-600',
        };
      case 'rare':
        return {
          borderClass: 'border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/30',
          tagClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.2)]',
          badgeText: 'نادر • RARE',
          icon: <Shield size={12} className="text-cyan-400" />,
          shimmerEffect: 'bg-gradient-to-r from-cyan-500 via-sky-300 to-cyan-600',
        };
      case 'common':
      default:
        return {
          borderClass: 'border-slate-600 shadow-[0_0_10px_rgba(148,163,184,0.15)]',
          tagClass: 'bg-slate-900/80 text-slate-300 border-slate-600',
          badgeText: 'شائع • COMMON',
          icon: <Layers size={12} className="text-slate-400" />,
          shimmerEffect: 'bg-gradient-to-r from-slate-600 to-neutral-700',
        };
    }
  };

  const rarityVisual = getRarityVisuals(activeSkin.rarity);

  return (
    <div
      className={`relative bg-gradient-to-br from-[#111c14] via-[#0c1510] to-[#070e0a] rounded-2xl p-4 sm:p-5 transition-all duration-500 ${rarityVisual.borderClass} border-2 overflow-hidden space-y-4 select-none`}
    >
      {/* Dynamic Ambient Glow Behind Card */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeSkin.glowColor }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: activeSkin.accentColor }}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-[#213524] pb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>معرض الأشكال والطلاءات ثلاثية الأبعاد 3D</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                تدوير 360° • PBR & Toon
              </span>
            </h4>
            <span className="text-[11px] text-gray-400 block mt-0.5">
              تبديل نمط الإضاءة وتدوير السلاح 360 درجة باللمس
            </span>
          </div>
        </div>

        {/* Rarity Tag & Counter */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border transition-all ${rarityVisual.tagClass}`}
          >
            {rarityVisual.icon}
            <span>{rarityVisual.badgeText}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-[#09130c] px-2.5 py-1 rounded-lg border border-emerald-500/40">
            {selectedIndex + 1} / {availableSkins.length}
          </span>
        </div>
      </div>

      {/* ENVIRONMENT SELECTION & LIGHTING TOOLBAR */}
      <div className="relative z-10 flex flex-col gap-2.5 bg-[#08120a] border border-[#1f3825] rounded-xl p-2.5 shadow-inner">
        {/* Top Row: Environment Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#142618] pb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-black text-white">
              <MapPin size={13} className="text-amber-400" />
              <span>بيئة العرض والإضاءة:</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${activeEnvironment.badgeBg} ${activeEnvironment.badgeBorder} ${activeEnvironment.badgeText}`}>
              {activeEnvironment.name}
            </span>
          </div>

          {/* Environment Selector Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 bg-[#040905] p-1 rounded-xl border border-neutral-800">
            {ARMORY_ENVIRONMENTS.map((env) => {
              const IconComponent = env.icon;
              const isSelected = env.id === environmentId;
              return (
                <button
                  key={env.id}
                  onClick={() => changeEnvironment(env.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? `${env.badgeBg} ${env.badgeBorder} ${env.badgeText} border shadow-md font-bold scale-[1.02]`
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  title={`${env.name} - ${env.ambientDescription}`}
                >
                  <IconComponent size={13} className={isSelected ? env.badgeText : 'text-gray-400'} />
                  <span className="truncate">{env.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Lighting Mode & 360 Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Toggle Button: Realistic PBR vs Classic Toon */}
          <div className="flex items-center gap-1 bg-[#040905] p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => toggleLightingMode('pbr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lightingMode === 'pbr'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-neutral-950 shadow-md shadow-amber-500/30 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="إضاءة واقعية فيزيائية PBR مع بريق معدني وظلال ناعمة"
            >
              <SunMedium size={14} className={lightingMode === 'pbr' ? 'animate-pulse text-neutral-950' : 'text-amber-400'} />
              <span>إضاءة واقعية (PBR)</span>
            </button>
            <button
              onClick={() => toggleLightingMode('toon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lightingMode === 'toon'
                  ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-neutral-950 shadow-md shadow-cyan-500/30 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="إضاءة كرتونية كلاسيكية بنمط ميني ميليشيا"
            >
              <Sparkles size={14} className={lightingMode === 'toon' ? 'text-neutral-950' : 'text-cyan-400'} />
              <span>إضاءة كرتونية (Toon)</span>
            </button>
          </div>

          {/* 360° Angle Compass & Controls */}
          <div className="flex items-center gap-2">
            {/* Compass & Degree Readout */}
            <div
              className="flex items-center gap-1.5 bg-[#040905] px-2.5 py-1.5 rounded-xl border border-neutral-800 text-[11px] font-mono text-gray-300"
              title={getFacingDirection(normalizedAngle)}
            >
              <Compass
                size={13}
                className="text-emerald-400 transition-transform duration-100"
                style={{ transform: `rotate(${normalizedAngle}deg)` }}
              />
              <span className="text-emerald-400 font-bold">360°</span>
              <span className="text-neutral-500">|</span>
              <span>{normalizedAngle}°</span>
            </div>

            {/* Auto-Spin 360° Toggle */}
            <button
              onClick={toggleAutoSpin}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black border transition-all cursor-pointer active:scale-95 ${
                autoSpin
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 text-gray-300 hover:text-white border-neutral-700'
              }`}
              title={autoSpin ? 'إيقاف الدوران التلقائي' : 'تشغيل دوران 360° مستمر'}
            >
              {autoSpin ? <Pause size={12} className="animate-pulse" /> : <Play size={12} />}
              <span>دوران 360°</span>
            </button>

            {/* Reset Angle Button */}
            <button
              onClick={handleResetAngle}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-gray-400 hover:text-white border border-neutral-700 shadow transition-all cursor-pointer active:scale-95"
              title="إعادة تعيين الزاوية إلى الواجهة الأمامية"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 3D WEAPON SHOWCASE STAGE (360° TOUCH & MOUSE ROTATION WITH ENVIRONMENT LIGHTING) */}
      <div
        className={`relative w-full rounded-2xl border overflow-hidden flex flex-col items-center justify-center min-h-[250px] select-none touch-none transition-all duration-700 p-4 sm:p-6 ${
          environmentId === 'training_range'
            ? lightingMode === 'pbr'
              ? 'bg-gradient-to-b from-[#0d1a10] via-[#08120a] to-[#040805] border-[#1e3a24] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]'
              : 'bg-[#080d09] border-emerald-950/80 [background-image:radial-gradient(#1e3a29_1px,transparent_1px)] [background-size:12px_12px]'
            : environmentId === 'night_ops'
            ? lightingMode === 'pbr'
              ? 'bg-gradient-to-b from-[#081224] via-[#040914] to-[#02050b] border-[#1e2e4f] shadow-[inset_0_0_60px_rgba(3,7,18,0.95)]'
              : 'bg-[#050b17] border-blue-950/80 [background-image:radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]'
            : environmentId === 'cyber_tech'
            ? lightingMode === 'pbr'
              ? 'bg-gradient-to-b from-[#051c24] via-[#031017] to-[#01080d] border-[#0e404f] shadow-[inset_0_0_60px_rgba(6,182,212,0.15)]'
              : 'bg-[#03131a] border-cyan-950/80 [background-image:radial-gradient(#0891b2_1px,transparent_1px)] [background-size:14px_14px]'
            : lightingMode === 'pbr'
            ? 'bg-gradient-to-b from-[#241607] via-[#140b03] to-[#0a0501] border-[#523311] shadow-[inset_0_0_60px_rgba(245,158,11,0.12)]'
            : 'bg-[#140b03] border-amber-950/80 [background-image:radial-gradient(#78350f_1px,transparent_1px)] [background-size:12px_12px]'
        }`}
      >
        {/* Dynamic Studio Ambient Glow & Environmental Atmosphere Floor */}
        {environmentId === 'training_range' && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(16,185,129,0.08)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
          </>
        )}
        {environmentId === 'night_ops' && (
          <>
            {/* Moonlight Spotlight from above */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(147,197,253,0.15)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] font-mono text-blue-400/70 pointer-events-none">
              <Moon size={11} />
              <span>رؤية ليلية تكتيكية • Night Stealth</span>
            </div>
          </>
        )}
        {environmentId === 'cyber_tech' && (
          <>
            {/* Cyber Grid Matrix */}
            <div className="absolute inset-0 [background:linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.14)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] font-mono text-cyan-400/80 pointer-events-none">
              <Cpu size={11} />
              <span>مختبر سايبر رقمي • Cyber Matrix</span>
            </div>
          </>
        )}
        {environmentId === 'desert_outpost' && (
          <>
            {/* Desert Sunflare Amber Flare */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(251,191,36,0.2)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(245,158,11,0.12)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] font-mono text-amber-400/80 pointer-events-none">
              <Sun size={11} />
              <span>إشعاع شمسي صحراوي • Desert Sun</span>
            </div>
          </>
        )}

        {/* Gesture Hint Pill */}
        {!hasInteracted && !isDragging && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/50 text-[11px] text-emerald-300 backdrop-blur-md animate-bounce shadow-lg">
            <Rotate3d size={13} className="text-emerald-400" />
            <span>اسحب باللمس للتدوير 360°</span>
          </div>
        )}

        {/* Facing Direction Badge */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="text-[10px] font-mono text-gray-400 bg-black/60 border border-neutral-800 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {getFacingDirection(normalizedAngle)}
          </span>
        </div>

        {/* 3D Perspective Weapon Stage with Touch/Mouse Drag */}
        <div
          className={`relative w-full flex items-center justify-center py-6 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ perspective: '1200px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute right-2 sm:right-4 z-20 p-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 shadow-xl transition-all cursor-pointer active:scale-95"
            title="الطلاء السابق"
          >
            <ChevronRight size={20} />
          </button>

          {/* 3D Floating Weapon Model Container */}
          <motion.div
            animate={{
              rotateY: rotationY,
              rotateX: rotationX,
              y: isDragging ? 0 : [0, -6, 0],
            }}
            transition={{
              rotateY: { duration: isDragging ? 0 : 0.1, ease: 'linear' },
              rotateX: { duration: isDragging ? 0 : 0.1, ease: 'easeOut' },
              y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            {/* Ambient Lighting Glow Behind Weapon (Dynamic per skin & environment) */}
            <div
              className={`absolute -inset-10 rounded-3xl opacity-35 pointer-events-none filter blur-xl ${
                lightingMode === 'pbr' ? 'animate-pulse' : ''
              }`}
              style={{
                background: `radial-gradient(circle, ${activeEnvironment.accentColor}40 0%, ${activeSkin.accentColor} 40%, transparent 70%)`,
              }}
            />

            {/* 3D Weapon Sprite with Dynamic Lighting, Environment Tint and Skin Hue */}
            <div
              className={`relative p-6 rounded-3xl transition-transform duration-100 flex items-center justify-center ${
                lightingMode === 'pbr'
                  ? 'filter drop-shadow-[0_22px_28px_rgba(0,0,0,0.85)]'
                  : 'filter drop-shadow-[4px_4px_0_rgba(0,0,0,0.9)]'
              }`}
              style={{
                transform: 'translateZ(40px)',
              }}
            >
              <WeaponSpriteSVG
                weapon={weapon.id}
                className="w-44 sm:w-60 h-28 sm:h-36 transition-all duration-200"
                skinId={activeSkin.id}
                lightingMode={lightingMode}
                environmentId={environmentId}
              />

              {/* Realistic 3D Metallic Sheen Glint Overlay (PBR mode only with environment color) */}
              {lightingMode === 'pbr' && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-45 mix-blend-overlay transition-all duration-100"
                  style={{
                    background: `linear-gradient(${115 + (normalizedAngle * 0.45)}deg, transparent 20%, ${activeEnvironment.specularColor} 45%, transparent 60%)`,
                  }}
                />
              )}

              {/* Reverse Side Indicator when inspecting backside (between 90° and 270°) */}
              {normalizedAngle > 90 && normalizedAngle < 270 && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/85 border border-amber-500/40 text-[9px] text-amber-300 font-mono tracking-wider pointer-events-none shadow"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  الجهة الخلفية 360°
                </div>
              )}
            </div>

            {/* 3D Ground Shadow with Environment Tint */}
            {lightingMode === 'pbr' ? (
              <div
                className="w-48 sm:w-64 h-5 rounded-full filter blur-md opacity-70 transition-all duration-100"
                style={{
                  backgroundColor: '#000000',
                  boxShadow: `0 0 15px ${activeEnvironment.floorColor}`,
                  transform: `translateZ(-30px) rotateX(75deg) translateX(${Math.sin((rotationY * Math.PI) / 180) * 14}px)`,
                }}
              />
            ) : (
              <div
                className="w-44 sm:w-56 h-4 rounded-full bg-black opacity-80 transition-all duration-100"
                style={{
                  transform: `translateZ(-25px) rotateX(75deg) translateX(${Math.sin((rotationY * Math.PI) / 180) * 12}px)`,
                }}
              />
            )}
          </motion.div>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute left-2 sm:left-4 z-20 p-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 shadow-xl transition-all cursor-pointer active:scale-95"
            title="الطلاء التالي"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Environmental & Lighting Mode Info Tags */}
        <div className="z-10 mb-1 flex flex-wrap items-center justify-center gap-2">
          {/* Environment Tone Tag */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${activeEnvironment.badgeBg} ${activeEnvironment.badgeBorder} ${activeEnvironment.badgeText}`}>
            {React.createElement(activeEnvironment.icon, { size: 12 })}
            <span>{activeEnvironment.name}: {activeEnvironment.lightingTone}</span>
          </div>

          {/* Lighting Mode Info Tag */}
          {lightingMode === 'pbr' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
              <SunMedium size={12} className="text-amber-400" />
              <span>إضاءة واقعية (PBR)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300">
              <Sparkles size={12} className="text-cyan-400" />
              <span>إضاءة كرتونية (Toon)</span>
            </div>
          )}
        </div>

        {/* 3D Weapon Name & Subtitle */}
        <div className="text-center z-10 space-y-1 mt-1">
          <div className="flex items-center justify-center gap-2">
            <h5 className="text-base sm:text-lg font-black text-white tracking-wide">
              {activeSkin.name}
            </h5>
          </div>
          <span className="text-xs text-gray-400 font-mono tracking-wider block">
            {activeSkin.nameEn}
          </span>
          {/* Material 3D Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-[11px] text-gray-300 mt-1">
            <Rotate3d size={12} className="text-emerald-400" />
            <span>خامة مجسمة: {activeSkin.material3D}</span>
          </div>
        </div>
      </div>

      {/* Skin Tactical Specs & Equip Bar */}
      <div className="bg-[#0a120c] border border-[#213524] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-1.5 text-right w-full sm:w-auto">
          <p className="text-xs text-gray-300 leading-relaxed">{activeSkin.description}</p>
          <div className="flex items-center gap-2 text-xs font-black text-amber-400">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>ميزة تجميلية قتالية: {activeSkin.perk}</span>
          </div>
        </div>

        {/* Equip Button */}
        <button
          onClick={handleEquip}
          disabled={isEquipped}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer shrink-0 active:scale-95 ${
            isEquipped
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default shadow-none'
              : 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 hover:brightness-110 text-neutral-950 border border-emerald-400/60'
          }`}
        >
          {isEquipped ? (
            <>
              <Check size={16} className="text-emerald-400 stroke-[3]" />
              <span>مجهز في المعركة حالياً ✓</span>
            </>
          ) : (
            <>
              <Zap size={16} className="fill-current" />
              <span>تجهيز الطلاء للسلاح</span>
            </>
          )}
        </button>
      </div>

      {/* Skin Swatch Selection Thumbnails with Rarity Rings */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {availableSkins.map((skin, idx) => {
          const isSelected = idx === selectedIndex;
          const isSkinEquipped =
            weaponSkinsMap[weapon.id] === skin.id || (idx === 0 && !weaponSkinsMap[weapon.id]);
          const skinVisual = getRarityVisuals(skin.rarity);

          return (
            <button
              key={skin.id}
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setSelectedIndex(idx);
              }}
              className={`group relative w-10 h-10 rounded-xl bg-gradient-to-br ${skin.colorGradient} transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md ${
                isSelected
                  ? `scale-110 ${skinVisual.borderClass} border-2`
                  : 'opacity-70 hover:opacity-100 border border-neutral-700'
              }`}
              title={`${skin.name} (${skinVisual.badgeText})`}
            >
              {/* Equipped checkmark badge */}
              {isSkinEquipped && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-black font-black text-[9px] rounded-full border border-black flex items-center justify-center shadow">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
