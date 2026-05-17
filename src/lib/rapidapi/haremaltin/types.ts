export interface GoldPrice {
  name: string;
  buying: number;
  selling: number;
  change: string;
  time: string;
}

export interface HaremAltinResponse {
  success: boolean;
  result: GoldPrice[];
  message?: string;
}
