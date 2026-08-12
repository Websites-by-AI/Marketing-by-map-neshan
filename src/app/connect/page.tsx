import ConnectTools from "@/components/connect-tools";
import CooperationNetwork from "@/components/cooperation-network";
import { buildConnectionReport, type ConnectionItem } from "@/lib/connections";
import Link from "next/link";

export const dynamic = "force-dynamic";

const fa = new Intl.NumberFormat("fa-IR");

const GROUP_LABEL: Record<ConnectionItem["group"], string> = {
  database: "دیتابیس",
  core: "هسته همین سایت",
  api: "API زنده",
  external: "خارجی وصل",
  "not-wired": "عمداً وصل نشده",
};

const GROUP_ORDER: ConnectionItem["group"][] = ["database", "core", "api", "external", "not-wired"];

export default async function ConnectPage() {
  const report = await buildConnectionReport();
  const postgres = report.items.find((row) => row.id === "postgres");

  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6f9] text-[#152033]">
      <header className="border-b bg-[#10263d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-extrabold">پروژه اتصال‌گر نمایشگاه</p>
            <p className="text-[11px] text-slate-300">وضعیت ماژول‌ها در HTML اولیه — نه فقط بعد از جاوااسکریپت</p>
          </div>
          <div className="flex gap-3 text-[13px] font-bold">
            <Link href="/">خانه</Link>
            <Link href="/panel">داشبورد</Link>
            <Link href="/cohort">دوره ۲۵</Link>
            <Link href="/sisters">همکاری</Link>
            <Link href="/audit">صحت</Link>
            <Link href="/memory">حافظه</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="rounded-3xl bg-[#10263d] p-6 text-white">
          <h1 className="text-[26px] font-black">کدام ماژول وصل است؟</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-7 text-slate-200">
            Postgres قطع است. کاتالوگ نمایشگاه و نفت از JSON است. حافظه و تاریخچه جمع‌آوری روی Cloudflare KV است.
            HTML همین صفحه گزارش را بدون fetch کلاینت نشان می‌دهد.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <article className="rounded-2xl bg-rose-500/20 p-4 ring-1 ring-rose-300/40">
              <p className="text-[11px] text-rose-100">دیتابیس SQL</p>
              <strong className="mt-1 block text-[22px] font-black">Postgres قطع</strong>
            </article>
            <article className="rounded-2xl bg-emerald-500/15 p-4 ring-1 ring-emerald-300/30">
              <p className="text-[11px] text-emerald-100">KV حافظه</p>
              <strong className="mt-1 block text-[22px] font-black">
                {report.kv.bound ? `وصل · ${fa.format(report.kv.notes)}` : "قطع"}
              </strong>
            </article>
            <article className="rounded-2xl bg-white/10 p-4">
              <p className="text-[11px] text-slate-300">ماژول وصل</p>
              <strong className="mt-1 block text-[22px] font-black">{fa.format(report.summary.connected)}</strong>
            </article>
            <article className="rounded-2xl bg-white/10 p-4">
              <p className="text-[11px] text-slate-300">ماژول قطع</p>
              <strong className="mt-1 block text-[22px] font-black">{fa.format(report.summary.disconnected)}</strong>
            </article>
          </div>
          <p className="mt-4 text-[12px] leading-6 text-slate-300">{postgres?.detail}</p>
        </section>

        {GROUP_ORDER.map((group) => {
          const rows = report.items.filter((item) => item.group === group);
          if (!rows.length) return null;
          return (
            <section key={group} className="space-y-3">
              <h2 className="text-[16px] font-black">{GROUP_LABEL[group]}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {rows.map((item) => {
                  const inner = (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[14px] font-extrabold">{item.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.connected ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.connected ? "وصل" : "قطع"}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] leading-5 text-slate-500">{item.detail}</p>
                      <p className="mt-2 text-[10px] font-bold text-slate-400">{item.mode}</p>
                    </>
                  );
                  const className = "rounded-2xl border bg-white p-4";
                  return item.url ? (
                    <a key={item.id} href={item.url} className={className} target={item.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <article key={item.id} className={className}>
                      {inner}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <ConnectTools />
        <CooperationNetwork />
      </main>
    </div>
  );
}
