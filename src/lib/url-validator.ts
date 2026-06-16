import { resolveStoreByUrl } from "@/server/store-resolver";

export function validateStoreUrl(input: string) {
  try {
    const url = new URL(input);
    const store = resolveStoreByUrl(input);

    if (!store) {
      return {
        isValid: false,
        host: url.hostname,
        message: "Store not recognized yet",
      };
    }

    if (!store.isEnabled) {
      return {
        isValid: false,
        host: url.hostname,
        message: store.supportNotes || "Store recognized but not enabled yet",
      };
    }

    return {
      isValid: true,
      host: url.hostname,
      message: `Supported store URL (${store.name})`,
    };
  } catch {
    return {
      isValid: false,
      host: "",
      message: "Invalid URL format",
    };
  }
}
