import React from 'react';

interface OperativeGraphicSVGProps {
  id: string;
  className?: string;
  animate?: boolean;
}

/**
 * High-Detail 2D Tactical Character/Operative Graphic Illustration Component
 * For Store Cards & Armory Previews (Mini Militia / Doodle Army 2 Comic Military Style)
 */
export const OperativeGraphicSVG: React.FC<OperativeGraphicSVGProps> = ({
  id,
  className = 'w-24 h-24',
  animate = true,
}) => {
  // 1. GOLDEN WARLORD (الجنرال الأسطوري)
  if (id === 'golden_warlord') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gwGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#facc15" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="gwGoldShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="gwArmor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f2e08" />
            <stop offset="50%" stopColor="#1c1303" />
            <stop offset="100%" stopColor="#080501" />
          </linearGradient>
          <filter id="gwGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Golden Command Halo Aura */}
        <circle cx="50" cy="50" r="44" stroke="url(#gwGoldGrad)" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6" className={animate ? 'animate-spin' : ''} style={{ animationDuration: '12s' }} />
        <circle cx="50" cy="50" r="38" fill="url(#gwArmor)" stroke="url(#gwGoldGrad)" strokeWidth="2" />

        {/* Golden Eagle Wings Crest Background */}
        <path d="M 18 52 C 26 38, 40 32, 50 32 C 60 32, 74 38, 82 52 C 70 50, 58 48, 50 56 C 42 48, 30 50, 18 52 Z" fill="url(#gwGoldGrad)" opacity="0.4" />

        {/* Golden Officer Beret / Crown Headgear */}
        <path d="M 26 34 C 28 20, 50 16, 72 24 C 76 28, 74 36, 68 38 C 54 36, 38 38, 26 34 Z" fill="url(#gwGoldGrad)" stroke="#543105" strokeWidth="2" />
        <path d="M 28 34 C 36 32, 60 32, 68 36 L 68 38 C 50 40, 36 40, 28 36 Z" fill="#78350f" />
        {/* Golden Officer Star Insignia Badge */}
        <polygon points="50,20 52,25 57,25 53,28 55,33 50,30 45,33 47,28 43,25 48,25" fill="#fef08a" stroke="#78350f" strokeWidth="0.8" filter="url(#gwGoldGlow)" />

        {/* Head / Face Shape */}
        <path d="M 34 36 C 34 36, 34 56, 50 56 C 66 56, 66 36, 66 36 Z" fill="#fbb587" stroke="#000000" strokeWidth="2" />

        {/* Warlord Combat Stubble Beard */}
        <path d="M 36 46 C 38 55, 62 55, 64 46 C 64 54, 58 58, 50 58 C 42 58, 36 54, 36 46 Z" fill="#78350f" opacity="0.6" />

        {/* Specular Gold Aviator Sunglasses */}
        <path d="M 34 38 C 34 38, 48 38, 48 44 C 48 48, 36 48, 34 44 Z" fill="#0f172a" stroke="url(#gwGoldGrad)" strokeWidth="1.8" />
        <path d="M 52 38 C 52 38, 66 38, 66 44 C 66 48, 54 48, 52 44 Z" fill="#0f172a" stroke="url(#gwGoldGrad)" strokeWidth="1.8" />
        <line x1="48" y1="40" x2="52" y2="40" stroke="url(#gwGoldGrad)" strokeWidth="2" />
        {/* Glasses Lens Glare */}
        <line x1="36" y1="40" x2="42" y2="44" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
        <line x1="54" y1="40" x2="60" y2="44" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />

        {/* Royal Heavy Tactical Body Armor Vest */}
        <path d="M 24 58 L 36 56 L 64 56 L 76 58 L 80 84 L 20 84 Z" fill="#1c1303" stroke="url(#gwGoldGrad)" strokeWidth="2" />
        {/* Gold Plate Inset */}
        <path d="M 32 60 L 68 60 L 62 78 L 38 78 Z" fill="url(#gwGoldGrad)" stroke="#543105" strokeWidth="1.5" />

        {/* Gold Ammo Mag Pouches */}
        <rect x="34" y="66" width="9" height="12" rx="1.5" fill="#080501" stroke="url(#gwGoldShine)" strokeWidth="1" />
        <rect x="45" y="66" width="9" height="12" rx="1.5" fill="#080501" stroke="url(#gwGoldShine)" strokeWidth="1" />
        <rect x="56" y="66" width="9" height="12" rx="1.5" fill="#080501" stroke="url(#gwGoldShine)" strokeWidth="1" />

        {/* Shoulder Gold Epaulettes */}
        <rect x="20" y="58" width="14" height="8" rx="2" fill="url(#gwGoldGrad)" stroke="#543105" strokeWidth="1" />
        <rect x="66" y="58" width="14" height="8" rx="2" fill="url(#gwGoldGrad)" stroke="#543105" strokeWidth="1" />

        {/* Golden Desert Eagle Sidearm Handhold */}
        <g transform="translate(62, 52) scale(0.7)">
          <rect x="0" y="0" width="22" height="7" rx="1.5" fill="url(#gwGoldGrad)" stroke="#000000" strokeWidth="1.5" />
          <rect x="1" y="7" width="14" height="3" rx="0.5" fill="url(#gwGoldGrad)" stroke="#000000" strokeWidth="1.2" />
          <path d="M 2 8 L 6 8 L 5 16 L 0 15 Z" fill="#1c1917" stroke="#000000" strokeWidth="1.2" />
        </g>
      </svg>
    );
  }

  // 2. CYBER COMMANDO (الكوماندو السيبراني)
  if (id === 'cyber_commando') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ccCyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>
          <linearGradient id="ccPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="ccCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Octagonal Hologram Target Grid */}
        <polygon points="50,6 82,20 94,50 82,80 50,94 18,80 6,50 18,20" fill="none" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="6 3" opacity="0.5" className={animate ? 'animate-spin' : ''} style={{ animationDuration: '16s' }} />
        <circle cx="50" cy="50" r="38" fill="url(#ccPlateGrad)" stroke="#06b6d4" strokeWidth="2" />

        {/* Cyber Octagonal Helmet Dome */}
        <path d="M 30 24 L 50 16 L 70 24 L 74 44 L 68 54 L 32 54 L 26 44 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />

        {/* Glowing Neon Cyan LED Visor */}
        <path d="M 32 32 L 68 32 L 64 42 L 36 42 Z" fill="#06b6d4" filter="url(#ccCyanGlow)" opacity="0.9" />
        <path d="M 34 34 L 66 34 L 62 40 L 38 40 Z" fill="#ecfeff" className={animate ? 'animate-pulse' : ''} />

        {/* HUD Targeting Reticle overlay on Visor */}
        <circle cx="50" cy="37" r="3" stroke="#083344" strokeWidth="1" fill="none" />
        <line x1="43" y1="37" x2="57" y2="37" stroke="#083344" strokeWidth="0.8" />

        {/* Cybernetic Face Guard Respirator */}
        <path d="M 34 44 L 50 56 L 66 44 L 62 56 L 38 56 Z" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="2.5" fill="#38bdf8" />
        <line x1="40" y1="48" x2="44" y2="48" stroke="#06b6d4" strokeWidth="1.5" />
        <line x1="56" y1="48" x2="60" y2="48" stroke="#06b6d4" strokeWidth="1.5" />

        {/* Cyber Nanotech Body Suit Chestplate */}
        <path d="M 22 58 L 38 56 L 62 56 L 78 58 L 82 84 L 18 84 Z" fill="url(#ccPlateGrad)" stroke="#06b6d4" strokeWidth="2" />

        {/* Glowing Cyan Circuit Lines */}
        <path d="M 32 60 L 42 70 L 42 82 M 68 60 L 58 70 L 58 82 M 50 62 L 50 82" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />

        {/* Central Reactor Power Core */}
        <polygon points="50,62 56,68 50,74 44,68" fill="#38bdf8" filter="url(#ccCyanGlow)" />
        <polygon points="50,64 54,68 50,72 46,68" fill="#ffffff" />

        {/* Cyber Rifle Hold */}
        <g transform="translate(60, 50) scale(0.7)">
          <rect x="0" y="0" width="28" height="6" rx="1.5" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
          <rect x="18" y="-3" width="8" height="3" fill="#38bdf8" />
          <line x1="4" y1="3" x2="24" y2="3" stroke="#22d3ee" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  // 3. DESERT PHANTOM (شبح الصحراء التكتيكي)
  if (id === 'desert_phantom') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dpTanCamo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="dpVestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f2e08" />
            <stop offset="50%" stopColor="#261b04" />
            <stop offset="100%" stopColor="#120c02" />
          </linearGradient>
          <filter id="dpThermalGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tactical Radar Ring */}
        <circle cx="50" cy="50" r="44" stroke="#eab308" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />
        <circle cx="50" cy="50" r="38" fill="url(#dpVestGrad)" stroke="#d97706" strokeWidth="2" />

        {/* Tan Desert Camo Helmet */}
        <path d="M 26 36 C 24 18, 38 14, 50 14 C 62 14, 76 18, 74 36 L 76 40 C 66 44, 34 44, 24 40 Z" fill="url(#dpTanCamo)" stroke="#451a03" strokeWidth="2" />

        {/* Night Vision Goggles Bracket Mount */}
        <rect x="42" y="16" width="16" height="8" rx="2" fill="#1e293b" stroke="#000" strokeWidth="1.2" />

        {/* Flip-down Dual Thermal Lenses */}
        <g filter="url(#dpThermalGlow)">
          <rect x="30" y="26" width="16" height="12" rx="3" fill="#0f172a" stroke="#eab308" strokeWidth="1.8" />
          <circle cx="38" cy="32" r="3.5" fill="#facc15" className={animate ? 'animate-pulse' : ''} />
          <circle cx="38" cy="32" r="1.5" fill="#ffffff" />

          <rect x="54" y="26" width="16" height="12" rx="3" fill="#0f172a" stroke="#eab308" strokeWidth="1.8" />
          <circle cx="62" cy="32" r="3.5" fill="#facc15" className={animate ? 'animate-pulse' : ''} />
          <circle cx="62" cy="32" r="1.5" fill="#ffffff" />
        </g>

        {/* Desert Balaclava Mask & Shemagh Scarf */}
        <path d="M 30 38 L 70 38 L 68 56 C 58 60, 42 60, 32 56 Z" fill="#92400e" stroke="#451a03" strokeWidth="1.8" />
        <path d="M 32 44 C 42 48, 58 48, 68 44" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

        {/* Heavy Molle Tactical Vest */}
        <path d="M 22 58 L 36 54 L 64 54 L 78 58 L 82 84 L 18 84 Z" fill="url(#dpVestGrad)" stroke="#d97706" strokeWidth="2" />

        {/* AR Ammo Pouches & Grenade Clip */}
        <rect x="30" y="64" width="11" height="15" rx="2" fill="#120c02" stroke="#eab308" strokeWidth="1.2" />
        <rect x="32" y="60" width="7" height="5" fill="#facc15" />

        <rect x="44" y="64" width="11" height="15" rx="2" fill="#120c02" stroke="#eab308" strokeWidth="1.2" />
        <rect x="46" y="60" width="7" height="5" fill="#facc15" />

        <rect x="58" y="64" width="11" height="15" rx="2" fill="#120c02" stroke="#eab308" strokeWidth="1.2" />
        <rect x="60" y="60" width="7" height="5" fill="#facc15" />

        {/* Suppressed Sniper Barrel Graphic */}
        <g transform="translate(62, 46) scale(0.65)">
          <rect x="0" y="0" width="34" height="6" rx="1" fill="#1e293b" stroke="#000" strokeWidth="1.5" />
          <rect x="22" y="-5" width="18" height="5" rx="1" fill="#0f172a" stroke="#000" strokeWidth="1.2" />
        </g>
      </svg>
    );
  }

  // 4. ARCTIC VALKYRIE (قناص الفالكيري الجليدي)
  if (id === 'arctic_valkyrie') {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="avIceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="avArmorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          <filter id="avFrostGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ice Crystal Shield Ring */}
        <circle cx="50" cy="50" r="44" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" className={animate ? 'animate-spin' : ''} style={{ animationDuration: '14s' }} />
        <circle cx="50" cy="50" r="38" fill="url(#avArmorGrad)" stroke="#38bdf8" strokeWidth="2" />

        {/* Arctic White / Sub-Zero Hood */}
        <path d="M 24 38 C 22 16, 36 12, 50 12 C 64 12, 78 16, 76 38 L 78 44 C 66 48, 34 48, 22 44 Z" fill="#f8fafc" stroke="#0284c7" strokeWidth="2" />

        {/* Ice-Blue Polycarbonate Tactical Goggles */}
        <path d="M 30 30 C 30 30, 48 28, 48 36 C 48 40, 32 40, 30 36 Z" fill="url(#avIceGrad)" stroke="#0c4a6e" strokeWidth="1.5" filter="url(#avFrostGlow)" />
        <path d="M 52 30 C 52 30, 70 28, 70 36 C 70 40, 54 40, 52 36 Z" fill="url(#avIceGrad)" stroke="#0c4a6e" strokeWidth="1.5" filter="url(#avFrostGlow)" />
        <line x1="48" y1="33" x2="52" y2="33" stroke="#0284c7" strokeWidth="2" />

        {/* Tactical Sub-Zero Skull Mask Faceguard */}
        <path d="M 32 38 L 68 38 L 64 56 C 54 60, 46 60, 36 56 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
        {/* Skull Teeth Stencil */}
        <path d="M 40 48 L 40 54 M 44 48 L 44 54 M 48 48 L 48 54 M 52 48 L 52 54 M 56 48 L 56 54 M 60 48 L 60 54" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" />

        {/* Sub-Zero Winter Armor Parka Collar */}
        <path d="M 22 58 L 36 52 L 64 52 L 78 58 L 82 84 L 18 84 Z" fill="#f1f5f9" stroke="#0284c7" strokeWidth="2" />
        <path d="M 34 54 L 66 54 L 60 78 L 40 78 Z" fill="url(#avArmorGrad)" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Frost Core Center Chest Emblem */}
        <polygon points="50,58 56,64 50,70 44,64" fill="#38bdf8" filter="url(#avFrostGlow)" />
        <polygon points="50,60 54,64 50,68 46,64" fill="#f0f9ff" />

        {/* Ice Assault Rifle */}
        <g transform="translate(60, 48) scale(0.65)">
          <rect x="0" y="0" width="30" height="6" rx="1" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="20" y="-4" width="12" height="4" fill="#38bdf8" />
        </g>
      </svg>
    );
  }

  // Fallback Generic Operative Graphic
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="50" cy="38" r="14" fill="#64748b" />
      <path d="M 25 75 C 25 55, 75 55, 75 75 Z" fill="#334155" />
    </svg>
  );
};
