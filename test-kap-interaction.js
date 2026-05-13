const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('https://www.kap.org.tr/tr/bildirim-sorgu', {waitUntil: 'networkidle2'});
  
  try {
    await page.waitForSelector('#search-input-1', { timeout: 10000 });
    console.log('Found search input');
    await page.type('#search-input-1', 'THYAO', { delay: 100 });
    
    await page.waitForFunction(() => {
        const labels = document.querySelectorAll('.search-dropdown label span');
        for (const label of labels) {
            if (label.textContent.includes('THYAO')) return true;
        }
        return false;
    }, { timeout: 5000 });
    console.log('Found THYAO in dropdown');
    
    await page.evaluate(() => {
        const labels = document.querySelectorAll('.search-dropdown label');
        for (const label of labels) {
            if (label.textContent.includes('THYAO')) {
                label.querySelector('input').click();
                console.log('Clicked THYAO checkbox');
                break;
            }
        }
    });
    
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.textContent.trim() === 'Ara') {
                btn.click();
                console.log('Clicked Ara button');
                break;
            }
        }
    });
    
    await new Promise(r => setTimeout(r, 4000));
    
    const links = await page.evaluate(() => {
        const aTags = document.querySelectorAll('a[href*="/tr/Bildirim/"]');
        return Array.from(aTags).map(a => a.href);
    });
    console.log('Found links:', links);
    
  } catch (e) {
      console.error(e);
  }
  
  await browser.close();
})();
