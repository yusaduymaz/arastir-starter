CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'agency')),
    tokens_balance INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politikalar arka uçta Service Role Key ile aşıldığı için istemci tarafına sadece okuma izni (eğer istenirse) verebiliriz.
-- İstemciden veriye direkt erişim yoksa (sadece Next.js Server Components üzerinden erişiliyorsa) politikalar şart değildir.
