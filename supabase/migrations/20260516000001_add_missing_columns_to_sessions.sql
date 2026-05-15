ALTER TABLE research_sessions ADD COLUMN current_step TEXT;
ALTER TABLE research_sessions ADD COLUMN agent_logs JSONB DEFAULT '[]'::jsonb;
