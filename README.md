# Araştır — Yapay Zeka Destekli Derin Piyasa Araştırma Motoru 🔍

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![QStash](https://img.shields.io/badge/Upstash-QStash-red?style=flat-square)](https://upstash.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-indigo?style=flat-square&logo=stripe)](https://stripe.com/)

**Araştır**, Türkiye piyasası (BIST) odaklı çalışan, çoklu yapay zeka ajanları (Multi-Agent) mimarisine sahip derin bir finansal araştırma ve pazar analizi motorudur. Kullanıcının doğal dilde ilettiği hisse veya sektörel konu sorgularını alarak resmi KAP bildirimlerini, finansal verileri, haberleri ve makroekonomik göstergeleri tarar; analiz eder, çapraz sorgular ve yatırım analiz raporları ile sunum dosyaları (PDF + PPTX) üretir.

---

## 📌 Temel Özellikler

*   **Doğal Dil İşleme & Ticker Çıkarımı:** Doğal dildeki sorgulardan (örneğin: *"türk hava yolları büyüme analizi yap"*) akıllı algoritmasıyla BIST hisse kodlarını (`THYAO`) otomatik olarak çıkartır.
*   **Paralel Çoklu Ajan (Multi-Agent) Mimarisi:** QStash aracılığıyla arka planda tamamen serverless uyumlu çalışan veri ve analiz ajanları koordinasyonu.
    *   **Search Agent:** Kamuyu Aydınlatma Platformu (KAP) üzerinden son bildirimleri çeker.
    *   **News Agent:** Bloomberg HT, Mynet Finans ve Dünya gibi Türkçe haber mecralarından Currents & NewsData API'leri ile haber taraması ve duygu analizi (Sentiment Analysis) yapar.
    *   **Market Agent:** Yahoo Finance ve AlphaVantage aracılığıyla güncel hisse fiyatları, oranları, PE, EPS, 52 haftalık aralıklar ve teknik indikatör verilerini toplar.
    *   **Macro Agent:** TCMB EVDS (Merkez Bankası) API entegrasyonuyla enflasyon, faiz ve döviz gibi makroekonomik verileri analiz bağlamına ekler.
*   **Derin Yapay Zeka Sentezi (AI Analyst):** Toplanan tüm verileri Gemini-1.5-Pro veya Claude-3.5-Sonnet (fallback) ile sentezleyerek; özet, riskler, fırsatlar ve net yatırım kararı (AL/TUT/SAT) üretir.
*   **Gerçek Zamanlı Takip Terminali (Real-time Pipeline Logs):** Supabase Realtime abonelikleri sayesinde ajanların o an ne yaptığını, hangi veriyi analiz ettiğini ve çalışma sürelerini canlı olarak ekrandan izleme imkanı sunar.
*   **Yüksek Çözünürlüklü Rapor Çıktıları:** `@react-pdf/renderer` ile hazırlanan kurumsal standartlarda PDF raporlar ve `pptxgenjs` ile oluşturulan otomatik sunum dosyaları (PPTX).
*   **SaaS & Token Mimarisi:** Clerk ile kullanıcı yetkilendirme, Stripe ile abonelik/ödeme entegrasyonu ve Supabase RPC fonksiyonları ile yönetilen güvenli token harcama sistemi.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

*   **Çekirdek:** Next.js 14 (App Router) + TypeScript
*   **Stil/Tasarım:** Vanilla CSS / TailwindCSS + Framer Motion (Mikro etkileşimler ve premium karanlık tema animasyonları)
*   **Veritabanı & Gerçek Zamanlılık:** Supabase (PostgreSQL, Realtime Subscriptions, RPC Ledgers)
*   **Arka Plan İş Kuyruğu:** Upstash QStash (Serverless mimarilerde timeout limitlerini aşmak için asenkron kuyruk yönetimi)
*   **Hız Sınırlama (Rate Limiting):** Upstash Redis
*   **Ödeme Altyapısı:** Stripe Billing
*   **Log & Hata Yönetimi:** Sentry
*   **Raporlama Dosyaları:** `@react-pdf/renderer` (PDF) + `pptxgenjs` (PPTX)
*   **Yapay Zeka Servisleri:** Google Generative AI (Gemini 1.5 Pro) & Anthropic (Claude 3.5 Sonnet)

---

## 📐 Ajan Mimarisi ve İş Akışı

Aşağıdaki şemada, kullanıcının sorgu göndermesinden rapor indirme aşamasına kadar olan çoklu ajan (multi-agent) koordinasyonu gösterilmiştir:

```mermaid
graph TD
    User([Kullanıcı Sorgusu]) -->|POST /api/research| Orch[Orchestrator API]
    Orch -->|1. Token Kontrolü & Çıkarım| Ticker[Ticker Extractor]
    Orch -->|2. Önbellek Kontrolü| Cache{Son 6 Saatte Rapor Var mı?}
    
    Cache -->|Evet| DBCloning[Onbellekten Raporu Kopyala] --> User
    Cache -->|Hayır| QStash[QStash Queue]
    
    QStash -->|3. Asenkron Tetikleme| Worker[QStash Research Worker]
    
    subgraph Veri Toplama Ajanları (Paralel)
        Worker -->|Ajan 1| Search[Search Agent - KAP Web Scraper]
        Worker -->|Ajan 2| News[News Agent - Türkçe Haberler & Sentiment]
        Worker -->|Ajan 3| Market[Market Agent - Yahoo/AlphaVantage Finansal Veri]
        Worker -->|Ajan 4| Macro[Macro Agent - TCMB EVDS Makro Veri]
    end

    Search -->|Veri Kaydet| Supabase[(Supabase DB)]
    News -->|Veri Kaydet| Supabase
    Market -->|Veri Kaydet| Supabase
    Macro -->|Veri Kaydet| Supabase

    Supabase -.->|Gerçek Zamanlı Log Akışı| Dashboard[Kullanıcı Dashboard Terminali]

    Worker -->|4. Verileri Sentezle| Analyst[Analyst Agent - Gemini/Claude]
    Analyst -->|AL/TUT/SAT + Sentez Raporu| Writer[Writer Agent]
    
    subgraph Rapor Üretimi
        Writer -->|@react-pdf/renderer| PDF[report.pdf]
        Writer -->|pptxgenjs| PPTX[presentation.pptx]
    end

    PDF -->|5. Sonuçları Kaydet| OutputDir[public/outputs/{timestamp}-{slug}/]
    PPTX --> OutputDir
    OutputDir -->|Tamamlandı Durumu| Completed[Research Completed]
    Completed -->|İndirme Linki| User
```

---

## 📁 Klasör Yapısı

```
arastir/
├── GEMINI.md                    # Gemini CLI proje bağlamı ve kuralları
├── DESIGN.md                    # Ayrıntılı renk, tipografi ve bileşen tasarım kılavuzu
├── .gemini/
│   ├── settings.json            # Gemini CLI ayarları
│   └── agents/                  # CLI Subagent tanımları (.md dosyaları)
│       ├── search-agent.md
│       ├── validator-agent.md
│       ├── analyst-agent.md
│       └── writer-agent.md
├── supabase/
│   └── migrations/              # SQL veritabanı şemaları ve RPC fonksiyonları (22 migration)
├── src/
│   ├── app/                     # Next.js App Router (Sayfalar ve API Routes)
│   │   ├── (auth)/              # Giriş / Kayıt (Clerk)
│   │   ├── admin/               # Admin paneli ve denetim logları
│   │   ├── api/                 # Sunucu API uç noktaları (Stripe, Research, QStash)
│   │   ├── dashboard/           # Kullanıcı Dashboard sayfaları
│   │   └── globals.css          # Küresel CSS ve tema değişkenleri
│   ├── agents/                  # Sunucu tarafında çalışan TS Ajan mantıkları
│   │   ├── search-agent.ts      # KAP veri toplayıcısı
│   │   ├── news-agent.ts        # Haberler ve duygu analizi ajanı
│   │   ├── market-agent.ts      # BIST piyasa verileri ajanı
│   │   ├── macro-agent.ts       # TCMB EVDS makroekonomi ajanı
│   │   ├── analyst-agent.ts     # Gemini/Claude sentezleme ajanı
│   │   └── writer-agent.ts      # Dosya oluşturma koordinatörü
│   ├── components/              # Yeniden kullanılabilir React Bileşenleri
│   │   ├── dashboard/           # Dashboard ve terminal izleme bileşenleri
│   │   ├── landing/             # Karşılama (Landing) sayfası
│   │   └── ui/                  # Grafik, Marquee, Ticker ve ortak arayüz elemanları
│   ├── lib/                     # Yardımcı kütüphaneler (Supabase client, Stripe, ratelimit)
│   └── types/                   # TypeScript Tip tanımlamaları
├── outputs/                     # Yerel test çıktısı dizini
└── tests/                       # Vitest test dosyaları
```

---

## 🚀 Kurulum ve Başlangıç

### 1. Gereksinimler
Sistemin çalışması için yerel makinenizde Node.js (v18+) kurulu olmalıdır.

### 2. Projeyi Klonlayın ve Bağımlılıkları Yükleyin
```bash
git clone <repo-url>
cd arastir-starter
npm install
```

### 3. Veritabanı Şemasını Uygulayın (Supabase)
Supabase dashboard'unuza giderek SQL Editor üzerinden `supabase/migrations/` klasöründeki migration dosyalarını sırasıyla çalıştırabilir ya da yerel geliştirme için Supabase CLI kullanıyorsanız aşağıdaki komutu verebilirsiniz:
```bash
supabase db push
```

### 4. Çevre Değişkenlerini Tanımlayın
`.env.example` dosyasını kopyalayarak `.env.local` oluşturun ve ilgili API anahtarlarını girin:
```bash
cp .env.example .env.local
```

Gerekli ve İsteğe Bağlı (Kapasiteyi Düşüren) Değişkenler:

| Değişken | Açıklama | Durum |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Proje URL | **Gerekli** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonim Anahtarı | **Gerekli** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role (Token işlemleri ve arka plan servisleri için) | **Gerekli (Yoksa anonime düşer)** |
| `CLERK_SECRET_KEY` | Clerk Auth Gizli Anahtarı | **Gerekli** |
| `GOOGLE_AI_API_KEY` | Gemini API Anahtarı | İsteğe Bağlı |
| `ANTHROPIC_API_KEY` | Claude API Anahtarı (Gemini başarısız olursa fallback) | İsteğe Bağlı |
| `TCMB_EVDS_API_KEY` | TCMB EVDS API Anahtarı (Makro veri ajanları için) | İsteğe Bağlı |
| `CURRENTS_API_KEY` / `NEWSDATA_API_KEY` | Haber arama servis anahtarı | İsteğe Bağlı |
| `ALPHA_VANTAGE_API_KEY` / `RAPIDAPI_YH_FINANCE_KEY` | Hisse senedi finansal verileri için | İsteğe Bağlı |
| `QSTASH_TOKEN` / `QSTASH_URL` | Arka plan asenkron ajan tetikleyicisi | **Üretimde Gerekli** (Yerel geliştirme sırasında otomatik olarak localhost fetch'e yönlenir.) |
| `STRIPE_SECRET_KEY` | Stripe Ödeme Altyapısı | İsteğe Bağlı (Abonelikler için) |

### 5. Yerel Sunucuyu Başlatın
```bash
npm run dev
```
Sunucu [http://localhost:3000](http://localhost:3000) adresinde çalışmaya başlayacaktır.

---

## 🤖 Gemini CLI Kullanımı

Geliştirme esnasında terminal üzerinden ajanları doğrudan çalıştırmak veya proje bağlamında hızlı sorgular göndermek için `@google/gemini-cli` entegrasyonu mevcuttur:

```bash
# Gemini CLI'yi global olarak yükleyin
npm install -g @google/gemini-cli

# Google hesabınızla kimlik doğrulaması yapın
gemini auth login

# Proje ana dizinindeyken CLI'yi başlatın
gemini

# CLI içindeki kullanılabilir ajanları listeleyin
/agents

# Doğrudan entegre sorgu gönderin
> gemini "THYAO için yatırım tezi hazırla"

# Spesifik alt ajanları doğrudan çağırın
> gemini "@search-agent KAP'tan EREGL son 3 bildirimi getir"
> gemini "@analyst-agent bu verileri sentezle"
> gemini "@writer-agent raporu PDF olarak üret"
```

---

## 📈 Proje Yol Haritası (Roadmap)

- [x] Gemini CLI Kurulumu ve `.gemini/agents/` tanımları
- [x] Çoklu veri toplayıcı ajanlar (KAP, Haber, Piyasa, TCMB EVDS Makro Veri)
- [x] Yapay zeka sentez katmanı (Gemini 1.5 Pro + Claude 3.5 Sonnet fallback)
- [x] Gerçek zamanlı Supabase veritabanı entegrasyonu ve log akışı
- [x] `@react-pdf/renderer` ile kurumsal rapor tasarımı ve `pptxgenjs` sunum motoru
- [x] Token Ledger & RPC tabanlı akıllı kredi düşüm mekanizması
- [x] Stripe Ödeme ve SaaS Abonelik akışları ancak apiler entegre edilmedi.
- [x] Premium karanlık tema fintech terminali UI (Bento Grid, Sparkline, Canlı Ticker, Marquee)
- [ ] Çoklu dil (İngilizce rapor desteği)
- [ ] Gelişmiş veri görselleştirme grafikleri (Recharts entegrasyonlu detaylı analiz sayfası)

---

## ⚖️ Lisans

Bu proje kişisel / kurumsal kullanım için hazırlanmış bir starter şablonudur. Tüm hakları saklıdır.
