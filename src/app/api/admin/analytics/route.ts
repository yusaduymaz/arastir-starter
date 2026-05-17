import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const supabase = createAdminClient();

    // 1. Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 2. Paid users (active subscriptions / not free tier)
    const { count: paidUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('tier', 'free');

    // 3. Session metrics
    const { count: totalSessions } = await supabase
      .from('research_sessions')
      .select('*', { count: 'exact', head: true });

    const { count: completedSessions } = await supabase
      .from('research_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: failedSessions } = await supabase
      .from('research_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    // For time-series data, it's often more efficient to do it via a custom RPC function or a complex query.
    // However, for simplicity and since Supabase JS doesn't easily do GROUP BY date natively without an RPC,
    // we can fetch the last 30 days of data and group it in JavaScript, 
    // assuming the dataset for the last 30 days is reasonably small. 
    // If it gets large, we should create a Postgres view or RPC.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const { data: recentUsers } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgoStr);

    const { data: recentSessions } = await supabase
      .from('research_sessions')
      .select('created_at')
      .gte('created_at', thirtyDaysAgoStr);

    // Grouping by date
    const groupByDate = (data: any[]) => {
      const grouped = data?.reduce((acc: any, item: any) => {
        const date = item.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Convert to array of { date, count } and sort by date
      return Object.entries(grouped || {})
        .map(([date, count]) => ({ date, count }))
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
    };

    const userSignupsLast30Days = groupByDate(recentUsers || []);
    const sessionsLast30Days = groupByDate(recentSessions || []);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      paidUsers: paidUsers || 0,
      totalSessions: totalSessions || 0,
      completedSessions: completedSessions || 0,
      failedSessions: failedSessions || 0,
      userSignupsLast30Days,
      sessionsLast30Days,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
