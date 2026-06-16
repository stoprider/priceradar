import { notFound } from "next/navigation";
import { addProductToWatchlistAction, deleteProductAction, triggerProductCheckAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { DealScoreBadge } from "@/components/deal-score-badge";
import { PriceChartCard } from "@/components/price-chart-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { requireUser } from "@/server/auth";
import { toProductCardModel } from "@/server/view-models";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const flash = await searchParams;
  const product = await prisma.product.findFirst({
    where: { id, userId: user.id },
    include: {
      store: true,
      watchlistItems: true,
      priceHistory: { orderBy: { checkedAt: "asc" }, take: 30 },
    },
  });
  const watchlists = await prisma.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  if (!product) {
    notFound();
  }

  const viewModel = toProductCardModel(product);

  return (
    <AppShell user={user} title={product.title} description="ดูรายละเอียดราคาของสินค้าแต่ละรายการ พร้อมระดับดีล ความเชื่อมั่น และกราฟราคาแบบย้อนหลัง">
      {flash.success ? <p className="mb-4 text-sm text-emerald-700">{flash.success}</p> : null}
      {flash.error ? <p className="mb-4 text-sm text-rose-600">{flash.error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">{product.store.name}</div>
          <div className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-ink)]">{formatCurrency(Number(product.currentPrice))}</div>
          <div className="mt-5 flex flex-wrap gap-3">
            <DealScoreBadge score={product.dealScoreBand} />
            <ConfidenceBadge level={product.confidenceLevel} />
          </div>
          <form action={triggerProductCheckAction} className="mt-5">
            <input type="hidden" name="productId" value={product.id} />
            <Button type="submit">ตรวจสอบราคาล่าสุด</Button>
          </form>
          {watchlists.length ? (
            <form action={addProductToWatchlistAction} className="mt-4 flex flex-col gap-3 md:flex-row">
              <input type="hidden" name="productId" value={product.id} />
              <Select name="watchlistId" defaultValue={watchlists[0].id}>
                {watchlists.map((watchlist) => (
                  <option key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                เพิ่มไปยังรายการเฝ้าดู
              </Button>
            </form>
          ) : null}
          <form action={deleteProductAction} className="mt-4">
            <input type="hidden" name="productId" value={product.id} />
            <Button type="submit" variant="ghost">
              ลบสินค้า
            </Button>
          </form>
          <dl className="mt-8 space-y-4 text-sm text-[color:var(--color-ink-muted)]">
            <div className="flex items-center justify-between gap-4">
              <dt>ราคาเป้าหมาย</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{formatCurrency(Number(product.targetPrice || product.currentPrice))}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>ราคาต่ำสุดใน 30 วัน</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{formatCurrency(Number(product.lowest30d || product.currentPrice))}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>ราคาเฉลี่ยใน 30 วัน</dt>
              <dd className="font-semibold text-[color:var(--color-ink)]">{formatCurrency(Number(product.average30d || product.currentPrice))}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>หมายเหตุความเชื่อมั่น</dt>
              <dd className="max-w-[55%] text-right">{product.confidenceReason}</dd>
            </div>
          </dl>
        </Card>
        <PriceChartCard product={viewModel} />
      </div>
    </AppShell>
  );
}
