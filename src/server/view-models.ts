import type { Product as PrismaProduct, Store, PriceHistory, WatchlistItem } from "@prisma/client";

type ProductWithRelations = PrismaProduct & {
  store: Store;
  watchlistItems: WatchlistItem[];
  priceHistory: PriceHistory[];
};

export function toProductCardModel(product: ProductWithRelations) {
  return {
    id: product.id,
    title: product.title,
    store: product.store.name,
    storeKey: product.store.key,
    category: "Tracked product",
    imageUrl: product.imageUrl || "https://placehold.co/1200x800/e2e8f0/0f172a?text=PriceRadar+TH",
    sourceUrl: product.sourceUrl,
    currentPrice: Number(product.currentPrice),
    targetPrice: Number(product.targetPrice || product.currentPrice),
    lowest30d: Number(product.lowest30d || product.currentPrice),
    average30d: Number(product.average30d || product.currentPrice),
    lastCheckedAt: (product.lastCheckedAt || product.updatedAt).toISOString(),
    status: product.status,
    confidenceLevel: product.confidenceLevel,
    confidenceLabel: product.confidenceLevel,
    confidenceReason: product.confidenceReason || "",
    dealScoreBand: product.dealScoreBand,
    priceChangePercent:
      product.average30d && Number(product.average30d) > 0
        ? ((Number(product.currentPrice) - Number(product.average30d)) / Number(product.average30d)) * 100
        : 0,
    watchlistIds: product.watchlistItems.map((item) => item.watchlistId),
    timeline: product.priceHistory.map((entry) => ({
      date: entry.checkedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      price: Number(entry.price),
    })),
  };
}
