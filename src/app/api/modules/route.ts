import related from "@/data/related-modules.json";
import sisters from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";
import { oilExhibitionMeta, oilStats } from "@/lib/oil-exhibition";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    source: "Adv-seo-2 + IRAN CONFAIR 1405 + Iran Oil Show 29 + sister startups",
    plan: "/IMPROVEMENT_PLAN.md",
    ...related,
    oilExhibition: { ...oilExhibitionMeta, stats: oilStats },
    sisterCompanies: sisters,
    cooperationModels,
  });
}
