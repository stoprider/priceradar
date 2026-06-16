import { products, scrapeLogs, watchlists } from "@/lib/mock-data";

export function getDashboardSummary() {
  const tracked = products.length;
  const activeAlerts = products.filter((product) => product.currentPrice <= product.targetPrice).length;
  const watchlistCount = watchlists.length;
  const hotDeals = products.filter((product) => product.dealScoreBand === "HOT_DEAL" || product.dealScoreBand === "BEST_PRICE").length;

  return { tracked, activeAlerts, watchlistCount, hotDeals };
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getWatchlistById(id: string) {
  return watchlists.find((watchlist) => watchlist.id === id);
}

export function getWatchlistByPublicId(publicId: string) {
  return watchlists.find((watchlist) => watchlist.publicId === publicId);
}

export function getProductsForWatchlist(productIds: string[]) {
  return products.filter((product) => productIds.includes(product.id));
}

export function getRecentLogs() {
  return scrapeLogs;
}
