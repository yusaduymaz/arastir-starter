-- Araştırma geçmişi tablosu (Clerk Auth Uyumluluğu ile güncellenmiş)
CREATE TABLE IF NOT EXISTS
  research_history (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone ('utc'::TEXT, NOW()) NOT NULL,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, in_progress, completed, failed
    result_path TEXT,
    error_message TEXT,
    CONSTRAINT query_length CHECK (char_length(query) > 0)
  );

ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;

-- Politikalar: API rotasında Service Role Key kullanıldığı için backend işlemleri RLS'i otomatik aşar.
-- Kullanıcıya doğrudan (istemci tarafı) veri okuma yetkisi verilirse aşağıdaki politika açılabilir:
-- CREATE POLICY "Allow individual read access" ON research_history FOR SELECT USING (auth.jwt()->>'sub' = user_id);