import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  delta,
  positive = true,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-ink)]">{value}</div>
        <div className={positive ? "flex items-center gap-1 text-sm text-emerald-600" : "flex items-center gap-1 text-sm text-amber-600"}>
          {positive ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          {delta}
        </div>
      </div>
    </Card>
  );
}
