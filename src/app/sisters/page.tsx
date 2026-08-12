import CooperationNetwork from "@/components/cooperation-network";
import Link from "next/link";
import sisters from "@/data/sister-companies.json";
import { cooperationModels } from "@/lib/business-data";

export default function SistersPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">{sisters.holding}</p>
            <p className="text-[11px] text-slate-300">۱۰ شرکت خواهر استارتاپ</p>
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
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {sisters.items.map((item, index) => (
            <article key={item.slug} className="rounded-2xl border bg-white p-4">
              <p className="text-[11px] font-bold text-slate-400">
                {index + 1}. {item.en}
              </p>
              <h2 className="mt-1 text-[15px] font-extrabold">{item.name}</h2>
              <p className="mt-1 text-[12px] text-[#ee6748]">{item.role}</p>
              <p className="mt-2 text-[12px] leading-6 text-slate-600">{item.offer}</p>
              <p className="mt-3 text-[11px] text-slate-400">{item.for}</p>
              <p className="mt-1 text-[12px] font-black">{item.price}</p>
              {item.website ? (
                <a href={item.website} target="_blank" rel="noreferrer" className="mt-2 block truncate text-[11px] font-bold text-[#ee6748]">
                  {item.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <p className="mt-2 text-[11px] text-slate-400">سایت کلادفلر هنوز وصل نیست</p>
              )}
            </article>
          ))}
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-[20px] font-black">سایت‌های کلادفلر مرتبط</h2>
          <p className="mt-1 text-[12px] text-slate-500">{cloudflareSites.note}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {cloudflareSites.items.map((site) => (
              <a key={site.id} href={site.url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 p-3 hover:bg-slate-100">
                <p className="text-[13px] font-extrabold">{site.label}</p>
                <p className="mt-1 text-[11px] text-slate-500">{site.role}</p>
                <p className="mt-1 truncate text-[11px] font-bold text-[#ee6748]">{site.url}</p>
              </a>
            ))}
          </div>
        </section>

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
