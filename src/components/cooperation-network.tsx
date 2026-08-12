import cloudflareSites from "@/data/cloudflare-sites.json";
import network from "@/data/cooperation-network.json";

export default function CooperationNetwork() {
  return (
    <div className="space-y-5">
      <p className="text-[13px] leading-7 text-slate-600">{network.note}</p>

      <section className="rounded-2xl border bg-white p-5">
        <h3 className="text-[16px] font-black">کلادفلر زنده</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {cloudflareSites.items.map((site) => (
            <a key={site.id} href={site.url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 p-3 hover:bg-slate-100">
              <p className="text-[13px] font-extrabold">{site.label}</p>
              <p className="mt-1 text-[11px] text-slate-500">{site.role}</p>
              <p className="mt-1 truncate text-[11px] font-bold text-[#ee6748]">{site.url.replace(/^https?:\/\//, "")}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-[16px] font-black">گیت‌هاب Websites-by-AI</h3>
          <a href="https://github.com/Websites-by-AI/" className="text-[12px] font-bold text-[#ee6748]" target="_blank" rel="noreferrer">
            سازمان ←
          </a>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {network.github.map((repo) => (
            <a key={repo.url} href={repo.url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 p-3 hover:bg-slate-100">
              <p className="text-[13px] font-extrabold">{repo.name}</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{repo.role}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h3 className="text-[16px] font-black">Hugging Face</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {network.huggingface.map((space) => (
            <a key={space.id} href={space.app || space.url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 p-3 hover:bg-slate-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-extrabold">{space.id.replace(/^[^/]+\//, "")}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${space.priority === "A" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                  {space.priority}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{space.role}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
