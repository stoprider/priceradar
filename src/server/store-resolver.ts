export const STORE_CONFIG = [
  {
    key: "homepro",
    name: "HomePro",
    domains: ["homepro.co.th"],
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
    selectors: {
      title: ["meta[property='og:title']", "h1"],
      image: ["meta[property='og:image']"],
      price: ["meta[property='product:price:amount']", "[class*='price']", "[data-testid*='price']"],
    },
  },
] as const;

export function resolveStoreByUrl(input: string) {
  const url = new URL(input);
  return STORE_CONFIG.find((store) => store.domains.some((domain) => url.hostname.includes(domain))) ?? null;
}
