export type Tier = 'free' | 'starter' | 'growth' | 'agency';

export interface UserProfile {
  id: string;
  email: string;
  tier: Tier;
  tokens_balance: number; // View computed
  created_at: string;
}

export interface TokenLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'grant' | 'purchase' | 'usage' | 'refund';
  description?: string;
  created_at: string;
}
