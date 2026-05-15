-- Migration: enable_realtime
-- Enables Supabase Realtime for the research pipeline tables

-- 1. Enable Realtime for research_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE research_sessions;

-- 2. Enable Realtime for agent_runs
ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;

-- 3. Enable Realtime for fetched_news (optional, but good for visibility)
ALTER PUBLICATION supabase_realtime ADD TABLE fetched_news;
