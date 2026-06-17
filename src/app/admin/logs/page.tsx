import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Table, TableWrapper } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth";

export default async function AdminLogsPage() {
  const user = await requireUser();
  const logs = await prisma.scrapeLog.findMany({
    include: { store: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AppShell user={user} title="บันทึกระบบ" description="ตรวจสอบผลการดึงราคาจริง ปัญหา selector และข้อผิดพลาดที่เกิดขึ้นในระบบ">
      <TableWrapper>
        <Table>
          <thead className="bg-[color:var(--color-surface-alt)] text-left text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
            <tr>
              <th className="px-4 py-3">ร้านค้า</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">ข้อความ</th>
              <th className="px-4 py-3">เวลาตอบสนอง</th>
              <th className="px-4 py-3">เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-line)]">
            {logs.map((log) => (
              <tr key={log.id} className="text-sm text-[color:var(--color-ink-muted)]">
                <td className="px-4 py-4">{log.store?.name || "-"}</td>
                <td className="px-4 py-4">{log.success ? <Badge tone="positive">สำเร็จ</Badge> : <Badge tone="warning">เตือน</Badge>}</td>
                <td className="px-4 py-4">{log.message}</td>
                <td className="px-4 py-4">{log.responseTimeMs} ms</td>
                <td className="px-4 py-4">{new Date(log.createdAt).toLocaleString("th-TH")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </AppShell>
  );
}
