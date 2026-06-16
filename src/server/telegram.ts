type TelegramPayload = {
  title: string;
  message: string;
  url: string;
  chatId?: string | null;
};

export async function sendTelegramAlert(payload: TelegramPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = payload.chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      ok: false,
      reason: "Telegram environment variables are missing.",
    };
  }

  const text = [`PriceRadar TH`, payload.title, payload.message, payload.url].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: false,
    }),
  });

  return {
    ok: response.ok,
    reason: response.ok ? "Sent" : "Telegram API returned an error",
  };
}
