"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TestRow = { id: string; ok: boolean; detail: string };
type Overlap = {
  name: string;
  confairHalls: string[];
  confairBooths: string[];
  website: string | null;
  identity: string;
  oilActivity: string;
};
type Payload = {
  ok?: boolean;
  note?: string;
  notebooks?: { file: string; runnableHere: boolean; role: string }[];
  tests?: TestRow[];
  overlapWithConfair?: { exactNames: number; withCandidateWebsite: number; items: Overlap[] };
  urls?: { vercel: string; hfLive: string; notebooks: string };
};

const fa = new Intl.NumberFormat("fa-IR");

export default function NotebooksPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/connectors/notebooks")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("تست زنده لود نشد"));
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">نوت‌بوک‌های RAG2</p>
            <p className="text-[11px] text-slate-300">Hugging Face • تست زنده بدون GPU</p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/connect">اتصال‌گر</Link>
            <Link href="/audit">صحت</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">نوت‌بوک‌ها خوب‌اند — دو تا را همین‌جا اجرا کردیم</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-8 text-slate-200">
            {data?.note ??
              "این فایل‌ها RAG نمایشگاه نفت هستند، نه لیست رسمی ساختمان. API زنده‌شان Vercel است."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold">
            <a className="rounded-xl bg-[#ee6748] px-3 py-2" href={data?.urls?.notebooks} target="_blank" rel="noreferrer">
              پوشه Hugging Face
            </a>
            <a className="rounded-xl bg-white/10 px-3 py-2" href={data?.urls?.hfLive} target="_blank" rel="noreferrer">
              فرانت زنده RAG2
            </a>
            <a className="rounded-xl bg-white/10 px-3 py-2" href={data?.urls?.vercel} target="_blank" rel="noreferrer">
              Vercel API
            </a>
            <a className="rounded-xl bg-white/10 px-3 py-2" href="/api/connectors/notebooks">
              JSON تست
            </a>
          </div>
        </section>

        {error ? <p className="rounded-xl bg-rose-50 p-3 text-rose-700">{error}</p> : null}

        <section className="grid gap-3 md:grid-cols-2">
          {(data?.notebooks ?? []).map((nb) => (
            <article key={nb.file} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[13px] font-extrabold">{nb.file}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${nb.runnableHere ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                  {nb.runnableHere ? "قابل تست اینجا" : "فقط Colab / GPU"}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-6 text-slate-600">{nb.role}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-extrabold">نتیجه تست زنده (همان rag_api_colab_test)</h2>
          <div className="mt-3 space-y-2">
            {(data?.tests ?? []).map((row) => (
              <div key={row.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-[13px] font-bold">{row.id}</p>
                  <p className="text-[12px] text-slate-600">{row.detail}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${row.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {row.ok ? "قبول" : "رد"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-extrabold">
            همپوشانی دقیق با ساختمان ۱۴۰۵: {fa.format(data?.overlapWithConfair?.exactNames ?? 0)} نام
          </h2>
          <p className="mt-1 text-[12px] text-slate-500">
            دامنه از دیتاست نفت آمده؛ تا هویت‌سنجی نشده سایت رسمی قطعی نیست. daboo برای مخزن فولاد رافع مشکوک است.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-[12px]">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="py-2">شرکت</th>
                  <th>غرفه ۱۴۰۵</th>
                  <th>دامنه کاندید</th>
                  <th>هویت</th>
                </tr>
              </thead>
              <tbody>
                {(data?.overlapWithConfair?.items ?? []).map((row) => (
                  <tr key={row.name} className="border-b last:border-0">
                    <td className="py-2 font-bold">
                      {row.name}
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{row.oilActivity}</span>
                    </td>
                    <td>
                      {row.confairHalls.join("، ")} / {row.confairBooths.join("، ")}
                    </td>
                    <td>
                      {row.website ? (
                        <a href={`https://${row.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="text-[#ee6748]">
                          {row.website}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.identity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
