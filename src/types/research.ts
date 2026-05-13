// src/types/research.ts
export interface DataPoint {
  label: string;
  value: number | string; // Allow string for more flexibility
}

export interface ReportData {
  title: string;
  source: string;
  dateGenerated: string;
  data: DataPoint[];
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
}
