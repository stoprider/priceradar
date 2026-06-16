import Link from "next/link";
import { ArrowRight, Bell, ChartSpline, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { products } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[color:var(--color-app-bg)] px-4 py-4 lg:px-6">
      <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur-sm">
        <header className="flex flex-col gap-6 border-b border-[color:var(--color-line)] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">PriceRadar TH</div>
            <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.06em] text-[color:var(--color-ink)]">
              ระบบติดตามราคาสำหรับคนไทย ที่ให้ประสบการณ์เหมือนโปรดักต์จริง ไม่ใช่แค่เทมเพลต
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button>เปิดแดชบอร์ด</Button>
            </Link>
            <Link href="/products/new">
              <Button variant="secondary">เพิ่มลิงก์ติดตาม</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[1.35fr_0.95fr]">
          <Card className="overflow-hidden p-6">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
              <Sparkles className="h-4 w-4" />
              ขั้นตอนการใช้งาน MVP
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                "วางลิงก์สินค้าจาก HomePro, Power Buy, Advice หรือ JIB",
                "ดึงข้อมูลสินค้าและราคาจากหน้าเว็บที่รองรับ",
                "บันทึกสแน็ปราคาและประวัติย้อนหลัง 30 วัน",
                "คำนวณความคุ้มค่าและเตรียมแจ้งเตือนผ่าน Telegram",
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-[color:var(--color-surface-alt)] p-5 text-sm leading-6 text-[color:var(--color-ink-muted)]">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">ดีลเด่นวันนี้</div>
            <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-ink)]">{products[1].title}</div>
            <div className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-ink)]">{formatCurrency(products[1].currentPrice)}</div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-muted)]">
              ราคาต่ำสุดที่ระบบติดตามพบในช่วง 30 วันที่ผ่านมา พร้อมความเชื่อมั่นสูงจากการจับคู่ข้อมูลสินค้า
            </p>
            <div className="mt-6 grid gap-3">
              {[
                { icon: ChartSpline, text: "ดูกราฟราคาและราคาต่ำสุดในรอบ 30 วัน" },
                { icon: Bell, text: "รองรับการแจ้งเตือนผ่าน Telegram เมื่อราคาถึงเป้าหมาย" },
                { icon: ShieldCheck, text: "มีระดับความเชื่อมั่นเพื่อบอกว่าราคาน่าเชื่อถือแค่ไหน" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl bg-[color:var(--color-surface-alt)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
                  <Icon className="h-4 w-4 text-[color:var(--color-accent)]" />
                  {text}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <Card key={product.id} className="p-5">
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">{product.store}</div>
              <h2 className="mt-3 text-lg font-semibold text-[color:var(--color-ink)]">{product.title}</h2>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-2xl font-semibold text-[color:var(--color-ink)]">{formatCurrency(product.currentPrice)}</div>
                <Link href={`/products/${product.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)]">
                  ดูรายละเอียด <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
