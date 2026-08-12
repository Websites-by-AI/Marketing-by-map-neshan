"use client";

import sisters from "@/data/sister-companies.json";
import { hostOf, scoreBar, sistersStats, stageClass } from "@/lib/sisters";
import { useMemo, useState } from "react";

const fa = new Intl.NumberFormat("fa-IR");
const stats = sistersStats();

export default function SistersCatalog() {
  const [field, setField] = useState("all");
  const [stage, setStage] = useState("all");
  const [q, setQ] = useState("");

  const cards = useMemo(() => {
    const needle = q.trim();
    return sisters.items.flatMap((item) =>
      item.startups
        .filter((startup) => {
          if (field !== "all" && item.slug !== field) return false;
          if (stage !== "all" && startup.stageId !== stage) return false;
          if (!needle) return true;
          const hay = `${startup.name} ${startup.description} ${startup.tags.join(" ")} ${item.name}`;
          return hay.includes(needle);
        })
        .map((startup) => ({ startup, item })),
    );
  }, [field, stage, q]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">{sisters.holding}</p>
            <p className="text-[11px] text-slate-300">
              کاتالوگ عمومی · فقط لینک سایت · بدون سورس
            </p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <a href="/">خانه</a>
            <a href="/oil">نفت</a>
            <a href="/sisters/admin">پنل ادمین</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">خدمات خواهر آماده همکاری با غرفه</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-8 text-slate-200">
            اینجا فقط سایت زنده، تصویر صفحه، برچسب، توضیح، امتیاز آمادگی و قدم بعدی دیده می‌شود.
            سورس و مخزن گیت‌هاب در صفحه عمومی نیست — جزئیات فنی در پنل ادمین است.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              [fa.format(stats.startups), "خدمت / استارتاپ"],
              [fa.format(stats.live), "سایت زنده"],
              [fa.format(stats.ready), "آماده یا نزدیک"],
              [fa.format(stats.avg), "میانگین امتیاز"],
            ].map(([value, label]) => (
              <article key={label} className="rounded-2xl bg-white/10 p-3">
                <strong className="block text-[22px]">{value}</strong>
                <span className="text-[11px] text-slate-300">{label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border bg-white p-4 lg:flex-row lg:items-center">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="جستجو نام، برچسب یا توضیح"
            className="h-11 flex-1 rounded-xl border px-3 text-[13px]"
          />
          <select value={field} onChange={(event) => setField(event.target.value)} className="h-11 rounded-xl border px-3 text-[13px] font-bold">
            <option value="all">همه حوزه‌ها</option>
            {sisters.items.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select value={stage} onChange={(event) => setStage(event.target.value)} className="h-11 rounded-xl border px-3 text-[13px] font-bold">
            <option value="all">همه مراحل</option>
            <option value="ready">آماده استفاده</option>
            <option value="almost">نزدیک به آماده</option>
            <option value="beta">بتا / دمو</option>
            <option value="prototype">نمونه اولیه</option>
            <option value="idea">ایده / نیاز به ساخت</option>
          </select>
        </section>

        <p className="text-[12px] text-slate-500">{fa.format(cards.length)} کارت</p>

        <section className="grid gap-4 md:grid-cols-2">
          {cards.map(({ startup, item }) => (
            <article key={`${item.slug}-${startup.id}`} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-[#10263d]">
                <img
                  src={startup.screenshot}
                  alt={startup.name}
                  className="h-full w-full object-cover object-top"
                />
                <span className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-black ${stageClass(startup.stageId)}`}>
                  {startup.stage}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400">{item.name}</p>
                    <h2 className="text-[16px] font-extrabold">{startup.name}</h2>
                  </div>
                  <div className="text-left">
                    <p className="text-[20px] font-black text-[#ee6748]">{fa.format(startup.score)}</p>
                    <p className="text-[10px] text-slate-400">آمادگی</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${scoreBar(startup.score)}`} style={{ width: `${startup.score}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {startup.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[13px] leading-7 text-slate-600">{startup.description}</p>
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-extrabold text-slate-700">قدم‌های بهبود</p>
                  <ol className="mt-1 list-decimal space-y-1 pr-4 text-[11px] leading-6 text-slate-600">
                    {startup.nextSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                {startup.website ? (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block truncate rounded-xl bg-[#ee6748] px-3 py-2 text-center text-[12px] font-extrabold text-white"
                  >
                    باز کردن سایت · {hostOf(startup.website)}
                  </a>
                ) : (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-center text-[12px] font-bold text-amber-800">
                    هنوز سایت عمومی ندارد
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
