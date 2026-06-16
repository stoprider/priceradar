"use client";

import dynamic from "next/dynamic";
import type { Product } from "@/types/domain";

const PriceChartCardClient = dynamic(
  () => import("@/components/price-chart-card-client").then((mod) => mod.PriceChartCardClient),
  {
    ssr: false,
  },
);

export function PriceChartCard({ product }: { product: Product }) {
  return <PriceChartCardClient product={product} />;
}
