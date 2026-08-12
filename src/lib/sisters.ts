import sisters from "@/data/sister-companies.json";

export type StartupRecord = (typeof sisters.items)[number]["startups"][number];
export type SisterField = (typeof sisters.items)[number];

export const stageLabel: Record<string, string> = {
  ready: "آماده استفاده",
  almost: "نزدیک به آماده",
  beta: "بتا / دمو",
  prototype: "نمونه اولیه",
  idea: "ایده / نیاز به ساخت",
};

export function stageClass(stageId: string) {
  if (stageId === "ready") return "bg-emerald-50 text-emerald-800";
  if (stageId === "almost") return "bg-teal-50 text-teal-800";
  if (stageId === "beta") return "bg-sky-50 text-sky-800";
  if (stageId === "prototype") return "bg-amber-50 text-amber-800";
  return "bg-rose-50 text-rose-800";
}

export function scoreBar(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-teal-500";
  if (score >= 50) return "bg-sky-500";
  if (score >= 30) return "bg-amber-500";
  return "bg-rose-500";
}

export function hostOf(url: string | null | undefined) {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function allStartups() {
  return sisters.items.flatMap((field) =>
    field.startups.map((startup) => ({ ...startup, field })),
  );
}

export function sistersStats() {
  const rows = allStartups();
  const ready = rows.filter((row) => row.score >= 70).length;
  const live = rows.filter((row) => row.website && row.status === "live").length;
  const avg = Math.round(rows.reduce((sum, row) => sum + row.score, 0) / Math.max(1, rows.length));
  return {
    fields: sisters.items.length,
    startups: rows.length,
    ready,
    live,
    avg,
  };
}
