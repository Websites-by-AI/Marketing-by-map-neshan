import { db } from "@/db";
import { businesses } from "@/db/schema";
import { findRelatedCompanies, buildLocalNetworkClusters, toBusinessRecord, buildMapLinks, demoBusinesses } from "@/lib/business-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = Number(searchParams.get("businessId"));
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radiusParam = Number(searchParams.get("radius") ?? 900);
  const radius = Number.isFinite(radiusParam) ? Math.min(2000, Math.max(100, radiusParam)) : 900;

  let effective: ReturnType<typeof toBusinessRecord>[] = [];
  try {
    const allRows = await db.select().from(businesses);
    const mapped = allRows.map(toBusinessRecord);
    effective = mapped.length ? mapped : (demoBusinesses as unknown as ReturnType<typeof toBusinessRecord>[]);
  } catch {
    effective = demoBusinesses as unknown as ReturnType<typeof toBusinessRecord>[];
  }

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
      id: 0,
      neshanId: null,
      name: "نقطه مرکزی",
      category: "مرکز جستجو",
      address: `${lat}, ${lng}`,
      city: "تهران",
      latitude: lat,
      longitude: lng,
      phone: null,
      website: null,
      websiteTitle: null,
      websiteFound: false,
      websiteStatus: "unknown",
      websiteQuality: "مرکز",
      websitePrompt: null,
      qualityScore: 0,
      digitalMaturity: 0,
      hasOnlineOrder: false,
      hasBooking: false,
      hasContactPage: false,
      hasSocialLinks: false,
      leadScore: 0,
      technologies: [],
      socialLinks: [],
      source: "query",
      lastChecked: null,
    } as unknown as ReturnType<typeof toBusinessRecord>;

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
