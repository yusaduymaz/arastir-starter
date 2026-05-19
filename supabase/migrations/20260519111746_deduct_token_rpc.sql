-- Migration: Create deduct_token_if_sufficient RPC
-- Phase 20: Production Hardening
-- Prevents race conditions during token deduction by using an advisory lock.

CREATE OR REPLACE FUNCTION deduct_token_if_sufficient(
  p_user_id TEXT,
  p_amount INTEGER,
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Acquire an exclusive transaction-level advisory lock for this user.
  -- This forces concurrent requests for the same user to execute sequentially.
  -- hashtext generates a stable integer from the user_id string.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id));

  -- Calculate the current balance
  SELECT COALESCE(SUM(amount), 0) INTO v_current_balance
  FROM token_ledger
  WHERE user_id = p_user_id;

  -- Check if the user has enough tokens
  IF v_current_balance >= p_amount THEN
    -- Deduct the token
    INSERT INTO token_ledger (user_id, amount, transaction_type, description)
    VALUES (p_user_id, -p_amount, 'usage', p_description);
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
