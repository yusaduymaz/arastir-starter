import https from 'https';

async function test() {
  console.log("Testing GET https://www.kap.org.tr/tr/api/disclosures with agent");
  try {
    const agent = new https.Agent({ family: 4 });
    const res = await fetch('https://www.kap.org.tr/tr/api/disclosures', {
      agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();