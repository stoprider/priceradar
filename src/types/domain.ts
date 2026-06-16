export type DealScoreBand = "HOT_DEAL" | "BEST_PRICE" | "GOOD_DEAL" | "NORMAL" | "WAIT";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "FAILED";
export type ProductStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export type Product = {
  id: string;
  title: string;
  store: string;
  storeKey: string;
  category: string;
  imageUrl: string;
  sourceUrl: string;
  currentPrice: number;
  targetPrice: number;
  lowest30d: number;
  average30d: number;
  lastCheckedAt: string;
  status: ProductStatus;
  confidenceLevel: ConfidenceLevel;
  confidenceLabel: string;
  confidenceReason: string;
  dealScoreBand: DealScoreBand;
  priceChangePercent: number;
  watchlistIds: string[];
  timeline: Array<{ date: string; price: number }>;
};

export type Watchlist = {
  id: string;
  name: string;
  description: string;
  publicId: string;
  itemIds: string[];
  isPublic: boolean;
};

export type ScrapeLog = {
  id: string;
  store: string;
  url: string;
  success: boolean;
  message: string;
  responseTimeMs: number;
  createdAt: string;
};
