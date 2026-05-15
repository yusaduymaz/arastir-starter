-- research_history tablosuna canlı ilerleme takibi için sütunlar eklenmesi
ALTER TABLE research_history 
  ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_step TEXT DEFAULT 'initializing';
