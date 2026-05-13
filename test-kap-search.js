const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept network requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('graphql') || request.url().includes('_next/data') || request.method() === 'POST' || request.url().includes('search')) {
      if (!request.url().includes('google-analytics')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`[POST DATA]`, request.postData());
        }
      }
    }
    request.continue();
  });

  page.on('response', async response => {
    if (!response.url().includes('google-analytics') && (response.url().includes('api') || response.url().includes('graphql') || response.url().includes('_next/data') || response.request().method() === 'POST' || response.url().includes('search'))) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      if (response.url().includes('search') || response.url().includes('api') || response.url().includes('_next/data')) {
          try {
              const text = await response.text();
              console.log(`[RESPONSE BODY PREVIEW] ${text.substring(0, 150)}`);
          } catch(e) {}
      }
    }
  });

  try {
    console.log('Navigating to KAP...');
    await page.goto('https://www.kap.org.tr/tr/bildirim-sorgu', { waitUntil: 'networkidle2' });
    
    console.log('Typing THYAO into search...');
    await page.type('#all-search', 'THYAO', { delay: 100 });
    
    console.log('Waiting to see if autocomplete triggers requests...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Pressing Enter...');
    await page.keyboard.press('Enter');
    
    console.log('Waiting 5 seconds for results...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Also look for specific Next.js Server Action or similar in DOM
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('kap_search_action_debug.html', html);

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
