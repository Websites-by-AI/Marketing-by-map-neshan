import { CONNECTORS } from "@/lib/connectors";
import { exhibitionBusinesses } from "@/lib/exhibition";

export const dynamic = "force-dynamic";

function packageFor(score: number, hasSite: boolean) {
  if (!hasSite) return { priority: "P1", name: "Website Launch + Local SEO", opportunity: 94 };
  if (score < 50) return { priority: "P1", name: "Technical Recovery", opportunity: 88 };
  if (score < 80) return { priority: "P2", name: "SEO Growth 90 Days", opportunity: 72 };
  return { priority: "P3", name: "Content & CRO", opportunity: 48 };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; website?: string };
  const name = body.name?.trim();
  if (!name) return Response.json({ ok: false, error: "name is required" }, { status: 400 });

  const booth = exhibitionBusinesses.find((row) => row.name.includes(name) || name.includes(row.name));
  const website = (body.website || booth?.website || "").replace(/^https?:\/\//, "");

  let score = booth?.qualityScore ?? 0;
  let title = booth?.websiteTitle ?? "";
  if (website) {
    try {
      const res = await fetch(`https://${website}`, {
        cache: "no-store",
        redirect: "follow",
        headers: { "User-Agent": "Neshan-Exhibition-Connector/1.0", Accept: "text/html" },
        signal: AbortSignal.timeout(8000),
      });
      const html = (await res.text()).slice(0, 80_000).toLowerCase();
      title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<[^>]+>/g, " ").trim() ?? title;
      score = Math.min(
        100,
        10 +
          (res.ok ? 15 : 0) +
          (title.length > 6 ? 12 : 0) +
          (html.includes("viewport") ? 8 : 0) +
          (html.includes("description") ? 10 : 0) +
          (html.includes("<h1") ? 10 : 0) +
          (html.includes("canonical") ? 6 : 0) +
          (html.includes("تماس") || html.includes("contact") ? 10 : 0),
      );
    } catch {
      score = website ? 18 : 0;
    }
  }

  const pack = packageFor(score, Boolean(website));
  return Response.json({
    ok: true,
    company: booth?.name ?? name,
    booth: booth?.address ?? null,
    website: website || null,
    title,
    seoMaturity: score,
    ...pack,
    leadfairSeo: CONNECTORS.leadfairSeo,
    roadmap: {
      d1_30: website ? "ممیزی فنی، Search Console، صفحات خدمت × منطقه" : "ثبت دامنه، سایت RTL، نقشه نشان، واتساپ",
      d31_60: "محتوای محلی + اسکیما LocalBusiness + گوگل بیزینس",
      d61_90: "گزارش تماس/فرم و cro",
    },
  });
}
