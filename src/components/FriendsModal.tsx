import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, MessageSquare, Swords, Shield, Check, Circle, Copy, Trash2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { MiniMilitiaDoodleSoldier } from './MiniMilitiaDoodleSoldier';
import { settingsManager } from '../utils/settingsManager';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteFriend: (friendName: string) => void;
}

interface Friend {
  id: string;
  name: string;
  playerId: string;
  status: 'online' | 'in-game' | 'in-store' | 'offline';
  level: number;
  rank: string;
  avatar: string;
}

const INITIAL_FRIENDS: Friend[] = [
  { id: '1', name: 'Ghost_Sniper', playerId: '#MMA-9241', status: 'online', level: 64, rank: 'Conqueror 👑', avatar: '/images/commando_avatar.jpg' },
  { id: '2', name: 'Viper_99', playerId: '#MMA-4819', status: 'in-game', level: 52, rank: 'Ace ⚡', avatar: '/images/commando_avatar.jpg' },
  { id: '3', name: 'Shadow_Falcon', playerId: '#MMA-3012', status: 'in-store', level: 48, rank: 'Crown 🌟', avatar: '/images/commando_avatar.jpg' },
  { id: '4', name: 'Zero_Cool', playerId: '#MMA-7740', status: 'offline', level: 39, rank: 'Diamond 💎', avatar: '/images/commando_avatar.jpg' },
  { id: '5', name: 'Alpha_Wolf', playerId: '#MMA-1092', status: 'online', level: 71, rank: 'Conqueror 👑', avatar: '/images/commando_avatar.jpg' },
];

export const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose, onInviteFriend }) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('mini_militia_friends_list_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_FRIENDS;
  });

  const [friendNameInput, setFriendNameInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync with storage on friends updates
  useEffect(() => {
    localStorage.setItem('mini_militia_friends_list_v2', JSON.stringify(friends));
  }, [friends]);

  if (!isOpen) return null;

  const currentSettings = settingsManager.getSettings();

  // Deterministic Player ID generator based on username
  const getPlayerId = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const code = Math.abs(hash % 10000).toString().padStart(4, '0');
    return `#MMA-${code}`;
  };

  const myPlayerId = getPlayerId(currentSettings.playerName || 'Player');

  const handleCopyMyId = () => {
    soundManager.playButtonClick();
    haptics.light();
    navigator.clipboard.writeText(myPlayerId);
    setToastMsg('📋 تم نسخ معرف اللاعب الخاص بك!');
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const input = friendNameInput.trim();
    if (!input) return;
    
    soundManager.playButtonClick();
    haptics.medium();

    // Check if input is in format "Name #ID" or just name
    let name = input;
    let playerId = `#MMA-${Math.floor(1000 + Math.random() * 9000)}`;

    if (input.includes('#')) {
      const parts = input.split('#');
      name = parts[0].trim() || 'لاعب تكتيكي';
      playerId = '#' + parts[1].trim();
    }

    // Check if friend already exists
    if (friends.some((f) => f.name.toLowerCase() === name.toLowerCase() || f.playerId === playerId)) {
      setToastMsg('❌ هذا اللاعب صديقك بالفعل أو المعرّف مكرر!');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    const randomLevels = [14, 25, 38, 45, 59, 72];
    const randomRanks = ['Gold II 🏅', 'Platinum IV 🎖️', 'Diamond II 💎', 'Master I 👑', 'Heroic ⚡'];
    const randomStatuses: ('online' | 'in-game' | 'offline')[] = ['online', 'in-game', 'offline'];

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: name,
      playerId: playerId,
      status: randomStatuses[Math.floor(Math.random() * randomStatuses.length)],
      level: randomLevels[Math.floor(Math.random() * randomLevels.length)],
      rank: randomRanks[Math.floor(Math.random() * randomRanks.length)],
      avatar: '/images/soldier_avatar.jpg',
    };

    setFriends([newFriend, ...friends]);
    setFriendNameInput('');
    setToastMsg('👥 تم إضافة الصديق الجديد وقائمة الاتصال بنجاح!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleRemoveFriend = (id: string) => {
    soundManager.playButtonClick();
    haptics.medium();
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setToastMsg('🗑️ تم إزالة الصديق من القائمة التكتيكية.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#121c15] via-[#0a130e] to-[#070b09] border-2 border-emerald-500/75 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.35)] p-5 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#223526] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Users size={20} />
              </div>
              <h3 className="text-base font-black text-white">قائمة الأصدقاء والكتيبة (Friends)</h3>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#18261d] hover:bg-[#23382b] text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* User's Own ID Widget */}
          <div className="bg-[#0a110c] border border-[#223525] p-3 rounded-2xl mb-4 flex items-center justify-between">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-bold">المعرف الخاص بك (My Player ID):</span>
              <span className="text-sm font-mono font-black text-amber-400 tracking-wider">
                {myPlayerId}
              </span>
            </div>
            <button
              onClick={handleCopyMyId}
              className="p-2 rounded-xl bg-[#132117] hover:bg-emerald-950 text-emerald-400 border border-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer"
              title="نسخ المعرف"
            >
              <Copy size={13} />
              <span>نسخ المعرف</span>
            </button>
          </div>

          {/* Add Friend Input */}
          <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="أدخل الاسم ومعرّف الصديق (مثال: Gamer #4819)..."
              value={friendNameInput}
              onChange={(e) => setFriendNameInput(e.target.value)}
              className="flex-1 bg-[#09110d] border border-[#233526] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-right"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-black font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <UserPlus size={14} />
              <span>إضافة</span>
            </button>
          </form>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar pr-1">
            {friends.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Users className="mx-auto text-gray-600" size={32} />
                <p className="text-xs text-gray-400 font-bold">لا يوجد أصدقاء مضافين حالياً</p>
                <p className="text-[10px] text-gray-500">أدخل معرّف صديقك لإضافته فورياً للكتيبة</p>
              </div>
            ) : (
              friends.map((f) => (
                <div
                  key={f.id}
                  className="bg-[#121c15] hover:bg-[#17251c] p-3 rounded-2xl border border-[#223525] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-xl bg-[#0a110c] border border-[#253928] flex items-center justify-center overflow-hidden shrink-0">
                      <MiniMilitiaDoodleSoldier className="w-9 h-9 transform scale-110 translate-y-0.5" />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121c15] ${
                          f.status === 'online'
                            ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                            : f.status === 'in-game'
                            ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                            : f.status === 'in-store'
                            ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                            : 'bg-gray-500'
                        }`}
                      />
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{f.name}</span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800 font-mono font-bold">
                          LV.{f.level}
                        </span>
                        
                        {/* Live Status Badge */}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                          f.status === 'online'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                            : f.status === 'in-game'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-500/20'
                            : f.status === 'in-store'
                            ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/20'
                            : 'bg-neutral-900 text-gray-500 border border-neutral-800'
                        }`}>
                          {f.status === 'online' && 'في اللوبي 🟢'}
                          {f.status === 'in-game' && 'في معركة ⚔️'}
                          {f.status === 'in-store' && 'في المتجر 🛒'}
                          {f.status === 'offline' && 'غير متصل ⚪'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-gray-400 font-mono font-bold">{f.playerId}</span>
                        <span className="text-gray-600 text-[8px]">•</span>
                        <span className="text-[9px] text-emerald-400 font-bold">{f.rank}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        onInviteFriend(f.name);
                        onClose();
                      }}
                      disabled={f.status === 'offline'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                        f.status === 'offline'
                          ? 'bg-[#152018] text-gray-600 border border-[#1e3022]/40 cursor-not-allowed'
                          : f.status === 'in-game'
                          ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow active:scale-95'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer shadow active:scale-95'
                      }`}
                    >
                      <Swords size={13} />
                      <span>
                        {f.status === 'online' && 'دعوة للانضمام'}
                        {f.status === 'in-game' && 'طلب انضمام'}
                        {f.status === 'offline' && 'غير متصل'}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFriend(f.id)}
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 hover:text-red-300 transition-all active:scale-95 cursor-pointer"
                      title="حذف الصديق"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black text-xs shadow-xl whitespace-nowrap z-50 border border-emerald-300"
            >
              {toastMsg}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

