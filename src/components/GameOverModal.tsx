import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Skull,
  RotateCcw,
  Home,
  Target,
  Zap,
  Award,
  Medal,
  Swords,
  Copy,
  CheckCircle2,
  BarChart3,
  Flame,
  Shield,
  Sparkles,
  ChevronLeft,
  User,
  Star,
  Activity,
  Crosshair,
} from 'lucide-react';
import * as d3 from 'd3';
import { GameMode } from '../types';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';

export interface ScoreboardPlayerStats {
  id: string;
  name: string;
  kills: number;
  deaths: number;
  damageDealt: number;
  headshots: number;
  maxKillStreak: number;
  camoColor: string;
  isPlayer: boolean;
  team: string;
}

interface GameOverModalProps {
  isVictory: boolean;
  score: number;
  kills: number;
  deaths: number;
  mode: GameMode;
  wave?: number;
  mvpName?: string;
  mvpKills?: number;
  allPlayersStats?: ScoreboardPlayerStats[];
  onRestart: () => void;
  onQuit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  score,
  kills,
  deaths,
  mode,
  wave,
  mvpName,
  mvpKills,
  allPlayersStats,
  onRestart,
  onQuit,
}) => {
  const [activeTab, setActiveTab] = useState<'scoreboard' | 'analytics' | 'awards'>('scoreboard');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fallback player stats generator if allPlayersStats is not provided
  const playersList: ScoreboardPlayerStats[] = (allPlayersStats && allPlayersStats.length > 0)
    ? allPlayersStats.slice().sort((a, b) => b.kills - a.kills || b.damageDealt - a.damageDealt)
    : [
        {
          id: 'player-1',
          name: 'العقيد صخر (أنت)',
          kills: kills,
          deaths: deaths,
          damageDealt: kills * 140 + Math.floor(Math.random() * 90),
          headshots: Math.floor(kills * 0.35),
          maxKillStreak: Math.max(1, Math.floor(kills * 0.6)),
          camoColor: '#15803d',
          isPlayer: true,
          team: 'ffa',
        },
        {
          id: 'player-2',
          name: 'صخر (Rex P2)',
          kills: Math.max(0, kills - 2),
          deaths: deaths + 1,
          damageDealt: Math.max(0, kills - 2) * 115 + 60,
          headshots: Math.floor(kills * 0.2),
          maxKillStreak: 2,
          camoColor: '#b91c1c',
          isPlayer: false,
          team: 'ffa',
        },
        {
          id: 'player-3',
          name: 'الشبح (Ghost P3)',
          kills: Math.max(0, kills - 1),
          deaths: deaths + 2,
          damageDealt: Math.max(0, kills - 1) * 125 + 40,
          headshots: Math.floor(kills * 0.25),
          maxKillStreak: 3,
          camoColor: '#ca8a04',
          isPlayer: false,
          team: 'ffa',
        },
        {
          id: 'player-4',
          name: 'الفهد (Viper P4)',
          kills: Math.max(0, kills - 3),
          deaths: deaths + 3,
          damageDealt: Math.max(0, kills - 3) * 100 + 20,
          headshots: 1,
          maxKillStreak: 1,
          camoColor: '#0284c7',
          isPlayer: false,
          team: 'ffa',
        },
      ].sort((a, b) => b.kills - a.kills);

  // Calculate user XP and match reward bonuses
  const matchXP = (isVictory ? 500 : 220) + kills * 60 + Math.floor(kills * 0.35) * 40;

  // Track match kills history for D3 graph
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mini_militia_history');
      let currentHistory: number[] = stored ? JSON.parse(stored) : [];
      currentHistory.push(kills);
      if (currentHistory.length > 6) {
        currentHistory = currentHistory.slice(currentHistory.length - 6);
      }
      localStorage.setItem('mini_militia_history', JSON.stringify(currentHistory));
      setHistory(currentHistory);
    } catch (e) {
      console.error('Failed to load/save match history:', e);
    }
  }, [kills]);

  // Render D3 Performance Trend Chart
  useEffect(() => {
    if (activeTab !== 'analytics' || !svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 340;
    const height = 110;
    const margin = { top: 12, right: 12, bottom: 24, left: 30 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, Math.max(1, history.length - 1)])
      .range([0, innerWidth]);

    const maxKills = Math.max(...history, 6);
    const y = d3.scaleLinear().domain([0, maxKills]).range([innerHeight, 0]);

    const line = d3
      .line<number>()
      .x((d, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(3).tickSize(-innerWidth).tickFormat(() => ''))
      .attr('color', '#1e293b')
      .attr('stroke-dasharray', '3,3');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(history.length)
          .tickFormat((d) => `G#${Number(d) + 1}`)
      )
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    g.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat(d3.format('d')))
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    // Gradient area under line
    const area = d3
      .area<number>()
      .x((d, i) => x(i))
      .y0(innerHeight)
      .y1((d) => y(d))
      .curve(d3.curveMonotoneX);

    const defs = svg.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', 'chartGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.4);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0);

    g.append('path').datum(history).attr('fill', 'url(#chartGrad)').attr('d', area);

    // Trend line
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', '#34d399')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Data points
    g.selectAll('circle')
      .data(history)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => x(i))
      .attr('cy', (d) => y(d))
      .attr('r', 4.5)
      .attr('fill', '#059669')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);
  }, [activeTab, history]);

  // Copy Match Summary to Clipboard
  const handleCopySummary = () => {
    soundManager.playButtonClick();
    haptics.light();

    const topPlayer = playersList[0];
    const text = `🏆 ملخص معركة Mini Battle Arena:
🥇 الأول: ${topPlayer.name} (${topPlayer.kills} قتلى | ${topPlayer.damageDealt} ضرر)
🎯 أداءك: ${kills} قتلى | ${deaths} وفيات | K/D: ${
      deaths === 0 ? kills : (kills / deaths).toFixed(2)
    }
🎖️ الخبرة المكتسبة: +${matchXP} XP`;

    navigator.clipboard?.writeText?.(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const selectedPlayer = playersList.find((p) => p.id === selectedPlayerId) || playersList[0];

  return (
    <div
      id="game-over-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none overflow-y-auto no-scrollbar"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        className="w-full max-w-xl bg-[#0b140d] border-2 border-[#223d27] rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(16,185,129,0.25)] flex flex-col my-auto text-right space-y-4"
      >
        {/* Banner Victory Header */}
        <div className="flex items-center justify-between border-b border-[#1b3120] pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
                isVictory
                  ? 'bg-amber-500/20 text-amber-400 border-amber-400/80 shadow-amber-500/30'
                  : 'bg-rose-500/20 text-rose-500 border-rose-500/80 shadow-rose-500/30'
              }`}
            >
              {isVictory ? <Trophy size={32} className="animate-bounce" /> : <Skull size={32} />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isVictory
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {isVictory ? 'انتصار عسكري ساحق 🏆' : 'انتهت المعركة 💀'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {mode === 'deathmatch' ? 'FFA قتال حر' : mode === 'team' ? 'فرق 4v4' : 'بقاء'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                لوحة الترتيب والنتائج التكتيكية
              </h2>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 bg-[#142317] hover:bg-[#1c3321] text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="مشاركة وتصدير النتيجة"
          >
            {copiedToast ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span className="hidden sm:inline">{copiedToast ? 'تم النسخ!' : 'نسخ الملخص'}</span>
          </button>
        </div>

        {/* Navigation Tabs (جدول الترتيب | التحليل البياني | الأوسمة والإنجازات) */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#101c13] p-1 rounded-2xl border border-[#1a2d1f]">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setActiveTab('scoreboard');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'scoreboard'
                ? 'bg-emerald-500 text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords size={14} />
            <span>لوحة النتائج</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setActiveTab('analytics');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-emerald-500 text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 size={14} />
            <span>التحليل البياني</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              setActiveTab('awards');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'awards'
                ? 'bg-emerald-500 text-black shadow-lg font-black'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award size={14} />
            <span>الأوسمة والجوائز</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE SCOREBOARD TABLE (لوحة النتائج التفاعلية) */}
        {activeTab === 'scoreboard' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Player Leaderboard Table */}
            <div className="bg-[#101c13] border border-[#1b3120] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-[#15251a] px-3 py-2 text-[10px] font-black text-gray-400 border-b border-[#1f3624] text-center">
                <span className="col-span-1 text-right">#</span>
                <span className="col-span-4 text-right">اللاعب / المحارب</span>
                <span className="col-span-2">القتلى 🎯</span>
                <span className="col-span-2">الوفيات 💀</span>
                <span className="col-span-3">الضرر / K/D</span>
              </div>

              <div className="divide-y divide-[#17271b]">
                {playersList.map((p, idx) => {
                  const rank = idx + 1;
                  const kd = p.deaths === 0 ? p.kills : (p.kills / p.deaths).toFixed(1);
                  const isSelected = p.id === (selectedPlayerId || playersList[0].id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        soundManager.playButtonClick();
                        haptics.light();
                        setSelectedPlayerId(p.id);
                      }}
                      className={`grid grid-cols-12 items-center px-3 py-2.5 text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/70 border-r-4 border-emerald-400'
                          : 'hover:bg-[#142318]'
                      } ${p.isPlayer ? 'font-black text-white' : 'text-gray-300'}`}
                    >
                      {/* Rank Badge */}
                      <div className="col-span-1 flex items-center text-right font-black">
                        {rank === 1 ? (
                          <span className="text-amber-400 flex items-center gap-0.5">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 flex items-center gap-0.5">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-700 flex items-center gap-0.5">🥉</span>
                        ) : (
                          <span className="text-gray-500 font-mono">#{rank}</span>
                        )}
                      </div>

                      {/* Player Name & Badge */}
                      <div className="col-span-4 flex items-center gap-2 truncate text-right">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
                          style={{ backgroundColor: p.camoColor }}
                        />
                        <span className="truncate">{p.name}</span>
                        {rank === 1 && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 rounded font-bold">
                            MVP
                          </span>
                        )}
                      </div>

                      {/* Kills */}
                      <span className="col-span-2 text-center font-mono font-black text-emerald-400">
                        {p.kills}
                      </span>

                      {/* Deaths */}
                      <span className="col-span-2 text-center font-mono text-rose-400 font-bold">
                        {p.deaths}
                      </span>

                      {/* Damage & K/D */}
                      <div className="col-span-3 text-center flex flex-col font-mono text-[11px]">
                        <span className="text-amber-300 font-bold">{p.damageDealt} HP</span>
                        <span className="text-gray-400 text-[9px]">K/D: {kd}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Player Detail Card Breakdown */}
            {selectedPlayer && (
              <div className="bg-[#121f15] border border-[#213a26] rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md border"
                    style={{ backgroundColor: selectedPlayer.camoColor, borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{selectedPlayer.name}</span>
                      {selectedPlayer.isPlayer && (
                        <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-black">
                          أنت
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      أعلى سلسلة قتل: {selectedPlayer.maxKillStreak} • إتاحة الرأس: {selectedPlayer.headshots}
                    </p>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs font-black text-emerald-400 block">
                    +{selectedPlayer.kills * 100} نقطة
                  </span>
                  <span className="text-[10px] text-gray-400">
                    الضرر: {selectedPlayer.damageDealt} HP
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: ANALYTICS & XP PROGRESSION (التحليل البياني والخبرة) */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* D3 Chart Card */}
            <div className="bg-[#101c13] border border-[#1b3120] rounded-2xl p-3 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-400" />
                  <span>تطور القتلى في آخر {history.length} جولات</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">المعدل: {kills} قتيل</span>
              </div>

              <svg ref={svgRef} width="340" height="110" className="w-full h-auto"></svg>
            </div>

            {/* Match XP Rewards Card */}
            <div className="bg-[#101c13] border border-[#1b3120] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={15} />
                  <span>مكافآت الخبرة والترقية (Match XP):</span>
                </span>
                <span className="text-sm font-black text-amber-400 font-mono">+{matchXP} XP 🌟</span>
              </div>

              <div className="w-full h-2.5 bg-[#09100a] rounded-full overflow-hidden border border-[#1c3321] p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(25, (matchXP / 800) * 100))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-400 font-mono pt-1">
                <div className="bg-[#0b140e] p-1.5 rounded-lg border border-[#17271b]">
                  <span className="block text-white font-bold">+{isVictory ? 500 : 220} XP</span>
                  <span>مكافأة الجولة</span>
                </div>
                <div className="bg-[#0b140e] p-1.5 rounded-lg border border-[#17271b]">
                  <span className="block text-emerald-400 font-bold">+{kills * 60} XP</span>
                  <span>القتلى ({kills})</span>
                </div>
                <div className="bg-[#0b140e] p-1.5 rounded-lg border border-[#17271b]">
                  <span className="block text-cyan-400 font-bold">
                    +{Math.floor(kills * 0.35) * 40} XP
                  </span>
                  <span>إصابات الرأس</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: MATCH AWARDS & MEDALS (الأوسمة والجوائز) */}
        {activeTab === 'awards' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2.5"
          >
            {/* Award 1: MVP Badge */}
            <div className="bg-[#101c13] border border-amber-500/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <Medal size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-300">نجم الجولة (Match MVP)</h4>
                <p className="text-[10px] text-gray-400">{mvpName || 'العقيد صخر'}</p>
              </div>
            </div>

            {/* Award 2: Sharp Shooter */}
            <div className="bg-[#101c13] border border-cyan-500/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                <Crosshair size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-cyan-300">القناص الدقيق</h4>
                <p className="text-[10px] text-gray-400">{Math.floor(kills * 0.35)} إصابة رأسية 🎯</p>
              </div>
            </div>

            {/* Award 3: Rampage Streak */}
            <div className="bg-[#101c13] border border-rose-500/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400">
                <Flame size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-300">سلسلة القتل الحامي</h4>
                <p className="text-[10px] text-gray-400">أعلى سلسلة: {Math.max(1, Math.floor(kills * 0.6))}</p>
              </div>
            </div>

            {/* Award 4: Iron Wall */}
            <div className="bg-[#101c13] border border-emerald-500/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                <Shield size={22} />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-300">الصامد التكتيكي</h4>
                <p className="text-[10px] text-gray-400">درع الحماية والدفاع 🛡️</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            id="btn-play-again"
            onClick={() => {
              soundManager.playButtonClick();
              haptics.medium();
              onRestart();
            }}
            className="py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>معركة جديدة (Play Again)</span>
          </button>

          <button
            id="btn-game-over-quit"
            onClick={() => {
              soundManager.playButtonClick();
              haptics.light();
              onQuit();
            }}
            className="py-3 rounded-2xl bg-[#142317] hover:bg-[#1b2f20] border border-[#233d28] text-gray-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Home size={16} />
            <span>القائمة الرئيسية</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
