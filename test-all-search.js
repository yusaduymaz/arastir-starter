const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('https://www.kap.org.tr/tr', {waitUntil: 'networkidle2'});
  
  try {
    await page.waitForSelector('#all-search', { timeout: 10000 });
    console.log('Found all-search input');
    
    // I should type into all-search
    await page.type('#all-search', 'THYAO', { delay: 100 });
    
    // Press enter
    await page.keyboard.press('Enter');
    console.log('Pressed enter on all-search');
    
    await new Promise(r => setTimeout(r, 4000));
    
    const links = await page.evaluate(() => {
        const aTags = document.querySelectorAll('a[href*="/tr/Bildirim/"]');
        return Array.from(aTags).map(a => a.href);
    });
    console.log('Found links:', links.length, links.slice(0, 3));
    
    require('fs').writeFileSync('kap_all_search.html', await page.content());
    
  } catch (e) {
      console.error(e);
  }
  
  await browser.close();
})();
