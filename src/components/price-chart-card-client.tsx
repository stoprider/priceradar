"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function PriceChartCardClient({ product }: { product: Product }) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">กราฟราคา</div>
        <h3 className="mt-2 text-xl font-semibold text-[color:var(--color-ink)]">{product.title}</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={288}>
          <LineChart data={product.timeline}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value) => `฿${value / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#0f172a" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
