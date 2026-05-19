"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { UserSettings, Tier, SubscriptionStatus } from "@/types/saas";
import { saveUserSettings } from "@/lib/actions/settings";
import { SubscriptionTab } from "@/components/dashboard/SubscriptionTab";

const initialState = { message: "", error: "" };

interface SettingsFormProps {
  initialSettings?: Partial<UserSettings>;
  subscription?: {
    tier: Tier;
    subscriptionStatus: SubscriptionStatus;
    tokensBalance: number;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#22c55e] text-black font-['Montserrat'] font-bold text-sm px-6 py-2.5 rounded hover:bg-[#22c55e]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
          KAYDEDİLİYOR...
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">save</span>
          AYARLARI KAYDET
        </>
      )}
    </button>
  );
}

function SettingsFormInner({ initialSettings, subscription }: SettingsFormProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"general" | "subscription">("general");
  const [theme, setTheme] = useState(initialSettings?.theme || "dark");
  const [emailNotif, setEmailNotif] = useState(initialSettings?.notifications_enabled ?? true);

  const [state, formAction] = useFormState(saveUserSettings, initialState);

  useEffect(() => {
    if (searchParams.get("tab") === "abonelik") {
      setActiveTab("subscription");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-0 max-w-3xl relative z-10">

      {/* Tab Navigation */}
      <div className="flex gap-0 border-b border-[#1a1a1b] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest transition-colors ${
            activeTab === "general"
              ? "text-[#22c55e] border-b-2 border-[#22c55e]"
              : "text-[#45474c] hover:text-[#64748b]"
          }`}
        >
          ⚙ Genel Ayarlar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={`px-4 py-2.5 font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest transition-colors ${
            activeTab === "subscription"
              ? "text-[#facc15] border-b-2 border-[#facc15]"
              : "text-[#45474c] hover:text-[#64748b]"
          }`}
        >
          💳 Abonelik
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <form action={formAction} className="flex flex-col gap-8">

          {/* Theme Settings */}
          <section className="p-6 rounded-lg border border-white/10 bg-[#0a0a0a]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <span className="material-symbols-outlined text-[#22c55e]">palette</span>
              <h2 className="text-white font-['Montserrat'] font-bold text-sm tracking-wide uppercase">Görünüm</h2>
            </div>

            <div className="flex gap-4">
              {["dark", "light", "system"].map((t) => (
                <label key={t} className={`flex-1 cursor-pointer flex flex-col items-center gap-3 p-4 rounded border ${theme === t ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/10 hover:border-white/20"}`}>
                  <input
                    type="radio"
                    name="theme"
                    value={t}
                    checked={theme === t}
                    onChange={(e) => setTheme(e.target.value as string)}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-2xl text-[#64748b]">
                    {t === "dark" ? "dark_mode" : t === "light" ? "light_mode" : "devices"}
                  </span>
                  <span className="text-xs font-['Inter'] text-white/80 capitalize">
                    {t === "dark" ? "Karanlık" : t === "light" ? "Aydınlık" : "Sistem"}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="p-6 rounded-lg border border-white/10 bg-[#0a0a0a]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <span className="material-symbols-outlined text-[#22c55e]">notifications</span>
              <h2 className="text-white font-['Montserrat'] font-bold text-sm tracking-wide uppercase">Bildirimler</h2>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between p-3 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex flex-col">
                  <span className="text-white text-sm font-['Inter']">E-posta Bildirimleri</span>
                  <span className="text-[#64748b] text-xs font-['Inter']">Raporlar tamamlandığında e-posta al</span>
                </div>
                <input
                  type="checkbox"
                  name="notifications_enabled"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="accent-[#22c55e] w-4 h-4"
                />
              </label>
            </div>
          </section>

          {/* Save Button & Status Messages */}
          <div className="flex flex-col items-end gap-2 pt-4">
            <SubmitButton />

            {state?.message && (
              <p className="text-[#facc15] font-['JetBrains_Mono'] text-xs uppercase">{state.message}</p>
            )}
            {state?.error && (
              <p className="text-[#ef4444] font-['JetBrains_Mono'] text-xs uppercase">{state.error}</p>
            )}
          </div>

        </form>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && subscription && (
        <SubscriptionTab
          tier={subscription.tier}
          subscriptionStatus={subscription.subscriptionStatus}
          tokensBalance={subscription.tokensBalance}
          currentPeriodEnd={subscription.currentPeriodEnd}
          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
        />
      )}

      {/* Subscription tab — no data fallback */}
      {activeTab === "subscription" && !subscription && (
        <p className="font-['JetBrains_Mono'] text-[12px] text-[#45474c]">
          Abonelik verisi yüklenemedi.
        </p>
      )}

    </div>
  );
}

export function SettingsForm(props: SettingsFormProps) {
  return (
    <Suspense fallback={null}>
      <SettingsFormInner {...props} />
    </Suspense>
  );
}
