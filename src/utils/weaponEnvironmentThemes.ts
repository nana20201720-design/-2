import React from 'react';
import {
  Trees,
  Cpu,
  Flame,
  Crown,
  Snowflake,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';

export type WeaponBiomeId =
  | 'jungle_forest'
  | 'cyber_tech'
  | 'volcanic_molten'
  | 'royal_palace'
  | 'arctic_tundra';

export interface WeaponBiomeTheme {
  id: WeaponBiomeId;
  nameAr: string;
  nameEn: string;
  tagAr: string;
  descAr: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ambientRgb: string;
  glowColor: string;
  glowColorSoft: string;
  bgGradient: string;
  radialLighting: string;
  accentBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  particleType: 'leaves' | 'cyber_sparks' | 'embers' | 'gold_dust' | 'frost_snow';
  particleColors: string[];
  vignetteTint: string;
}

export const WEAPON_BIOMES: Record<WeaponBiomeId, WeaponBiomeTheme> = {
  jungle_forest: {
    id: 'jungle_forest',
    nameAr: 'بيئة الغابة التكتيكية',
    nameEn: 'Tactical Forest & Jungle',
    tagAr: 'تمويه وأسلحة ميدانية طبيعية',
    descAr: 'غطاء نباتي كثيف وإضاءة ظلال شجرية طبيعية تعزز أسلحة التمويه وبنادق الاقتحام الميدانية.',
    icon: Trees,
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    accentColor: '#34d399',
    ambientRgb: '16, 185, 129',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    glowColorSoft: 'rgba(5, 150, 105, 0.18)',
    bgGradient: 'from-[#07190d] via-[#041008] to-[#020704]',
    radialLighting: 'radial-gradient(circle at 50% 12%, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.12) 40%, transparent 75%)',
    accentBorder: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/70',
    badgeBorder: 'border-emerald-500/60',
    badgeText: 'text-emerald-300',
    particleType: 'leaves',
    particleColors: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#a7f3d0', '#84cc16'],
    vignetteTint: 'rgba(4, 25, 13, 0.65)',
  },

  cyber_tech: {
    id: 'cyber_tech',
    nameAr: 'بيئة التقنية والليزر السايبر',
    nameEn: 'Cyber Laser & Energy Lab',
    tagAr: 'أسلحة ليزرية وطاقة وبلازما',
    descAr: 'مختبر أبحاث متطور مع نبضات ليزرية زرقاء وشبكات نيون رقمية تحتضن الأسلحة الخارقة عالية التردد.',
    icon: Cpu,
    primaryColor: '#00daf3',
    secondaryColor: '#0284c7',
    accentColor: '#38bdf8',
    ambientRgb: '0, 218, 243',
    glowColor: 'rgba(0, 218, 243, 0.48)',
    glowColorSoft: 'rgba(2, 132, 199, 0.20)',
    bgGradient: 'from-[#031c2b] via-[#020f18] to-[#02060b]',
    radialLighting: 'radial-gradient(circle at 50% 12%, rgba(0, 218, 243, 0.28) 0%, rgba(2, 132, 199, 0.14) 42%, transparent 75%)',
    accentBorder: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-950/70',
    badgeBorder: 'border-cyan-500/60',
    badgeText: 'text-cyan-300',
    particleType: 'cyber_sparks',
    particleColors: ['#00daf3', '#38bdf8', '#06b6d4', '#67e8f9', '#818cf8', '#ffffff'],
    vignetteTint: 'rgba(2, 18, 30, 0.65)',
  },

  volcanic_molten: {
    id: 'volcanic_molten',
    nameAr: 'بيئة الحمم البركانية المتفجرة',
    nameEn: 'Volcanic Molten & Explosives',
    tagAr: 'قواذف الصواريخ والأسلحة النارية',
    descAr: 'جمر بركاني متصاعد وحرارة ملتهبة تحاكي القدرة التدميرية الهائلة للقذائف وقواذف RPG والأسلحة الثقيلة.',
    icon: Flame,
    primaryColor: '#ef4444',
    secondaryColor: '#ea580c',
    accentColor: '#f97316',
    ambientRgb: '239, 68, 68',
    glowColor: 'rgba(239, 68, 68, 0.48)',
    glowColorSoft: 'rgba(234, 88, 12, 0.20)',
    bgGradient: 'from-[#260907] via-[#140504] to-[#080202]',
    radialLighting: 'radial-gradient(circle at 50% 12%, rgba(239, 68, 68, 0.26) 0%, rgba(234, 88, 12, 0.13) 40%, transparent 75%)',
    accentBorder: 'border-red-500/40',
    badgeBg: 'bg-red-950/70',
    badgeBorder: 'border-red-500/60',
    badgeText: 'text-red-300',
    particleType: 'embers',
    particleColors: ['#ef4444', '#f97316', '#fb923c', '#fdba74', '#ea580c', '#ffffff'],
    vignetteTint: 'rgba(38, 8, 6, 0.65)',
  },

  royal_palace: {
    id: 'royal_palace',
    nameAr: 'بيئة قصر الذهب والسيادة الملكية',
    nameEn: 'Royal Sovereign Gold Vault',
    tagAr: 'الأسلحة الملكية والنسخ المذهبة النادرة',
    descAr: 'أجواء فخمة تتلألأ بهالات ذهبية وأشعة براقة مخصصة لبندقية القنص الكبرى ونسخ الديزرت إيجل المذهبة الأسطورية.',
    icon: Crown,
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    accentColor: '#facc15',
    ambientRgb: '245, 158, 11',
    glowColor: 'rgba(245, 158, 11, 0.50)',
    glowColorSoft: 'rgba(217, 119, 6, 0.22)',
    bgGradient: 'from-[#231504] via-[#120a02] to-[#060401]',
    radialLighting: 'radial-gradient(circle at 50% 12%, rgba(245, 158, 11, 0.30) 0%, rgba(217, 119, 6, 0.14) 42%, transparent 75%)',
    accentBorder: 'border-amber-400/40',
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-400/60',
    badgeText: 'text-amber-300',
    particleType: 'gold_dust',
    particleColors: ['#f59e0b', '#facc15', '#fbbf24', '#fef08a', '#d97706', '#ffffff'],
    vignetteTint: 'rgba(35, 21, 4, 0.65)',
  },

  arctic_tundra: {
    id: 'arctic_tundra',
    nameAr: 'بيئة التندرا القطبية الجليدية',
    nameEn: 'Sub-Zero Arctic Tundra',
    tagAr: 'دروع الصد ومعدات التكتيك القطبية',
    descAr: 'صقيع قطبي أزرق وبلورات ثلجية متناثرة مخصصة لدروع الصد التكتيكية والعتاد الدفاعي فائق التحمل.',
    icon: Snowflake,
    primaryColor: '#38bdf8',
    secondaryColor: '#0284c7',
    accentColor: '#7dd3fc',
    ambientRgb: '56, 189, 248',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    glowColorSoft: 'rgba(2, 132, 199, 0.18)',
    bgGradient: 'from-[#051829] via-[#020d18] to-[#01050a]',
    radialLighting: 'radial-gradient(circle at 50% 12%, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.12) 40%, transparent 75%)',
    accentBorder: 'border-sky-400/40',
    badgeBg: 'bg-sky-950/70',
    badgeBorder: 'border-sky-400/60',
    badgeText: 'text-sky-300',
    particleType: 'frost_snow',
    particleColors: ['#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#ffffff'],
    vignetteTint: 'rgba(5, 24, 41, 0.65)',
  },
};

/**
 * Intelligent weapon biome resolution based on weapon properties
 */
export function getWeaponBiome(
  weapon?: {
    id?: string;
    rarity?: string;
    category?: string;
    weaponType?: string;
    isSpecial?: boolean;
    name?: string;
    nameEn?: string;
    desc?: string;
  } | null
): WeaponBiomeId {
  if (!weapon) return 'jungle_forest';

  const wId = (weapon.weaponType || weapon.id || '').toLowerCase();
  const name = (weapon.name || '').toLowerCase();
  const nameEn = (weapon.nameEn || '').toLowerCase();
  const cat = (weapon.category || '').toLowerCase();
  const desc = (weapon.desc || '').toLowerCase();
  const rarity = (weapon.rarity || '').toLowerCase();

  // 1. Royal / Gold Palace: Desert Eagle Gold, Royal weapons, Gold tier
  if (
    wId.includes('gold') ||
    wId.includes('eagle') ||
    name.includes('ذهب') ||
    name.includes('ملك') ||
    nameEn.includes('gold') ||
    nameEn.includes('royal') ||
    cat.includes('ذهب') ||
    cat.includes('ملك') ||
    weapon.isSpecial
  ) {
    return 'royal_palace';
  }

  // 2. Volcanic / Explosives: Rocket RPG, Shotgun, Heavy SAW gun, Grenades, Fire
  if (
    wId.includes('rocket') ||
    wId.includes('rpg') ||
    wId.includes('shotgun') ||
    wId.includes('saw') ||
    name.includes('صاروخ') ||
    name.includes('شوزن') ||
    name.includes('منشار') ||
    name.includes('قاذف') ||
    name.includes('متفجر') ||
    name.includes('نار') ||
    cat.includes('متفجر') ||
    cat.includes('ثقيل') ||
    desc.includes('انفجار') ||
    desc.includes('حمم')
  ) {
    return 'volcanic_molten';
  }

  // 3. Cyber Tech & Laser: Dual Uzi, Cyber, Laser, Tech, Plasma, Energy, SMG
  if (
    wId.includes('uzi') ||
    wId.includes('laser') ||
    wId.includes('cyber') ||
    wId.includes('plasma') ||
    name.includes('ليزر') ||
    name.includes('سايبر') ||
    name.includes('تقني') ||
    name.includes('طاقة') ||
    name.includes('أوزي') ||
    name.includes('مزدوج') ||
    nameEn.includes('cyber') ||
    nameEn.includes('laser') ||
    nameEn.includes('uzi') ||
    cat.includes('سريع') ||
    cat.includes('تقني')
  ) {
    return 'cyber_tech';
  }

  // 4. Arctic Tundra: Riot Shield, Sub-zero, Frost, Ice, Defense
  if (
    wId.includes('shield') ||
    wId.includes('riot') ||
    wId.includes('arctic') ||
    wId.includes('frost') ||
    name.includes('درع') ||
    name.includes('جليد') ||
    name.includes('قطب') ||
    name.includes('ثلج') ||
    nameEn.includes('arctic') ||
    nameEn.includes('sub-zero') ||
    nameEn.includes('shield') ||
    cat.includes('دفاع') ||
    desc.includes('صد')
  ) {
    return 'arctic_tundra';
  }

  // 5. Sniper check: if legendary/special or .50 BMG -> royal palace, otherwise arctic or forest
  if (wId.includes('sniper') || name.includes('قنص') || nameEn.includes('sniper')) {
    if (rarity === 'legendary') return 'royal_palace';
    return 'arctic_tundra';
  }

  // 6. Jungle / Forest: M4 Assault rifle, Camo, Nature, Mil-spec tactical default
  if (
    wId.includes('m4') ||
    wId.includes('rifle') ||
    name.includes('هجوم') ||
    name.includes('غابة') ||
    name.includes('تمويه') ||
    name.includes('ميدان') ||
    cat.includes('هجوم')
  ) {
    return 'jungle_forest';
  }

  // Fallback based on rarity
  if (rarity === 'legendary') return 'royal_palace';
  if (rarity === 'epic') return 'cyber_tech';
  if (rarity === 'rare') return 'arctic_tundra';

  return 'jungle_forest';
}
