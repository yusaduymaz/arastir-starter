-- 1. Structured Data Tables for Research Elements
CREATE TABLE IF NOT EXISTS market_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    price DECIMAL,
    change_percent DECIMAL,
    pe_ratio DECIMAL,
    market_cap TEXT,
    currency TEXT DEFAULT 'TRY',
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    source TEXT,
    sentiment TEXT, -- positive, negative, neutral
    relevance_score FLOAT,
    published_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kap_disclosures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    disclosure_url TEXT,
    publish_date TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_synthesis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    summary_text TEXT,
    key_takeaways JSONB, -- Array of points
    risk_factors JSONB, -- Array of points
    investment_thesis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add Indexing for Performance
CREATE INDEX IF NOT EXISTS idx_market_quotes_session ON market_quotes(session_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_session ON news_articles(session_id);
CREATE INDEX IF NOT EXISTS idx_kap_disclosures_session ON kap_disclosures(session_id);
CREATE INDEX IF NOT EXISTS idx_synthesis_session ON research_synthesis(session_id);

-- 3. Update research_sessions to include a synthesis reference if needed
ALTER TABLE research_sessions ADD COLUMN IF NOT EXISTS summary_preview TEXT;
