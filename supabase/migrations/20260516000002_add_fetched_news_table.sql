-- Relational table to store individual fetched news items efficiently.
-- This prevents the `agent_runs` table from bloating with huge JSON arrays
-- and allows querying news articles globally.

CREATE TABLE IF NOT EXISTS fetched_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    ticker TEXT, -- Explicitly tagging the news to a ticker for fast lookup/caching
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    content TEXT,
    sentiment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL
);

-- Index for fast caching and lookup
CREATE INDEX IF NOT EXISTS idx_fetched_news_ticker ON fetched_news(ticker);
CREATE INDEX IF NOT EXISTS idx_fetched_news_session_id ON fetched_news(session_id);
CREATE INDEX IF NOT EXISTS idx_fetched_news_url ON fetched_news(url);

-- Let's also create an index on agent_runs to easily find previous runs for caching
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_name_status ON agent_runs(agent_name, status);
