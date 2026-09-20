import React from 'react';
import { Target, Shield, Cpu, Sparkles, Check, ChevronRight } from 'lucide-react';
import {
  PreviewEnvironmentType,
  PREVIEW_ENVIRONMENTS,
} from '../game/threeEnvironments';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

interface EnvironmentSwitcherProps {
  currentEnvironment: PreviewEnvironmentType;
  onSelectEnvironment: (env: PreviewEnvironmentType) => void;
  compact?: boolean;
  className?: string;
  showDetails?: boolean;
}

export const EnvironmentSwitcher: React.FC<EnvironmentSwitcherProps> = ({
  currentEnvironment,
  onSelectEnvironment,
  compact = false,
  className = '',
  showDetails = true,
}) => {
  const envList: PreviewEnvironmentType[] = ['training_grounds', 'military_bunker', 'tech_lab'];

  const handleSelect = (env: PreviewEnvironmentType) => {
    if (env === currentEnvironment) return;
    soundManager.playButtonClick();
    haptics.medium();
    onSelectEnvironment(env);
  };

  const getIcon = (env: PreviewEnvironmentType, size = 16, colorClass = '') => {
    switch (env) {
      case 'training_grounds':
        return <Target size={size} className={colorClass || 'text-amber-400'} />;
      case 'military_bunker':
        return <Shield size={size} className={colorClass || 'text-red-400'} />;
      case 'tech_lab':
        return <Cpu size={size} className={colorClass || 'text-cyan-400'} />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg ${className}`}>
        {envList.map((envKey) => {
          const env = PREVIEW_ENVIRONMENTS[envKey];
          const isSelected = currentEnvironment === envKey;

          return (
            <button
              key={envKey}
              onClick={() => handleSelect(envKey)}
              title={`${env.nameAr} (${env.nameEn})`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {getIcon(envKey, 14, isSelected ? 'text-black' : undefined)}
              <span className="text-[11px] whitespace-nowrap">{env.nameAr}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span className="text-xs font-black text-amber-300">
            خلفية واستوديو المعاينة ثلاثية الأبعاد (3D BACKDROP)
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/5">
          {PREVIEW_ENVIRONMENTS[currentEnvironment].nameEn}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {envList.map((envKey) => {
          const env = PREVIEW_ENVIRONMENTS[envKey];
          const isSelected = currentEnvironment === envKey;

          return (
            <button
              key={envKey}
              onClick={() => handleSelect(envKey)}
              className={`relative flex flex-col text-right p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-black/90 to-neutral-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                  : 'bg-black/60 border-white/10 hover:border-white/20 hover:bg-black/80'
              }`}
            >
              {/* Active Glow Accent bar */}
              {isSelected && (
                <div
                  className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300"
                  style={{ backgroundColor: env.themeColor }}
                />
              )}

              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-xl border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60'
                        : 'bg-white/5 border-white/10 group-hover:border-white/20'
                    }`}
                  >
                    {getIcon(envKey, 16)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{env.nameAr}</h4>
                    <span className="text-[10px] font-mono text-gray-400">{env.nameEn}</span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
                    <Check size={12} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    {env.badge}
                  </span>
                )}
              </div>

              {showDetails && (
                <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mt-1">
                  {env.descriptionAr}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
