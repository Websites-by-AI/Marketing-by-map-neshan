import Link from "next/link";
import overlap from "@/data/oil-rag-overlap.json";
import { oilExhibitionMeta as oil } from "@/lib/oil-exhibition";

const fa = new Intl.NumberFormat("fa-IR");

export default function OilPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">نمایشگاه نفت</p>
            <p className="text-[11px] text-slate-300">داده دوره ۲۹ • پیش‌بینی ۳۰ رسمی نیست</p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/sisters">خواهرها</Link>
            <Link href="/notebooks">نوت‌بوک</Link>
            <a href="/api/oil">JSON</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <p className="text-[12px] font-bold text-sky-200">{oil.alias}</p>
          <h1 className="mt-2 text-[26px] font-black">{oil.event}</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-8 text-slate-200">{oil.sourceNote}</p>
          <p className="mt-2 max-w-3xl text-[13px] leading-7 text-amber-200">{oil.calendarNote}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [oil.companies, "شرکت در دیتاست ۲۹"],
            [oil.halls, "سالن / محوطه"],
            [oil.websites, "دامنه ثبت‌شده در RAG"],
            [overlap.length, "نام دقیق مشترک با ساختمان"],
          ].map(([value, label]) => (
            <article key={String(label)} className="rounded-2xl border bg-white p-4">
              <strong className="block text-[26px]">{fa.format(Number(value))}</strong>
              <span className="text-[12px] text-slate-500">{label}</span>
            </article>
          ))}
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border bg-white p-5">
            <h2 className="font-extrabold">محل و دسترسی</h2>
            <p className="mt-2 text-[13px] leading-7 text-slate-600">
              {oil.venue} — {oil.address}. همان محل CONFAIR ساختمان است.
            </p>
            <ul className="mt-3 list-disc space-y-1 pr-5 text-[13px] text-slate-600">
              <li>مترو: شهید حقانی و تجریش (خط ۱)</li>
              <li>BRT خط ۷ بزرگراه چمران — ایستگاه نمایشگاه</li>
              <li>درب شمالی / جنوبی / غربی</li>
            </ul>
            <a href={oil.officialSite} className="mt-3 inline-block text-[13px] font-bold text-[#ee6748]" target="_blank" rel="noreferrer">
              iran-oilshow.ir
            </a>
          </article>
          <article className="rounded-2xl border bg-white p-5">
            <h2 className="font-extrabold">گروه‌های کالایی دیتاست</h2>
            <ul className="mt-3 space-y-1 text-[13px]">
              {oil.topCategories.map((row) => (
                <li key={row.name} className="flex justify-between">
                  <span>{row.name}</span>
                  <b>{fa.format(row.count)}</b>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-extrabold">۱۷ نام دقیق مشترک با ساختمان ۱۴۰۵</h2>
          <p className="mt-1 text-[12px] text-slate-500">فقط این‌ها را در هر دو نمایشگاه غرفه‌دار بخوان. بقیه ۱۷۳۰ غرفه‌دار CONFAIR نیستند.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {overlap.map((row) => (
              <div key={row.name} className="rounded-xl bg-slate-50 p-3 text-[12px]">
                <b>{row.name}</b>
                <p className="mt-1 text-slate-500">
                  {row.confairHalls.join("، ")} / {row.confairBooths.join("، ")}
                  {row.website ? ` • ${row.website}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <a href={oil.ragUi} className="rounded-xl bg-[#10263d] px-4 py-2 text-[13px] font-extrabold text-white" target="_blank" rel="noreferrer">
            فرانت RAG نفت
          </a>
          <a href={`${oil.ragApi}/api/search?q=${encodeURIComponent("پریسماتک")}`} className="rounded-xl border bg-white px-4 py-2 text-[13px] font-extrabold" target="_blank" rel="noreferrer">
            نمونه جستجو
          </a>
          <Link href="/sisters" className="rounded-xl bg-[#ee6748] px-4 py-2 text-[13px] font-extrabold text-white">
            ۱۲ حوزه همکاری
          </Link>
        </section>
      </main>
    </div>
  );
}
