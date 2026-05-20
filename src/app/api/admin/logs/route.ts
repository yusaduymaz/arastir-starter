import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) return new NextResponse('Forbidden', { status: 403 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    const supabase = createAdminClient();

    const { data: auditLogs } = await supabase
      .from('admin_audit_logs')
      .select('id, admin_id, action, target_type, target_id, details, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    let agentLogs: any[] = [];
    try {
      const { data: sessions } = await supabase
        .from('research_sessions')
        .select('id, query, extracted_ticker, agent_logs, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (sessions) {
        sessions.forEach(session => {
          const logsList = session.agent_logs || [];
          if (Array.isArray(logsList)) {
            logsList.forEach((log: any, index: number) => {
              agentLogs.push({
                id: `${session.id}-${index}`,
                session_id: session.id,
                agent_name: log.agent || 'orchestrator',
                level: log.status || 'info',
                message: log.message || '',
                created_at: log.timestamp || session.created_at,
              });
            });
          }
        });
      }
    } catch (e) {
      console.error('Error fetching/extracting agent logs:', e);
    }

    const merged = [
      ...(auditLogs || []).map((l) => ({ ...l, source: 'audit' as const })),
      ...agentLogs.map((l) => ({ ...l, source: 'agent' as const })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return NextResponse.json({ logs: merged, total: merged.length });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
