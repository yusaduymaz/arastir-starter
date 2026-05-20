const https = require('https');
try { require('dotenv').config({ path: '.env.local' }); } catch (e) {}

const tests = [
  { name: 'CNBC', host: 'cnbc.p.rapidapi.com', url: 'https://cnbc.p.rapidapi.com/news/v2/list-trending?tag=Articles&count=1', envKeys: ['RAPIDAPI_CNBC_KEY'] },
  { name: 'Harem Altin', host: 'harem-altin.p.rapidapi.com', url: 'https://harem-altin.p.rapidapi.com/market/prices', envKeys: ['RAPIDAPI_HAREM_ALTIN_KEY', 'RAPIDAPI_HAREMALTIN_KEY'] },
  { name: 'Finance API', host: 'finance-api.p.rapidapi.com', url: 'https://finance-api.p.rapidapi.com/market/get-summary', envKeys: ['RAPIDAPI_FINANCE_API_KEY', 'RAPIDAPI_FINANCEAPI_KEY'] },
  { name: 'Exchange Rates', host: 'exchange-rates.p.rapidapi.com', url: 'https://exchange-rates.p.rapidapi.com/latest?base=USD&symbols=TRY', envKeys: ['RAPIDAPI_EXCHANGE_RATES_KEY', 'RAPIDAPI_EXCHANGERATES_KEY'] },
  { name: 'Crypto News', host: 'crypto-news-live3.p.rapidapi.com', url: 'https://crypto-news-live3.p.rapidapi.com/news', envKeys: ['RAPIDAPI_CRYPTO_NEWS_KEY', 'RAPIDAPI_CRYPTONEWS_KEY'] },
  { name: 'YH Finance', host: 'yh-finance.p.rapidapi.com', url: 'https://yh-finance.p.rapidapi.com/market/v2/get-summary?region=US', envKeys: ['RAPIDAPI_YH_FINANCE_KEY', 'RAPIDAPI_YFINANCE_KEY'] },
  { name: 'Yahoo Real Time', host: 'yahoo-real-time-finance.p.rapidapi.com', url: 'https://yahoo-real-time-finance.p.rapidapi.com/market/v2/get-summary?region=US', envKeys: ['RAPIDAPI_YAHOO_REALTIME_KEY', 'RAPIDAPI_YAHOOREALTIME_KEY'] },
  { name: 'Crypto Indicators', host: 'crypto-indicators.p.rapidapi.com', url: 'https://crypto-indicators.p.rapidapi.com/rsi?symbol=BTCUSDT&interval=1h', envKeys: ['RAPIDAPI_CRYPTO_INDICATORS_KEY', 'RAPIDAPI_CRYPTO_RSI_KEY', 'RAPIDAPI_CRYPTORSI_KEY'] },
  { name: 'Forex', host: 'forex-api.p.rapidapi.com', url: 'https://forex-api.p.rapidapi.com/latest?base=USD', envKeys: ['RAPIDAPI_FOREX_KEY', 'RAPIDAPI_FOREXAPI_KEY'] },
  { name: 'Turkey Financial', host: 'turkey-financial-data.p.rapidapi.com', url: 'https://turkey-financial-data.p.rapidapi.com/market/prices', envKeys: ['RAPIDAPI_TURKEY_FINANCIAL_KEY', 'RAPIDAPI_TURKEYFINANCIAL_KEY', 'RAPIDAPI_TURKEY_FINANCE_KEY'] },
  { name: 'Realtime Finance', host: 'real-time-finance-data.p.rapidapi.com', url: 'https://real-time-finance-data.p.rapidapi.com/market-trends?region=TR&language=tr', envKeys: ['RAPIDAPI_REALTIME_FINANCE_KEY', 'RAPIDAPI_REALTIMEFINANCE_KEY', 'RAPIDAPI_RT_FINANCE_KEY'] },
  { name: 'Turkey News', host: 'turkey-news-api.p.rapidapi.com', url: 'https://turkey-news-api.p.rapidapi.com/news?category=economy', envKeys: ['RAPIDAPI_TURKEY_NEWS_KEY', 'RAPIDAPI_TURKEYNEWS_KEY'] }
];

const MIN_HOST_DELAY_MS = 1100;
const lastByHost = new Map();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function throttle(host) {
  const last = lastByHost.get(host) || 0;
  const now = Date.now();
  const wait = Math.max(0, MIN_HOST_DELAY_MS - (now - last));
  if (wait > 0) await sleep(wait);
  lastByHost.set(host, Date.now());
}

function requestOnce(url, headers) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const opts = {
      method: 'GET',
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode || 0, headers: res.headers || {}, body });
      });
    });
    req.on('error', (e) => resolve({ status: 0, headers: {}, body: String(e) }));
    req.end();
  });
}

async function hit(t) {
  let key;
  for (const k of t.envKeys) {
    const v = process.env[k];
    if (typeof v === 'string' && v.trim()) {
      key = v.trim();
      break;
    }
  }
  if (!key) return { name: t.name, host: t.host, status: 'missing_key', detail: t.envKeys[0] };
  
  await throttle(t.host);
  let r = await requestOnce(t.url, { 'x-rapidapi-key': key, 'x-rapidapi-host': t.host });
  
  if (r.status === 429) {
    const ra = Number(r.headers['retry-after'] || '1');
    await sleep((Number.isFinite(ra) && ra > 0 ? ra : 1) * 1000);
    await throttle(t.host);
    r = await requestOnce(t.url, { 'x-rapidapi-key': key, 'x-rapidapi-host': t.host });
  }

  let snippet = (r.body || '').replace(/\s+/g, ' ').trim();
  if (snippet.length > 120) snippet = snippet.slice(0, 120) + '...';
  
  return { name: t.name, host: t.host, status: r.status, detail: snippet };
}

async function main() {
  console.log('Testing APIs...\n');
  const results = [];
  for (const t of tests) {
    const res = await hit(t);
    results.push(res);
    console.log(`[${res.status}] ${res.name} (${res.host}): ${res.detail}`);
  }
}

main().catch(console.error);
