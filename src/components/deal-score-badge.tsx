import { Badge } from "@/components/ui/badge";
import type { DealScoreBand } from "@/types/domain";

export function DealScoreBadge({ score }: { score: DealScoreBand }) {
  const meta: Record<DealScoreBand, { label: string; tone: "positive" | "warning" | "danger" | "neutral" | "info" }> = {
    HOT_DEAL: { label: "ดีลร้อนแรง", tone: "danger" },
    BEST_PRICE: { label: "ราคาดีที่สุด", tone: "positive" },
    GOOD_DEAL: { label: "ดีลคุ้ม", tone: "info" },
    NORMAL: { label: "ปกติ", tone: "neutral" },
    WAIT: { label: "รอก่อน", tone: "warning" },
  };

  return <Badge tone={meta[score].tone}>{meta[score].label}</Badge>;
}
