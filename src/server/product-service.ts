import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateDealScore } from "@/lib/product-analytics";
import { scrapeProductUrl } from "@/server/scraper";
import { resolveStoreByUrl } from "@/server/store-resolver";
import { sendTelegramAlert } from "@/server/telegram";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return null;
  return Number(value);
}

async function recordTelegramNotification(input: {
  userId: string;
  title: string;
  body: string;
  wasSent: boolean;
}) {
  await prisma.notificationLog.create({
    data: {
      userId: input.userId,
      channel: "telegram",
      title: input.title,
      body: input.body,
      wasSent: input.wasSent,
      sentAt: input.wasSent ? new Date() : null,
    },
  });
}

async function maybeSendTelegramNotifications(input: {
  user: {
    id: string;
    telegramBotToken: string | null;
    telegramEnabled: boolean;
    telegramChatId: string | null;
  };
  product: {
    id: string;
    title: string;
    sourceUrl: string;
    targetPrice: Prisma.Decimal | number | null;
  };
  previousPrice: number | null;
  currentPrice: number;
}) {
  if (!input.user.telegramEnabled) {
    return;
  }

  const targetPrice = toNumber(input.product.targetPrice);
  const priceDropped = input.previousPrice != null && input.currentPrice < input.previousPrice;
  const targetReached = targetPrice != null && input.currentPrice <= targetPrice;

  if (!priceDropped && !targetReached) {
    return;
  }

  if (priceDropped) {
    const previousPrice = input.previousPrice as number;
    const dropAmount = previousPrice - input.currentPrice;
    const response = await sendTelegramAlert({
      title: `ราคาลดลง: ${input.product.title}`,
      message: `ราคาล่าสุด ${input.currentPrice.toLocaleString("th-TH")} บาท ลดลงจาก ${previousPrice.toLocaleString("th-TH")} บาท (${dropAmount.toLocaleString("th-TH")} บาท)`,
      url: input.product.sourceUrl,
      botToken: input.user.telegramBotToken,
      chatId: input.user.telegramChatId,
    });

    await recordTelegramNotification({
      userId: input.user.id,
      title: `ราคาลดลง: ${input.product.title}`,
      body: response.reason,
      wasSent: response.ok,
    });
  }

  if (targetReached && targetPrice != null) {
    const response = await sendTelegramAlert({
      title: `ถึงราคาเป้าหมาย: ${input.product.title}`,
      message: `ราคาปัจจุบัน ${input.currentPrice.toLocaleString("th-TH")} บาท ต่ำกว่าหรือเท่ากับราคาเป้าหมาย ${targetPrice.toLocaleString("th-TH")} บาท`,
      url: input.product.sourceUrl,
      botToken: input.user.telegramBotToken,
      chatId: input.user.telegramChatId,
    });

    await recordTelegramNotification({
      userId: input.user.id,
      title: `ถึงราคาเป้าหมาย: ${input.product.title}`,
      body: response.reason,
      wasSent: response.ok,
    });
  }
}

export async function runProductCheck(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { user: true, store: true, alertRules: true },
  });

  if (!product) {
    throw new Error("ไม่พบสินค้า");
  }

  const startedAt = Date.now();

  try {
    const scraped = await scrapeProductUrl(product.sourceUrl);
    const historyRows = await prisma.priceHistory.findMany({
      where: { productId: product.id },
      orderBy: { checkedAt: "desc" },
      take: 30,
    });

    const previousPrice = historyRows[0] ? Number(historyRows[0].price) : null;
    const prices = [scraped.currentPrice, ...historyRows.map((row) => Number(row.price))];
    const average30d = prices.reduce((sum, value) => sum + value, 0) / prices.length;
    const lowest30d = Math.min(...prices);
    const deal = calculateDealScore({
      currentPrice: scraped.currentPrice,
      average30d,
      lowest30d,
    });

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        title: scraped.title,
        imageUrl: scraped.imageUrl,
        currentPrice: scraped.currentPrice,
        status: scraped.status,
        confidenceLevel: scraped.confidenceLevel,
        confidenceReason: scraped.confidenceReason,
        dealScoreBand: deal.band,
        dealScoreValue: deal.score,
        lowest30d,
        average30d,
        lastCheckedAt: new Date(),
      },
    });

    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: scraped.currentPrice,
      },
    });

    await prisma.priceSnapshot.create({
      data: {
        productId: product.id,
        price: scraped.currentPrice,
        status: scraped.status,
        confidenceLevel: scraped.confidenceLevel,
        rawPayload: scraped.rawPayload,
      },
    });

    await prisma.scrapeLog.create({
      data: {
        storeId: product.storeId,
        productUrl: product.sourceUrl,
        success: true,
        message: "ตรวจสอบราคาสำเร็จ",
        scrapedPrice: scraped.currentPrice,
        responseTimeMs: Date.now() - startedAt,
      },
    });

    await maybeSendTelegramNotifications({
      user: {
        id: product.user.id,
        telegramBotToken: product.user.telegramBotToken,
        telegramEnabled: product.user.telegramEnabled,
        telegramChatId: product.user.telegramChatId,
      },
      product: {
        id: updated.id,
        title: updated.title,
        sourceUrl: updated.sourceUrl,
        targetPrice: updated.targetPrice,
      },
      previousPrice,
      currentPrice: scraped.currentPrice,
    });

    return updated;
  } catch (error) {
    await prisma.scrapeLog.create({
      data: {
        storeId: product.storeId,
        productUrl: product.sourceUrl,
        success: false,
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดระหว่างดึงราคา",
        responseTimeMs: Date.now() - startedAt,
      },
    });

    throw error;
  }
}

export async function createOrUpdateTrackedProduct(input: {
  userId: string;
  sourceUrl: string;
  targetPrice: number;
}) {
  const store = resolveStoreByUrl(input.sourceUrl);

  if (!store) {
    throw new Error("ลิงก์นี้ยังไม่รองรับในระบบตอนนี้");
  }

  const dbStore = await prisma.store.findUnique({
    where: { key: store.key },
  });

  if (!dbStore) {
    throw new Error("ไม่พบการตั้งค่าร้านค้าในฐานข้อมูล");
  }

  const scraped = await scrapeProductUrl(input.sourceUrl);
  const deal = calculateDealScore({
    currentPrice: scraped.currentPrice,
    average30d: scraped.currentPrice,
    lowest30d: scraped.currentPrice,
  });

  const existing = await prisma.product.findUnique({
    where: { sourceUrl: input.sourceUrl },
  });

  const product = existing
    ? await prisma.product.update({
        where: { id: existing.id },
        data: {
          userId: input.userId,
          storeId: dbStore.id,
          title: scraped.title,
          imageUrl: scraped.imageUrl,
          currentPrice: scraped.currentPrice,
          targetPrice: input.targetPrice,
          status: scraped.status,
          confidenceLevel: scraped.confidenceLevel,
          confidenceReason: scraped.confidenceReason,
          dealScoreBand: deal.band,
          dealScoreValue: deal.score,
          lowest30d: scraped.currentPrice,
          average30d: scraped.currentPrice,
          lastCheckedAt: new Date(),
        },
      })
    : await prisma.product.create({
        data: {
          userId: input.userId,
          storeId: dbStore.id,
          title: scraped.title,
          slug: `${slugify(scraped.title)}-${Math.random().toString(36).slice(2, 8)}`,
          imageUrl: scraped.imageUrl,
          sourceUrl: input.sourceUrl,
          currentPrice: scraped.currentPrice,
          targetPrice: input.targetPrice,
          status: scraped.status,
          confidenceLevel: scraped.confidenceLevel,
          confidenceReason: scraped.confidenceReason,
          dealScoreBand: deal.band,
          dealScoreValue: deal.score,
          lowest30d: scraped.currentPrice,
          average30d: scraped.currentPrice,
          lastCheckedAt: new Date(),
        },
      });

  await prisma.priceHistory.create({
    data: {
      productId: product.id,
      price: scraped.currentPrice,
    },
  });

  await prisma.priceSnapshot.create({
    data: {
      productId: product.id,
      price: scraped.currentPrice,
      status: scraped.status,
      confidenceLevel: scraped.confidenceLevel,
      rawPayload: scraped.rawPayload,
    },
  });

  await prisma.alertRule.upsert({
    where: {
      userId_productId: {
        userId: input.userId,
        productId: product.id,
      },
    },
    update: {
      targetPrice: input.targetPrice,
      isEnabled: true,
    },
    create: {
      userId: input.userId,
      productId: product.id,
      targetPrice: input.targetPrice,
      isEnabled: true,
    },
  });

  await prisma.scrapeLog.create({
    data: {
      storeId: dbStore.id,
      productUrl: product.sourceUrl,
      success: true,
      message: existing ? "อัปเดตสินค้าที่ติดตามจากการดึงข้อมูลจริงแล้ว" : "สร้างสินค้าที่ติดตามจากการดึงข้อมูลจริงแล้ว",
      scrapedPrice: scraped.currentPrice,
      responseTimeMs: 0,
    },
  });

  return product;
}

export async function runAllProductChecks() {
  const products = await prisma.product.findMany({
    select: { id: true },
  });

  for (const product of products) {
    try {
      await runProductCheck(product.id);
    } catch (error) {
      console.error("Failed to check product", product.id, error);
    }
  }
}
