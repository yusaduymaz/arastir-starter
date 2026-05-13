import { QueryForm } from '@/components/dashboard/QueryForm'
import { HistoryTable } from '@/components/dashboard/HistoryTable'
import { createClient } from '@/lib/supabase/server'
import { ResearchSession } from '@/types/research'

export const dynamic = 'force-dynamic' // Ensure page is always dynamic to fetch latest history

export default async function DashboardPage() {
  const supabase = createClient()

  // Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  
  let sessions: ResearchSession[] = []

  if (user) {
    // Fetch history
    const { data } = await supabase
      .from('research_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      sessions = data as ResearchSession[]
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <QueryForm />
      <HistoryTable sessions={sessions} />
    </div>
  )
}
