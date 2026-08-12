import related from "@/data/related-modules.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    source: "Adv-seo-2 + IRAN CONFAIR 1405 + Hugging Face SoSa123456",
    plan: "/IMPROVEMENT_PLAN.md",
    ...related,
  });
}
