import Link from "next/link";
import { buildSiteAudit } from "@/lib/site-audit";

const fa = new Intl.NumberFormat("fa-IR");

const tone: Record<string, string> = {
  correct: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  partial: "bg-amber-50 text-amber-800 ring-amber-200",
  wrong: "bg-rose-50 text-rose-800 ring-rose-200",
  missing: "bg-slate-100 text-slate-700 ring-slate-200",
};

const label: Record<string, string> = {
  correct: "درست",
  partial: "نیمه‌درست",
  wrong: "غلط / در حال اصلاح",
  missing: "هنوز نیست",
};

export default function AuditPage() {
  const audit = buildSiteAudit();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">صحت اطلاعات سایت</p>
            <p className="text-[11px] text-slate-300">مقایسه با لیست رسمی iccexpo — نه حدس</p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/panel">داشبورد</Link>
            <Link href="/cohort">دوره ۲۵</Link>
            <Link href="/connect">اتصال‌گر</Link>
            <Link href="/memory">حافظه</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">تا خودِ بخش سایت، چه چیزی درست است؟</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-8 text-slate-200">
            لیست ۴۴۰ غرفه، تاریخ، سالن و شماره غرفه با صفحه رسمی اتاق تعاون یکی است.
            پین نقشه تقریبی سالن است. «بی‌سایت» یعنی در لیست رسمی دامنه نبود، نه اینکه شرکت قطعاً سایت ندارد.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [audit.summary.correct, "درست"],
              [audit.summary.partial, "نیمه‌درست"],
              [audit.summary.wrong, "غلط"],
              [audit.summary.missing, "جاافتاده"],
            ].map(([value, name]) => (
              <article key={String(name)} className="rounded-2xl bg-white/10 p-4">
                <strong className="block text-[28px]">{fa.format(Number(value))}</strong>
                <span className="text-[12px] text-slate-300">{name}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border bg-white p-4">
            <p className="text-[12px] text-slate-500">غرفه‌دار رسمی</p>
            <strong className="text-[22px]">{fa.format(audit.stats.officialCount)}</strong>
          </article>
          <article className="rounded-2xl border bg-white p-4">
            <p className="text-[12px] text-slate-500">دامنه دستی / تلفن</p>
            <strong className="text-[22px]">
              {fa.format(audit.stats.withKnownWebsite)} / {fa.format(audit.stats.withPhone)}
            </strong>
          </article>
          <article className="rounded-2xl border bg-white p-4">
            <p className="text-[12px] text-slate-500">سالن‌ها</p>
            <strong className="text-[22px]">{fa.format(audit.stats.halls)}</strong>
          </article>
        </section>

        <section className="space-y-3">
          {audit.items.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${tone[item.status]}`}>
                  {label[item.status]}
                </span>
                <h2 className="text-[15px] font-extrabold">{item.title}</h2>
              </div>
              <p className="mt-2 text-[13px] leading-7 text-slate-600">{item.detail}</p>
              {item.source ? (
                <a href={item.source} className="mt-2 inline-block text-[12px] font-bold text-[#ee6748]" target="_blank" rel="noreferrer">
                  منبع رسمی
                </a>
              ) : null}
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <h2 className="text-[16px] font-black text-violet-950">حافظه مثل Obsidian لازم است؟</h2>
          <p className="mt-2 text-[13px] leading-7 text-violet-900">{audit.memory.why}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/memory" className="rounded-xl bg-violet-700 px-4 py-2 text-[13px] font-extrabold text-white">
              صفحه حافظه
            </Link>
            <a href="/api/memory" className="rounded-xl bg-white px-4 py-2 text-[13px] font-extrabold text-violet-800 ring-1 ring-violet-200">
              API حافظه
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
