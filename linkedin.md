🚀 **Yapay Zeka Ajanları (AI Agents) Finans Dünyasında: Gerçek Zamanlı Çoklu Ajan Ağı ile BIST Analizi!** 📈

Yapay zeka modellerini basit bir chat kutusunun ötesine taşıyıp, arka planda otonom çalışan ve profesyonel finansal raporlar üreten bir **Multi-Agent (Çoklu Ajan)** sistemine dönüştürdük: **Araştır** 🔍

Bir hisse senedi veya sektör analizi istediğinizde; sistem arka planda veri toplama, doğrulama, sentezleme ve rapor oluşturma süreçlerini tamamen kendi koordine ediyor.

---

### 🛠️ Çözdüğümüz Teknik Zorluklar

Serverless mimarilerde (Next.js / Vercel) arka planda çalışan karmaşık yapay zeka ajanları inşa ederken en büyük engeller **timeout limitleri** ve **süreç kilitlenmeleri (stuck process)** oluyor. Bu projede bu sorunları aşmak için özel bir mimari tasarladık:

1. **In-Process Serverless-Compatible Ajanlar:** Ajanlar arası veri aktarımını dosya sistemi (fs) veya yavaş alt süreçler (child_process) yerine, bellek içi tip-güvenli asenkron fonksiyonlarla çözdük.
2. **Upstash QStash ile Asenkron İş Kuyruğu:** Vercel'in 10-15 saniyelik sunucu limitlerini aşmak için, işleri Upstash QStash üzerinden arka plan kuyruklarına delege ettik.
3. **Supabase Realtime ile Canlı Takip Terminali:** Kullanıcının ajanların o an ne yaptığını (KAP taranıyor, Sentiment ölçülüyor, Merkez Bankası verisi çekiliyor vb.) saniyelik izlemesini sağlayan gerçek zamanlı bir akış kurduk.
4. **RPC ile Atomik Token/Kredi Sistemi:** Supabase tarafında yazdığımız veritabanı fonksiyonları (RPC) sayesinde, kullanıcı kredilerini ve abonelik paketlerini eşzamanlı olarak güvenle doğrulayıp düştük.

---

### 🤖 Çoklu Ajan (Multi-Agent) İş Akışı Nasıl Çalışıyor?

1. **Orchestrator:** Kullanıcının doğal dil sorgusundan BIST hisse kodunu (`THYAO`, `EREGL` vb.) akıllıca ayıklar ve önbellek/token kontrollerini yapar.
2. **Search Agent (Veri Toplama):** KAP (Kamuyu Aydınlatma Platformu) verilerini tarar.
3. **News Agent (Duygu Analizi):** Güncel Türkçe haberleri Currents/NewsData API'leri ile çeker ve sentiment analizinden geçirir.
4. **Market Agent (Finansal Veri):** Yahoo Finance ve AlphaVantage üzerinden hissenin anlık fiyat, PE, EPS değerlerini toplar.
5. **Macro Agent (Makroekonomi):** Merkez Bankası (TCMB EVDS) API entegrasyonu ile ülke faiz, döviz ve enflasyon verilerini rapora ekler.
6. **Analyst Agent (Yapay Zeka Sentezi):** Tüm bu verileri Gemini 1.5 Pro (Fallback: Claude 3.5 Sonnet) ile çapraz sorgulayarak özet, risk, fırsat ve AL/TUT/SAT yatırım tezi üretir.
7. **Writer Agent (Rapor Üretici):** `@react-pdf/renderer` ile kurumsal tasarımda bir PDF raporu ve `pptxgenjs` ile sunum yapmaya hazır bir PPTX slaytı oluşturur.

---

### 🎨 Tasarım ve Kullanıcı Deneyimi (UX)

Tasarımda finans terminallerini aratmayan, göz yormayan **Dark Mode First** felsefesini benimsedik:
* **Montserrat & Inter** font ikilisiyle modern fintech tipografisi.
* Canlı BIST veri şeritleri, bento grid yerleşimleri ve minyatür **Sparkline** grafikleri.
* Ajanların durumunu (running, completed, failed) gösteren dinamik ve animasyonlu terminal bileşenleri.

---

### 💻 Teknolojik Altyapı (Tech Stack)
* **Frontend/Backend:** Next.js 14 (App Router) & TypeScript
* **Database & Auth:** Supabase & Clerk
* **Kuyruk & Redis:** Upstash QStash & Upstash Redis
* **Raporlama:** React PDF & PptxGenJS
* **Ödeme/SaaS:** Stripe Billing
* **AI Providers:** Google Gemini 1.5 Pro & Anthropic Claude 3.5 Sonnet

Yapay zeka ajanlarının finans ve analiz sektöründeki bu otonom dönüşümü hakkında siz ne düşünüyorsunuz? Proje detaylarını ve kurulum adımlarını GitHub profilimden inceleyebilirsiniz!

👉 *Projeyi yıldızlamak veya detaylı incelemek için GitHub linki yorumlarda!*

#AIAgents #Fintech #Nextjs #Supabase #GenAI #TypeScript #Serverless #GenerativeAI #BIST30 #Startup
