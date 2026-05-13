import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { KAPDisclosure } from '../../types/kap';

puppeteer.use(StealthPlugin());

export async function fetchDisclosures(ticker: string, limit: number = 5): Promise<KAPDisclosure[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const disclosures: KAPDisclosure[] = [];

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to KAP homepage for ${ticker} search...`);
    await page.goto('https://www.kap.org.tr/tr', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Searching for ticker...');
    await page.waitForSelector('#all-search', { timeout: 15000 });
    await page.type('#all-search', ticker, { delay: 100 });
    await page.keyboard.press('Enter');

    console.log('Waiting for search results...');
    try {
      await page.waitForSelector('a[href*="/tr/Bildirim/"]', { timeout: 15000 });
    } catch (e) {
      console.log('Timeout waiting for Bildirim links, attempting to extract anyway...');
    }
    
    // Give Next.js a moment to render the results list fully
    await new Promise(r => setTimeout(r, 2000));

    console.log('Extracting disclosure list...');
    
    const results = await page.$$eval('a[href*="/tr/Bildirim/"]', (links, maxLimit) => {
      const items = links.map(link => {
          let url = link.getAttribute('href') || '';
          if (!url.startsWith('http')) {
              url = 'https://www.kap.org.tr' + url;
          }
          
          // Try to get text context (often parent or the link itself contains the title/summary)
          const textContent = link.textContent?.trim() || link.parentElement?.textContent?.trim() || 'No context';
          
          return {
              url,
              rawText: textContent.replace(/\s+/g, ' ')
          };
      });
      
      // Deduplicate by URL
      const unique = [];
      const seen = new Set();
      for (const item of items) {
          if (!seen.has(item.url)) {
              seen.add(item.url);
              unique.push(item);
          }
      }
      
      return unique.slice(0, maxLimit);
    }, limit);

    console.log(`Found ${results.length} unique disclosures, fetching details...`);

    for (const result of results) {
        try {
            const detailPage = await browser.newPage();
            await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            await detailPage.goto(result.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            const detailData = await detailPage.evaluate(() => {
                const titleEl = document.querySelector('h1, .type-title, .notification-title, h3, .modal-title');
                const contentEl = document.querySelector('.text-content, .disclosure-content, .modal-body, .text-block, p, .v-card-text');
                
                return {
                    title: titleEl ? (titleEl.textContent?.trim() || '') : '',
                    content: contentEl ? (contentEl.textContent?.trim() || '') : ''
                };
            });
            
            disclosures.push({
                title: detailData.title || result.rawText.substring(0, 50) + '...',
                date: new Date().toISOString(), // In a real app we'd extract from DOM
                company: ticker, 
                url: result.url,
                content: detailData.content || result.rawText
            });
            
            await detailPage.close();
        } catch (detailError) {
            console.error(`Failed to fetch details for ${result.url}:`, detailError);
        }
    }

    return disclosures;

  } catch (error) {
    console.error(`Error fetching KAP disclosures for ${ticker}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
