import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface PlayerStats {
  id: string;
  name: string;
  kills: number;
  deaths: number;
  health: number;
  isPlayer: boolean;
}

interface LiveMatchLeaderboardProps {
  players?: PlayerStats[];
}

export const LiveMatchLeaderboard: React.FC<LiveMatchLeaderboardProps> = React.memo(({ players }) => {
  if (!players || players.length === 0) return null;

  // Sort players by kills descending, and filter out bots (isPlayer === false)
  const sortedPlayers = [...players]
    .filter((player) => player.isPlayer)
    .sort((a, b) => b.kills - a.kills);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-20 right-4 z-30 bg-black/70 backdrop-blur-md p-3 rounded-xl border border-emerald-500/30 text-right min-w-[180px] shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
        <Trophy size={16} className="text-amber-400" />
        <span className="text-xs font-black text-white">ترتيب المعركة</span>
      </div>
      
      <div className="space-y-1.5">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              className={`flex items-center justify-between text-[11px] font-bold p-1 rounded ${
                player.isPlayer ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-gray-500 w-3">{index + 1}</span>
                <span className="truncate max-w-[80px]">{player.name}</span>
              </div>
              <span className="font-mono font-black text-amber-400">{player.kills}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
