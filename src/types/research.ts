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
  investmentRecommendation?: {
    action: 'AL' | 'TUT' | 'SAT';
    score: number;        // 1-10
    confidence: 'düşük' | 'orta' | 'yüksek';
    shortTermOutlook: string;
    longTermOutlook: string;
    keyFactors: string[];
  };
  newsArticles?: Array<{
    title: string;
    source: string;
    date: string;
    sentiment?: string;
    content?: string;
  }>;
  kapDisclosures?: Array<{
    title: string;
    date: string;
    summary?: string;
  }>;
  marketData?: {
    price?: string | number;
    changePercent?: string | number;
    volume?: string | number;
    marketCap?: string | number;
    peRatio?: string | number;
    eps?: string | number;
    week52High?: string | number;
    week52Low?: string | number;
    sector?: string;
  };
}

// Agent log entry for real-time pipeline tracking (legacy or UI specific)
export interface AgentLogEntry {
  agent: 'orchestrator' | 'search' | 'news' | 'market' | 'macro' | 'analyst' | 'writer';
  status: 'started' | 'running' | 'completed' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
  duration_ms?: number;
  details?: string;
}

// For Supabase table structure
export interface ResearchSession {
    id: string;
    user_id: string;
    query: string;
    extracted_ticker?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    current_step?: string;
    result_url?: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
    agent_logs?: AgentLogEntry[];
}

export interface AgentRun {
    id: string;
    session_id: string;
    agent_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    input_data?: any;
    output_data?: any;
    error_message?: string;
    started_at?: string;
    completed_at?: string;
    created_at: string;
}

export interface AgentLog {
    id: string;
    run_id: string;
    log_level: string;
    message: string;
    metadata?: any;
    created_at: string;
}
