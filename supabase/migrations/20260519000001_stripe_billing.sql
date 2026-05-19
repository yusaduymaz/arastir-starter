-- Migration: Add Stripe billing columns to users table
-- Phase 19: SaaS Stripe Billing

-- 1. Add Stripe-related columns to the users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

-- 2. Create index for fast Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- 3. Update the tier check constraint to include 'pro' and 'enterprise'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
ALTER TABLE users ADD CONSTRAINT users_tier_check
  CHECK (tier IN ('free', 'starter', 'pro', 'agency', 'enterprise'));

-- Monthly token grants per tier (applied by webhook on subscription renewal):
-- free:       5 tokens/month (manual grant or webhook)
-- starter:   30 tokens/month
-- pro:       100 tokens/month
-- agency:    500 tokens/month
-- enterprise: custom (admin-managed)
