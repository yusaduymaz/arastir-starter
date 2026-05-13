const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://www.bloomberght.com/yapi-kredi-yatirim-dan-2025-hisse-strateji-raporu-3742403', { waitUntil: 'networkidle2' });
  
  // Try to find the main content element
  const content = await page.evaluate(() => {
    // Usually articles have tags like <article>, <main>, or classes like 'content', 'article-body', 'news-content'
    const articleBody = document.querySelector('.article-content') || 
                        document.querySelector('.content') || 
                        document.querySelector('article') ||
                        document.querySelector('.news-content');
    
    if (articleBody) {
      // Remove scripts, ads, etc.
      const elementsToRemove = articleBody.querySelectorAll('script, style, iframe, .ad, .advertisement');
      elementsToRemove.forEach(el => el.remove());
      return articleBody.innerText.trim().substring(0, 500); // Return first 500 chars
    }
    return null;
  });
  
  console.log("Article Content Preview:", content);

  await browser.close();
}

run().catch(console.error);
