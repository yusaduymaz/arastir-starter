export type Tier = 'free' | 'starter' | 'growth' | 'agency';

export interface UserProfile {
  id: string;
  email: string;
  tier: Tier;
  balance: number; // View computed
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

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'dark' | 'light' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
  };
  report_preferences: {
    language: 'tr' | 'en';
    default_format: 'pdf' | 'pptx' | 'both';
  };
  created_at: string;
  updated_at: string;
}
