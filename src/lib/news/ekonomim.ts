import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsArticle } from '../../types/news';

puppeteer.use(StealthPlugin());

export async function fetchEkonomimNews(query: string, limit: number = 3): Promise<NewsArticle[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const articles: NewsArticle[] = [];

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`[Ekonomim] Navigating to search for ${query}...`);
    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://www.ekonomim.com/arama?q=${encodedQuery}`, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('[Ekonomim] Extracting article links...');
    const results = await page.evaluate((maxLimit) => {
      const links = Array.from(document.querySelectorAll('a'));
      const items = links
        .map(a => ({ 
            title: a.textContent?.trim() || '', 
            url: a.href 
        }))
        // Ensure it looks like an article link, generally ends with -haberi-[number] or similar
        .filter(a => a.url.includes('ekonomim.com') && a.url.match(/-\d+$/));
      
      const unique = [];
      const seen = new Set();
      for (const item of items) {
          // Avoid duplicate URLs and empty titles
          if (!seen.has(item.url) && item.title.length > 10) {
              seen.add(item.url);
              unique.push(item);
          }
      }
      return unique.slice(0, maxLimit);
    }, limit);

    console.log(`[Ekonomim] Found ${results.length} valid links, fetching details...`);

    for (const result of results) {
        try {
            const detailPage = await browser.newPage();
            await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            await detailPage.goto(result.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            const detailData = await detailPage.evaluate(() => {
                const articleBody = document.querySelector('.content-text') || document.querySelector('article') || document.querySelector('.detail-content');
                if (articleBody) {
                    const noise = articleBody.querySelectorAll('script, style, iframe, .ad, .advertisement, .banner');
                    noise.forEach(el => el.remove());
                    return articleBody.textContent?.trim() || '';
                }
                return '';
            });
            
            articles.push({
                title: result.title,
                date: new Date().toISOString(), // Fallback
                source: 'Ekonomim',
                url: result.url,
                content: detailData || result.title
            });
            
            await detailPage.close();
        } catch (detailError) {
            console.error(`[Ekonomim] Failed to fetch details for ${result.url}:`, detailError);
        }
    }

    return articles;

  } catch (error) {
    console.error(`[Ekonomim] Error fetching news for ${query}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
