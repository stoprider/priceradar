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
  blockDetectors?: readonly string[];
  unavailableDetectors?: readonly string[];
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
    scraperEngine: "http-html",
    selectors: {
      title: ["meta[property='og:title']", "title", "h1"],
      image: ["meta[property='og:image']", "img[alt][src]"],
      price: ["meta[property='product:price:amount']", "[data-testid*='price']", "[class*='price']", "[class*='Price']"],
    },
    unavailableDetectors: ["ไม่พบรายการสินค้านี้", "ขออภัยค่ะ! ไม่พบรายการสินค้านี้", "item not found"],
    supportNotes:
      "ระบบรู้จักลิงก์ Shopee แล้ว แต่หน้าเว็บปัจจุบันยังไม่ปล่อยชื่อและราคาสินค้าใน HTML ปกติอย่างเสถียร และ endpoint สินค้ามีการป้องกันการดึงอัตโนมัติ จึงยังไม่เปิดใช้งานใน production",
  },
  {
    key: "lazada",
    name: "Lazada",
    domains: ["lazada.co.th"],
    category: "marketplace",
    isEnabled: false,
    scraperEngine: "http-html",
    selectors: {
      title: ["meta[property='og:title']", "title", "h1"],
      image: ["meta[property='og:image']", "img[alt][src]"],
      price: ["meta[property='product:price:amount']", "[class*='price']", "[class*='Price']", "[data-price]"],
    },
    unavailableDetectors: ["ไม่พบรายการสินค้านี้", "ขออภัยค่ะ! ไม่พบรายการสินค้านี้", "404", "not found"],
    supportNotes:
      "ระบบรู้จักลิงก์ Lazada แล้ว แต่หน้าสินค้าจริงหลายลิงก์ตอบกลับหน้าไม่พร้อมใช้งานหรือฝังข้อมูลราคาแบบไม่เสถียร จึงยังไม่เปิดใช้งานใน production",
  },
  {
    key: "temu",
    name: "Temu",
    domains: ["temu.com", "temu.to"],
    category: "marketplace",
    isEnabled: false,
    scraperEngine: "browser-html",
    blockDetectors: ["verify you are human", "captcha", "challenge", "access denied", "security check"],
    supportNotes:
      "Temu ยังไม่เปิดใช้งาน เพราะหน้าเว็บต้นทางยังตอบกลับ anti-bot หรือ challenge กับการดึงข้อมูลอัตโนมัติ ต้องมี extractor เฉพาะและทดสอบจริงเพิ่มอีกชั้น",
  },
] as const;

export function resolveStoreByUrl(input: string) {
  const url = new URL(input);
  return STORE_CONFIG.find((store) => store.domains.some((domain) => url.hostname.includes(domain))) ?? null;
}

export function getSupportedStores() {
  return STORE_CONFIG.filter((store) => store.isEnabled);
}
