import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@clerk/nextjs';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.userId)
      .single();

    if (error || !user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { userId: adminId } = auth();
    const body = await request.json();
    const { role } = body;

    const supabase = createAdminClient();

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', params.userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Log the action (Audit logs usually need the adminId)
    if (adminId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action: 'UPDATE_USER_ROLE',
          target_type: 'user',
          target_id: params.userId,
          details: { new_role: role },
        }).select().single();
      } catch {
        // Audit log table may be unavailable in some environments.
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { userId: adminId } = auth();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', params.userId);

    if (error) {
      console.error('Error deleting user:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Log the action
    if (adminId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action: 'DELETE_USER',
          target_type: 'user',
          target_id: params.userId,
        }).select().single();
      } catch {
        // Audit log table may be unavailable in some environments.
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
