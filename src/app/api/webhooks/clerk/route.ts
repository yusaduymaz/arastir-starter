import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data
    const primaryEmail = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : ''

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert user into SaaS users table (defaults: tier='free')
    const { error } = await supabase.from('users').insert({
      id: id,
      email: primaryEmail
    })

    if (error) {
      console.error('Error inserting user to Supabase:', error)
      return new Response('Error inserting to database', { status: 500 })
    }

    // Insert initial token grant into ledger
    const { error: ledgerError } = await supabase.from('token_ledger').insert({
      user_id: id,
      amount: 5,
      transaction_type: 'grant',
      description: 'Signup bonus'
    })

    if (ledgerError) {
      console.error('Error inserting initial tokens to ledger:', ledgerError)
      // Even if this fails, we created the user, so we log it but don't fail the whole webhook
    }

    console.log(`[Webhook] User ${id} created in Supabase successfully with initial token grant.`)
  }

  return new Response('', { status: 200 })
}
