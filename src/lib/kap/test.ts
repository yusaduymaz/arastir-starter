import { fetchDisclosures } from './client';

async function main() {
  const ticker = 'THYAO';
  console.log(`Starting scraper test for ${ticker}...`);
  try {
    const data = await fetchDisclosures(ticker, 2); // Fetch 2 to make test faster
    console.log('Successfully fetched data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.length === 0) {
      console.warn('Warning: No data was returned. Scraping might have failed or selectors changed.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();