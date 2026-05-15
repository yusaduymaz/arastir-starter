import { supabase } from '@/lib/supabase/client'
import type { ResearchSession } from '@/types/research'

export async function createResearchSession(
  query: string,
  userId: string
): Promise<ResearchSession> {
  const { data, error } = await supabase
    .from('research_sessions')
    .insert({ query: query, user_id: userId, status: 'pending' })
    .select()
    .single()

  if (error) {
    console.error('Error creating research session:', error)
    throw new Error('Failed to create research session')
  }

  return data as ResearchSession
}

export async function updateResearchSessionStatus(
  sessionId: string,
  status: 'running' | 'completed' | 'failed',
  errorMessage?: string
) {
  const { error } = await supabase
    .from('research_sessions')
    .update({ status: status, error_message: errorMessage })
    .eq('id', sessionId)

  if (error) {
    console.error(`Error updating session ${sessionId} to ${status}:`, error)
    throw new Error('Failed to update research session status')
  }
}
