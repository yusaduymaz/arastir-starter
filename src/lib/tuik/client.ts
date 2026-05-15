import { z } from 'zod';

/**
 * Static TÜİK theme list — manually mirrored from veriportali.tuik.gov.tr.
 * @lastSynced 2025-05 (Plan 09-03)
 *
 * Why this exists: TÜİK's portal API at /api/v1/statistical-themes is protected and
 * returns HTML to non-browser clients. Until a working endpoint is found, we serve
 * this static list and log explicitly so live-vs-static state is never ambiguous.
 */
export const FALLBACK_TUIK_THEMES_2025 = [
  { id: 1, name: 'Adalet ve Güvenlik' },
  { id: 2, name: 'Çevre ve Enerji' },
  { id: 3, name: 'Dış Ticaret' },
  { id: 4, name: 'Eğitim, Kültür, Spor ve Turizm' },
  { id: 5, name: 'Enflasyon ve Fiyat' },
  { id: 6, name: 'Gelir, Yaşam, Tüketim ve Yoksulluk' },
  { id: 7, name: 'İşgücü ve Mevsimsel Düzeltilmiş Veriler' },
  { id: 8, name: 'İnşaat ve Konut' },
  { id: 9, name: 'Nüfus ve Demografi' },
  { id: 10, name: 'Sanayi, Bina, İş Kayıtları ve Ticaret' },
  { id: 11, name: 'Sağlık ve Sosyal Koruma' },
  { id: 12, name: 'Tarım, Ormancılık ve Balıkçılık' },
  { id: 13, name: 'Teknoloji, Bilişim ve İnovasyon' },
  { id: 14, name: 'Toplum ve Cinsiyet' },
  { id: 15, name: 'Ulaştırma ve Haberleşme' },
  { id: 16, name: 'Ulusal Hesaplar' },
] as const;

export async function getTuikData(): Promise<any> {
  // TUIK's new portal uses a protected API. We attempt to fetch it with full headers,
  // but fall back to FALLBACK_TUIK_THEMES_2025 when the endpoint returns HTML or blocks us.
  const url = 'https://veriportali.tuik.gov.tr/api/v1/statistical-themes?languageId=1';
  const fallbackThemes = FALLBACK_TUIK_THEMES_2025;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://veriportali.tuik.gov.tr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      // Short timeout to fallback quickly if blocked/redirected
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn(`TUIK API returned ${response.status}. Using static TUIK fallback (synced 2025).`);
      return fallbackThemes;
    }

    const responseText = await response.text();
    if (responseText.includes('<!doctype html>')) {
      console.warn('TUIK API returned HTML. Using static TUIK fallback (synced 2025).');
      return fallbackThemes;
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.warn('Failed to parse TUIK JSON. Using static TUIK fallback (synced 2025).');
      return fallbackThemes;
    }
  } catch (error) {
    console.warn('Network error fetching TUIK data. Using static TUIK fallback (synced 2025):', (error as Error).message);
    return fallbackThemes;
  }
}
