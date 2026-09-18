import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, collection, onSnapshot, doc, setDoc, query, where, getDocs, updateDoc, arrayUnion, serverTimestamp, auth } from '../lib/firebase';
import {
  Users,
  Lock,
  Plus,
  Radio,
  Wifi,
  Shield,
  Search,
  KeyRound,
  CheckCircle2,
  Swords,
  Copy,
  Sparkles,
  X,
  Gift,
  Play,
  Award,
  ChevronDown,
  Globe,
  Zap,
  UserPlus,
  Send,
  Circle,
  MessageSquare,
  Shirt,
  Crown,
  RefreshCw,
  UserCheck,
  UserX,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { haptics } from '../utils/haptics';
import { BattleArena } from './BattleArena';
import { GameMode } from '../types';
import { DailyLoginModal } from './DailyLoginModal';
import { FriendsModal } from './FriendsModal';
import { MiniMilitiaDoodleSoldier } from './MiniMilitiaDoodleSoldier';
import { settingsManager } from '../utils/settingsManager';
import { statsManager } from '../utils/statsManager';
import { TacticalMapBriefingModal, MapBriefingData } from './TacticalMapBriefingModal';
import CharacterCustomization from './CharacterCustomization';

export interface LobbyFriend {
  id: string;
  name: string;
  status: 'online' | 'in-game' | 'offline';
  activity: string;
  level: number;
  rank: string;
  avatar?: string;
}

export interface SquadMember {
  id: string;
  name: string;
  isLeader: boolean;
  isReady: boolean;
  level: number;
  rank: string;
  weaponName: string;
  camoColor: string;
  headgear: string;
  bodyArmor: string;
  eyewear: string;
  beard: string;
  jetpackStyle: string;
  trailColor: string;
  skinTone: string;
}

const LOBBY_EMOTES = [
  { id: 'salute', emoji: '🫡', label: 'تحية عسكرية' },
  { id: 'fire', emoji: '🔥', label: 'حماس ونار' },
  { id: 'skull', emoji: '💀', label: 'توعّد وتخويف' },
  { id: 'target', emoji: '🎯', label: 'تصويب دقيق' },
  { id: 'laugh', emoji: '🤣', label: 'ضحك وسخرية' },
  { id: 'flex', emoji: '💪', label: 'استعراض عضلات' },
  { id: 'crown', emoji: '👑', label: 'ملك المعركة' },
  { id: 'rocket', emoji: '🚀', label: 'هجوم خاطف' },
  { id: 'cool', emoji: '😎', label: 'احتراف هادئ' },
  { id: 'bomb', emoji: '💣', label: 'انفجار قريب' },
  { id: 'trophy', emoji: '🏆', label: 'كأس البطولة' },
  { id: 'gg', emoji: '⚔️', label: 'جاهزون للقتال' },
];

const LOBBY_QUICK_PHRASES = [
  { id: 'ready', text: 'هل الجميع جاهز لبدء المعركة؟ 👍' },
  { id: 'rush', text: 'هجوم خاطف ومكثف على برج المراقبة! ⚔️' },
  { id: 'cover', text: 'أنا سأحمي الممر السفلي والأنفاق! 🛡️' },
  { id: 'sniper', text: 'احذروا من القناصين المتربصين بالقمم! 🎯' },
  { id: 'jetpack', text: 'انتبه لطاقة النفاثة (Jetpack) لا تفرغ بالهواء! 🚀' },
  { id: 'reload', text: 'تراجع للتغطية وإعادة تعبئة الذخيرة! 🔄' },
  { id: 'gas', text: 'استخدموا قنابل الغاز السام لتطهير المخابئ! 💨' },
  { id: 'gg', text: 'لعب جماعي رائع وفوز مضمون إن شاء الله! 🏆' }
];

const INITIAL_LOBBY_FRIENDS: LobbyFriend[] = [
  { id: 'f1', name: 'Ghost_Sniper', status: 'online', activity: 'جاهز للقتال ⚔️', level: 64, rank: 'Conqueror 👑' },
  { id: 'f2', name: 'Viper_99', status: 'in-game', activity: 'في معركة Outpost 4v4 💣', level: 52, rank: 'Ace ⚡' },
  { id: 'f3', name: 'ShadowKiller', status: 'online', activity: 'متصل في اللوبي 🟢', level: 48, rank: 'Crown 🌟' },
  { id: 'f4', name: 'Zero_Cool', status: 'offline', activity: 'غير متصل (منذ 15 دقيقة)', level: 39, rank: 'Diamond 💎' },
  { id: 'f5', name: 'Alpha_Wolf', status: 'online', activity: 'جاهز للانضمام 🚀', level: 71, rank: 'Conqueror 👑' },
  { id: 'f6', name: 'Commando_Pro', status: 'in-game', activity: 'في معركة Catacombs 2v2 🔥', level: 58, rank: 'Ace ⚡' },
];

interface Room {
  id: string;
  name: string;
  host: string;
  map: string;
  mode: string;
  players: number;
  maxPlayers: number;
  isPrivate: boolean;
  ping: number;
}

const INITIAL_ROOMS: Room[] = [
  {
    id: '8429',
    name: 'غرفة النخبة والأساطير',
    host: 'العقيد صخر',
    map: 'Outpost (البؤرة)',
    mode: 'قتال حر (FFA)',
    players: 5,
    maxPlayers: 6,
    isPrivate: false,
    ping: 24,
  },
  {
    id: '7102',
    name: 'كتيبة الصاعقة 77',
    host: 'القائد كابوس',
    map: 'Catacombs (السراديب)',
    mode: 'فرق 4v4',
    players: 4,
    maxPlayers: 8,
    isPrivate: false,
    ping: 32,
  },
  {
    id: '9931',
    name: 'حرب القناصين فقط Sniper Only',
    host: 'الشبح الأسود',
    map: 'High Tower (البرج)',
    mode: 'قناصة فقط',
    players: 3,
    maxPlayers: 6,
    isPrivate: true,
    ping: 18,
  },
  {
    id: '5514',
    name: 'تدريب النفاثة والصواريخ RPG',
    host: 'الصاروخ الطائر',
    map: 'Lunar Base (القمر)',
    mode: 'صواريخ فقط',
    players: 2,
    maxPlayers: 6,
    isPrivate: false,
    ping: 45,
  },
];


export default function LobbyScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showRoomsList, setShowRoomsList] = useState(false);
  const [showMapBriefingModal, setShowMapBriefingModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showInviteSquadModal, setShowInviteSquadModal] = useState(false);
  const [isRealisticSoldier, setIsRealisticSoldier] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState('outpost');
  const [selectedGameMode, setSelectedGameMode] = useState<{ mode: GameMode; title: string; subtitle: string }>({
    mode: 'deathmatch',
    title: 'المعركة الكلاسيكية (Classic Squad)',
    subtitle: 'خريطة Outpost العسكرية • بقاء حتى الفوز',
  });
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [newRoomName, setNewRoomName] = useState('غرفتي التكتيكية الخاصة');
  const [newRoomMap, setNewRoomMap] = useState('Outpost (البؤرة)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Fetch Rooms from Firestore
  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('active', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      
      // If no rooms in Firestore, show some placeholders to keep the UI populated for demo
      setRooms(roomsData.length > 0 ? roomsData : INITIAL_ROOMS);
      setLoadingRooms(false);
    }, (error) => {
      console.error("Error fetching rooms:", error);
      setRooms(INITIAL_ROOMS);
      setLoadingRooms(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Friends from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const friendsRef = collection(db, 'users', auth.currentUser.uid, 'friends');
    const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
      if (snapshot.empty) {
        setFriends(INITIAL_LOBBY_FRIENDS);
        return;
      }
      const friendsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LobbyFriend[];
      setFriends(friendsData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    setIsSearching(true);
    soundManager.playButtonClick();
    haptics.heavy();

    try {
      const roomData = {
        name: newRoomName,
        host: auth.currentUser?.displayName || settings.playerName || 'القائد',
        map: newRoomMap,
        mode: selectedGameMode.title,
        players: 1,
        maxPlayers: 6,
        isPrivate: false,
        ping: Math.floor(Math.random() * 30) + 15,
        active: true,
        createdAt: serverTimestamp(),
      };

      const newRoomRef = doc(collection(db, 'rooms'));
      await setDoc(newRoomRef, roomData);
      
      showToast('✅ تم إنشاء الغرفة وبانتظار اللاعبين...');
      
      // Auto-start after a delay (simulating players joining)
      setTimeout(() => {
        setIsSearching(false);
        setShowCreateModal(false);
        setActiveLobbyMatch({
          mode: selectedGameMode.mode,
          title: `غرفة: ${newRoomName} - ${newRoomMap}`,
        });
      }, 2000);
    } catch (e) {
      console.error("Error creating room:", e);
      setIsSearching(false);
      showToast('❌ فشل إنشاء الغرفة. تحقق من الاتصال.');
    }
  };

  // Private room PIN entry modal state
  const [pinModalRoom, setPinModalRoom] = useState<Room | null>(null);
  const [roomPinInput, setRoomPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active match state
  const [activeLobbyMatch, setActiveLobbyMatch] = useState<{
    mode: GameMode;
    title: string;
  } | null>(null);

  // Active 1v1 challenge state
  const [activeChallenge, setActiveChallenge] = useState<{
    friendName: string;
    status: 'pending' | 'accepted' | 'declined';
    countdown: number;
  } | null>(null);

  // Friends list state
  const [friends, setFriends] = useState<LobbyFriend[]>(INITIAL_LOBBY_FRIENDS);
  const [showFriendsSection, setShowFriendsSection] = useState(true);
  const [newFriendNameInput, setNewFriendNameInput] = useState('');
  const [friendFilter, setFriendFilter] = useState<'all' | 'online' | 'ingame'>('all');

  // Pending Friend Requests State
  const [pendingRequests, setPendingRequests] = useState([
    { id: 'p_1', name: 'Eagle_Sniper_99', level: 58, rank: 'Ace ⚡' },
    { id: 'p_2', name: 'Desert_Fox_Pro', level: 43, rank: 'Crown 🌟' },
  ]);

  // Active floating emotes above lobby squad members
  const [activeSquadEmotes, setActiveSquadEmotes] = useState<Record<number, { emoji: string; label: string }>>({});
  const [showEmotePicker, setShowEmotePicker] = useState(false);

  const handleSendLobbyEmote = (emote: { emoji: string; label: string }) => {
    soundManager.playVictory();
    haptics.light();

    // Trigger emote over main player (slot 0)
    setActiveSquadEmotes((prev) => ({
      ...prev,
      0: { emoji: emote.emoji, label: emote.label },
    }));

    // Auto dismiss after 3.8s
    setTimeout(() => {
      setActiveSquadEmotes((prev) => {
        const next = { ...prev };
        delete next[0];
        return next;
      });
    }, 3800);

    // Teammate random response
    if (squadMembers[1] !== null) {
      setTimeout(() => {
        const responses = ['🫡', '🔥', '⚔️', '😎', '💪', '🎯'];
        const randomEm = responses[Math.floor(Math.random() * responses.length)];
        setActiveSquadEmotes((prev) => ({
          ...prev,
          1: { emoji: randomEm, label: 'رد الصديق' },
        }));

        setTimeout(() => {
          setActiveSquadEmotes((prev) => {
            const next = { ...prev };
            delete next[1];
            return next;
          });
        }, 3500);
      }, 900);
    }

    setShowEmotePicker(false);
    showToast(`💬 أرسلت تعبيرًا: ${emote.emoji} [${emote.label}]`);
  };

  const settings = settingsManager.getSettings();

  // Lobby Squad Members State (4 Pedestal Slots on Stage)
  const [squadMembers, setSquadMembers] = useState<(SquadMember | null)[]>([
    {
      id: 'player_main',
      name: settings.playerName || 'العقيد صخر (أنت)',
      isLeader: true,
      isReady: true,
      level: 68,
      rank: 'Conqueror 👑',
      weaponName: settings.equippedPrimaryWeapon || 'rifle',
      camoColor: '#365314',
      headgear: settings.equippedHeadgear || 'camo_helmet',
      bodyArmor: settings.equippedArmor || 'molle_vest',
      eyewear: settings.equippedEyewear || 'aviators',
      beard: settings.equippedBeard || 'stubble',
      jetpackStyle: settings.equippedJetpack || 'military_dual',
      trailColor: settings.equippedTrail || '#a855f7',
      skinTone: '#fbb587',
    },
    {
      id: 'f1',
      name: 'Ghost_Sniper',
      isLeader: false,
      isReady: true,
      level: 64,
      rank: 'Ace ⚡',
      weaponName: 'sniper',
      camoColor: '#111827',
      headgear: 'nvg_helmet',
      bodyArmor: 'juggernaut',
      eyewear: 'ballistic_goggles',
      beard: 'cigar',
      jetpackStyle: 'cyber_plasma',
      trailColor: '#0284c7',
      skinTone: '#fbb587',
    },
    null,
    null,
  ]);

  // Sync player customization when settings change live
  useEffect(() => {
    const syncPlayerSettings = () => {
      const fresh = settingsManager.getSettings();
      setSquadMembers((prev) => {
        const next = [...prev];
        if (next[0]) {
          next[0] = {
            ...next[0],
            name: fresh.playerName || 'العقيد صخر (أنت)',
            weaponName: fresh.equippedPrimaryWeapon || 'rifle',
            headgear: fresh.equippedHeadgear || 'camo_helmet',
            bodyArmor: fresh.equippedArmor || 'molle_vest',
            eyewear: fresh.equippedEyewear || 'aviators',
            beard: fresh.equippedBeard || 'stubble',
            jetpackStyle: fresh.equippedJetpack || 'military_dual',
            trailColor: fresh.equippedTrail || '#a855f7',
          };
        }
        return next;
      });
    };

    window.addEventListener('tactical-settings-updated', syncPlayerSettings);
    return () => window.removeEventListener('tactical-settings-updated', syncPlayerSettings);
  }, []);

  // 1v1 challenge handler countdown and game loader
  useEffect(() => {
    if (!activeChallenge) return;

    if (activeChallenge.status === 'pending') {
      if (activeChallenge.countdown > 0) {
        const timer = setTimeout(() => {
          setActiveChallenge((prev) =>
            prev ? { ...prev, countdown: prev.countdown - 1 } : null
          );
        }, 1100);
        return () => clearTimeout(timer);
      } else {
        // Countdown hit 0, simulate accept!
        soundManager.playVictory();
        haptics.victory();
        setActiveChallenge((prev) =>
          prev ? { ...prev, status: 'accepted', countdown: 3 } : null
        );
      }
    } else if (activeChallenge.status === 'accepted') {
      if (activeChallenge.countdown > 0) {
        const timer = setTimeout(() => {
          setActiveChallenge((prev) =>
            prev ? { ...prev, countdown: prev.countdown - 1 } : null
          );
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished, enter battle arena!
        const opponent = activeChallenge.friendName;
        setActiveChallenge(null);
        soundManager.playRocketLaunch();
        haptics.combatPulse();
        setActiveLobbyMatch({
          mode: 'deathmatch',
          title: `مبارزة التحدي المباشر 1v1 ضد [ ${opponent} ] ⚔️`,
        });
      }
    }
  }, [activeChallenge]);

  const [showQuickChat, setShowQuickChat] = useState(false);
  const [customChatInput, setCustomChatInput] = useState('');
  const [activeSquadChats, setActiveSquadChats] = useState<Record<number, { text: string }>>({});
  const [quickChatMessages, setQuickChatMessages] = useState<Array<{
    id: string;
    sender: string;
    text: string;
    time: string;
    isMain?: boolean;
  }>>([
    { id: 'initial_1', sender: 'Ghost_Sniper', text: 'أهلاً بكم يا رفاق! أنا مستعد للتغطية من البرج العلوي 🎯', time: '13:30' },
    { id: 'initial_2', sender: 'Viper_99', text: 'هذه المعركة ستكون ملحمية! تذكروا استخدام الجيت باك بحكمة 🚀', time: '13:31' }
  ]);

  const handleSendQuickChat = (text: string) => {
    if (!text.trim()) return;

    soundManager.playMechanicalClick();
    haptics.light();

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Add main player message to log
    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: settings.playerName || 'العقيد صخر (أنت)',
      text,
      time: timeStr,
      isMain: true
    };

    setQuickChatMessages((prev) => [...prev, newMessage]);

    // Show floating speech bubble over player main (idx 0)
    setActiveSquadChats((prev) => ({
      ...prev,
      0: { text }
    }));

    // Dismiss bubble after 4.5 seconds
    setTimeout(() => {
      setActiveSquadChats((prev) => {
        const next = { ...prev };
        delete next[0];
        return next;
      });
    }, 4500);

    setCustomChatInput('');

    // Trigger random reply from online team members with realistic delays!
    const activeTeammatesIndices = squadMembers
      .map((m, idx) => m !== null && idx !== 0 ? idx : -1)
      .filter(idx => idx !== -1);

    if (activeTeammatesIndices.length > 0) {
      setTimeout(() => {
        const responderIdx = activeTeammatesIndices[Math.floor(Math.random() * activeTeammatesIndices.length)];
        const responderName = squadMembers[responderIdx]?.name || 'جندي مرافق';
        
        const responses = [
          'علم! سأتبع خطتك تماماً 🫡',
          'رائع! أنا جاهز لتغطية ظهرك 💪',
          'استعدوا للتكتيك الهجومي الخاطف! ⚡',
          'مفهوم، سأراقب النقاط الحيوية بالخريطة 🎯',
          'انطلقوا، التغطية النيرانية جاهزة! 🔥',
          'أنا جاهز ومتحمس جداً للمعركة! ⚔️',
        ];
        const replyText = responses[Math.floor(Math.random() * responses.length)];

        const replyMessage = {
          id: `msg_reply_${Date.now()}`,
          sender: responderName,
          text: replyText,
          time: timeStr,
          isMain: false
        };

        setQuickChatMessages((prev) => [...prev, replyMessage]);

        setActiveSquadChats((prev) => ({
          ...prev,
          [responderIdx]: { text: replyText }
        }));

        soundManager.playMechanicalClick();

        setTimeout(() => {
          setActiveSquadChats((prev) => {
            const next = { ...prev };
            delete next[responderIdx];
            return next;
          });
        }, 4500);

      }, 1000 + Math.random() * 800); // 1.0 to 1.8 seconds realistic responder delay
    }
  };

  const handleInviteFriendToRoom = (friendName: string) => {
    soundManager.playVictory();
    haptics.victory();
    showToast(`📩 تم إرسال دعوة انضمام للمعركة إلى [${friendName}] بنجاح!`);
  };

  const handleAcceptFriendRequest = (req: { id: string; name: string; level: number; rank: string }) => {
    soundManager.playVictory();
    haptics.victory();
    setPendingRequests((prev) => prev.filter((p) => p.id !== req.id));
    const newFriend: LobbyFriend = {
      id: req.id,
      name: req.name,
      status: 'online',
      activity: 'متصل باللوبي 🟢',
      level: req.level,
      rank: req.rank,
    };
    setFriends((prev) => [newFriend, ...prev]);
    showToast(`✅ تم قبول طلب صداقة [${req.name}] بنجاح! يمكنك الآن دعوته للوقوف معك باللوبي.`);
  };

  const handleRejectFriendRequest = (reqId: string) => {
    soundManager.playButtonClick();
    setPendingRequests((prev) => prev.filter((p) => p.id !== reqId));
    showToast('❌ تم رفض طلب الصداقة.');
  };

  const handleInviteToLobbySquad = (friend: LobbyFriend) => {
    const emptySlot = squadMembers.findIndex((m) => m === null);
    if (emptySlot === -1) {
      showToast('⚠️ منصة الوقوف في اللوبي ممتلئة بالكامل (4/4)! قم بطرد لاعب أولاً.');
      return;
    }

    soundManager.playVictory();
    haptics.victory();

    const presets = [
      { headgear: 'beret_red', bodyArmor: 'chest_harness', weaponName: 'shotgun', camoColor: '#991b1b' },
      { headgear: 'pilot_helmet', bodyArmor: 'cyber_rig', weaponName: 'rocket', camoColor: '#0284c7' },
      { headgear: 'bandana', bodyArmor: 'molle_vest', weaponName: 'rifle', camoColor: '#854d0e' },
      { headgear: 'skull_mask', bodyArmor: 'hazmat_suit', weaponName: 'sniper', camoColor: '#1c1917' },
    ];
    const outfit = presets[emptySlot % presets.length];

    const member: SquadMember = {
      id: friend.id,
      name: friend.name,
      isLeader: false,
      isReady: true,
      level: friend.level,
      rank: friend.rank,
      weaponName: outfit.weaponName,
      camoColor: outfit.camoColor,
      headgear: outfit.headgear,
      bodyArmor: outfit.bodyArmor,
      eyewear: 'aviators',
      beard: 'stubble',
      jetpackStyle: 'military_dual',
      trailColor: '#a855f7',
      skinTone: '#fbb587',
    };

    const next = [...squadMembers];
    next[emptySlot] = member;
    setSquadMembers(next);
    setShowInviteSquadModal(false);
    showToast(`🤝 انضم [${friend.name}] لوقوف اللوبي معك بنجاح!`);
  };

  const handleKickSquadMember = (index: number) => {
    soundManager.playButtonClick();
    haptics.medium();
    const target = squadMembers[index];
    const next = [...squadMembers];
    next[index] = null;
    setSquadMembers(next);
    if (target) {
      showToast(`🚪 غادر/تم طرد [${target.name}] من منصة اللوبي.`);
    }
  };

  const handleCycleFriendOutfit = (index: number) => {
    soundManager.playSwitchWeapon();
    haptics.light();
    const headgears = ['camo_helmet', 'nvg_helmet', 'beret_red', 'beret_green', 'pilot_helmet', 'gas_mask', 'bandana', 'skull_mask'];
    const weapons = ['rifle', 'sniper', 'shotgun', 'rocket', 'pistol'];
    const colors = ['#365314', '#111827', '#991b1b', '#0284c7', '#854d0e'];

    setSquadMembers((prev) => {
      const next = [...prev];
      if (next[index]) {
        const currentHead = next[index]!.headgear;
        const headIdx = (headgears.indexOf(currentHead) + 1) % headgears.length;
        const currentWep = next[index]!.weaponName;
        const wepIdx = (weapons.indexOf(currentWep) + 1) % weapons.length;
        const colIdx = Math.floor(Math.random() * colors.length);

        next[index] = {
          ...next[index]!,
          headgear: headgears[headIdx],
          weaponName: weapons[wepIdx],
          camoColor: colors[colIdx],
        };
        showToast(`👕 تم تغيير مظهر وسلاح [${next[index]!.name}] باللوبي!`);
      }
      return next;
    });
  };

  const handleAddQuickFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendNameInput.trim()) return;
    soundManager.playButtonClick();
    haptics.medium();
    const created: LobbyFriend = {
      id: String(Date.now()),
      name: newFriendNameInput.trim(),
      status: 'online',
      activity: 'متصل الآن 🟢',
      level: 15,
      rank: 'Gold 🏅',
    };
    setFriends([created, ...friends]);
    setNewFriendNameInput('');
    showToast(`👥 تم إضافة [${created.name}] لقائمة أصدقائك!`);
  };

  const filteredFriends = friends.filter((f) => {
    if (friendFilter === 'online') return f.status === 'online';
    if (friendFilter === 'ingame') return f.status === 'in-game';
    return true;
  });

  const onlineCount = friends.filter((f) => f.status === 'online').length;
  const inGameCount = friends.filter((f) => f.status === 'in-game').length;

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.includes(searchQuery) ||
      r.id.includes(searchQuery) ||
      r.map.includes(searchQuery)
  );

  const launchRoomMatch = (room: Room) => {
    soundManager.playRocketLaunch();
    haptics.combatPulse();
    const engineMode: GameMode = room.mode.includes('4v4') || room.mode.includes('فرق')
      ? 'team'
      : room.mode.includes('بقاء')
      ? 'survival'
      : 'deathmatch';

    setActiveLobbyMatch({
      mode: engineMode,
      title: `${room.name} (${room.map})`,
    });
  };

  const handleStartQuickMatch = () => {
    setIsSearching(true);
    soundManager.playRocketLaunch();
    haptics.combatPulse();

    // Simulate matchmaking delay
    setTimeout(() => {
      setIsSearching(false);
      setActiveLobbyMatch({
        mode: selectedGameMode.mode,
        title: selectedGameMode.title,
      });
    }, 2500);
  };

  const handleJoin = (room: Room) => {
    soundManager.playButtonClick();
    haptics.medium();
    if (room.isPrivate) {
      setPinModalRoom(room);
      setRoomPinInput('');
      setPinError(false);
      return;
    }
    launchRoomMatch(room);
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalRoom) return;
    if (roomPinInput.trim().length === 0) {
      setPinError(true);
      haptics.light();
      return;
    }
    const targetRoom = pinModalRoom;
    setPinModalRoom(null);
    launchRoomMatch(targetRoom);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  if (activeLobbyMatch) {
    return (
      <BattleArena
        mode={activeLobbyMatch.mode}
        arenaTitle={activeLobbyMatch.title}
        onQuit={() => {
          setActiveLobbyMatch(null);
          soundManager.playButtonClick();
          haptics.light();
        }}
      />
    );
  }

  const lobbyStats = statsManager.getStats();
  const lobbyXPInfo = statsManager.getXPInfo(lobbyStats);
  const lobbyRank = statsManager.getRank(lobbyXPInfo.totalXP, lobbyStats.totalMatches);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col justify-between min-h-[75vh] pb-24 sm:pb-20 select-none bg-neutral-950"
    >
      {/* Dynamic Animated Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,rgba(0,0,0,0.8)_80%)] animate-pulse"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[spin_60s_linear_infinite]"></div>
      </motion.div>
      <motion.div 
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: "100% 100%" }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="absolute inset-0 opacity-15 pointer-events-none z-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" 
      />

      {/* PUBG Style Top Status & Region Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0d1610]/90 via-[#132217]/90 to-[#0d1610]/95 border-b border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md mb-3">
        {/* Player Profile & Level */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#0a110c] rounded-[10px] flex items-center justify-center overflow-hidden">
              <MiniMilitiaDoodleSoldier className="w-10 h-10 transform scale-125 translate-y-1" />
              <span className="absolute top-0 right-0 font-black text-amber-300 text-[9px]">★</span>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black font-black text-[9px] px-1.5 rounded-full border border-black font-mono">
              LV.{lobbyXPInfo.level}
            </span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                {settings.playerName || 'الصقر العسكري'}
              </h3>
              <span className="bg-amber-950/80 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded border border-amber-700 flex items-center gap-1">
                <span>{lobbyRank.titleAr}</span>
                <span>{lobbyRank.badge}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Globe size={11} /> الشرق الأوسط (ME)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <Wifi size={11} /> 22ms
              </span>
            </div>
          </div>
        </div>

        {/* Currency Vault Bar (PUBG UC & BP style) */}
        <div className="flex items-center gap-2 bg-[#080e0a]/90 px-3 py-1.5 rounded-xl border border-[#233827] shadow-inner">
          <div className="flex items-center gap-1.5 border-l border-[#233827] pl-3">
            <span className="text-xs font-black text-amber-400 font-mono">
              {settings.coins.toLocaleString()}
            </span>
            <span className="text-xs">🪙</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-cyan-300 font-mono">
              {settings.gems}
            </span>
            <span className="text-xs">💎</span>
          </div>
        </div>
      </div>

      {/* Centerpiece: PUBG Style Commando & Outpost HQ Preview */}
      <div className="relative w-full rounded-3xl border-2 border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.25)] flex flex-col justify-between p-4 bg-gradient-to-b from-[#112017]/40 via-[#0a140e]/70 to-[#070b09] mb-4">
        {/* Background Hangar / Outpost tactical atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_80%)] pointer-events-none" />
        
        {/* Top Floating Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/30 text-emerald-400 font-black text-xs">
              <Shield size={14} />
              <span>الكتيبة النشطة: #77 Elite</span>
            </div>

            {/* Tactical Map Briefing Button */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                haptics.light();
                setShowMapBriefingModal(true);
              }}
              className="flex items-center gap-1.5 bg-[#122417]/90 hover:bg-[#1c3321] text-amber-300 border border-amber-500/50 px-3 py-1 rounded-xl font-black text-xs backdrop-blur-md shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Globe size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>تخطيط الخريطة والتكتيك 🗺️</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setShowDailyModal(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-3.5 py-1.5 rounded-xl font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Gift size={14} className="animate-bounce" />
            <span>مكافآت الحضور اليومي 🎁</span>
          </button>
        </div>

        {/* PUBG / MINI MILITIA 4-PLAYER SQUAD LOBBY STAGE PLATFORM */}
        <div className="relative w-full py-2 sm:py-4 px-1 my-2 flex flex-col items-center justify-center z-10">
          <div className="w-full bg-gradient-to-b from-[#0c1810]/95 via-[#0a140d]/95 to-[#050b07]/98 border-2 border-[#1f3a25] rounded-3xl p-3 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden">
            
            {/* Stage Ambient Glow */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* Stage Header Controls */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs sm:text-sm font-black text-emerald-300 tracking-wide font-mono flex items-center gap-1.5">
                  <Users size={16} className="text-emerald-400" />
                  <span>منصة وقوف الفريق باللوبي (LOBBY SQUAD STAGE)</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.light();
                    setShowEmotePicker(!showEmotePicker);
                    setShowQuickChat(false);
                  }}
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border border-yellow-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  <span>تعبيرات عسكرية (Emotes) 😀</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.light();
                    setShowQuickChat(!showQuickChat);
                    setShowEmotePicker(false);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border border-emerald-200 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  <span>الرسائل السريعة (Quick Chat) 💬</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    haptics.light();
                    setIsRealisticSoldier(!isRealisticSoldier);
                  }}
                  className="bg-black/80 hover:bg-black text-xs text-emerald-300 font-black border border-emerald-500/60 px-3 py-1.5 rounded-xl shadow backdrop-blur-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-emerald-400" />
                  <span>{isRealisticSoldier ? 'النمط الواقعي 3D ⚔️' : 'مطابق للجيم بلاي 100% (2D)'}</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowInviteSquadModal(true);
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg border border-cyan-400 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={14} />
                  <span>دعوة صديق للوقوف باللوبي 📩</span>
                </button>
              </div>
            </div>

            {/* Quick Emotes Floating Selector Panel */}
            <AnimatePresence>
              {showEmotePicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="relative z-30 mb-3 bg-gradient-to-b from-[#112417] to-[#08120b] border-2 border-amber-400/80 rounded-2xl p-3 shadow-2xl space-y-2 text-right"
                >
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                      <Sparkles size={14} />
                      <span>اختر تعبيرًا للظهور فوق شخصيتك باللوبي:</span>
                    </span>
                    <button
                      onClick={() => setShowEmotePicker(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {LOBBY_EMOTES.map((em) => (
                      <button
                        key={em.id}
                        onClick={() => handleSendLobbyEmote(em)}
                        className="bg-black/60 hover:bg-amber-950/60 border border-amber-500/30 hover:border-amber-400 p-2 rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all cursor-pointer group"
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform">{em.emoji}</span>
                        <span className="text-[9px] font-bold text-amber-200/90 truncate">{em.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Chat Tactical Selector & Messenger Panel */}
            <AnimatePresence>
              {showQuickChat && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="relative z-30 mb-4 bg-gradient-to-b from-[#0e1a12] to-[#070e0a] border-2 border-emerald-400/80 rounded-2xl p-4 shadow-2xl space-y-3 text-right"
                >
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                    <span className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-emerald-400 animate-pulse" />
                      <span>إرسال رسالة تكتيكية سريعة إلى أعضاء اللوبي:</span>
                    </span>
                    <button
                      onClick={() => setShowQuickChat(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-black/30 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Preset Quick phrases grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LOBBY_QUICK_PHRASES.map((ph) => (
                      <button
                        key={ph.id}
                        onClick={() => {
                          handleSendQuickChat(ph.text);
                          setShowQuickChat(false);
                        }}
                        className="bg-black/45 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-400/60 p-2.5 rounded-xl text-right text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">⚡</span>
                        <span className="text-right text-[11px] sm:text-xs">{ph.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Message input box */}
                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20">
                    <button
                      onClick={() => {
                        if (customChatInput.trim()) {
                          handleSendQuickChat(customChatInput);
                        }
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black text-xs px-4 py-2 rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Send size={12} />
                      <span>إرسال 💬</span>
                    </button>
                    <input
                      type="text"
                      value={customChatInput}
                      onChange={(e) => setCustomChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customChatInput.trim()) {
                          handleSendQuickChat(customChatInput);
                        }
                      }}
                      placeholder="أو اكتب رسالتك الخاصة هنا واضغط Enter..."
                      className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-right font-bold"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4 Pedestals Grid - Spacious Expanded Height */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-end justify-center min-h-[360px] sm:min-h-[410px] relative z-10 pt-2">
              {squadMembers.map((member, idx) => {
                if (!member) {
                  return (
                    <motion.div
                      key={`empty_slot_${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-black/40 hover:bg-emerald-950/30 hover:border-emerald-500/60 transition-all cursor-pointer min-h-[330px] group"
                      onClick={() => {
                        soundManager.playButtonClick();
                        setShowInviteSquadModal(true);
                      }}
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-950/80 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-emerald-400 transition-all shadow-lg mb-2">
                        <Plus size={28} />
                      </div>
                      <span className="text-xs font-black text-emerald-400 text-center">
                        دعوة صديق للوقوف هنا
                      </span>
                      <span className="text-[10px] text-gray-400 text-center mt-1">
                        مكان شاغر ({idx + 1}/4)
                      </span>
                    </motion.div>
                  );
                }

                const isMainPlayer = member.id === 'player_main';
                const mainStats = statsManager.getStats();
                const mainXPInfo = statsManager.getXPInfo(mainStats);
                const mainRank = statsManager.getRank(mainXPInfo.totalXP, mainStats.totalMatches);

                const memberLevel = isMainPlayer ? mainXPInfo.level : member.level;
                const memberRankBadge = isMainPlayer ? mainRank.badge : (member.rank ? (member.rank.match(/[\p{Emoji}\u2600-\u27BF]/gu)?.[0] || '🎖️') : '🎖️');
                const memberRankTitle = isMainPlayer ? mainRank.titleAr : (member.rank || 'مجند جديد');

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border-2 shadow-2xl relative backdrop-blur-md transition-all ${
                      isMainPlayer
                        ? 'bg-gradient-to-b from-[#142e1a]/95 via-[#0e2113]/95 to-[#071109]/98 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
                        : 'bg-gradient-to-b from-[#0f1d13]/85 via-[#0a120c]/85 to-[#050906]/95 border-emerald-500/40'
                    }`}
                  >
                    {/* Floating Emote Speech Bubble */}
                    <AnimatePresence>
                      {activeSquadEmotes[idx] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.2, y: 10 }}
                          animate={{ opacity: 1, scale: 1.2, y: -15 }}
                          exit={{ opacity: 0, scale: 0.4, y: -25 }}
                          className="absolute -top-12 z-30 bg-black/95 border-2 border-amber-400 px-3.5 py-1.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center gap-1.5 backdrop-blur-md"
                        >
                          <span className="text-2xl animate-bounce">{activeSquadEmotes[idx].emoji}</span>
                          <span className="text-[10px] font-black text-amber-300 hidden sm:inline">
                            {activeSquadEmotes[idx].label}
                          </span>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Floating Quick Chat Speech Bubble */}
                    <AnimatePresence>
                      {activeSquadChats[idx] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: -20 }}
                          exit={{ opacity: 0, scale: 0.3, y: -30 }}
                          className="absolute -top-16 z-30 bg-neutral-950 border-2 border-emerald-400 px-3.5 py-2 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.7)] flex flex-col items-center justify-center max-w-[150px] sm:max-w-[180px] backdrop-blur-md"
                        >
                          <p className="text-[11px] sm:text-xs font-black text-emerald-300 text-center leading-relaxed">
                            {activeSquadChats[idx].text}
                          </p>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-emerald-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Header Tag with Dynamic Rank Badge */}
                    <div className="w-full flex items-center justify-between gap-1 bg-black/80 px-2 sm:px-2.5 py-1 rounded-xl border border-emerald-500/40 mb-1">
                      <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span className="text-sm shrink-0 select-none cursor-help" title={memberRankTitle}>
                          {memberRankBadge}
                        </span>
                        <span className="text-[11px] font-black text-white truncate" title={member.name}>
                          {member.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isMainPlayer && <Crown size={11} className="text-amber-400 animate-pulse shrink-0" />}
                        <span className="text-[9px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono">
                          Lv.{memberLevel}
                        </span>
                      </div>
                    </div>

                    {/* Character Visual Container - High Clearance */}
                    <div className="relative w-full h-60 sm:h-72 flex items-center justify-center my-1">
                      {/* Floating Rank Title Ribbon */}
                      <div className="absolute top-2 z-10 bg-black/80 border border-emerald-500/30 rounded-full py-0.5 px-3 flex items-center gap-1 shadow-lg backdrop-blur-md">
                        <span className="text-[10px] font-black text-emerald-300 font-sans">
                          {memberRankTitle}
                        </span>
                        <span className="text-xs">
                          {memberRankBadge}
                        </span>
                      </div>

                      <MiniMilitiaDoodleSoldier
                        className="w-full h-full"
                        weaponName={member.weaponName}
                        realisticMode={isRealisticSoldier}
                        camoColor={member.camoColor}
                        headgear={member.headgear}
                        bodyArmor={member.bodyArmor}
                        eyewear={member.eyewear}
                        beard={member.beard}
                        jetpackStyle={member.jetpackStyle}
                        trailColor={member.trailColor}
                        skinTone={member.skinTone}
                        scale={isMainPlayer ? 1.55 : 1.4}
                      />
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="w-full flex items-center justify-center gap-1.5 mt-1 pt-1.5 border-t border-emerald-500/20">
                      {isMainPlayer ? (
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            haptics.medium();
                            setShowCustomizationModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-xs py-1.5 px-2 rounded-xl shadow-lg border border-yellow-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Shirt size={14} />
                          <span>تغيير الملابس والعتاد 👕</span>
                        </button>
                      ) : (
                        <div className="w-full grid grid-cols-2 gap-1">
                          <button
                            onClick={() => handleCycleFriendOutfit(idx)}
                            className="bg-[#18281d] hover:bg-[#233b2a] text-emerald-300 border border-emerald-500/50 text-[10px] font-black py-1.5 px-1 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="تغيير لبس الصديق"
                          >
                            <RefreshCw size={11} />
                            <span>تغيير اللبس</span>
                          </button>
                          <button
                            onClick={() => handleKickSquadMember(idx)}
                            className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 text-[10px] font-black py-1.5 px-1 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="طرد من اللوبي"
                          >
                            <X size={11} />
                            <span>طرد</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Real-time Lobby Chat Terminal */}
            <div className="relative z-10 mt-5 pt-3.5 border-t border-emerald-500/20">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-black text-emerald-400 tracking-wider flex items-center gap-1.5 font-mono uppercase bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>سجل الاتصالات التكتيكية للغرفة • LIVE_CHANNELS</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-bold">
                  {quickChatMessages.length} رسائل نشطة
                </span>
              </div>

              {/* Scrollable chat messages log */}
              <div className="w-full max-h-36 overflow-y-auto bg-black/60 border border-emerald-500/10 rounded-2xl p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                {quickChatMessages.length === 0 ? (
                  <p className="text-center text-[11px] text-gray-500 italic py-4">
                    لا توجد رسائل سابقة. اختر "الرسائل السريعة" بالأعلى لبدء التواصل! 💬
                  </p>
                ) : (
                  quickChatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 text-right text-xs bg-black/30 p-2 rounded-xl border ${
                        msg.isMain ? 'border-amber-500/20 bg-amber-950/5' : 'border-emerald-500/10 bg-emerald-950/5'
                      }`}
                    >
                      <span className="text-[9px] text-gray-500 font-mono shrink-0 mt-0.5">{msg.time}</span>
                      
                      <div className="flex-1">
                        <span
                          className={`font-black text-[11px] ${
                            msg.isMain ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {msg.sender}:
                        </span>
                        <span className="text-gray-200 mr-1.5 font-bold">{msg.text}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Bar inside Lobby Hangar */}
        <div className="flex items-center justify-between z-10 mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowRoomsList(!showRoomsList);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#142217]/90 hover:bg-[#1b2b20] text-emerald-400 font-black text-xs border border-emerald-500/40 shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Users size={14} />
              <span>{showRoomsList ? 'إخفاء غرف اللعب' : 'غرف اللعب الجماعي (Rooms)'}</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#121c15]/90 hover:bg-[#18261d] text-amber-300 font-black text-xs border border-amber-500/40 shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>إنشاء غرفة مخصصة</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowFriendsSection(!showFriendsSection);
              }}
              className={`px-3.5 py-2 rounded-xl font-black text-xs border shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 ${
                showFriendsSection
                  ? 'bg-cyan-600 text-black border-cyan-400'
                  : 'bg-[#121c15]/90 hover:bg-[#18261d] text-cyan-300 border-cyan-500/40'
              }`}
            >
              <Users size={14} />
              <span>قائمة الأصدقاء ({onlineCount} متصل)</span>
            </button>
          </div>

          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block bg-black/50 px-3 py-1 rounded-lg">
            Outpost Military Complex v2.5 • Ready
          </span>
        </div>
      </div>

      {/* LOBBY FRIENDS LIST & SQUAD PANEL (واجهة قائمة الأصدقاء في اللوبي) */}
      {showFriendsSection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-3 bg-gradient-to-b from-[#0f1d13] to-[#0a120c] border-2 border-[#223a27] rounded-3xl p-3.5 sm:p-4 shadow-2xl space-y-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1b2f20] pb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                <span>قائمة الأصدقاء والكتيبة (Lobby Friends)</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                تابع حالة أصدقائك وادعُهم فوراً للانضمام لغرفة المعركة الجماعية
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setFriendFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  friendFilter === 'all'
                    ? 'bg-cyan-500 text-black font-black shadow'
                    : 'bg-[#122216] text-gray-300 hover:text-white'
                }`}
              >
                الكل ({friends.length})
              </button>
              <button
                onClick={() => setFriendFilter('online')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  friendFilter === 'online'
                    ? 'bg-emerald-500 text-black font-black shadow'
                    : 'bg-[#122216] text-emerald-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                متصل ({onlineCount})
              </button>
              <button
                onClick={() => setFriendFilter('ingame')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  friendFilter === 'ingame'
                    ? 'bg-amber-500 text-black font-black shadow'
                    : 'bg-[#122216] text-amber-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                في اللعبة ({inGameCount})
              </button>
            </div>
          </div>

          {/* Add Friend Form */}
          <form onSubmit={handleAddQuickFriend} className="flex items-center gap-2 bg-[#060e08] p-2 rounded-xl border border-[#1b2f20]">
            <UserPlus size={16} className="text-cyan-400 ml-1" />
            <input
              type="text"
              placeholder="أدخل اسم المحارب أو ID لإضافته إلى أصدقائك..."
              value={newFriendNameInput}
              onChange={(e) => setNewFriendNameInput(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="py-1.5 px-3 bg-gradient-to-r from-cyan-600 to-teal-500 hover:brightness-110 text-black font-black text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow"
            >
              <UserPlus size={13} />
              <span>إضافة صديق</span>
            </button>
          </form>

          {/* Friends Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto no-scrollbar pt-1">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-[#101b13] border border-[#1f3324] rounded-2xl p-2.5 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-700 to-emerald-800 flex items-center justify-center text-white font-black text-xs border border-cyan-400/50">
                        {friend.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-black ${
                          friend.status === 'online'
                            ? 'bg-emerald-400 animate-pulse'
                            : friend.status === 'in-game'
                            ? 'bg-amber-400'
                            : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <div className="text-right">
                      <h4 className="text-xs font-black text-white flex items-center gap-1">
                        <span>{friend.name}</span>
                        <span className="text-[9px] text-amber-300 font-mono">Lv.{friend.level}</span>
                      </h4>
                      <span className="text-[9px] text-cyan-300 font-bold block">{friend.rank}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      friend.status === 'online'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : friend.status === 'in-game'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-gray-900 text-gray-400 border-gray-800'
                    }`}
                  >
                    {friend.status === 'online' ? '🟢 متصل' : friend.status === 'in-game' ? '🟡 في اللعبة' : '⚪ غير متصل'}
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 mb-2 text-right font-mono bg-[#070e09] p-1 rounded-lg border border-[#16271a]">
                  {friend.activity}
                </p>

                <div className="flex items-center gap-1.5 pt-1 border-t border-[#17271c]">
                  <button
                    onClick={() => {
                      if (friend.status === 'in-game') {
                        showToast(`⚠️ [${friend.name}] مشغول في معركة الآن! انتظر حتى ينتهي.`);
                        return;
                      }
                      setActiveChallenge({
                        friendName: friend.name,
                        status: 'pending',
                        countdown: 3
                      });
                    }}
                    disabled={friend.status === 'offline'}
                    className={`flex-1 py-1.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 transition-all shadow ${
                      friend.status === 'offline'
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:brightness-110 cursor-pointer active:scale-95'
                    }`}
                  >
                    <Swords size={12} />
                    <span>تحدي 1 ضد 1 ⚔️</span>
                  </button>

                  <button
                    onClick={() => handleInviteToLobbySquad(friend)}
                    disabled={friend.status === 'offline' || friend.status === 'in-game'}
                    className={`py-1.5 px-2.5 rounded-xl text-[10px] font-black transition-all ${
                      friend.status === 'offline' || friend.status === 'in-game'
                        ? 'bg-[#18261d] text-gray-500 cursor-not-allowed border border-transparent'
                        : 'bg-black/60 text-emerald-300 border border-emerald-500/20 hover:border-emerald-400/60'
                    }`}
                    title="دعوة للوقوف معك باللوبي"
                  >
                    <span>دعوة 📩</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      showToast(`🎁 تم إرسال 100 كوينز هدايا يومية إلى [${friend.name}]!`);
                    }}
                    className="p-1.5 bg-[#17271b] hover:bg-[#203626] text-amber-300 rounded-xl border border-amber-500/30 text-[10px] font-bold cursor-pointer"
                    title="إرسال هدية كوينز"
                  >
                    <Gift size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expandable Custom Rooms Section */}
      {showRoomsList && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 bg-[#0d1610] border border-[#233827] rounded-2xl p-3 space-y-2.5 shadow-xl"
        >
          <div className="flex items-center gap-2 bg-[#080d09] p-2 rounded-xl border border-[#233526]">
            <Search size={15} className="text-gray-400 mr-1" />
            <input
              type="text"
              placeholder="ابحث باسم الغرفة أو رقم الـ ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
            {filteredRooms.map((room) => {
              const isFull = room.players >= room.maxPlayers;
              return (
                <div
                  key={room.id}
                  className="bg-[#121c15] p-2.5 rounded-xl border border-[#223525] flex items-center justify-between text-right"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      #{room.id}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-white">{room.name}</h4>
                      <span className="text-[10px] text-gray-400">{room.map} • {room.mode}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoin(room)}
                    disabled={isFull}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black ${
                      isFull ? 'bg-gray-800 text-gray-500' : 'bg-emerald-600 hover:bg-emerald-500 text-black cursor-pointer'
                    }`}
                  >
                    {isFull ? 'ممتلئة' : 'انضمام'}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* PUBG Style Bottom Command Deck (Mode Selector & Giant START Button) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent px-4 pb-20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Game Mode Selector Trigger */}
        <div className="relative w-full sm:w-72">
          {showModeSelector && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#0d1610] border-2 border-emerald-500/50 rounded-2xl p-2 shadow-2xl space-y-1.5 z-50">
              <div
                onClick={() => {
                  setSelectedGameMode({
                    mode: 'deathmatch',
                    title: 'المعركة الكلاسيكية (Classic Squad)',
                    subtitle: 'خريطة Outpost العسكرية • بقاء حتى الفوز',
                  });
                  setShowModeSelector(false);
                  soundManager.playButtonClick();
                }}
                className="p-2.5 rounded-xl bg-[#142217] hover:bg-[#1a2d20] cursor-pointer border border-[#263d2b] text-right"
              >
                <div className="text-xs font-black text-white">المعركة الكلاسيكية (Classic Squad)</div>
                <div className="text-[10px] text-gray-400">خريطة Outpost العسكرية • بقاء حتى الفوز</div>
              </div>
              <div
                onClick={() => {
                  setSelectedGameMode({
                    mode: 'team',
                    title: 'حرب الفرق (Team Deathmatch 4v4)',
                    subtitle: 'مواجهة حامية بين كتيبتين • إعادة إحياء سريعة',
                  });
                  setShowModeSelector(false);
                  soundManager.playButtonClick();
                }}
                className="p-2.5 rounded-xl bg-[#142217] hover:bg-[#1a2d20] cursor-pointer border border-[#263d2b] text-right"
              >
                <div className="text-xs font-black text-white">حرب الفرق (Team Deathmatch 4v4)</div>
                <div className="text-[10px] text-gray-400">مواجهة حامية بين كتيبتين • إعادة إحياء سريعة</div>
              </div>
              <div
                onClick={() => {
                  setSelectedGameMode({
                    mode: 'survival',
                    title: 'تحدي البقاء المظلم (Catacombs Survival)',
                    subtitle: 'موجات الزومبي والوحوش • بقاء فردي',
                  });
                  setShowModeSelector(false);
                  soundManager.playButtonClick();
                }}
                className="p-2.5 rounded-xl bg-[#142217] hover:bg-[#1a2d20] cursor-pointer border border-[#263d2b] text-right"
              >
                <div className="text-xs font-black text-white">تحدي البقاء المظلم (Catacombs Survival)</div>
                <div className="text-[10px] text-gray-400">موجات الزومبي والوحوش • بقاء فردي</div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setShowModeSelector(!showModeSelector);
            }}
            className="w-full bg-[#121e15]/90 border-2 border-emerald-500/40 hover:border-emerald-400 p-3 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md cursor-pointer text-right"
          >
            <div>
              <span className="text-[10px] text-emerald-400 font-bold block">نمط المعركة النشط</span>
              <h4 className="text-xs sm:text-sm font-black text-white">{selectedGameMode.title}</h4>
            </div>
            <ChevronDown size={18} className="text-emerald-400 shrink-0" />
          </button>
        </div>

        {/* Giant PUBG Style START / BATTLE Button */}
        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={handleStartQuickMatch}
            className="w-full sm:w-80 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-base sm:text-lg shadow-[0_0_35px_rgba(245,158,11,0.6)] active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer uppercase tracking-wider border-2 border-yellow-200"
          >
            <Play size={22} className="fill-black animate-pulse" />
            <span>بدء المعركة (START)</span>
          </button>
        </div>
      </div>

      {/* Daily Login Modal */}
      <DailyLoginModal isOpen={showDailyModal} onClose={() => setShowDailyModal(false)} />

      {/* Matchmaking Progress Overlay */}
      {isSearching && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6">
          <h2 className="text-xl font-black text-amber-400 mb-6 animate-pulse">جاري البحث عن معركة...</h2>
          <div className="w-full max-w-sm h-4 bg-gray-800 rounded-full overflow-hidden border border-emerald-500/30 shadow-inner">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500"
            />
          </div>
          <p className="text-emerald-400 mt-4 text-xs font-bold">يرجى الانتظار، يتم العثور على خصوم مناسبين...</p>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e1611] border-2 border-[#2b4430] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-right"
            >
              <h3 className="text-base font-black text-white flex items-center justify-between">
                <span>إنشاء غرفة قتال مخصصة جديدة</span>
                <span className="text-xs text-amber-400">مجاناً</span>
              </h3>

              <form onSubmit={handleCreateRoom} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">
                    اسم الغرفة:
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-[#070e0a] border border-[#2b4430] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">
                    اختر ساحة المعركة (الخريطة):
                  </label>
                  <select
                    value={newRoomMap}
                    onChange={(e) => setNewRoomMap(e.target.value)}
                    className="w-full bg-[#070e0a] border border-[#2b4430] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Outpost (البؤرة)">Outpost (البؤرة - كلاسيك)</option>
                    <option value="Catacombs (السراديب)">Catacombs (السراديب المظلمة)</option>
                    <option value="High Tower (البرج)">High Tower (البرج المعلق)</option>
                    <option value="Lunar Base (القمر)">Lunar Base (جاذبية منخفضة)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="py-2.5 bg-[#17251c] text-gray-300 text-xs font-bold rounded-xl border border-[#2b4430] cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-black text-xs font-black rounded-xl shadow-md cursor-pointer hover:brightness-110 active:scale-98 transition-all"
                  >
                    إنشاء وبدء الغرفة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Tactical Private Room PIN Entry Modal */}
        {pinModalRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0e1611] border-2 border-[#2b4430] rounded-2xl p-5 shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">غرفة خاصة محمية</h3>
                    <span className="text-[10px] text-gray-400">{pinModalRoom.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => setPinModalRoom(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmPin} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 font-bold block mb-1">
                    أدخل رمز المرور التكتيكي (PIN):
                  </label>
                  <input
                    type="password"
                    autoFocus
                    placeholder="مثال: 1234"
                    value={roomPinInput}
                    onChange={(e) => {
                      setRoomPinInput(e.target.value);
                      setPinError(false);
                    }}
                    className={`w-full bg-[#080d09] border ${
                      pinError ? 'border-rose-500' : 'border-[#233526]'
                    } rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 text-center tracking-widest font-mono text-base`}
                  />
                  {pinError && (
                    <span className="text-[10px] text-rose-400 mt-1 block">
                      يرجى كتابة رمز المرور للدخول للغرفة
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPinModalRoom(null)}
                    className="py-2.5 bg-[#17251c] text-gray-300 text-xs font-bold rounded-xl border border-[#2b4430] cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-black text-xs font-black rounded-xl shadow-md cursor-pointer hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Swords size={14} />
                    <span>تأكيد والدخول</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tactical Map Briefing Modal */}
      <TacticalMapBriefingModal
        isOpen={showMapBriefingModal}
        onClose={() => setShowMapBriefingModal(false)}
        selectedMapId={selectedMapId}
        onSelectMap={(map) => {
          setSelectedMapId(map.id);
          setNewRoomMap(map.arName);
          showToast(`🗺️ تم اعتماد خريطة [${map.arName}] بنجاح!`);
        }}
      />

      {/* Floating Toast */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2"
        >
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Invite Squad Friends to Lobby Modal */}
      {showInviteSquadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg bg-gradient-to-b from-[#0e1911] via-[#09110b] to-[#040805] border-2 border-[#203a26] rounded-3xl p-5 shadow-2xl space-y-4 text-right overflow-y-auto max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-cyan-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">دعوة أصدقاء للوقوف في اللوبي 🤝</h3>
                  <p className="text-[11px] text-gray-400">اختر أصدقاءك ليقفوا معك بملابسهم وأسلحتهم على المنصة</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteSquadModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Pending Friend Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3 space-y-2">
                <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <UserPlus size={14} className="text-amber-400" />
                  <span>طلبات الصداقة المعلقة ({pendingRequests.length})</span>
                </h4>
                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-black/60 p-2.5 rounded-xl border border-amber-500/20"
                    >
                      <div>
                        <span className="text-xs font-black text-white block">{req.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono">{req.rank} • Lvl {req.level}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAcceptFriendRequest(req)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1 rounded-lg text-xs font-black active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck size={13} />
                          <span>قبول</span>
                        </button>
                        <button
                          onClick={() => handleRejectFriendRequest(req.id)}
                          className="bg-red-950 hover:bg-red-900 text-red-300 px-2 py-1 rounded-lg text-xs font-black active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <UserX size={13} />
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Online Friends to Invite */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <Users size={14} />
                <span>الأصدقاء المتصلون بالإنترنت ({friends.filter(f => f.status === 'online').length})</span>
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {friends.filter(f => f.status === 'online').length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs">لا يوجد أصدقاء متصلون الآن</div>
                ) : (
                  friends.filter(f => f.status === 'online').map((friend) => {
                    const isAlreadyInSquad = squadMembers.some((m) => m?.id === friend.id);
                    return (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between bg-black/50 p-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <div>
                            <span className="text-xs font-black text-white block">{friend.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{friend.rank} • {friend.activity}</span>
                          </div>
                        </div>

                        {isAlreadyInSquad ? (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-lg text-[11px] font-black">
                            واقف باللوبي 🟢
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInviteToLobbySquad(friend)}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-3.5 py-1 rounded-lg text-xs font-black shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <UserPlus size={13} />
                            <span>دعوة للوقوف 📩</span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Add Friend Input */}
            <form onSubmit={handleAddQuickFriend} className="pt-2 border-t border-emerald-500/20 space-y-2">
              <label className="text-xs text-gray-300 font-bold block">
                إرسال طلب صداقة جديد بالاسم/الرمز:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ادخل اسم اللاعب (مثال: Shadow_Wolf)..."
                  value={newFriendNameInput}
                  onChange={(e) => setNewFriendNameInput(e.target.value)}
                  className="flex-1 bg-[#08110a] border border-[#233f28] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2 rounded-xl text-xs font-black shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send size={14} />
                  <span>إرسال</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* In-Lobby Character Customization Overlay Modal */}
      {showCustomizationModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-2 sm:p-4 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <CharacterCustomization onClose={() => setShowCustomizationModal(false)} />
          </div>
        </div>
      )}

      <FriendsModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        onInviteFriend={(name) => showToast(`📨 تم إرسال دعوة إلى ${name} للانضمام لفريقك!`)}
      />

      {/* 1v1 Battle Challenge Animated Overlay */}
      {activeChallenge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-full max-w-md rounded-3xl p-6 text-center border-2 shadow-[0_0_50px_rgba(245,158,11,0.3)] bg-gradient-to-b ${
              activeChallenge.status === 'accepted'
                ? 'border-emerald-500 from-[#0c1a10] to-[#050b07] shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                : 'border-amber-500 from-[#1b150c] to-[#0b0805]'
            }`}
          >
            {/* Visual radar/signal indicator */}
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-spin ${
                activeChallenge.status === 'accepted' ? 'border-emerald-500/60' : 'border-amber-500/60'
              }`} style={{ animationDuration: '6s' }} />
              <div className={`absolute inset-2 rounded-full border border-double animate-ping ${
                activeChallenge.status === 'accepted' ? 'border-emerald-400/40' : 'border-amber-400/40'
              }`} style={{ animationDuration: '3s' }} />
              
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold bg-black/50 border-2 ${
                activeChallenge.status === 'accepted' ? 'border-emerald-400 text-emerald-400' : 'border-amber-400 text-amber-400'
              }`}>
                {activeChallenge.status === 'accepted' ? '⚔️' : '📡'}
              </div>
            </div>

            <h3 className={`text-xl font-black mb-2 ${
              activeChallenge.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {activeChallenge.status === 'accepted' ? 'تم قبول التحدي الثنائي!' : 'جاري إرسال تحدي 1 ضد 1'}
            </h3>

            <p className="text-sm text-gray-300 font-bold mb-4">
              {activeChallenge.status === 'accepted' ? (
                <>
                  يستعد اللاعب <span className="text-white font-black underline">{activeChallenge.friendName}</span> للنزول إلى ساحة المعركة!
                </>
              ) : (
                <>
                  بانتظار قبول التحدي من قبل <span className="text-white font-black">{activeChallenge.friendName}</span>...
                </>
              )}
            </p>

            {/* Simulated Live Connection Stats */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 mb-6 space-y-1.5 text-right text-xs">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-emerald-400 font-mono font-bold">مستقر (24ms)</span>
                <span>جودة الاتصال (Ping):</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-cyan-400 font-bold">1v1 Combat Challenge</span>
                <span>نمط اللعب:</span>
              </div>
              {activeChallenge.status === 'pending' && (
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-amber-400 animate-pulse font-mono font-bold">جاري البحث عن استجابة اللاسلكي...</span>
                  <span>الحالة الحالية:</span>
                </div>
              )}
            </div>

            {/* Footer timer/actions */}
            {activeChallenge.status === 'accepted' ? (
              <div className="space-y-2">
                <div className="text-xs text-emerald-400 font-mono font-black flex items-center justify-center gap-1.5 bg-emerald-950/40 py-2 px-4 rounded-xl border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>يبدأ القتال الفردي خلال {activeChallenge.countdown} ثوان...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-amber-300 font-mono font-bold">
                  الوقت المتبقي لانتهاء صلاحية الطلب: {activeChallenge.countdown} ثوان
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setActiveChallenge(null);
                    showToast('❌ تم إلغاء طلب التحدي بنجاح.');
                  }}
                  className="w-full bg-[#3f1616] hover:bg-[#581c1c] text-red-300 border border-red-500/40 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer"
                >
                  إلغاء التحدي الفوري 🛑
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

