import Link from "next/link";
import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSessionUser } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
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
        <div className="text-sm uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)]">PriceRadar TH</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--color-ink)]">เข้าสู่ระบบ</h1>
        <form action={loginAction} className="mt-6 grid gap-4">
          <Input name="email" placeholder="อีเมล" type="email" />
          <Input name="password" placeholder="รหัสผ่าน" type="password" />
          {params.error ? <p className="text-sm text-rose-600">{params.error}</p> : null}
          <Button type="submit">เข้าสู่ระบบ</Button>
        </form>
        <p className="mt-5 text-sm text-[color:var(--color-ink-muted)]">
          ยังไม่มีบัญชี? <Link href="/register" className="font-semibold text-[color:var(--color-accent)]">สมัครสมาชิก</Link>
        </p>
      </Card>
    </main>
  );
}
