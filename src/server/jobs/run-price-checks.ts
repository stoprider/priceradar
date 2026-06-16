import { runAllProductChecks } from "@/server/product-service";

runAllProductChecks()
  .then(() => {
    console.log("Finished checking all tracked products.");
  })
  .catch((error) => {
    console.error("Price check job failed", error);
    process.exit(1);
  });
