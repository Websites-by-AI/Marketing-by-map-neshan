import { db } from "@/db";
import { businesses } from "@/db/schema";
import { toBusinessRecord } from "@/lib/business-data";
import { desc, eq, ilike, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

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

  return Response.json({ items: rows.map(toBusinessRecord) });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: number; leadScore?: number };

  if (!body.id || typeof body.leadScore !== "number") {
    return Response.json({ message: "شناسه و امتیاز لید معتبر نیست." }, { status: 400 });
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
