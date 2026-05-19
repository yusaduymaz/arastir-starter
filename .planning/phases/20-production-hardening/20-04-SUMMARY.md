# Plan 20-04: Sentry Error Tracking ve Loglama

## Tasks Completed
1. `@sentry/nextjs` paketi manuel olarak `--legacy-peer-deps` parametresiyle kuruldu.
2. Sentry Next.js Sihirbazı (`npx @sentry/wizard@latest -i nextjs`) çalıştırılarak projenin Sentry konfigürasyon dosyaları (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) ve `next.config.js` entegrasyonu tamamlandı.
3. `/api/qstash/research` arka plan kuyruk yöneticisindeki (`route.ts`) hata yakalama (`catch`) bloklarına `Sentry.captureException(error)` eklenerek sessiz çökmelerin önüne geçildi.
4. `/api/research` orchestrator giriş API rotasına da `Sentry.captureException` entegre edilerek, token düşüm veya rate limit aşımı sırasındaki kritik altyapı hataları Sentry'ye raporlanacak hale getirildi.
