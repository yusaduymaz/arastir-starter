const https = require('https');
require('dotenv').config({ path: '.env.local' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function request(host, path, key) {
  return new Promise((resolve) => {
    const opts = {
      method: 'GET',
      hostname: host,
      path,
      headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': key,
      },
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode || 0, ct: res.headers['content-type'] || '', body });
      });
    });
    req.on('error', (e) => resolve({ status: 0, ct: '', body: String(e) }));
    req.end();
  });
}

function snippet(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > 120 ? t.slice(0, 120) + '…' : t;
}

(async () => {
  const key = (process.env.RAPIDAPI_HAREM_ALTIN_KEY || process.env.RAPIDAPI_TURKEY_FINANCE_KEY || process.env.RAPIDAPI_TURKEY_NEWS_KEY || '').trim();
  if (!key) {
    console.error('No RapidAPI key found for probing (expected some RAPIDAPI_* in env).');
    process.exit(1);
  }

  const targets = [
    { name: 'HaremAltin', host: 'harem-altin-live-gold-price-data.p.rapidapi.com' },
    { name: 'TurkeyFinancial', host: 'bist100-stock-data-15-minutes-late.p.rapidapi.com' },
    { name: 'TurkeyNews', host: 'contextualwebsearch-websearch-v1.p.rapidapi.com' },
  ];

  const commonPaths = [
    '/',
    '/api',
    '/api/',
    '/api/v1',
    '/api/v1/',
    '/v1',
    '/v1/',
    '/docs',
    '/swagger',
    '/swagger.json',
    '/openapi.json',
    '/api-docs',
    '/health',
  ];

  const extraByHost = {
    'contextualwebsearch-websearch-v1.p.rapidapi.com': [
      '/api/search/NewsSearchAPI?q=test&country=TR&lang=tr',
      '/api/Search/NewsSearchAPI?q=test&country=TR&lang=tr',
      '/api/search/NewsSearchAPI?q=Borsa%20%C4%B0stanbul&country=TR&lang=tr',
      '/api/Search/NewsSearchAPI?q=Borsa%20%C4%B0stanbul&country=TR&lang=tr',
      '/api/Search/WebSearchAPI?q=test&pageNumber=1&pageSize=1&autoCorrect=true',
    ],
    'bist100-stock-data-15-minutes-late.p.rapidapi.com': [
      '/api',
      '/api/',
      '/bist100',
      '/bist100/',
      '/stocks',
      '/stocks/',
      '/api/v1',
      '/api/v1/',
      '/api/v1/bist100',
      '/api/v1/stocks',
      '/api/v1/stocks/all',
      '/api/v1/all',
      '/all',
    ],
    'harem-altin-live-gold-price-data.p.rapidapi.com': [
      '/api',
      '/api/',
      '/prices',
      '/prices/',
      '/api/v1',
      '/api/v1/',
      '/api/v1/prices',
      '/api/v1/all',
      '/all',
      '/latest',
      '/latest/',
    ],
  };

  for (const t of targets) {
    console.log('\n===', t.name, t.host, '===');
    const paths = [...new Set([...(extraByHost[t.host] || []), ...commonPaths])];
    for (const p of paths) {
      const r = await request(t.host, p, key);
      const ok = r.status >= 200 && r.status < 300;
      if (ok) {
        console.log('OK ', r.status, p, r.ct, snippet(r.body));
      } else if (r.status !== 404) {
        console.log('ERR', r.status, p, r.ct, snippet(r.body));
      }
      await sleep(350);
    }
  }
})();
