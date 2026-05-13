const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept network requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('graphql') || request.url().includes('_next/data') || request.method() === 'POST') {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`[POST DATA]`, request.postData());
      }
    }
    request.continue();
  });

  page.on('response', async response => {
    if (response.url().includes('api') || response.url().includes('graphql') || response.url().includes('_next/data') || response.request().method() === 'POST') {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('Navigating to KAP...');
    await page.goto('https://www.kap.org.tr/tr/bildirim-sorgu', { waitUntil: 'networkidle2' });
    
    // Type in search (try to find the new input selector)
    // KAP might use a different selector now since it's Next.js.
    // Let's just wait a bit and dump some html to see the input fields.
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('kap_new_debug.html', html);
    console.log('Saved kap_new_debug.html');

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
