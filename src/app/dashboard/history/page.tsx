import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { HistoryTable } from '@/components/dashboard/HistoryTable';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const { userId } = auth();

  // Initialize Supabase Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch user's research history
  let history: any[] = [];
  if (userId) {
    const { data, error } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      history = data;
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-margin-desktop z-10">
      <div className="max-w-container-max mx-auto flex flex-col gap-gutter">
        <h2 className="text-on-surface font-headline text-headline-lg-mobile tracking-tight">Raporlarım</h2>
        
        {/* Reports Table using shared component */}
        <HistoryTable sessions={history} />
      </div>
    </main>
  );
}
