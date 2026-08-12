import { db } from "@/db";
import { businesses } from "@/db/schema";
import {
  buildLocalNetworkClusters,
  buildMapLinks,
  demoBusinesses,
  findRelatedCompanies,
  toBusinessRecord,
  type BusinessRecord,
} from "@/lib/business-data";
import { exhibitionBusinesses } from "@/lib/exhibition";

export const dynamic = "force-dynamic";

async function loadRecords(): Promise<BusinessRecord[]> {
  if (db) {
    try {
      const allRows = await db.select().from(businesses);
      const mapped = allRows.map(toBusinessRecord);
      if (mapped.length) return mapped;
    } catch {
      // demo fallback
    }
  }
  return exhibitionBusinesses.length ? exhibitionBusinesses : demoBusinesses;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessIdRaw = searchParams.get("businessId");
  const businessId = businessIdRaw == null || businessIdRaw === "" ? NaN : Number(businessIdRaw);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  const lat = latRaw == null || latRaw === "" ? NaN : Number(latRaw);
  const lng = lngRaw == null || lngRaw === "" ? NaN : Number(lngRaw);
  const radiusParam = Number(searchParams.get("radius") ?? 900);
  const radius = Number.isFinite(radiusParam) ? Math.min(2000, Math.max(100, radiusParam)) : 900;
  const effective = await loadRecords();

  if (Number.isInteger(businessId) && businessId !== 0) {
    const target = effective.find((b) => b.id === businessId);
    if (!target) return Response.json({ message: "Business not found" }, { status: 404 });
    const related = findRelatedCompanies(target, effective, radius, 10).map((r) => ({
      ...r,
      mapLinks: buildMapLinks(r),
    }));
    return Response.json({
      target: { ...target, mapLinks: buildMapLinks(target) },
      radius,
      related,
      connections: related.map((r) => ({
        from: target.id,
        to: r.id,
        distanceMeters: r.distanceMeters,
        reason: r.connectionReason,
        type: r.connectionType,
      })),
    });
  }

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const fakeTarget = {
      ...demoBusinesses[0],
      id: 0,
      name: "نقطه مرکزی",
      category: "مرکز جستجو",
      address: `${lat}, ${lng}`,
      latitude: lat,
      longitude: lng,
      websiteFound: false,
      leadScore: 0,
    };

    const related = findRelatedCompanies(fakeTarget, effective, radius, 15).map((r) => ({
      ...r,
      mapLinks: buildMapLinks(r),
    }));
    const clusters = buildLocalNetworkClusters(effective).slice(0, 6);
    return Response.json({ center: { lat, lng }, radius, count: related.length, related, clusters });
  }

  const clusters = buildLocalNetworkClusters(effective);
  const problemHotspots = clusters.filter((c) => c.problemCount >= 2).sort((a, b) => b.problemCount - a.problemCount);
  return Response.json({
    total: effective.length,
    clusters: clusters.slice(0, 10),
    problemHotspots: problemHotspots.slice(0, 6),
    stats: {
      all: effective.length,
      critical: effective.filter((b) => !b.websiteFound || b.qualityScore < 50).length,
      withWebsite: effective.filter((b) => b.websiteFound).length,
      avgLead: Math.round(effective.reduce((sum, b) => sum + b.leadScore, 0) / Math.max(1, effective.length)),
    },
  });
}
