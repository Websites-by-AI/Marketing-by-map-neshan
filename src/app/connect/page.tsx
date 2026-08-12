"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type StatusItem = { id: string; label: string; url: string; ok: boolean; detail: string };

export default function ConnectPage() {
  const [status, setStatus] = useState<StatusItem[]>([]);
  const [query, setQuery] = useState("لوله");
  const [searchResult, setSearchResult] = useState<unknown>(null);
  const [seoName, setSeoName] = useState("لورچ");
  const [seoSite, setSeoSite] = useState("lorch.ir");
  const [seoResult, setSeoResult] = useState<unknown>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    fetch("/api/connectors/status")
      .then((r) => r.json())
      .then((data) => setStatus(data.items ?? []))
      .catch(() => setStatus([]));
  }, []);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    setBusy("search");
    try {
      const res = await fetch(`/api/connectors/search?q=${encodeURIComponent(query)}`);
      setSearchResult(await res.json());
    } finally {
      setBusy("");
    }
  }

  async function onSeo(e: FormEvent) {
    e.preventDefault();
    setBusy("seo");
    try {
      const res = await fetch("/api/connectors/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: seoName, website: seoSite }),
      });
      setSeoResult(await res.json());
    } finally {
      setBusy("");
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">پروژه اتصال‌گر نمایشگاه</p>
            <p className="text-[11px] text-slate-300">LeadFair RAG + SEO + غرفه‌داران ۱۴۰۵ + بات نمایشگاه</p>
          </div>
          <div className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/panel">داشبورد</Link>
            <Link href="/notebooks">نوت‌بوک</Link>
            <Link href="/audit">صحت</Link>
            <Link href="/memory">حافظه</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">یک پروژه برای APIهای مرتبط</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-7 text-slate-200">
            Hugging Face اسپیس‌های RAG متوقف یا خطا هستند (سهمیه CPU). API زنده واقعی روی Vercel LeadFair است: ۱۷۳۰ شرکت.
            این صفحه همان API را با ۴۴۰ غرفه‌دار ساختمان و تحلیل سئو این سایت یکی می‌کند.
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {status.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[14px] font-extrabold">{item.label}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {item.ok ? "زنده" : "قطع / محدود"}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-slate-500">{item.detail}</p>
            </a>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={onSearch} className="rounded-2xl border bg-white p-5">
            <h3 className="font-extrabold">جستجوی ترکیبی (ساختمان ۱۴۰۵ + RAG لیدفِر)</h3>
            <div className="mt-3 flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 flex-1 rounded-xl border px-3" placeholder="مثلا لوله، درب، شیرآلات" />
              <button disabled={busy === "search"} className="rounded-xl bg-[#ee6748] px-4 font-extrabold text-white">
                {busy === "search" ? "..." : "جستجو"}
              </button>
            </div>
            <pre className="mt-3 max-h-[280px] overflow-auto rounded-xl bg-[#0f172a] p-3 text-[10px] text-emerald-100">
              {searchResult ? JSON.stringify(searchResult, null, 2) : "نتیجه اینجا می‌آید"}
            </pre>
          </form>

          <form onSubmit={onSeo} className="rounded-2xl border bg-white p-5">
            <h3 className="font-extrabold">تحلیل سئو غرفه (منطق LeadFair)</h3>
            <input value={seoName} onChange={(e) => setSeoName(e.target.value)} className="mt-3 h-11 w-full rounded-xl border px-3" placeholder="نام شرکت" />
            <input value={seoSite} onChange={(e) => setSeoSite(e.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" placeholder="دامنه مثل lorch.ir" />
            <button disabled={busy === "seo"} className="mt-3 w-full rounded-xl bg-[#10263d] py-3 font-extrabold text-white">
              {busy === "seo" ? "در حال تحلیل..." : "تحلیل کن"}
            </button>
            <pre className="mt-3 max-h-[220px] overflow-auto rounded-xl bg-[#0f172a] p-3 text-[10px] text-sky-100">
              {seoResult ? JSON.stringify(seoResult, null, 2) : "پیشنهاد پکیج اینجا می‌آید"}
            </pre>
          </form>
        </section>
      </main>
    </div>
  );
}
