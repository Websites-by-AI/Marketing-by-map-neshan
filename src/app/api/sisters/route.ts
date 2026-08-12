import cloudflareSites from "@/data/cloudflare-sites.json";
import network from "@/data/cooperation-network.json";
import sisters from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";
import { sistersStats } from "@/lib/sisters";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stats = sistersStats();
  const url = new URL(request.url);
  const publicView = url.searchParams.get("view") === "public";
  const payload = publicView
    ? {
        holding: sisters.holding,
        tagline: sisters.tagline,
        scoringNote: sisters.scoringNote,
        items: sisters.items.map((item) => ({
          slug: item.slug,
          name: item.name,
          en: item.en,
          role: item.role,
          startups: item.startups.map((startup) => ({
            id: startup.id,
            name: startup.name,
            description: startup.description,
            tags: startup.tags,
            score: startup.score,
            stage: startup.stage,
            stageId: startup.stageId,
            nextSteps: startup.nextSteps,
            screenshot: startup.screenshot,
            website: startup.website,
            ready: startup.ready,
          })),
        })),
      }
    : {
        ...sisters,
        cloudflareSites,
        network,
        cooperationModels,
      };
  return Response.json({
    ok: true,
    ...payload,
    fieldCount: stats.fields,
    startupCount: stats.startups,
    stats,
  });
}
