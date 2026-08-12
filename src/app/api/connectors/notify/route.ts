export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = process.env.EXHIBITION_TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.EXHIBITION_TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return Response.json(
      {
        ok: false,
        error: "بات نمایشگاه تنظیم نشده. EXHIBITION_TELEGRAM_BOT_TOKEN و CHAT_ID لازم است.",
        bot: "https://t.me/exhibition_ai_bot",
      },
      { status: 424 },
    );
  }

  const body = (await request.json()) as { text?: string; company?: string };
  const text = (body.text || `غرفه: ${body.company || "بدون نام"}`).slice(0, 3500);
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  const payload = await res.json();
  return Response.json({ ok: Boolean(payload.ok), payload });
}
