import cohort from "@/data/iranconfair-cohort.json";
import exhibitionPayload from "@/data/iranconfair-26.json";
import verifiedWebsites from "@/data/verified-websites.json";
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
  organizer: "اتاق تعاون ایران",
  gregorianOpen: "2026-08-18",
  gregorianClose: "2026-08-21",
  jalali: "۱۴۰۵/۰۵/۲۷ تا ۱۴۰۵/۰۵/۳۰",
};

/** Manual overlays — NOT from the official iccexpo list. */
export const knownWebsites: Record<string, string> = {
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
  "صنایع سیم وکابل مشهد": "mashadcable.ir",
  "شرکت مهران سرد": "mehrangrp.com",
  "ازن آب": "ozoneab.com",
  "دانش بنیان صنایع ماشین سازی پایابرش ویژن": "payaboresh.com",
  "ژئوشبکه پارسیان": "geoparsian.com",
  "کارا ماشین آرنا": "karamachinery.ir",
  "گروه کارآفرینان صنایع داود": "davoudcnc.com",
  "پایا بسپار آریا": "vispar.co",
  تانگیران: "tanguiran.com",
  "مجموعه بتن ایران": "betoniran.com",
  "پویش کامپوزیت یکتا": "megatite.com",
  "حامی آلیاژ آسیا": "hamiransteel.com",
};

type WebsiteSource = "known-manual" | "oil-overlap" | "verified-fetch";

export const websiteSources: Record<string, WebsiteSource> = Object.fromEntries(
  Object.entries(verifiedWebsites.items).map(([name, row]) => [name, row.source as WebsiteSource]),
);

/** Only confirmed overlaps with the old Dowintech / namayeshgahha door-window archive. */
export const knownPhones: Record<string, string> = {
  "آبنوس جام کرج": "02634706969",
  "آکپا ایران کیش": "04132466095",
};

export const phoneConfirmedReturning = new Set(Object.keys(knownPhones));

/** Official 25th∩26th names when the cohort file is filled; otherwise only phone-confirmed Dowintech overlaps. */
export const returningExhibitorNames = new Set(
  cohort.returning.length ? cohort.returning : cohort.dowintechPhoneConfirmed,
);

export const exhibitionCompanies = exhibitionPayload.companies as ExhibitionCompany[];

export const exhibitionHallPresets = (() => {
  const map = new Map<string, { label: string; lat: number; lng: number; count: number; description: string }>();
  for (const company of exhibitionCompanies) {
    const hall = company.halls[0] ?? "نمایشگاه بین‌المللی تهران";
    const current = map.get(hall);
    if (current) {
      current.count += 1;
      current.description = `${current.count} غرفه`;
    } else {
      map.set(hall, {
        label: hall,
        lat: company.latitude,
        lng: company.longitude,
        count: 1,
        description: "۱ غرفه",
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
})();

export function exhibitionToBusinessRecords(): BusinessRecord[] {
  return exhibitionCompanies.map((company, index) => {
    const website = knownWebsites[company.name] ?? null;
    const hall = company.halls[0] ?? "نمایشگاه بین‌المللی تهران";
    const booth = company.booths.join("، ");
    const address = `تهران، محل دائمی نمایشگاه‌های بین‌المللی، ${hall}${booth ? `، غرفه ${booth}` : ""}`;
    const returning = returningExhibitorNames.has(company.name);
    return {
      id: -2000 - index,
      neshanId: `icc26:${company.booths[0] ?? index}`,
      name: company.name,
      category: company.category,
      address,
      city: "تهران",
      latitude: company.latitude,
      longitude: company.longitude,
      phone: knownPhones[company.name] ?? null,
      website,
      websiteTitle: website ? company.name : null,
      websiteFound: Boolean(website),
      websiteStatus: website ? "listed" : "not_found",
      websiteQuality: website
        ? `سایت overlay (${websiteSources[company.name] ?? "known-manual"}) — در لیست رسمی iccexpo نبود`
        : "بدون سایت در لیست رسمی iccexpo",
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
      activity: company.activity,
      halls: company.halls,
      booths: company.booths,
      websiteSource: website ? (websiteSources[company.name] ?? "known-manual") : null,
      returningExhibitor: returning,
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

export const exhibitionStats = {
  officialCount: exhibitionBusinesses.length,
  withKnownWebsite: exhibitionBusinesses.filter((row) => row.websiteFound).length,
  withoutListedWebsite: exhibitionBusinesses.filter((row) => !row.websiteFound).length,
  withPhone: exhibitionBusinesses.filter((row) => row.phone).length,
  returning: exhibitionBusinesses.filter((row) => row.returningExhibitor).length,
  returningFrom25: cohort.returning.length,
  newVs25: cohort.newIn26.length,
  droppedAfter25: cohort.droppedAfter25.length,
  halls: exhibitionHallPresets.length,
};
