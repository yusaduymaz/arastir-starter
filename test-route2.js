const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const res = await page.goto('https://www.kap.org.tr/tr/sirket-bilgileri/ozet/1400-thyao-turk-hava-yollari-a-s', {waitUntil: 'networkidle2'});
  console.log('Status for ozet:', res.status());
  require('fs').writeFileSync('kap_route2.html', await page.content());
  
  const res2 = await page.goto('https://www.kap.org.tr/tr/bist-sirketler', {waitUntil: 'networkidle2'});
  console.log('Status for bist-sirketler:', res2.status());
  require('fs').writeFileSync('kap_route3.html', await page.content());
  await browser.close();
})();
