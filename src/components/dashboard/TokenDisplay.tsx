import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function TokenDisplay() {
  const { userId } = auth()

  if (!userId) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let { data: userRecord } = await supabase
    .from('user_balances')
    .select('balance, tier')
    .eq('user_id', userId)
    .single()

  // Webhook lokalde çalışmadığı için kullanıcı yoksa lazy creation yap
  // Upsert + re-fetch pattern prevents race conditions when multiple requests
  // try to create the same user simultaneously (e.g. TokenDisplay + search API)
  if (!userRecord) {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || ''

    await supabase
      .from('users')
      .upsert({ id: userId, email, tier: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

    await supabase
      .from('token_ledger')
      .insert({ user_id: userId, amount: 5, transaction_type: 'grant', description: 'Lazy creation bonus' })

    const { data: fetchedUser } = await supabase
      .from('user_balances')
      .select('balance, tier')
      .eq('user_id', userId)
      .single()

    userRecord = fetchedUser
  }

  if (!userRecord) {
    return (
      <div className="flex items-center gap-2 bg-surface-container border border-outline-variant px-3 py-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px] text-error">error</span>
        <span className="text-on-surface-variant font-label-sm">Profil yüklenemedi</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 border-r border-outline-variant pr-4 mr-2">
      <div className="flex flex-col items-end">
        <span className="text-on-surface font-label-sm font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-secondary">toll</span>
          Kalan Token: {userRecord.balance}
        </span>
        <span className="text-on-surface-variant text-[10px] uppercase tracking-wider">{userRecord.tier} Plan</span>
      </div>
      <button className="text-[11px] uppercase font-bold tracking-wider px-3 py-1.5 bg-primary-container text-secondary border border-secondary/30 rounded hover:bg-secondary/10 transition-colors">
        Yükselt
      </button>
    </div>
  )
}
