import { fetchDisclosures } from './client';

async function testScrape01() {
  console.log("Testing SCRAPE-01: Fetch THYAO disclosures");
  const disclosures = await fetchDisclosures('THYAO', 1);
  if (!Array.isArray(disclosures)) {
    throw new Error("Expected an array of disclosures");
  }
  if (disclosures.length === 0) {
    throw new Error("Expected at least 1 disclosure");
  }
  const first = disclosures[0];
  if (!first.title || !first.company || !first.content) {
    throw new Error("Disclosure missing title, company, or content");
  }
  console.log("Test passed.");
}

testScrape01().catch(err => {
  console.error("Test failed:", err.message || err);
  process.exit(1);
});
