const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Try searching for THYAO
  await page.goto('https://www.bloomberght.com/arama/THYAO', { waitUntil: 'networkidle2' });
  
  // Extract links and titles of news articles
  const articles = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a'));
    return items.map(a => ({ title: a.textContent.trim(), href: a.href }))
                .filter(a => a.href.includes('bloomberght.com/haberler') || a.href.match(/-\d+$/))
                .slice(0, 10);
  });
  
  console.log("Found articles on Bloomberg HT search:", articles);
  
  // Let's also check general selectors on Bloomberg HT by looking at classes
  const classes = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .map(e => e.className)
      .filter(c => typeof c === 'string' && c.length > 0 && (c.includes('news') || c.includes('haber') || c.includes('title')))
      .slice(0, 10);
  });
  console.log("Relevant classes found:", classes);

  await browser.close();
}

run().catch(console.error);
