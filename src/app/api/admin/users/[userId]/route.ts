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
    const { role, token_adjustment } = body;

    const supabase = createAdminClient();

    // Update user role (only if role is defined)
    if (role !== undefined) {
      const { error: roleError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', params.userId);

      if (roleError) {
        console.error('Error updating user role:', roleError);
        return new NextResponse('Internal Server Error', { status: 500 });
      }

      // Log role update
      if (adminId) {
        try {
          await supabase.from('admin_audit_logs').insert({
            admin_id: adminId,
            action: 'UPDATE_USER_ROLE',
            target_type: 'user',
            target_id: params.userId,
            details: { new_role: role },
          });
        } catch {
          // Audit log table may be unavailable in some environments.
        }
      }
    }

    // Handle token adjustment (only if defined and non-zero)
    if (token_adjustment !== undefined && token_adjustment !== 0) {
      try {
        await supabase.from('token_ledger').insert({
          user_id: params.userId,
          delta: token_adjustment,
          reason: 'admin_adjustment',
          admin_id: adminId,
        });
      } catch {
        // Fallback: update tokens_balance directly
        const { data: currentUser } = await supabase
          .from('users')
          .select('tokens_balance')
          .eq('id', params.userId)
          .single();

        const currentBalance = currentUser?.tokens_balance || 0;
        const newBalance = Math.max(0, currentBalance + token_adjustment);

        await supabase
          .from('users')
          .update({ tokens_balance: newBalance })
          .eq('id', params.userId);
      }

      // Log token adjustment
      if (adminId) {
        try {
          await supabase.from('admin_audit_logs').insert({
            admin_id: adminId,
            action: 'ADJUST_USER_TOKENS',
            target_type: 'user',
            target_id: params.userId,
            details: { delta: token_adjustment },
          });
        } catch {
          // Audit log table may be unavailable.
        }
      }
    }

    // Re-fetch user after all updates
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.userId)
      .single();

    if (fetchError || !updatedUser) {
      return new NextResponse('User not found after update', { status: 404 });
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
