import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';

import { RapidApiProvider, getRapidApiKey } from '@/lib/rapidapi/types';

interface ProviderCheck {
  name: string;
  type: 'custom' | 'rapidapi';
  envVar: string;
  provider?: RapidApiProvider;
  check?: () => boolean;
}

const PROVIDERS: ProviderCheck[] = [
  { name: 'KAP', type: 'custom', check: () => true, envVar: 'Public (No Key Needed)' },
  { name: 'TCMB', type: 'custom', check: () => !!process.env.TCMB_EVDS_API_KEY, envVar: 'TCMB_EVDS_API_KEY' },
  { name: 'CNBC', type: 'rapidapi', provider: RapidApiProvider.CNBC, envVar: 'RAPIDAPI_CNBC_KEY' },
  { name: 'Harem Altın', type: 'rapidapi', provider: RapidApiProvider.HaremAltin, envVar: 'RAPIDAPI_HAREM_ALTIN_KEY' },
  { name: 'Finance API', type: 'rapidapi', provider: RapidApiProvider.FinanceAPI, envVar: 'RAPIDAPI_FINANCE_API_KEY' },
  { name: 'Exchange Rates', type: 'rapidapi', provider: RapidApiProvider.ExchangeRates, envVar: 'RAPIDAPI_EXCHANGE_RATES_KEY' },
  { name: 'Crypto News', type: 'rapidapi', provider: RapidApiProvider.CryptoNews, envVar: 'RAPIDAPI_CRYPTO_NEWS_KEY' },
  { name: 'Yahoo Finance (YH)', type: 'rapidapi', provider: RapidApiProvider.YFinance, envVar: 'RAPIDAPI_YH_FINANCE_KEY' },
  { name: 'Yahoo Finance Real-Time', type: 'rapidapi', provider: RapidApiProvider.YahooRealTime, envVar: 'RAPIDAPI_YAHOO_REALTIME_KEY' },
  { name: 'Crypto RSI', type: 'rapidapi', provider: RapidApiProvider.CryptoRSI, envVar: 'RAPIDAPI_CRYPTO_INDICATORS_KEY' },
  { name: 'Forex API', type: 'rapidapi', provider: RapidApiProvider.ForexAPI, envVar: 'RAPIDAPI_FOREX_KEY' },
  { name: 'Turkey Financial Data', type: 'rapidapi', provider: RapidApiProvider.TurkeyFinancial, envVar: 'RAPIDAPI_TURKEY_FINANCE_KEY' },
  { name: 'Real-time Finance Data', type: 'rapidapi', provider: RapidApiProvider.RealTimeFinance, envVar: 'RAPIDAPI_RT_FINANCE_KEY' },
  { name: 'Turkey News Live', type: 'rapidapi', provider: RapidApiProvider.TurkeyNews, envVar: 'RAPIDAPI_TURKEY_NEWS_KEY' },
];

export async function GET() {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) return new NextResponse('Forbidden', { status: 403 });

    // Check Supabase
    let supabaseStatus = { status: 'error' as 'ok' | 'error', latencyMs: -1 };
    try {
      const start = Date.now();
      const supabase = createAdminClient();
      await supabase.from('users').select('count', { count: 'exact', head: true });
      supabaseStatus = { status: 'ok', latencyMs: Date.now() - start };
    } catch { /* supabase unreachable */ }

    // Check Clerk keys
    const clerkConfigured = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

    // Check providers
    const providers = PROVIDERS.map((p) => {
      let configured = false;
      if (p.type === 'custom' && p.check) {
        configured = p.check();
      } else if (p.type === 'rapidapi' && p.provider) {
        configured = !!getRapidApiKey(p.provider);
      }
      return {
        name: p.name,
        envVar: p.envVar,
        configured,
      };
    });

    return NextResponse.json({
      services: {
        supabase: supabaseStatus,
        clerk: { configured: clerkConfigured },
      },
      providers,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking API status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
