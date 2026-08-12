import exhibitionPayload from "@/data/iranconfair-26.json";
import { generateWebsitePrompt, type BusinessRecord } from "@/lib/business-data";

export type ExhibitionCompany = {
  name: string;
  activity: string;
  category: string;
  halls: string[];
  booths: string[];
  latitude: number;
  longitude: number;
  leadScore: number;
};

export const exhibitionMeta = {
  event: exhibitionPayload.event,
  alias: exhibitionPayload.alias,
  dates: exhibitionPayload.dates,
  venue: exhibitionPayload.venue,
  source: exhibitionPayload.source,
  scrapedAt: exhibitionPayload.scrapedAt,
  count: exhibitionPayload.count,
};

const knownWebsites: Record<string, string> = {
  "صنعت شیرآلات قهرمان": "ghahreman.com",
  لورچ: "lorch.ir",
  وینوپلاستیک: "vinoplastic.com",
  "گیتی کالا ایرانیان": "gitipasand.com",
  "مجتمع پلاستیک طبرستان": "tabarestan.co.ir",
  "آکپا ایران کیش": "akpa.ir",
  "بانک گردشگری": "tourismbank.ir",
  "بانک قرض الحسنه مهر ایران": "qmb.ir",
  "صندوق نوآوری و شکوفایی ریاست جمهوری": "inif.ir",
  "سندیکا صنعت برق ایران": "ieis.ir",
};

export const exhibitionCompanies = exhibitionPayload.companies as ExhibitionCompany[];

export function exhibitionToBusinessRecords(): BusinessRecord[] {
  return exhibitionCompanies.map((company, index) => {
    const website = knownWebsites[company.name] ?? null;
    const hall = company.halls[0] ?? "نمایشگاه بین‌المللی تهران";
    const booth = company.booths.join("، ");
    const address = `تهران، محل دائمی نمایشگاه‌های بین‌المللی، ${hall}${booth ? `، غرفه ${booth}` : ""}`;
    return {
      id: -2000 - index,
      neshanId: `icc26:${company.booths[0] ?? index}`,
      name: company.name,
      category: company.category,
      address,
      city: "تهران",
      latitude: company.latitude,
      longitude: company.longitude,
      phone: null,
      website,
      websiteTitle: website ? company.name : null,
      websiteFound: Boolean(website),
      websiteStatus: website ? "listed" : "not_found",
      websiteQuality: website ? "سایت شناسایی شد - نیاز به بررسی" : "بدون سایت ثبت‌شده در لیست",
      websitePrompt: null,
      qualityScore: website ? 42 : 0,
      digitalMaturity: website ? 2 : 1,
      hasOnlineOrder: false,
      hasBooking: false,
      hasContactPage: Boolean(website),
      hasSocialLinks: false,
      leadScore: website ? Math.min(company.leadScore, 72) : company.leadScore,
      technologies: [],
      socialLinks: [],
      source: "IRAN CONFAIR 1405",
      lastChecked: exhibitionMeta.scrapedAt,
    };
  });
}

export function promptForExhibitor(record: BusinessRecord) {
  return generateWebsitePrompt({
    name: record.name,
    category: record.category,
    address: record.address,
    website: record.website,
    websiteQuality: record.websiteQuality,
    qualityScore: record.qualityScore,
    hasOnlineOrder: record.hasOnlineOrder,
    hasBooking: record.hasBooking,
    hasContactPage: record.hasContactPage,
    hasSocialLinks: record.hasSocialLinks,
    technologies: record.technologies,
    leadScore: record.leadScore,
  });
}

export const exhibitionBusinesses = exhibitionToBusinessRecords();
