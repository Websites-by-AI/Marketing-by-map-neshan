import { readCloudflareKv } from "@/lib/memory";

export type CollectionRunRecord = {
  id: string;
  term: string;
  latitude: number;
  longitude: number;
  status: "demo" | "completed" | "failed" | "running";
  count: number;
  source: string;
  error?: string;
  createdAt: string;
};

const RUNS_KEY = "collection-runs";

export async function listCollectionRuns(): Promise<{ kvBound: boolean; runs: CollectionRunRecord[] }> {
  const kv = await readCloudflareKv();
  if (!kv) return { kvBound: false, runs: [] };
  try {
    const runs = ((await kv.get(RUNS_KEY, "json")) as CollectionRunRecord[] | null) ?? [];
    return { kvBound: true, runs };
  } catch {
    return { kvBound: true, runs: [] };
  }
}

export async function appendCollectionRun(
  input: Omit<CollectionRunRecord, "id" | "createdAt"> & { id?: string },
) {
  const run: CollectionRunRecord = {
    id: input.id ?? `run-${Date.now().toString(36)}`,
    term: input.term,
    latitude: input.latitude,
    longitude: input.longitude,
    status: input.status,
    count: input.count,
    source: input.source,
    error: input.error,
    createdAt: new Date().toISOString(),
  };
  const kv = await readCloudflareKv();
  if (!kv) return { persisted: false as const, run };
  const existing = ((await kv.get(RUNS_KEY, "json")) as CollectionRunRecord[] | null) ?? [];
  existing.unshift(run);
  await kv.put(RUNS_KEY, JSON.stringify(existing.slice(0, 80)));
  return { persisted: true as const, run };
}
