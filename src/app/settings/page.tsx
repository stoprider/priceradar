import { testTelegramAction, updateSettingsAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const recentNotifications = await prisma.notificationLog.findMany({
    where: { userId: user.id, channel: "telegram" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const hasBotToken = Boolean(user.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN);
  const hasChatId = Boolean(user.telegramChatId || process.env.TELEGRAM_CHAT_ID);
  const isTelegramReady = hasBotToken && hasChatId;

  return (
    <AppShell user={user} title="ตั้งค่า" description="จัดการข้อมูลบัญชี การเชื่อมต่อ Telegram และทดสอบการแจ้งเตือนจากระบบได้ในหน้าเดียว">
      {params.success ? <p className="mb-4 text-sm text-emerald-700">{params.success}</p> : null}
      {params.error ? <p className="mb-4 text-sm text-rose-600">{params.error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <form action={updateSettingsAction} className="grid gap-4">
            <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">บัญชีผู้ใช้</div>
            <Input name="name" defaultValue={user.name} placeholder="ชื่อ" />
            <Input defaultValue={user.email} disabled />

            <div className="mt-2 text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">Telegram</div>
            <Input
              name="telegramBotToken"
              defaultValue={user.telegramBotToken || ""}
              placeholder="Telegram bot token"
              type="password"
            />
            <Input
              name="telegramChatId"
              defaultValue={user.telegramChatId || ""}
              placeholder="Telegram chat ID"
            />
            <label className="flex items-center gap-2 text-sm text-[color:var(--color-ink-muted)]">
              <input name="telegramEnabled" type="checkbox" defaultChecked={user.telegramEnabled} />
              เปิดใช้งานการแจ้งเตือนผ่าน Telegram
            </label>

            <div className="flex gap-3">
              <Button type="submit">บันทึกการตั้งค่า</Button>
            </div>
          </form>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">สถานะการเชื่อมต่อ</div>
            <div className="mt-4 grid gap-3 text-sm text-[color:var(--color-ink-muted)]">
              <div className="flex items-center justify-between rounded-2xl bg-[color:var(--color-surface-alt)] px-4 py-3">
                <span>Bot token</span>
                <span className={hasBotToken ? "font-semibold text-emerald-700" : "font-semibold text-rose-600"}>
                  {hasBotToken ? "พร้อมใช้งาน" : "ยังไม่ตั้งค่า"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[color:var(--color-surface-alt)] px-4 py-3">
                <span>Chat ID</span>
                <span className={hasChatId ? "font-semibold text-emerald-700" : "font-semibold text-rose-600"}>
                  {hasChatId ? "พร้อมใช้งาน" : "ยังไม่ตั้งค่า"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[color:var(--color-surface-alt)] px-4 py-3">
                <span>สถานะรวม</span>
                <span className={isTelegramReady ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
                  {isTelegramReady ? "พร้อมทดสอบส่ง" : "ข้อมูลยังไม่ครบ"}
                </span>
              </div>
            </div>

            <form action={testTelegramAction} className="mt-5">
              <Button type="submit" variant="secondary">
                ทดสอบส่ง Telegram
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">ประวัติการแจ้งเตือนล่าสุด</div>
            <div className="mt-4 grid gap-3">
              {recentNotifications.length ? (
                recentNotifications.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[color:var(--color-surface-alt)] px-4 py-3 text-sm">
                    <div className="font-semibold text-[color:var(--color-ink)]">{item.title}</div>
                    <div className="mt-1 text-[color:var(--color-ink-muted)]">{item.body}</div>
                    <div className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
                      {new Date(item.createdAt).toLocaleString("th-TH")} · {item.wasSent ? "ส่งสำเร็จ" : "ยังไม่สำเร็จ"}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[color:var(--color-ink-muted)]">ยังไม่มีประวัติการแจ้งเตือน Telegram</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
