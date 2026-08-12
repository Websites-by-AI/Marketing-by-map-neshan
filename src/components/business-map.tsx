"use client";

import type { BusinessRecord } from "@/lib/business-data";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

type Props = {
  businesses: BusinessRecord[];
  onSelectBusiness?: (business: BusinessRecord) => void;
  center?: { lat: number; lng: number };
  className?: string;
  highlightedId?: number | null;
  relatedIds?: number[];
  showConnections?: boolean;
};

type TileKey = "neshan-like" | "google-like" | "satellite";

const tiles: Record<TileKey, { url: string; attribution: string; label: string; sub: string }> = {
  "neshan-like": {
    label: "خیابانی",
    sub: "سبک نشان‌مانند",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© OSM © CARTO",
  },
  "google-like": {
    label: "روشن",
    sub: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
  },
  satellite: {
    label: "ماهواره",
    sub: "دید هوایی",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
  },
};

export default function BusinessMap({
  businesses,
  onSelectBusiness,
  center,
  className,
  highlightedId,
  relatedIds = [],
  showConnections = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const linesRef = useRef<any[]>([]);
  const lastFitKey = useRef("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [activeTile, setActiveTile] = useState<TileKey>("neshan-like");
  const [showDual, setShowDual] = useState(false);

  const currentCenter = center ?? { lat: 35.785, lng: 51.385 };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled) return;
      setLeaflet(L);
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !leaflet || !containerRef.current || mapRef.current) return;
    const L = leaflet;
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView(
      [currentCenter.lat, currentCenter.lng],
      14,
    );
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: "" }).addTo(map);
    tileLayerRef.current = L.tileLayer(tiles[activeTile].url, {
      attribution: tiles[activeTile].attribution,
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, leaflet]);

  useEffect(() => {
    if (!mapRef.current || !leaflet || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(tiles[activeTile].url);
  }, [activeTile, leaflet]);

  useEffect(() => {
    if (!isLoaded || !leaflet || !mapRef.current) return;
    const L = leaflet;
    const map = mapRef.current;

    markersRef.current.forEach((m) => map.removeLayer(m));
    linesRef.current.forEach((l) => map.removeLayer(l));
    markersRef.current = [];
    linesRef.current = [];

    const highlighted = businesses.find((b) => b.id === highlightedId) ?? null;

    const iconFor = (record: BusinessRecord) => {
      const isHighlighted = highlightedId === record.id;
      const isRelated = relatedIds.includes(record.id);
      const isNoSite = !record.websiteFound;
      const isHigh = record.leadScore >= 85;
      const color = isHighlighted ? "#0f172a" : isNoSite ? "#ef4444" : isHigh ? "#ee6748" : isRelated ? "#7c3aed" : "#0f766e";
      const size = isHighlighted ? 44 : isRelated ? 38 : 34;
      const ring = isHighlighted
        ? "box-shadow:0 0 0 6px rgba(15,23,42,.18),0 10px 26px rgba(0,0,0,.30);"
        : isRelated
          ? "box-shadow:0 0 0 4px rgba(124,58,237,.18),0 8px 18px rgba(0,0,0,.22);"
          : isNoSite || isHigh
            ? "box-shadow:0 0 0 4px rgba(239,68,68,.14),0 8px 20px rgba(0,0,0,.20);"
            : "box-shadow:0 6px 14px rgba(0,0,0,.16);";
      const pulse = isNoSite && !isHighlighted ? "animation:mapPulse 1.6s infinite;" : "";
      const badge = isHighlighted ? "★ انتخاب" : isRelated ? "مرتبط" : isNoSite ? "بحرانی" : isHigh ? "اولویت" : "";
      return L.divIcon({
        className: "",
        html: `<div style="position:relative; width:${size}px; height:${size + (badge ? 18 : 0)}px">
          <div style="background:${color}; width:${size}px; height:${size}px; border-radius:12px; display:grid; place-items:center; color:white; font-weight:900; font-size:${size > 36 ? 15 : 13}px; border:3px solid white; ${ring} ${pulse}">${record.name
            .slice(0, 1)
            .toUpperCase()}</div>
          ${
            badge
              ? `<div style="position:absolute; top:${size + 2}px; left:50%; transform:translateX(-50%); background:${isHighlighted ? "#0f172a" : isRelated ? "#7c3aed" : "#111"}; color:white; font-size:9px; font-weight:800; padding:2px 7px; border-radius:999px; white-space:nowrap; box-shadow:0 4px 10px rgba(0,0,0,.25);">${badge}</div>`
              : ""
          }
        </div>`,
        iconSize: [size, size + (badge ? 18 : 0)],
        iconAnchor: [size / 2, size / 2],
      });
    };

    const bounds: [number, number][] = [];

    businesses
      .filter((b) => b.latitude && b.longitude)
      .forEach((b) => {
        const lat = b.latitude!;
        const lng = b.longitude!;
        bounds.push([lat, lng]);
        const marker = L.marker([lat, lng], {
          icon: iconFor(b),
          zIndexOffset: highlightedId === b.id ? 1000 : relatedIds.includes(b.id) ? 800 : 0,
        }).addTo(map);
        const googleLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        const neshanLink = `https://nshn.ir/${lat},${lng}`;
        const gSearch = `https://www.google.com/maps/search/${encodeURIComponent(b.name + " " + b.address)}`;
        marker.bindPopup(
          `<div dir="rtl" style="font-family:inherit; min-width:240px; text-align:right">
            <div style="display:flex; gap:8px; align-items:center"><div style="width:36px;height:36px;border-radius:10px;background:${!b.websiteFound ? "#fef2f2" : b.id === highlightedId ? "#0f172a" : "#e6f5f3"};display:grid;place-items:center;color:${!b.websiteFound ? "#dc2626" : b.id === highlightedId ? "white" : "#0f766e"};font-weight:900">${b.name.slice(
              0,
              1,
            )}</div><div><strong style="font-size:13px;color:#0f172a">${b.name}</strong><br/><span style="font-size:10px;color:#64748b">${b.category} • ${b.websiteQuality} • لید ${b.leadScore}${relatedIds.includes(b.id) ? " • مرتبط" : ""}</span></div></div>
            <div style="margin-top:8px; font-size:11px; color:#334155; background:#f8fafc; padding:6px 8px; border-radius:8px; line-height:1.5">${b.address}</div>
            <div style="margin-top:8px; display:flex; gap:5px; flex-wrap:wrap"><a href="${googleLink}" target="_blank" style="font-size:10px; background:#1e293b; color:white; padding:5px 8px; border-radius:7px; text-decoration:none; font-weight:800">Google خیابانی</a><a href="${neshanLink}" target="_blank" style="font-size:10px; background:#0f766e; color:white; padding:5px 8px; border-radius:7px; text-decoration:none; font-weight:800">نشان</a><a href="${gSearch}" target="_blank" style="font-size:10px; background:#eef2ff; color:#4338ca; padding:5px 8px; border-radius:7px; text-decoration:none; font-weight:800">خیابان‌ها</a></div>
            <button id="sel-${b.id}" style="margin-top:8px; width:100%; background:${b.id === highlightedId ? "#7c3aed" : "#132b45"}; color:white; border:none; padding:8px; border-radius:9px; font-size:11px; font-weight:900; cursor:pointer">${
              b.id === highlightedId ? "مرکز شبکه - دیدن همسایگان" : "دیدن ارتباطات + پرامپت"
            }</button>
          </div>`,
        );
        marker.on("popupopen", () => {
          setTimeout(() => {
            const btn = document.getElementById(`sel-${b.id}`);
            if (btn) btn.onclick = () => onSelectBusiness?.(b);
          }, 60);
        });
        markersRef.current.push(marker);
      });

    if (showConnections && highlighted && relatedIds.length) {
      const from = [highlighted.latitude!, highlighted.longitude!] as [number, number];
      businesses
        .filter((b) => relatedIds.includes(b.id) && b.latitude && b.longitude)
        .forEach((toBiz) => {
          const to: [number, number] = [toBiz.latitude!, toBiz.longitude!];
          const line = L.polyline([from, to], {
            color: !toBiz.websiteFound ? "#ef4444" : "#7c3aed",
            weight: 2,
            opacity: 0.65,
            dashArray: !toBiz.websiteFound ? "8 6" : "4 8",
          }).addTo(map);
          linesRef.current.push(line);
        });
    }

    const fitKey = `${businesses.map((b) => b.id).join(",")}|${center?.lat ?? ""}|${center?.lng ?? ""}`;
    if (center) {
      if (lastFitKey.current !== fitKey) {
        map.setView([center.lat, center.lng], 15);
        lastFitKey.current = fitKey;
      }
    } else if (lastFitKey.current !== fitKey) {
      if (bounds.length > 1) map.fitBounds(bounds as any, { padding: [28, 28], maxZoom: 16 });
      else if (bounds.length === 1) map.setView(bounds[0] as any, 16);
      lastFitKey.current = fitKey;
    }
  }, [isLoaded, leaflet, businesses, center, onSelectBusiness, highlightedId, relatedIds, showConnections]);

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setView([center.lat, center.lng], 15);
  }, [center]);

  const googleEmbed = `https://maps.google.com/maps?q=${currentCenter.lat},${currentCenter.lng}&z=16&output=embed`;
  const neshanEmbed = `https://www.neshan.org/maps/@${currentCenter.lat},${currentCenter.lng},16z`;

  return (
    <div className={className ?? "relative w-full"}>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        {(Object.keys(tiles) as TileKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveTile(k)}
            className={`rounded-xl border px-3 py-2 text-right transition ${activeTile === k ? "border-[#ee6748] bg-[#fff0eb] text-[#9a2e14]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <div className="text-[11px] font-extrabold">{tiles[k].label}</div>
            <div className="mt-0.5 text-[9px] opacity-70">{tiles[k].sub}</div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowDual(!showDual)}
          className="mr-auto rounded-xl bg-[#0f172a] px-3 py-2 text-[10px] font-bold text-white hover:bg-black"
        >
          {showDual ? "پنهان‌سازی Google/Neshan" : "نمایش همزمان Google + نشان"}
        </button>
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner sm:h-[520px]">
        <div ref={containerRef} className="z-10 h-full w-full" />
        {!isLoaded && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-slate-50 text-[11px] font-bold text-slate-500">
            در حال بارگذاری نقشه ارتباطی...
          </div>
        )}
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex flex-wrap gap-1">
          <span className="rounded-lg bg-black/80 px-2 py-1 text-[9px] font-bold text-white shadow">⚫ انتخاب = مرکز شبکه</span>
          <span className="rounded-lg bg-violet-600/90 px-2 py-1 text-[9px] font-bold text-white shadow">🟣 مرتبط هم‌خیابان</span>
          <span className="rounded-lg bg-white/95 px-2 py-1 text-[9px] font-bold text-slate-700 shadow">🔴 بحرانی - بدون سایت</span>
        </div>
      </div>

      {showDual && (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
              <span className="text-[11px] font-extrabold text-slate-700">Google Maps</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${currentCenter.lat},${currentCenter.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                کامل ↗
              </a>
            </div>
            <div className="relative h-[260px] bg-slate-100">
              <iframe title="Google Maps" src={googleEmbed} className="h-full w-full border-0" loading="lazy" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between bg-[#e6f5f2] px-3 py-2">
              <span className="text-[11px] font-extrabold text-[#0f766e]">نشان</span>
              <a
                href={`https://nshn.ir/${currentCenter.lat},${currentCenter.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-teal-700 hover:underline"
              >
                nshn.ir ↗
              </a>
            </div>
            <div className="relative h-[260px] bg-[#edf4f3]">
              <iframe title="Neshan Maps" src={neshanEmbed} className="h-full w-full border-0" loading="lazy" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
