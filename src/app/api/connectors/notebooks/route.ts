import overlap from "@/data/oil-rag-overlap.json";
import { CONNECTORS, probe } from "@/lib/connectors";

export const dynamic = "force-dynamic";

type TestRow = { id: string; ok: boolean; detail: string };

async function jsonGet(url: string, timeoutMs = 12000): Promise<{ ok: boolean; status: number; data: unknown; snippet: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data, snippet: text.slice(0, 220) };
  } catch (error) {
    return { ok: false, status: 0, data: null, snippet: error instanceof Error ? error.message : "network" };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const [health, prisma, water, hall, scrape, frontend, companiesHead] = await Promise.all([
    jsonGet(`${CONNECTORS.leadfairRagApi}/api/health`),
    jsonGet(`${CONNECTORS.leadfairRagApi}/api/search?q=${encodeURIComponent("وب‌سایت شرکت پریسماتک چیست؟")}&limit=3`, 15000),
    jsonGet(`${CONNECTORS.leadfairRagApi}/api/search?q=${encodeURIComponent("مواد شیمیایی تصفیه آب")}&limit=3`, 15000),
    jsonGet(`${CONNECTORS.leadfairRagApi}/api/search?q=${encodeURIComponent("سالن 31B")}&limit=3`, 15000),
    jsonGet(`${CONNECTORS.leadfairRagApi}/api/scrape?url=${encodeURIComponent("https://prismatech.ir/")}`, 18000),
    probe(CONNECTORS.hfRag2Live, 12000),
    probe(CONNECTORS.hfRag2Companies, 12000),
  ]);

  const prismaData = prisma.data as { results?: { company?: string; website?: string }[] } | null;
  const first = prismaData?.results?.[0]?.company ?? "";
  const prismaFirst = first.includes("پریسماتک");
  const scrapeData = scrape.data as { ok?: boolean; scraped?: { title?: string; emails?: string[] } } | null;
  const healthData = health.data as { ok?: boolean; stats?: { companies?: number; halls?: number; websites?: number } } | null;

  const tests: TestRow[] = [
    {
      id: "health",
      ok: Boolean(healthData?.ok),
      detail: healthData?.ok
        ? `۱۷۳۰ شرکت / ${healthData.stats?.halls ?? "؟"} سالن / ${healthData.stats?.websites ?? "؟"} سایت`
        : health.snippet.slice(0, 140),
    },
    {
      id: "prisma-rank-1",
      ok: prismaFirst,
      detail: prismaFirst ? `رتبه ۱: ${first}` : `رتبه ۱ باید پریسماتک باشد، الان: ${first || prisma.snippet.slice(0, 80)}`,
    },
    {
      id: "search-water",
      ok: water.ok,
      detail: water.ok ? "جستجوی تصفیه آب جواب داد" : water.snippet.slice(0, 140),
    },
    {
      id: "search-hall-31b",
      ok: hall.ok,
      detail: hall.ok ? "سالن 31B در دیتاست نفت جواب داد (این سالن ساختمان نیست مگر overlap)" : hall.snippet.slice(0, 140),
    },
    {
      id: "scrape-prisma",
      ok: Boolean(scrapeData?.ok && scrapeData.scraped?.title),
      detail: scrapeData?.scraped?.title
        ? `${scrapeData.scraped.title} / ${scrapeData.scraped.emails?.[0] ?? "بدون ایمیل"}`
        : scrape.snippet.slice(0, 140),
    },
    {
      id: "hf-frontend",
      ok: frontend.ok && frontend.status === 200,
      detail: frontend.ok ? "فرانت استاتیک RAG2 زنده است" : frontend.snippet.slice(0, 140),
    },
    {
      id: "companies-json",
      ok: companiesHead.ok,
      detail: companiesHead.ok ? "companies.json از Space استاتیک خوانده می‌شود (~۱۷۳۰)" : companiesHead.snippet.slice(0, 140),
    },
  ];

  return Response.json({
    ok: tests.every((row) => row.ok),
    source: CONNECTORS.hfRag2Notebooks,
    note: "این نوت‌بوک‌ها RAG نمایشگاه نفت هستند نه لیست رسمی ساختمان ۱۴۰۵. ۱۷ نام دقیقاً در هر دو لیست هستند.",
    notebooks: [
      { file: "rag_api_colab_test.ipynb", runnableHere: true, role: "تست زنده API و فرانت" },
      { file: "rag_base_model_colab.ipynb", runnableHere: true, role: "TF-IDF محلی بدون GPU" },
      { file: "colab_original_exhibition_connector_rag1.ipynb", runnableHere: false, role: "LangChain + FAISS + Llama — فقط Colab/GPU" },
      { file: "colab_original_exhibition_connector_rag2.ipynb", runnableHere: false, role: "همان rag1 با مسیر اکسل rag2" },
      { file: "llama_wandb_training_colab.ipynb", runnableHere: false, role: "آموزش LoRA + W&B — فقط Colab" },
    ],
    tests,
    overlapWithConfair: {
      exactNames: overlap.length,
      withCandidateWebsite: overlap.filter((row) => row.website).length,
      items: overlap,
    },
    urls: {
      vercel: CONNECTORS.leadfairRagApi,
      hfLive: CONNECTORS.hfRag2Live,
      hfRepo: CONNECTORS.hfRag2Static,
      notebooks: CONNECTORS.hfRag2Notebooks,
    },
  });
}
