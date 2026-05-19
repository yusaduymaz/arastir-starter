import { X, Shield, Mail, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BorderBeam } from '@/components/ui/BorderBeam';

interface EditUserDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({ user, isOpen, onClose, onUserUpdated }: EditUserDialogProps) {
  const [role, setRole] = useState('user');
  const [tokenAdjustment, setTokenAdjustment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role || 'user');
      setTokenAdjustment('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const adjustmentNum = parseInt(tokenAdjustment, 10) || 0;

      const res = await fetch(`/api/admin/users/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, token_adjustment: adjustmentNum }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Güncelleme başarısız oldu');
      }

      setTokenAdjustment('');
      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="bg-[#0D0D0D] border border-white/[0.05] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <BorderBeam size={160} duration={8} borderWidth={1.5} colorFrom="#4edea3" colorTo="#FACC15" />
        
        <div className="flex justify-between items-center p-6 border-b border-[#22c55e]/10 relative z-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Kullanıcı Düzenle</h2>
            <p className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest">SYS_USER_EDIT_v1</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[#45474c] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-mono text-[#64748b] uppercase tracking-widest">
              <Mail size={12} /> E-posta
            </label>
            <div className="bg-black/40 border border-[#22c55e]/10 p-3 rounded-lg text-sm text-[#4edea3]/80 font-mono">
              {user.email || user.id}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-mono text-[#64748b] uppercase tracking-widest">
              <Shield size={12} /> Sistem Rolü
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black border border-[#22c55e]/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] transition-all appearance-none cursor-pointer"
              disabled={loading}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2345474c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px'
              }}
            >
              <option value="user" className="bg-[#0D0D0D]">User (Standart)</option>
              <option value="admin" className="bg-[#0D0D0D]">Admin (Yönetici)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-mono text-[#64748b] uppercase tracking-widest">
              <Coins size={12} /> Token Yönetimi
            </label>
            <div className="bg-black/40 border border-[#22c55e]/10 p-3 rounded-lg text-sm text-[#FACC15]/80 font-mono">
              Mevcut Bakiye: {user?.tokens_balance ?? 0} TOKEN
            </div>
            <input
              type="number"
              value={tokenAdjustment}
              onChange={(e) => setTokenAdjustment(e.target.value)}
              placeholder="+100 veya -50"
              className="w-full bg-black border border-[#22c55e]/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3] transition-all"
              disabled={loading}
            />
            <p className="text-[10px] text-[#45474c] font-mono">Pozitif = ekle, Negatif = çıkar (0 ise değişmez)</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs font-mono">
              [HATA]: {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-[#64748b] bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-all"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-sm font-bold text-[#003824] bg-[#4edea3] rounded-lg hover:bg-[#4edea3]/90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(78,222,163,0.2)]"
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
