import { db } from "@/db";
import { businesses, collectionRuns } from "@/db/schema";
import { generateWebsitePrompt, toBusinessRecord } from "@/lib/business-data";
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

  const [run] = await db
    .insert(collectionRuns)
    .values({
      searchTerm: term,
      latitude: String(latitude),
      longitude: String(longitude),
      status: "running",
    })
    .returning();

  const apiKey = process.env.NESHAN_API_KEY;
  if (!apiKey) {
    await db
      .update(collectionRuns)
      .set({
        status: "blocked",
        errorMessage: "متغیر NESHAN_API_KEY در محیط سرور تنظیم نشده است.",
        completedAt: new Date(),
      })
      .where(eq(collectionRuns.id, run.id));

    return Response.json(
      {
        message: "برای اجرای جمع‌آوری واقعی، متغیر NESHAN_API_KEY را در محیط سرور تنظیم کنید.",
        runId: run.id,
      },
      { status: 424 },
    );
  }

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
    const saved = [];

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

    return Response.json({ runId: run.id, count: saved.length, items: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای ناشناخته در دریافت داده از نشان";
    await db
      .update(collectionRuns)
      .set({ status: "failed", errorMessage: message, completedAt: new Date() })
      .where(eq(collectionRuns.id, run.id));

    return Response.json({ message, runId: run.id }, { status: 502 });
  }
}
