import MarketIntelligenceDashboard from "@/components/market-intelligence-dashboard";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { toBusinessRecord, type BusinessRecord } from "@/lib/business-data";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let records: BusinessRecord[] = [];

  try {
    const rows = await db
      .select()
      .from(businesses)
      .orderBy(desc(businesses.leadScore), desc(businesses.updatedAt))
      .limit(100);
    records = rows.map(toBusinessRecord);
  } catch {
    // The UI stays useful before the first database bootstrap.
    records = [];
  }

  return <MarketIntelligenceDashboard initialRecords={records} />;
}
