-- Araştırma geçmişi tablosu
CREATE TABLE
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

-- Araştırma geçmişi tablosu için RLS (Row Level Security) politikaları
ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;

-- Politikalar kaldırıldı çünkü Clerk Authentication kullanılıyor ve
-- API rotası Service Role Key üzerinden veritabanına RLS'i aşarak erişiyor.