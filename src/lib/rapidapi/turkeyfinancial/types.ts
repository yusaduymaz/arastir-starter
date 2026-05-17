export interface Bist100Stock {
  code: string;
  last: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  time: string;
}

export type TurkeyFinancialResponse = Bist100Stock[];
