-- Fix: research_sessions tablosuna eksik JSONB veri sütunlarını ekle
-- Bu sütunlar eskiden research_history tablosuna eklenmişti ama
-- Phase 11 migration'ında research_sessions yeniden oluşturulurken taşınmadı.
-- Bu eksiklik, pipeline'ın son update'inde sessizce hata almasına ve
-- status'ün 'running' -> 'completed' olarak güncellenmemesine neden oluyordu.

ALTER TABLE research_sessions
  ADD COLUMN IF NOT EXISTS kap_data JSONB,
  ADD COLUMN IF NOT EXISTS news_data JSONB,
  ADD COLUMN IF NOT EXISTS market_data JSONB,
  ADD COLUMN IF NOT EXISTS macro_data JSONB,
  ADD COLUMN IF NOT EXISTS synthesis_data JSONB;
