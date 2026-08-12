import CooperationNetwork from "@/components/cooperation-network";
import Link from "next/link";
import relatedModules from "@/data/related-modules.json";
import sisterCompanies from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";
import { exhibitionBusinesses, exhibitionMeta } from "@/lib/exhibition";
import { oilExhibitionMeta, oilStats } from "@/lib/oil-exhibition";

const fa = new Intl.NumberFormat("fa-IR");

function daysUntilOpening() {
  const open = Date.UTC(2026, 7, 18);
  const now = Date.now();
  return Math.max(0, Math.ceil((open - now) / 86_400_000));
}

export default function LandingPage() {
  const noSite = exhibitionBusinesses.filter((row) => !row.websiteFound).length;
  const featured = [...exhibitionBusinesses]
    .sort((a, b) => b.leadScore - a.leadScore)
    .slice(0, 8);
  const categories = new Map<string, number>();
  for (const row of exhibitionBusinesses) {
    categories.set(row.category, (categories.get(row.category) ?? 0) + 1);
  }
  const topCats = [...categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const days = daysUntilOpening();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#10263d]/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ee6748]">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white" />
            </span>
            <div>
              <p className="text-sm font-extrabold">دیدبان محلی</p>
              <p className="text-[10px] text-slate-300">IRAN CONFAIR ۱۴۰۵ • نقشه نشان</p>
            </div>
          </div>
          <nav className="hidden items-center gap-5 text-[13px] font-bold text-slate-200 md:flex">
            <a href="#exhibitors">غرفه‌داران</a>
            <a href="#oil">نفت</a>
            <a href="#sisters">خواهرها</a>
            <Link href="/connect">اتصال‌گر</Link>
            <Link href="/notebooks">نوت‌بوک</Link>
            <Link href="/panel" className="rounded-xl bg-[#ee6748] px-4 py-2 text-white">
              ورود به داشبورد
            </Link>
          </nav>
          <Link href="/panel" className="rounded-xl bg-[#ee6748] px-3 py-2 text-[12px] font-extrabold md:hidden">
            داشبورد
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#10263d] text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#ee6748]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.2fr_.8fr] lg:py-20">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-orange-200">
              ۱۸ تا ۲۱ اوت ۲۰۲۶ / ۲۷ تا ۳۰ مرداد ۱۴۰۵ • {fa.format(days)} روز تا افتتاح
            </p>
            <h1 className="mt-5 text-[32px] font-black leading-[1.45] sm:text-[44px]">
              ۴۴۰ غرفه‌دار نمایشگاه بین‌المللی ساختمان، روی یک نقشه برای لید دیجیتال
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-8 text-slate-200">
              لیست رسمی اتاق تعاون استخراج شده است. پین نقشه مرکز تقریبی سالن است نه GPS غرفه.
              «بدون سایت ثبت‌شده» یعنی دامنه در iccexpo نبود — نه اینکه شرکت قطعاً وب‌سایت ندارد.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/panel" className="rounded-2xl bg-[#ee6748] px-5 py-3 text-[14px] font-extrabold">
                باز کردن داشبورد نقشه
              </Link>
              <Link href="/connect" className="rounded-2xl bg-white/10 px-5 py-3 text-[14px] font-extrabold ring-1 ring-white/20">
                پروژه اتصال‌گر API
              </Link>
              <Link href="/oil" className="rounded-2xl bg-white/10 px-5 py-3 text-[14px] font-extrabold ring-1 ring-white/20">
                جزئیات نمایشگاه نفت
              </Link>
              <Link href="/sisters" className="rounded-2xl bg-white/10 px-5 py-3 text-[14px] font-extrabold ring-1 ring-white/20">
                ۱۰ شرکت خواهر
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            {[
              [fa.format(exhibitionMeta.count), "غرفه‌دار رسمی ۱۴۰۵"],
              [fa.format(noSite), "بدون سایت ثبت‌شده"],
              [fa.format(relatedModules.returningFromOldExhibition.length), "بازگشتی از نمایشگاه قدیمی"],
              [fa.format(relatedModules.seoVendors.length), "آژانس سئو همکار"],
            ].map(([value, label]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <strong className="block text-[28px] font-black">{value}</strong>
                <span className="mt-1 block text-[12px] leading-5 text-slate-300">{label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="exhibitors" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-black">اولویت‌های لید روی سالن‌ها</h2>
            <p className="mt-1 text-[13px] text-slate-500">{exhibitionMeta.venue} — منبع: iccexpo.com</p>
          </div>
          <Link href="/panel" className="text-[13px] font-extrabold text-[#ee6748]">
            همه ۴۴۰ غرفه در داشبورد ←
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {topCats.map(([name, count]) => (
            <span key={name} className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-slate-600 ring-1 ring-slate-200">
              {name} · {fa.format(count)}
            </span>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((row) => (
            <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14px] font-extrabold leading-6">{row.name}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${row.websiteFound ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {row.websiteFound ? "سایت" : "بی‌سایت"}
                </span>
              </div>
              <p className="mt-2 text-[12px] text-slate-500">{row.category}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-400">{row.address}</p>
              <p className="mt-3 text-[12px] font-black text-[#ee6748]">لید {fa.format(row.leadScore)}</p>
            </article>
          ))}
        </div>
      </section>


      <section id="oil" className="bg-[#10263d] py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-black">نمایشگاه نفت هم اینجاست</h2>
              <p className="mt-2 max-w-3xl text-[13px] leading-7 text-slate-300">
                {oilExhibitionMeta.event} — داده پایه دوره ۲۹ ({oilExhibitionMeta.datasetJalali}): {fa.format(oilStats.companies)} شرکت، {fa.format(oilStats.halls)} سالن، {fa.format(oilStats.websites)} دامنه.
                پیش‌بینی دوره ۳۰ رسمی نیست. فقط {fa.format(oilStats.overlapExact)} نام دقیقاً با ساختمان ۱۴۰۵ یکی است.
              </p>
            </div>
            <Link href="/oil" className="rounded-xl bg-white/10 px-4 py-2 text-[13px] font-extrabold">
              جزئیات نفت
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {oilExhibitionMeta.topCategories.slice(0, 6).map((row) => (
              <span key={row.name} className="rounded-full bg-white/10 px-3 py-1 text-[12px]">
                {row.name} · {fa.format(row.count)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="sisters" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-[22px] font-black">{sisterCompanies.holding}</h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-7 text-slate-600">{sisterCompanies.tagline}. {sisterCompanies.note}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {sisterCompanies.items.map((item) => (
            <article key={item.slug} className="rounded-2xl border bg-white p-4">
              <p className="text-[10px] font-bold text-slate-400">{item.en}</p>
              <h3 className="mt-1 text-[14px] font-extrabold">{item.name}</h3>
              <p className="mt-1 text-[12px] text-[#ee6748]">{item.role}</p>
              <p className="mt-2 text-[12px] leading-6 text-slate-600">{item.offer}</p>
              <p className="mt-2 text-[11px] font-black">{item.price}</p>
              {item.website ? (
                <a href={item.website} target="_blank" rel="noreferrer" className="mt-2 block truncate text-[11px] font-bold text-[#ee6748]">
                  {item.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {cooperationModels.map((model) => (
            <article key={model.slug} className={`rounded-2xl border p-4 ${model.color}`}>
              <div className="flex justify-between text-[11px] font-bold">
                <span>{model.tag}</span>
                <span>{model.price}</span>
              </div>
              <h3 className="mt-2 text-[15px] font-extrabold">{model.title}</h3>
              <p className="mt-2 text-[12px] leading-6">{model.desc}</p>
            </article>
          ))}
        </div>
        <Link href="/sisters" className="mt-4 inline-block text-[13px] font-extrabold text-[#ee6748]">
          صفحه کامل مدل همکاری ←
        </Link>
      </section>

      <section id="modules" className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-[22px] font-black">شبکه همکاری: کلادفلر + گیت‌هاب + Hugging Face</h2>
          <p className="mt-2 max-w-3xl text-[14px] leading-7 text-slate-600">
            سازمان <a className="font-bold text-[#ee6748]" href="https://github.com/Websites-by-AI/" target="_blank" rel="noreferrer">Websites-by-AI</a>
            ، سایت‌های کلادفلر نمایشگاه، و اسپیس‌های RAG. نگین‌جام و تارانوم جدا هستند.
          </p>
          <div className="mt-6">
            <CooperationNetwork />
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            <article className="rounded-2xl border bg-slate-50 p-4">
              <h3 className="font-extrabold">بازگشتی از نمایشگاه قدیمی</h3>
              {relatedModules.returningFromOldExhibition.map((row) => (
                <p key={row.name} className="mt-2 text-[13px]">
                  <b>{row.name}</b>
                  <span className="mt-0.5 block text-[12px] text-slate-500">{row.booth} • {row.phone}</span>
                </p>
              ))}
            </article>
            <article id="seo" className="rounded-2xl border bg-violet-50 p-4">
              <h3 className="font-extrabold text-violet-950">آژانس‌های سئو تهران</h3>
              <ul className="mt-2 space-y-1 text-[12px]">
                {relatedModules.seoVendors.slice(0, 5).map((vendor) => (
                  <li key={vendor.name} className="flex justify-between">
                    <a href={vendor.website} target="_blank" rel="noreferrer" className="font-bold">
                      {vendor.rank}. {vendor.name}
                    </a>
                    <span className="text-slate-500">{vendor.score}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border bg-[#fff4ef] p-4">
              <h3 className="font-extrabold">Hugging Face اولویت A</h3>
              <ul className="mt-2 space-y-2 text-[12px] leading-5">
                {relatedModules.huggingFace
                  .filter((space) => space.priority === "A")
                  .slice(0, 4)
                  .map((space) => (
                    <li key={space.id}>
                      <a href={space.url} target="_blank" rel="noreferrer" className="font-bold">
                        {space.id.replace("SoSa123456/", "")}
                      </a>
                      <span className="block text-slate-500">{space.role}</span>
                    </li>
                  ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t bg-[#10263d] py-8 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-[12px]">
          <p>دیدبان محلی • IRAN CONFAIR ۱۴۰۵ • محل دائمی نمایشگاه‌های بین‌المللی تهران</p>
          <div className="flex gap-3 font-bold">
            <Link href="/panel">داشبورد</Link>
            <Link href="/oil">نفت</Link>
            <Link href="/sisters">خواهرها</Link>
            <Link href="/audit">صحت</Link>
            <Link href="/memory">حافظه عامل</Link>
            <a href="/api/exhibition">API JSON</a>
            <a href="https://github.com/Websites-by-AI/Marketing-by-map-neshan">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
