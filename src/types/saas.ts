export type Tier = 'free' | 'starter' | 'pro' | 'agency' | 'enterprise';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';

export interface UserProfile {
  id: string;
  email: string;
  tier: Tier;
  balance: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status: SubscriptionStatus;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export const PLAN_CONFIG = {
  free:       { label: 'Ücretsiz',   tokens: 5,   price_try: 0,    price_id: null },
  starter:    { label: 'Starter',    tokens: 30,  price_try: 299,  price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER },
  pro:        { label: 'Pro',        tokens: 100, price_try: 799,  price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO },
  agency:     { label: 'Agency',     tokens: 500, price_try: 2499, price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY },
  enterprise: { label: 'Enterprise', tokens: -1,  price_try: -1,   price_id: null },
} as const satisfies Record<Tier, { label: string; tokens: number; price_try: number; price_id: string | null | undefined }>;

export interface TokenLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'grant' | 'purchase' | 'usage' | 'refund';
  description?: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  external_api_keys: any;
  created_at: string;
  updated_at: string;
}
