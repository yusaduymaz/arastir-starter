import React from "react";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { UserSettings } from "@/types/saas";

export const metadata = {
  title: "Ayarlar | Araştır Terminal",
  description: "Kullanıcı tercihleri ve API ayarları",
};

export default async function SettingsPage() {
  const { userId } = await auth();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  let initialSettings: Partial<UserSettings> = {
    theme: "dark",
    notifications_enabled: true,
  };

  if (userId) {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (settings) {
      initialSettings = settings;
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      {/* Page Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-white text-2xl font-bold font-['Montserrat'] tracking-tight mb-2">
          Sistem Ayarları
        </h1>
        <p className="text-[#64748b] text-sm font-['Inter']">
          Terminal görünümünü, bildirim tercihlerinizi ve dış bağlantılarınızı yapılandırın.
        </p>
      </div>

      <div className="bg-[#080808] border border-[#22c55e]/12 rounded-xl p-5 flex flex-col gap-4 max-w-3xl">
        <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50 tracking-widest uppercase">
          // AYARLAR
        </span>
        <SettingsForm initialSettings={initialSettings} />
      </div>

      {/* Decorative terminal artifacts */}
      <div className="fixed bottom-8 right-8 z-0 pointer-events-none opacity-20">
        <pre className="font-['JetBrains_Mono'] text-[8px] text-[#22c55e] text-right">
          {'SYS.CONFIG.LOADED\n'}
          {'USER_PREFS: SECURE_STORE\n'}
          {'NODE: TR-IST-01\n'}
          {'...'}
        </pre>
      </div>
    </div>
  );
}
