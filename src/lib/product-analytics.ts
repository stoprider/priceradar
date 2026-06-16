import type { ConfidenceLevel, DealScoreBand, Product } from "@/types/domain";

export function calculateDealScore(product: Pick<Product, "currentPrice" | "lowest30d" | "average30d">): {
  band: DealScoreBand;
  score: number;
} {
  const current = product.currentPrice;
  const average = product.average30d;
  const lowest = product.lowest30d;

  if (current <= lowest) {
    return { band: "BEST_PRICE", score: 92 };
  }

  const dropPercent = ((average - current) / average) * 100;

  if (dropPercent >= 15) {
    return { band: "HOT_DEAL", score: 98 };
  }

  if (current < average) {
    return { band: "GOOD_DEAL", score: 76 };
  }

  if (dropPercent > -3) {
    return { band: "NORMAL", score: 54 };
  }

  return { band: "WAIT", score: 30 };
}

export function getConfidenceMeta(level: ConfidenceLevel) {
  const meta = {
    HIGH: { label: "เชื่อมั่นสูง", note: "ตรวจพบราคาจากโครงสร้างหลักของหน้าเว็บอย่างชัดเจน" },
    MEDIUM: { label: "เชื่อมั่นปานกลาง", note: "พบราคาแล้ว แต่เงื่อนไขบางอย่างอาจยังไม่ครบถ้วน" },
    LOW: { label: "เชื่อมั่นต่ำ", note: "ดึงราคาด้วยตัวเลือกสำรองระหว่างการประมวลผล" },
    FAILED: { label: "ดึงข้อมูลไม่สำเร็จ", note: "ไม่พบราคาที่น่าเชื่อถือจากหน้าเว็บ" },
  };

  return meta[level];
}
