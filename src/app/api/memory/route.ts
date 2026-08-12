import { appendMemoryNote, loadMemoryNotes, memoryGuide } from "@/lib/memory";

export const dynamic = "force-dynamic";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();
  const { notes, kvBound } = await loadMemoryNotes();
  const selected = id ? notes.filter((note) => note.id === id) : notes;
  return Response.json(
    {
      ok: true,
      ...memoryGuide,
      kvBound,
      count: selected.length,
      notes: selected,
    },
    { headers: cors },
  );
}

export async function POST(request: Request) {
  let payload: { title?: string; body?: string; tags?: string[] } = {};
  try {
    payload = (await request.json()) as { title?: string; body?: string; tags?: string[] };
  } catch {
    return Response.json({ ok: false, error: "JSON body required" }, { status: 400, headers: cors });
  }
  const result = await appendMemoryNote({
    title: payload.title ?? "",
    body: payload.body ?? "",
    tags: payload.tags,
  });
  return Response.json(result, { status: result.ok ? 200 : 400, headers: cors });
}
