# Plan 20-03: Upstash Redis Rate Limiting

## Tasks Completed
1. `@upstash/ratelimit` ve `@upstash/redis` npm paketleri projeye eklendi.
2. `src/lib/ratelimit.ts` dosyası oluşturuldu ve dakikada maksimum 5 istek (Sliding Window algoritmali) limiti tanımlandı.
3. `src/app/api/research/route.ts` API rotasına, kullanıcı giriş doğrulamasından hemen sonra devreye girecek şekilde Rate Limit kontrolü eklendi. Limit aşıldığında istek Supabase'e ulaşmadan `429 Too Many Requests` HTTP koduyla geri döndürülüyor.
