'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, LogOut, Terminal, FileText, Wifi } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
  { name: 'Oturumlar', href: '/admin/sessions', icon: Activity },
  { name: 'Sistem Logları', href: '/admin/logs', icon: FileText },
  { name: 'API Durumu', href: '/admin/api-status', icon: Wifi },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r border-[#22c55e]/10 bg-[#080808] h-screen">
      <div className="h-20 flex items-center px-6 border-b border-[#22c55e]/10 gap-3">
        <div className="w-8 h-8 rounded bg-[#4edea3] flex items-center justify-center">
          <Terminal className="w-5 h-5 text-[#003824]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white tracking-tight">ARAŞTIR</span>
          <span className="text-[10px] text-[#4edea3]/60 font-mono tracking-widest uppercase">Admin</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20 shadow-[0_0_15px_rgba(78,222,163,0.05)]'
                  : 'text-[#64748b] hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 flex-shrink-0 h-5 w-5',
                  isActive ? 'text-[#4edea3]' : 'text-[#45474c]'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#22c55e]/10">
        <SignOutButton>
          <button className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" />
            Oturumu Kapat
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
