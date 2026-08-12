import { db } from "@/db";
import { businesses, collectionRuns } from "@/db/schema";
import { collectFromDemoCatalog, generateWebsitePrompt, toBusinessRecord, type BusinessRecord } from "@/lib/business-data";
import { appendCollectionRun, listCollectionRuns } from "@/lib/persist";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type NeshanSearchItem = {
  title?: string;
  address?: string;
  neighbourhood?: string;
  region?: string;
  type?: string;
  category?: string;
  location?: { x?: number; y?: number };
};

type NeshanSearchResponse = {
  count?: number;
  items?: NeshanSearchItem[];
};

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { term?: string; latitude?: number; longitude?: number };
  const term = stringValue(body.term, "کسب و کار");
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return Response.json({ message: "مختصات مرکز جست‌وجو معتبر نیست." }, { status: 400 });
  }

  const apiKey = process.env.NESHAN_API_KEY?.trim();

  if (!apiKey || !db) {
    const items = collectFromDemoCatalog(term, latitude, longitude);
    const saved = await appendCollectionRun({
      term,
      latitude,
      longitude,
      status: "demo",
      count: items.length,
      source: "demo",
    });
    return Response.json({
      runId: saved.run.id,
      persisted: saved.persisted,
      persist: saved.persisted ? "kv" : "none",
      count: items.length,
      items,
      source: "demo",
      message: apiKey
        ? "پستگرس نیست؛ نتایج نمونه آماده شد و تاریخچه روی KV ذخیره شد."
        : "کلید نشان تنظیم نشده؛ نتایج نمونه غرب تهران آماده شد و تاریخچه روی KV ذخیره شد.",
    });
  }

  const [run] = await db
    .insert(collectionRuns)
    .values({
      searchTerm: term,
      latitude: String(latitude),
      longitude: String(longitude),
      status: "running",
    })
    .returning();

  try {
    const query = new URLSearchParams({
      term,
      lat: String(latitude),
      lng: String(longitude),
    });
    const response = await fetch(`https://api.neshan.org/v1/search?${query.toString()}`, {
      headers: { "Api-Key": apiKey },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Neshan API ${response.status}: ${detail.slice(0, 220)}`);
    }

    const payload = (await response.json()) as NeshanSearchResponse;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const saved: BusinessRecord[] = [];

    for (const item of items) {
      const name = stringValue(item.title, "کسب‌وکار بدون نام");
      const category = stringValue(item.category, stringValue(item.type, "سایر"));
      const address = stringValue(item.address, stringValue(item.region, "آدرس ثبت نشده"));
      const lat = item.location?.y;
      const lng = item.location?.x;
      const neshanId = `neshan:${name}:${lat ?? ""}:${lng ?? ""}`;
      const prompt = generateWebsitePrompt({
        name,
        category,
        address,
        phone: undefined,
        website: undefined,
        websiteQuality: "در صف بررسی - تازه از نشان",
        qualityScore: 0,
        hasOnlineOrder: false,
        hasBooking: false,
        hasContactPage: false,
        hasSocialLinks: false,
        technologies: [],
        leadScore: 85,
      });

      const [business] = await db
        .insert(businesses)
        .values({
          neshanId,
          name,
          category,
          address,
          city: stringValue(item.region?.split("،")[0], "تهران"),
          latitude: Number.isFinite(lat) ? String(lat) : null,
          longitude: Number.isFinite(lng) ? String(lng) : null,
          websiteFound: false,
          websiteStatus: "not_checked",
          websiteQuality: "در صف بررسی - پرامپت آماده",
          websitePrompt: prompt,
          qualityScore: 0,
          leadScore: 85,
          source: "neshan-search",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: businesses.neshanId,
          set: {
            name,
            category,
            address,
            latitude: Number.isFinite(lat) ? String(lat) : null,
            longitude: Number.isFinite(lng) ? String(lng) : null,
            websitePrompt: prompt,
            source: "neshan-search",
            updatedAt: new Date(),
          },
        })
        .returning();
      saved.push(toBusinessRecord(business));
    }

    await db
      .update(collectionRuns)
      .set({ status: "completed", resultsCount: saved.length, completedAt: new Date() })
      .where(eq(collectionRuns.id, run.id));

    await appendCollectionRun({
      id: `pg-${run.id}`,
      term,
      latitude,
      longitude,
      status: "completed",
      count: saved.length,
      source: "neshan",
    });
    return Response.json({ runId: run.id, count: saved.length, items: saved, source: "neshan" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای ناشناخته در دریافت داده از نشان";
    await db
      .update(collectionRuns)
      .set({ status: "failed", errorMessage: message, completedAt: new Date() })
      .where(eq(collectionRuns.id, run.id));

    const fallback = collectFromDemoCatalog(term, latitude, longitude);
    await appendCollectionRun({
      id: `pg-${run.id}`,
      term,
      latitude,
      longitude,
      status: "failed",
      count: fallback.length,
      source: "demo-fallback",
      error: message,
    });
    return Response.json(
      {
        message: `${message} — نتایج نمونه به‌عنوان جایگزین بارگذاری شد.`,
        runId: run.id,
        count: fallback.length,
        items: fallback,
        source: "demo-fallback",
      },
      { status: 200 },
    );
  }
}

export async function GET() {
  const payload = await listCollectionRuns();
  return Response.json({
    ok: true,
    persist: payload.kvBound ? "kv" : "none",
    count: payload.runs.length,
    runs: payload.runs,
  });
}
