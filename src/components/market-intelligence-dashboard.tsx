"use client";

import BusinessMap from "@/components/business-map";
import {
  buildMapLinks,
  cooperationModels,
  demoBusinesses,
  tehranPresets,
  findRelatedCompanies,
  buildLocalNetworkClusters,
  distanceKm,
  type BusinessRecord,
  type RelatedBusiness,
} from "@/lib/business-data";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleAlert,
  Clipboard,
  ClipboardCheck,
  Code2,
  Download,
  ExternalLink,
  Filter,
  Globe2,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  MapPinned,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
  Layers3,
  Route,
  Database,
  FileJson,
  Table2,
  BarChart3,
  Network,
  Link2,
  Users2,
  AlertTriangle,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const faNumber = new Intl.NumberFormat("fa-IR");
const faDate = new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" });

type Props = { initialRecords: BusinessRecord[] };
type FilterKey = "all" | "critical" | "no-website" | "needs-work" | "high-lead";
type AdminTab = "categories" | "prompts" | "export" | "pipeline" | "network";

const navItems = [
  { label: "نمای کلی", icon: LayoutDashboard, id: "overview" },
  { label: "نقشه خیابانی", icon: MapPinned, id: "map" },
  { label: "شبکه ارتباطی", icon: Network, id: "network" },
  { label: "بحرانی‌ها", icon: CircleAlert, id: "critical" },
  { label: "پنل ادمین", icon: Database, id: "admin" },
  { label: "مدل همکاری", icon: Route, id: "models" },
];

function qualityStyle(r: BusinessRecord) {
  if (!r.websiteFound) return "bg-rose-50 text-rose-700 ring-rose-200";
  if (r.qualityScore < 50) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}
function leadStyle(score: number) {
  if (score >= 85) return "bg-[#f05d3b] text-white";
  if (score >= 65) return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function MetricCard({ label, value, hint, trend, icon: Icon, accent }: { label: string; value: string; hint: string; trend?: string; icon: typeof Building2; accent: "navy" | "orange" | "teal" | "violet" }) {
  const accents = { navy: "bg-[#eaf0f6] text-[#19324d]", orange: "bg-[#fff0eb] text-[#e75d3e]", teal: "bg-[#e6f5f2] text-[#0e776f]", violet: "bg-[#f0edff] text-[#6854be]" };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between"><div className={`grid h-10 w-10 place-items-center rounded-xl ${accents[accent]}`}><Icon size={20} /></div>{trend && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{trend}</span>}</div>
      <p className="mt-4 text-[12px] text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between"><strong className="text-[24px] font-extrabold text-[#162b43]">{value}</strong><span className="mb-1 text-[10px] text-slate-400">{hint}</span></div>
    </article>
  );
}

export default function MarketIntelligenceDashboard({ initialRecords }: Props) {
  const [records, setRecords] = useState<BusinessRecord[]>(initialRecords.length ? initialRecords : demoBusinesses);
  const [activeNav, setActiveNav] = useState("نمای کلی");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [promptSearch, setPromptSearch] = useState("");
  const [adminTab, setAdminTab] = useState<AdminTab>("network");
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [selected, setSelected] = useState<BusinessRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [term, setTerm] = useState("رستوران");
  const [latitude, setLatitude] = useState("35.7850");
  const [longitude, setLongitude] = useState("51.3850");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 35.785, lng: 51.385 });
  const [related, setRelated] = useState<RelatedBusiness[]>([]);
  const [clusters, setClusters] = useState<ReturnType<typeof buildLocalNetworkClusters>>([]);

  const visibleRecords = useMemo(() => records.filter((r) => {
    const matches = `${r.name} ${r.category} ${r.address}`.toLowerCase().includes(search.toLowerCase());
    const crit = !r.websiteFound || r.qualityScore < 50;
    const ok = filter === "all" || (filter === "no-website" && !r.websiteFound) || (filter === "needs-work" && r.websiteFound && r.qualityScore < 55) || (filter === "high-lead" && r.leadScore >= 80) || (filter === "critical" && crit);
    return matches && ok;
  }), [records, search, filter]);

  const criticalRecords = useMemo(() => records.filter(r => !r.websiteFound || r.qualityScore < 50 || r.leadScore >= 85).sort((a,b)=>b.leadScore-a.leadScore), [records]);
  const categoryStats = useMemo(() => {
    const m = new Map<string, {total:number; noSite:number; critical:number; avgLead:number}>();
    for (const r of records) { const c = m.get(r.category) ?? {total:0,noSite:0,critical:0,avgLead:0}; c.total++; c.noSite += r.websiteFound ? 0:1; c.critical += (!r.websiteFound || r.qualityScore<50) ?1:0; c.avgLead+=r.leadScore; m.set(r.category,c); }
    return Array.from(m.entries()).map(([cat,s])=>({cat,...s, avgLead: Math.round(s.avgLead/Math.max(1,s.total))})).sort((a,b)=>b.critical-a.critical);
  }, [records]);

  const densityAnalysis = useMemo(()=> tehranPresets.map(p=>{
    const within = records.filter(r=> r.latitude && r.longitude && distanceKm({lat:p.lat,lng:p.lng},{lat:r.latitude!,lng:r.longitude!})*1000<=900);
    return {preset:p, total:within.length, noSite:within.filter(r=>!r.websiteFound).length, critical:within.filter(r=>!r.websiteFound||r.qualityScore<50).length};
  }), [records]);

  // compute clusters client side
  useEffect(()=>{ setClusters(buildLocalNetworkClusters(records)); }, [records]);

  // fetch related when selected changes
  useEffect(()=>{
    if(!selected){ setRelated([]); return; }
    // use local find for speed, but also try API
    const localRelated = findRelatedCompanies(selected, records, 900, 8);
    setRelated(localRelated);
    // optional API fetch for richer data
    fetch(`/api/related?businessId=${selected.id}`)
      .then(r=> r.ok ? r.json() : null)
      .then((data:any)=>{ if(data?.related) setRelated(data.related); })
      .catch(()=>{});
  }, [selected, records]);

  async function startCollection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setIsLoading(true); setNotice(null);
    try{
      const res = await fetch("/api/collections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({term,latitude:Number(latitude),longitude:Number(longitude)})});
      const payload = await res.json() as {items?:BusinessRecord[]; count?:number; message?:string};
      if(!res.ok) throw new Error(payload.message??"ناموفق");
      if(payload.items?.length) setRecords(payload.items);
      setMapCenter({lat:Number(latitude),lng:Number(longitude)});
      setNotice(`${faNumber.format(payload.count??0)} نتیجه - شبکه ارتباطی و پرامپت‌ها آپدیت شد`);
      setIsCollectionOpen(false);
    }catch(err){ setNotice(err instanceof Error?err.message:"اتصال نشد"); } finally{ setIsLoading(false); }
  }

  async function analyzeSelectedWebsite(){
    if(!selected || selected.id<=0){ setNotice("ابتدا داده واقعی جمع‌آوری کنید"); return; }
    setIsAnalyzing(true);
    try{
      const res = await fetch("/api/website-analysis",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({businessId:selected.id})});
      const payload = await res.json() as {item?:BusinessRecord; message?:string};
      if(!res.ok || !payload.item) throw new Error(payload.message??"ناموفق");
      setRecords(cur=>cur.map(r=> r.id===payload.item!.id?payload.item!:r)); setSelected(payload.item);
      setNotice(`تحلیل ${selected.name} به‌روز شد`);
    }catch(err){ setNotice(err instanceof Error?err.message:"ناموفق"); } finally{ setIsAnalyzing(false); }
  }

  async function copyPrompt(){ if(!selected?.websitePrompt) return; await navigator.clipboard.writeText(selected.websitePrompt); setCopiedPrompt(true); setTimeout(()=>setCopiedPrompt(false),2000); }
  function scrollTo(id:string){ document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}); }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f8fb] text-slate-800">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-[280px] flex-col bg-[#132b45] px-4 py-5 text-slate-200 lg:flex">
        <div className="flex items-center gap-3 px-2"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ee6748]"><span className="h-4 w-4 rounded-full border-2 border-white"/></div><div><p className="text-[16px] font-extrabold text-white">دیدبان محلی</p><p className="text-[10px] text-slate-400">NETWORK • MAP • PROBLEMS</p></div></div>
        <div className="mt-8 px-2 text-[10px] font-bold tracking-widest text-slate-500">پنل‌ها</div>
        <nav className="mt-3 space-y-1">
          {navItems.map(({label,icon:Icon,id})=>{ const active=activeNav===label; return <button key={label} onClick={()=>{setActiveNav(label); scrollTo(id);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] transition ${active?"bg-white/10 text-white":"text-slate-300 hover:bg-white/5"}`}><Icon size={18}/><span className="flex-1">{label}</span>{label==="بحرانی‌ها" && <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{faNumber.format(criticalRecords.length)}</span>}{label==="شبکه ارتباطی" && <span className="rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{faNumber.format(clusters.length)}</span>}</button>; })}
        </nav>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2 text-[11px] font-bold text-white"><Network size={14} className="text-violet-300"/> خوشه‌های مرتبط</div><div className="mt-2 space-y-1 text-[10px] text-slate-300">{clusters.slice(0,3).map((c,i)=> <div key={i} className="flex justify-between"><span className="truncate">{c.label.slice(0,22)}</span><span className="font-bold text-white">{faNumber.format(c.businesses.length)} • {faNumber.format(c.problemCount)} مشکل</span></div>)}</div></div>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[11px] font-bold text-white">خروجی شبکه + پرامپت</p><p className="mt-1 text-[10px] text-slate-400 leading-5">هر کسب‌وکار مشکل‌دار با همسایگانش لینک می‌شود و پیشنهادات اتصال خدماتی تولید می‌شود.</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><a href="/api/export?format=csv" className="rounded-lg bg-white/10 py-1.5 text-center text-[10px] font-bold text-white">CSV</a><a href="/api/export?format=json" className="rounded-lg bg-[#ee6748] py-1.5 text-center text-[10px] font-bold text-white">JSON</a></div>
        </div>
      </aside>

      <div className="min-h-screen lg:mr-[280px]">
        <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur"><div className="flex h-[66px] items-center gap-3 px-6"><div className="flex-1"><div className="text-[11px] text-slate-400">{activeNav}</div><h1 className="text-[15px] font-extrabold text-[#162b43]">نقشه مشکلات + شبکه کسب‌وکارهای مرتبط + اتصال خدمات</h1></div><a href="/api/export?format=csv" className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[11px] font-bold"><Download size={14}/> خروجی</a><button onClick={()=>setIsCollectionOpen(true)} className="rounded-xl bg-[#ee6748] px-4 py-2 text-[11px] font-bold text-white">جمع‌آوری نشان</button></div></header>

        <main className="mx-auto max-w-[1700px] px-4 py-6 lg:px-8">
          {notice && <div className="mb-4 flex justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-800"><span className="flex gap-2"><Check size={15}/>{notice}</span><button onClick={()=>setNotice(null)}><X size={14}/></button></div>}

          <section id="overview" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="کل کسب‌وکارها در نقشه" value={faNumber.format(records.length)} hint="سعادت‌آباد / پل‌ها" icon={Building2} accent="navy"/>
            <MetricCard label="مشکل‌دار (بدون سایت/ضعیف)" value={faNumber.format(criticalRecords.length)} hint="نیاز فوری" trend={`${Math.round((criticalRecords.length/Math.max(1,records.length))*100)}٪`} icon={CircleAlert} accent="orange"/>
            <MetricCard label="خوشه‌های همسایگی مرتبط" value={faNumber.format(clusters.length)} hint="اتصال خدمات" icon={Network} accent="violet"/>
            <MetricCard label="میانگین فاصله اتصال" value="~420m" hint="در یک خیابان" icon={Link2} accent="teal"/>
          </section>

          <section id="map" className="mt-6">
            <div className="rounded-2xl border bg-white p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="flex items-center gap-2 text-[14px] font-extrabold"><MapPinned size={18} className="text-teal-600"/> نقشه خیابانی - مشکلات با رنگ قرمز + خطوط ارتباط خدماتی</h3><p className="mt-1 text-[10px] text-slate-400">⚫ انتخاب = مرکز شبکه، 🟣 مرتبط هم‌خیابان با خط اتصال، 🔴 بحرانی بدون سایت - خیابان‌ها کاملاً قابل دیدن</p></div>
                <div className="flex gap-1.5">{tehranPresets.slice(0,3).map(p=> <button key={p.label} onClick={()=>setMapCenter({lat:p.lat,lng:p.lng})} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${mapCenter.lat===p.lat?"border-[#ee6748] bg-[#fff0eb] text-[#c63c1f]":"bg-white text-slate-600"}`}>{p.label}</button>)}</div>
              </div>
              <BusinessMap businesses={visibleRecords} center={mapCenter} onSelectBusiness={setSelected} highlightedId={selected?.id ?? null} relatedIds={related.map(r=>r.id)} showConnections />
            </div>
          </section>

          <section id="network" className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold"><Network size={18} className="text-violet-600"/> شبکه کسب‌وکارهای مرتبط - اتصال بین خدمات در یک لوکیشن</h3>
              <p className="mt-1 text-[10px] text-slate-400">بر اساس فاصله ۹۰۰م و دسته‌بندی - برای هر کسب‌وکار مشکل‌دار، همسایگانش که می‌توانند خدمات را به هم وصل کنند</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {clusters.slice(0,4).map((cluster,idx)=>(
                  <div key={idx} className="rounded-xl border bg-slate-50 p-3">
                    <div className="flex justify-between"><span className="text-[12px] font-bold">{cluster.label}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${cluster.problemCount>=2?"bg-rose-100 text-rose-700":"bg-emerald-50 text-emerald-700"}`}>{faNumber.format(cluster.problemCount)} مشکل</span></div>
                    <div className="mt-2 flex flex-wrap gap-1">{cluster.businesses.slice(0,5).map(b=> <span key={b.id} className={`rounded-full px-2 py-1 text-[9px] font-bold ${!b.websiteFound?"bg-rose-100 text-rose-700":"bg-white text-slate-600 ring-1 ring-slate-200"}`}>{b.name.slice(0,14)} ({b.category.slice(0,10)})</span>)}</div>
                    {cluster.serviceGaps.length>0 && <div className="mt-2 rounded-lg bg-amber-50 p-2 text-[10px] text-amber-800"><p className="font-bold">خلاء خدماتی مشترک:</p><ul className="mt-1 list-disc pr-4">{cluster.serviceGaps.map(g=> <li key={g}>{g}</li>)}</ul></div>}
                    <button onClick={()=>{ const first=cluster.businesses[0]; if(first.latitude){ setMapCenter({lat:first.latitude,lng:first.longitude!}); setSelected(first); scrollTo("map"); }}} className="mt-2 w-full rounded-lg bg-[#0f172a] py-1.5 text-[10px] font-bold text-white">نمایش خوشه روی نقشه + خطوط اتصال</button>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3 text-[11px]">
                <p className="font-extrabold text-violet-900">چطور اتصال خدماتی می‌سازد؟</p>
                <ul className="mt-2 list-disc space-y-1 pr-4 text-[10px] leading-5 text-violet-800">
                  <li><b>هم‌خیابانی:</b> کافه بدون سایت + باشگاه با سایت → اشتراک مشتری پیاده + بک‌لینک محلی</li>
                  <li><b>خوشه بحرانی:</b> ۳ کسب‌وکار بدون سایت در ۳۰۰م → پکیج گروهی ساخت سایت با تخفیف</li>
                  <li><b>زنجیره خدماتی:</b> سالن زیبایی + کلینیک + عکاس → پکیج عروس و رزرو مشترک</li>
                  <li><b>مشکل مشترک:</b> هیچکدام رزرو ندارند → پیشنهاد سیستم رزرو مشترک و تقویم شمسی</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border bg-[#fffcf8] p-5">
              <h4 className="flex items-center gap-2 text-[13px] font-extrabold"><Users2 size={16} className="text-orange-600"/> کسب‌وکار انتخاب شده و همسایگان مرتبط</h4>
              {!selected ? <p className="mt-4 text-[11px] text-slate-500">یک پین روی نقشه انتخاب کنید تا کسب‌وکارهای مرتبط در همان خیابان (تا ۹۰۰م) با دلیل اتصال خدماتی نمایش داده شود.</p> :
                <div>
                  <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200"><p className="text-[13px] font-extrabold">{selected.name}</p><p className="text-[10px] text-slate-500">{selected.category} • {selected.address}</p><p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${qualityStyle(selected)}`}>{selected.websiteQuality}</p></div>
                  <p className="mt-4 text-[11px] font-bold text-slate-700">مرتبط‌ها در همین لوکیشن ({faNumber.format(related.length)}):</p>
                  <div className="mt-2 space-y-2 max-h-[360px] overflow-auto pr-1">
                    {related.map(r=>{
                      const links=buildMapLinks(r);
                      return (
                        <div key={r.id} className="rounded-xl border bg-white p-3">
                          <div className="flex justify-between"><span className="text-[11px] font-bold">{r.name}</span><span className="text-[9px] text-slate-400">{faNumber.format(r.distanceMeters)}م</span></div>
                          <p className="mt-1 text-[10px] text-slate-500">{r.category} • {r.websiteFound ? "سایت دارد" : "بدون سایت"} • لید {r.leadScore}</p>
                          <p className={`mt-2 rounded-lg p-2 text-[10px] leading-5 ${r.connectionType==="problem-cluster"?"bg-rose-50 text-rose-800":r.connectionType==="complementary"?"bg-violet-50 text-violet-800":"bg-slate-50 text-slate-700"}`}>💡 {r.connectionReason}</p>
                          <div className="mt-2 flex gap-1"><a href={links.google} target="_blank" className="rounded bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">Google</a><a href={links.neshan} target="_blank" className="rounded bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">نشان</a><button onClick={()=>setSelected(r)} className="ml-auto rounded bg-slate-900 px-2 py-1 text-[9px] font-bold text-white">مرکز کن</button></div>
                        </div>
                      );
                    })}
                    {related.length===0 && <p className="text-[10px] text-slate-400">همسایه نزدیکی یافت نشد - شعاع را بیشتر کنید یا منطقه شلوغ‌تری مثل میدان کاج انتخاب کنید.</p>}
                  </div>
                </div>
              }
            </div>
          </section>

          <section id="critical" className="mt-6 rounded-2xl border bg-white">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
              <div><h3 className="flex items-center gap-2 text-[14px] font-extrabold"><AlertTriangle size={18} className="text-rose-500"/> لیست کسب‌وکارهای مشکل‌دار روی نقشه - با اتصال همسایگی</h3><p className="mt-1 text-[10px] text-slate-400">هر ردیف: مشکل اصلی + لینک‌های کلیک‌شو + شبکه مرتبط</p></div>
              <div className="flex gap-2"><div className="relative"><Search size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجوی بحرانی..." className="h-9 w-[200px] rounded-xl border bg-slate-50 pr-8 pl-3 text-[11px]"/></div><div className="relative"><Filter size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"/><select value={filter} onChange={e=>setFilter(e.target.value as any)} className="h-9 appearance-none rounded-xl border bg-white pr-8 pl-7 text-[10px] font-bold"><option value="all">همه</option><option value="critical">فقط مشکل‌دار</option><option value="no-website">بدون سایت</option><option value="high-lead">لید ۸۰+</option></select><ChevronDown size={12} className="pointer-events-none absolute left-2.5 top-3 text-slate-400"/></div></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right">
                <thead><tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-400"><th className="px-5 py-3">کسب‌وکار مشکل‌دار</th><th className="px-3 py-3">مشکل</th><th className="px-3 py-3">لینک‌های خیابانی کلیک‌شو</th><th className="px-3 py-3">شبکه مرتبط</th><th className="px-3 py-3">لید</th><th className="px-5 py-3"/></tr></thead>
                <tbody>
                  {visibleRecords.filter(r=>!r.websiteFound || r.qualityScore<55).slice(0,12).map(r=>{
                    const links=buildMapLinks(r);
                    const relCount = findRelatedCompanies(r, records, 700, 20).length;
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-[11px] font-bold text-rose-700">{r.name.slice(0,1)}</span><div><button onClick={()=>setSelected(r)} className="text-[12px] font-bold">{r.name}</button><p className="max-w-[220px] truncate text-[10px] text-slate-400">{r.address}</p></div></div></td>
                        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ring-1 ${qualityStyle(r)}`}>{r.websiteQuality}</span>{!r.hasBooking && r.category.includes("زیبایی") && <span className="mr-1 rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">بی‌رزرو</span>}</td>
                        <td className="px-3 py-3"><div className="flex flex-wrap gap-1"><a href={links.google} target="_blank" className="rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">Google</a><a href={links.neshan} target="_blank" className="rounded bg-teal-600 px-2 py-1 text-[10px] font-bold text-white">نشان</a>{r.website ? <a href={`https://${r.website}`} target="_blank" className="rounded bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">سایت</a> : <span className="rounded bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">بی‌سایت</span>}</div></td>
                        <td className="px-3 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700"><Network size={12}/>{faNumber.format(relCount)} همسایه مرتبط</span></td>
                        <td className="px-3 py-3"><span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${leadStyle(r.leadScore)}`}>{faNumber.format(r.leadScore)}</span></td>
                        <td className="px-5 py-3"><button onClick={()=>setSelected(r)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100"><ChevronLeft size={16}/></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section id="admin" className="mt-6 rounded-2xl border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f172a] text-white"><Database size={18}/></span><div><h3 className="text-[15px] font-extrabold">پنل ادمین - داده متفاوت در هر پنل</h3><p className="text-[10px] text-slate-400">شبکه ارتباطی / دسته‌بندی / پرامپت‌ها / خروجی نهایی با لینک کلیک‌شو</p></div></div>
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1">{[
                {k:"network" as AdminTab,l:"شبکه",i:Network},{k:"categories" as AdminTab,l:"دسته‌ها",i:BarChart3},{k:"prompts" as AdminTab,l:"پرامپت‌ها",i:FileJson},{k:"export" as AdminTab,l:"خروجی",i:Table2},
              ].map(({k,l,i:Icon})=> <button key={k} onClick={()=>setAdminTab(k)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold ${adminTab===k?"bg-white shadow text-[#162b43]":"text-slate-500"}`}><Icon size={14}/>{l}</button>)}</div>
            </div>
            <div className="p-5">
              {adminTab==="network" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div><h4 className="text-[13px] font-bold">خوشه‌های مشکل‌دار - قابل اتصال خدماتی</h4><div className="mt-3 space-y-2">{clusters.filter(c=>c.problemCount>=2).slice(0,5).map((c,i)=> <div key={i} className="rounded-xl border p-3"><div className="flex justify-between text-[11px] font-bold"><span>{c.label}</span><span className="text-rose-600">{faNumber.format(c.problemCount)} مشکل از {faNumber.format(c.businesses.length)}</span></div><div className="mt-2 flex flex-wrap gap-1">{c.businesses.map(b=> <span key={b.id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">{b.name.slice(0,12)}</span>)}</div><p className="mt-2 text-[10px] text-slate-500">{c.serviceGaps.join(" • ")}</p></div>)}</div></div>
                  <div className="rounded-xl bg-violet-50 p-4"><h5 className="text-[12px] font-bold text-violet-900">ایده‌های اتصال بین خدمات</h5><ul className="mt-2 space-y-2 text-[11px] text-violet-800 leading-5"><li>• کافه بی‌سایت + باشگاه با سایت در ۱۲۰م: پیشنهاد "باشگاه به مشتریانش کد تخفیف کافه بده + کافه بک‌لینک باشگاه"</li><li>• ۳ سالن زیبایی بدون رزرو در میدان کاج: پکیج "سیستم رزرو مشترک + بازاریابی مشترک عروس"</li><li>• کلینیک + داروخانه + آزمایشگاه هم‌خیابان: زنجیره سلامت - نوبت‌دهی یکپارچه</li><li>• رستوران بدون سفارش آنلاین + سوپرمارکت با پیک: اتصال سرویس تحویل</li></ul><a href="/api/related" target="_blank" className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">مشاهده API شبکه JSON</a></div>
                </div>
              )}
              {adminTab==="categories" && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categoryStats.map(s=> <div key={s.cat} className="rounded-xl border p-4"><div className="flex justify-between"><span className="text-[13px] font-bold">{s.cat}</span><span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700">{faNumber.format(s.critical)} بحرانی</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded bg-slate-50 p-2"><p className="text-[9px] text-slate-400">کل</p><strong>{faNumber.format(s.total)}</strong></div><div className="rounded bg-rose-50 p-2"><p className="text-[9px] text-rose-600">بی‌سایت</p><strong>{faNumber.format(s.noSite)}</strong></div><div className="rounded bg-amber-50 p-2"><p className="text-[9px]">لید</p><strong>{faNumber.format(s.avgLead)}</strong></div></div><button onClick={()=>{setSearch(s.cat); scrollTo("critical");}} className="mt-3 w-full rounded-lg bg-[#0f172a] py-1.5 text-[10px] font-bold text-white">فیلتر روی نقشه</button></div>)}</div>
              )}
              {adminTab==="prompts" && (
                <div><div className="flex justify-between"><div className="flex items-center gap-2"><FileJson size={16} className="text-violet-600"/><h4 className="text-[13px] font-bold">کتابخانه پرامپت‌ها + لینک خیابانی</h4></div><div className="relative"><Search size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"/><input value={promptSearch} onChange={e=>setPromptSearch(e.target.value)} placeholder="جست‌وجو..." className="h-9 w-[220px] rounded-xl border bg-slate-50 pr-8 pl-3 text-[11px]"/></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{records.filter(r=> (r.websitePrompt??"").toLowerCase().includes(promptSearch.toLowerCase())).slice(0,8).map(r=> <div key={r.id} className="rounded-xl border border-violet-100 bg-violet-50/30 p-3"><p className="text-[12px] font-bold">{r.name}</p><p className="text-[10px] text-slate-500 truncate">{r.address}</p><pre className="mt-2 max-h-[90px] overflow-auto whitespace-pre-wrap rounded bg-[#0f172a] p-2 text-[9px] text-violet-100">{(r.websitePrompt??"").slice(0,300)}...</pre><button onClick={()=>setSelected(r)} className="mt-2 w-full rounded bg-white py-1.5 text-[10px] font-bold">باز کردن + شبکه مرتبط</button></div>)}</div></div>
              )}
              {adminTab==="export" && (
                <div className="grid gap-5 lg:grid-cols-2">
                  <div><h4 className="text-[13px] font-bold">خروجی نهایی - با شبکه ارتباطی و لینک کلیک‌شو</h4><p className="mt-1 text-[11px] text-slate-500">CSV شامل ستون‌های اتصال: همسایگان مرتبط، دلیل اتصال، فاصله، لینک گوگل/نشان کلیک‌شو، پرامپت</p><div className="mt-4 grid grid-cols-2 gap-3"><a href="/api/export?format=csv" className="rounded-xl bg-[#0f172a] p-4 text-white"><div className="font-bold text-[13px]">CSV - لینک‌ها + شبکه</div><p className="mt-2 text-[10px] opacity-80">آماده اکسل، تمام لینک‌ها کلیک‌شو، ستون related + connection_reason</p></a><a href="/api/related" target="_blank" className="rounded-xl border bg-white p-4"><div className="font-bold text-[13px] text-[#162b43]">JSON شبکه ارتباطی</div><p className="mt-2 text-[10px] text-slate-500">خوشه‌ها، hotspotهای مشکل‌دار، اتصالات بین خدمات</p></a></div></div>
                  <div className="rounded-xl bg-slate-50 p-4"><h5 className="text-[11px] font-bold">پیش‌نمایش ۴ ردیف با شبکه</h5><div className="mt-2 space-y-2">{records.slice(0,4).map(r=>{ const rel=findRelatedCompanies(r, records, 600, 2); return <div key={r.id} className="rounded bg-white p-2 text-[10px]"><div className="flex justify-between"><span className="font-bold">{r.name}</span><span className="text-slate-400">{r.category}</span></div><p className="text-[9px] text-slate-500">مرتبط: {rel.map(x=> x.name.slice(0,10)).join("، ") || "—"}</p></div>;})}</div></div>
                </div>
              )}
            </div>
          </section>

          <section id="models" className="mt-8">
            <div className="flex justify-between"><h3 className="flex items-center gap-2 text-[16px] font-extrabold"><Route size={18} className="text-[#ee6748]"/> مدل‌های همکاری - با اتصال شبکه‌ای</h3><div className="flex gap-2"><a href="/api/export?format=csv" className="rounded-xl border bg-white px-3 py-2 text-[11px] font-bold">CSV</a><a href="/api/related" target="_blank" className="rounded-xl bg-[#ee6748] px-3 py-2 text-[11px] font-bold text-white">شبکه JSON</a></div></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cooperationModels.map(m=> <article key={m.slug} className={`rounded-2xl border bg-white p-4 ${m.color}`}><div className="flex justify-between"><span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold ring-1">{m.tag}</span><span className="text-[10px] opacity-80">{m.leadRange}</span></div><h4 className="mt-3 text-[13px] font-bold leading-5">{m.title}</h4><p className="mt-2 text-[10px] leading-5 opacity-80">{m.desc}</p><ul className="mt-3 space-y-1">{m.includes.map(inc=> <li key={inc} className="flex gap-1.5 text-[10px]"><Check size={12}/> {inc}</li>)}</ul></article>)}</div>
          </section>
        </main>
      </div>

      {isCollectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"><form onSubmit={startCollection} className="w-full max-w-[520px] rounded-2xl bg-white p-5"><div className="flex justify-between"><h3 className="font-extrabold">جمع‌آوری + شبکه</h3><button type="button" onClick={()=>setIsCollectionOpen(false)}><X size={18}/></button></div><div className="mt-4 grid grid-cols-3 gap-2">{tehranPresets.slice(0,6).map(p=> <button key={p.label} type="button" onClick={()=>{setLatitude(String(p.lat)); setLongitude(String(p.lng)); setMapCenter({lat:p.lat,lng:p.lng});}} className="rounded-xl border bg-slate-50 px-2 py-2 text-[10px] font-bold">{p.label}</button>)}</div><div className="mt-4 space-y-3"><input value={term} onChange={e=>setTerm(e.target.value)} className="h-10 w-full rounded-xl border px-3 text-[12px]" placeholder="دسته" required/><div className="grid grid-cols-2 gap-2"><input value={latitude} onChange={e=>setLatitude(e.target.value)} className="h-10 rounded-xl border px-3 text-left text-[12px]" placeholder="lat"/><input value={longitude} onChange={e=>setLongitude(e.target.value)} className="h-10 rounded-xl border px-3 text-left text-[12px]" placeholder="lng"/></div></div><div className="mt-4 flex gap-2"><button type="button" onClick={()=>setIsCollectionOpen(false)} className="flex-1 rounded-xl border py-2.5 text-[11px] font-bold">انصراف</button><button disabled={isLoading} className="flex-[1.6] rounded-xl bg-[#ee6748] py-2.5 text-[11px] font-bold text-white flex items-center justify-center gap-2">{isLoading?<LoaderCircle className="animate-spin" size={16}/>:<RefreshCw size={15}/>} شروع</button></div></form></div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/40" onMouseDown={()=>setSelected(null)}>
          <aside className="h-full w-full max-w-[580px] overflow-y-auto bg-white p-5 sm:p-6" onMouseDown={e=>e.stopPropagation()}>
            <div className="flex justify-between"><button onClick={()=>setSelected(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><X size={18}/></button><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${qualityStyle(selected)}`}>{selected.websiteQuality}</span></div>
            <div className="mt-5 flex gap-3"><span className={`grid h-[56px] w-[56px] place-items-center rounded-2xl text-[18px] font-bold ${!selected.websiteFound?"bg-rose-100 text-rose-700":"bg-teal-50 text-teal-700"}`}>{selected.name.slice(0,1)}</span><div><h3 className="text-[18px] font-extrabold">{selected.name}</h3><p className="text-[11px] text-slate-500">{selected.category} • لید {faNumber.format(selected.leadScore)}</p><p className="text-[10px] text-slate-400">{faDate.format(new Date(selected.lastChecked ?? new Date()))} • {selected.address.slice(0,60)}</p></div></div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="flex gap-2 text-[11px]"><MapPin size={14} className="text-rose-500 mt-0.5"/>{selected.address}</div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {(()=>{ const l=buildMapLinks(selected); return <><a href={l.google} target="_blank" className="rounded-lg bg-[#0f172a] px-2.5 py-2 text-center text-[10px] font-bold text-white">Google خیابانی</a><a href={l.neshan} target="_blank" className="rounded-lg bg-teal-600 px-2.5 py-2 text-center text-[10px] font-bold text-white">نشان nshn.ir</a><a href={l.waze} target="_blank" className="rounded-lg bg-white px-2.5 py-2 text-center text-[10px] font-bold ring-1">Waze</a><a href={`https://www.google.com/maps/search/${encodeURIComponent(selected.name+" "+selected.address)}`} target="_blank" className="rounded-lg bg-white px-2.5 py-2 text-center text-[10px] font-bold ring-1">خیابان‌ها</a></>;})()}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border p-3"><p className="text-[10px] text-slate-400">کیفیت</p><strong className="text-[20px]">{faNumber.format(selected.qualityScore)}</strong></div><div className="rounded-xl border border-rose-100 bg-rose-50 p-3"><p className="text-[10px] text-rose-700">لید + مشکل</p><strong className="text-[20px] text-rose-700">{faNumber.format(selected.leadScore)}</strong><p className="text-[9px] font-bold text-rose-700 mt-1">{!selected.websiteFound?"بدون سایت - بحرانی روی نقشه":""}</p></div></div>

            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-3">
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-violet-900"><Network size={14}/> شبکه مرتبط - کدام کسب‌وکارها در همین لوکیشن به هم وصل می‌شوند و چه خدماتی به هم می‌دهند؟</h4>
              <p className="mt-1 text-[10px] text-violet-700">خط‌چین‌ها روی نقشه اتصال همسایگی را نشان می‌دهد. فاصله تا ۹۰۰م.</p>
              <div className="mt-3 space-y-2 max-h-[300px] overflow-auto">
                {related.map(r=>(
                  <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-violet-100">
                    <div className="flex justify-between"><span className="text-[11px] font-bold">{r.name}</span><span className="text-[9px] bg-slate-100 rounded-full px-2 py-0.5 font-bold">{faNumber.format(r.distanceMeters)}م • {r.connectionType}</span></div>
                    <p className="mt-1 text-[10px] text-slate-500">{r.category} • {r.websiteFound?"سایت دارد":"بی‌سایت"} • لید {r.leadScore}</p>
                    <p className="mt-2 rounded-lg bg-violet-50 p-2 text-[10px] leading-5 text-violet-800">🔗 {r.connectionReason}</p>
                    <div className="mt-2 flex gap-1"><a href={buildMapLinks(r).google} target="_blank" className="rounded bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">Google</a><a href={buildMapLinks(r).neshan} target="_blank" className="rounded bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">نشان</a><button onClick={()=>setSelected(r)} className="ml-auto rounded bg-[#0f172a] px-2 py-1 text-[9px] font-bold text-white">دیدن این مرکز</button></div>
                  </div>
                ))}
                {related.length===0 && <p className="text-[10px] text-slate-400">همسایه نزدیکی یافت نشد - منطقه خلوت است.</p>}
              </div>
            </div>

            <div className="mt-5"><h4 className="text-[12px] font-bold">لینک‌های کلیک‌شو + وضعیت</h4><div className="mt-2 space-y-2">{[["وب‌سایت",selected.websiteFound, selected.website?`https://${selected.website}`:null],["Google خیابانی",true,buildMapLinks(selected).google],["نشان",true,buildMapLinks(selected).neshan]].map(([l,a,h])=> <div key={l as string} className="flex justify-between rounded-xl border px-3 py-2.5 text-[11px]"><span>{l as string}</span><div className="flex gap-2 items-center">{h ? <a href={h as string} target="_blank" className="max-w-[150px] truncate text-[10px] font-bold text-teal-700 underline">{(h as string).slice(0,30)}</a>:null}<span className={`text-[10px] font-bold ${a?"text-emerald-600":"text-slate-400"}`}>{a?"دارد":"ندارد"}</span></div></div>)}</div></div>

            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-3"><div className="flex justify-between"><h4 className="flex gap-2 text-[12px] font-bold text-violet-900"><Sparkles size={14}/> پرامپت طراحی سایت</h4><button onClick={copyPrompt} className="flex gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold ring-1 ring-violet-200">{copiedPrompt?<ClipboardCheck size={12}/>:<Clipboard size={12}/>}{copiedPrompt?"کپی شد":"کپی"}</button></div><pre className="mt-2 max-h-[200px] overflow-auto whitespace-pre-wrap rounded-xl bg-[#0f172a] p-3 text-[10px] leading-5 text-slate-100">{selected.websitePrompt??"—"}</pre></div>

            <div className="mt-5 grid grid-cols-2 gap-2"><button disabled={isAnalyzing} onClick={analyzeSelectedWebsite} className="flex items-center justify-center gap-2 rounded-xl border bg-teal-50 py-3 text-[11px] font-bold text-teal-700">{isAnalyzing?<LoaderCircle className="animate-spin" size={14}/>:<RefreshCw size={14}/>} تحلیل</button><button onClick={()=>setNotice(`${selected?.name} به پیگیری افزوده شد - ${related.length} همسایه مرتبط`)} className="flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] py-3 text-[11px] font-bold text-white"><Target size={14}/> پیگیری + شبکه</button></div>
          </aside>
        </div>
      )}
    </div>
  );
}
