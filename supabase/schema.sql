-- Araştırma geçmişi tablosu
CREATE TABLE
  research_history (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone ('utc'::TEXT, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, in_progress, completed, failed
    result_path TEXT,
    error_message TEXT,
    CONSTRAINT query_length CHECK (char_length(query) > 0)
  );

-- Araştırma geçmişi tablosu için RLS (Row Level Security) politikaları
ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;

-- Kullanıcıların sadece kendi araştırma geçmişlerini görmesini sağlayan politika
CREATE POLICY "Allow individual read access" ON research_history FOR
SELECT
  USING (auth.uid () = user_id);

-- Kullanıcıların sadece kendi adlarına yeni araştırma eklemesini sağlayan politika
CREATE POLICY "Allow individual insert access" ON research_history FOR INSERT
WITH
  CHECK (auth.uid () = user_id);
