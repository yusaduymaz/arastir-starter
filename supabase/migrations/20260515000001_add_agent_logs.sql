-- research_history tablosuna agent logları için sütun eklenmesi
ALTER TABLE research_history 
  ADD COLUMN IF NOT EXISTS agent_logs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extracted_ticker TEXT;
