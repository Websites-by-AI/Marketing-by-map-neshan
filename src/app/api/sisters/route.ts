import sisters from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    ...sisters,
    cooperationModels,
  });
}
