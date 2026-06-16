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

type PriceCandidate = {
  value: number;
  score: number;
  source: string;
};

function readFirstContent($: cheerio.CheerioAPI, selectors: readonly string[]) {
  for (const selector of selectors) {
    const element = $(selector).first();
    const value =
      element.attr("content")?.trim() ||
      element.attr("src")?.trim() ||
      element.attr("data-price")?.trim() ||
      element.text().trim() ||
      null;

    if (value) {
      return value;
    }
  }

  return null;
}

function parsePriceFromText(input: string) {
  const cleaned = input.replace(/,/g, "").replace(/\s+/g, " ");
  const matches = cleaned.match(/(\d{1,3}(?:\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g);

  if (!matches?.length) {
    return null;
  }

  const numeric = matches
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0 && value < 100_000_000)
    .sort((a, b) => a - b);

  return numeric[0] ?? null;
}

function normalizeTitle(input: string) {
  return input
    .replace(/\s+/g, " ")
    .replace(/\s*(?:-|\|)\s*(Shopee|Lazada).*/i, "")
    .trim();
}

function addCandidate(
  map: Map<number, PriceCandidate>,
  value: number | null | undefined,
  score: number,
  source: string,
) {
  if (!value || !Number.isFinite(value) || value <= 0) {
    return;
  }

  const rounded = Number(value.toFixed(2));
  const existing = map.get(rounded);

  if (existing) {
    existing.score += score;
    existing.source = `${existing.source},${source}`;
    return;
  }

  map.set(rounded, { value: rounded, score, source });
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
        const offers = Array.isArray(block.offers)
          ? (block.offers as Array<Record<string, unknown>>)
          : [((block.offers as Record<string, unknown> | undefined) ?? block) as Record<string, unknown>];

        for (const offer of offers) {
          const price = offer.price;
          if (typeof price === "string" || typeof price === "number") {
            const numeric = Number(price);
            if (Number.isFinite(numeric) && numeric > 0) {
              return numeric;
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractKeywordPrices(html: string) {
  const normalized = html.replace(/&quot;/g, '"');
  const candidates: number[] = [];
  const patterns = [
    /"(?:price|salePrice|currentPrice|specialPrice|finalPrice|priceMin|priceMax|discountPrice|pdt_price)"\s*:\s*"?(\d+(?:\.\d{1,2})?)"?/gi,
    /(?:price|salePrice|currentPrice|specialPrice|finalPrice|discountPrice|amount)\D{0,40}(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi,
    /(?:฿|THB)\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi,
  ];

  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const value = parsePriceFromText(match[1] || "");
      if (value) {
        candidates.push(value);
      }
    }
  }

  return candidates;
}

function chooseBestPrice(candidates: Iterable<PriceCandidate>) {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.value - b.value;
  })[0] ?? null;
}

function detectPageProblem(store: StoreConfig, html: string, title: string) {
  const lower = html.toLowerCase();
  const normalizedTitle = title.toLowerCase();

  if (
    store.blockDetectors?.some((keyword) => lower.includes(keyword.toLowerCase()) || normalizedTitle.includes(keyword.toLowerCase()))
  ) {
    throw new Error(`${store.name} ป้องกันการดึงข้อมูลอัตโนมัติจากลิงก์นี้อยู่ จึงยังไม่สามารถติดตามสินค้าได้ในตอนนี้`);
  }

  if (
    store.unavailableDetectors?.some(
      (keyword) => lower.includes(keyword.toLowerCase()) || normalizedTitle.includes(keyword.toLowerCase()),
    )
  ) {
    throw new Error(`ลิงก์ ${store.name} นี้ไม่พบสินค้าแล้ว หรือหน้าสินค้าไม่พร้อมใช้งาน`);
  }
}

async function fetchDocument(productUrl: string) {
  const response = await fetch(productUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "accept-language": "th-TH,th;q=0.9,en;q=0.8",
    },
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`ไม่สามารถดึงข้อมูลหน้าสินค้าได้: ${response.status}`);
  }

  const html = await response.text();
  return { response, html, $: cheerio.load(html) };
}

function inferStockStatus(html: string) {
  const lower = html.toLowerCase();

  if (lower.includes("out of stock") || lower.includes("สินค้าหมด")) {
    return "OUT_OF_STOCK" as const;
  }

  if (lower.includes("in stock") || lower.includes("พร้อมส่ง") || lower.includes("มีสินค้า")) {
    return "IN_STOCK" as const;
  }

  return "UNKNOWN" as const;
}

const httpHtmlScraper: ScraperAdapter = async ({ productUrl, store }) => {
  if (!store.selectors) {
    throw new Error(`Store ${store.name} is missing selector configuration`);
  }

  const { response, html, $ } = await fetchDocument(productUrl);
  const rawTitle = readFirstContent($, store.selectors.title) || $("title").text().trim();
  const title = normalizeTitle(rawTitle);

  detectPageProblem(store, html, title);

  const imageUrl = readFirstContent($, store.selectors.image);
  const candidates = new Map<number, PriceCandidate>();

  const selectorPriceText = readFirstContent($, store.selectors.price);
  addCandidate(candidates, selectorPriceText ? parsePriceFromText(selectorPriceText) : null, 5, "selector-primary");

  for (const selector of store.selectors.price) {
    const values = $(selector)
      .toArray()
      .slice(0, 10)
      .map((node) => {
        const element = $(node);
        return (
          element.attr("content") ||
          element.attr("data-price") ||
          element.attr("aria-label") ||
          element.text() ||
          ""
        );
      });

    for (const value of values) {
      addCandidate(candidates, parsePriceFromText(value), 3, `selector:${selector}`);
    }
  }

  const jsonLdPrice = extractJsonLdPrice($);
  addCandidate(candidates, jsonLdPrice, 5, "jsonld");

  const metaPrice = parsePriceFromText($("meta[property='product:price:amount']").attr("content") || "");
  addCandidate(candidates, metaPrice, 5, "meta-price");

  for (const value of extractKeywordPrices(html).slice(0, 50)) {
    addCandidate(candidates, value, 1, "script-keyword");
  }

  const bestPrice = chooseBestPrice(candidates.values());

  if (!title || !bestPrice) {
    throw new Error(`ไม่สามารถดึงชื่อสินค้า หรือราคาจากหน้า ${store.name} นี้ได้อย่างน่าเชื่อถือ`);
  }

  const confidenceLevel =
    bestPrice.score >= 9 ? "HIGH" : bestPrice.score >= 5 ? "MEDIUM" : bestPrice.score >= 2 ? "LOW" : "FAILED";

  const confidenceReason =
    confidenceLevel === "HIGH"
      ? "พบราคาซ้ำจากหลายแหล่งข้อมูลในหน้าเดียวกัน"
      : confidenceLevel === "MEDIUM"
        ? "พบราคาจาก meta หรือ script หลักของหน้าเว็บ"
        : "ดึงราคาได้จาก fallback parser ของหน้าเว็บ";

  return {
    title,
    imageUrl,
    currentPrice: bestPrice.value,
    status: inferStockStatus(html),
    confidenceLevel,
    confidenceReason,
    rawPayload: JSON.stringify({
      scraperEngine: store.scraperEngine,
      store: store.key,
      title,
      finalUrl: response.url,
      selectorPriceText,
      jsonLdPrice,
      metaPrice,
      bestPrice,
      candidateCount: candidates.size,
    }),
  };
};

const browserHtmlScraper: ScraperAdapter = async ({ store }) => {
  throw new Error(store.supportNotes || `${store.name} ยังไม่เปิดใช้งานในระบบตอนนี้`);
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
