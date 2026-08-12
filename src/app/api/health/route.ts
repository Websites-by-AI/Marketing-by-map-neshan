import { db } from "@/db";
import { sql } from "drizzle-orm";
import { listCollectionRuns } from "@/lib/persist";
import { loadMemoryNotes } from "@/lib/memory";

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

  const [memory, runs] = await Promise.all([loadMemoryNotes(), listCollectionRuns()]);

  return Response.json({
    ok: true,
    mode: database ? "live" : "demo",
    database,
    postgres: false,
    kv: memory.kvBound,
    collectionRuns: runs.runs.length,
    neshan: Boolean(process.env.NESHAN_API_KEY?.trim()),
  });
}
