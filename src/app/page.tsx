import MarketIntelligenceDashboard from "@/components/market-intelligence-dashboard";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { demoBusinesses, toBusinessRecord, type BusinessRecord } from "@/lib/business-data";
import { exhibitionBusinesses } from "@/lib/exhibition";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let liveRecords: BusinessRecord[] = [];
  let mode: "live" | "demo" = "demo";

  if (db) {
    try {
      const rows = await db
        .select()
        .from(businesses)
        .orderBy(desc(businesses.leadScore), desc(businesses.updatedAt))
        .limit(100);
      if (rows.length) {
        liveRecords = rows.map(toBusinessRecord);
        mode = "live";
      }
    } catch {
      liveRecords = [];
      mode = "demo";
    }
  }

  return (
    <MarketIntelligenceDashboard
      initialRecords={liveRecords.length ? liveRecords : exhibitionBusinesses}
      tehranRecords={demoBusinesses}
      exhibitionRecords={exhibitionBusinesses}
      mode={mode}
      hasNeshanKey={Boolean(process.env.NESHAN_API_KEY?.trim())}
      defaultSource="exhibition"
    />
  );
}
