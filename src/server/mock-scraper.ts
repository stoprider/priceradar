import { products } from "@/lib/mock-data";
import { calculateDealScore, getConfidenceMeta } from "@/lib/product-analytics";
import { validateStoreUrl } from "@/lib/url-validator";

export function mockScrapeProduct(url: string) {
  const validation = validateStoreUrl(url);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.message,
    };
  }

  const matched = products.find((product) => product.sourceUrl === url) ?? products[0];
  const deal = calculateDealScore(matched);
  const confidence = getConfidenceMeta(matched.confidenceLevel);

  return {
    success: true,
    data: {
      ...matched,
      dealScoreBand: deal.band,
      confidenceLabel: confidence.label,
      confidenceReason: confidence.note,
      lastCheckedAt: new Date().toISOString(),
    },
  };
}
