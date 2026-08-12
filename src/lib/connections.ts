import { db, hasDatabase } from "@/db";
import { CONNECTORS, classifyHfHubPage, probe } from "@/lib/connectors";
import { loadMemoryNotes } from "@/lib/memory";
import { listCollectionRuns } from "@/lib/persist";

export type ConnectionItem = {
  id: string;
  group: "database" | "core" | "api" | "external" | "not-wired";
  name: string;
  connected: boolean;
  mode: "live" | "json" | "kv" | "proxy" | "demo" | "off";
  detail: string;
  url?: string;
};

export const CONNECTION_FACTS = {
  database: {
    engine: "PostgreSQL + Drizzle (schema only)",
    tables: ["businesses", "collection_runs"],
    live: false,
    reason:
      "src/db/index.ts sets db = null and hasDatabase = false so the Cloudflare Worker does not bundle pg. No DATABASE_URL, no local Postgres on :5432, no Hyperdrive/D1/Supabase. D1 account is already at the 10-database cap. collection_runs now persist on KV AGENT_MEMORY instead.",
    liveHealth: { mode: "demo", database: false, neshan: false },
    fallback:
      "/api/businesses returns 24 Saadatabad demo rows. Exhibition 440 and oil 1730 come from JSON/RAG, not Postgres. POST /api/collections writes a run into KV when the binding is live.",
  },
  kv: {
    binding: "AGENT_MEMORY",
    id: "4ea51f7cafaf47efb73a366098015e3d",
    live: true,
    detail: "POST /api/memory persists. GET /api/memory reports kvBound=true. collection_runs also use this KV.",
  },
} as const;

export async function buildConnectionReport() {
  const [memory, runs, rag, rag2, hfRag2, hfLeadfair, telegram, leadfairApex, leadfairCustom] = await Promise.all([
    loadMemoryNotes(),
    listCollectionRuns(),
    probe(`${CONNECTORS.leadfairRagApi}/api/health`),
    probe("https://rag2.exhibition2world.ir/api/health"),
    probe(CONNECTORS.hfRag2Live),
    probe(CONNECTORS.hfLeadfair),
    (async () => {
      const token = process.env.EXHIBITION_TELEGRAM_BOT_TOKEN?.trim();
      if (!token) return { ok: false, snippet: "token not set on this request" };
      return probe(`https://api.telegram.org/bot${token}/getMe`);
    })(),
    probe(CONNECTORS.leadfairPagesApex),
    probe(CONNECTORS.leadfairProduction),
  ]);

  const chatId = Boolean(process.env.EXHIBITION_TELEGRAM_CHAT_ID?.trim());
  const neshan = Boolean(process.env.NESHAN_API_KEY?.trim());
  const hfHub = classifyHfHubPage(hfLeadfair.snippet, hfLeadfair.status);
  const leadfairLooksUp = (row: { ok: boolean; status: number; snippet: string }) =>
    row.ok &&
    row.status === 200 &&
    !row.snippet.includes("error code: 1042") &&
    !/page not found|deployment not found/i.test(row.snippet);
  const leadfairProdUp = leadfairLooksUp(leadfairCustom) || leadfairLooksUp(leadfairApex);

  const items: ConnectionItem[] = [
    {
      id: "postgres",
      group: "database",
      name: "PostgreSQL / Drizzle",
      connected: false,
      mode: "off",
      detail: CONNECTION_FACTS.database.reason,
    },
    {
      id: "kv-memory",
      group: "database",
      name: "Cloudflare KV AGENT_MEMORY",
      connected: memory.kvBound,
      mode: memory.kvBound ? "kv" : "off",
      detail: memory.kvBound
        ? `وصل است — ${memory.notes.length} یادداشت`
        : "KV bind نشده؛ POST فقط در همان درخواست می‌ماند",
      url: "/api/memory",
    },
    {
      id: "kv-collections",
      group: "database",
      name: "تاریخچه جمع‌آوری روی KV",
      connected: runs.kvBound,
      mode: runs.kvBound ? "kv" : "off",
      detail: runs.kvBound
        ? `${runs.runs.length} اجرای ذخیره‌شده — جایگزین collection_runs پستگرس`
        : "KV نیست؛ اجرای جمع‌آوری فقط در پاسخ همان درخواست است",
      url: "/api/collections",
    },
    {
      id: "exhibition-json",
      group: "core",
      name: "لیست ساختمان ۱۴۰۵",
      connected: true,
      mode: "json",
      detail: "۴۴۰ غرفه از iranconfair-26.json — نه از دیتابیس",
      url: "/api/exhibition",
    },
    {
      id: "confair-25",
      group: "core",
      name: "همپوشانی دوره ۲۵ و ۲۶",
      connected: true,
      mode: "json",
      detail: "Returning / New / Dropped از لیست رسمی iccexpo دوره ۲۵",
      url: "/cohort",
    },
    {
      id: "oil-json",
      group: "core",
      name: "دیتاست نفت ۲۹",
      connected: true,
      mode: "json",
      detail: "۱۷۳۰ شرکت داخل همین Worker + همپوشانی ۱۷ نام",
      url: "/api/oil",
    },
    {
      id: "sisters",
      group: "core",
      name: "کاتالوگ خواهرها",
      connected: true,
      mode: "json",
      detail: "۱۲ حوزه / ۵۷ استارتاپ از JSON — بدون Postgres",
      url: "/sisters",
    },
    {
      id: "audit",
      group: "core",
      name: "صحت iccexpo",
      connected: true,
      mode: "json",
      detail: "مقایسه لندینگ با لیست رسمی",
      url: "/api/audit",
    },
    {
      id: "related",
      group: "core",
      name: "شبکه همسایگی",
      connected: true,
      mode: hasDatabase ? "live" : "demo",
      detail: hasDatabase ? "از جدول businesses" : "از ۴۴۰ غرفه JSON / دمو تهران",
      url: "/api/related",
    },
    {
      id: "rag-vercel",
      group: "api",
      name: "LeadFair RAG (Vercel)",
      connected: rag.ok && rag.snippet.includes("exhibition-rag"),
      mode: "live",
      detail: rag.ok ? rag.snippet.slice(0, 160) : rag.snippet,
      url: `${CONNECTORS.leadfairRagApi}/api/health`,
    },
    {
      id: "rag2-cf",
      group: "api",
      name: "RAG2 پروکسی کلادفلر",
      connected: rag2.ok && rag2.snippet.includes("exhibition-rag"),
      mode: "proxy",
      detail: rag2.ok ? "همان API نفت روی rag2.exhibition2world.ir" : rag2.snippet,
      url: "https://rag2.exhibition2world.ir/api/health",
    },
    {
      id: "leadfair-production",
      group: "api",
      name: "LeadFair دامنه تولید",
      connected: leadfairProdUp,
      mode: leadfairProdUp ? "live" : "off",
      detail: leadfairProdUp
        ? "leadfair.pages.dev و leadfair.exhibition2world.ir زنده است (production_branch=master)"
        : "دامنه تولید هنوز ۴۰۴ است — پیش‌نمایش master.leadfair.pages.dev را ببینید",
      url: CONNECTORS.leadfairProduction,
    },
    {
      id: "combined-search",
      group: "api",
      name: "جستجوی ترکیبی ساختمان+نفت",
      connected: true,
      mode: "proxy",
      detail: "/api/connectors/search = JSON محلی ۴۴۰ + RAG زنده",
      url: "/api/connectors/search?q=لوله",
    },
    {
      id: "seo-local",
      group: "api",
      name: "تحلیل سئو غرفه",
      connected: true,
      mode: "live",
      detail: "منطق همین سایت؛ Adv-seo-2 Python صدا زده نمی‌شود",
      url: "/connect",
    },
    {
      id: "hf-rag2",
      group: "external",
      name: "Hugging Face RAG2 vercel space",
      connected: hfRag2.ok,
      mode: hfRag2.ok ? "live" : "off",
      detail: hfRag2.ok ? "فرانت استاتیک زنده" : hfRag2.snippet.slice(0, 120),
      url: CONNECTORS.hfRag2Live,
    },
    {
      id: "telegram-bot",
      group: "external",
      name: "تلگرام @exhibition_ai_bot",
      connected: telegram.ok,
      mode: telegram.ok ? "live" : "off",
      detail: telegram.ok ? "getMe زنده است" : telegram.snippet.slice(0, 140),
      url: CONNECTORS.exhibitionTelegram,
    },
    {
      id: "telegram-notify",
      group: "not-wired",
      name: "ارسال پیام تلگرام",
      connected: false,
      mode: "off",
      detail: chatId
        ? "CHAT_ID هست ولی این گزارش notify را تست نکرد"
        : "EXHIBITION_TELEGRAM_CHAT_ID تنظیم نشده — POST /api/connectors/notify = ۴۲۴",
    },
    {
      id: "neshan",
      group: "not-wired",
      name: "API جستجوی نشان",
      connected: false,
      mode: "off",
      detail: neshan
        ? "کلید هست ولی بدون Postgres ذخیره در جدول businesses نمی‌شود؛ تاریخچه روی KV است"
        : "NESHAN_API_KEY روی Worker نیست — جمع‌آوری نشان فقط دمو ۲۴تایی است",
    },
    {
      id: "postgres-persist",
      group: "not-wired",
      name: "ذخیره لید / collection_runs در Postgres",
      connected: Boolean(db) && hasDatabase,
      mode: "off",
      detail: "جدول‌ها در schema هستند ولی هیچ هاست Postgres وصل نیست. جایگزین: KV collection-runs",
    },
    {
      id: "bale",
      group: "not-wired",
      name: "بله exhibition_bot",
      connected: false,
      mode: "off",
      detail: "توکن در کد نیست؛ فقط لینک ble.ir/exhibition_bot. برای وصل شدن باید secret روی Worker ست شود نه در گیت",
    },
    {
      id: "hf-leadfair-1405",
      group: "not-wired",
      name: "HF leadfair-ai-iran-confair-1405",
      connected: false,
      mode: "off",
      detail: hfHub.reason,
      url: CONNECTORS.hfLeadfair,
    },
    {
      id: "adv-seo-2-python",
      group: "not-wired",
      name: "Adv-seo-2 enrich / import / send",
      connected: false,
      mode: "off",
      detail: "لینک و UI هست؛ Worker به Python Clinic Signal وصل نیست",
    },
    {
      id: "r2-firebase-railway",
      group: "not-wired",
      name: "R2 / Firebase / Railway / PostZen",
      connected: false,
      mode: "off",
      detail: "R2 روی حساب فعال نیست. Firebase و Railway و PostZen سیم نشده‌اند",
    },
  ];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    database: {
      ...CONNECTION_FACTS.database,
      hasDatabase,
      dbObject: Boolean(db),
      liveHealth: { mode: "demo" as const, database: false, neshan },
    },
    kv: {
      ...CONNECTION_FACTS.kv,
      bound: memory.kvBound,
      notes: memory.notes.length,
      collectionRuns: runs.runs.length,
    },
    summary: {
      connected: items.filter((row) => row.connected).length,
      disconnected: items.filter((row) => !row.connected).length,
    },
    items,
  };
}
