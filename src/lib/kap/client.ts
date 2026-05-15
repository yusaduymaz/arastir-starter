import { KNOWN_TICKERS } from '../ticker-extractor';
import { KAPDisclosure } from '../../types/kap';

/**
 * KAP HTTP API Client — Puppeteer yerine doğrudan HTTP endpoint'leri kullanır.
 *
 * KAP'ın dahili JSON API'leri (kendi frontend'leri tarafından çağrılır):
 * - POST https://www.kap.org.tr/tr/api/memberDisclosureQuery — bildirim arama
 * - GET  https://www.kap.org.tr/tr/api/disclosures?... — son bildirimler
 * - GET  https://www.kap.org.tr/tr/api/member/{stockCode} — şirket bilgisi
 *
 * Bu endpoint'ler herkese açıktır, auth gerektirmez.
 */

const KAP_API_BASE = 'https://www.kap.org.tr/tr/api';

interface KAPApiDisclosure {
  basic?: {
    disclosureIndex?: number;
    title?: string;
    companyName?: string;
    stockCodes?: string;
    publishDate?: string;
    disclosureType?: string;
    summary?: string;
    relatedStocks?: string;
  };
  disclosureIndex?: number;
  title?: string;
  companyName?: string;
  stockCodes?: string;
  publishDate?: string;
  disclosureType?: string;
  summary?: string;
}

/**
 * KAP bildirimlerini HTTP API ile çeker.
 * Eğer ticker geçerli bir BIST kodu ise, o şirkete ait bildirimleri filtreler.
 * Eğer geçerli bir ticker değilse (konu sorgusu), boş dizi döner.
 */
export async function fetchDisclosures(ticker: string, limit: number = 5): Promise<KAPDisclosure[]> {
  // Geçerli ticker kontrolü
  if (!KNOWN_TICKERS.has(ticker)) {
    console.warn(`[KAP Client] "${ticker}" geçerli bir BIST ticker formatı değil — boş dizi dönüyor.`);
    return [];
  }

  console.log(`[KAP Client] HTTP API ile ${ticker} bildirimleri çekiliyor...`);

  try {
    // Yöntem 1: Şirket bildirimleri arama (memberDisclosureQuery)
    const disclosures = await fetchViaDisclosureQuery(ticker, limit);
    if (disclosures.length > 0) {
      console.log(`[KAP Client] memberDisclosureQuery ile ${disclosures.length} bildirim bulundu.`);
      return disclosures;
    }

    // Yöntem 2: Son bildirimleri çek ve ticker ile filtrele
    console.log(`[KAP Client] memberDisclosureQuery boş döndü, genel bildirimlerden filtreleniyor...`);
    const fallbackDisclosures = await fetchViaRecentDisclosures(ticker, limit);
    if (fallbackDisclosures.length > 0) {
      console.log(`[KAP Client] Genel bildirimlerden ${fallbackDisclosures.length} adet ${ticker} bildirimi filtrelendi.`);
      return fallbackDisclosures;
    }

    console.warn(`[KAP Client] ${ticker} için hiç bildirim bulunamadı.`);
    return [];
  } catch (error) {
    console.error(`[KAP Client] ${ticker} bildirimleri çekilemedi:`, error);
    throw error;
  }
}

/**
 * Yöntem 1: KAP memberDisclosureQuery API'si ile bildirim arama
 */
async function fetchViaDisclosureQuery(ticker: string, limit: number): Promise<KAPDisclosure[]> {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const body = {
    fromDate: formatDate(oneYearAgo),
    toDate: formatDate(today),
    memberCodes: [ticker],
    // KAP API boş gönderildiğinde tüm türleri getirir
    disclosureTypes: [],
    subjectList: [],
  };

  try {
    const response = await fetch(`${KAP_API_BASE}/memberDisclosureQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.kap.org.tr/tr/',
        'Origin': 'https://www.kap.org.tr',
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`[KAP Client] memberDisclosureQuery HTTP ${response.status}`);
      return [];
    }

    const data: KAPApiDisclosure[] = await response.json();

    if (!Array.isArray(data)) {
      console.warn(`[KAP Client] memberDisclosureQuery beklenmeyen yanıt formatı`);
      return [];
    }

    return data.slice(0, limit).map(item => mapToDisclosure(item, ticker));
  } catch (error) {
    console.warn(`[KAP Client] memberDisclosureQuery başarısız:`, error);
    return [];
  }
}

/**
 * Yöntem 2: Son bildirimleri çekip ticker ile filtrele
 */
async function fetchViaRecentDisclosures(ticker: string, limit: number): Promise<KAPDisclosure[]> {
  try {
    const response = await fetch(`${KAP_API_BASE}/disclosures`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.kap.org.tr/tr/',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[KAP Client] disclosures endpoint HTTP ${response.status}`);
      return [];
    }

    const data: KAPApiDisclosure[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    // Ticker ile filtrele (stockCodes veya companyName içinde)
    const filtered = data.filter(item => {
      const basic = item.basic || item;
      const stockCodes = (basic.stockCodes || '').toUpperCase();
      const relatedStocks = ((basic as any).relatedStocks || '').toUpperCase();
      return stockCodes.includes(ticker) || relatedStocks.includes(ticker);
    });

    return filtered.slice(0, limit).map(item => mapToDisclosure(item, ticker));
  } catch (error) {
    console.warn(`[KAP Client] recent disclosures başarısız:`, error);
    return [];
  }
}

/**
 * KAP API yanıtını internal KAPDisclosure tipine dönüştürür.
 */
function mapToDisclosure(item: KAPApiDisclosure, ticker: string): KAPDisclosure {
  const basic = item.basic || item;
  return {
    title: basic.title || basic.summary || 'Bildirim',
    date: basic.publishDate || new Date().toISOString(),
    company: basic.companyName || ticker,
    url: basic.disclosureIndex
      ? `https://www.kap.org.tr/tr/Bildirim/${basic.disclosureIndex}`
      : `https://www.kap.org.tr/tr/bist-sirketler/${ticker}`,
    content: basic.summary || basic.title || 'İçerik mevcut değil',
  };
}
