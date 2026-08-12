import { db } from "@/db";
import { businesses } from "@/db/schema";
import { demoBusinesses, toBusinessRecord } from "@/lib/business-data";
import { desc, eq, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (db) {
    try {
      const where = query
        ? or(
            ilike(businesses.name, `%${query}%`),
            ilike(businesses.category, `%${query}%`),
            ilike(businesses.address, `%${query}%`),
          )
        : undefined;

      const rows = await db
        .select()
        .from(businesses)
        .where(where)
        .orderBy(desc(businesses.leadScore), desc(businesses.updatedAt))
        .limit(100);

      if (rows.length) {
        return Response.json({ items: rows.map(toBusinessRecord), source: "database" });
      }
    } catch {
      // fall through to demo catalog
    }
  }

  const items = demoBusinesses.filter((row) => {
    if (!query) return true;
    return `${row.name} ${row.category} ${row.address}`.toLowerCase().includes(query);
  });

  return Response.json({ items, source: "demo" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: number; leadScore?: number };

  if (!body.id || typeof body.leadScore !== "number") {
    return Response.json({ message: "شناسه و امتیاز لید معتبر نیست." }, { status: 400 });
  }

  if (!db) {
    const item = demoBusinesses.find((row) => row.id === body.id);
    if (!item) return Response.json({ message: "کسب‌وکار پیدا نشد." }, { status: 404 });
    return Response.json({
      item: { ...item, leadScore: Math.max(0, Math.min(100, Math.round(body.leadScore))) },
      source: "demo",
    });
  }

  const [updated] = await db
    .update(businesses)
    .set({
      leadScore: Math.max(0, Math.min(100, Math.round(body.leadScore))),
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, body.id))
    .returning();

  if (!updated) {
    return Response.json({ message: "کسب‌وکار پیدا نشد." }, { status: 404 });
  }

  return Response.json({ item: toBusinessRecord(updated) });
}
