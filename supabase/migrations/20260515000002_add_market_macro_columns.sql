-- Phase 10-01: Piyasa ve makroekonomik veri sütunlarının eklenmesi
-- market_data: Hisse fiyatı, P/E, sektör bilgisi vb. (Alpha Vantage'dan)
-- macro_data: USD/TRY, TÜFE, faiz oranı vb. (TCMB EVDS'den)
ALTER TABLE research_history
  ADD COLUMN IF NOT EXISTS market_data JSONB,
  ADD COLUMN IF NOT EXISTS macro_data JSONB;
