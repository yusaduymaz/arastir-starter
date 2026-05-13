const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.kap.org.tr/tr/bist-sirketler', {waitUntil: 'networkidle2'});
  const fs = require('fs');
  fs.writeFileSync('kap_bist.html', await page.content());
  await browser.close();
})();
