import { resolveStoreByUrl } from "@/server/store-resolver";

export function validateStoreUrl(input: string) {
  try {
    const url = new URL(input);
    const store = resolveStoreByUrl(input);

    if (!store) {
      return {
        isValid: false,
        host: url.hostname,
        message: "ยังไม่รองรับลิงก์ร้านค้านี้",
      };
    }

    if (!store.isEnabled) {
      return {
        isValid: false,
        host: url.hostname,
        message: store.supportNotes || `ระบบยังไม่เปิดใช้งาน ${store.name}`,
      };
    }

    return {
      isValid: true,
      host: url.hostname,
      message: `รองรับลิงก์ ${store.name}`,
    };
  } catch {
    return {
      isValid: false,
      host: "",
      message: "รูปแบบลิงก์ไม่ถูกต้อง",
    };
  }
}
