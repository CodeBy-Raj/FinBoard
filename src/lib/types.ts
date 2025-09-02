export interface StockData {
  ticker: string;
  price: number;
  timestamp: string;
  change: number;
  changePercent: number;
  volume: string;
}

export interface StockHistory {
  [ticker: string]: { x: string; y: number }[];
}
