"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/validations/settings";

export async function saveUserSettings(prevState: any, formData: FormData) {
  try {
    const { userId } = auth();
    if (!userId) {
      return { error: "Oturum bulunamadı.", message: "" };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rawData = {
      theme: formData.get("theme"),
      notifications_enabled: formData.get("notifications_enabled"),
    };

    const validatedData = settingsSchema.safeParse(rawData);

    if (!validatedData.success) {
      return { error: "Geçersiz form verisi.", message: "" };
    }

    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        theme: validatedData.data.theme,
        notifications_enabled: validatedData.data.notifications_enabled,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error(upsertError);
      return { error: "Ayarlar kaydedilirken hata oluştu.", message: "" };
    }

    revalidatePath("/dashboard/settings");
    return { message: "Ayarlar başarıyla kaydedildi.", error: "" };
  } catch (err) {
    console.error(err);
    return { error: "Bilinmeyen bir hata oluştu.", message: "" };
  }
}