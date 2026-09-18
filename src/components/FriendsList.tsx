import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, UserCheck, UserX, MessageSquare, Shield } from 'lucide-react';
import { Friend } from '../types';

export const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([
    { id: 'f1', name: 'قناص الغابة', status: 'online' },
    { id: 'f2', name: 'الوحش الكاسر', status: 'in-match' },
    { id: 'f3', name: 'جندي الدعم', status: 'offline' },
  ]);

  return (
    <div className="bg-[#121e15] border-2 border-[#2b4430] rounded-2xl p-4 shadow-xl">
      <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
        <MessageSquare size={16} className="text-emerald-400" />
        قائمة الأصدقاء
      </h3>
      <div className="space-y-2">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center justify-between bg-[#0a110c] p-2 rounded-xl border border-[#223525]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                friend.status === 'online' ? 'bg-emerald-400' : 
                friend.status === 'in-match' ? 'bg-amber-400' : 'bg-gray-500'
              }`} />
              <span className="text-xs font-bold text-gray-200">{friend.name}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">
              {friend.status === 'online' ? 'متصل' : friend.status === 'in-match' ? 'في مباراة' : 'غير متصل'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
