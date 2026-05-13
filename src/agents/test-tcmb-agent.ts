import { config } from 'dotenv';
config({ path: '.env.local' });
import { getTcmbData } from '../lib/tcmb/client';
import { format } from 'date-fns';

async function testTcmb() {
  console.log('Fetching TCMB data...');
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const formattedEndDate = format(endDate, 'dd-MM-yyyy');
    const formattedStartDate = format(startDate, 'dd-MM-yyyy');

    // TP.DK.USD.A.YTL is the series for USD exchange rate (buying)
    const data = await getTcmbData('TP.DK.USD.A.YTL', formattedStartDate, formattedEndDate);
    console.log('Successfully fetched TCMB data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch TCMB data:', error);
    process.exit(1);
  }
}

testTcmb();
