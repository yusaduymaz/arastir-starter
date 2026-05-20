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
      .select('*', { count: 'exact' });

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

    // Since there is no foreign key relation in the DB schema between research_sessions and users,
    // we fetch user emails separately to avoid PostgREST PGRST200 errors.
    let sessionsWithUser = sessions || [];
    if (sessions && sessions.length > 0) {
      const userIds = Array.from(new Set(sessions.map(s => s.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds);
        
        if (!usersError && users) {
          const userMap = new Map(users.map(u => [u.id, u]));
          sessionsWithUser = sessions.map(session => ({
            ...session,
            users: userMap.get(session.user_id) || null
          }));
        }
      }
    }

    return NextResponse.json({
      sessions: sessionsWithUser,
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
