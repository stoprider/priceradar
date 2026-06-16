import Link from "next/link";
import { createWatchlistAction, deleteWatchlistAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth";

export default async function WatchlistsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const watchlists = await prisma.watchlist.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell user={user} title="รายการเฝ้าดู" description="จัดกลุ่มสินค้าที่ติดตามตามเป้าหมายการใช้งาน และแชร์ลิงก์แบบอ่านอย่างเดียวให้ผู้อื่นได้หากต้องการ">
      {params.success ? <p className="mb-4 text-sm text-emerald-700">{params.success}</p> : null}
      {params.error ? <p className="mb-4 text-sm text-rose-600">{params.error}</p> : null}
      <Card className="mb-6 p-6">
        <form action={createWatchlistAction} className="grid gap-4 md:grid-cols-2">
          <Input name="name" placeholder="ชื่อรายการเฝ้าดู" />
          <Input name="description" placeholder="คำอธิบายสั้น ๆ" />
          <label className="flex items-center gap-2 text-sm text-[color:var(--color-ink-muted)]">
            <input name="isPublic" type="checkbox" />
            เปิดลิงก์แชร์สาธารณะ
          </label>
          <div>
            <Button type="submit">สร้างรายการเฝ้าดู</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {watchlists.map((watchlist) => (
          <Card key={watchlist.id} className="p-6">
            <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">{watchlist.isPublic ? "เปิดแชร์สาธารณะ" : "รายการส่วนตัว"}</div>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--color-ink)]">{watchlist.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-muted)]">{watchlist.description}</p>
            <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{watchlist.items.length} รายการ</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[color:var(--color-accent)]">
              <Link href={`/watchlists/${watchlist.id}`}>เปิดรายการ</Link>
              {watchlist.isPublic ? <Link href={`/share/watchlist/${watchlist.publicId}`}>ดูหน้าแชร์สาธารณะ</Link> : null}
            </div>
            <form action={deleteWatchlistAction} className="mt-4">
              <input type="hidden" name="watchlistId" value={watchlist.id} />
              <Button type="submit" variant="ghost">
                ลบรายการเฝ้าดู
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
