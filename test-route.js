const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.kap.org.tr/tr/arama/THYAO', {waitUntil: 'networkidle2'});
  require('fs').writeFileSync('kap_route.html', await page.content());
  await browser.close();
})();
