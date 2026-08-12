import { buildSiteAudit } from "@/lib/site-audit";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(buildSiteAudit());
}
