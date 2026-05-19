-- Migration: Convert users.tier to ENUM for selectable tiers
-- Rationale: Supabase UI shows ENUM columns as a dropdown ("options"), while TEXT+CHECK may not.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_tier' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_tier AS ENUM ('free', 'starter', 'pro', 'agency', 'enterprise');
  END IF;
END $$;

-- Normalize legacy tier value(s) before casting (legacy: 'growth' -> 'pro')
UPDATE public.users
SET tier = 'pro'
WHERE tier::text = 'growth';

-- Remove legacy CHECK constraint (ENUM enforces the allowed values)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_tier_check;

-- Convert users.tier from TEXT to ENUM
ALTER TABLE public.users
  ALTER COLUMN tier DROP DEFAULT,
  ALTER COLUMN tier TYPE public.user_tier USING tier::public.user_tier,
  ALTER COLUMN tier SET DEFAULT 'free'::public.user_tier,
  ALTER COLUMN tier SET NOT NULL;
