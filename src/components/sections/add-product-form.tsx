import { createProductAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { STORE_CONFIG } from "@/server/store-resolver";

export function AddProductForm({ error }: { error?: string }) {
  const enabledStores = STORE_CONFIG.filter((store) => store.isEnabled).map((store) => store.name);
  const marketplaceStores = STORE_CONFIG.filter((store) => store.category === "marketplace");

  return (
    <Card className="p-6">
      <div className="mb-5">
        <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">ลิงก์ใหม่สำหรับติดตาม</div>
        <h3 className="mt-2 text-xl font-semibold text-[color:var(--color-ink)]">วางลิงก์สินค้าเพื่อเริ่มติดตามราคา</h3>
        <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-soft)]">
          รองรับใช้งานตอนนี้: {enabledStores.join(", ")}
        </p>
      </div>
      <form action={createProductAction}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input name="sourceUrl" placeholder="https://www.powerbuy.co.th/..." />
          </div>
          <Input name="targetPrice" placeholder="ราคาเป้าหมาย (บาท)" type="number" min="1" step="1" />
        </div>
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="submit">เริ่มติดตามสินค้า</Button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-paper-muted)] p-4">
        <div className="text-sm font-semibold text-[color:var(--color-ink)]">สถานะ Marketplace</div>
        <div className="mt-3 space-y-3 text-sm text-[color:var(--color-ink-soft)]">
          {marketplaceStores.map((store) => (
            <div key={store.key}>
              <div className="font-medium text-[color:var(--color-ink)]">
                {store.name}: {store.isEnabled ? "พร้อมใช้งาน" : "ยังไม่เปิดใช้งาน"}
              </div>
              <div>{store.supportNotes}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
