// src/lib/tcmb/client.ts
// TCMB EVDS API İstemcisi — Doğrudan fetch ile
// Yeni endpoint: evds3.tcmb.gov.tr/igmevdsms-dis/ (evds2 artık SPA döndürüyor)
// API anahtarı HTTP header'ında "key" olarak gönderilmeli (Nisan 2024 zorunluluğu)
import { z } from 'zod';

const EVDS_BASE_URL = 'https://evds3.tcmb.gov.tr/igmevdsms-dis';

// Zod ile API'den gelen veri için bir şema tanımlıyoruz.
// Bu, veri tipini çalışma zamanında doğrulamamızı sağlar.
const EvdsDataPointSchema = z.object({
  Tarih: z.string(),
  TP_DK_USD_A: z.string().nullable().optional(), // Dolar Kuru (Alış)
  TP_FG_J0: z.string().nullable().optional(), // Tüketici Fiyat Endeksi (TÜFE)
  TP_MK_B_A2: z.string().nullable().optional(), // TCMB Politika Faizi
  UNIXTIME: z.object({ '$numberLong': z.string() }).optional(), // Unix zaman damgası
  // İhtiyaç duyulacak diğer seriler buraya eklenebilir.
}).passthrough(); // Tanımlanmamış ek alanları kabul et

// EVDS API yanıt yapısı
const EvdsResponseSchema = z.object({
  totalCount: z.number(),
  items: z.array(EvdsDataPointSchema),
});

// Hata yanıtı
const EvdsErrorSchema = z.object({
  status: z.string(),
  message: z.string(),
});

// Zod şemasından TypeScript tipini oluşturuyoruz.
export type EvdsDataPoint = z.infer<typeof EvdsDataPointSchema>;

/**
 * API anahtarını ortam değişkenlerinden alır.
 * @throws {Error} TCMB_EVDS_API_KEY tanımlı değilse hata fırlatır.
 */
const getApiKey = (): string => {
  const apiKey = process.env.TCMB_EVDS_API_KEY;
  if (!apiKey) {
    throw new Error(
      'TCMB_EVDS_API_KEY is not defined in your .env.local file. Please add it to proceed.'
    );
  }
  return apiKey;
};

/**
 * EVDS API'ye istek atar.
 * - Yeni endpoint: evds3.tcmb.gov.tr/igmevdsms-dis/
 * - API anahtarı "key" header'ında gönderilir
 * - Çoklu serilerde formulas ve aggregationTypes her seri için tire ile ayrılmalı
 *
 * @param {string} seriesCodes Tire ile ayrılmış seri kodları (örn: "TP.DK.USD.A-TP.FG.J0")
 * @param {string} startDate Başlangıç tarihi (DD-MM-YYYY formatında).
 * @param {string} endDate Bitiş tarihi (DD-MM-YYYY formatında).
 * @param {object} [options] Ek parametreler
 * @param {string} [options.frequency='1'] Frekans: 1=Günlük, 5=Aylık, 8=Yıllık
 * @param {string} [options.formulas] Her seri için formül (tire ile ayrılmış, örn: "0-0")
 * @param {string} [options.aggregationTypes] Her seri için toplama tipi (tire ile ayrılmış, örn: "avg-avg")
 * @returns {Promise<unknown>} Ham API yanıtı
 */
const fetchFromEvds = async (
  seriesCodes: string,
  startDate: string,
  endDate: string,
  options: {
    frequency?: string;
    formulas?: string;
    aggregationTypes?: string;
  } = {}
): Promise<unknown> => {
  const apiKey = getApiKey();
  const { frequency = '1', formulas, aggregationTypes } = options;

  let url = `${EVDS_BASE_URL}/series=${seriesCodes}&startDate=${startDate}&endDate=${endDate}&type=json&frequency=${frequency}`;

  if (formulas) {
    url += `&formulas=${formulas}`;
  }
  if (aggregationTypes) {
    url += `&aggregationTypes=${aggregationTypes}`;
  }

  const response = await fetch(url, {
    headers: {
      'key': apiKey,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `TCMB EVDS API request failed with status ${response.status}: ${errorBody.substring(0, 300)}`
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('json')) {
    const body = await response.text();
    throw new Error(
      `TCMB EVDS API returned non-JSON response (Content-Type: ${contentType}). ` +
      `Body preview: ${body.substring(0, 200)}`
    );
  }

  const data = await response.json();

  // Hata yanıtı kontrolü
  const errorResult = EvdsErrorSchema.safeParse(data);
  if (errorResult.success && errorResult.data.status !== '200') {
    throw new Error(
      `TCMB EVDS API error: ${errorResult.data.status} - ${errorResult.data.message}`
    );
  }

  return data;
};

/**
 * Belirtilen tarih aralığındaki temel makroekonomik verileri getirir.
 * Veriler: Dolar Kuru, TÜFE, Politika Faizi
 *
 * @param {string} startDate Başlangıç tarihi (DD-MM-YYYY formatında, örn: "01-01-2025").
 * @param {string} endDate Bitiş tarihi (DD-MM-YYYY formatında, örn: "31-03-2025").
 * @param {'daily' | 'monthly' | 'yearly'} [period='monthly'] Veri periyodu
 * @returns {Promise<EvdsDataPoint[]>} İstenen aralıktaki verilerin bir dizisini döndürür.
 */
export const getMacroEconomicData = async (
  startDate: string,
  endDate: string,
  period: 'daily' | 'monthly' | 'yearly' = 'monthly'
): Promise<EvdsDataPoint[]> => {
  const frequencyMap = { daily: '1', monthly: '5', yearly: '8' };
  const frequency = frequencyMap[period];

  // 3 seri: USD Kuru, TÜFE, Politika Faizi
  const series = 'TP.DK.USD.A-TP.FG.J0-TP.MK.B.A2';
  // Her seri için formül (0=düzey verisi) ve agregasyon (avg=ortalama)
  const formulas = '0-0-0';
  const aggregationTypes = 'avg-avg-avg';

  try {
    const data = await fetchFromEvds(series, startDate, endDate, {
      frequency,
      formulas,
      aggregationTypes,
    });

    // Gelen veriyi Zod şeması ile doğrulayıp güvenli bir şekilde kullanıyoruz.
    const responseResult = EvdsResponseSchema.safeParse(data);

    if (responseResult.success) {
      return responseResult.data.items;
    }

    // Beklenmedik format
    console.error('TCMB EVDS API response validation failed.');
    console.error('Response structure:', JSON.stringify(data).substring(0, 500));
    throw new Error('Invalid data structure received from TCMB EVDS API.');
  } catch (error) {
    console.error('Error fetching data from TCMB EVDS API:', error);
    throw error;
  }
};

/**
 * Tek bir EVDS serisini çeker.
 *
 * @param {string} seriesCode Seri kodu (örn: "TP.DK.USD.A")
 * @param {string} startDate DD-MM-YYYY
 * @param {string} endDate DD-MM-YYYY
 * @param {string} [frequency='1'] Frekans: 1=Günlük, 5=Aylık, 8=Yıllık
 * @returns {Promise<Record<string, unknown>[]>} Veri noktaları dizisi
 */
export const fetchSeries = async (
  seriesCode: string,
  startDate: string,
  endDate: string,
  frequency: string = '1'
): Promise<Record<string, unknown>[]> => {
  const data = await fetchFromEvds(seriesCode, startDate, endDate, { frequency });

  const responseResult = EvdsResponseSchema.safeParse(data);
  if (responseResult.success) {
    return responseResult.data.items;
  }

  throw new Error('Unexpected EVDS response format: ' + JSON.stringify(data).substring(0, 200));
};

// Test fonksiyonu
export const testTcmbConnection = async () => {
  console.log('Testing connection to TCMB EVDS API (evds3 endpoint)...');
  try {
    // Aylık makro veri testi
    const data = await getMacroEconomicData('01-01-2025', '31-03-2025', 'monthly');
    console.log(`Successfully fetched ${data.length} monthly data points for Q1 2025.`);
    data.forEach(item => {
      console.log(`  ${item.Tarih} | USD: ${item.TP_DK_USD_A || '-'} | TÜFE: ${item.TP_FG_J0 || '-'} | Faiz: ${item.TP_MK_B_A2 || '-'}`);
    });
    return data;
  } catch (error) {
    console.error('TCMB connection test failed.');
    return null;
  }
};
