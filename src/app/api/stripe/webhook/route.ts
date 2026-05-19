import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { PLAN_CONFIG, Tier } from '@/types/saas';

function getTierFromPriceId(priceId: string): Tier {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER) return 'starter';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY) return 'agency';
  return 'free';
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerk_user_id;
      if (!clerkUserId || session.mode !== 'subscription') break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);
      const tokens = PLAN_CONFIG[tier].tokens;

      await supabase
        .from('users')
        .update({
          tier,
          subscription_status: 'active',
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('id', clerkUserId);

      await supabase.from('token_ledger').insert({
        user_id: clerkUserId,
        amount: tokens,
        transaction_type: 'grant',
        description: `${tier} plan aktivasyonu`,
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const clerkUserId = subscription.metadata?.clerk_user_id;
      if (!clerkUserId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);

      await supabase
        .from('users')
        .update({
          tier,
          subscription_status: subscription.status as string,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('id', clerkUserId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const clerkUserId = subscription.metadata?.clerk_user_id;
      if (!clerkUserId) break;

      await supabase
        .from('users')
        .update({
          tier: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          current_period_end: null,
          cancel_at_period_end: false,
        })
        .eq('id', clerkUserId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      await supabase
        .from('users')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Only recover from past_due — don't interfere with normal billing cycles
      const { data: user } = await supabase
        .from('users')
        .select('id, tier, subscription_status')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user?.subscription_status === 'past_due') {
        const tokens = PLAN_CONFIG[user.tier as Tier]?.tokens ?? 5;
        await supabase
          .from('users')
          .update({ subscription_status: 'active' })
          .eq('stripe_customer_id', customerId);

        await supabase.from('token_ledger').insert({
          user_id: user.id,
          amount: tokens,
          transaction_type: 'grant',
          description: `${user.tier} plan yenileme (gecikmiş ödeme tahsil edildi)`,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
