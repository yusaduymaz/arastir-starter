# Araştır — AI-Powered Research Agent

## Proje Özeti
Türkiye odaklı derin araştırma motoru. Kullanıcı bir konu verir, sistem çoklu agent mimarisiyle
kaynakları toplar, doğrular, sentezler ve PDF + PPTX rapor üretir.

## Hedef Kullanıcı
- BIST yatırımcıları ve analistler
- KOBİ'ler için pazar araştırması yapanlar
- Finans öğrencileri ve araştırmacılar

## Temel Özellikler
1. Web'den Türkçe + İngilizce kaynak toplama (KAP, haberler, raporlar)
2. Kaynak doğrulama ve çapraz kontrol
3. Farklı bakış açılarını karşılaştırma
4. Özet + sentez üretme
5. PDF rapor ve PPTX sunum çıktısı

## Agent Mimarisi
```
Kullanıcı → [Orchestrator]
                ↓
    ┌──────────────────────────┐
    │  .gemini/agents/         │
    │  ├── search-agent.md     │
    │  ├── validator-agent.md  │
    │  ├── analyst-agent.md    │
    │  └── writer-agent.md     │
    └──────────────────────────┘
                ↓
          outputs/ (PDF + PPTX)
```

## Tech Stack
- **CLI**: Gemini CLI (multi-agent, subagents)
- **Backend**: Next.js 14 + TypeScript
- **Database**: Supabase (araştırma geçmişi, kullanıcılar)
- **Output**: Puppeteer (PDF) + pptxgenjs (PPTX)
- **AI Providers**: Gemini (Primary, gemini-1.5-pro) ve Anthropic (Fallback, claude-3-5-sonnet)
- **Deploy**: Vercel

## Klasör Yapısı
```
arastir/
├── GEMINI.md              ← bu dosya
├── .gemini/
│   ├── settings.json      ← Gemini CLI config
│   └── agents/            ← subagent tanımları
│       ├── search-agent.md
│       ├── validator-agent.md
│       ├── analyst-agent.md
│       └── writer-agent.md
├── src/
│   ├── app/               ← Next.js app router
│   ├── agents/            ← agent logic (TypeScript)
│   ├── lib/               ← supabase, stripe, utils
│   └── components/        ← UI
├── outputs/               ← üretilen PDF/PPTX dosyaları
└── research/              ← agent ara çıktıları (JSON)
```

## Coding Kuralları
- TypeScript strict mode
- Her agent kendi hata yönetimini yapar
- Araştırma sonuçları her zaman `research/` altına JSON olarak kaydedilir
- Output dosyaları `outputs/{timestamp}-{konu}/` klasörüne gider
- Türkçe kaynaklara öncelik ver, İngilizce ile destekle

## Gemini CLI Komutları
```bash
# Tek araştırma başlat
gemini "THYAO için yatırım tezi hazırla"

# Spesifik agent çağır
gemini "@search-agent KAP'tan THYAO son 3 bildirimi getir"
gemini "@analyst-agent bu verileri sentezle"
gemini "@writer-agent raporu PDF olarak üret"

# Paralel araştırma
gemini "THYAO, PGSUS ve MAVI için sektör karşılaştırması yap"
```

## Önemli Notlar
- KAP verileri için https://www.kap.org.tr kullan
- Haberlere için Mynet Finans, Bloomberg HT, Dünya gazetesi
- Makro veri için TCMB, TÜİK, BDDK resmi siteleri
- Her araştırmaya zaman damgası ekle
- Kaynak URL'lerini her zaman sakla

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
