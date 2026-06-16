import { Badge } from "@/components/ui/badge";
import type { ConfidenceLevel } from "@/types/domain";

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const meta: Record<ConfidenceLevel, { label: string; tone: "positive" | "warning" | "danger" | "neutral" | "info" }> = {
    HIGH: { label: "เชื่อมั่นสูง", tone: "positive" },
    MEDIUM: { label: "เชื่อมั่นปานกลาง", tone: "info" },
    LOW: { label: "เชื่อมั่นต่ำ", tone: "warning" },
    FAILED: { label: "ดึงข้อมูลไม่สำเร็จ", tone: "danger" },
  };

  return <Badge tone={meta[level].tone}>{meta[level].label}</Badge>;
}
