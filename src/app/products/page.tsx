import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { DealScoreBadge } from "@/components/deal-score-badge";
import { Button } from "@/components/ui/button";
import { Table, TableWrapper } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { requireUser } from "@/server/auth";
import { getDashboardData } from "@/server/dashboard-service";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const params = await searchParams;

  return (
    <AppShell user={user} title="สินค้าที่ติดตาม" description="รวมลิงก์สินค้า ราคาเป้าหมาย ระดับดีล และความเชื่อมั่นไว้ในตารางเดียวเพื่อให้ตรวจสอบได้รวดเร็ว">
      {params.success ? <p className="mb-4 text-sm text-emerald-700">{params.success}</p> : null}
      {params.error ? <p className="mb-4 text-sm text-rose-600">{params.error}</p> : null}
      <div className="mb-5 flex justify-end">
        <Link href="/products/new">
          <Button>เพิ่มลิงก์สินค้า</Button>
        </Link>
      </div>
      <TableWrapper>
        <Table>
          <thead className="bg-[color:var(--color-surface-alt)] text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
            <tr>
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3">ร้านค้า</th>
              <th className="px-4 py-3">ราคาปัจจุบัน</th>
              <th className="px-4 py-3">ราคาเป้าหมาย</th>
              <th className="px-4 py-3">ระดับดีล</th>
              <th className="px-4 py-3">ความเชื่อมั่น</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-line)]">
            {data.products.map((product) => (
              <tr key={product.id} className="text-sm text-[color:var(--color-ink-muted)]">
                <td className="px-4 py-4">
                  <Link href={`/products/${product.id}`} className="font-semibold text-[color:var(--color-ink)]">
                    {product.title}
                  </Link>
                </td>
                <td className="px-4 py-4">{product.store}</td>
                <td className="px-4 py-4">{formatCurrency(product.currentPrice)}</td>
                <td className="px-4 py-4">{formatCurrency(product.targetPrice)}</td>
                <td className="px-4 py-4">
                  <DealScoreBadge score={product.dealScoreBand} />
                </td>
                <td className="px-4 py-4">
                  <ConfidenceBadge level={product.confidenceLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </AppShell>
  );
}
