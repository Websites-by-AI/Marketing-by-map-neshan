"use client";

import BusinessMap from "@/components/business-map";
import {
  buildLocalNetworkClusters,
  buildMapLinks,
  cooperationModels,
  demoBusinesses,
  distanceKm,
  findRelatedCompanies,
  simulateWebsiteAnalysis,
  tehranPresets,
  type BusinessRecord,
  type RelatedBusiness,
} from "@/lib/business-data";
import { exhibitionHallPresets, exhibitionMeta, promptForExhibitor } from "@/lib/exhibition";
import relatedModules from "@/data/related-modules.json";
import sisterCompanies from "@/data/sister-companies.json";
import { oilExhibitionMeta } from "@/lib/oil-exhibition";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleAlert,
  Clipboard,
  ClipboardCheck,
  Database,
  Download,
  FileJson,
  Filter,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  MapPin,
  MapPinned,
  Menu,
  Network,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  Table2,
  Target,
  Users2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const faNumber = new Intl.NumberFormat("fa-IR");
const faDate = new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" });

type Props = {
  initialRecords: BusinessRecord[];
  tehranRecords?: BusinessRecord[];
  exhibitionRecords?: BusinessRecord[];
  mode?: "live" | "demo";
  hasNeshanKey?: boolean;
  defaultSource?: "exhibition" | "tehran";
};
type FilterKey = "all" | "critical" | "no-website" | "needs-work" | "high-lead";
type AdminTab = "categories" | "prompts" | "export" | "pipeline" | "network";

const navItems = [
  { label: "نمای کلی", icon: LayoutDashboard, id: "overview" },
  { label: "نمایشگاه ساختمان", icon: Building2, id: "exhibition" },
  { label: "ماژول‌های مرتبط", icon: Sparkles, id: "modules" },
  { label: "نقشه سالن‌ها", icon: MapPinned, id: "map" },
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

function MetricCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  trend?: string;
  icon: typeof Building2;
  accent: "navy" | "orange" | "teal" | "violet";
}) {
  const accents = {
    navy: "bg-[#eaf0f6] text-[#19324d]",
    orange: "bg-[#fff0eb] text-[#e75d3e]",
    teal: "bg-[#e6f5f2] text-[#0e776f]",
    violet: "bg-[#f0edff] text-[#6854be]",
  };
  return (
    <article className="fade-up rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${accents[accent]}`}>
          <Icon size={20} />
        </div>
        {trend && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{trend}</span>}
      </div>
      <p className="mt-4 text-[12px] text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <strong className="text-[24px] font-extrabold text-[#162b43]">{value}</strong>
        <span className="mb-1 text-[10px] text-slate-400">{hint}</span>
      </div>
    </article>
  );
}

export default function MarketIntelligenceDashboard({
  initialRecords,
  tehranRecords = demoBusinesses,
  exhibitionRecords = [],
  mode = "demo",
  hasNeshanKey = false,
  defaultSource = "exhibition",
}: Props) {
  const [dataSource, setDataSource] = useState<"exhibition" | "tehran">(defaultSource);
  const [records, setRecords] = useState<BusinessRecord[]>(
    initialRecords.length ? initialRecords : exhibitionRecords.length ? exhibitionRecords : tehranRecords,
  );
  const [activeNav, setActiveNav] = useState("نمای کلی");
  const [mobileOpen, setMobileOpen] = useState(false);
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
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    defaultSource === "exhibition" ? { lat: 35.7905, lng: 51.4085 } : { lat: 35.785, lng: 51.385 },
  );
  const [remoteRelated, setRemoteRelated] = useState<{ id: number; items: RelatedBusiness[] } | null>(null);
  const isExhibition = dataSource === "exhibition";
  const mapPresets = isExhibition ? exhibitionHallPresets.slice(0, 8) : [...tehranPresets];

  const visibleRecords = useMemo(
    () =>
      records.filter((r) => {
        const matches = `${r.name} ${r.category} ${r.address}`.toLowerCase().includes(search.toLowerCase());
        const crit = !r.websiteFound || r.qualityScore < 50;
        const ok =
          filter === "all" ||
          (filter === "no-website" && !r.websiteFound) ||
          (filter === "needs-work" && r.websiteFound && r.qualityScore < 55) ||
          (filter === "high-lead" && r.leadScore >= 80) ||
          (filter === "critical" && crit);
        return matches && ok;
      }),
    [records, search, filter],
  );

  const criticalRecords = useMemo(
    () =>
      records
        .filter((r) => !r.websiteFound || r.qualityScore < 50)
        .sort((a, b) => b.leadScore - a.leadScore),
    [records],
  );

  const categoryStats = useMemo(() => {
    const m = new Map<string, { total: number; noSite: number; critical: number; avgLead: number }>();
    for (const r of records) {
      const c = m.get(r.category) ?? { total: 0, noSite: 0, critical: 0, avgLead: 0 };
      c.total++;
      c.noSite += r.websiteFound ? 0 : 1;
      c.critical += !r.websiteFound || r.qualityScore < 50 ? 1 : 0;
      c.avgLead += r.leadScore;
      m.set(r.category, c);
    }
    return Array.from(m.entries())
      .map(([cat, s]) => ({ cat, ...s, avgLead: Math.round(s.avgLead / Math.max(1, s.total)) }))
      .sort((a, b) => b.critical - a.critical);
  }, [records]);

  const densityAnalysis = useMemo(() => {
    if (dataSource === "exhibition") {
      return exhibitionHallPresets.slice(0, 6).map((p) => {
        const within = records.filter((r) => (r.halls ?? []).includes(p.label) || r.address.includes(p.label));
        return {
          preset: p,
          total: within.length || p.count,
          noSite: within.filter((r) => !r.websiteFound).length,
          critical: within.filter((r) => !r.websiteFound || r.qualityScore < 50).length,
        };
      });
    }
    return tehranPresets.map((p) => {
      const within = records.filter(
        (r) => r.latitude && r.longitude && distanceKm({ lat: p.lat, lng: p.lng }, { lat: r.latitude!, lng: r.longitude! }) * 1000 <= 900,
      );
      return {
        preset: p,
        total: within.length,
        noSite: within.filter((r) => !r.websiteFound).length,
        critical: within.filter((r) => !r.websiteFound || r.qualityScore < 50).length,
      };
    });
  }, [records, dataSource]);

  const clusters = useMemo(() => buildLocalNetworkClusters(records), [records]);
  const computedRelated = useMemo(
    () => (selected ? findRelatedCompanies(selected, records, 900, 8) : []),
    [selected, records],
  );
  const related = remoteRelated && selected && remoteRelated.id === selected.id ? remoteRelated.items : computedRelated;
  const avgDistance = useMemo(() => {
    if (!selected || !related.length) return 420;
    return Math.round(related.reduce((sum, row) => sum + row.distanceMeters, 0) / related.length);
  }, [selected, related]);

  useEffect(() => {
    if (!selected) return;
    const selectedId = selected.id;
    let cancelled = false;
    fetch(`/api/related?businessId=${selectedId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { related?: RelatedBusiness[] } | null) => {
        if (!cancelled && data?.related) setRemoteRelated({ id: selectedId, items: data.related });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selected]);

  async function startCollection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, latitude: Number(latitude), longitude: Number(longitude) }),
      });
      const payload = (await res.json()) as { items?: BusinessRecord[]; count?: number; message?: string; source?: string };
      if (!res.ok && !payload.items?.length) throw new Error(payload.message ?? "ناموفق");
      if (payload.items?.length) setRecords(payload.items);
      setMapCenter({ lat: Number(latitude), lng: Number(longitude) });
      setNotice(payload.message ?? `${faNumber.format(payload.count ?? 0)} نتیجه — شبکه ارتباطی و پرامپت‌ها آپدیت شد`);
      setIsCollectionOpen(false);
      setActiveNav("نقشه خیابانی");
      scrollTo("map");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "اتصال نشد");
    } finally {
      setIsLoading(false);
    }
  }

  function openBusiness(record: BusinessRecord) {
    const next = record.websitePrompt ? record : { ...record, websitePrompt: promptForExhibitor(record) };
    setSelected(next);
    if (next.latitude && next.longitude) setMapCenter({ lat: next.latitude, lng: next.longitude });
  }

  async function analyzeSelectedWebsite() {
    if (!selected) return;
    setIsAnalyzing(true);
    try {
      if (selected.id <= 0) {
        const item = simulateWebsiteAnalysis(selected);
        setRecords((cur) => cur.map((r) => (r.id === item.id ? item : r)));
        setSelected(item);
        setNotice(`تحلیل نمونه برای ${selected.name} به‌روز شد`);
        return;
      }
      const res = await fetch("/api/website-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected.id }),
      });
      const payload = (await res.json()) as { item?: BusinessRecord; message?: string };
      if (!res.ok || !payload.item) throw new Error(payload.message ?? "ناموفق");
      setRecords((cur) => cur.map((r) => (r.id === payload.item!.id ? payload.item! : r)));
      setSelected(payload.item);
      setNotice(`تحلیل ${selected.name} به‌روز شد`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "ناموفق");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function copyPrompt() {
    if (!selected?.websitePrompt) return;
    await navigator.clipboard.writeText(selected.websitePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  }

  const sidebar = (
    <>
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ee6748]">
          <span className="h-4 w-4 rounded-full border-2 border-white" />
        </div>
        <div>
          <a href="/" className="text-[16px] font-extrabold text-white">
            دیدبان محلی
          </a>
          <p className="text-[10px] tracking-wide text-slate-400">NETWORK • MAP • NESHAN</p>
        </div>
      </div>
      <div className="mt-8 px-2 text-[10px] font-bold tracking-widest text-slate-500">پنل‌ها</div>
      <nav className="mt-3 space-y-1">
        {navItems.map(({ label, icon: Icon, id }) => {
          const active = activeNav === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActiveNav(label);
                scrollTo(id);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] transition ${active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {label === "بحرانی‌ها" && (
                <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {faNumber.format(criticalRecords.length)}
                </span>
              )}
              {label === "شبکه ارتباطی" && (
                <span className="rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {faNumber.format(clusters.length)}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-white">
          <Network size={14} className="text-violet-300" /> خوشه‌های مرتبط
        </div>
        <div className="mt-2 space-y-1 text-[10px] text-slate-300">
          {clusters.slice(0, 3).map((c, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="truncate">{c.label.slice(0, 22)}</span>
              <span className="shrink-0 font-bold text-white">
                {faNumber.format(c.businesses.length)} • {faNumber.format(c.problemCount)} مشکل
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-bold">
          <a href="/audit" className="rounded-lg bg-white/10 px-2 py-1 text-white">صحت</a>
          <a href="/memory" className="rounded-lg bg-white/10 px-2 py-1 text-white">حافظه</a>
          <a href="/connect" className="rounded-lg bg-white/10 px-2 py-1 text-white">API</a>
          <a href="/sisters/admin" className="rounded-lg bg-[#ee6748] px-2 py-1 text-white">ادمین خواهرها</a>
        </div>
        <p className="text-[11px] font-bold text-white">خروجی شبکه + پرامپت</p>
        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          هر کسب‌وکار مشکل‌دار با همسایگانش لینک می‌شود و پیشنهاد اتصال خدماتی تولید می‌شود.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={dataSource === "exhibition" ? "/api/exhibition?format=csv" : "/api/export?format=csv"} className="rounded-lg bg-white/10 py-1.5 text-center text-[10px] font-bold text-white">
            CSV
          </a>
          <a href={dataSource === "exhibition" ? "/api/exhibition" : "/api/export?format=json"} className="rounded-lg bg-[#ee6748] py-1.5 text-center text-[10px] font-bold text-white">
            JSON
          </a>
        </div>
      </div>
    </>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-transparent text-slate-800">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-[280px] flex-col bg-[#132b45] px-4 py-5 text-slate-200 lg:flex">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="بستن منو" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-[280px] flex-col bg-[#132b45] px-4 py-5 text-slate-200 shadow-2xl">
            <button type="button" onClick={() => setMobileOpen(false)} className="mb-4 mr-auto grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
              <X size={16} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:mr-[280px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex h-[66px] items-center gap-3 px-4 sm:px-6">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border bg-white lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>{activeNav}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${mode === "live" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {mode === "live" ? "داده زنده" : "حالت نمونه"}
                </span>
                {!hasNeshanKey && <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 sm:inline">بدون کلید نشان</span>}
                <span className="hidden rounded-full bg-[#fff0eb] px-2 py-0.5 text-[9px] font-bold text-[#c63c1f] sm:inline">
                  {dataSource === "exhibition" ? "IRAN CONFAIR ۱۴۰۵" : "نمونه غرب تهران"}
                </span>
              </div>
              <h1 className="truncate text-[14px] font-extrabold text-[#162b43] sm:text-[15px]">
                {dataSource === "exhibition" ? "غرفه‌داران نمایشگاه بین‌المللی ساختمان" : "نقشه مشکلات + شبکه کسب‌وکارهای مرتبط"}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                if (dataSource === "exhibition") {
                  setDataSource("tehran");
                  setRecords(tehranRecords);
                  setMapCenter({ lat: 35.785, lng: 51.385 });
                } else {
                  setDataSource("exhibition");
                  setRecords(exhibitionRecords.length ? exhibitionRecords : records);
                  setMapCenter({ lat: 35.7905, lng: 51.4085 });
                }
              }}
              className="hidden rounded-xl border bg-white px-3 py-2 text-[11px] font-bold sm:inline"
            >
              {dataSource === "exhibition" ? "نمونه تهران" : "نمایشگاه ۱۴۰۵"}
            </button>
            <a href={dataSource === "exhibition" ? "/api/exhibition?format=csv" : "/api/export?format=csv"} className="hidden items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[11px] font-bold sm:flex">
              <Download size={14} /> خروجی
            </a>
            <button type="button" onClick={() => setIsCollectionOpen(true)} className="rounded-xl bg-[#ee6748] px-3 py-2 text-[11px] font-bold text-white sm:px-4">
              جمع‌آوری نشان
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1700px] px-4 py-6 lg:px-8">
          {notice && (
            <div className="mb-4 flex justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-800">
              <span className="flex gap-2">
                <Check size={15} />
                {notice}
              </span>
              <button type="button" onClick={() => setNotice(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#10263d_0%,#1b3d5c_58%,#ee6748_160%)] p-5 text-white shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold tracking-wide text-orange-200">
                  {dataSource === "exhibition" ? exhibitionMeta.alias : "هوش بازار محلی روی نقشه نشان"}
                </p>
                <h2 className="mt-2 text-[22px] font-extrabold leading-9 sm:text-[28px]">
                  {dataSource === "exhibition"
                    ? `${faNumber.format(exhibitionRecords.length || records.length)} غرفه‌دار نمایشگاه ساختمان آماده پیگیری دیجیتال`
                    : "کسب‌وکارهای غرب تهران را پیدا کنید، مشکل دیجیتال‌شان را ببینید و پکیج همکاری بسازید."}
                </h2>
                <p className="mt-3 max-w-xl text-[12px] leading-6 text-slate-200">
                  {dataSource === "exhibition"
                    ? `${exhibitionMeta.event} از ${exhibitionMeta.dates} در ${exhibitionMeta.venue}. لیست از سایت رسمی اتاق تعاون استخراج شده و برای لیدسازی سایت و سئو محلی امتیازدهی شده است.`
                    : "جمع‌آوری از نشان، امتیاز لید، شبکه همسایگی و پرامپت ساخت سایت — همه در یک داشبورد."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => scrollTo(dataSource === "exhibition" ? "exhibition" : "map")} className="rounded-xl bg-[#ee6748] px-4 py-2.5 text-[12px] font-bold">
                  {dataSource === "exhibition" ? "لیست غرفه‌داران" : "رفتن به نقشه"}
                </button>
                <a href="/api/exhibition?format=csv" className="rounded-xl bg-white/10 px-4 py-2.5 text-[12px] font-bold ring-1 ring-white/20">
                  دانلود CSV نمایشگاه
                </a>
              </div>
            </div>
          </section>

          <section id="overview" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label={isExhibition ? "غرفه‌دار رسمی ۱۴۰۵" : "کل کسب‌وکارها در نقشه"} value={faNumber.format(records.length)} hint={isExhibition ? "لیست iccexpo" : "غرب تهران"} icon={Building2} accent="navy" />
            <MetricCard
              label={isExhibition ? "بدون دامنه در لیست رسمی" : "مشکل‌دار (بدون سایت/ضعیف)"}
              value={faNumber.format(criticalRecords.length)}
              hint={isExhibition ? "نه لزوماً بی‌سایت واقعی" : "نیاز فوری"}
              trend={`${Math.round((criticalRecords.length / Math.max(1, records.length)) * 100)}٪`}
              icon={CircleAlert}
              accent="orange"
            />
            <MetricCard label={isExhibition ? "سالن / فضای باز" : "خوشه‌های همسایگی مرتبط"} value={faNumber.format(isExhibition ? exhibitionHallPresets.length : clusters.length)} hint={isExhibition ? "پین تقریبی سالن" : "اتصال خدمات"} icon={Network} accent="violet" />
            <MetricCard label={isExhibition ? "دامنه دستی شناخته‌شده" : "میانگین فاصله اتصال"} value={isExhibition ? faNumber.format(records.filter((r) => r.websiteFound).length) : `~${faNumber.format(avgDistance)}m`} hint={isExhibition ? "از دانش قبلی نه iccexpo" : "در یک خیابان"} icon={Link2} accent="teal" />
          </section>


          <section id="exhibition" className="mt-6 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-[14px] font-extrabold">
                  <Building2 size={18} className="text-[#ee6748]" /> غرفه‌داران IRAN CONFAIR ۱۴۰۵
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  {exhibitionMeta.dates} • {exhibitionMeta.venue} • منبع: iccexpo.com • پین نقشه تقریبی سالن است
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="/api/exhibition?format=csv" className="rounded-xl bg-[#0f172a] px-3 py-2 text-[11px] font-bold text-white">دانلود CSV</a>
                <a href="/api/exhibition" target="_blank" rel="noreferrer" className="rounded-xl border px-3 py-2 text-[11px] font-bold">JSON</a>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleRecords.slice(0, 18).map((r) => (
                <button key={r.id} type="button" onClick={() => openBusiness(r)} className="rounded-xl border bg-slate-50 p-3 text-right hover:border-[#ee6748]/40">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[12px] font-extrabold text-[#162b43]">{r.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${qualityStyle(r)}`}>{r.websiteFound ? "سایت" : "بی‌سایت"}</span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">{r.category}</p>
                  <p className="mt-1 truncate text-[10px] text-slate-400">{r.address}</p>
                  <p className="mt-2 text-[10px] font-bold text-[#ee6748]">لید {faNumber.format(r.leadScore)}</p>
                </button>
              ))}
            </div>
          </section>

          <section id="modules" className="mt-6 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-[14px] font-extrabold">
                  <Sparkles size={18} className="text-violet-600" /> ماژول‌های مرتبط: Adv-seo-2 + Hugging Face + لیست قدیمی
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  این نقشه باید به موتور لید Adv-seo-2 و RAG نمایشگاه وصل شود — نه اینکه همه چیز را از صفر بسازد.
                </p>
              </div>
              <a href="/api/modules" target="_blank" rel="noreferrer" className="rounded-xl bg-[#0f172a] px-3 py-2 text-[11px] font-bold text-white">
                JSON ماژول‌ها
              </a>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <article className="rounded-xl border bg-slate-50 p-3">
                <h4 className="text-[12px] font-extrabold">بازگشتی از نمایشگاه قدیمی در و پنجره</h4>
                <p className="mt-1 text-[10px] text-slate-500">از ۲۰۰ شرکت آرشیو Dowintech فقط این‌ها امسال هم غرفه دارند.</p>
                <div className="mt-2 space-y-2">
                  {relatedModules.returningFromOldExhibition.map((row) => (
                    <div key={row.name} className="rounded-lg bg-white p-2 text-[11px]">
                      <div className="font-bold">{row.name}</div>
                      <div className="text-[10px] text-slate-500">{row.booth} • {row.phone}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-400">نمونه آرشیو: {relatedModules.oldExhibitionSample.slice(0, 6).join("، ")}</p>
              </article>

              <article className="rounded-xl border bg-violet-50 p-3">
                <h4 className="text-[12px] font-extrabold text-violet-900">لیست آژانس سئو تهران</h4>
                <div className="mt-2 max-h-[220px] space-y-1 overflow-auto">
                  {relatedModules.seoVendors.map((v) => (
                    <a key={v.name} href={v.website} target="_blank" rel="noreferrer" className="flex justify-between rounded bg-white px-2 py-1.5 text-[10px]">
                      <span className="font-bold">{v.rank}. {v.name}</span>
                      <span className="text-slate-500">{v.score} • {v.phone}</span>
                    </a>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border bg-[#fff8f4] p-3">
                <h4 className="text-[12px] font-extrabold">Hugging Face اولویت A</h4>
                <div className="mt-2 space-y-1">
                  {relatedModules.huggingFace.filter((s) => s.priority === "A").map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="block rounded bg-white px-2 py-1.5 text-[10px]">
                      <div className="font-bold">{s.id.replace("SoSa123456/", "")}</div>
                      <div className="text-slate-500">{s.role}</div>
                    </a>
                  ))}
                </div>
              </article>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {relatedModules.githubModules.map((g) => (
                <a key={g.url} href={g.url} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-700">
                  {g.name}
                </a>
              ))}
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {densityAnalysis.slice(0, 3).map((row) => (
              <button
                key={row.preset.label}
                type="button"
                onClick={() => {
                  setMapCenter({ lat: row.preset.lat, lng: row.preset.lng });
                  scrollTo("map");
                }}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm transition hover:border-[#ee6748]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-extrabold text-[#162b43]">{row.preset.label}</span>
                  <span className="text-[10px] text-slate-400">{row.preset.description}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 p-2">
                    <p className="text-[9px] text-slate-400">کل</p>
                    <strong className="text-[14px]">{faNumber.format(row.total)}</strong>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-2">
                    <p className="text-[9px] text-rose-600">بی‌سایت</p>
                    <strong className="text-[14px]">{faNumber.format(row.noSite)}</strong>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-2">
                    <p className="text-[9px] text-amber-700">بحرانی</p>
                    <strong className="text-[14px]">{faNumber.format(row.critical)}</strong>
                  </div>
                </div>
              </button>
            ))}
          </section>

          <section id="map" className="mt-6 scroll-mt-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-[14px] font-extrabold">
                    <MapPinned size={18} className="text-teal-600" /> {isExhibition ? "نقشه سالن‌های نمایشگاه — پین تقریبی است" : "نقشه خیابانی - مشکلات قرمز + خطوط ارتباط خدماتی"}
                  </h3>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {isExhibition
                      ? "مختصات مرکز سالن است با افست چند متری، نه GPS دقیق غرفه. سعادت‌آباد مربوط به حالت نمونه تهران است."
                      : "یک پین را انتخاب کنید تا همسایه‌های هم‌خیابان و پرامپت ساخت سایت باز شود."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mapPresets.slice(0, 8).map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setMapCenter({ lat: p.lat, lng: p.lng })}
                      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${mapCenter.lat === p.lat ? "border-[#ee6748] bg-[#fff0eb] text-[#c63c1f]" : "bg-white text-slate-600"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <BusinessMap
                businesses={visibleRecords}
                center={mapCenter}
                onSelectBusiness={openBusiness}
                highlightedId={selected?.id ?? null}
                relatedIds={related.map((r) => r.id)}
                showConnections
              />
            </div>
          </section>

          <section id="network" className="mt-6 grid scroll-mt-24 gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold">
                <Network size={18} className="text-violet-600" /> شبکه کسب‌وکارهای مرتبط
              </h3>
              <p className="mt-1 text-[10px] text-slate-400">بر اساس فاصله ۹۰۰م و دسته‌بندی — همسایگانی که می‌توانند خدمات را به هم وصل کنند</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {clusters.slice(0, 4).map((cluster, idx) => (
                  <div key={idx} className="rounded-xl border bg-slate-50 p-3">
                    <div className="flex justify-between gap-2">
                      <span className="text-[12px] font-bold">{cluster.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${cluster.problemCount >= 2 ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {faNumber.format(cluster.problemCount)} مشکل
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cluster.businesses.slice(0, 5).map((b) => (
                        <span key={b.id} className={`rounded-full px-2 py-1 text-[9px] font-bold ${!b.websiteFound ? "bg-rose-100 text-rose-700" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
                          {b.name.slice(0, 14)}
                        </span>
                      ))}
                    </div>
                    {cluster.serviceGaps.length > 0 && (
                      <div className="mt-2 rounded-lg bg-amber-50 p-2 text-[10px] text-amber-800">
                        <p className="font-bold">خلاء خدماتی مشترک:</p>
                        <ul className="mt-1 list-disc pr-4">
                          {cluster.serviceGaps.map((g) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const first = cluster.businesses[0];
                        if (first.latitude) {
                          setMapCenter({ lat: first.latitude, lng: first.longitude! });
                          setSelected(first);
                          scrollTo("map");
                        }
                      }}
                      className="mt-2 w-full rounded-lg bg-[#0f172a] py-1.5 text-[10px] font-bold text-white"
                    >
                      نمایش خوشه روی نقشه
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3 text-[11px]">
                <p className="font-extrabold text-violet-900">چطور اتصال خدماتی می‌سازد؟</p>
                <ul className="mt-2 list-disc space-y-1 pr-4 text-[10px] leading-5 text-violet-800">
                  <li>
                    <b>هم‌خیابانی:</b> کافه بدون سایت + باشگاه با سایت → اشتراک مشتری پیاده + بک‌لینک محلی
                  </li>
                  <li>
                    <b>خوشه بحرانی:</b> ۳ کسب‌وکار بدون سایت در ۳۰۰م → پکیج گروهی ساخت سایت
                  </li>
                  <li>
                    <b>زنجیره خدماتی:</b> سالن زیبایی + کلینیک + عکاس → پکیج عروس و رزرو مشترک
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#fffcf8] p-5 shadow-sm">
              <h4 className="flex items-center gap-2 text-[13px] font-extrabold">
                <Users2 size={16} className="text-orange-600" /> کسب‌وکار انتخاب‌شده و همسایگان
              </h4>
              {!selected ? (
                <p className="mt-4 text-[11px] text-slate-500">یک پین روی نقشه انتخاب کنید تا کسب‌وکارهای مرتبط در همان خیابان (تا ۹۰۰م) نمایش داده شود.</p>
              ) : (
                <div>
                  <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="text-[13px] font-extrabold">{selected.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {selected.category} • {selected.address}
                    </p>
                    <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${qualityStyle(selected)}`}>{selected.websiteQuality}</p>
                  </div>
                  <p className="mt-4 text-[11px] font-bold text-slate-700">مرتبط‌ها در همین لوکیشن ({faNumber.format(related.length)}):</p>
                  <div className="mt-2 max-h-[360px] space-y-2 overflow-auto pr-1">
                    {related.map((r) => {
                      const links = buildMapLinks(r);
                      return (
                        <div key={r.id} className="rounded-xl border bg-white p-3">
                          <div className="flex justify-between">
                            <span className="text-[11px] font-bold">{r.name}</span>
                            <span className="text-[9px] text-slate-400">{faNumber.format(r.distanceMeters)}م</span>
                          </div>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {r.category} • {r.websiteFound ? "سایت دارد" : "بدون سایت"} • لید {r.leadScore}
                          </p>
                          <p
                            className={`mt-2 rounded-lg p-2 text-[10px] leading-5 ${r.connectionType === "problem-cluster" ? "bg-rose-50 text-rose-800" : r.connectionType === "complementary" ? "bg-violet-50 text-violet-800" : "bg-slate-50 text-slate-700"}`}
                          >
                            {r.connectionReason}
                          </p>
                          <div className="mt-2 flex gap-1">
                            <a href={links.google} target="_blank" rel="noreferrer" className="rounded bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">
                              Google
                            </a>
                            <a href={links.neshan} target="_blank" rel="noreferrer" className="rounded bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">
                              نشان
                            </a>
                            <button type="button" onClick={() => setSelected(r)} className="mr-auto rounded bg-slate-900 px-2 py-1 text-[9px] font-bold text-white">
                              مرکز کن
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {related.length === 0 && <p className="text-[10px] text-slate-400">همسایه نزدیکی یافت نشد — منطقه شلوغ‌تری مثل میدان کاج را انتخاب کنید.</p>}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section id="critical" className="mt-6 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-[14px] font-extrabold">
                  <AlertTriangle size={18} className="text-rose-500" /> لیست کسب‌وکارهای مشکل‌دار
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">هر ردیف: مشکل اصلی + لینک‌های کلیک‌شو + شبکه مرتبط</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جست‌وجوی بحرانی..." className="h-9 w-[200px] rounded-xl border bg-slate-50 pr-8 pl-3 text-[11px]" />
                </div>
                <div className="relative">
                  <Filter size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" />
                  <select value={filter} onChange={(e) => setFilter(e.target.value as FilterKey)} className="h-9 appearance-none rounded-xl border bg-white pr-8 pl-7 text-[10px] font-bold">
                    <option value="all">همه</option>
                    <option value="critical">فقط مشکل‌دار</option>
                    <option value="no-website">بدون سایت</option>
                    <option value="high-lead">لید ۸۰+</option>
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute left-2.5 top-3 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right">
                <thead>
                  <tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-400">
                    <th className="px-5 py-3">کسب‌وکار مشکل‌دار</th>
                    <th className="px-3 py-3">مشکل</th>
                    <th className="px-3 py-3">لینک‌های خیابانی</th>
                    <th className="px-3 py-3">شبکه مرتبط</th>
                    <th className="px-3 py-3">لید</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords
                    .filter((r) => !r.websiteFound || r.qualityScore < 55)
                    .slice(0, 14)
                    .map((r) => {
                      const links = buildMapLinks(r);
                      const relCount = findRelatedCompanies(r, records, 700, 20).length;
                      return (
                        <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-[11px] font-bold text-rose-700">{r.name.slice(0, 1)}</span>
                              <div>
                                <button type="button" onClick={() => setSelected(r)} className="text-[12px] font-bold">
                                  {r.name}
                                </button>
                                <p className="max-w-[220px] truncate text-[10px] text-slate-400">{r.address}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ring-1 ${qualityStyle(r)}`}>{r.websiteQuality}</span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              <a href={links.google} target="_blank" rel="noreferrer" className="rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">
                                Google
                              </a>
                              <a href={links.neshan} target="_blank" rel="noreferrer" className="rounded bg-teal-600 px-2 py-1 text-[10px] font-bold text-white">
                                نشان
                              </a>
                              {r.website ? (
                                <a href={`https://${r.website}`} target="_blank" rel="noreferrer" className="rounded bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
                                  سایت
                                </a>
                              ) : (
                                <span className="rounded bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">بی‌سایت</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                              <Network size={12} />
                              {faNumber.format(relCount)} همسایه
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${leadStyle(r.leadScore)}`}>{faNumber.format(r.leadScore)}</span>
                          </td>
                          <td className="px-5 py-3">
                            <button type="button" onClick={() => setSelected(r)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100">
                              <ChevronLeft size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>

          <section id="admin" className="mt-6 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f172a] text-white">
                  <Database size={18} />
                </span>
                <div>
                  <h3 className="text-[15px] font-extrabold">پنل ادمین</h3>
                  <p className="text-[10px] text-slate-400">شبکه / دسته‌بندی / پرامپت‌ها / پایپلاین / خروجی</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { k: "network" as AdminTab, l: "شبکه", i: Network },
                  { k: "categories" as AdminTab, l: "دسته‌ها", i: BarChart3 },
                  { k: "prompts" as AdminTab, l: "پرامپت‌ها", i: FileJson },
                  { k: "pipeline" as AdminTab, l: "پایپلاین", i: Target },
                  { k: "export" as AdminTab, l: "خروجی", i: Table2 },
                ].map(({ k, l, i: Icon }) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setAdminTab(k)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold ${adminTab === k ? "bg-white text-[#162b43] shadow" : "text-slate-500"}`}
                  >
                    <Icon size={14} />
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              {adminTab === "network" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="text-[13px] font-bold">خوشه‌های مشکل‌دار</h4>
                    <div className="mt-3 space-y-2">
                      {clusters
                        .filter((c) => c.problemCount >= 2)
                        .slice(0, 5)
                        .map((c, i) => (
                          <div key={i} className="rounded-xl border p-3">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span>{c.label}</span>
                              <span className="text-rose-600">
                                {faNumber.format(c.problemCount)} مشکل از {faNumber.format(c.businesses.length)}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {c.businesses.map((b) => (
                                <span key={b.id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">
                                  {b.name.slice(0, 12)}
                                </span>
                              ))}
                            </div>
                            <p className="mt-2 text-[10px] text-slate-500">{c.serviceGaps.join(" • ")}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-violet-50 p-4">
                    <h5 className="text-[12px] font-bold text-violet-900">ایده‌های اتصال بین خدمات</h5>
                    <ul className="mt-2 space-y-2 text-[11px] leading-5 text-violet-800">
                      {isExhibition ? (
                        <>
                          <li>• سالن ۸ و ۹ لوله و اتصالات: کاتالوگ مشترک + لندینگ محصول</li>
                          <li>• سالن ۳۸B درب و پنجره: فقط ۲ بازگشتی تأییدشده تلفن دارند</li>
                          <li>• بانک‌ها و سندیکا امتیاز لید پایین‌تر می‌گیرند — مشتری سایت نیستند</li>
                          <li>• دامنه دستی را سایت رسمی فرض نکن تا هویت‌سنجی شود</li>
                        </>
                      ) : (
                        <>
                          <li>• کافه بی‌سایت + باشگاه با سایت در ۱۲۰م: کد تخفیف مشترک + بک‌لینک محلی</li>
                          <li>• ۳ سالن زیبایی بدون رزرو در میدان کاج: سیستم رزرو مشترک</li>
                          <li>• کلینیک + داروخانه + آزمایشگاه هم‌خیابان: زنجیره سلامت</li>
                          <li>• رستوران بدون سفارش آنلاین + سوپرمارکت با پیک: اتصال سرویس تحویل</li>
                        </>
                      )}
                    </ul>
                    <a href="/api/related" target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">
                      مشاهده API شبکه JSON
                    </a>
                  </div>
                </div>
              )}
              {adminTab === "categories" && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryStats.map((s) => (
                    <div key={s.cat} className="rounded-xl border p-4">
                      <div className="flex justify-between">
                        <span className="text-[13px] font-bold">{s.cat}</span>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700">{faNumber.format(s.critical)} بحرانی</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded bg-slate-50 p-2">
                          <p className="text-[9px] text-slate-400">کل</p>
                          <strong>{faNumber.format(s.total)}</strong>
                        </div>
                        <div className="rounded bg-rose-50 p-2">
                          <p className="text-[9px] text-rose-600">بی‌سایت</p>
                          <strong>{faNumber.format(s.noSite)}</strong>
                        </div>
                        <div className="rounded bg-amber-50 p-2">
                          <p className="text-[9px]">لید</p>
                          <strong>{faNumber.format(s.avgLead)}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch(s.cat);
                          scrollTo("critical");
                        }}
                        className="mt-3 w-full rounded-lg bg-[#0f172a] py-1.5 text-[10px] font-bold text-white"
                      >
                        فیلتر روی نقشه
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {adminTab === "prompts" && (
                <div>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileJson size={16} className="text-violet-600" />
                      <h4 className="text-[13px] font-bold">کتابخانه پرامپت‌ها</h4>
                    </div>
                    <div className="relative">
                      <Search size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" />
                      <input value={promptSearch} onChange={(e) => setPromptSearch(e.target.value)} placeholder="جست‌وجو..." className="h-9 w-[220px] rounded-xl border bg-slate-50 pr-8 pl-3 text-[11px]" />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {records
                      .filter((r) => (r.websitePrompt ?? "").toLowerCase().includes(promptSearch.toLowerCase()) || r.name.includes(promptSearch))
                      .slice(0, 8)
                      .map((r) => (
                        <div key={r.id} className="rounded-xl border border-violet-100 bg-violet-50/30 p-3">
                          <p className="text-[12px] font-bold">{r.name}</p>
                          <p className="truncate text-[10px] text-slate-500">{r.address}</p>
                          <pre className="mt-2 max-h-[90px] overflow-auto whitespace-pre-wrap rounded bg-[#0f172a] p-2 text-[9px] text-violet-100">{(r.websitePrompt ?? "").slice(0, 300)}...</pre>
                          <button type="button" onClick={() => setSelected(r)} className="mt-2 w-full rounded bg-white py-1.5 text-[10px] font-bold">
                            باز کردن + شبکه مرتبط
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {adminTab === "pipeline" && (
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { title: "کشف شده", items: records.filter((r) => r.leadScore >= 80), tone: "bg-slate-50" },
                    { title: "نیاز به سایت", items: records.filter((r) => !r.websiteFound), tone: "bg-rose-50" },
                    { title: "آماده پیشنهاد", items: records.filter((r) => r.websiteFound && r.qualityScore < 55), tone: "bg-amber-50" },
                  ].map((col) => (
                    <div key={col.title} className={`rounded-2xl border p-3 ${col.tone}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-[12px] font-extrabold">{col.title}</h4>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold">{faNumber.format(col.items.length)}</span>
                      </div>
                      <div className="space-y-2">
                        {col.items.slice(0, 6).map((item) => (
                          <button key={item.id} type="button" onClick={() => setSelected(item)} className="w-full rounded-xl bg-white p-3 text-right shadow-sm">
                            <p className="text-[11px] font-bold">{item.name}</p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              {item.category} • لید {faNumber.format(item.leadScore)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {adminTab === "export" && (
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <h4 className="text-[13px] font-bold">خروجی نهایی</h4>
                    <p className="mt-1 text-[11px] text-slate-500">CSV شامل ستون‌های اتصال، لینک گوگل/نشان و پرامپت</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <a href={dataSource === "exhibition" ? "/api/exhibition?format=csv" : "/api/export?format=csv"} className="rounded-xl bg-[#0f172a] p-4 text-white">
                        <div className="text-[13px] font-bold">CSV - لینک‌ها + شبکه</div>
                        <p className="mt-2 text-[10px] opacity-80">آماده اکسل، لینک‌ها کلیک‌شو</p>
                      </a>
                      <a href="/api/related" target="_blank" rel="noreferrer" className="rounded-xl border bg-white p-4">
                        <div className="text-[13px] font-bold text-[#162b43]">JSON شبکه ارتباطی</div>
                        <p className="mt-2 text-[10px] text-slate-500">خوشه‌ها و hotspotهای مشکل‌دار</p>
                      </a>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <h5 className="text-[11px] font-bold">پیش‌نمایش ۴ ردیف با شبکه</h5>
                    <div className="mt-2 space-y-2">
                      {records.slice(0, 4).map((r) => {
                        const rel = findRelatedCompanies(r, records, 600, 2);
                        return (
                          <div key={r.id} className="rounded bg-white p-2 text-[10px]">
                            <div className="flex justify-between">
                              <span className="font-bold">{r.name}</span>
                              <span className="text-slate-400">{r.category}</span>
                            </div>
                            <p className="text-[9px] text-slate-500">مرتبط: {rel.map((x) => x.name.slice(0, 10)).join("، ") || "—"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section id="models" className="mt-8 scroll-mt-24">
            <div className="flex flex-wrap justify-between gap-3">
              <h3 className="flex items-center gap-2 text-[16px] font-extrabold">
                <Route size={18} className="text-[#ee6748]" /> مدل‌های همکاری
              </h3>
              <div className="flex gap-2">
                <a href={dataSource === "exhibition" ? "/api/exhibition?format=csv" : "/api/export?format=csv"} className="rounded-xl border bg-white px-3 py-2 text-[11px] font-bold">
                  CSV
                </a>
                <a href="/api/related" target="_blank" rel="noreferrer" className="rounded-xl bg-[#ee6748] px-3 py-2 text-[11px] font-bold text-white">
                  شبکه JSON
                </a>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cooperationModels.map((m) => (
                <article key={m.slug} className={`rounded-2xl border bg-white p-4 ${m.color}`}>
                  <div className="flex justify-between">
                    <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold ring-1">{m.tag}</span>
                    <span className="text-[10px] opacity-80">{m.leadRange}</span>
                  </div>
                  <h4 className="mt-3 text-[13px] font-bold leading-5">{m.title}</h4>
                  <p className="mt-2 text-[10px] leading-5 opacity-80">{m.desc}</p>
                  <p className="mt-2 text-[11px] font-extrabold">{m.price}</p>
                  <ul className="mt-3 space-y-1">
                    {m.includes.map((inc) => (
                      <li key={inc} className="flex gap-1.5 text-[10px]">
                        <Check size={12} /> {inc}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h4 className="text-[14px] font-extrabold">{sisterCompanies.holding} — کاتالوگ خدمات</h4>
                  <p className="mt-1 text-[11px] text-slate-500">صفحه عمومی فقط سایت و امتیاز است. سورس در پنل ادمین است.</p>
                </div>
                <div className="flex gap-2 text-[11px] font-bold">
                  <a href="/sisters" className="rounded-lg bg-[#10263d] px-3 py-1.5 text-white">کاتالوگ</a>
                  <a href="/sisters/admin" className="rounded-lg bg-[#ee6748] px-3 py-1.5 text-white">ادمین + سورس</a>
                  <a href="/oil" className="rounded-lg border px-3 py-1.5">نفت {faNumber.format(oilExhibitionMeta.companies)}</a>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {sisterCompanies.items.map((item) => (
                  <div key={item.slug} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold text-slate-400">{item.en}</p>
                    <p className="text-[12px] font-extrabold">{item.name}</p>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">{item.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {isCollectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <form onSubmit={startCollection} className="w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex justify-between">
              <h3 className="font-extrabold">جمع‌آوری + شبکه</h3>
              <button type="button" onClick={() => setIsCollectionOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-6 text-slate-500">
              {hasNeshanKey ? "جست‌وجوی زنده نشان روی مختصات انتخابی اجرا می‌شود." : "بدون کلید نشان، نتایج نمونه غرب تهران بر اساس عبارت و مختصات فیلتر می‌شود."}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {tehranPresets.slice(0, 6).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setLatitude(String(p.lat));
                    setLongitude(String(p.lng));
                    setMapCenter({ lat: p.lat, lng: p.lng });
                  }}
                  className="rounded-xl border bg-slate-50 px-2 py-2 text-[10px] font-bold"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <input value={term} onChange={(e) => setTerm(e.target.value)} className="h-10 w-full rounded-xl border px-3 text-[12px]" placeholder="دسته مثل رستوران، کلینیک، کافه" required />
              <div className="grid grid-cols-2 gap-2">
                <input value={latitude} onChange={(e) => setLatitude(e.target.value)} className="h-10 rounded-xl border px-3 text-left text-[12px]" placeholder="lat" />
                <input value={longitude} onChange={(e) => setLongitude(e.target.value)} className="h-10 rounded-xl border px-3 text-left text-[12px]" placeholder="lng" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setIsCollectionOpen(false)} className="flex-1 rounded-xl border py-2.5 text-[11px] font-bold">
                انصراف
              </button>
              <button disabled={isLoading} className="flex flex-[1.6] items-center justify-center gap-2 rounded-xl bg-[#ee6748] py-2.5 text-[11px] font-bold text-white">
                {isLoading ? <LoaderCircle className="animate-spin" size={16} /> : <RefreshCw size={15} />} شروع
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/40" onMouseDown={() => setSelected(null)}>
          <aside className="h-full w-full max-w-[580px] overflow-y-auto bg-white p-5 shadow-2xl sm:p-6" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between">
              <button type="button" onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
                <X size={18} />
              </button>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${qualityStyle(selected)}`}>{selected.websiteQuality}</span>
            </div>
            <div className="mt-5 flex gap-3">
              <span className={`grid h-[56px] w-[56px] place-items-center rounded-2xl text-[18px] font-bold ${!selected.websiteFound ? "bg-rose-100 text-rose-700" : "bg-teal-50 text-teal-700"}`}>
                {selected.name.slice(0, 1)}
              </span>
              <div>
                <h3 className="text-[18px] font-extrabold">{selected.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {selected.category} • لید {faNumber.format(selected.leadScore)}
                </p>
                <p className="text-[10px] text-slate-400">
                  {faDate.format(new Date(selected.lastChecked ?? new Date()))} • {selected.address.slice(0, 60)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="flex gap-2 text-[11px]">
                <MapPin size={14} className="mt-0.5 text-rose-500" />
                {selected.address}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {(() => {
                  const l = buildMapLinks(selected);
                  return (
                    <>
                      <a href={l.google} target="_blank" rel="noreferrer" className="rounded-lg bg-[#0f172a] px-2.5 py-2 text-center text-[10px] font-bold text-white">
                        Google خیابانی
                      </a>
                      <a href={l.neshan} target="_blank" rel="noreferrer" className="rounded-lg bg-teal-600 px-2.5 py-2 text-center text-[10px] font-bold text-white">
                        نشان nshn.ir
                      </a>
                      <a href={l.waze} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-2.5 py-2 text-center text-[10px] font-bold ring-1">
                        Waze
                      </a>
                      <a href={`https://www.google.com/maps/search/${encodeURIComponent(selected.name + " " + selected.address)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-2.5 py-2 text-center text-[10px] font-bold ring-1">
                        خیابان‌ها
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <p className="text-[10px] text-slate-400">کیفیت</p>
                <strong className="text-[20px]">{faNumber.format(selected.qualityScore)}</strong>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
                <p className="text-[10px] text-rose-700">لید + مشکل</p>
                <strong className="text-[20px] text-rose-700">{faNumber.format(selected.leadScore)}</strong>
                <p className="mt-1 text-[9px] font-bold text-rose-700">{!selected.websiteFound ? "بدون سایت - بحرانی روی نقشه" : ""}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-3">
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-violet-900">
                <Network size={14} /> شبکه مرتبط
              </h4>
              <p className="mt-1 text-[10px] text-violet-700">خط‌چین‌ها روی نقشه اتصال همسایگی را نشان می‌دهد. فاصله تا ۹۰۰م.</p>
              <div className="mt-3 max-h-[300px] space-y-2 overflow-auto">
                {related.map((r) => (
                  <div key={r.id} className="rounded-xl bg-white p-3 ring-1 ring-violet-100">
                    <div className="flex justify-between">
                      <span className="text-[11px] font-bold">{r.name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold">
                        {faNumber.format(r.distanceMeters)}م • {r.connectionType}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {r.category} • {r.websiteFound ? "سایت دارد" : "بی‌سایت"} • لید {r.leadScore}
                    </p>
                    <p className="mt-2 rounded-lg bg-violet-50 p-2 text-[10px] leading-5 text-violet-800">{r.connectionReason}</p>
                    <div className="mt-2 flex gap-1">
                      <a href={buildMapLinks(r).google} target="_blank" rel="noreferrer" className="rounded bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">
                        Google
                      </a>
                      <a href={buildMapLinks(r).neshan} target="_blank" rel="noreferrer" className="rounded bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">
                        نشان
                      </a>
                      <button type="button" onClick={() => setSelected(r)} className="mr-auto rounded bg-[#0f172a] px-2 py-1 text-[9px] font-bold text-white">
                        دیدن این مرکز
                      </button>
                    </div>
                  </div>
                ))}
                {related.length === 0 && <p className="text-[10px] text-slate-400">همسایه نزدیکی یافت نشد.</p>}
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-[12px] font-bold">لینک‌های کلیک‌شو + وضعیت</h4>
              <div className="mt-2 space-y-2">
                {[
                  ["وب‌سایت", selected.websiteFound, selected.website ? `https://${selected.website}` : null],
                  ["Google خیابانی", true, buildMapLinks(selected).google],
                  ["نشان", true, buildMapLinks(selected).neshan],
                ].map(([l, a, h]) => (
                  <div key={l as string} className="flex justify-between rounded-xl border px-3 py-2.5 text-[11px]">
                    <span>{l as string}</span>
                    <div className="flex items-center gap-2">
                      {h ? (
                        <a href={h as string} target="_blank" rel="noreferrer" className="max-w-[150px] truncate text-[10px] font-bold text-teal-700 underline">
                          {(h as string).slice(0, 30)}
                        </a>
                      ) : null}
                      <span className={`text-[10px] font-bold ${a ? "text-emerald-600" : "text-slate-400"}`}>{a ? "دارد" : "ندارد"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-3">
              <div className="flex justify-between">
                <h4 className="flex gap-2 text-[12px] font-bold text-violet-900">
                  <Sparkles size={14} /> پرامپت طراحی سایت
                </h4>
                <button type="button" onClick={copyPrompt} className="flex gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold ring-1 ring-violet-200">
                  {copiedPrompt ? <ClipboardCheck size={12} /> : <Clipboard size={12} />}
                  {copiedPrompt ? "کپی شد" : "کپی"}
                </button>
              </div>
              <pre className="mt-2 max-h-[200px] overflow-auto whitespace-pre-wrap rounded-xl bg-[#0f172a] p-3 text-[10px] leading-5 text-slate-100">{selected.websitePrompt ?? "—"}</pre>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={isAnalyzing} onClick={analyzeSelectedWebsite} className="flex items-center justify-center gap-2 rounded-xl border bg-teal-50 py-3 text-[11px] font-bold text-teal-700">
                {isAnalyzing ? <LoaderCircle className="animate-spin" size={14} /> : <RefreshCw size={14} />} تحلیل
              </button>
              <button type="button" onClick={() => setNotice(`${selected?.name} به پیگیری افزوده شد - ${related.length} همسایه مرتبط`)} className="flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] py-3 text-[11px] font-bold text-white">
                <Target size={14} /> پیگیری + شبکه
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
