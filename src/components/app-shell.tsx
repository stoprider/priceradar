import Link from "next/link";
import type { ReactNode } from "react";
import { BellDot, ChartColumnIncreasing, LayoutDashboard, ListChecks, Logs, Settings2, Sparkles } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/products", label: "สินค้า", icon: ChartColumnIncreasing },
  { href: "/watchlists", label: "รายการเฝ้าดู", icon: ListChecks },
  { href: "/admin/logs", label: "บันทึกระบบ", icon: Logs },
  { href: "/settings", label: "ตั้งค่า", icon: Settings2 },
];

export function AppShell({
  title,
  description,
  children,
  user,
}: {
  title: string;
  description: string;
  children: ReactNode;
  user: {
    name: string;
    email: string;
  };
}) {
  return (
    <div className="min-h-screen bg-[color:var(--color-app-bg)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,.95),rgba(244,247,251,.9))] p-5 shadow-panel">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">PriceRadar TH</div>
              <div className="text-base font-semibold text-[color:var(--color-ink)]">ระบบติดตามราคาพรีเมียม</div>
            </div>
          </Link>

          <nav className="mt-8 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-ink-muted)] transition hover:bg-white hover:text-[color:var(--color-ink)]",
                    item.href === "/dashboard" && "bg-white text-[color:var(--color-ink)] shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.75rem] bg-[color:var(--color-ink)] p-5 text-white">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
              <BellDot className="h-4 w-4" />
              การแจ้งเตือน
            </div>
            <p className="mt-3 text-sm text-white/72">
              รองรับการแจ้งเตือนผ่าน Telegram และพร้อมต่อยอดเป็นตัวดึงราคาจริงของแต่ละร้านค้าได้ในขั้นถัดไป
            </p>
            <Button className="mt-4 w-full" variant="secondary">
              ตั้งค่าบอต
            </Button>
          </div>
        </aside>

        <main className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur-sm">
          <div className="mb-6 flex flex-col gap-3 border-b border-[color:var(--color-line)] pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-[color:var(--color-ink)]">{user.name}</div>
              <div className="text-sm text-[color:var(--color-ink-muted)]">{user.email}</div>
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" type="submit">
                ออกจากระบบ
              </Button>
            </form>
          </div>
          <div className="flex flex-col gap-4 border-b border-[color:var(--color-line)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">ระบบติดตามราคาสำหรับผู้ใช้ไทย</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-ink)]">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--color-ink-muted)]">{description}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/products">
                <Button variant="secondary">สินค้าที่ติดตาม</Button>
              </Link>
              <Link href="/products/new">
                <Button>เพิ่มลิงก์สินค้า</Button>
              </Link>
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
