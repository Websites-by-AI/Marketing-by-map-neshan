import CooperationNetwork from "@/components/cooperation-network";
import Link from "next/link";
import sisters from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";

const fa = new Intl.NumberFormat("fa-IR");

const statusFa: Record<string, string> = {
  live: "زنده",
  vercel: "Vercel",
  repo: "فقط مخزن",
  missing: "مخزن ۴۰۴",
  empty: "خالی",
  down: "قطع",
  "hf-live": "HF زنده",
  "hf-sleeping": "HF خواب",
  "hf-error": "HF خطا",
};

function statusClass(status: string) {
  if (status === "live" || status === "vercel" || status === "hf-live") return "bg-emerald-50 text-emerald-700";
  if (status === "down" || status === "missing" || status === "hf-error") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-800";
}

export default function SistersPage() {
  const startupCount = sisters.items.reduce((sum, item) => sum + item.startups.length, 0);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">{sisters.holding}</p>
            <p className="text-[11px] text-slate-300">
              ۱۰ حوزه · {fa.format(startupCount)} استارتاپ · منبع SBZ-EDU
            </p>
          </div>
          <nav className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/oil">نفت</Link>
            <Link href="/panel">داشبورد</Link>
            <a href="/api/sisters">JSON</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">{sisters.tagline}</h1>
          <p className="mt-3 max-w-3xl text-[14px] leading-8 text-slate-200">{sisters.note}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold">
            <a className="rounded-full bg-white/10 px-3 py-1" href={sisters.sources.sbzEdu} target="_blank" rel="noreferrer">
              github.com/SBZ-EDU
            </a>
            <a className="rounded-full bg-white/10 px-3 py-1" href={sisters.sources.org} target="_blank" rel="noreferrer">
              Websites-by-AI
            </a>
            <span className="rounded-full bg-[#ee6748] px-3 py-1">{fa.format(startupCount)} استارتاپ در ۱۰ حوزه</span>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {sisters.items.map((item, index) => (
            <article key={item.slug} className="rounded-2xl border bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold text-slate-400">
                    {index + 1}. {item.en}
                  </p>
                  <h2 className="mt-1 text-[17px] font-extrabold">{item.name}</h2>
                  <p className="mt-1 text-[12px] text-[#ee6748]">{item.role}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black">
                  {fa.format(item.startups.length)} استارتاپ
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-6 text-slate-600">{item.offer}</p>
              <p className="mt-1 text-[11px] text-slate-400">{item.for} · {item.price}</p>

              <ul className="mt-4 space-y-2">
                {item.startups.map((startup) => (
                  <li key={startup.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-extrabold">{startup.name}</p>
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{startup.role}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(startup.status)}`}>
                        {statusFa[startup.status] ?? startup.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-bold text-[#ee6748]">
                      {startup.website ? (
                        <a href={startup.website} target="_blank" rel="noreferrer">
                          {startup.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      ) : null}
                      <a href={startup.repo} target="_blank" rel="noreferrer" className="text-slate-500">
                        {startup.owner} / مخزن
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {"excluded" in sisters && sisters.excluded.length ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-[15px] font-extrabold text-amber-950">عمداً در همکاری نمایشگاه نیامده</h2>
            <ul className="mt-2 space-y-1 text-[12px] leading-6 text-amber-900">
              {sisters.excluded.map((row) => (
                <li key={row.name}>
                  <b>{row.name}</b> — {row.reason}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <CooperationNetwork />

        <section>
          <h2 className="text-[20px] font-black">مدل همکاری به‌روز</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {cooperationModels.map((model) => (
              <article key={model.slug} className={`rounded-2xl border p-4 ${model.color}`}>
                <div className="flex justify-between text-[11px] font-bold">
                  <span>{model.tag}</span>
                  <span>{model.price}</span>
                </div>
                <h3 className="mt-2 text-[15px] font-extrabold">{model.title}</h3>
                <p className="mt-2 text-[12px] leading-6">{model.desc}</p>
                <ul className="mt-3 list-disc space-y-1 pr-4 text-[12px]">
                  {model.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
