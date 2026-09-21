import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  UserPlus,
  Swords,
  Shield,
  Check,
  Copy,
  Trash2,
  Lock,
  Sparkles,
  Share2,
  Send,
  Play,
  Settings,
  MapPin,
  Clock,
  Target,
  RefreshCw,
  Gift
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { MiniMilitiaDoodleSoldier } from './MiniMilitiaDoodleSoldier';
import { settingsManager } from '../utils/settingsManager';
import { friendsAndRoomsManager } from '../utils/friendsAndRoomsManager';

export interface Friend {
  id: string;
  name: string;
  playerId: string;
  status: 'online' | 'in-game' | 'in-store' | 'offline';
  level: number;
  rank: string;
  avatar: string;
  currentRoom?: string;
}

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteFriend: (friendName: string) => void;
  onStartPrivateRoom?: (roomConfig: {
    roomCode: string;
    mode: string;
    map: string;
    targetScore: number;
    durationMinutes: number;
    invitedFriends: string[];
  }) => void;
}

const INITIAL_FRIENDS: Friend[] = [
  { id: '1', name: 'Ghost_Sniper', playerId: '#MMA-9241', status: 'online', level: 64, rank: 'Conqueror 👑', avatar: '/images/commando_avatar.jpg' },
  { id: '2', name: 'Viper_99', playerId: '#MMA-4819', status: 'in-game', level: 52, rank: 'Ace ⚡', avatar: '/images/commando_avatar.jpg' },
  { id: '3', name: 'Shadow_Falcon', playerId: '#MMA-3012', status: 'in-store', level: 48, rank: 'Crown 🌟', avatar: '/images/commando_avatar.jpg' },
  { id: '4', name: 'Zero_Cool', playerId: '#MMA-7740', status: 'offline', level: 39, rank: 'Diamond 💎', avatar: '/images/commando_avatar.jpg' },
  { id: '5', name: 'Alpha_Wolf', playerId: '#MMA-1092', status: 'online', level: 71, rank: 'Conqueror 👑', avatar: '/images/commando_avatar.jpg' },
];

const AVAILABLE_MAPS = [
  { id: 'Dust Arena', name: 'ساحة الغبار (Dust Arena)', icon: '🏜️', desc: 'معارك قريبة وسريعة' },
  { id: 'Outpost Complex', name: 'المجمع العسكري (Outpost)', icon: '🏢', desc: 'ممرات متعددة الطوابق' },
  { id: 'Catacombs', name: 'السرداب المظلم (Catacombs)', icon: '🏛️', desc: 'أنفاق ضيقة وكمائن' },
  { id: 'High Tower', name: 'البرج المرتفع (High Tower)', icon: '🗼', desc: 'طيران نفاث وقتال جوي' },
];

const GAME_MODES = [
  { id: '1v1 Deathmatch', name: 'مبارزة فردية 1v1 ⚔️', maxPlayers: 2, icon: '🎯' },
  { id: 'Team Deathmatch', name: 'معركة فرق 2v2 🛡️', maxPlayers: 4, icon: '👥' },
  { id: 'Sniper Only', name: 'قناص فقط 🎯', maxPlayers: 4, icon: '🔭' },
  { id: 'Rocket Havoc', name: 'صواريخ دمار 🚀', maxPlayers: 4, icon: '💥' },
];

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  onInviteFriend,
  onStartPrivateRoom,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'private_room' | 'add_friend'>('friends');
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

  // Private Room State
  const [selectedMode, setSelectedMode] = useState('1v1 Deathmatch');
  const [selectedMap, setSelectedMap] = useState('Dust Arena');
  const [matchDuration, setMatchDuration] = useState(5);
  const [targetKills, setTargetKills] = useState(15);
  const [roomCode, setRoomCode] = useState(() => `MMA-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedFriendsForRoom, setSelectedFriendsForRoom] = useState<string[]>([]);
  const [invitedStatusMap, setInvitedStatusMap] = useState<Record<string, boolean>>({});

  const [friendNameInput, setFriendNameInput] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync friends to local storage
  useEffect(() => {
    localStorage.setItem('mini_militia_friends_list_v2', JSON.stringify(friends));
  }, [friends]);

  if (!isOpen) return null;

  const currentSettings = settingsManager.getSettings();

  const getPlayerId = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const code = Math.abs(hash % 10000).toString().padStart(4, '0');
    return `#MMA-${code}`;
  };

  const myPlayerId = getPlayerId(currentSettings.playerName || 'Player');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleCopyMyId = () => {
    soundManager.playButtonClick();
    haptics.light();
    navigator.clipboard.writeText(myPlayerId);
    showToast('📋 تم نسخ معرّف اللاعب الخاص بك!');
  };

  const handleCopyRoomCode = () => {
    soundManager.playButtonClick();
    haptics.light();
    navigator.clipboard.writeText(roomCode);
    showToast(`🔒 تم نسخ كود القاعة الخاصة (${roomCode})! شاركه مع أصدقائك`);
  };

  const handleRegenerateRoomCode = () => {
    soundManager.playButtonClick();
    haptics.light();
    const newCode = `MMA-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(newCode);
    showToast(`⚡ تم توليد كود قاعة جديدة: ${newCode}`);
  };

  const handleToggleFriendSelection = (friendId: string) => {
    soundManager.playButtonClick();
    haptics.light();
    setSelectedFriendsForRoom((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSendPrivateRoomInvites = () => {
    if (selectedFriendsForRoom.length === 0) {
      showToast('⚠️ يرجى اختيار صديق واحد على الأقل لإرسال الدعوة!');
      return;
    }

    soundManager.playButtonClick();
    haptics.medium();

    selectedFriendsForRoom.forEach((id) => {
      const friend = friends.find((f) => f.id === id);
      if (friend) {
        setInvitedStatusMap((prev) => ({ ...prev, [id]: true }));
        onInviteFriend(`${friend.name} (قاعة خاصة #${roomCode})`);
      }
    });

    showToast(`📨 تم إرسال دعوات القاعة الخاصة #${roomCode} للأصدقاء المحددين! 🚀`);
  };

  const handleLaunchPrivateRoom = () => {
    soundManager.playButtonClick();
    haptics.heavy();

    if (onStartPrivateRoom) {
      onStartPrivateRoom({
        roomCode,
        mode: selectedMode,
        map: selectedMap,
        targetScore: targetKills,
        durationMinutes: matchDuration,
        invitedFriends: selectedFriendsForRoom.map((id) => friends.find((f) => f.id === id)?.name || id),
      });
      onClose();
    } else {
      // Fallback
      onInviteFriend(`قاعة خاصة #${roomCode}`);
      showToast(`🎮 جاري بدء القاعة الخاصة #${roomCode}... استعد للمعركة!`);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const input = friendNameInput.trim();
    if (!input) return;

    soundManager.playButtonClick();
    haptics.medium();

    let name = input;
    let playerId = `#MMA-${Math.floor(1000 + Math.random() * 9000)}`;

    if (input.includes('#')) {
      const parts = input.split('#');
      name = parts[0].trim() || 'لاعب تكتيكي';
      playerId = '#' + parts[1].trim();
    }

    if (friends.some((f) => f.name.toLowerCase() === name.toLowerCase() || f.playerId === playerId)) {
      showToast('❌ هذا اللاعب صديقك بالفعل أو المعرّف مكرر!');
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
    showToast('👥 تم إضافة الصديق الجديد بنجاح!');
  };

  const handleRemoveFriend = (id: string) => {
    soundManager.playButtonClick();
    haptics.medium();
    setFriends((prev) => prev.filter((f) => f.id !== id));
    showToast('🗑️ تم إزالة الصديق من القائمة.');
  };

  const onlineFriends = friends.filter((f) => f.status === 'online');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#121c15] via-[#0a130e] to-[#070b09] border-2 border-emerald-500/80 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.35)] p-4 sm:p-5 flex flex-col max-h-[90vh] overflow-hidden text-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#223526] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <span>الأصدقاء والقاعات الخاصة</span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                    Private Rooms
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">ادعُ أصدقاءك للعب معاً في غرف خاصة مخصصة ⚔️</p>
              </div>
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#09110d] p-1.5 rounded-2xl border border-[#233526] mb-3">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('friends');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#121c15]'
              }`}
            >
              <Users size={14} />
              <span>الأصدقاء ({onlineFriends.length}/{friends.length})</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('private_room');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'private_room'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-lg font-black'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-[#121c15]'
              }`}
            >
              <Lock size={14} />
              <span>قاعة خاصة 🔒</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('add_friend');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'add_friend'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#121c15]'
              }`}
            >
              <UserPlus size={14} />
              <span>إضافة صديق</span>
            </button>
          </div>

          {/* TAB 1: FRIENDS LIST */}
          {activeTab === 'friends' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              {/* User's ID Bar */}
              <div className="bg-[#0a110c] border border-[#223525] p-2.5 rounded-2xl flex items-center justify-between">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-bold">معرّف حسابك (Player ID):</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-400 tracking-wider">
                    {myPlayerId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMyId}
                    className="px-2.5 py-1.5 rounded-xl bg-[#132117] hover:bg-emerald-950 text-emerald-400 border border-emerald-500/30 active:scale-95 transition-all flex items-center gap-1 text-xs font-black cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>نسخ</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      setActiveTab('private_room');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Lock size={12} />
                    <span>إنشاء قاعة خاصة</span>
                  </button>
                </div>
              </div>

              {/* Friends Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
                {friends.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Users className="mx-auto text-gray-600" size={36} />
                    <p className="text-xs text-gray-400 font-bold">لا يوجد أصدقاء مضافين حالياً</p>
                    <p className="text-[10px] text-gray-500">استخدم تبويب "إضافة صديق" لإدخال معرّف صديقك</p>
                  </div>
                ) : (
                  friends.map((f) => (
                    <div
                      key={f.id}
                      className="bg-[#121c15] hover:bg-[#17251c] p-3 rounded-2xl border border-[#223525] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-[#0a110c] border border-[#253928] flex items-center justify-center overflow-hidden shrink-0">
                          <MiniMilitiaDoodleSoldier className="w-8 h-8 transform scale-110 translate-y-0.5" />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#121c15] ${
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
                            <span className="text-[9px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800 font-mono font-bold">
                              Lv.{f.level}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                                f.status === 'online'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                                  : f.status === 'in-game'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/20'
                                  : f.status === 'in-store'
                                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/20'
                                  : 'bg-neutral-900 text-gray-500 border border-neutral-800'
                              }`}
                            >
                              {f.status === 'online' && '🟢 متصل باللوبي'}
                              {f.status === 'in-game' && '⚔️ في معركة'}
                              {f.status === 'in-store' && '🛒 في المتجر'}
                              {f.status === 'offline' && '⚪ غير متصل'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-gray-400 font-mono font-bold">{f.playerId}</span>
                            <span className="text-gray-600 text-[8px]">•</span>
                            <span className="text-[9px] text-emerald-400 font-bold">{f.rank}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 shrink-0">
                        {/* Invite to Private Room */}
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            setSelectedFriendsForRoom([f.id]);
                            setActiveTab('private_room');
                          }}
                          disabled={f.status === 'offline'}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                            f.status === 'offline'
                              ? 'bg-[#152018] text-gray-600 border border-[#1e3022]/40 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black cursor-pointer shadow active:scale-95'
                          }`}
                          title="دعوة لقاعة خاصة 🔒"
                        >
                          <Lock size={12} />
                          <span>قاعة خاصة</span>
                        </button>

                        {/* Quick 1v1 Challenge */}
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            onInviteFriend(f.name);
                            showToast(`📨 تم إرسال طلب التحدي إلى ${f.name}!`);
                          }}
                          disabled={f.status === 'offline'}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                            f.status === 'offline'
                              ? 'bg-[#152018] text-gray-600 border border-[#1e3022]/40 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer shadow active:scale-95'
                          }`}
                          title="تحدي مباشر"
                        >
                          <Swords size={12} />
                          <span>تحدي</span>
                        </button>

                        <button
                          onClick={() => handleRemoveFriend(f.id)}
                          className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 hover:text-red-300 transition-all active:scale-95 cursor-pointer"
                          title="حذف الصديق"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRIVATE ROOMS CREATOR & INVITATION (قاعات خاصة) */}
          {activeTab === 'private_room' && (
            <div className="flex-1 overflow-y-auto space-y-3.5 no-scrollbar pr-0.5">
              {/* Room Code & Share Banner */}
              <div className="bg-gradient-to-r from-amber-950/60 via-[#1a1406] to-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] text-amber-300 font-bold block">رمز القاعة الخاصة (Private Room Code):</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider">
                      {roomCode}
                    </span>
                    <button
                      onClick={handleRegenerateRoomCode}
                      className="p-1 text-gray-400 hover:text-amber-300 rounded-lg hover:bg-amber-900/40 transition-colors cursor-pointer"
                      title="توليد كود جديد"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRoomCode}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>نسخ الكود</span>
                  </button>
                </div>
              </div>

              {/* Game Mode Selection */}
              <div>
                <label className="text-xs font-black text-white mb-1.5 block flex items-center gap-1.5">
                  <Target size={14} className="text-amber-400" />
                  <span>اختر وضع اللعبة في القاعة:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GAME_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSelectedMode(mode.id);
                      }}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                        selectedMode === mode.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-[#09110d] border-[#1e3323] text-gray-300 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="text-right">
                        <div className="text-xs font-black">{mode.name}</div>
                        <div className="text-[10px] text-gray-400">سعة القاعة: {mode.maxPlayers} لاعبين</div>
                      </div>
                      <span className="text-base">{mode.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Selection */}
              <div>
                <label className="text-xs font-black text-white mb-1.5 block flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>اختر خريطة المعركة:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_MAPS.map((map) => (
                    <button
                      key={map.id}
                      onClick={() => {
                        soundManager.playButtonClick();
                        setSelectedMap(map.id);
                      }}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                        selectedMap === map.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-[#09110d] border-[#1e3323] text-gray-300 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        <span>{map.icon}</span>
                        <span>{map.name}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{map.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Rules (Time & Kills) */}
              <div className="grid grid-cols-2 gap-2 bg-[#09110d] p-3 rounded-2xl border border-[#1e3323]">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1 flex items-center gap-1">
                    <Clock size={11} className="text-cyan-400" />
                    <span>مدة المعركة:</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[2, 3, 5, 7, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setMatchDuration(mins)}
                        className={`flex-1 min-w-[28px] py-1 rounded-lg text-[11px] font-bold transition-all ${
                          matchDuration === mins
                            ? 'bg-cyan-500 text-black font-black shadow'
                            : 'bg-[#121f15] text-gray-400 hover:text-white'
                        }`}
                      >
                        {mins} د
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold block mb-1 flex items-center gap-1">
                    <Target size={11} className="text-rose-400" />
                    <span>هدف القتلات للانتصار:</span>
                  </span>
                  <div className="flex gap-1.5">
                    {[10, 15, 25].map((kills) => (
                      <button
                        key={kills}
                        onClick={() => setTargetKills(kills)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          targetKills === kills
                            ? 'bg-rose-500 text-white font-black shadow'
                            : 'bg-[#121f15] text-gray-400 hover:text-white'
                        }`}
                      >
                        {kills} قتلة
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Select Online Friends to Invite to this Room */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Users size={14} className="text-emerald-400" />
                    <span>حدد الأصدقاء لدعوتهم للقاعة:</span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    تم تحديد: ({selectedFriendsForRoom.length})
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {friends.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-500">لا يوجد أصدقاء بالقائمة</div>
                  ) : (
                    friends.map((f) => {
                      const isSelected = selectedFriendsForRoom.includes(f.id);
                      const isInvited = !!invitedStatusMap[f.id];
                      return (
                        <div
                          key={f.id}
                          onClick={() => handleToggleFriendSelection(f.id)}
                          className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-white'
                              : 'bg-[#0a110c] border-[#1e3323] text-gray-300 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected ? 'bg-amber-500 border-amber-400 text-black' : 'border-gray-600 bg-black/40'
                              }`}
                            >
                              {isSelected && <Check size={11} className="stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold">{f.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono">{f.playerId}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                f.status === 'online'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : f.status === 'in-game'
                                  ? 'bg-amber-950 text-amber-400'
                                  : 'bg-neutral-900 text-gray-500'
                              }`}
                            >
                              {f.status === 'online' ? '🟢 متصل' : f.status === 'in-game' ? '⚔️ بالمعركة' : '⚪ غير متصل'}
                            </span>
                            {isInvited && (
                              <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                                تم الإرسال 📨
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons: Send Invites & Launch Room */}
              <div className="pt-2 border-t border-[#1e3323] flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSendPrivateRoomInvites}
                  className="flex-1 py-2.5 bg-[#17271b] hover:bg-[#203626] border border-emerald-500/40 text-emerald-300 font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Send size={14} />
                  <span>إرسال بطاقات الدعوة للأصدقاء 📩</span>
                </button>

                <button
                  onClick={handleLaunchPrivateRoom}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={14} className="fill-current" />
                  <span>دخول وبدء القاعة الخاصة ⚔️</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADD FRIEND */}
          {activeTab === 'add_friend' && (
            <div className="flex-1 flex flex-col space-y-4 pt-1">
              <div className="bg-[#09110d] p-3.5 rounded-2xl border border-[#1e3323]">
                <h4 className="text-xs font-black text-white mb-1.5 flex items-center gap-1.5">
                  <UserPlus size={15} className="text-cyan-400" />
                  <span>البحث عن محارب وإضافته للقائمة:</span>
                </h4>
                <p className="text-[11px] text-gray-400 mb-3">
                  يمكنك البحث بالاسم أو عبر معرّف اللاعب الفريد (Player ID مثل #MMA-9241).
                </p>

                <form onSubmit={handleAddFriend} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أدخل اسم اللاعب أو الـ ID (مثال: Striker #1234)..."
                    value={friendNameInput}
                    onChange={(e) => setFriendNameInput(e.target.value)}
                    className="flex-1 bg-[#050b07] border border-[#233526] rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-right"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-500 text-black font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <UserPlus size={14} />
                    <span>إضافة</span>
                  </button>
                </form>
              </div>

              {/* Suggestions / Recommended Active Players */}
              <div className="flex-1">
                <h5 className="text-xs font-bold text-gray-300 mb-2">لاعبون مقترحون للإضافة:</h5>
                <div className="space-y-2">
                  {[
                    { name: 'Falcon_Eagle', id: '#MMA-3190', rank: 'Heroic ⚡', level: 44 },
                    { name: 'Desert_Fox', id: '#MMA-8821', rank: 'Crown 🌟', level: 58 },
                    { name: 'Nova_Blast', id: '#MMA-6045', rank: 'Diamond 💎', level: 36 },
                  ].map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-[#0a110c] p-2.5 rounded-xl border border-[#1e3323] flex items-center justify-between"
                    >
                      <div className="text-right">
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>{rec.name}</span>
                          <span className="text-[9px] text-amber-400 font-mono">Lv.{rec.level}</span>
                        </div>
                        <span className="text-[9px] text-cyan-400 font-mono">{rec.id} • {rec.rank}</span>
                      </div>

                      <button
                        onClick={() => {
                          setFriendNameInput(`${rec.name} ${rec.id}`);
                        }}
                        className="px-3 py-1 bg-[#15251a] hover:bg-[#1f3726] text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        اختيار
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-400 text-black px-4 py-1.5 rounded-full font-black text-xs shadow-2xl whitespace-nowrap z-50 border border-emerald-200"
            >
              {toastMsg}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
