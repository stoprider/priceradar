export type ScraperEngine = "http-html" | "browser-html" | "api";

export type StoreConfig = {
  key: string;
  name: string;
  domains: string[];
  category: "retail" | "marketplace";
  isEnabled: boolean;
  scraperEngine: ScraperEngine;
  selectors?: {
    title: readonly string[];
    image: readonly string[];
    price: readonly string[];
  };
  supportNotes?: string;
};

export const STORE_CONFIG: readonly StoreConfig[] = [
  {
    key: "homepro",
    name: "HomePro",
    domains: ["homepro.co.th"],
    category: "retail",
    isEnabled: true,
    scraperEngine: "http-html",
    selectors: {
      title: ["meta[property='og:title']", "h1"],
      image: ["meta[property='og:image']"],
      price: ["meta[property='product:price:amount']", "[class*='price']", "[data-testid*='price']"],
    },
  },
  {
    key: "powerbuy",
    name: "Power Buy",
    domains: ["powerbuy.co.th"],
    category: "retail",
    isEnabled: true,
    scraperEngine: "http-html",
    selectors: {
      title: ["meta[property='og:title']", "h1"],
      image: ["meta[property='og:image']"],
      price: ["meta[property='product:price:amount']", "[class*='price']", "[data-testid*='price']"],
    },
  },
  {
    key: "advice",
    name: "Advice",
    domains: ["advice.co.th"],
    category: "retail",
    isEnabled: true,
    scraperEngine: "http-html",
    selectors: {
      title: ["meta[property='og:title']", "h1"],
      image: ["meta[property='og:image']"],
      price: ["meta[property='product:price:amount']", "[class*='price']", "[data-testid*='price']"],
    },
  },
  {
    key: "jib",
    name: "JIB",
    domains: ["jib.co.th"],
    category: "retail",
    isEnabled: true,
    scraperEngine: "http-html",
    selectors: {
      title: ["meta[property='og:title']", "h1"],
      image: ["meta[property='og:image']"],
      price: ["meta[property='product:price:amount']", "[class*='price']", "[data-testid*='price']"],
    },
  },
  {
    key: "shopee",
    name: "Shopee",
    domains: ["shopee.co.th"],
    category: "marketplace",
    isEnabled: false,
    scraperEngine: "browser-html",
    supportNotes: "ต้องใช้ browser scraper, anti-bot handling, และ parser เฉพาะ marketplace ก่อนเปิดใช้งานจริง",
  },
  {
    key: "lazada",
    name: "Lazada",
    domains: ["lazada.co.th"],
    category: "marketplace",
    isEnabled: false,
    scraperEngine: "browser-html",
    supportNotes: "ต้องใช้ browser scraper หรือ API/state parser และทดสอบกับหลายรูปแบบสินค้า",
  },
  {
    key: "temu",
    name: "Temu",
    domains: ["temu.com", "temu.to"],
    category: "marketplace",
    isEnabled: false,
    scraperEngine: "browser-html",
    supportNotes: "ต้องเพิ่ม browser-based extraction และผ่านการทดสอบ anti-bot ก่อนเปิดใช้งาน",
  },
] as const;

export function resolveStoreByUrl(input: string) {
  const url = new URL(input);
  return STORE_CONFIG.find((store) => store.domains.some((domain) => url.hostname.includes(domain))) ?? null;
}

export function getSupportedStores() {
  return STORE_CONFIG.filter((store) => store.isEnabled);
}
