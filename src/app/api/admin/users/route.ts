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
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased default limit for admin
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json({
      users,
      total: count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error('Error in /api/admin/users GET:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
