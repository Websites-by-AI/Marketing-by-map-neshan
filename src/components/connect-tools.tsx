"use client";

import { FormEvent, useState } from "react";

export default function ConnectTools() {
  const [query, setQuery] = useState("لوله");
  const [searchResult, setSearchResult] = useState<unknown>(null);
  const [seoName, setSeoName] = useState("لورچ");
  const [seoSite, setSeoSite] = useState("lorch.ir");
  const [seoResult, setSeoResult] = useState<unknown>(null);
  const [busy, setBusy] = useState("");

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
    <section className="grid gap-5 lg:grid-cols-2">
      <form onSubmit={onSearch} className="rounded-2xl border bg-white p-5">
        <h3 className="font-extrabold">جستجوی ترکیبی (ساختمان ۱۴۰۵ + RAG لیدفِر)</h3>
        <div className="mt-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 flex-1 rounded-xl border px-3"
            placeholder="مثلا لوله، درب، شیرآلات"
          />
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
        <input
          value={seoName}
          onChange={(e) => setSeoName(e.target.value)}
          className="mt-3 h-11 w-full rounded-xl border px-3"
          placeholder="نام شرکت"
        />
        <input
          value={seoSite}
          onChange={(e) => setSeoSite(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border px-3"
          placeholder="دامنه مثل lorch.ir"
        />
        <button disabled={busy === "seo"} className="mt-3 w-full rounded-xl bg-[#10263d] py-3 font-extrabold text-white">
          {busy === "seo" ? "در حال تحلیل..." : "تحلیل کن"}
        </button>
        <pre className="mt-3 max-h-[220px] overflow-auto rounded-xl bg-[#0f172a] p-3 text-[10px] text-sky-100">
          {seoResult ? JSON.stringify(seoResult, null, 2) : "پیشنهاد پکیج اینجا می‌آید"}
        </pre>
      </form>
    </section>
  );
}
