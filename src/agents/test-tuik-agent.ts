import { getTuikData } from '../lib/tuik/client';

async function testTuik() {
  console.log('Fetching TUIK category data...');
  try {
    const data = await getTuikData();
    console.log('Successfully fetched TUIK data:');
    
    // The response is usually an array of categories. Let's print the first few.
    if (Array.isArray(data)) {
      console.log(JSON.stringify(data.slice(0, 3), null, 2));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Failed to fetch TUIK data:', error);
    process.exit(1);
  }
}

testTuik();
