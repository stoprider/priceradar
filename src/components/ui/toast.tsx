import { CheckCircle2 } from "lucide-react";

export function ToastPreview() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <CheckCircle2 className="h-4 w-4" />
      ราคาถึงเป้าหมายแล้ว ระบบได้เตรียมคิวแจ้งเตือนผ่าน Telegram เรียบร้อย
    </div>
  );
}
