// src/types/research.ts
export interface DataPoint {
  label: string;
  value: number | string; // Allow string for more flexibility
}

export interface ReportData {
  title: string;
  source: string;
  dateGenerated: string;
  executiveSummary?: string;
  risks?: string;
  opportunities?: string;
  macroContext?: string;
  // Fallback or extra data
  data?: DataPoint[];
}

// Agent log entry for real-time pipeline tracking
export interface AgentLogEntry {
  agent: 'orchestrator' | 'search' | 'news' | 'market' | 'macro' | 'analyst' | 'writer';
  status: 'started' | 'running' | 'completed' | 'failed';
  message: string;
  timestamp: string;
  duration_ms?: number;
  details?: string;
}

// For Supabase table structure
export interface ResearchSession {
    id: string;
    created_at: string;
    user_id: string;
    query: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result_path: string | null;
    error_message: string | null;
    // Extended fields
    progress?: number;
    current_step?: string;
    extracted_ticker?: string;
    agent_logs?: AgentLogEntry[];
    kap_data?: any;
    news_data?: any;
    market_data?: any;
    macro_data?: any;
    synthesis_data?: any;
}
