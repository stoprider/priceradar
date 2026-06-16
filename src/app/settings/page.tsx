import { updateSettingsAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/server/auth";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <AppShell user={user} title="ตั้งค่า" description="จัดการข้อมูลบัญชีและการแจ้งเตือนของคุณจากข้อมูลจริงที่บันทึกไว้ในระบบ">
      {params.success ? <p className="mb-4 text-sm text-emerald-700">{params.success}</p> : null}
      <Card className="max-w-3xl p-6">
        <form action={updateSettingsAction} className="grid gap-4">
          <Input name="name" defaultValue={user.name} />
          <Input defaultValue={user.email} disabled />
          <Input name="telegramChatId" defaultValue={user.telegramChatId || ""} placeholder="Telegram chat ID" />
          <label className="flex items-center gap-2 text-sm text-[color:var(--color-ink-muted)]">
            <input name="telegramEnabled" type="checkbox" defaultChecked={user.telegramEnabled} />
            เปิดใช้งานการแจ้งเตือนผ่าน Telegram
          </label>
          <div className="flex gap-3">
            <Button type="submit">บันทึกการตั้งค่า</Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
