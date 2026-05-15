"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NAV_ITEMS = [
  { href: '/dashboard',         icon: 'add',          label: 'Yeni Araştırma', exact: true },
  { href: '/dashboard/history', icon: 'description',  label: 'Raporlarım' },
  { href: '/dashboard/data-sources', icon: 'database',label: 'Veri Kaynakları' },
  { href: '/dashboard/settings', icon: 'settings',    label: 'Ayarlar' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group relative overflow-hidden ${
              isActive
                ? 'bg-[#22c55e]/08 border-l-2 border-[#facc15] text-white'
                : 'border-l-2 border-transparent text-[#64748b] hover:text-[#c5c6cc] hover:bg-white/03'
            }`}
          >
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#facc15]/05 to-transparent pointer-events-none" />
            )}
            <span
              className={`material-symbols-outlined text-[20px] relative z-10 ${
                isActive ? 'text-[#facc15]' : 'text-inherit'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-['Inter'] text-sm font-medium relative z-10">{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#facc15]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
