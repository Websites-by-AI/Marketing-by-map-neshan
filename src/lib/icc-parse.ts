export type IccRawCompany = {
  name: string;
  activity: string;
  hall: string;
  booth: string;
  place: string;
};

const RECORD =
  /نام شرکت کننده:\s*([\s\S]*?)\s*زمینه فعالیت:\s*([\s\S]*?)\s*محل غرفه:\s*([\s\S]*?)(?=\nنام شرکت کننده:|$)/g;

export function decodeHtml(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

export function parseIccParticipants(raw: string): IccRawCompany[] {
  const text = decodeHtml(raw).replace(/\\-/g, "-");
  const rows: IccRawCompany[] = [];
  for (const match of text.matchAll(RECORD)) {
    const name = match[1].replace(/\s+/g, " ").trim().replace(/^[-–]+|[-–]+$/g, "");
    const activity = match[2].replace(/\s+/g, " ").trim();
    const place = match[3].replace(/\s+/g, " ").trim();
    if (!name) continue;
    let hall = place;
    let booth = "";
    if (place.includes("غرفه شماره:")) {
      const [left, right] = place.split("غرفه شماره:");
      hall = left.replace("محل غرفه:", "").trim().replace(/[،,]+$/g, "");
      booth = (right ?? "").trim().replace(/[،,]+$/g, "");
    }
    rows.push({ name, activity, hall, booth, place });
  }
  return rows;
}

export function uniqueIccNames(rows: IccRawCompany[]) {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of rows) {
    if (seen.has(row.name)) continue;
    seen.add(row.name);
    names.push(row.name);
  }
  return names;
}

export function normalizeIccName(name: string) {
  const arabic = name.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ");
  const compact = arabic.replace(/\s+/g, " ").trim();
  const loose = compact
    .replace(/\b(شرکت|گروه|صنایع|تولیدی|صنعتی|بازرگانی|تعاونی|مجتمع|هلدینگ)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { exact: compact, loose };
}
