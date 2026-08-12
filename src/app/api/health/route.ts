import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  let database = false;
  if (db) {
    try {
      await db.execute(sql`select 1`);
      database = true;
    } catch {
      database = false;
    }
  }

  return Response.json({
    ok: true,
    mode: database ? "live" : "demo",
    database,
    neshan: Boolean(process.env.NESHAN_API_KEY?.trim()),
  });
}
