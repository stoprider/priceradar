import { createProductAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AddProductForm({ error }: { error?: string }) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">ลิงก์ใหม่สำหรับติดตาม</div>
        <h3 className="mt-2 text-xl font-semibold text-[color:var(--color-ink)]">วางลิงก์สินค้าเพื่อเริ่มติดตามราคา</h3>
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
    </Card>
  );
}
