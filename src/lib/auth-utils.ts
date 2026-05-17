import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export async function isAdmin(): Promise<boolean> {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  // Use service_role to bypass RLS because Clerk is our auth provider
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return false;
  }

  return data.role === 'admin';
}
