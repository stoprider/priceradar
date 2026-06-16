import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSessionUser } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-app-bg)] p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">เริ่มต้นใช้งาน</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--color-ink)]">สร้างบัญชี</h1>
        <form action={registerAction} className="mt-6 grid gap-4">
          <Input name="name" placeholder="ชื่อ" />
          <Input name="email" placeholder="อีเมล" type="email" />
          <Input name="password" placeholder="รหัสผ่าน" type="password" />
          {params.error ? <p className="text-sm text-rose-600">{params.error}</p> : null}
          <Button type="submit">สร้างบัญชี</Button>
        </form>
        <p className="mt-5 text-sm text-[color:var(--color-ink-muted)]">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="font-semibold text-[color:var(--color-accent)]">เข้าสู่ระบบ</Link>
        </p>
      </Card>
    </main>
  );
}
