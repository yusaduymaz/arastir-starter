"use client";

import React from "react";
import { MagicCard } from "@/components/ui/MagicCard";

interface DataSourceCardProps {
  name: string;
  status: "active" | "inactive" | "error";
  description: string;
}

export function DataSourceCard({ name, status, description }: DataSourceCardProps) {
  return (
    <MagicCard
      className="bg-[#080808] border border-[#22c55e]/12 p-4 flex flex-col gap-3"
      glowColor="rgba(34,197,94,0.1)"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-['JetBrains_Mono'] text-sm text-white">{name}</h3>
        <span className="relative flex h-2 w-2">
          <span className={`status-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${status === 'active' ? 'bg-[#22c55e]' : status === 'error' ? 'bg-[#ef4444]' : 'bg-[#64748b]'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'active' ? 'bg-[#22c55e]' : status === 'error' ? 'bg-[#ef4444]' : 'bg-[#64748b]'}`} />
        </span>
      </div>
      <p className="text-[#64748b] text-xs font-['Inter']">{description}</p>
    </MagicCard>
  );
}
