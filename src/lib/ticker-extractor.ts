/**
 * Ticker Extractor — Doğal dil sorgusundan BIST hisse kodunu çıkarır.
 * 
 * Desteklenen giriş formatları:
 * - "SASA"                         → SASA
 * - "SASA BUYUME ANALIZI YAP"     → SASA
 * - "thyao için yatırım tezi"     → THYAO
 * - "ereğli demir çelik analizi"  → EREGL
 * - "türk hava yolları raporu"    → THYAO
 */

// Bilinen BIST hisse kodları (en yaygınlar)
export const KNOWN_TICKERS = new Set([
  // BIST-30
  'AKBNK', 'ARCLK', 'ASELS', 'BIMAS', 'EKGYO', 'ENKAI', 'EREGL', 'FROTO',
  'GARAN', 'GUBRF', 'HEKTS', 'ISCTR', 'KCHOL', 'KOZAA', 'KOZAL', 'KRDMD',
  'MGROS', 'ODAS', 'OYAKC', 'PETKM', 'PGSUS', 'SAHOL', 'SASA', 'SISE',
  'TAVHL', 'TCELL', 'THYAO', 'TKFEN', 'TOASO', 'TUPRS', 'VESTL', 'YKBNK',
  // BIST-50 ek
  'AEFES', 'AKFGY', 'AKSA', 'ALARK', 'ALFAS', 'AYGAZ', 'BERA', 'BRISA',
  'CCOLA', 'CIMSA', 'DOHOL', 'EGEEN', 'ENJSA', 'GESAN', 'HALKB', 'ISGYO',
  'KONTR', 'MAVI', 'OTKAR', 'SMRTG', 'SOKM', 'TSKB', 'TTKOM', 'TURSG',
  'ULKER', 'VAKBN',
  // BIST-100 ek
  'ACSEL', 'ADEL', 'AGHOL', 'AHGAZ', 'AKFYE', 'AKSGY', 'ALBRK', 'ALGYO',
  'ALTNY', 'ANSGR', 'ARDYZ', 'ARENA', 'ASUZU', 'ATAGY', 'AYDEM', 'BINHO',
  'BIOEN', 'BOBET', 'BRSAN', 'BRYAT', 'BTCIM', 'BUCIM', 'CANTE', 'CWENE',
  'DOAS', 'ECILC', 'ENERY', 'EUPWR', 'EUREN', 'FLAP', 'FZLGY', 'GENIL',
  'GLYHO', 'GOLTS', 'GOODY', 'GSDHO', 'GWIND', 'HALKB', 'HTTBT', 'HUNER',
  'IPEKE', 'ISDMR', 'IZENR', 'KAYSE', 'KLSER', 'KMPUR', 'KONYA', 'LOGO',
  'MAGEN', 'MIATK', 'MPARK', 'NATEN', 'NETAS', 'NTGAZ', 'NUGYO', 'OBAMS',
  'OYYAT', 'PAPIL', 'PENTA', 'QUAGR', 'REEDR', 'RGYAS', 'RODRG', 'SARKY',
  'SDTTR', 'SELEC', 'SKBNK', 'SMART', 'TBORG', 'TMSN', 'TRGYO', 'TRILC',
  'TTRAK', 'TUKAS', 'TUREX', 'ULUSE', 'ULUUN', 'USAK', 'VERUS', 'YATAS',
  'YEOTK', 'ZOREN',
]);

// Şirket ismi → ticker eşleştirme
const COMPANY_NAME_MAP: Record<string, string> = {
  // Havacılık
  'türk hava yolları': 'THYAO', 'thy': 'THYAO', 'türk hava': 'THYAO',
  'pegasus': 'PGSUS',
  // Bankalar
  'garanti': 'GARAN', 'garanti bankası': 'GARAN', 'garanti bbva': 'GARAN',
  'iş bankası': 'ISCTR', 'isbank': 'ISCTR', 'iş bank': 'ISCTR',
  'akbank': 'AKBNK',
  'yapı kredi': 'YKBNK', 'yapıkredi': 'YKBNK',
  'halkbank': 'HALKB', 'halk bankası': 'HALKB',
  'vakıfbank': 'VAKBN', 'vakıf bank': 'VAKBN',
  // Sanayi
  'ereğli': 'EREGL', 'ereğli demir çelik': 'EREGL', 'erdemir': 'EREGL',
  'arçelik': 'ARCLK',
  'ford otosan': 'FROTO', 'ford': 'FROTO',
  'tofaş': 'TOASO', 'tofas': 'TOASO',
  'aselsan': 'ASELS',
  'koç holding': 'KCHOL', 'koç': 'KCHOL',
  'sabancı': 'SAHOL', 'sabancı holding': 'SAHOL',
  'şişecam': 'SISE', 'şişe cam': 'SISE',
  'vestel': 'VESTL',
  'tüpraş': 'TUPRS', 'tupras': 'TUPRS',
  'petkim': 'PETKM',
  'enka': 'ENKAI', 'enka inşaat': 'ENKAI',
  'turkcell': 'TCELL',
  'bim': 'BIMAS', 'bim mağazaları': 'BIMAS',
  'migros': 'MGROS',
  'tekfen': 'TKFEN',
  'türk telekom': 'TTKOM', 'türk telekomünikasyon': 'TTKOM',
  'ülker': 'ULKER',
  'coca cola': 'CCOLA',
  'mavi': 'MAVI',
  'logo': 'LOGO', 'logo yazılım': 'LOGO',
  'brisa': 'BRISA',
  'kardemir': 'KRDMD',
  'doğuş otomotiv': 'DOAS',
  'tav havalimanları': 'TAVHL', 'tav': 'TAVHL',
  'gübre fabrikaları': 'GUBRF', 'gübre': 'GUBRF',
  'sasa polyester': 'SASA', 'sasa': 'SASA',
  'otkar': 'OTKAR', 'otokar': 'OTKAR',
  'sokak market': 'SOKM', 'şok market': 'SOKM', 'şok': 'SOKM',
};

// Analiz anahtar kelimeleri — bunları ticker'dan ayırmak için
const NOISE_WORDS = new Set([
  // Türkçe
  'için', 'icin', 'hakkında', 'hakkinda', 'ile', 'veya', 've', 'bir', 'bu',
  'analiz', 'analizi', 'yap', 'hazırla', 'hazirla', 'rapor', 'raporu',
  'yatırım', 'yatirim', 'tezi', 'tez', 'araştır', 'arastir', 'araştırma', 'arastirma',
  'karşılaştır', 'karsilastir', 'karşılaştırma', 'karsilastirma', 'karşılaştırmalı',
  'büyüme', 'buyume', 'büyümesi', 'değerlendirme', 'degerlendirme',
  'sektör', 'sektor', 'sektörel', 'sektorel', 'sektörü', 'sektoru',
  'hisse', 'hissesi', 'fiyat', 'fiyatı', 'fiyati',
  'son', 'durum', 'durumu', 'genel', 'detaylı', 'detayli',
  'oluştur', 'olustur', 'başlat', 'baslat',
  'derin', 'kapsamlı', 'kapsamli',
  'teknik', 'temel', 'finansal',
  'bilanço', 'bilanco', 'gelir', 'tablosu',
  'risk', 'riskleri', 'fırsat', 'fırsatları',
  'strateji', 'stratejisi',
  'momentum', 'trend',
  // İngilizce
  'analysis', 'report', 'investment', 'thesis', 'growth', 'research',
  'compare', 'comparison', 'deep', 'make', 'create', 'do', 'generate',
]);

// ── Reverse lookup: Ticker → Şirket adı ──
const TICKER_TO_NAME: Record<string, string> = {};

// COMPANY_NAME_MAP'ten reverse map oluştur (en uzun isim kullanılır)
for (const [name, ticker] of Object.entries(COMPANY_NAME_MAP)) {
  if (!TICKER_TO_NAME[ticker] || name.length > TICKER_TO_NAME[ticker].length) {
    TICKER_TO_NAME[ticker] = name;
  }
}

/**
 * Ticker'dan şirket adını döndürür.
 * @example getCompanyName("THYAO") → "türk hava yolları"
 * @example getCompanyName("UNKNOWN") → null
 */
export function getCompanyName(ticker: string): string | null {
  return TICKER_TO_NAME[ticker] || null;
}

export interface TickerExtractionResult {
  /** Çıkarılan ticker kodu */
  ticker: string;
  /** Orijinal kullanıcı sorgusu */
  originalQuery: string;
  /** Ek analiz bağlamı (örn: "büyüme analizi") */
  context: string;
  /** Çıkarma yöntemi */
  method: 'direct_ticker' | 'known_ticker_in_query' | 'company_name' | 'first_word_fallback';
  /** Sorgu tipi: ticker (hisse sorgusu) veya topic (konu sorgusu) */
  queryType: 'ticker' | 'topic';
  /** Konu sorguları için temizlenmiş anahtar kelimeler */
  topicKeywords?: string;
}

/**
 * Doğal dil sorgusundan ticker çıkarır.
 * Öncelik sırası:
 * 1. Direkt ticker kontrolü (tek kelime, bilinen ticker)
 * 2. Sorgu içinde bilinen ticker arama
 * 3. Şirket ismi eşleştirme
 * 4. İlk kelimenin ticker formatına uygunluğu
 */
export function extractTicker(rawQuery: string): TickerExtractionResult {
  const query = rawQuery.trim();
  const upper = query.toUpperCase();
  const words = upper.split(/\s+/);
  const lowerQuery = query.toLowerCase();

  // 1. Direkt ticker kontrolü — tek kelime veya bilinen ticker
  if (words.length === 1 && /^[A-Z]{2,6}$/.test(upper)) {
    return {
      ticker: upper,
      originalQuery: query,
      context: '',
      method: 'direct_ticker',
      queryType: KNOWN_TICKERS.has(upper) ? 'ticker' : 'topic',
    };
  }

  // 2. Sorgu içinde bilinen ticker arama
  for (const word of words) {
    if (KNOWN_TICKERS.has(word) && !NOISE_WORDS.has(word.toLowerCase())) {
      const contextWords = words.filter(w => w !== word);
      return {
        ticker: word,
        originalQuery: query,
        context: contextWords.filter(w => !NOISE_WORDS.has(w.toLowerCase())).join(' '),
        method: 'known_ticker_in_query',
        queryType: 'ticker',
      };
    }
  }

  // 3. Şirket ismi eşleştirme (en uzun eşleşme öncelikli)
  const sortedNames = Object.keys(COMPANY_NAME_MAP).sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    if (lowerQuery.includes(name)) {
      const ticker = COMPANY_NAME_MAP[name];
      const context = lowerQuery.replace(name, '').trim();
      return {
        ticker,
        originalQuery: query,
        context: context.split(/\s+/).filter(w => !NOISE_WORDS.has(w)).join(' '),
        method: 'company_name',
        queryType: 'ticker',
      };
    }
  }

  // 4. İlk kelimenin ticker formatına uygunluğu (2-6 büyük harf)
  const firstWord = words[0];
  if (/^[A-Z]{2,6}$/.test(firstWord)) {
    const isKnown = KNOWN_TICKERS.has(firstWord);
    const contextWords = words.slice(1);
    const cleanedContext = contextWords.filter(w => !NOISE_WORDS.has(w.toLowerCase())).join(' ');

    return {
      ticker: firstWord,
      originalQuery: query,
      context: cleanedContext,
      method: 'first_word_fallback',
      queryType: isKnown ? 'ticker' : 'topic',
      // Konu sorguları için orijinal sorgudan noise kelimeleri temizle
      ...(!isKnown && {
        topicKeywords: words
          .filter(w => !NOISE_WORDS.has(w.toLowerCase()))
          .join(' '),
      }),
    };
  }

  // 5. Son çare — tüm noise kelimeleri çıkar ve kalanı ticker olarak kullan
  const nonNoiseWords = words.filter(w => !NOISE_WORDS.has(w.toLowerCase()));
  if (nonNoiseWords.length > 0 && /^[A-Z]{2,6}$/.test(nonNoiseWords[0])) {
    const isKnown = KNOWN_TICKERS.has(nonNoiseWords[0]);
    return {
      ticker: nonNoiseWords[0],
      originalQuery: query,
      context: nonNoiseWords.slice(1).join(' '),
      method: 'first_word_fallback',
      queryType: isKnown ? 'ticker' : 'topic',
      ...(!isKnown && {
        topicKeywords: nonNoiseWords.join(' '),
      }),
    };
  }

  // Hiçbir şey bulunamazsa ilk kelimeyi kullan — konu sorgusu olarak işaretle
  return {
    ticker: firstWord,
    originalQuery: query,
    context: words.slice(1).join(' '),
    method: 'first_word_fallback',
    queryType: 'topic',
    topicKeywords: words
      .filter(w => !NOISE_WORDS.has(w.toLowerCase()))
      .join(' '),
  };
}
