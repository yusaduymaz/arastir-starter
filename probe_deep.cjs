const https = require('https');
require('dotenv').config({ path: '.env.local' });

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
        resolve({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: String(e) }));
    req.end();
  });
}

(async () => {
    const key = "f061eea5c1msh1f78a22ff4ff044p11d83cjsnb4ffc5dd10e1";
    const targets = [
        { host: "harem-altin-live-gold-price-data.p.rapidapi.com", path: "/prices" },
        { host: "bist100-stock-data-15-minutes-late.p.rapidapi.com", path: "/api/v1/all" },
        { host: "contextualwebsearch-websearch-v1.p.rapidapi.com", path: "/api/search/NewsSearchAPI?q=test" }
    ];
    for (const t of targets) {
        console.log(`\n--- Probing ${t.host}${t.path} ---`);
        const r = await request(t.host, t.path, key);
        console.log(`Status: ${r.status}`);
        console.log(`Body: ${r.body.slice(0, 200)}`);
    }
})();
