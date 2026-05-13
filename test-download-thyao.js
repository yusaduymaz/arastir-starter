const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'www.kap.org.tr',
  port: 443,
  path: '/tr/sirket-bilgileri/ozet/1498-turk-hava-yollari-a-s',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    fs.writeFileSync('thyao_ssr_debug.html', body);
    console.log('Saved thyao_ssr_debug.html, length:', body.length);
  });
});

req.on('error', error => { console.error(error); });
req.end();
