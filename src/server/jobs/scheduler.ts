import cron from "node-cron";
import { runAllProductChecks } from "@/server/product-service";

export function startPriceScheduler() {
  return cron.schedule("0 */6 * * *", () => {
    void runAllProductChecks();
  });
}
