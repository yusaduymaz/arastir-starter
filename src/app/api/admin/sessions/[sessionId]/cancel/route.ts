import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@clerk/nextjs';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { userId: adminId } = auth();
    const supabase = createAdminClient();

    const { data: updatedSession, error } = await supabase
      .from('research_sessions')
      .update({ status: 'failed', error_message: 'Cancelled by admin' })
      .eq('id', params.sessionId)
      .eq('status', 'running')
      .select()
      .single();

    if (error) {
      console.error('Error cancelling session:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Log the action
    if (adminId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action: 'CANCEL_SESSION',
          target_type: 'research_session',
          target_id: params.sessionId,
        }).select().single();
      } catch {
        // Audit log table may be unavailable in some environments.
      }
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error cancelling session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
