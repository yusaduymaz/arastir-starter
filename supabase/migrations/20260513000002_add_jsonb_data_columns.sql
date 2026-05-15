-- research_history tablosuna JSONB formatında detaylı veri tutacak sütunların eklenmesi
ALTER TABLE research_history 
  ADD COLUMN IF NOT EXISTS kap_data JSONB,
  ADD COLUMN IF NOT EXISTS news_data JSONB,
  ADD COLUMN IF NOT EXISTS synthesis_data JSONB;
