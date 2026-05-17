'use client';

import { useState } from 'react';
import { EditUserDialog } from './EditUserDialog';
import { User, Shield, Coins, Calendar, MoreVertical } from 'lucide-react';

interface UsersDataTableProps {
  users: any[];
  onUserUpdated: () => void;
}

export function UsersDataTable({ users, onUserUpdated }: UsersDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="bg-[#080808] rounded-xl border border-[#22c55e]/15 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0D0D0D] border-b border-[#22c55e]/10">
                <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Kullanıcı Bilgisi</th>
                <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Abonelik</th>
                <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Token</th>
                <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Kayıt</th>
                <th className="px-6 py-4 text-right text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22c55e]/05">
              {users.map((user) => (
                <tr key={user.user_id || user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#4edea3]/30 transition-colors">
                        <User size={14} className="text-[#64748b]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{user.email || 'Adsız Kullanıcı'}</span>
                        <span className="text-[10px] font-mono text-[#45474c] uppercase">{user.user_id || user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      user.tier === 'free' 
                        ? 'bg-[#45474c]/10 text-[#64748b] border border-[#45474c]/20' 
                        : 'bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20'
                    }`}>
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <div className="flex items-center gap-1.5 text-[#FACC15]">
                        <Shield size={12} />
                        <span className="text-xs font-bold uppercase tracking-tight">Admin</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748b]">Üye</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Coins size={12} className="text-[#FACC15]/60" />
                      <span className="text-sm font-mono text-white">{user.tokens_balance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[#45474c]">
                      <Calendar size={12} />
                      <span className="text-[11px] font-mono">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 rounded-lg hover:bg-[#4edea3]/10 text-[#64748b] hover:text-[#4edea3] transition-all"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-12 text-center text-[#45474c] font-mono text-sm uppercase tracking-widest">
            Sistemde kullanıcı bulunamadı
          </div>
        )}
      </div>

      <EditUserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={selectedUser}
        onUserUpdated={onUserUpdated}
      />
    </>
  );
}
