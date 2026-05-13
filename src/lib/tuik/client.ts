import { z } from 'zod';

// TUIK often returns complex or undocumented JSON structures.
// This is a basic client that fetches the main categories as a proof of concept.
export async function getTuikData(): Promise<any> {
  // TUIK's new portal uses a protected API. We attempt to fetch it with full headers,
  // but provide a robust fallback of the main themes to ensure the agent stays functional.
  const url = 'https://veriportali.tuik.gov.tr/api/v1/statistical-themes?languageId=1';
  
  const fallbackThemes = [
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
    { id: 16, name: 'Ulusal Hesaplar' }
  ];

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
      console.warn(`TUIK API returned ${response.status}. Using fallback themes.`);
      return fallbackThemes;
    }

    const responseText = await response.text();
    if (responseText.includes('<!doctype html>')) {
      console.warn('TUIK API returned HTML. Using fallback themes.');
      return fallbackThemes;
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.warn('Failed to parse TUIK JSON. Using fallback themes.');
      return fallbackThemes;
    }
  } catch (error) {
    console.warn('Network error fetching TUIK data. Using fallback themes:', (error as Error).message);
    return fallbackThemes;
  }
}
