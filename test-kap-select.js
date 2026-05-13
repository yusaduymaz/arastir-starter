const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercept network requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('api/disclosures')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
    request.continue();
  });

  page.on('response', async response => {
    if (response.url().includes('api/disclosures') || response.url().includes('bildirim-sorgu')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      if (response.url().includes('api/disclosures') && response.status() === 200) {
          try {
              const text = await response.text();
              console.log(`[BODY] ${text.substring(0, 200)}`);
          } catch(e) {}
      }
    }
  });

  try {
    console.log('Navigating to KAP...');
    await page.goto('https://www.kap.org.tr/tr/bildirim-sorgu', { waitUntil: 'networkidle2' });
    
    // Type in search box
    console.log('Typing THYAO and selecting from dropdown...');
    await page.type('#search-input-1', 'THYAO', { delay: 50 }); // Note: this is the input inside the results dropdown area!
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    const html = await page.content();
    console.log('Dropdown HTML size:', html.length);
    
    // Instead of typing in the global search `#all-search`, let's type in `#search-input-1` which is the company filter dropdown
    // Wait, let's see how the old Vue SPA worked. You select a company, date range, then click search.
    // The previous debug log showed: `<button id="clear-selections-1"` and `<input id="search-input-1" placeholder="Arama..."`
    // Let's just click a label in the dropdown that contains THYAO.

  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
})();
