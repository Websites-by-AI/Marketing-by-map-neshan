import type { businesses } from "@/db/schema";

export type BusinessRecord = {
  id: number;
  neshanId: string | null;
  name: string;
  category: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  websiteTitle: string | null;
  websiteFound: boolean;
  websiteStatus: string;
  websiteQuality: string;
  websitePrompt: string | null;
  qualityScore: number;
  digitalMaturity: number;
  hasOnlineOrder: boolean;
  hasBooking: boolean;
  hasContactPage: boolean;
  hasSocialLinks: boolean;
  leadScore: number;
  technologies: string[];
  socialLinks: string[];
  source: string;
  lastChecked: string | null;
  activity?: string | null;
  halls?: string[];
  booths?: string[];
  websiteSource?: "official-list" | "known-manual" | null;
  returningExhibitor?: boolean;
};

type DatabaseBusiness = typeof businesses.$inferSelect;

export function generateWebsitePrompt(params: {
  name: string;
  category: string;
  address: string;
  phone?: string | null;
  website?: string | null;
  websiteQuality?: string;
  qualityScore?: number;
  hasOnlineOrder?: boolean;
  hasBooking?: boolean;
  hasContactPage?: boolean;
  hasSocialLinks?: boolean;
  technologies?: string[];
  leadScore?: number;
}): string {
  const {
    name,
    category,
    address,
    phone,
    website,
    websiteQuality,
    qualityScore,
    hasOnlineOrder,
    hasBooking,
    hasContactPage,
    hasSocialLinks,
    technologies,
    leadScore,
  } = params;
  const problems: string[] = [];
  if (!website) problems.push("⛔ وب‌سایت رسمی ندارد و فقط در نقشه و اینستاگرام دیده می‌شود");
  if (qualityScore !== undefined && qualityScore < 55) {
    problems.push(`⚠️ امتیاز کیفیت فعلی ${qualityScore}/100 و نیازمند بازطراحی است`);
  }
  if (!hasContactPage) problems.push("📞 صفحه تماس / فرم تماس استاندارد ندارد");
  if (!hasSocialLinks) problems.push("🔗 اتصال به شبکه‌های اجتماعی ضعیف است");
  if (
    !hasBooking &&
    (category.includes("پزشک") ||
      category.includes("کلینیک") ||
      category.includes("آموزش") ||
      category.includes("ورزش") ||
      category.includes("زیبایی") ||
      category.includes("سالن"))
  ) {
    problems.push("📅 سیستم رزرو/نوبت‌دهی آنلاین ندارد");
  }
  if (
    !hasOnlineOrder &&
    (category.includes("رستوران") ||
      category.includes("کافه") ||
      category.includes("فروشگاه") ||
      category.includes("مبلمان") ||
      category.includes("سوپر") ||
      category.includes("فست"))
  ) {
    problems.push("🛒 امکان سفارش/خرید آنلاین ندارد");
  }
  if (problems.length === 0) {
    problems.push("✅ سایت پایه دارد اما برای رشد محلی نیاز به سئو محلی و تبدیل بالاتر دارد");
  }

  const stack = technologies && technologies.length ? technologies.join(", ") : "پیشنهاد: Next.js + Tailwind + صفحه‌ساز فارسی";

  return `تو یک تیم طراحی وب‌سایت تجاری حرفه‌ای برای بازار ایران هستی.

**کسب‌وکار مورد نظر:**
- نام: ${name}
- دسته: ${category}
- آدرس: ${address}
${phone ? `- تلفن: ${phone}` : ""}
- وب‌سایت فعلی: ${website ?? "ندارد"}
- وضعیت: ${websiteQuality ?? "بررسی نشده"} - امتیاز لید ${leadScore ?? "-"}
- تکنولوژی فعلی: ${stack}

**وضعیت بحرانی فعلی:**
${problems.map((p) => `- ${p}`).join("\n")}

**هدف نهایی:**
یک وب‌سایت سریع، سئو محلی قوی، قابل اعتماد، با نرخ تبدیل بالا و مجهز به:
${!hasBooking ? "- فرم رزرو/نوبت‌دهی آنلاین با تقویم شمسی" : ""}
${!hasOnlineOrder ? "- فروشگاه/منو آنلاین + پرداخت آنلاین + پیگیری سفارش" : ""}
- صفحه اول با هیرو قدرتمند، اعتمادسازی (نمادها، نظرات)، CTA واضح
- صفحه خدمات/محصولات/منو، گالری تصاویر واقعی
- صفحه درباره ما و داستان کسب‌وکار محلی
- صفحه تماس با نقشه نشان/گوگل مپ قابل کلیک، فرم تماس، واتساپ و دکمه تماس
- بلاگ سئو محلی (مثلا: بهترین ${category} در تهران)
- سئو کامل: title، meta description، schema LocalBusiness، OG، sitemap، robots
- سرعت: Lighthouse بالای 90، تصاویر بهینه، فونت فارسی Vazirmatn
- اتصال به سرچ کنسول، اینستاگرام، و آنالیتیکس

**پرامپت آماده برای ابزارهای AI (Lovable, Framer, v0, Bolt):**
"""
Design a modern, fast, Persian RTL website for "${name}" (${category}) located at "${address}".
Style: minimal, trustworthy, local, with rounded 2xl cards, soft shadows, accent #ee6748 and navy #132b45.
Must include sticky header with call button, hero with address and map links, feature sections for ${category}, ${!hasOnlineOrder ? "online ordering" : "product showcase"}, ${!hasBooking ? "online booking" : "booking status"}, contact with clickable Neshan/Google Map pins, FAQ, and footer with Enamad placeholder.
Generate all pages in Persian, SEO optimized for local keyword "${category} در ${address.split("،")[0] ?? "تهران"}".
Technologies: Next.js 14, Tailwind, Persian font.
"""

**لینک‌های نقشه که باید قابل کلیک باشند:**
- با مختصات اگر موجود است، لینک نشان، گوگل و Waze بساز.
- اگر مختصات ندارد، لینک جستجوی نام + آدرس در گوگل مپ بساز.

این پرامپت را به عنوان سند نیازمندی در دیتابیس ذخیره کن و نسخه نهایی سایت را روی دامنه IR و با SSL منتشر کن.
`;
}

export function buildMapLinks(record: {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const q = encodeURIComponent(`${record.name} ${record.address}`);
  if (record.latitude && record.longitude) {
    const lat = record.latitude;
    const lng = record.longitude;
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      neshan: `https://nshn.ir/${lat},${lng}`,
      neshanOrg: `https://www.neshan.org/maps/@${lat},${lng},16z`,
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      embedQuery: `${lat},${lng}`,
    };
  }
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    neshan: `https://www.neshan.org/search?term=${q}`,
    neshanOrg: `https://www.neshan.org/search?term=${q}`,
    waze: `https://waze.com/ul?q=${q}`,
    embedQuery: q,
  };
}

export function toBusinessRecord(row: DatabaseBusiness): BusinessRecord {
  return {
    id: row.id,
    neshanId: row.neshanId,
    name: row.name,
    category: row.category,
    address: row.address,
    city: row.city,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    phone: row.phone,
    website: row.website,
    websiteTitle: row.websiteTitle ?? null,
    websiteFound: row.websiteFound,
    websiteStatus: row.websiteStatus,
    websiteQuality: row.websiteQuality,
    websitePrompt: row.websitePrompt ?? null,
    qualityScore: row.qualityScore,
    digitalMaturity: row.digitalMaturity,
    hasOnlineOrder: row.hasOnlineOrder,
    hasBooking: row.hasBooking,
    hasContactPage: row.hasContactPage,
    hasSocialLinks: row.hasSocialLinks,
    leadScore: row.leadScore,
    technologies: row.technologies,
    socialLinks: row.socialLinks,
    source: row.source,
    lastChecked: row.lastChecked?.toISOString() ?? null,
  };
}

function promptForDemo(record: Omit<BusinessRecord, "websitePrompt">): string {
  return generateWebsitePrompt({
    name: record.name,
    category: record.category,
    address: record.address,
    phone: record.phone,
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

const nowIso = () => new Date().toISOString();

const baseDemos: Omit<BusinessRecord, "websitePrompt">[] = [
  {
    id: -1,
    neshanId: "neshan-demo-001",
    name: "کافه روف گاردن ایوان",
    category: "کافه و رستوران",
    address: "تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۴۸ - نزدیک میدان شهرداری",
    city: "تهران",
    latitude: 35.7856,
    longitude: 51.3852,
    phone: "۰۲۱-۸۸۵۸ ۲۳۴۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 96,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -2,
    neshanId: "neshan-demo-002",
    name: "کلینیک دندانپزشکی آریا",
    category: "کلینیک دندانپزشکی",
    address: "تهران، سعادت‌آباد، سرو غربی، تقاطع پاک‌نژاد، برج آریا",
    city: "تهران",
    latitude: 35.7901,
    longitude: 51.3778,
    phone: "۰۲۱-۲۲۳۶ ۸۹۱۰",
    website: "ariadental.ir",
    websiteTitle: "کلینیک دندانپزشکی آریا - سعادت‌آباد",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "نیازمند بهبود شدید",
    qualityScore: 38,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 91,
    technologies: ["WordPress"],
    socialLinks: ["Instagram", "WhatsApp"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -3,
    neshanId: "neshan-demo-003",
    name: "فست‌فود تند و آتشین - شعبه سعادت‌آباد",
    category: "رستوران و فست‌فود",
    address: "تهران، سعادت‌آباد، بلوار سرو، پلاک ۸۹، روبروی بانک ملت",
    city: "تهران",
    latitude: 35.7882,
    longitude: 51.3821,
    phone: "۰۲۱-۲۲۱۴ ۰۵۵۰",
    website: "tondfastfood.com",
    websiteTitle: "فست‌فود تند و آتشین",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "متوسط - بدون سفارش آنلاین",
    qualityScore: 53,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 88,
    technologies: ["WooCommerce"],
    socialLinks: ["Instagram", "Telegram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -4,
    neshanId: "neshan-demo-004",
    name: "آموزشگاه موسیقی آوای پارسی",
    category: "آموزشگاه",
    address: "تهران، شهرک غرب، بلوار دادمان، خیابان سپهر، کوچه هفتم",
    city: "تهران",
    latitude: 35.7579,
    longitude: 51.3688,
    phone: "۰۲۱-۸۸۵۸ ۷۷۱۱",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 94,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -5,
    neshanId: "neshan-demo-005",
    name: "مبل و دکوراسیون چوبینه",
    category: "دکوراسیون و مبلمان",
    address: "تهران، سعادت‌آباد، چهارراه سرو، مجتمع تجاری سروستان",
    city: "تهران",
    latitude: 35.7832,
    longitude: 51.389,
    phone: "۰۲۱-۶۶۵۷ ۴۱۲۲",
    website: "choobinehhome.com",
    websiteTitle: "چوبینه - فروشگاه آنلاین مبلمان",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "متوسط",
    qualityScore: 61,
    digitalMaturity: 3,
    hasOnlineOrder: true,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 71,
    technologies: ["WooCommerce", "WordPress"],
    socialLinks: ["Instagram", "Telegram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -6,
    neshanId: "neshan-demo-006",
    name: "باشگاه کراس‌فیت تندرست",
    category: "باشگاه ورزشی",
    address: "تهران، مرزداران، بلوار ایثار، نبش پل یادگار، پلاک ۲۱۰",
    city: "تهران",
    latitude: 35.744,
    longitude: 51.35,
    phone: "۰۲۱-۴۴۲۳ ۹۹۳۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 93,
    technologies: [],
    socialLinks: ["Instagram", "WhatsApp"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -7,
    neshanId: "neshan-demo-007",
    name: "سالن زیبایی آناهیتا",
    category: "سالن زیبایی",
    address: "تهران، سعادت‌آباد، میدان کاج، خیابان سرو شرقی، پلاک ۶۰",
    city: "تهران",
    latitude: 35.7915,
    longitude: 51.3805,
    phone: "۰۲۱-۲۶۷۶ ۳۴۱۲",
    website: "anahita-beauty.ir",
    websiteTitle: "سالن زیبایی آناهیتا",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "نیازمند رزرو آنلاین",
    qualityScore: 48,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 89,
    technologies: ["WordPress"],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -8,
    neshanId: "neshan-demo-008",
    name: "داروخانه شبانه‌روزی سرو",
    category: "داروخانه",
    address: "تهران، سعادت‌آباد، بلوار سرو غربی، پلاک ۲۱۲",
    city: "تهران",
    latitude: 35.7868,
    longitude: 51.3794,
    phone: "۰۲۱-۲۲۳۴ ۵۶۷۸",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: false,
    leadScore: 90,
    technologies: [],
    socialLinks: [],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -9,
    neshanId: "neshan-demo-009",
    name: "سوپرمارکت محله کاج",
    category: "سوپرمارکت",
    address: "تهران، سعادت‌آباد، میدان کاج، ضلع شمالی",
    city: "تهران",
    latitude: 35.7922,
    longitude: 51.3818,
    phone: "۰۲۱-۲۲۱۱ ۹۰۱۲",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 87,
    technologies: [],
    socialLinks: ["WhatsApp"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -10,
    neshanId: "neshan-demo-010",
    name: "آموزشگاه زبان ایرانمهر غرب",
    category: "آموزشگاه زبان",
    address: "تهران، شهرک غرب، فاز ۲، خیابان سیمای ایران",
    city: "تهران",
    latitude: 35.7594,
    longitude: 51.3721,
    phone: "۰۲۱-۸۸۵۷ ۳۳۲۰",
    website: "iranmehr-west.ir",
    websiteTitle: "ایرانمهر غرب",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "متوسط",
    qualityScore: 58,
    digitalMaturity: 3,
    hasOnlineOrder: false,
    hasBooking: true,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 64,
    technologies: ["WordPress"],
    socialLinks: ["Instagram", "Telegram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -11,
    neshanId: "neshan-demo-011",
    name: "کافه لمیز سعادت‌آباد",
    category: "کافه",
    address: "تهران، سعادت‌آباد، بلوار دریا، مجتمع پلاتین",
    city: "تهران",
    latitude: 35.7841,
    longitude: 51.3834,
    phone: "۰۲۱-۲۲۳۰ ۴۴۱۸",
    website: "lamizcafe.com",
    websiteTitle: "کافه لمیز",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "قابل قبول",
    qualityScore: 78,
    digitalMaturity: 4,
    hasOnlineOrder: true,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 42,
    technologies: ["Next.js"],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -12,
    neshanId: "neshan-demo-012",
    name: "کلینیک پوست و مو رها",
    category: "کلینیک زیبایی",
    address: "تهران، سعادت‌آباد، میدان کاج، برج نگین",
    city: "تهران",
    latitude: 35.7908,
    longitude: 51.3792,
    phone: "۰۲۱-۲۶۷۰ ۱۱۲۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 95,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -13,
    neshanId: "neshan-demo-013",
    name: "رستوران سنتی شاندیز پونک",
    category: "رستوران",
    address: "تهران، پونک، بلوار همیلا، پلاک ۷۷",
    city: "تهران",
    latitude: 35.7662,
    longitude: 51.3268,
    phone: "۰۲۱-۴۴۴۲ ۸۸۱۰",
    website: "shandizponak.ir",
    websiteTitle: "شاندیز پونک",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "نیازمند بهبود شدید",
    qualityScore: 34,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 86,
    technologies: ["HTML"],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -14,
    neshanId: "neshan-demo-014",
    name: "استودیو عکاسی نور",
    category: "عکاسی",
    address: "تهران، سعادت‌آباد، خیابان علامه جنوبی، پلاک ۳۴",
    city: "تهران",
    latitude: 35.7874,
    longitude: 51.3871,
    phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 92,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -15,
    neshanId: "neshan-demo-015",
    name: "آزمایشگاه پاتوبیولوژی پارس",
    category: "آزمایشگاه",
    address: "تهران، سعادت‌آباد، میدان کاج، خیابان ۲۴ متری",
    city: "تهران",
    latitude: 35.7896,
    longitude: 51.3826,
    phone: "۰۲۱-۲۲۳۵ ۷۷۰۰",
    website: "parslab.ir",
    websiteTitle: "آزمایشگاه پارس",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "متوسط - بدون نوبت آنلاین",
    qualityScore: 51,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: false,
    leadScore: 82,
    technologies: ["WordPress"],
    socialLinks: [],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -16,
    neshanId: "neshan-demo-016",
    name: "کتاب‌فروشی نشر قطره غرب",
    category: "کتاب‌فروشی",
    address: "تهران، شهرک غرب، بلوار دادمان، پاساژ گلستان",
    city: "تهران",
    latitude: 35.7566,
    longitude: 51.3704,
    phone: "۰۲۱-۸۸۵۶ ۲۲۱۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 84,
    technologies: [],
    socialLinks: ["Telegram", "Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -17,
    neshanId: "neshan-demo-017",
    name: "کارواش اتوماتیک یادگار",
    category: "خدمات خودرو",
    address: "تهران، مرزداران، زیر پل یادگار امام",
    city: "تهران",
    latitude: 35.7456,
    longitude: 51.3522,
    phone: "۰۲۱-۴۴۲۸ ۱۱۹۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: false,
    leadScore: 79,
    technologies: [],
    socialLinks: [],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -18,
    neshanId: "neshan-demo-018",
    name: "مشاور املاک خانه اول",
    category: "املاک",
    address: "تهران، سعادت‌آباد، بلوار پاکنژاد، پلاک ۴۰",
    city: "تهران",
    latitude: 35.7818,
    longitude: 51.3766,
    phone: "۰۲۱-۲۲۱۸ ۶۶۳۰",
    website: "khaneaval.com",
    websiteTitle: "خانه اول",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "متوسط",
    qualityScore: 57,
    digitalMaturity: 3,
    hasOnlineOrder: false,
    hasBooking: true,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 68,
    technologies: ["Laravel"],
    socialLinks: ["Instagram", "WhatsApp"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -19,
    neshanId: "neshan-demo-019",
    name: "مهدکودک شکوفه",
    category: "مهدکودک",
    address: "تهران، سعادت‌آباد، خیابان ریاضی، کوچه پنجم",
    city: "تهران",
    latitude: 35.7824,
    longitude: 51.3812,
    phone: "۰۲۱-۲۲۳۹ ۴۴۵۵",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 88,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -20,
    neshanId: "neshan-demo-020",
    name: "پیتزا سیب میدان کاج",
    category: "رستوران و فست‌فود",
    address: "تهران، سعادت‌آباد، میدان کاج، پاساژ گل‌ها",
    city: "تهران",
    latitude: 35.791,
    longitude: 51.3811,
    phone: "۰۲۱-۲۲۱۵ ۸۸۲۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 91,
    technologies: [],
    socialLinks: ["Instagram", "WhatsApp"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -21,
    neshanId: "neshan-demo-021",
    name: "گالری طلای ونوس",
    category: "طلا و جواهر",
    address: "تهران، سعادت‌آباد، چهارراه سرو، پاساژ سروستان",
    city: "تهران",
    latitude: 35.7838,
    longitude: 51.3882,
    phone: "۰۲۱-۲۲۳۳ ۷۷۴۴",
    website: "venusgold.ir",
    websiteTitle: "گالری ونوس",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "نیازمند بهبود شدید",
    qualityScore: 29,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 85,
    technologies: ["WordPress"],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -22,
    neshanId: "neshan-demo-022",
    name: "باشگاه بدنسازی المپیک غرب",
    category: "باشگاه ورزشی",
    address: "تهران، شهرک غرب، بلوار فرحزادی، پلاک ۱۸۰",
    city: "تهران",
    latitude: 35.7618,
    longitude: 51.3654,
    phone: "۰۲۱-۸۸۵۹ ۱۰۲۰",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 90,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -23,
    neshanId: "neshan-demo-023",
    name: "پت‌شاپ پارس پونک",
    category: "پت‌شاپ",
    address: "تهران، پونک، خیابان سردار جنگل، پلاک ۹",
    city: "تهران",
    latitude: 35.7634,
    longitude: 51.3298,
    phone: "۰۲۱-۴۴۴۸ ۲۲۳۳",
    website: null,
    websiteTitle: null,
    websiteFound: false,
    websiteStatus: "not_found",
    websiteQuality: "بدون سایت - بحرانی",
    qualityScore: 0,
    digitalMaturity: 1,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: false,
    hasSocialLinks: true,
    leadScore: 83,
    technologies: [],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
  {
    id: -24,
    neshanId: "neshan-demo-024",
    name: "کافه کتاب دادمان",
    category: "کافه",
    address: "تهران، شهرک غرب، بلوار دادمان، نبش سپهر",
    city: "تهران",
    latitude: 35.7588,
    longitude: 51.3672,
    phone: "۰۲۱-۸۸۵۵ ۶۶۷۷",
    website: "dadmancafe.ir",
    websiteTitle: "کافه کتاب دادمان",
    websiteFound: true,
    websiteStatus: "healthy",
    websiteQuality: "متوسط - بدون سفارش آنلاین",
    qualityScore: 46,
    digitalMaturity: 2,
    hasOnlineOrder: false,
    hasBooking: false,
    hasContactPage: true,
    hasSocialLinks: true,
    leadScore: 80,
    technologies: ["WordPress"],
    socialLinks: ["Instagram"],
    source: "نمونه داشبورد",
    lastChecked: nowIso(),
  },
];

export const demoBusinesses: BusinessRecord[] = baseDemos.map((r) => ({
  ...r,
  websitePrompt: promptForDemo(r),
}));

export const tehranPresets = [
  { label: "سعادت‌آباد - مرکز", lat: 35.785, lng: 51.385, description: "تراکم بالا - ۲۴ تیر / سرو" },
  { label: "سعادت‌آباد - میدان کاج", lat: 35.7915, lng: 51.3805, description: "بحرانی - زیبایی و کلینیک" },
  { label: "پل مدیریت - سعادت‌آباد", lat: 35.7801, lng: 51.389, description: "پل و دسترسی شریانی" },
  { label: "شهرک غرب - دادمان", lat: 35.758, lng: 51.368, description: "کافه و رستوران" },
  { label: "مرزداران - پل یادگار", lat: 35.744, lng: 51.35, description: "تراکم ورزشی و آموزشی" },
  { label: "پونک - همیلا", lat: 35.765, lng: 51.325, description: "آموزش و خدمات" },
] as const;

export const cooperationModels = [
  {
    slug: "build",
    title: "لندینگ غرفه بی‌سایت",
    tag: "ساختمان ۱۴۰۵",
    leadRange: "۴۳۰ غرفه بدون دامنه رسمی",
    price: "از ۱۸ میلیون",
    desc: "برای غرفه‌دار CONFAIR که در لیست iccexpo سایت ندارد. تحویل ۷ روزه با نقشه سالن + کاتالوگ فارسی.",
    includes: ["پرامپت AI آماده", "نقشه نشان/گوگل سالن", "واتساپ و فرم استعلام", "۵ مقاله سئو صنعت ساختمان"],
    color: "bg-[#fff0eb] text-[#d64b28] border-[#ffd5c7]",
  },
  {
    slug: "oil-catalog",
    title: "کاتالوگ نفت + بازیابی RAG",
    tag: "نفت ۲۹ / ۱۷۳۰",
    leadRange: "۱۲۷۹ سایت موجود، ۴۵۱ جا برای رشد",
    price: "از ۱۶ میلیون",
    desc: "شرکت‌های دیتاست Iran Oil Show: اتصال به RAG زنده، اصلاح دامنه، صفحه محصول انگلیسی/فارسی.",
    includes: ["اتصال به LeadFair search", "هویت‌سنجی دامنه", "کاتالوگ دو زبانه", "سالن تقریبی دوره ۲۹"],
    color: "bg-[#e8f3ff] text-[#1d4f91] border-[#c9ddf7]",
  },
  {
    slug: "cross",
    title: "بسته دو نمایشگاه",
    tag: "۱۷ نام مشترک",
    leadRange: "هم ساختمان هم نفت",
    price: "از ۲۴ میلیون",
    desc: "فقط برای نام‌های دقیقاً مشترک (ازن آب، تانگیران، بتن ایران، …). یک سایت، دو رویداد.",
    includes: ["صفحه ساختمان + نفت", "دامنه کاندید نفت", "پکیج خواهر حقوقی/مالی", "پیگیری بعد از هر دو نمایشگاه"],
    color: "bg-[#f3f0ff] text-[#5b4bb6] border-[#e1dcff]",
  },
  {
    slug: "sisters",
    title: "بسته شرکت‌های خواهر",
    tag: "استارتاپ ۱۰ واحدی",
    leadRange: "فروش + وام + وکیل + ویزا",
    price: "از ۱۲ میلیون شروع",
    desc: "بعد از لید دیجیتال، همان مشتری به واحد فروش، مالی، وام، حقوقی، مهاجرت، بیمه، لجستیک، منابع انسانی یا آموزش ارجاع می‌شود.",
    includes: ["یک پرونده مشترک", "ارجاع داخلی بدون اسپم", "رضایت انسان برای پیام", "گزارش واحد به واحد"],
    color: "bg-[#e9f8f3] text-[#0d7a6a] border-[#c7efe3]",
  },
] as const;

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(s));
}

export type RelatedBusiness = BusinessRecord & {
  distanceMeters: number;
  connectionReason: string;
  connectionType: "complementary" | "same-street" | "service-chain" | "problem-cluster";
};

function getConnectionReason(
  a: BusinessRecord,
  b: BusinessRecord,
  distM: number,
): { reason: string; type: RelatedBusiness["connectionType"] } {
  const catA = a.category;
  const catB = b.category;
  const bothCritical = (!a.websiteFound || a.qualityScore < 50) && (!b.websiteFound || b.qualityScore < 50);
  const oneNoSite = !a.websiteFound || !b.websiteFound;
  const streetSame =
    a.address.split("،")[1]?.trim() === b.address.split("،")[1]?.trim() ||
    Math.abs((a.latitude ?? 0) - (b.latitude ?? 0)) < 0.002;

  if (bothCritical) {
    return {
      reason: `خوشه بحرانی در ${distM}م - هر دو بدون سایت/ضعیف، پیشنهاد پکیج مشترک ساخت سایت با تخفیف ۲۰٪ و اشتراک نقشه`,
      type: "problem-cluster",
    };
  }
  if (oneNoSite) {
    return {
      reason: `${a.websiteFound ? a.name : b.name} سایت دارد، دیگری ندارد - اتصال ارجاع مشتری و بک‌لینک محلی`,
      type: "service-chain",
    };
  }
  if (catA.includes("رستوران") && (catB.includes("کافه") || catB.includes("باشگاه") || catB.includes("سینما"))) {
    return { reason: `اتصال مصرفی: مشتری ${catB} بعد از ${catA} - پیشنهاد کمپین مشترک تخفیف`, type: "complementary" };
  }
  if (catA.includes("زیبایی") && (catB.includes("کلینیک") || catB.includes("آموزشگاه") || catB.includes("عکاس"))) {
    return { reason: `زنجیره خدماتی زیبایی/سلامت - رزرو مشترک و پکیج عروس/مراسم`, type: "complementary" };
  }
  if (catA.includes("آموزش") && (catB.includes("کتاب") || catB.includes("کافه") || catB.includes("لوازم"))) {
    return { reason: `اکوسیستم آموزشی - فضای مطالعه و خرید ملزومات`, type: "complementary" };
  }
  if (streetSame) {
    return { reason: `هم‌خیابانی در ${distM}م - اشتراک مشتری پیاده و تبلیغ خیابانی مشترک`, type: "same-street" };
  }
  return { reason: `همسایگی ${distM} متری - امکان همکاری کراس‌پروموشن و سئو محلی مشترک`, type: "same-street" };
}

export function findRelatedCompanies(
  target: BusinessRecord,
  all: BusinessRecord[],
  maxDistanceMeters = 900,
  maxResults = 6,
): RelatedBusiness[] {
  if (!target.latitude || !target.longitude) return [];
  const base = { lat: target.latitude, lng: target.longitude };
  const related: RelatedBusiness[] = [];
  for (const other of all) {
    if (other.id === target.id) continue;
    if (!other.latitude || !other.longitude) continue;
    const dist = distanceKm(base, { lat: other.latitude, lng: other.longitude }) * 1000;
    if (dist <= maxDistanceMeters) {
      const { reason, type } = getConnectionReason(target, other, Math.round(dist));
      related.push({ ...other, distanceMeters: Math.round(dist), connectionReason: reason, connectionType: type });
    }
  }
  return related
    .sort((a, b) => {
      const criticalScore = (r: RelatedBusiness) =>
        (!r.websiteFound ? 10 : 0) + (r.leadScore >= 80 ? 5 : 0) - r.distanceMeters / 200;
      return criticalScore(b) - criticalScore(a);
    })
    .slice(0, maxResults);
}

export function buildLocalNetworkClusters(all: BusinessRecord[]) {
  const clusters: {
    center: { lat: number; lng: number };
    label: string;
    businesses: BusinessRecord[];
    problemCount: number;
    serviceGaps: string[];
  }[] = [];
  const used = new Set<number>();
  for (const biz of all) {
    if (used.has(biz.id) || !biz.latitude || !biz.longitude) continue;
    const nearby = all.filter((o) => {
      if (o.id === biz.id || used.has(o.id) || !o.latitude || !o.longitude) return false;
      return distanceKm({ lat: biz.latitude!, lng: biz.longitude! }, { lat: o.latitude!, lng: o.longitude! }) * 1000 <= 600;
    });
    if (nearby.length >= 1) {
      const group = [biz, ...nearby];
      group.forEach((g) => used.add(g.id));
      const problemCount = group.filter((g) => !g.websiteFound || g.qualityScore < 50).length;
      const gaps: string[] = [];
      if (group.every((g) => !g.hasBooking)) gaps.push("هیچکدام رزرو آنلاین ندارند");
      if (group.every((g) => !g.hasOnlineOrder) && group.some((g) => g.category.includes("رستوران") || g.category.includes("کافه"))) {
        gaps.push("پتانسیل سفارش آنلاین مشترک");
      }
      if (group.filter((g) => g.websiteFound).length <= 1) gaps.push("خوشه بی‌سایت - فروش گروهی");
      clusters.push({
        center: { lat: biz.latitude!, lng: biz.longitude! },
        label: `${biz.address.split("،")[1] ?? biz.city} - ${group.length} کسب‌وکار`,
        businesses: group,
        problemCount,
        serviceGaps: gaps,
      });
    }
  }
  return clusters.sort((a, b) => b.problemCount - a.problemCount || b.businesses.length - a.businesses.length);
}

export function collectFromDemoCatalog(term: string, latitude: number, longitude: number, limit = 16): BusinessRecord[] {
  const needle = term.trim().toLowerCase();
  const scored = demoBusinesses
    .map((biz) => {
      if (!biz.latitude || !biz.longitude) return null;
      const hay = `${biz.name} ${biz.category} ${biz.address}`.toLowerCase();
      const textHit = !needle || hay.includes(needle);
      const meters = Math.round(distanceKm({ lat: latitude, lng: longitude }, { lat: biz.latitude, lng: biz.longitude }) * 1000);
      const proximityBonus = meters <= 2500 ? 40 : meters <= 6000 ? 18 : 0;
      const textBonus = textHit ? 50 : needle.length > 1 && hay.split(" ").some((w) => w.includes(needle.slice(0, 3))) ? 12 : 0;
      return { biz, score: textBonus + proximityBonus + biz.leadScore / 10 - meters / 800, meters, textHit };
    })
    .filter((row): row is { biz: BusinessRecord; score: number; meters: number; textHit: boolean } => Boolean(row))
    .sort((a, b) => b.score - a.score);

  const preferred = scored.filter((row) => row.textHit || row.meters <= 3500);
  const picked = (preferred.length >= 4 ? preferred : scored).slice(0, limit).map((row) => ({
    ...row.biz,
    source: "neshan-demo-collect",
  }));
  return picked;
}

export function simulateWebsiteAnalysis(business: BusinessRecord): BusinessRecord {
  if (!business.website) {
    return {
      ...business,
      websiteStatus: "not_found",
      websiteQuality: "بدون سایت - بحرانی",
      qualityScore: 0,
      digitalMaturity: 1,
      leadScore: Math.max(business.leadScore, 88),
      lastChecked: new Date().toISOString(),
      websitePrompt: generateWebsitePrompt({
        name: business.name,
        category: business.category,
        address: business.address,
        phone: business.phone,
        website: business.website,
        websiteQuality: "بدون سایت - بحرانی",
        qualityScore: 0,
        hasOnlineOrder: false,
        hasBooking: false,
        hasContactPage: false,
        hasSocialLinks: business.hasSocialLinks,
        technologies: [],
        leadScore: Math.max(business.leadScore, 88),
      }),
    };
  }

  const score = Math.min(92, Math.max(28, business.qualityScore || 45));
  const quality = score >= 75 ? "قابل قبول" : score >= 55 ? "متوسط" : "نیازمند بهبود شدید";
  const leadScore = Math.max(20, Math.min(95, 100 - score + (business.hasOnlineOrder || business.hasBooking ? -8 : 8)));
  return {
    ...business,
    websiteStatus: "healthy",
    websiteQuality: quality,
    qualityScore: score,
    digitalMaturity: score >= 82 ? 5 : score >= 68 ? 4 : score >= 50 ? 3 : score >= 28 ? 2 : 1,
    leadScore,
    lastChecked: new Date().toISOString(),
    websitePrompt: generateWebsitePrompt({
      name: business.name,
      category: business.category,
      address: business.address,
      phone: business.phone,
      website: business.website,
      websiteQuality: quality,
      qualityScore: score,
      hasOnlineOrder: business.hasOnlineOrder,
      hasBooking: business.hasBooking,
      hasContactPage: business.hasContactPage,
      hasSocialLinks: business.hasSocialLinks,
      technologies: business.technologies,
      leadScore,
    }),
  };
}

export function averageLead(records: BusinessRecord[]) {
  if (!records.length) return 0;
  return Math.round(records.reduce((sum, row) => sum + row.leadScore, 0) / records.length);
}
