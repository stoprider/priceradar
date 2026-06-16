import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PriceChartCard } from "@/components/price-chart-card";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/server/auth";
import { getDashboardData } from "@/server/dashboard-service";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const featured = data.products[0];

  return (
    <AppShell
      user={user}
      title="แดชบอร์ด"
      description="ติดตามราคาสินค้าจากร้านที่รองรับ ดูจังหวะซื้อที่น่าสนใจ และอ่านข้อมูลสำคัญได้อย่างรวดเร็วในหน้าเดียว"
    >
      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard label="สินค้าที่ติดตาม" value={String(data.summary.tracked)} delta="ข้อมูลจากฐานข้อมูลจริง" />
        <MetricCard label="ดีลน่าสนใจ" value={String(data.summary.hotDeals)} delta="ดีลเด่นที่พบตอนนี้" />
        <MetricCard label="การแจ้งเตือนที่เปิดอยู่" value={String(data.summary.activeAlerts)} delta="มีกฎราคาเป้าหมายใช้งานอยู่" />
        <MetricCard label="รายการเฝ้าดู" value={String(data.summary.watchlistCount)} delta="รายการที่สร้างไว้" positive={false} />
      </div>

      {featured ? (
        <div className="mt-6">
          <PriceChartCard product={featured} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.products.length ? (
          data.products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState title="ยังไม่มีสินค้าที่ติดตาม" description="เพิ่มลิงก์สินค้ารายการแรกเพื่อเริ่มเก็บประวัติราคาได้เลย" />
          </div>
        )}
      </div>
    </AppShell>
  );
}
