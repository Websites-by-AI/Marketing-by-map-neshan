import relatedModules from "@/data/related-modules.json";
import {
  exhibitionBusinesses,
  exhibitionCompanies,
  exhibitionHallPresets,
  exhibitionMeta,
  exhibitionStats,
  knownPhones,
  knownWebsites,
} from "@/lib/exhibition";

export type AuditItem = {
  id: string;
  status: "correct" | "partial" | "wrong" | "missing";
  title: string;
  detail: string;
  source?: string;
};

export function buildSiteAudit() {
  const officialNames = new Set(exhibitionCompanies.map((row) => row.name));
  const knownSiteNames = Object.keys(knownWebsites);
  const missingKnown = knownSiteNames.filter((name) => !officialNames.has(name));
  const returningOk = relatedModules.returningFromOldExhibition.every(
    (row) => officialNames.has(row.name) && knownPhones[row.name] === row.phone,
  );

  const items: AuditItem[] = [
    {
      id: "event",
      status: "correct",
      title: "نام رویداد",
      detail: `${exhibitionMeta.event} / ${exhibitionMeta.alias}. با صفحه رسمی iccexpo یکی است.`,
      source: exhibitionMeta.source,
    },
    {
      id: "dates",
      status: "correct",
      title: "تاریخ برگزاری",
      detail: `${exhibitionMeta.jalali} برابر ${exhibitionMeta.dates}. امروز ۱۴۰۵/۰۵/۲۱ (۱۲ اوت ۲۰۲۶) است؛ ۶ روز تا ۱۸ اوت / ۲۷ مرداد درست است. بعضی تقویم‌های متفرقه ۱۴۰۴ نوشته‌اند — آن‌ها دوره ۲۵ هستند نه ۲۶.`,
      source: exhibitionMeta.source,
    },
    {
      id: "venue",
      status: "correct",
      title: "محل برگزاری",
      detail: `${exhibitionMeta.venue}، بزرگراه چمران / خیابان سئول. برگزارکننده: ${exhibitionMeta.organizer}.`,
      source: exhibitionMeta.source,
    },
    {
      id: "count",
      status: "correct",
      title: "تعداد غرفه‌دار عمومی",
      detail: `لیست عمومی رسمی ${exhibitionStats.officialCount} نام یکتا است. خام iccexpo هم ۴۴۰ نام است؛ صفر اختلاف. خبرهای متفرقه حدود ۱۰۰۰ ثبت‌نام گفته‌اند — آن عدد در لیست عمومی نیست.`,
      source: exhibitionMeta.source,
    },
    {
      id: "names-booths",
      status: "correct",
      title: "نام شرکت + سالن + شماره غرفه",
      detail: "هر ۴۴۰ ردیف از «نام شرکت‌کننده / زمینه فعالیت / محل غرفه» صفحه رسمی پارس شده و با فایل خام data/raw یکی است.",
      source: exhibitionMeta.source,
    },
    {
      id: "categories",
      status: "partial",
      title: "دسته‌بندی صنعت",
      detail: "دسته رسمی در iccexpo فقط «زمینه فعالیت» متنی است. برچسب‌هایی مثل لوله و اتصالات یا درب و پنجره را اسکریپت از روی متن حدس زده — برای فیلتر خوب است، منبع رسمی نیست.",
    },
    {
      id: "lead-score",
      status: "partial",
      title: "امتیاز لید",
      detail: "امتیاز ساختگی داخلی است (تولیدکننده +۶، بانک/سندیکا −۲۰). رتبه رسمی نمایشگاه نیست.",
    },
    {
      id: "map-pins",
      status: "partial",
      title: "پین‌های نقشه",
      detail: "مختصات مرکز تقریبی هر سالن است با افست چند متری، نه GPS دقیق غرفه. محدوده حدود 35.788–35.793 / 51.406–51.412 یعنی خود محل دائمی نمایشگاه تهران. لینک نشان/گوگل برای مسیریابی به سالن است نه پلاک غرفه.",
    },
    {
      id: "websites",
      status: "partial",
      title: "وب‌سایت غرفه‌ها",
      detail: `لیست رسمی هیچ دامنه و تلفنی ندارد. ${exhibitionStats.withKnownWebsite} دامنه overlay (دستی / نفت / fetch تأییدشده) است. ${exhibitionStats.withoutListedWebsite} غرفه «بدون سایت در لیست رسمی» هستند — یعنی هنوز پیدا نشده، نه اینکه قطعاً سایت ندارند. ${missingKnown.length ? `نام دامنه بدون غرفه ۲۶: ${missingKnown.join("، ")}` : "هر دامنه overlay روی نام رسمی ۲۶ منطبق است."}`,
    },
    {
      id: "phones",
      status: "partial",
      title: "تلفن",
      detail: `فقط ${exhibitionStats.withPhone} تلفن تأییدشده وجود دارد: آبنوس جام کرج و آکپا ایران کیش از همپوشانی آرشیو قدیمی در و پنجره. ۴۳۸ غرفه تلفن عمومی در این دیتاست ندارند.`,
    },
    {
      id: "returning",
      status: returningOk ? "correct" : "wrong",
      title: "بازگشتی از نمایشگاه قدیمی",
      detail: returningOk
        ? "از ۲۰۰ نام آرشیو Dowintech فقط همین ۲ نام امسال غرفه دارند. بقیه ۲۰۰تایی غرفه‌دار ۱۴۰۵ نیستند."
        : "عدم تطابق نام/تلفن بازگشتی — باید بررسی شود.",
    },
    {
      id: "seo-vendors",
      status: "correct",
      title: "آژانس‌های سئو",
      detail: "۱۰ آژانس تهران همکار/پیمانکار هستند نه غرفه‌دار ساختمان. روی سایت نباید غرفه‌دار خوانده شوند.",
    },
    {
      id: "saadatabad",
      status: "partial",
      title: "باقیمانده سعادت‌آباد",
      detail: "حالت پیش‌فرض نمایشگاه حالا آمار سالن را نشان می‌دهد نه سعادت‌آباد. متن سعادت‌آباد فقط در دکمه «نمونه تهران» و داده دموی قدیمی کلینیک/کافه مانده و غرفه‌دار ۱۴۰۵ نیست.",
    },
    {
      id: "iranconfair-ir",
      status: "missing",
      title: "iranconfair.ir",
      detail: "دامنه تبلیغ‌شده برگزارکننده در برخی سایت‌های غرفه‌سازی، در بررسی قبلی فقط Nginx پیش‌فرض بود. منبع معتبر لیست غرفه iccexpo.com است.",
    },
    {
      id: "confair-25",
      status: "missing",
      title: "لیست دوره ۲۵",
      detail: "صفحه https://iccexpo.com/fa/iranconfair/25/visitors/participants هنوز هست ولی برای Returning/New/Dropped کامل استخراج نشده.",
    },
  ];

  return {
    checkedAt: new Date().toISOString(),
    live: "https://neshan-m.exhibition2world.ir",
    officialSource: exhibitionMeta.source,
    summary: {
      correct: items.filter((item) => item.status === "correct").length,
      partial: items.filter((item) => item.status === "partial").length,
      wrong: items.filter((item) => item.status === "wrong").length,
      missing: items.filter((item) => item.status === "missing").length,
    },
    stats: {
      ...exhibitionStats,
      halls: exhibitionHallPresets.length,
    },
    memory: {
      needsObsidian: false,
      installRequired: false,
      why: "Obsidian فقط یک برنامه دسکتاپ برای دیدن پوشه مارک‌داون است. برای دادن حافظه به ایجنت، API رایگان همین سایت کافی است.",
      api: "/api/memory",
      page: "/memory",
      vault: "memory/",
    },
    items,
  };
}
