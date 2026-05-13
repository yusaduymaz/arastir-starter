# Araştır 🔍

Türkiye odaklı AI-powered araştırma motoru. Gemini CLI multi-agent sistemi ile
KAP, haberler ve resmi kaynaklardan otomatik araştırma, doğrulama ve rapor üretimi.

## Kurulum

### 1. Gemini CLI
```bash
npm install -g @google/gemini-cli

# Google hesabınla giriş yap
gemini auth login
```

### 2. Proje bağımlılıkları
```bash
npm install
```

### 3. Ortam değişkenleri
```bash
cp .env.example .env.local
# .env.local dosyasını düzenle
```

### 4. Supabase şeması
```bash
# Supabase dashboard'da SQL Editor'e git
# supabase/schema.sql dosyasını çalıştır
```

## Gemini CLI Kullanımı

```bash
# Proje klasöründeyken Gemini CLI başlat
cd arastir
gemini

# Mevcut agentları gör
/agents

# Tam araştırma başlat (orchestrator yönlendirir)
> THYAO için 2025 yatırım tezi hazırla

# Spesifik agent çağır
> @search-agent THYAO son 3 KAP bildirimini getir
> @validator-agent toplanan kaynakları doğrula
> @analyst-agent boğa ve ayı senaryolarını analiz et
> @writer-agent raporu oluştur
```

## Proje Yapısı

```
arastir/
├── GEMINI.md                    ← Gemini CLI proje bağlamı
├── .gemini/
│   ├── settings.json            ← CLI ayarları
│   └── agents/                  ← Subagent tanımları
│       ├── search-agent.md
│       ├── validator-agent.md
│       ├── analyst-agent.md
│       └── writer-agent.md
├── src/
│   ├── app/                     ← Next.js app router
│   ├── types/research.ts        ← TypeScript tipleri
│   └── lib/
│       ├── supabase/
│       └── research/
├── supabase/
│   └── schema.sql               ← Veritabanı şeması
├── research/                    ← Agent ara çıktıları (gitignore)
└── outputs/                     ← PDF/PPTX çıktıları (gitignore)
```

## Tech Stack

- **CLI**: Gemini CLI (multi-agent subagents)
- **Frontend**: Next.js 14 + TypeScript + Tailwind
- **Database**: Supabase (PostgreSQL + Auth)
- **Output**: Puppeteer (PDF) + pptxgenjs (PPTX)
- **Payment**: Stripe
- **Deploy**: Vercel

## Roadmap

- [x] Gemini CLI kurulumu + GEMINI.md
- [x] 4 subagent tanımı (search, validator, analyst, writer)
- [x] TypeScript tip tanımları
- [x] Supabase şeması
- [ ] Next.js UI (araştırma formu + geçmiş)
- [ ] PDF output (Puppeteer)
- [ ] PPTX output (pptxgenjs)
- [ ] Stripe entegrasyonu
- [ ] Vercel deploy
