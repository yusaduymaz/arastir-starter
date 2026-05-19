# Plan 20-01: Arka Plan İş Kuyruğu (Upstash QStash) Entegrasyonu

## Tasks Completed
1. `@upstash/qstash` npm paketi projeye dahil edildi.
2. `executeResearchPipeline` fonksiyonu `src/app/api/research/route.ts` dosyasından ayrılarak yeni bir QStash webhook rotasına (`src/app/api/qstash/research/route.ts`) taşındı.
3. `/api/research` endpoint'i, Vercel'in 60s/300s fonksiyon kısıtlamalarına takılmadan, doğrudan işlem sürecini QStash'e yönlendirecek şekilde (publishJSON) güncellendi.
4. Hem QStash üzerinden asenkron veri toplama hem de hata yönetimi (catch blokları) QStash route handler'ına gömüldü.
