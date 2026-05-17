'use client';

import { useEffect, useState } from 'react';
import { UsersDataTable } from '@/components/admin/users/UsersDataTable';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.2em] uppercase">Sistem_Kullanıcı_Yönetimi</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight font-display italic">Kullanıcı Veritabanı</h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <UsersDataTable users={users} onUserUpdated={fetchUsers} />
      )}
    </div>
  );
}
