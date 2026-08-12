import { exhibitionCohort, cohortStats } from "@/lib/exhibition-cohort";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    stats: cohortStats(),
    ...exhibitionCohort,
  });
}
