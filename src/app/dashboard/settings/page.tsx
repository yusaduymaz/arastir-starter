import React from "react";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { auth } from "@clerk/nextjs/server";
import { UserSettings } from "@/types/saas";

export const metadata = {
  title: "Ayarlar | Araştır Terminal",
  description: "Kullanıcı tercihleri ve API ayarları",
};

export default async function SettingsPage() {
  const { userId } = await auth();

  // In a real implementation, we would fetch the user's settings from the database:
  // const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
  // For now, we pass a mock or empty initial settings object.
  const initialSettings: Partial<UserSettings> = {
    theme: "dark",
    notifications: { email: true, push: false },
  };

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

      <SettingsForm initialSettings={initialSettings} />

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
