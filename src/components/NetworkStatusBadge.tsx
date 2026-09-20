import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Activity, ShieldCheck, Zap } from 'lucide-react';
import { matchSyncManager, NetworkQualityInfo } from '../utils/matchSyncManager';

interface NetworkStatusBadgeProps {
  compact?: boolean;
}

export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({ compact = false }) => {
  const [quality, setQuality] = useState<NetworkQualityInfo>(matchSyncManager.getNetworkQuality());

  useEffect(() => {
    const update = () => {
      setQuality(matchSyncManager.getNetworkQuality());
    };

    update();
    const interval = setInterval(update, 1500);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (quality.status) {
      case 'excellent':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40';
      case 'good':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/40';
      case 'laggy':
        return 'text-rose-400 bg-rose-950/80 border-rose-500/40';
      case 'offline':
      default:
        return 'text-neutral-400 bg-neutral-900/90 border-neutral-700/50';
    }
  };

  const getSignalIcon = () => {
    if (!quality.isOnline) {
      return <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />;
    }
    if (quality.status === 'excellent') {
      return <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20 animate-pulse" />;
    }
    return <Wifi className="w-3.5 h-3.5 text-amber-400" />;
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md shadow-lg text-[10px] font-mono font-black ${getStatusColor()}`}
        title={`حالة المزامنة المباشرة المفتوحة: ${quality.labelAr} (${quality.pingMs} ms)`}
      >
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          {getSignalIcon()}
        </div>
        <span className="tracking-tight">{quality.isOnline ? `PING ${quality.pingMs}ms` : 'OFFLINE'}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-lg text-xs font-mono font-bold transition-all ${getStatusColor()}`}
    >
      <div className="flex items-center gap-1.5">
        {getSignalIcon()}
        <span className="text-[11px] font-black">{quality.labelAr}</span>
      </div>
      <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
        <Activity className="w-3 h-3 opacity-70" />
        <span className="text-[10px] font-mono tracking-tight font-black">{quality.pingMs} ms</span>
      </div>
    </div>
  );
};

export default NetworkStatusBadge;
