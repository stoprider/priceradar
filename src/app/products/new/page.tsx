import { AppShell } from "@/components/app-shell";
import { AddProductForm } from "@/components/sections/add-product-form";
import { requireUser } from "@/server/auth";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <AppShell user={user} title="เพิ่มสินค้า" description="เพิ่มลิงก์สินค้าจากร้านค้าที่รองรับ เพื่อดึงข้อมูลจริง บันทึกราคา และตั้งกฎแจ้งเตือนอัตโนมัติ">
      <AddProductForm error={params.error} />
    </AppShell>
  );
}
