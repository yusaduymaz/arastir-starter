"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tier, SubscriptionStatus, PLAN_CONFIG } from "@/types/saas";

interface SubscriptionTabProps {
  tier: Tier;
  subscriptionStatus: SubscriptionStatus;
  tokensBalance: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const TIER_COLORS: Record<Tier, string> = {
  free:       "#64748b",
  starter:    "#60a5fa",
  pro:        "#facc15",
  agency:     "#22c55e",
  enterprise: "#a78bfa",
};

const STATUS_LABELS: Record<SubscriptionStatus, { label: string; color: string }> = {
  active:   { label: "AKTİF",             color: "#22c55e" },
  trialing: { label: "DENEME",            color: "#60a5fa" },
  past_due: { label: "GECİKMİŞ ÖDEME",   color: "#ef4444" },
  canceled: { label: "İPTAL EDİLDİ",     color: "#64748b" },
  inactive: { label: "AKTİF DEĞİL",      color: "#64748b" },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function SubscriptionTab({
  tier,
  subscriptionStatus,
  tokensBalance,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: SubscriptionTabProps) {
  const [portalLoading, setPortalLoading] = useState(false);

  const planConfig = PLAN_CONFIG[tier];
  const isEnterprise = planConfig.tokens === -1;
  const totalTokens = planConfig.tokens;
  const usedTokens = isEnterprise ? 0 : Math.max(0, totalTokens - tokensBalance);
  const usagePercent = isEnterprise ? 0 : Math.min(100, (usedTokens / totalTokens) * 100);

  const barColor =
    usagePercent > 95
      ? "#ef4444"
      : usagePercent > 80
      ? "#facc15"
      : "#22c55e";

  const tierColor = TIER_COLORS[tier];
  const statusInfo = STATUS_LABELS[subscriptionStatus];
  const isFree = tier === "free";

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* 1. Current Plan Card */}
      <section className="p-6 rounded-lg border border-[#22c55e]/20 bg-[#0a0a0a]">
        <p className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50 tracking-widest uppercase mb-4">
          // MEVCUT PLAN
        </p>

        <div className="flex flex-col gap-3">
          {/* Tier badge */}
          <div className="flex items-center gap-3">
            <span
              className="font-['Montserrat'] font-black text-3xl uppercase tracking-wider"
              style={{ color: tierColor }}
            >
              {planConfig.label}
            </span>
          </div>

          {/* Status chip */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest"
              style={{ color: statusInfo.color }}
            >
              <span style={{ fontSize: "8px" }}>●</span>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Token Usage Bar */}
      <section className="p-6 rounded-lg border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
          <span className="material-symbols-outlined text-[#22c55e]">token</span>
          <h2 className="text-white font-['Montserrat'] font-bold text-sm tracking-wide uppercase">
            Araştırma Kullanımı
          </h2>
        </div>

        {isEnterprise ? (
          <p className="font-['JetBrains_Mono'] text-[13px] text-[#a78bfa]">
            Sınırsız araştırma — Enterprise plan
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#1a1a1b] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${usagePercent}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>

            {/* Usage text */}
            <p className="font-['JetBrains_Mono'] text-[12px]" style={{ color: barColor }}>
              {usedTokens} / {totalTokens} araştırma kullanıldı bu dönem
            </p>

            <p className="font-['Inter'] text-[11px] text-[#45474c]">
              Kalan bakiye: {tokensBalance} araştırma
            </p>
          </div>
        )}
      </section>

      {/* 3. Renewal Info & Cancel Warning */}
      {(currentPeriodEnd || cancelAtPeriodEnd) && (
        <section className="flex flex-col gap-3">
          {currentPeriodEnd && !cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 p-3 rounded border border-white/10 bg-[#0a0a0a]">
              <span className="material-symbols-outlined text-[#64748b] text-[16px]">calendar_today</span>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">
                Sonraki yenileme:{" "}
                <span className="text-white">{formatDate(currentPeriodEnd)}</span>
              </p>
            </div>
          )}

          {cancelAtPeriodEnd && currentPeriodEnd && (
            <div className="flex items-start gap-3 p-4 rounded border border-[#ef4444]/30 bg-[#ef4444]/5">
              <span className="text-[#ef4444] font-['JetBrains_Mono'] text-[13px]">⚠</span>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#ef4444]">
                Aboneliğiniz{" "}
                <span className="font-bold">{formatDate(currentPeriodEnd)}</span>{" "}
                tarihinde iptal edilecek. Devam etmek için portalı kullanın.
              </p>
            </div>
          )}
        </section>
      )}

      {/* 4. Action Button */}
      <div className="flex flex-col gap-3">
        {isFree ? (
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center gap-2 bg-[#22c55e] text-black font-['Montserrat'] font-bold text-sm px-6 py-2.5 rounded hover:bg-[#22c55e]/90 transition-colors w-fit"
          >
            Planı Yükselt →
          </Link>
        ) : (
          <button
            type="button"
            onClick={handlePortal}
            disabled={portalLoading}
            className="inline-flex items-center justify-center gap-2 bg-[#facc15] text-black font-['Montserrat'] font-bold text-sm px-6 py-2.5 rounded hover:bg-[#facc15]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
          >
            {portalLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                YÖNLENDİRİLİYOR...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                Aboneliği Yönet (Stripe Portal)
              </>
            )}
          </button>
        )}
      </div>

      {/* 5. Plan Comparison Note */}
      <div className="pt-2 border-t border-white/5">
        <Link
          href="/#pricing"
          className="font-['JetBrains_Mono'] text-[11px] text-[#45474c] hover:text-[#64748b] transition-colors"
        >
          Planları karşılaştır ve yükselt →
        </Link>
      </div>

    </div>
  );
}
