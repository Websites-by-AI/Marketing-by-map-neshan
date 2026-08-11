import { lookup } from "node:dns/promises";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { generateWebsitePrompt, toBusinessRecord } from "@/lib/business-data";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^::ffff:/, "");
  if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) return true;
  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

async function validatePublicUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);
  if (!/^https?:$/.test(url.protocol) || !url.hostname || url.username || url.password) {
    throw new Error("آدرس وب‌سایت معتبر نیست.");
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("دامنه محلی قابل تحلیل نیست.");
  }
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("دامنه باید به یک آدرس عمومی معتبر متصل باشد.");
  }
  return url;
}

function exists(html: string, pattern: RegExp) {
  return pattern.test(html);
}

function pageTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ?? "";
}

export async function POST(request: Request) {
  const body = (await request.json()) as { businessId?: number };
  const businessId = Number(body.businessId);
  if (!Number.isInteger(businessId) || businessId <= 0) {
    return Response.json({ message: "شناسه کسب‌وکار معتبر نیست." }, { status: 400 });
  }

  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!business) return Response.json({ message: "کسب‌وکار پیدا نشد." }, { status: 404 });
  if (!business.website) return Response.json({ message: "برای این کسب‌وکار دامنه‌ای ثبت نشده است." }, { status: 400 });

  try {
    const url = await validatePublicUrl(business.website);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Local-Intelligence-Analyzer/1.0 (+website-analysis)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`پاسخ وب‌سایت قابل تحلیل نیست (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("نشانی واردشده یک صفحه HTML نیست.");
    }

    const html = (await response.text()).slice(0, 1_000_000);
    const lower = html.toLowerCase();
    const technologies = [
      exists(lower, /wp-content|wordpress/) && "WordPress",
      exists(lower, /woocommerce/) && "WooCommerce",
      exists(lower, /_next\/|next-data/) && "Next.js",
      exists(lower, /shopify/) && "Shopify",
      exists(lower, /laravel/) && "Laravel",
    ].filter(Boolean) as string[];
    const socialLinks = [
      exists(lower, /instagram\.com/) && "Instagram",
      exists(lower, /t\.me\/|telegram\.me/) && "Telegram",
      exists(lower, /wa\.me\/|api\.whatsapp\.com/) && "WhatsApp",
    ].filter(Boolean) as string[];
    const title = pageTitle(html);
    const hasDescription = exists(lower, /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/);
    const hasH1 = exists(lower, /<h1[\s>]/);
    const hasViewport = exists(lower, /name=["']viewport["']/);
    const hasCanonical = exists(lower, /rel=["']canonical["']/);
    const hasContactPage = exists(lower, /contact|تماس\s*(با\s*ما)?|شماره\s*تماس|tel:/);
    const hasOnlineOrder = exists(lower, /woocommerce|افزودن\s*به\s*سبد|ثبت\s*سفارش|پرداخت\s*آنلاین|سبد\s*خرید/);
    const hasBooking = exists(lower, /رزرو|نوبت\s*دهی|booking|appointment/);
    const hasSocialLinks = socialLinks.length > 0;
    const score = Math.min(
      100,
      12 +
        (url.protocol === "https:" ? 12 : 0) +
        (title.length >= 6 ? 12 : 0) +
        (hasDescription ? 10 : 0) +
        (hasH1 ? 10 : 0) +
        (hasViewport ? 8 : 0) +
        (hasCanonical ? 5 : 0) +
        (hasContactPage ? 10 : 0) +
        (hasSocialLinks ? 7 : 0) +
        (hasOnlineOrder || hasBooking ? 14 : 0),
    );
    const digitalMaturity = score >= 82 ? 5 : score >= 68 ? 4 : score >= 50 ? 3 : score >= 28 ? 2 : 1;
    const quality = score >= 75 ? "قابل قبول" : score >= 55 ? "متوسط" : "نیازمند بهبود شدید";
    const leadScore = Math.max(20, Math.min(95, 100 - score + (hasOnlineOrder || hasBooking ? -8 : 8)));

    const prompt = generateWebsitePrompt({
      name: business.name,
      category: business.category,
      address: business.address,
      phone: business.phone,
      website: business.website,
      websiteQuality: quality,
      qualityScore: score,
      hasOnlineOrder,
      hasBooking,
      hasContactPage,
      hasSocialLinks,
      technologies,
      leadScore,
    });

    const [updated] = await db
      .update(businesses)
      .set({
        websiteTitle: title,
        websiteStatus: "healthy",
        websiteQuality: quality,
        websitePrompt: prompt,
        qualityScore: score,
        digitalMaturity,
        hasOnlineOrder,
        hasBooking,
        hasContactPage,
        hasSocialLinks,
        leadScore,
        technologies,
        socialLinks,
        lastChecked: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, business.id))
      .returning();

    return Response.json({
      item: toBusinessRecord(updated),
      report: { title, score, https: url.protocol === "https:", hasDescription, hasH1, hasViewport, hasCanonical, prompt },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای ناشناخته در تحلیل وب‌سایت";
    return Response.json({ message }, { status: 502 });
  }
}
