export const CONNECTORS = {
  leadfairRagApi: "https://vercel-app-amber-five.vercel.app",
  leadfairUi: "https://master.leadfair.pages.dev/",
  leadfairProduction: "https://leadfair.exhibition2world.ir",
  leadfairPagesApex: "https://leadfair.pages.dev",
  leadfairSeo: "https://master.leadfair.pages.dev/seo-lead",
  leadfairRagUi: "https://master.leadfair.pages.dev/rag/",
  hfLeadfair: "https://huggingface.co/spaces/sosa123454321/leadfair-ai-iran-confair-1405",
  hfRag1: "https://huggingface.co/spaces/sosa123454321/Exhibition-connector-rag1",
  hfRag2Static: "https://huggingface.co/spaces/SoSa123456/Exhibition-connector-rag2-static",
  hfRag2Live: "https://sosa123454321-exhibition-connector-rag2-vercel.static.hf.space/",
  hfRag2Fixed: "https://huggingface.co/spaces/sosa123454321/Exhibition-connector-rag2-vercel",
  hfRag2Notebooks: "https://huggingface.co/spaces/SoSa123456/Exhibition-connector-rag2-static/tree/main/notebooks",
  hfRag2Companies: "https://sosa123456-exhibition-connector-rag2-static.static.hf.space/data/companies.json",
  hfSeocontent: "https://huggingface.co/spaces/SoSa123456/Seocontent",
  hfClinic: "https://huggingface.co/spaces/SoSa123456/clinic-lead-agent",
  exhibitionTelegram: "https://t.me/exhibition_ai_bot",
  exhibitionBale: "https://ble.ir/exhibition_bot",
} as const;

export type ConnectorStatus = {
  id: string;
  label: string;
  url: string;
  ok: boolean;
  detail: string;
};

export async function probe(url: string, timeoutMs = 8000): Promise<{ ok: boolean; status: number; snippet: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store", redirect: "follow" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, snippet: text.slice(0, 180) };
  } catch (error) {
    return { ok: false, status: 0, snippet: error instanceof Error ? error.message : "network" };
  } finally {
    clearTimeout(timer);
  }
}

/** Hub pages on huggingface.co/spaces/* return HTML 200 even when the Space is paused. */
export function classifyHfHubPage(snippet: string, status: number) {
  const text = snippet.toLowerCase();
  if (text.includes("paused") || text.includes("this space is paused")) {
    return { live: false, reason: "Space روی HF متوقف است" };
  }
  if (status === 403 || text.includes("quota") || text.includes("exceeded")) {
    return { live: false, reason: "سهمیه CPU هاگینگ‌فیس" };
  }
  if (text.includes("runtime error") || text.includes("sleeping")) {
    return { live: false, reason: "Space خواب/خطای اجرا" };
  }
  return {
    live: false,
    reason: "صفحه هاب HF است نه اپ در حال اجرا — HTML ۲۰۰ را وصل حساب نکن",
  };
}
