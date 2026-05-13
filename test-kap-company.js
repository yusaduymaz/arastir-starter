const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  page.on('response', async response => {
    if (response.url().includes('api') || response.url().includes('_next/data') || response.url().includes('graphql') || response.request().method() === 'POST') {
      if (!response.url().includes('google-analytics')) {
          console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
          try {
              const text = await response.text();
              console.log(`[BODY] ${text.substring(0, 150)}`);
          } catch(e) {}
      }
    }
  });

  try {
    console.log('Navigating to THYAO summary page...');
    await page.goto('https://www.kap.org.tr/tr/sirket-bilgileri/ozet/1498-turk-hava-yollari-a-s', { waitUntil: 'networkidle2' });
    
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
