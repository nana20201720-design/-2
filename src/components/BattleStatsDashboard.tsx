import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Crosshair,
  ShieldAlert,
  Target,
  Trophy,
  Skull,
  Activity,
  Zap,
  RotateCw,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { playerStatsManager, PlayerCombatStats } from '../utils/playerStatsManager';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const TacticalTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c140e] border border-[#2b4430] p-2.5 rounded-lg shadow-xl text-right font-sans text-xs">
        <div className="text-gray-400 font-bold border-b border-[#1b2a1f] pb-1 mb-1.5 flex items-center justify-between gap-4">
          <span className="text-amber-400 font-mono text-[11px]">{label}</span>
          <span className="text-[10px] text-gray-500">بيانات بالستية</span>
        </div>
        {payload.map((entry, idx) => (
          <div key={`item-${idx}`} className="flex items-center justify-between gap-3 text-[11px] py-0.5">
            <span className="font-mono font-bold" style={{ color: entry.color }}>
              {entry.name === 'accuracy' ? `${entry.value}%` : entry.value}
            </span>
            <span className="text-gray-300">
              {entry.name === 'accuracy'
                ? 'دقة التصويب'
                : entry.name === 'benchmark'
                ? 'المعيار الميداني'
                : entry.name === 'kills'
                ? 'إقصاءات'
                : entry.name}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function BattleStatsDashboard() {
  const [stats, setStats] = useState<PlayerCombatStats>(playerStatsManager.getStats());
  const [activeTab, setActiveTab] = useState<'overview' | 'accuracy' | 'zones'>('overview');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setStats(playerStatsManager.getStats());
    };
    window.addEventListener('player-stats-updated', handleUpdate);
    return () => window.removeEventListener('player-stats-updated', handleUpdate);
  }, []);

  // Pie chart data for Wins vs Losses
  const winLossData = [
    { name: 'الانتصارات', value: stats.wins, color: '#10b981' },
    { name: 'الهزائم', value: stats.losses, color: '#ef4444' },
  ];

  // Hit Zone accuracy distribution data
  const hitZoneData = [
    { zone: 'الرأس (قاتل)', rate: stats.headshotRate, color: '#f59e0b', kills: 440 },
    { zone: 'الجذع والصدر', rate: stats.torsoRate, color: '#06b6d4', kills: 639 },
    { zone: 'الأطراف والحركة', rate: stats.limbRate, color: '#10b981', kills: 341 },
  ];

  const handleSimulateMatch = (outcome: 'win' | 'loss') => {
    soundManager.playButtonClick();
    if (outcome === 'win') {
      haptics.victory();
    } else {
      haptics.combatPulse();
    }
    setIsSimulating(true);
    setTimeout(() => {
      const acc = outcome === 'win' ? Math.floor(Math.random() * 16) + 75 : Math.floor(Math.random() * 15) + 60;
      const k = outcome === 'win' ? Math.floor(Math.random() * 7) + 10 : Math.floor(Math.random() * 5) + 4;
      const d = outcome === 'win' ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 5) + 5;
      playerStatsManager.recordSimulatedMatch(outcome === 'win', acc, k, d);
      setIsSimulating(false);
      if (outcome === 'win') {
        soundManager.playVictory();
      }
    }, 450);
  };

  return (
    <div className="bg-gradient-to-b from-[#111c13] to-[#0a110c] rounded-2xl border-2 border-[#2b4430] p-4 shadow-2xl relative overflow-hidden">
      {/* Background Tactical Grid Lines */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #10b981 1px, transparent 1px), linear-gradient(to right, #2b4430 1px, transparent 1px), linear-gradient(to bottom, #2b4430 1px, transparent 1px)',
          backgroundSize: '24px 24px, 24px 24px, 24px 24px',
        }}
      />

      {/* Header with authentic military badge and telemetry status */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#213524] gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          {/* Authentic Tactical Crosshair Icon SVG */}
          <div className="w-9 h-9 rounded-xl bg-[#18281a] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Crosshair size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">
                لوحة القياس والبيانات البالستية (BALLISTIC HUD)
              </h3>
              <span className="bg-[#1b2b1d] border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-black px-2 py-0.5 rounded">
                RECHARTS VIZ
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              إحصائيات المعارك، حسم المواجهات، وتدرج دقة إصابة الأهداف
            </p>
          </div>
        </div>

        {/* Tactical Sub-tabs */}
        <div className="flex items-center bg-[#0d150f] p-1 rounded-xl border border-[#213524] self-start sm:self-auto">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setActiveTab('overview');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1e3321] text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setActiveTab('accuracy');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'accuracy'
                ? 'bg-[#1e3321] text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            مسار الدقة
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setActiveTab('zones');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'zones'
                ? 'bg-[#1e3321] text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            مناطق الإصابة
          </button>
        </div>
      </div>

      {/* 3 Prominent Real-time Metric Cards (Realistic Tactical HUD) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 relative z-10">
        {/* Wins Card */}
        <div className="bg-[#0e1711] border border-[#203624] hover:border-emerald-500/50 p-3 rounded-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-400">حسم الانتصارات</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Trophy size={13} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {stats.wins}
            </span>
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-500 font-mono block">
                {stats.winRate}% معدل الفوز
              </span>
              <span className="text-[10px] text-gray-500 font-mono">من {stats.totalMatches} مواجهة</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#162519] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.winRate}%` }}
            />
          </div>
        </div>

        {/* Losses Card */}
        <div className="bg-[#0e1711] border border-[#203624] hover:border-red-500/50 p-3 rounded-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:bg-red-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-400">الهزائم الميدانية</span>
            <div className="w-6 h-6 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
              <Skull size={13} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-400 font-mono tracking-tight">
              {stats.losses}
            </span>
            <div className="text-right">
              <span className="text-[11px] font-bold text-red-400/90 font-mono block">
                {100 - stats.winRate}% نسبة الهزيمة
              </span>
              <span className="text-[10px] text-gray-500 font-mono">سقوط بالمعارك</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#162519] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${100 - stats.winRate}%` }}
            />
          </div>
        </div>

        {/* Aim Accuracy Card */}
        <div className="bg-[#0e1711] border border-[#203624] hover:border-cyan-500/50 p-3 rounded-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-400">دقة التصويب الشاملة</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Target size={13} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
              {stats.overallAccuracy}%
            </span>
            <div className="text-right">
              <span className="text-[11px] font-bold text-amber-400 font-mono block">
                {stats.headshotRate}% رأس قاتل
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {stats.shotsHit} / {stats.shotsFired} إصابة
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#162519] h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.overallAccuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Section */}
      <div className="relative z-10 bg-[#0c140e] border border-[#213524] rounded-xl p-3 mb-3">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Donut Chart: Wins vs Losses */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-400" />
                  ميزان الحسم: انتصارات / هزائم
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  نسبة {((stats.wins / Math.max(1, stats.losses))).toFixed(1)} W/L
                </span>
              </div>

              <div className="relative w-full h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#0c140e"
                      strokeWidth={3}
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<TacticalTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-emerald-400 font-mono leading-none">
                    {stats.winRate}%
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    فوز ساحق
                  </span>
                </div>
              </div>

              {/* Legend with exact numbers */}
              <div className="flex items-center justify-center gap-4 text-xs font-bold mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-gray-300">انتصارات ({stats.wins})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-red-500" />
                  <span className="text-gray-300">هزائم ({stats.losses})</span>
                </div>
              </div>
            </div>

            {/* Tactical Combat Balance & Metrics breakdown */}
            <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-r border-[#1e3021] pt-3 lg:pt-0 lg:pr-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">مؤشرات الأداء التكتيكي للمقاتل</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                  معامل القتل {stats.kdRatio} K/D
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">إجمالي الأهداف التي تم تصفيتها (Kills)</span>
                    <span className="text-white font-mono font-bold">{stats.kills.toLocaleString()} قتيل</span>
                  </div>
                  <div className="w-full bg-[#18281a] h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-400 h-full"
                      style={{ width: `${Math.min(100, (stats.kills / (stats.kills + stats.deaths)) * 100)}%` }}
                    />
                    <div
                      className="bg-red-500/80 h-full"
                      style={{ width: `${Math.min(100, (stats.deaths / (stats.kills + stats.deaths)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">كفاءة الطلقات (Hit Efficiency)</span>
                    <span className="text-cyan-400 font-mono font-bold">{stats.overallAccuracy}% دقة إصابة</span>
                  </div>
                  <div className="w-full bg-[#18281a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${stats.overallAccuracy}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">ضربات الرأس القاتلة (Headshots Ratio)</span>
                    <span className="text-amber-400 font-mono font-bold">{stats.headshotRate}% من الإصابات</span>
                  </div>
                  <div className="w-full bg-[#18281a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${stats.headshotRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1a2b1d] flex items-center justify-between text-[11px] text-gray-400">
                <span>الذخيرة المستهلكة: <strong className="text-white font-mono">{stats.shotsFired.toLocaleString()}</strong> طلقة</span>
                <span>الطلقات النافذة: <strong className="text-emerald-400 font-mono">{stats.shotsHit.toLocaleString()}</strong> إصابة</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-cyan-400" />
                تطور دقة التصويب عبر آخر 7 مواجهات (ACCURACY TIMELINE)
              </span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> دقة المعركة
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> المعيار الميداني (70%)
                </span>
              </div>
            </div>

            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.accuracyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="matchLabel" stroke="#4b5563" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis domain={[50, 100]} stroke="#4b5563" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<TacticalTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    name="accuracy"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#accuracyGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="benchmark"
                    name="benchmark"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-1">
              معدل دقة المعارك الأخيرة مستقر عند <span className="text-cyan-400 font-mono font-bold">{stats.overallAccuracy}%</span> وتتجاوز المعيار المطلوب بنسبة +{stats.overallAccuracy - 70}%
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-emerald-400" />
                توزيع إصابات الجسد والأهداف (HIT ZONES ACCURACY)
              </span>
              <span className="text-[10px] text-gray-400">تحليل راداري بالستيات</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Bar chart of zones */}
              <div className="sm:col-span-8 h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hitZoneData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
                    <YAxis dataKey="zone" type="category" tick={{ fontSize: 11, fill: '#e5e7eb' }} width={90} />
                    <Tooltip content={<TacticalTooltip />} />
                    <Bar dataKey="rate" name="accuracy" radius={[0, 6, 6, 0]}>
                      {hitZoneData.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Realistic Tactical Anatomical Silhouette Diagram */}
              <div className="sm:col-span-4 bg-[#09100c] border border-[#1e3021] p-2.5 rounded-xl flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-gray-400 mb-1">مخطط التشريح التكتيكي</span>
                <div className="relative w-20 h-28 my-1 flex items-center justify-center">
                  {/* Soldier Silhouette Target SVG */}
                  <svg viewBox="0 0 100 140" className="w-full h-full">
                    {/* Head target */}
                    <circle cx="50" cy="22" r="14" fill="#f59e0b" opacity="0.8" />
                    <circle cx="50" cy="22" r="6" fill="#fff" opacity="0.9" />
                    <line x1="50" y1="4" x2="50" y2="40" stroke="#000" strokeWidth="1.5" />
                    <line x1="32" y1="22" x2="68" y2="22" stroke="#000" strokeWidth="1.5" />

                    {/* Torso target */}
                    <path
                      d="M 28 42 L 72 42 L 66 90 L 34 90 Z"
                      fill="#06b6d4"
                      opacity="0.8"
                    />
                    <circle cx="50" cy="62" r="10" fill="none" stroke="#fff" strokeWidth="1.5" />

                    {/* Limbs & legs */}
                    <path d="M 33 92 L 25 136 L 39 136 L 47 92 Z" fill="#10b981" opacity="0.8" />
                    <path d="M 67 92 L 75 136 L 61 136 L 53 92 Z" fill="#10b981" opacity="0.8" />
                    <path d="M 26 44 L 14 85 L 24 88 L 32 50 Z" fill="#10b981" opacity="0.7" />
                    <path d="M 74 44 L 86 85 L 76 88 L 68 50 Z" fill="#10b981" opacity="0.7" />
                  </svg>
                </div>
                <span className="text-[9px] text-gray-400">
                  <strong className="text-amber-400">31%</strong> رأس • <strong className="text-cyan-400">45%</strong> صدر • <strong className="text-emerald-400">24%</strong> أطراف
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Simulation & Test Strip for live data validation */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1c2c20]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400">اختبار تحديث البيانات البالستية:</span>
          <button
            onClick={() => handleSimulateMatch('win')}
            disabled={isSimulating}
            className="bg-[#122316] hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <Trophy size={13} className="text-emerald-400" />
            <span>تسجيل فوز (+1 Win)</span>
          </button>
          <button
            onClick={() => handleSimulateMatch('loss')}
            disabled={isSimulating}
            className="bg-[#241313] hover:bg-red-900/50 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <Skull size={13} className="text-red-400" />
            <span>تسجيل هزيمة (+1 Loss)</span>
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            haptics.light();
            playerStatsManager.resetToDefault();
          }}
          className="text-gray-400 hover:text-gray-200 text-[11px] flex items-center gap-1 py-1 px-2 rounded hover:bg-[#142017] transition-colors font-mono cursor-pointer"
        >
          <RotateCw size={12} />
          <span>استعادة السجل الافتراضي</span>
        </button>
      </div>
    </div>
  );
}
