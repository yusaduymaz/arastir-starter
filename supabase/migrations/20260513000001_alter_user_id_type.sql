-- Mevcut politikaları sil (Bu politikalar user_id sütununa bağımlıydı)
DROP POLICY IF EXISTS "Allow individual read access" ON research_history;
DROP POLICY IF EXISTS "Allow individual insert access" ON research_history;

-- Yabancı anahtar kısıtlamasını sil (eğer varsa)
ALTER TABLE research_history DROP CONSTRAINT IF EXISTS research_history_user_id_fkey;

-- Sütun tipini değiştir (UUID'den TEXT'e)
ALTER TABLE research_history ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- (İsteğe bağlı) Clerk için özel bir politika eklenene kadar RLS aktif ama varsayılan olarak "deny all" durumunda kalır.
-- Uygulama arka ucu Service Role Key kullandığı için RLS'i aşarak işlemleri sorunsuz yapacaktır.
ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;