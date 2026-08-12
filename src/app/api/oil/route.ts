import overlap from "@/data/oil-rag-overlap.json";
import { CONNECTORS } from "@/lib/connectors";
import { oilExhibitionMeta } from "@/lib/oil-exhibition";

export const dynamic = "force-dynamic";

export async function GET() {
  let live: unknown = null;
  let liveError: string | null = null;
  try {
    const res = await fetch(`${CONNECTORS.leadfairRagApi}/api/next-exhibition`, { cache: "no-store" });
    live = await res.json();
  } catch (error) {
    liveError = error instanceof Error ? error.message : "live oil api failed";
  }

  return Response.json({
    ok: true,
    officialList: false,
    dataset: oilExhibitionMeta,
    overlapWithConfair: overlap,
    liveForecast: live,
    liveError,
    warning: "liveForecast فهرست رسمی دوره بعد نیست. dataset از دوره ۲۹ است.",
  });
}
