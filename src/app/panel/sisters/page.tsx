"use client";

import sisters from "@/data/sister-companies.json";
import { hostOf, scoreBar, sistersStats, stageClass, type StartupRecord } from "@/lib/sisters";
import Link from "next/link";
import { useMemo, useState } from "react";

const fa = new Intl.NumberFormat("fa-IR");
const stats = sistersStats();

function AdminRow({
  startup,
  fieldName,
  open,
  onToggle,
}: {
  startup: StartupRecord;
  fieldName: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-t">
        <td className="px-3 py-3">
          <p className="font-extrabold">{startup.name}</p>
          <p className="text-[10px] text-slate-400">{startup.brand}</p>
        </td>
        <td className="px-3 py-3">{fieldName}</td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <strong>{fa.format(startup.score)}</strong>
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
              <span className={`block h-full ${scoreBar(startup.score)}`} style={{ width: `${startup.score}%` }} />
            </span>
          </div>
        </td>
        <td className="px-3 py-3">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stageClass(startup.stageId)}`}>{startup.stage}</span>
        </td>
        <td className="px-3 py-3">
          {startup.website ? (
            <a href={startup.website} target="_blank" rel="noreferrer" className="font-bold text-[#ee6748]">
              {hostOf(startup.website)}
            </a>
          ) : (
            <span className="text-slate-400">ندارد</span>
          )}
        </td>
        <td className="px-3 py-3">
          <p>{startup.owner}</p>
          <a href={startup.repo} target="_blank" rel="noreferrer" className="break-all text-[10px] text-slate-500">
            {startup.repo.replace("https://github.com/", "")}
          </a>
        </td>
        <td className="px-3 py-3">
          <button type="button" onClick={onToggle} className="rounded-lg bg-[#10263d] px-2 py-1 text-[10px] font-bold text-white">
            جزئیات
          </button>
        </td>
      </tr>
      {open ? (
        <tr className="bg-slate-50">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <img src={startup.screenshot} alt="" className="h-36 w-full rounded-xl object-cover object-top" />
              <div className="space-y-2 text-[12px] leading-6">
                <p>{startup.description}</p>
                <p className="text-slate-500">چرا این امتیاز: {startup.scoreWhy.join(" · ")}</p>
                <p className="font-extrabold">قدم‌های بهبود</p>
                <ol className="list-decimal pr-4">
                  {startup.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-white px-2 py-0.5 ring-1">وضعیت: {startup.status}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 ring-1">id: {startup.id}</span>
                  {startup.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-2 py-0.5 ring-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default function SistersAdminPage() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sisters.items.flatMap((item) =>
      item.startups
        .filter((startup) => {
          if (!needle) return true;
          return `${startup.name} ${startup.brand} ${startup.owner} ${startup.repo} ${item.slug}`
            .toLowerCase()
            .includes(needle);
        })
        .map((startup) => ({ startup, item })),
    );
  }, [q]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">پنل ادمین استارتاپ‌ها</p>
            <p className="text-[11px] text-slate-300">سورس، مالک، امتیاز و قدم بهبود</p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/panel">داشبورد</Link>
            <Link href="/sisters">کاتالوگ عمومی</Link>
            <a href="/api/sisters">JSON کامل</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [fa.format(stats.startups), "کل"],
            [fa.format(stats.live), "زنده"],
            [fa.format(stats.ready), "امتیاز ۷۰+"],
            [fa.format(stats.avg), "میانگین"],
          ].map(([value, label]) => (
            <article key={label} className="rounded-2xl border bg-white p-4">
              <strong className="block text-[22px]">{value}</strong>
              <span className="text-[12px] text-slate-500">{label}</span>
            </article>
          ))}
        </section>

        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="جستجو نام، برند، مالک یا مخزن"
          className="h-11 w-full rounded-xl border bg-white px-3 text-[13px]"
        />

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th className="px-3 py-3">خدمت</th>
                  <th className="px-3 py-3">حوزه</th>
                  <th className="px-3 py-3">امتیاز</th>
                  <th className="px-3 py-3">مرحله</th>
                  <th className="px-3 py-3">سایت</th>
                  <th className="px-3 py-3">مالک / سورس</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ startup, item }) => (
                  <AdminRow
                    key={startup.id}
                    startup={startup}
                    fieldName={item.name}
                    open={openId === startup.id}
                    onToggle={() => setOpenId(openId === startup.id ? null : startup.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-[11px] text-slate-400">{sisters.scoringNote}</p>
      </main>
    </div>
  );
}
