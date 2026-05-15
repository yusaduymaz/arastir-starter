import https from 'https';

async function test() {
  console.log("Testing GET https://www.kap.org.tr/tr/api/disclosures with https.request");
  try {
    const options = {
      hostname: 'www.kap.org.tr',
      path: '/tr/api/disclosures',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log('Status Code:', res.statusCode);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Response length:', data.length);
        if (data.length > 0) {
            console.log('Starts with:', data.substring(0, 100));
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request Error:', e);
    });

    req.end();
  } catch (e) {
    console.error("Error:", e);
  }
}
test();