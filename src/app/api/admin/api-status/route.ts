import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';

const PROVIDERS = [
  { name: 'KAP', envVar: 'RAPIDAPI_KEY' },
  { name: 'TCMB', envVar: 'TCMB_API_KEY' },
  { name: 'CNBC', envVar: 'RAPIDAPI_CNBC_KEY' },
  { name: 'Harem Altın', envVar: 'RAPIDAPI_HAREM_KEY' },
  { name: 'Finance API', envVar: 'RAPIDAPI_FINANCE_API_KEY' },
  { name: 'Exchange Rates', envVar: 'RAPIDAPI_EXCHANGE_RATES_KEY' },
  { name: 'Crypto News', envVar: 'RAPIDAPI_CRYPTO_NEWS_KEY' },
  { name: 'Yahoo Finance (YH)', envVar: 'RAPIDAPI_YH_FINANCE_KEY' },
  { name: 'Yahoo Finance Real-Time', envVar: 'RAPIDAPI_YAHOO_RT_KEY' },
  { name: 'Crypto RSI', envVar: 'RAPIDAPI_CRYPTO_RSI_KEY' },
  { name: 'Forex API', envVar: 'RAPIDAPI_FOREX_KEY' },
  { name: 'Turkey Financial Data', envVar: 'RAPIDAPI_TURKEY_FINANCIAL_KEY' },
  { name: 'Real-time Finance Data', envVar: 'RAPIDAPI_REALTIME_FINANCE_KEY' },
  { name: 'Turkey News Live', envVar: 'RAPIDAPI_TURKEY_NEWS_KEY' },
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
    const providers = PROVIDERS.map((p) => ({
      ...p,
      configured: !!process.env[p.envVar],
    }));

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
