import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo12345", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@priceradar.th" },
    update: {
      passwordHash,
      telegramEnabled: false,
    },
    create: {
      name: "Demo User",
      email: "demo@priceradar.th",
      passwordHash,
      telegramChatId: "123456789",
      telegramEnabled: false,
    },
  });

  const stores = await Promise.all(
    [
      { key: "homepro", name: "HomePro", baseUrl: "https://www.homepro.co.th" },
      { key: "powerbuy", name: "Power Buy", baseUrl: "https://www.powerbuy.co.th" },
      { key: "advice", name: "Advice", baseUrl: "https://www.advice.co.th" },
      { key: "jib", name: "JIB", baseUrl: "https://www.jib.co.th" },
    ].map((store) =>
      prisma.store.upsert({
        where: { key: store.key },
        update: store,
        create: store,
      }),
    ),
  );

  const monitor = await prisma.product.upsert({
    where: { sourceUrl: "https://www.powerbuy.co.th/th/product/lg-ultragear-27gr75q-b-gaming-monitor" },
    update: {},
    create: {
      userId: user.id,
      storeId: stores[1].id,
      title: 'LG UltraGear 27" QHD Gaming Monitor',
      slug: "lg-ultragear-27gr75q-b",
      sourceUrl: "https://www.powerbuy.co.th/th/product/lg-ultragear-27gr75q-b-gaming-monitor",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
      currentPrice: 8990,
      targetPrice: 8500,
      status: "IN_STOCK",
      confidenceLevel: "HIGH",
      confidenceReason: "Structured price block detected",
      dealScoreBand: "GOOD_DEAL",
      dealScoreValue: 78,
      lowest30d: 8590,
      average30d: 9690,
      lastCheckedAt: new Date(),
    },
  });

  await prisma.priceHistory.deleteMany({ where: { productId: monitor.id } });
  await prisma.priceSnapshot.deleteMany({ where: { productId: monitor.id } });
  await prisma.scrapeLog.deleteMany({ where: { productUrl: monitor.sourceUrl } });

  await prisma.priceHistory.createMany({
    data: [
      { productId: monitor.id, price: 10490, checkedAt: new Date("2026-05-15T09:00:00Z") },
      { productId: monitor.id, price: 9790, checkedAt: new Date("2026-05-22T09:00:00Z") },
      { productId: monitor.id, price: 9290, checkedAt: new Date("2026-05-29T09:00:00Z") },
      { productId: monitor.id, price: 8990, checkedAt: new Date("2026-06-10T09:00:00Z") },
    ],
  });

  await prisma.priceSnapshot.createMany({
    data: [
      {
        productId: monitor.id,
        price: 8990,
        status: "IN_STOCK",
        confidenceLevel: "HIGH",
        rawPayload: JSON.stringify({ source: "seed", title: monitor.title }),
      },
    ],
  });

  const watchlist = await prisma.watchlist.upsert({
    where: { publicId: "battle-station-upgrades" },
    update: {},
    create: {
      userId: user.id,
      name: "Battle Station Upgrades",
      description: "Monitor, SSD, and networking gear for the next desk refresh.",
      publicId: "battle-station-upgrades",
      isPublic: true,
    },
  });

  await prisma.watchlistItem.upsert({
    where: {
      watchlistId_productId: {
        watchlistId: watchlist.id,
        productId: monitor.id,
      },
    },
    update: {},
    create: {
      watchlistId: watchlist.id,
      productId: monitor.id,
      note: "Priority upgrade for Q3",
    },
  });

  await prisma.scrapeLog.createMany({
    data: [
      {
        storeId: stores[1].id,
        productUrl: monitor.sourceUrl,
        success: true,
        message: "Seeded scrape log",
        scrapedPrice: 8990,
        responseTimeMs: 900,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
