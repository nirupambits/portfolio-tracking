export interface PortfolioItem {
  id: string;
  holdingName: string;
  ticker: string;
  shares: number;
  currentValue: number;
}

export interface InsightData {
  ticker: string;
  analystRatings: string;
  targetPrice: string;
  topHeadline: string;
  sentimentScore: number;
  recommendation: 'Buy' | 'Hold' | 'Sell' | 'Trim';
  reasoning: string;
}
