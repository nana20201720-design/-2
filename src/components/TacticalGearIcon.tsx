import React from 'react';

interface TacticalGearIconProps {
  id: string;
  type: 'headgear' | 'armor' | 'camo' | 'face' | 'jetpack' | 'trails';
  colorHex?: string;
  className?: string;
}

export const TacticalGearIcon: React.FC<TacticalGearIconProps> = ({
  id,
  type,
  colorHex,
  className = 'w-12 h-12',
}) => {
  if (type === 'headgear') {
    switch (id) {
      case 'nvg_helmet':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dark Tactical Helmet Dome */}
            <path d="M12 36 C12 18 20 12 32 12 C44 12 52 18 52 36 L52 40 L12 40 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
            <path d="M16 28 C22 24 42 24 48 28" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            {/* NVG Mount & Arms */}
            <rect x="28" y="16" width="8" height="6" fill="#0F172A" rx="1" />
            <path d="M30 22 L22 28 M34 22 L42 28" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Dual Glowing NVG Tubes */}
            <rect x="18" y="27" width="10" height="12" rx="3" fill="#090E17" stroke="#06B6D4" strokeWidth="2" />
            <circle cx="23" cy="33" r="3" fill="#06B6D4" className="animate-pulse" />
            <circle cx="23" cy="33" r="1.2" fill="#ECFEFF" />

            <rect x="36" y="27" width="10" height="12" rx="3" fill="#090E17" stroke="#06B6D4" strokeWidth="2" />
            <circle cx="41" cy="33" r="3" fill="#06B6D4" className="animate-pulse" />
            <circle cx="41" cy="33" r="1.2" fill="#ECFEFF" />
            {/* Chin Strap */}
            <path d="M16 40 L26 52 L38 52 L48 40" stroke="#475569" strokeWidth="2" fill="none" />
          </svg>
        );

      case 'beret_green':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Olive Green Folded Beret */}
            <path d="M14 36 C10 32 14 20 28 16 C46 12 56 22 54 34 C50 40 40 40 32 39 C22 38 16 38 14 36 Z" fill="#15803D" stroke="#000000" strokeWidth="2.5" />
            {/* Beret Headband */}
            <path d="M14 36 C20 40 34 40 48 36 L48 40 C34 44 20 44 14 40 Z" fill="#0F172A" stroke="#000000" strokeWidth="1.5" />
            {/* Gold Special Forces Insignia / Crest */}
            <rect x="22" y="22" width="8" height="10" rx="1.5" fill="#EAB308" stroke="#713F12" strokeWidth="1.2" />
            <path d="M24 25 L28 29 L28 23" stroke="#713F12" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );

      case 'beret_red':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Commando Crimson Red Beret */}
            <path d="M14 36 C10 32 14 20 28 16 C46 12 56 22 54 34 C50 40 40 40 32 39 C22 38 16 38 14 36 Z" fill="#DC2626" stroke="#000000" strokeWidth="2.5" />
            {/* Leather Band */}
            <path d="M14 36 C20 40 34 40 48 36 L48 40 C34 44 20 44 14 40 Z" fill="#1C1917" stroke="#000000" strokeWidth="1.5" />
            {/* Silver Dagger Badge */}
            <polygon points="26,20 28,32 24,32" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
            <rect x="22" y="28" width="8" height="2" fill="#94A3B8" />
          </svg>
        );

      case 'pilot_helmet':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Fighter Jet Pilot Dome */}
            <path d="M12 36 C12 18 20 12 32 12 C44 12 52 18 52 36 L52 46 C44 50 20 50 12 46 Z" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2.5" />
            {/* Oxygen Mask / Chin Guard */}
            <path d="M22 38 L42 38 L40 54 L24 54 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <line x1="26" y1="44" x2="38" y2="44" stroke="#475569" strokeWidth="1.5" />
            <line x1="28" y1="48" x2="36" y2="48" stroke="#475569" strokeWidth="1.5" />
            {/* Reflective Visor with Gold Glare */}
            <path d="M16 26 C16 26 24 22 32 22 C40 22 48 26 48 26 L46 36 C40 38 24 38 18 36 Z" fill="#0F172A" stroke="#000000" strokeWidth="2" />
            <path d="M20 27 Q28 24 36 28" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            {/* Oxygen Hose Tube */}
            <path d="M24 52 C18 56 16 60 22 62" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );

      case 'gas_mask':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Black Rubber Hood */}
            <path d="M14 34 C14 18 22 14 32 14 C42 14 50 18 50 34 L50 48 L14 48 Z" fill="#1E293B" stroke="#000000" strokeWidth="2.5" />
            {/* Dual Triangular Glass Lenses */}
            <circle cx="23" cy="28" r="7" fill="#0284C7" fillOpacity="0.6" stroke="#0F172A" strokeWidth="2" />
            <circle cx="23" cy="28" r="4" fill="#38BDF8" fillOpacity="0.8" />
            <circle cx="41" cy="28" r="7" fill="#0284C7" fillOpacity="0.6" stroke="#0F172A" strokeWidth="2" />
            <circle cx="41" cy="28" r="4" fill="#38BDF8" fillOpacity="0.8" />
            {/* Center Front Filter Canister */}
            <circle cx="32" cy="44" r="9" fill="#334155" stroke="#000000" strokeWidth="2" />
            <circle cx="32" cy="44" r="5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
            <path d="M30 42 L34 46 M34 42 L30 46" stroke="#F59E0B" strokeWidth="1.5" />
          </svg>
        );

      case 'bandana':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Commando Hair */}
            <path d="M16 28 C14 16 26 12 32 12 C38 12 50 16 48 28 Z" fill="#451A03" />
            {/* Crimson Red Bandana Wrap */}
            <path d="M12 28 C20 24 44 24 52 28 L53 35 C45 31 19 31 11 35 Z" fill="#DC2626" stroke="#000000" strokeWidth="2" />
            <path d="M12 30 Q32 26 52 30" stroke="#EF4444" strokeWidth="1.5" />
            {/* Flapping Knot Tails */}
            <path d="M50 32 C56 36 60 44 54 48 C52 46 54 40 50 36 Z" fill="#DC2626" stroke="#000000" strokeWidth="1.5" />
            <path d="M52 34 C58 40 62 50 58 54 C55 50 56 42 51 36 Z" fill="#B91C1C" stroke="#000000" strokeWidth="1.5" />
          </svg>
        );

      case 'skull_mask':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ghost Tactical Balaclava */}
            <path d="M14 36 C14 18 22 12 32 12 C42 12 50 18 50 36 L50 52 L14 52 Z" fill="#0F172A" stroke="#000000" strokeWidth="2.5" />
            {/* Skull Face Paint Stencil */}
            <path d="M22 28 C22 24 28 22 32 22 C36 22 42 24 42 28 L42 42 C38 46 26 46 22 42 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            {/* Eye Sockets */}
            <ellipse cx="26" cy="30" rx="3.5" ry="4.5" fill="#000000" />
            <ellipse cx="38" cy="30" rx="3.5" ry="4.5" fill="#000000" />
            {/* Nose Cavity */}
            <polygon points="32,34 30,38 34,38" fill="#000000" />
            {/* Skull Teeth Grid */}
            <path d="M25 43 L39 43" stroke="#000000" strokeWidth="1.5" />
            <line x1="27" y1="41" x2="27" y2="45" stroke="#000000" strokeWidth="1.5" />
            <line x1="30" y1="41" x2="30" y2="45" stroke="#000000" strokeWidth="1.5" />
            <line x1="34" y1="41" x2="34" y2="45" stroke="#000000" strokeWidth="1.5" />
            <line x1="37" y1="41" x2="37" y2="45" stroke="#000000" strokeWidth="1.5" />
          </svg>
        );

      case 'ninja_mask':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 36 C14 16 22 10 32 10 C42 10 50 16 50 36 L50 54 L14 54 Z" fill="#18181B" stroke="#09090B" strokeWidth="2.5" />
            {/* Narrow Eye Slit */}
            <rect x="20" y="26" width="24" height="8" rx="2" fill="#FCD34D" stroke="#000000" strokeWidth="1.5" />
            <circle cx="26" cy="30" r="2" fill="#000000" />
            <circle cx="38" cy="30" r="2" fill="#000000" />
            {/* Forehead Steel Headband */}
            <rect x="18" y="18" width="28" height="6" rx="1.5" fill="#71717A" stroke="#27272A" strokeWidth="1.2" />
            <circle cx="32" cy="21" r="1.5" fill="#E4E4E7" />
          </svg>
        );

      default:
        // Default Camo Combat Kevlar Helmet
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 36 C12 18 20 12 32 12 C44 12 52 18 52 36 L54 40 L10 40 Z" fill="#15803D" stroke="#14532D" strokeWidth="2.5" />
            <path d="M16 24 C22 20 34 22 40 18" stroke="#14532D" strokeWidth="3" strokeLinecap="round" />
            <path d="M26 32 C34 28 42 34 48 30" stroke="#713F12" strokeWidth="3" strokeLinecap="round" />
            <rect x="10" y="38" width="44" height="4" rx="2" fill="#0F172A" />
          </svg>
        );
    }
  }

  if (type === 'armor') {
    switch (id) {
      case 'juggernaut':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Heavy Reinforced Juggernaut Plating */}
            <path d="M12 18 L24 14 L40 14 L52 18 L50 48 L32 58 L14 48 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
            {/* Heavy Steel Chest Plates */}
            <polygon points="16,22 30,22 30,36 16,38" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />
            <polygon points="34,22 48,22 48,38 34,36" fill="#475569" stroke="#0F172A" strokeWidth="1.5" />
            <polygon points="20,40 32,38 44,40 32,54" fill="#64748B" stroke="#0F172A" strokeWidth="1.5" />
            {/* Heavy Bolts */}
            <circle cx="18" cy="24" r="1.5" fill="#E2E8F0" />
            <circle cx="46" cy="24" r="1.5" fill="#E2E8F0" />
            <circle cx="32" cy="46" r="1.5" fill="#F59E0B" />
          </svg>
        );

      case 'chest_harness':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Tactical Cross-Strap Bandolier */}
            <path d="M14 16 L50 50 L44 54 L8 20 Z" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            <path d="M50 16 L14 50 L20 54 L56 20 Z" fill="#78350F" stroke="#451A03" strokeWidth="2" />
            {/* Heavy .50 Cal Gold Cartridges */}
            <rect x="18" y="22" width="6" height="12" rx="1.5" fill="#FACC15" stroke="#713F12" strokeWidth="1" transform="rotate(-45 18 22)" />
            <rect x="28" y="32" width="6" height="12" rx="1.5" fill="#FACC15" stroke="#713F12" strokeWidth="1" transform="rotate(-45 28 32)" />
            <rect x="38" y="42" width="6" height="12" rx="1.5" fill="#FACC15" stroke="#713F12" strokeWidth="1" transform="rotate(-45 38 42)" />
            {/* Center Iron Buckle */}
            <circle cx="32" cy="35" r="5" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
          </svg>
        );

      case 'cyber_rig':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cyber Exoskeleton Torso */}
            <path d="M14 18 L24 14 L40 14 L50 18 L46 48 L32 56 L18 48 Z" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
            {/* Glowing Cyber Power Core */}
            <polygon points="32,24 40,32 32,40 24,32" fill="#06B6D4" fillOpacity="0.8" stroke="#ECFEFF" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="3" fill="#ECFEFF" className="animate-pulse" />
            {/* Cyber Circuit Traces */}
            <path d="M24 18 L24 28 L18 34" stroke="#06B6D4" strokeWidth="1.8" fill="none" />
            <path d="M40 18 L40 28 L46 34" stroke="#06B6D4" strokeWidth="1.8" fill="none" />
            <path d="M32 40 L32 52" stroke="#06B6D4" strokeWidth="2" />
          </svg>
        );

      case 'hazmat_suit':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Heavy Hazmat Yellow Vest */}
            <path d="M14 18 L24 14 L40 14 L50 18 L46 50 L32 56 L18 50 Z" fill="#EAB308" stroke="#713F12" strokeWidth="2.5" />
            {/* Black Biohazard Caution Stripe */}
            <rect x="18" y="24" width="28" height="6" fill="#18181B" />
            <line x1="22" y1="24" x2="26" y2="30" stroke="#EAB308" strokeWidth="2" />
            <line x1="30" y1="24" x2="34" y2="30" stroke="#EAB308" strokeWidth="2" />
            <line x1="38" y1="24" x2="42" y2="30" stroke="#EAB308" strokeWidth="2" />
            {/* Biohazard Icon */}
            <circle cx="32" cy="42" r="5" fill="#18181B" />
            <circle cx="32" cy="42" r="2.5" fill="#EAB308" />
          </svg>
        );

      default:
        // Tactical MOLLE Kevlar Vest
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18 L24 14 L40 14 L48 18 L46 48 L32 54 L18 48 Z" fill="#166534" stroke="#000000" strokeWidth="2.5" />
            {/* MOLLE Webbing Lines */}
            <line x1="20" y1="24" x2="44" y2="24" stroke="#14532D" strokeWidth="2" />
            <line x1="20" y1="30" x2="44" y2="30" stroke="#14532D" strokeWidth="2" />
            <line x1="22" y1="36" x2="42" y2="36" stroke="#14532D" strokeWidth="2" />
            {/* Front Mag Pouches */}
            <rect x="22" y="38" width="8" height="10" rx="1.5" fill="#14532D" stroke="#000000" strokeWidth="1.2" />
            <rect x="34" y="38" width="8" height="10" rx="1.5" fill="#14532D" stroke="#000000" strokeWidth="1.2" />
          </svg>
        );
    }
  }

  if (type === 'face') {
    switch (id) {
      case 'aviators_stubble':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Gold Frame Aviator Sunglasses */}
            <path d="M14 26 C14 22 28 22 28 26 L28 32 C28 36 14 36 14 32 Z" fill="#0F172A" stroke="#EAB308" strokeWidth="2" />
            <path d="M36 26 C36 22 50 22 50 26 L50 32 C50 36 36 36 36 32 Z" fill="#0F172A" stroke="#EAB308" strokeWidth="2" />
            <line x1="28" y1="25" x2="36" y2="25" stroke="#EAB308" strokeWidth="2" />
            <line x1="14" y1="25" x2="8" y2="22" stroke="#EAB308" strokeWidth="1.5" />
            <line x1="50" y1="25" x2="56" y2="22" stroke="#EAB308" strokeWidth="1.5" />
            {/* Aviator Lens Glare */}
            <line x1="17" y1="25" x2="22" y2="33" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" />
            <line x1="39" y1="25" x2="44" y2="33" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" />
            {/* Commando Stubble Beard */}
            <path d="M20 44 Q32 54 44 44 L42 50 Q32 58 22 50 Z" fill="#334155" opacity="0.75" />
          </svg>
        );

      case 'full_beard':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Heavy Veteran Tactical Beard */}
            <path d="M16 26 C16 38 20 54 32 58 C44 54 48 38 48 26 C44 32 38 32 32 32 C26 32 20 32 16 26 Z" fill="#451A03" stroke="#000000" strokeWidth="2" />
            {/* Mustache */}
            <path d="M22 32 Q32 28 42 32 Q32 40 22 32 Z" fill="#78350F" stroke="#000000" strokeWidth="1.5" />
          </svg>
        );

      case 'cigar_badass':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Heavy Smoked Cigar */}
            <rect x="22" y="30" width="26" height="8" rx="2" fill="#78350F" stroke="#451A03" strokeWidth="1.8" transform="rotate(-15 22 30)" />
            {/* Gold Cigar Ring Band */}
            <rect x="30" y="27" width="5" height="8" fill="#FACC15" stroke="#713F12" strokeWidth="1" transform="rotate(-15 30 27)" />
            {/* Glowing Hot Ember Tip */}
            <rect x="42" y="24" width="4" height="8" rx="1" fill="#EF4444" stroke="#DC2626" strokeWidth="1" transform="rotate(-15 42 24)" className="animate-pulse" />
            <circle cx="45" cy="27" r="1.5" fill="#FEF08A" />
            {/* Swirling Smoke Plume */}
            <path d="M48 22 Q54 16 50 12 Q44 8 52 4" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
          </svg>
        );

      case 'goggles_only':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wrap-around Ballistic Goggles */}
            <path d="M12 28 C12 22 28 20 32 20 C36 20 52 22 52 28 L48 38 C38 42 26 42 16 38 Z" fill="#0F172A" stroke="#000000" strokeWidth="2.5" />
            <path d="M16 28 C16 24 28 22 32 22 C36 22 48 24 48 28 L45 35 C38 38 26 38 19 35 Z" fill="#38BDF8" fillOpacity="0.5" stroke="#0284C7" strokeWidth="1.5" />
            <path d="M20 26 Q32 23 44 26" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            {/* Elastic Strap */}
            <line x1="12" y1="30" x2="4" y2="30" stroke="#334155" strokeWidth="4" />
            <line x1="52" y1="30" x2="60" y2="30" stroke="#334155" strokeWidth="4" />
          </svg>
        );

      default:
        // Clean Face
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="18" fill="#FCD34D" stroke="#000000" strokeWidth="2.5" />
            <circle cx="26" cy="28" r="2.5" fill="#0F172A" />
            <circle cx="38" cy="28" r="2.5" fill="#0F172A" />
            <path d="M28 38 Q32 42 36 38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        );
    }
  }

  if (type === 'jetpack') {
    switch (id) {
      case 'cyber_plasma':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cyber Jet Engine */}
            <rect x="18" y="16" width="12" height="28" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
            <rect x="34" y="16" width="12" height="28" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
            <rect x="22" y="24" width="20" height="12" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
            {/* Plasma Nodes */}
            <circle cx="24" cy="30" r="3" fill="#06B6D4" className="animate-pulse" />
            <circle cx="40" cy="30" r="3" fill="#06B6D4" className="animate-pulse" />
            {/* Cyan Thruster Plasma Exhaust */}
            <polygon points="20,44 28,44 24,58" fill="#06B6D4" opacity="0.9" />
            <polygon points="36,44 44,44 40,58" fill="#06B6D4" opacity="0.9" />
          </svg>
        );

      case 'toxic_jets':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Biohazard Twin Tanks */}
            <rect x="18" y="16" width="12" height="28" rx="4" fill="#166534" stroke="#22C55E" strokeWidth="2" />
            <rect x="34" y="16" width="12" height="28" rx="4" fill="#166534" stroke="#22C55E" strokeWidth="2" />
            <circle cx="24" cy="30" r="3" fill="#22C55E" />
            <circle cx="40" cy="30" r="3" fill="#22C55E" />
            {/* Green Chemical Fumes */}
            <polygon points="19,44 29,44 24,58" fill="#22C55E" opacity="0.9" />
            <polygon points="35,44 45,44 40,58" fill="#22C55E" opacity="0.9" />
          </svg>
        );

      case 'golden_falcon':
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Falcon Solar Wings */}
            <path d="M10 28 L24 20 L24 42 L12 46 Z" fill="#EAB308" stroke="#713F12" strokeWidth="1.8" />
            <path d="M54 28 L40 20 L40 42 L52 46 Z" fill="#EAB308" stroke="#713F12" strokeWidth="1.8" />
            {/* Center Gold Turbines */}
            <rect x="22" y="16" width="20" height="26" rx="4" fill="#CA8A04" stroke="#FEF08A" strokeWidth="2" />
            <polygon points="26,42 38,42 32,58" fill="#FACC15" opacity="0.95" />
          </svg>
        );

      default:
        // Military Dual Turbine
        return (
          <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="16" width="12" height="28" rx="3" fill="#334155" stroke="#000000" strokeWidth="2" />
            <rect x="34" y="16" width="12" height="28" rx="3" fill="#334155" stroke="#000000" strokeWidth="2" />
            <rect x="22" y="24" width="20" height="10" fill="#1E293B" stroke="#000000" strokeWidth="1.5" />
            {/* Exhaust Flames */}
            <polygon points="20,44 28,44 24,56" fill="#F97316" />
            <polygon points="36,44 44,44 40,56" fill="#F97316" />
          </svg>
        );
    }
  }

  if (type === 'trails') {
    return (
      <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" fill={colorHex || '#F97316'} fillOpacity="0.15" />
        <path d="M24 14 Q32 28 20 48 Q32 54 44 48 Q32 28 40 14 Q32 22 24 14 Z" fill={colorHex || '#F97316'} stroke="#000000" strokeWidth="1.5" />
        <path d="M28 24 Q32 34 26 44 Q32 48 38 44 Q32 34 36 24 Q32 30 28 24 Z" fill="#FEF08A" />
      </svg>
    );
  }

  // Camo Swatch Visual
  return (
    <div
      className={`${className} rounded-xl border-2 border-black/60 shadow-inner flex items-center justify-center relative overflow-hidden`}
      style={{ backgroundColor: colorHex || '#2d4a22' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#000000_20%,transparent_20%)] bg-[length:8px_8px] opacity-30" />
      <div className="w-4 h-4 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: colorHex }} />
    </div>
  );
};
