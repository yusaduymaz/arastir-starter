import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();
    const { data: session, error } = await supabase
      .from('research_sessions')
      .select('*, agent_runs(*)')
      .eq('id', params.sessionId)
      .single();

    if (error || !session) {
      return new NextResponse('Session not found', { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

