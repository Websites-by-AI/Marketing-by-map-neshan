import { parseIccParticipants, uniqueIccNames } from "@/lib/icc-parse";

export const dynamic = "force-dynamic";

const SOURCES: Record<string, string> = {
  "25": "https://iccexpo.com/fa/iranconfair/25/visitors/participants",
  "26": "https://iccexpo.com/fa/iranconfair/26/visitors/participants",
};

export async function GET(request: Request) {
  const edition = new URL(request.url).searchParams.get("edition") ?? "25";
  const source = SOURCES[edition];
  if (!source) {
    return Response.json({ ok: false, error: "edition must be 25 or 26" }, { status: 400 });
  }

  try {
    const res = await fetch(source, {
      cache: "no-store",
      headers: {
        "User-Agent": "NeshanM-exhibition-connector/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    let html = await res.text();
    let via = "direct";
    let rows = parseIccParticipants(html);
    if (rows.length < 10) {
      const reader = await fetch(`https://r.jina.ai/${source}`, {
        cache: "no-store",
        headers: { "User-Agent": "NeshanM-exhibition-connector/1.0", Accept: "text/plain" },
      });
      if (reader.ok) {
        const markdown = await reader.text();
        const parsed = parseIccParticipants(markdown);
        if (parsed.length > rows.length) {
          html = markdown;
          rows = parsed;
          via = "jina-reader";
        }
      }
    }
    const names = uniqueIccNames(rows);
    return Response.json({
      ok: res.ok,
      status: res.status,
      edition,
      source,
      via,
      htmlBytes: html.length,
      preview: html.slice(0, 400),
      rawRows: rows.length,
      uniqueNames: names.length,
      names,
      sample: rows.slice(0, 5),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        edition,
        source,
        error: error instanceof Error ? error.message : "fetch failed",
      },
      { status: 502 },
    );
  }
}
