// Final entegrasyon testi — düzeltilmiş istemci modülleri import edilerek
import { config } from 'dotenv';
config({ path: '.env.local' });

// TypeScript path alias (@/) yerine doğrudan relative import kullanalım
const { getMacroEconomicData, testTcmbConnection } = await import('../src/lib/tcmb/client.ts');
const { searchNews, testCurrentsConnection } = await import('../src/lib/news/api_client.ts');

console.log('╔══════════════════════════════════════╗');
console.log('║  ARAŞTIR — API ENTEGRASYON TESTLERİ  ║');
console.log('╚══════════════════════════════════════╝\n');

// === TEST 1: TCMB EVDS API ===
console.log('┌─ TEST 1: TCMB EVDS API (evds3 endpoint) ─────────────┐');
try {
  const data = await getMacroEconomicData('01-01-2025', '31-03-2025', 'monthly');
  console.log(`│ ✅ Başarılı! ${data.length} aylık veri noktası alındı.`);
  data.forEach(item => {
    const usd = item.TP_DK_USD_A ? parseFloat(item.TP_DK_USD_A).toFixed(2) : '-';
    const tufe = item.TP_FG_J0 ? parseFloat(item.TP_FG_J0).toFixed(2) : '-';
    const faiz = item.TP_MK_B_A2 ? parseFloat(item.TP_MK_B_A2).toFixed(2) : '-';
    console.log(`│   ${item.Tarih} → USD: ₺${usd} | TÜFE: ${tufe} | Faiz: %${faiz}`);
  });
} catch (err) {
  console.log(`│ ❌ Hata: ${err.message}`);
}
console.log('└──────────────────────────────────────────────────────┘\n');

// === TEST 2: Currents API ===
console.log('┌─ TEST 2: CURRENTS API ──────────────────────────────┐');
try {
  const news = await searchNews('enflasyon');
  console.log(`│ ✅ Başarılı! ${news.length} haber makalesi alındı.`);
  news.slice(0, 3).forEach((n, i) => {
    console.log(`│   ${i+1}. "${n.title.substring(0, 60)}..."`);
    console.log(`│      📰 ${n.author} | 📅 ${n.published}`);
  });
} catch (err) {
  console.log(`│ ❌ Hata: ${err.message}`);
}
console.log('└──────────────────────────────────────────────────────┘\n');

console.log('✅ Tüm testler tamamlandı!');
