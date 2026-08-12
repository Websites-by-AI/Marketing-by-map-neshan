import { buildConnectionReport } from "@/lib/connections";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await buildConnectionReport());
}
