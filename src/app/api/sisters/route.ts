import cloudflareSites from "@/data/cloudflare-sites.json";
import network from "@/data/cooperation-network.json";
import sisters from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const startupCount = sisters.items.reduce((sum, item) => sum + item.startups.length, 0);
  return Response.json({
    ok: true,
    ...sisters,
    fieldCount: sisters.items.length,
    startupCount,
    sources: sisters.sources,
    cloudflareSites,
    network,
    cooperationModels,
  });
}
