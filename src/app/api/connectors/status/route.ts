import { CONNECTORS, probe } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export async function GET() {
  const [ragHealth, ragSearch, seoPage, ragUi, hfLeadfair, telegram] = await Promise.all([
    probe(`${CONNECTORS.leadfairRagApi}/api/health`),
    probe(`${CONNECTORS.leadfairRagApi}/api/search?q=%D9%84%D9%88%D9%84%D9%87&limit=1`),
    probe(CONNECTORS.leadfairSeo),
    probe(CONNECTORS.leadfairRagUi),
    probe(CONNECTORS.hfLeadfair),
    (async () => {
      const token = process.env.EXHIBITION_TELEGRAM_BOT_TOKEN?.trim();
      if (!token) return { ok: false, status: 0, snippet: "EXHIBITION_TELEGRAM_BOT_TOKEN not set" };
      return probe(`https://api.telegram.org/bot${token}/getMe`);
    })(),
  ]);

  const items = [
    {
      id: "local-exhibition",
      label: "لیست غرفه IRAN CONFAIR ۱۴۰۵ (این سایت)",
      url: "/api/exhibition",
      ok: true,
      detail: "۴۴۰ غرفه‌دار رسمی ساختمان",
    },
    {
      id: "leadfair-rag-api",
      label: "LeadFair RAG API (Vercel)",
      url: `${CONNECTORS.leadfairRagApi}/api/health`,
      ok: ragHealth.ok && ragHealth.snippet.includes("exhibition-rag"),
      detail: ragHealth.snippet,
    },
    {
      id: "leadfair-rag-search",
      label: "LeadFair /api/search",
      url: `${CONNECTORS.leadfairRagApi}/api/search`,
      ok: ragSearch.ok && ragSearch.snippet.includes("\"ok\":true"),
      detail: ragSearch.ok ? "جستجوی ۱۷۳۰ شرکت نفت/ساختمان زنده است" : ragSearch.snippet,
    },
    {
      id: "leadfair-seo",
      label: "LeadFair SEO Lead UI",
      url: CONNECTORS.leadfairSeo,
      ok: seoPage.ok,
      detail: seoPage.ok ? "تحلیل سئو کلاینت‌ساید LeadFair" : seoPage.snippet,
    },
    {
      id: "leadfair-rag-ui",
      label: "LeadFair RAG UI",
      url: CONNECTORS.leadfairRagUi,
      ok: ragUi.ok,
      detail: ragUi.ok ? "اتصال‌گر هوشمند نمایشگاه" : ragUi.snippet,
    },
    {
      id: "hf-leadfair-1405",
      label: "HF leadfair-ai-iran-confair-1405",
      url: CONNECTORS.hfLeadfair,
      ok: false,
      detail: hfLeadfair.snippet.includes("paused") || hfLeadfair.status === 503 ? "Space روی HF متوقف است (سهمیه CPU)" : hfLeadfair.snippet.slice(0, 120),
    },
    {
      id: "telegram-exhibition",
      label: "Telegram @exhibition_ai_bot",
      url: CONNECTORS.exhibitionTelegram,
      ok: telegram.ok && telegram.snippet.includes("exhibition_ai_bot"),
      detail: telegram.snippet.includes("username") ? "بات زنده است" : telegram.snippet.slice(0, 140),
    },
  ];

  return Response.json({
    ok: true,
    project: "exhibition-connector-hub",
    generatedAt: new Date().toISOString(),
    note: "فقط APIهای مربوط به نمایشگاه/سئو/RAG اینجا وصل می‌شوند. بات‌های مهاجرت و نگین‌جام جدا هستند.",
    items,
  });
}
