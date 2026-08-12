import { CONNECTORS } from "@/lib/connectors";
import { exhibitionBusinesses } from "@/lib/exhibition";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json({ ok: false, error: "q is required" }, { status: 400 });
  const needle = q.toLowerCase();

  const local = exhibitionBusinesses
    .filter((row) => `${row.name} ${row.category} ${row.address}`.toLowerCase().includes(needle))
    .slice(0, 8)
    .map((row) => ({
      source: "iranconfair-1405",
      company: row.name,
      activity: row.category,
      hall: row.address,
      website: row.website ? `https://${row.website}` : null,
      phone: row.phone,
      leadScore: row.leadScore,
    }));

  let rag: unknown = null;
  let ragError: string | null = null;
  try {
    const res = await fetch(`${CONNECTORS.leadfairRagApi}/api/search?q=${encodeURIComponent(q)}&limit=5`, {
      cache: "no-store",
    });
    rag = await res.json();
  } catch (error) {
    ragError = error instanceof Error ? error.message : "rag failed";
  }

  return Response.json({
    ok: true,
    question: q,
    localCount: local.length,
    local,
    leadfairRag: rag,
    ragError,
  });
}
