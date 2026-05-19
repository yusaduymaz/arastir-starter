-- Migration: Remove tokens_balance column from users table
-- Phase 19: Consolidate to ledger-only balance tracking
--
-- users.tokens_balance was a denormalized cache of user_balances view (SUM of token_ledger).
-- All reads now use user_balances view; all writes use token_ledger.
-- This eliminates the dual-tracking drift between the column and the view.

ALTER TABLE users DROP COLUMN IF EXISTS tokens_balance;
