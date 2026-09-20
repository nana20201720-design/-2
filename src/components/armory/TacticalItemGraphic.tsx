import React from 'react';

interface TacticalItemGraphicProps {
  id: string;
  className?: string;
  animate?: boolean;
}

export const TacticalItemGraphic: React.FC<TacticalItemGraphicProps> = ({
  id,
  className = 'w-16 h-16',
  animate = true,
}) => {
  // 1. THROWABLES & MINES
  if (id === 'frag_grenade') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="fragBodyGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4d6b53" />
            <stop offset="50%" stopColor="#2a3d2e" />
            <stop offset="100%" stopColor="#142117" />
          </radialGradient>
          <linearGradient id="fuseMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="leverGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <filter id="redGlowFrag" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Safety Lever Handle */}
        <path d="M 38 12 C 38 12, 54 18, 52 38 C 50 48, 46 54, 46 54" stroke="url(#leverGold)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Pull Ring */}
        <circle cx="28" cy="15" r="7" stroke="#e2e8f0" strokeWidth="2.5" fill="none" />

        {/* Fuse Assembly Cap */}
        <rect x="34" y="14" width="12" height="10" rx="2" fill="url(#fuseMetal)" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="37" y="10" width="6" height="5" rx="1" fill="#64748b" stroke="#0f172a" strokeWidth="1" />

        {/* Main Spherical Frag Body */}
        <circle cx="40" cy="46" r="24" fill="url(#fragBodyGrad)" stroke="#0a120c" strokeWidth="2.5" />

        {/* Ribbed Frag Matrix Pattern */}
        <path d="M 18 46 L 62 46 M 40 24 L 40 68 M 23 33 L 57 59 M 23 59 L 57 33" stroke="#121d15" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
        <circle cx="40" cy="46" r="18" stroke="#1e2e21" strokeWidth="1.5" fill="none" />

        {/* Yellow Stencil Band */}
        <path d="M 19 38 C 28 32, 52 32, 61 38" stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />

        {/* Center Glowing Detonation Core */}
        <circle cx="40" cy="46" r="4" fill="#ef4444" filter="url(#redGlowFrag)" className={animate ? 'animate-pulse' : ''} />
        <circle cx="40" cy="46" r="1.5" fill="#fef08a" />
      </svg>
    );
  }

  if (id === 'toxic_gas') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="canisterSteel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="toxicGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Toxic Fumes Vapor Effect */}
        <g opacity="0.85" className={animate ? 'animate-pulse' : ''}>
          <circle cx="28" cy="16" r="6" fill="#22c55e" filter="url(#toxicGlow)" opacity="0.6" />
          <circle cx="50" cy="14" r="8" fill="#10b981" filter="url(#toxicGlow)" opacity="0.7" />
          <circle cx="38" cy="8" r="5" fill="#4ade80" filter="url(#toxicGlow)" opacity="0.8" />
        </g>

        {/* Release Valve Top Nozzle */}
        <path d="M 36 22 L 44 22 L 42 16 L 38 16 Z" fill="#1e293b" stroke="#000000" strokeWidth="1.5" />
        <circle cx="40" cy="16" r="2" fill="#22c55e" />

        {/* Canister Body */}
        <rect x="25" y="22" width="30" height="48" rx="6" fill="url(#canisterSteel)" stroke="#090d16" strokeWidth="2.5" />

        {/* Biohazard Neon Green Bands */}
        <rect x="25" y="32" width="30" height="12" fill="#15803d" />
        <rect x="25" y="35" width="30" height="6" fill="#22c55e" />

        {/* Biohazard Warning Stencil */}
        <circle cx="40" cy="54" r="6" fill="#090d16" />
        <circle cx="40" cy="54" r="2.5" fill="#22c55e" />

        {/* Vent Holes */}
        <circle cx="30" cy="27" r="1.5" fill="#0f172a" />
        <circle cx="40" cy="27" r="1.5" fill="#0f172a" />
        <circle cx="50" cy="27" r="1.5" fill="#0f172a" />
      </svg>
    );
  }

  if (id === 'emp_pulse') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cyberCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="60%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#083344" />
          </radialGradient>
          <filter id="cyanPlasma" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Pulsing EMP Field Rings */}
        <circle cx="40" cy="40" r="34" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" className={animate ? 'animate-spin' : ''} style={{ animationDuration: '8s' }} />
        <circle cx="40" cy="40" r="28" stroke="#38bdf8" strokeWidth="1" opacity="0.4" />

        {/* Cyber Octagonal Frame */}
        <polygon points="28,16 52,16 64,28 64,52 52,64 28,64 16,52 16,28" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />

        {/* Internal Circuit Lines */}
        <path d="M 28 16 L 40 28 L 52 16 M 64 28 L 52 40 L 64 52 M 52 64 L 40 52 L 28 64 M 16 52 L 28 40 L 16 28" stroke="#164e63" strokeWidth="2" />

        {/* Glowing EMP Plasma Orb */}
        <circle cx="40" cy="40" r="14" fill="url(#cyberCore)" filter="url(#cyanPlasma)" />
        <circle cx="40" cy="40" r="6" fill="#ecfeff" className={animate ? 'animate-pulse' : ''} />

        {/* Lightning Electric Arcs */}
        <path d="M 28 32 L 34 38 L 30 44 L 40 40 L 46 32 L 50 48" stroke="#ecfeff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (id === 'proximity_mine') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="claymoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f5945" />
            <stop offset="100%" stopColor="#1e2e21" />
          </linearGradient>
          <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Steel Scissor Tripod Legs */}
        <path d="M 20 54 L 10 72 M 30 54 L 22 72 M 50 54 L 58 72 M 60 54 L 70 72" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

        {/* Curved Claymore Body */}
        <path d="M 12 30 C 26 22, 54 22, 68 30 L 64 54 C 52 48, 28 48, 16 54 Z" fill="url(#claymoreGrad)" stroke="#0a120c" strokeWidth="2.5" />

        {/* Military Stencil Lines */}
        <path d="M 22 34 C 32 30, 48 30, 58 34" stroke="#121e14" strokeWidth="2" fill="none" />
        <text x="40" y="44" fill="#facc15" fontSize="5" fontWeight="900" textAnchor="middle" letterSpacing="1">
          FRONT TOWARD ENEMY
        </text>

        {/* Dual Red Laser Emitter Sensors */}
        <circle cx="28" cy="27" r="4" fill="#0f172a" stroke="#7928ca" strokeWidth="1" />
        <circle cx="28" cy="27" r="2" fill="#ef4444" filter="url(#laserGlow)" className={animate ? 'animate-pulse' : ''} />

        <circle cx="52" cy="27" r="4" fill="#0f172a" stroke="#7928ca" strokeWidth="1" />
        <circle cx="52" cy="27" r="2" fill="#ef4444" filter="url(#laserGlow)" className={animate ? 'animate-pulse' : ''} />

        {/* Laser Beams */}
        <line x1="28" y1="25" x2="24" y2="10" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
        <line x1="52" y1="25" x2="56" y2="10" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
      </svg>
    );
  }

  // 2. ARMORS & HELMETS & BOOTS
  if (id === 'titanium_helmet') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="titaniumMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <filter id="nvgGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Helmet Base Shell Dome */}
        <path d="M 14 46 C 12 22, 24 14, 40 14 C 56 14, 68 22, 66 46 L 68 52 C 58 58, 22 58, 12 52 Z" fill="url(#titaniumMetal)" stroke="#090d16" strokeWidth="2.5" />

        {/* Side ARC Accessory Rails */}
        <path d="M 14 38 L 22 36 L 24 44 L 16 46 Z" fill="#1e293b" stroke="#000000" strokeWidth="1.5" />
        <path d="M 66 38 L 58 36 L 56 44 L 64 46 Z" fill="#1e293b" stroke="#000000" strokeWidth="1.5" />

        {/* Front Wilcox NVG Shroud Bracket */}
        <polygon points="34,22 46,22 44,32 36,32" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />

        {/* NVG Night Vision Dual Optics Lenses */}
        <g filter="url(#nvgGlow)">
          <rect x="26" y="28" width="11" height="13" rx="3" fill="#090d16" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="31.5" cy="34.5" r="3.5" fill="#06b6d4" className={animate ? 'animate-pulse' : ''} />
          <circle cx="31.5" cy="34.5" r="1.5" fill="#ecfeff" />

          <rect x="43" y="28" width="11" height="13" rx="3" fill="#090d16" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="48.5" cy="34.5" r="3.5" fill="#06b6d4" className={animate ? 'animate-pulse' : ''} />
          <circle cx="48.5" cy="34.5" r="1.5" fill="#ecfeff" />
        </g>

        {/* Tactical Chin Strap */}
        <path d="M 20 52 L 32 66 L 48 66 L 60 52" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="36" y="64" width="8" height="4" rx="1" fill="#0284c7" />
      </svg>
    );
  }

  if (id === 'heavy_kevlar') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kevlarCamo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f3824" />
            <stop offset="50%" stopColor="#142618" />
            <stop offset="100%" stopColor="#0b170e" />
          </linearGradient>
        </defs>

        {/* Main Tactical Heavy Vest Body */}
        <path d="M 22 18 L 32 14 L 48 14 L 58 18 L 62 36 L 56 68 L 24 68 L 18 36 Z" fill="url(#kevlarCamo)" stroke="#070e09" strokeWidth="2.5" />

        {/* Armor Plate Insets */}
        <polygon points="26,26 54,26 50,46 30,46" fill="#172e1c" stroke="#2c5233" strokeWidth="1.5" />

        {/* MOLLE Webbing Horizontal Straps */}
        <line x1="26" y1="32" x2="54" y2="32" stroke="#0b170e" strokeWidth="2.5" />
        <line x1="27" y1="38" x2="53" y2="38" stroke="#0b170e" strokeWidth="2.5" />
        <line x1="28" y1="44" x2="52" y2="44" stroke="#0b170e" strokeWidth="2.5" />

        {/* Front AR Rifle Magazine Pouches */}
        <g>
          <rect x="26" y="50" width="11" height="15" rx="2" fill="#0b170e" stroke="#22c55e" strokeWidth="1.2" />
          <rect x="28" y="46" width="7" height="6" fill="#ca8a04" />

          <rect x="39" y="50" width="11" height="15" rx="2" fill="#0b170e" stroke="#22c55e" strokeWidth="1.2" />
          <rect x="41" y="46" width="7" height="6" fill="#ca8a04" />
        </g>

        {/* Shoulder Heavy Pads */}
        <rect x="16" y="16" width="12" height="10" rx="3" fill="#162e1c" stroke="#070e09" strokeWidth="2" />
        <rect x="52" y="16" width="12" height="10" rx="3" fill="#162e1c" stroke="#070e09" strokeWidth="2" />
      </svg>
    );
  }

  if (id === 'nano_plating') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nanoPlate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="purpleEnergy" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Diamond Cyber Nano Shield Structure */}
        <polygon points="40,10 68,26 62,64 40,74 18,64 12,26" fill="url(#nanoPlate)" stroke="#a855f7" strokeWidth="2.5" />

        {/* Nanotech Honeycomb Mesh Grid */}
        <polygon points="40,18 60,30 56,58 40,66 24,58 20,30" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Glowing Central Nanocore */}
        <polygon points="40,28 50,36 40,52 30,36" fill="#a855f7" filter="url(#purpleEnergy)" opacity="0.8" />
        <polygon points="40,32 46,38 40,48 34,38" fill="#e879f9" className={animate ? 'animate-pulse' : ''} />

        {/* Corner Cyber Rivets */}
        <circle cx="18" cy="28" r="2" fill="#38bdf8" />
        <circle cx="62" cy="28" r="2" fill="#38bdf8" />
        <circle cx="40" cy="70" r="2" fill="#38bdf8" />
      </svg>
    );
  }

  if (id === 'assault_boots') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bootLeather" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Left Combat Boot */}
        <g transform="translate(-4, 0)">
          <path d="M 22 20 L 32 20 L 34 44 L 46 50 L 46 62 L 18 62 L 18 24 Z" fill="url(#bootLeather)" stroke="#020617" strokeWidth="2" />
          {/* Steel Toe Cap */}
          <path d="M 36 50 L 46 50 L 46 62 L 34 62 Z" fill="#64748b" stroke="#020617" strokeWidth="1.5" />
          {/* Hydraulic Exo Piston Strut */}
          <line x1="20" y1="26" x2="20" y2="58" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="20" cy="42" r="2.5" fill="#fef08a" />
          {/* Heavy Rubber Tread Sole */}
          <rect x="16" y="62" width="32" height="6" rx="1.5" fill="#090d16" />
        </g>

        {/* Right Combat Boot */}
        <g transform="translate(18, 6)">
          <path d="M 22 20 L 32 20 L 34 44 L 46 50 L 46 62 L 18 62 L 18 24 Z" fill="url(#bootLeather)" stroke="#020617" strokeWidth="2" />
          <path d="M 36 50 L 46 50 L 46 62 L 34 62 Z" fill="#64748b" stroke="#020617" strokeWidth="1.5" />
          <line x1="20" y1="26" x2="20" y2="58" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="20" cy="42" r="2.5" fill="#fef08a" />
          <rect x="16" y="62" width="32" height="6" rx="1.5" fill="#090d16" />
        </g>
      </svg>
    );
  }

  // 3. JETPACKS & THRUSTERS
  if (id === 'turbo_nozzles') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="titaniumHeat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="30%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="flameGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Center Manifold Chassis */}
        <rect x="28" y="22" width="24" height="18" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

        {/* Left Rocket Thruster Bell Nozzle */}
        <g>
          <rect x="16" y="16" width="14" height="26" rx="3" fill="#334155" stroke="#000000" strokeWidth="2" />
          <path d="M 14 42 L 32 42 L 34 56 L 12 56 Z" fill="url(#titaniumHeat)" stroke="#000000" strokeWidth="2" />
          {/* Flame Core */}
          <polygon points="16,56 30,56 23,76" fill="#f97316" filter="url(#flameGlow)" className={animate ? 'animate-pulse' : ''} />
          <polygon points="19,56 27,56 23,70" fill="#fef08a" />
        </g>

        {/* Right Rocket Thruster Bell Nozzle */}
        <g>
          <rect x="50" y="16" width="14" height="26" rx="3" fill="#334155" stroke="#000000" strokeWidth="2" />
          <path d="M 48 42 L 66 42 L 68 56 L 46 56 Z" fill="url(#titaniumHeat)" stroke="#000000" strokeWidth="2" />
          <polygon points="50,56 64,56 57,76" fill="#f97316" filter="url(#flameGlow)" className={animate ? 'animate-pulse' : ''} />
          <polygon points="53,56 61,56 57,70" fill="#fef08a" />
        </g>

        {/* Hydraulic Steering Pistons */}
        <line x1="22" y1="30" x2="30" y2="30" stroke="#f59e0b" strokeWidth="2" />
        <line x1="58" y1="30" x2="50" y2="30" stroke="#f59e0b" strokeWidth="2" />
      </svg>
    );
  }

  if (id === 'nitro_tank') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="carbonFiber" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Twin High Pressure Carbon Fiber Tanks */}
        <g>
          <rect x="18" y="18" width="18" height="46" rx="8" fill="url(#carbonFiber)" stroke="#06b6d4" strokeWidth="2" />
          <rect x="18" y="32" width="18" height="12" fill="#eab308" />
          <text x="27" y="40" fill="#000" fontSize="7" fontWeight="900" textAnchor="middle">NOS</text>

          <rect x="44" y="18" width="18" height="46" rx="8" fill="url(#carbonFiber)" stroke="#06b6d4" strokeWidth="2" />
          <rect x="44" y="32" width="18" height="12" fill="#eab308" />
          <text x="53" y="40" fill="#000" fontSize="7" fontWeight="900" textAnchor="middle">NOS</text>
        </g>

        {/* Brass Valves & Manifold */}
        <rect x="23" y="12" width="8" height="6" fill="#ca8a04" stroke="#000" strokeWidth="1" />
        <rect x="49" y="12" width="8" height="6" fill="#ca8a04" stroke="#000" strokeWidth="1" />

        {/* Pressure Gauge Dial */}
        <circle cx="40" cy="24" r="8" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
        <line x1="40" y1="24" x2="44" y2="20" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

        {/* Steel Braided Hoses */}
        <path d="M 27 12 C 27 6, 53 6, 53 12" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  if (id === 'agility_fins') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="finCarbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Center Base Plate */}
        <rect x="30" y="24" width="20" height="32" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />

        {/* Left Stealth Vector Winglet */}
        <path d="M 30 28 L 8 16 L 14 58 L 30 50 Z" fill="url(#finCarbon)" stroke="#38bdf8" strokeWidth="2" />
        <line x1="12" y1="28" x2="28" y2="38" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="10" cy="18" r="2.5" fill="#38bdf8" className={animate ? 'animate-pulse' : ''} />

        {/* Right Stealth Vector Winglet */}
        <path d="M 50 28 L 72 16 L 66 58 L 50 50 Z" fill="url(#finCarbon)" stroke="#38bdf8" strokeWidth="2" />
        <line x1="68" y1="28" x2="52" y2="38" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="70" cy="18" r="2.5" fill="#38bdf8" className={animate ? 'animate-pulse' : ''} />
      </svg>
    );
  }

  if (id === 'cryo_cooler') {
    return (
      <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="frostGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <filter id="iceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Cryo Manifold Block */}
        <rect x="20" y="20" width="40" height="40" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Ice-Blue Glowing Pipes */}
        <path d="M 28 20 L 28 60 M 40 20 L 40 60 M 52 20 L 52 60" stroke="url(#frostGrad)" strokeWidth="4" strokeLinecap="round" />

        {/* Frost Crystals */}
        <g opacity="0.9" filter="url(#iceGlow)">
          <path d="M 40 10 L 40 22 M 34 16 L 46 16" stroke="#bae6fd" strokeWidth="2" />
          <path d="M 20 40 L 8 40 M 14 34 L 14 46" stroke="#bae6fd" strokeWidth="2" />
          <path d="M 60 40 L 72 40 M 66 34 L 66 46" stroke="#bae6fd" strokeWidth="2" />
        </g>

        {/* Digital Temp Display */}
        <rect x="26" y="34" width="28" height="12" rx="2" fill="#030712" stroke="#38bdf8" strokeWidth="1" />
        <text x="40" y="43" fill="#38bdf8" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="monospace">
          -196°C
        </text>
      </svg>
    );
  }

  // Fallback Generic High-Tech Tactical Icon
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="30" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
      <polygon points="40,20 55,50 25,50" fill="#3b82f6" opacity="0.8" />
    </svg>
  );
};
