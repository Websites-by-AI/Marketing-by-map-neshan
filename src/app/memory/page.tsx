"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Note = { id: string; title: string; body: string; tags: string[]; updatedAt: string; source?: string };

type Payload = {
  needsObsidian?: boolean;
  installRequired?: boolean;
  giveThisToTheAgent?: string;
  whyNotObsidian?: string;
  kvBound?: boolean;
  notes?: Note[];
};

export default function MemoryPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/memory")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ notes: [] }));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, tags: ["inbox"] }),
    });
    const json = (await res.json()) as { ok?: boolean; persisted?: boolean; hint?: string; error?: string };
    setNotice(json.error ?? (json.persisted ? "یادداشت در KV ذخیره شد" : json.hint ?? "ثبت شد"));
    if (json.ok) {
      setTitle("");
      setBody("");
      const fresh = await fetch("/api/memory").then((item) => item.json());
      setData(fresh);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">حافظه عامل</p>
            <p className="text-[11px] text-slate-300">رایگان • کم‌حجم • API • بدون نصب Obsidian</p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/audit">صحت اطلاعات</Link>
            <a href="/api/memory">JSON</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">Obsidian نصب نکنید</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-8 text-slate-200">
            {data?.whyNotObsidian ??
              "Obsidian برنامه دسکتاپ است. برای دادن حافظه به ایجنت، همین API کافی است."}
          </p>
          <div className="mt-4 rounded-2xl bg-black/30 p-4 text-[13px] leading-7">
            <p className="font-bold text-orange-200">این آدرس را به ایجنت بدهید:</p>
            <code className="mt-1 block break-all text-emerald-200">{data?.giveThisToTheAgent}</code>
            <p className="mt-2 text-slate-300">
              KV {data?.kvBound ? "وصل است — یادداشت جدید می‌ماند" : "هنوز bind نشده — یادداشت‌های بذر داخل خود سایت می‌مانند"}
            </p>
          </div>
        </section>

        <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5">
          <h2 className="font-extrabold">افزودن یادداشت برای ایجنت بعدی</h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-3 h-11 w-full rounded-xl border px-3"
            placeholder="عنوان"
            required
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 min-h-[120px] w-full rounded-xl border p-3"
            placeholder="متن یادداشت"
            required
          />
          <button className="mt-3 rounded-xl bg-[#ee6748] px-4 py-2.5 text-[13px] font-extrabold text-white">ذخیره در حافظه</button>
          {notice ? <p className="mt-2 text-[12px] text-slate-500">{notice}</p> : null}
        </form>

        <section className="space-y-3">
          {(data?.notes ?? []).map((note) => (
            <article key={note.id} className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[15px] font-extrabold">{note.title}</h3>
                <span className="text-[11px] text-slate-400">
                  {note.updatedAt} • {note.source ?? "seed"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-[13px] leading-7 text-slate-700">{note.body}</pre>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
