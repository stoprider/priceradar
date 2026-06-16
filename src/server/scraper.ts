import * as cheerio from "cheerio";
import { resolveStoreByUrl, type StoreConfig } from "@/server/store-resolver";

export type ScrapeResult = {
  title: string;
  imageUrl: string | null;
  currentPrice: number;
  status: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW" | "FAILED";
  confidenceReason: string;
  rawPayload: string;
};

type ScraperAdapter = (input: { productUrl: string; store: StoreConfig }) => Promise<ScrapeResult>;

function readFirstContent($: cheerio.CheerioAPI, selectors: readonly string[]) {
  for (const selector of selectors) {
    const value =
      $(selector).attr("content")?.trim() ||
      $(selector).first().text().trim() ||
      $(selector).attr("src")?.trim() ||
      null;

    if (value) {
      return value;
    }
  }

  return null;
}

function parsePriceFromText(input: string) {
  const cleaned = input.replace(/,/g, "");
  const matches = cleaned.match(/(\d{1,3}(?:\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g);

  if (!matches?.length) {
    return null;
  }

  const numeric = matches
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  return numeric[0] ?? null;
}

function extractJsonLdPrice($: cheerio.CheerioAPI) {
  const scripts = $("script[type='application/ld+json']");

  for (const node of scripts.toArray()) {
    try {
      const raw = $(node).html();
      if (!raw) continue;

      const payload = JSON.parse(raw) as Record<string, unknown> | Array<Record<string, unknown>>;
      const blocks = Array.isArray(payload) ? payload : [payload];

      for (const block of blocks) {
        const offer = (block.offers as Record<string, unknown> | undefined) ?? block;
        const price = offer.price;

        if (typeof price === "string" || typeof price === "number") {
          const numeric = Number(price);
          if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchDocument(productUrl: string) {
  const response = await fetch(productUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "accept-language": "th-TH,th;q=0.9,en;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงข้อมูลหน้าสินค้าได้: ${response.status}`);
  }

  const html = await response.text();
  return { response, html, $: cheerio.load(html) };
}

const httpHtmlScraper: ScraperAdapter = async ({ productUrl, store }) => {
  if (!store.selectors) {
    throw new Error(`Store ${store.name} is missing selector configuration`);
  }

  const { response, html, $ } = await fetchDocument(productUrl);
  const title = readFirstContent($, store.selectors.title) || $("title").text().trim();
  const imageUrl = readFirstContent($, store.selectors.image);

  const selectorPriceText = readFirstContent($, store.selectors.price);
  const selectorPrice = selectorPriceText ? parsePriceFromText(selectorPriceText) : null;
  const jsonLdPrice = extractJsonLdPrice($);
  const metaPrice = parsePriceFromText($("meta[property='product:price:amount']").attr("content") || "");
  const price = selectorPrice ?? jsonLdPrice ?? metaPrice;

  if (!title || !price) {
    throw new Error("ไม่สามารถดึงชื่อสินค้าหรือราคาจากหน้าเว็บได้อย่างน่าเชื่อถือ");
  }

  const lower = html.toLowerCase();
  const status =
    lower.includes("out of stock") || lower.includes("สินค้าหมด")
      ? "OUT_OF_STOCK"
      : lower.includes("in stock") || lower.includes("พร้อมส่ง") || lower.includes("มีสินค้า")
        ? "IN_STOCK"
        : "UNKNOWN";

  const confidenceLevel =
    selectorPrice && jsonLdPrice ? "HIGH" : selectorPrice || jsonLdPrice || metaPrice ? "MEDIUM" : "LOW";

  const confidenceReason =
    confidenceLevel === "HIGH"
      ? "ตรวจพบราคาจากหลายแหล่งข้อมูลในหน้าเดียวกัน"
      : confidenceLevel === "MEDIUM"
        ? "ตรวจพบราคาจากแหล่งข้อมูลหลักในหน้าเว็บ"
        : "ดึงราคาด้วยวิธีสำรองที่มีความน่าเชื่อถือน้อยกว่า";

  return {
    title,
    imageUrl,
    currentPrice: price,
    status,
    confidenceLevel,
    confidenceReason,
    rawPayload: JSON.stringify({
      scraperEngine: store.scraperEngine,
      store: store.key,
      title,
      selectorPrice,
      jsonLdPrice,
      metaPrice,
      finalUrl: response.url,
    }),
  };
};

const browserHtmlScraper: ScraperAdapter = async ({ store }) => {
  throw new Error(
    `${store.name} ยังไม่เปิดใช้งานในระบบตอนนี้: ต้องเพิ่ม browser scraper, anti-bot handling, และ parser เฉพาะร้านก่อน`,
  );
};

const apiScraper: ScraperAdapter = async ({ store }) => {
  throw new Error(`${store.name} ยังไม่มี API scraper ที่เปิดใช้งาน`);
};

const SCRAPER_REGISTRY: Record<StoreConfig["scraperEngine"], ScraperAdapter> = {
  "http-html": httpHtmlScraper,
  "browser-html": browserHtmlScraper,
  api: apiScraper,
};

export async function scrapeProductUrl(productUrl: string): Promise<ScrapeResult> {
  const store = resolveStoreByUrl(productUrl);

  if (!store) {
    throw new Error("ลิงก์ร้านค้านี้ยังไม่รู้จักในระบบ");
  }

  if (!store.isEnabled) {
    throw new Error(store.supportNotes || `${store.name} ยังไม่เปิดใช้งาน`);
  }

  const adapter = SCRAPER_REGISTRY[store.scraperEngine];

  if (!adapter) {
    throw new Error(`ยังไม่มี scraper engine สำหรับ ${store.name}`);
  }

  return adapter({ productUrl, store });
}
