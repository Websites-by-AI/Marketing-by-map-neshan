import seedNotes from "@/data/memory-notes.json";

export type MemoryNote = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
  source?: "seed" | "kv";
};

const KV_KEY = "agent-notes";

type KvLike = {
  get: (key: string, type: "json") => Promise<MemoryNote[] | null>;
  put: (key: string, value: string) => Promise<void>;
};

export function seedMemoryNotes(): MemoryNote[] {
  return (seedNotes as MemoryNote[]).map((note) => ({ ...note, source: "seed" }));
}

export async function readCloudflareKv(): Promise<KvLike | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const { env } = await mod.getCloudflareContext({ async: true });
    const kv = (env as { AGENT_MEMORY?: KvLike }).AGENT_MEMORY;
    return kv ?? null;
  } catch {
    return null;
  }
}

export async function loadMemoryNotes(): Promise<{ notes: MemoryNote[]; kvBound: boolean }> {
  const seed = seedMemoryNotes();
  const kv = await readCloudflareKv();
  if (!kv) return { notes: seed, kvBound: false };
  try {
    const extra = (await kv.get(KV_KEY, "json")) ?? [];
    const byId = new Map<string, MemoryNote>();
    for (const note of seed) byId.set(note.id, note);
    for (const note of extra) byId.set(note.id, { ...note, source: "kv" });
    return { notes: [...byId.values()], kvBound: true };
  } catch {
    return { notes: seed, kvBound: true };
  }
}

export async function appendMemoryNote(input: { title: string; body: string; tags?: string[] }) {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) {
    return { ok: false as const, error: "title and body are required" };
  }
  const note: MemoryNote = {
    id: `note-${Date.now().toString(36)}`,
    title,
    body,
    tags: input.tags?.filter(Boolean) ?? ["inbox"],
    updatedAt: new Date().toISOString().slice(0, 10),
    source: "kv",
  };
  const kv = await readCloudflareKv();
  if (!kv) {
    return {
      ok: true as const,
      persisted: false,
      note,
      hint: "KV وصل نیست. این یادداشت فقط در پاسخ همین درخواست است. برای ماندگاری در memory/*.md بگذارید یا KV را bind کنید.",
    };
  }
  const existing = (await kv.get(KV_KEY, "json")) ?? [];
  existing.push(note);
  await kv.put(KV_KEY, JSON.stringify(existing));
  return { ok: true as const, persisted: true, note };
}

export const memoryGuide = {
  needsObsidian: false,
  installRequired: false,
  lowMemory: true,
  free: true,
  giveThisToTheAgent: "https://neshan-m.exhibition2world.ir/api/memory",
  localVault: "memory/",
  whyNotObsidian:
    "Obsidian برنامه دسکتاپ است و API ندارد. ایجنت نمی‌تواند Obsidian نصب‌شده روی لپ‌تاپ شما را بخواند. همین API رایگان و چند فایل مارک‌داون کم‌حجم کافی است. اگر بعداً Obsidian خواستید پوشه memory/ را به‌عنوان ولت باز کنید — نصب اجباری نیست.",
};
