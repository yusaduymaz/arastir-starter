import { z } from 'zod';

const TcmbDataSchema = z.object({
  items: z.array(
    z.object({
      'TP_DK_USD_A_YTL': z.string().nullable(),
      'Tarih': z.string(),
    })
  ),
});

type TcmbData = z.infer<typeof TcmbDataSchema>;

export async function getTcmbData(
  series: string,
  startDate: string,
  endDate: string
): Promise<TcmbData> {
  const apiKey = process.env.TCMB_API_KEY;
  if (!apiKey) {
    throw new Error('TCMB_API_KEY is not set in environment variables');
  }

  const baseUrl = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/';
  const params = [
    `series=${series}`,
    `startDate=${startDate}`,
    `endDate=${endDate}`,
    `type=json`
  ].join('&');
  
  const url = `${baseUrl}${params}`;

  let responseText = '';
  try {
    const response = await fetch(url, {
      headers: {
        'key': apiKey,
        'User-Agent': 'curl/7.68.0'
      }
    });
    responseText = await response.text();

    if (!response.ok || responseText.includes('<!doctype html>')) {
      console.error('API Response was not OK or returned HTML:');
      console.error('Status:', response.status);
      console.error('Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      throw new Error(`API Error: ${response.status} ${response.statusText} - Body: ${responseText.substring(0, 500)}...`);
    }

    const data = JSON.parse(responseText);
    const result = TcmbDataSchema.safeParse(data);
    if (!result.success) {
      console.error('Zod Validation Error for TCMB Data:');
      console.error(JSON.stringify(result.error.format(), null, 2));
      console.error('Raw Data received:', JSON.stringify(data, null, 2));
      throw new Error('TCMB Data validation failed. See logs for details.');
    }
    return result.data;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse response as JSON. The server returned:\n---\n${responseText}\n---`);
    }
    console.error('Error in getTcmbData:');
    if (error.message) console.error('Message:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    throw error;
  }
}
