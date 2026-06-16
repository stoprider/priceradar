import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { DealScoreBadge } from "@/components/deal-score-badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Image src={product.imageUrl} alt={product.title} fill className="object-cover" unoptimized />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">{product.store}</div>
            <h3 className="mt-2 text-lg font-semibold text-[color:var(--color-ink)]">{product.title}</h3>
          </div>
          <DealScoreBadge score={product.dealScoreBand} />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold text-[color:var(--color-ink)]">{formatCurrency(product.currentPrice)}</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--color-ink-muted)]">
              <Target className="h-4 w-4" />
              เป้าหมาย {formatCurrency(product.targetPrice)}
            </div>
          </div>
          <ConfidenceBadge level={product.confidenceLevel} />
        </div>
        <Link href={`/products/${product.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)]">
          ดูรายละเอียด <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
