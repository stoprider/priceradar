import { products } from "@/lib/mock-data";
import { mockScrapeProduct } from "@/server/mock-scraper";

for (const product of products) {
  const result = mockScrapeProduct(product.sourceUrl);
  console.log(JSON.stringify({ product: product.title, result }, null, 2));
}
