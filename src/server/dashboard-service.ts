import { prisma } from "@/lib/prisma";
import { toProductCardModel } from "@/server/view-models";

export async function getDashboardData(userId: string) {
  const [products, watchlists, alerts] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      include: {
        store: true,
        watchlistItems: true,
        priceHistory: {
          orderBy: { checkedAt: "asc" },
          take: 30,
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.alertRule.count({
      where: { userId, isEnabled: true },
    }),
  ]);

  const normalizedProducts = products.map(toProductCardModel);

  return {
    summary: {
      tracked: normalizedProducts.length,
      activeAlerts: alerts,
      watchlistCount: watchlists.length,
      hotDeals: normalizedProducts.filter((product) => product.dealScoreBand === "HOT_DEAL" || product.dealScoreBand === "BEST_PRICE").length,
    },
    products: normalizedProducts,
    watchlists,
  };
}
