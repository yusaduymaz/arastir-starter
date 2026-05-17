import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const statusFilter = searchParams.get('status');

    const supabase = createAdminClient();

    let query = supabase
      .from('research_sessions')
      .select('*, users(email)', { count: 'exact' });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data: sessions, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching research sessions:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json({
      sessions,
      total: count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error('Error in /api/admin/sessions GET:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
