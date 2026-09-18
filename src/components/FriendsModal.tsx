import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, MessageSquare, Swords, Shield, Check, Circle } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { MiniMilitiaDoodleSoldier } from './MiniMilitiaDoodleSoldier';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteFriend: (friendName: string) => void;
}

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'in-game' | 'offline';
  level: number;
  rank: string;
  avatar: string;
}

const INITIAL_FRIENDS: Friend[] = [
  { id: '1', name: 'Ghost_Sniper', status: 'online', level: 64, rank: 'Conqueror 👑', avatar: '/images/commando_avatar.jpg' },
  { id: '2', name: 'Viper_99', status: 'in-game', level: 52, rank: 'Ace ⚡', avatar: '/images/commando_avatar.jpg' },
  { id: '3', name: 'ShadowKiller', status: 'online', level: 48, rank: 'Crown 🌟', avatar: '/images/commando_avatar.jpg' },
  { id: '4', name: 'Zero_Cool', status: 'offline', level: 39, rank: 'Diamond 💎', avatar: '/images/commando_avatar.jpg' },
  { id: '5', name: 'Alpha_Wolf', status: 'online', level: 71, rank: 'Conqueror 👑', avatar: '/images/commando_avatar.jpg' },
];

export const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose, onInviteFriend }) => {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendNameInput.trim()) return;
    soundManager.playButtonClick();
    haptics.medium();

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: friendNameInput.trim(),
      status: 'online',
      level: 12,
      rank: 'Gold 🏅',
      avatar: '/images/soldier_avatar.jpg',
    };

    setFriends([newFriend, ...friends]);
    setFriendNameInput('');
    setToastMsg('👥 تم إرسال طلب الصداقة بنجاح!');
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

          {/* Add Friend Input */}
          <form onSubmit={handleAddFriend} className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="أدخل اسم الصديق أو الـ ID..."
              value={friendNameInput}
              onChange={(e) => setFriendNameInput(e.target.value)}
              className="flex-1 bg-[#09110d] border border-[#233526] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-black font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>إضافة</span>
            </button>
          </form>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar pr-1">
            {friends.map((f) => (
              <div
                key={f.id}
                className="bg-[#121c15] hover:bg-[#17251c] p-3 rounded-2xl border border-[#223525] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-[#0a110c] border border-[#253928] flex items-center justify-center overflow-hidden">
                    <MiniMilitiaDoodleSoldier className="w-8 h-8 transform scale-110 translate-y-0.5" />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                        f.status === 'online'
                          ? 'bg-emerald-500'
                          : f.status === 'in-game'
                          ? 'bg-amber-400'
                          : 'bg-gray-500'
                      }`}
                    />
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{f.name}</span>
                      <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800 font-mono">
                        LV.{f.level}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">{f.rank}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      onInviteFriend(f.name);
                      onClose();
                    }}
                    disabled={f.status === 'offline'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                      f.status === 'offline'
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer shadow'
                    }`}
                  >
                    <Swords size={13} />
                    <span>دعوة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black text-xs shadow-xl"
            >
              {toastMsg}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
