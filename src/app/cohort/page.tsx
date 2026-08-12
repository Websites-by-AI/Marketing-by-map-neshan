import { exhibitionCohort, cohortStats } from "@/lib/exhibition-cohort";
import Link from "next/link";

const fa = new Intl.NumberFormat("fa-IR");

export default function CohortPage() {
  const stats = cohortStats();

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">دوره ۲۵ در برابر ۲۶</p>
            <p className="text-[11px] text-slate-300">Returning / New / Dropped از لیست رسمی iccexpo</p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/connect">اتصال‌گر</Link>
            <Link href="/audit">صحت</Link>
            <a href="/api/exhibition/cohort">JSON</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">{exhibitionCohort.event25}</h1>
          <p className="mt-2 text-[14px] leading-7 text-slate-200">
            تاریخ دوره ۲۵: {exhibitionCohort.dates25}. دوره ۲۶ همان محل است ولی لیست جداست.
            تطبیق فقط روی نام رسمی است، نه آرشیو Dowintech.
          </p>
          <a className="mt-3 inline-block text-[12px] font-bold text-orange-200" href={exhibitionCohort.source25} target="_blank" rel="noreferrer">
            منبع رسمی دوره ۲۵
          </a>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [stats.count25, "نام یکتا در ۲۵"],
            [stats.returning, "بازگشتی به ۲۶"],
            [stats.newIn26, "جدید در ۲۶"],
            [stats.droppedAfter25, "حذف‌شده بعد از ۲۵"],
          ].map(([value, label]) => (
            <article key={String(label)} className="rounded-2xl border bg-white p-4">
              <p className="text-[12px] text-slate-500">{label}</p>
              <strong className="text-[26px] font-black">{fa.format(Number(value))}</strong>
            </article>
          ))}
        </section>

        <p className="text-[13px] leading-7 text-slate-600">{exhibitionCohort.matchNote}</p>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border bg-white p-4">
            <h2 className="font-extrabold">بازگشتی</h2>
            <ul className="mt-3 max-h-[420px] space-y-1 overflow-auto text-[12px] leading-6">
              {(exhibitionCohort.returning.length ? exhibitionCohort.returning : exhibitionCohort.dowintechPhoneConfirmed).map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border bg-white p-4">
            <h2 className="font-extrabold">جدید در ۲۶</h2>
            <ul className="mt-3 max-h-[420px] space-y-1 overflow-auto text-[12px] leading-6">
              {exhibitionCohort.newIn26.slice(0, 80).map((name) => (
                <li key={name}>{name}</li>
              ))}
              {!exhibitionCohort.newIn26.length ? <li className="text-slate-400">بعد از اسکرپ ۲۵ پر می‌شود</li> : null}
            </ul>
          </article>
          <article className="rounded-2xl border bg-white p-4">
            <h2 className="font-extrabold">دیگر در ۲۶ نیستند</h2>
            <ul className="mt-3 max-h-[420px] space-y-1 overflow-auto text-[12px] leading-6">
              {exhibitionCohort.droppedAfter25.slice(0, 80).map((name) => (
                <li key={name}>{name}</li>
              ))}
              {!exhibitionCohort.droppedAfter25.length ? <li className="text-slate-400">بعد از اسکرپ ۲۵ پر می‌شود</li> : null}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
