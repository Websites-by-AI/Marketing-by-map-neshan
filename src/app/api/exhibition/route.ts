import { exhibitionBusinesses, exhibitionMeta } from "@/lib/exhibition";
import { buildMapLinks } from "@/lib/business-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const query = searchParams.get("q")?.trim().toLowerCase();
  const items = exhibitionBusinesses.filter((row) => {
    if (!query) return true;
    return `${row.name} ${row.category} ${row.address}`.toLowerCase().includes(query);
  });

  if (format === "csv") {
    const header = ["نام", "دسته", "فعالیت_نمایشگاه", "آدرس_غرفه", "lat", "lng", "وبسایت", "امتیاز_لید"];
    const lines = [header.map((value) => `"${value}"`).join(",")];
    for (const item of items) {
      const links = buildMapLinks(item);
      lines.push(
        [
          item.name,
          item.category,
          item.address,
          item.address,
          String(item.latitude ?? ""),
          String(item.longitude ?? ""),
          item.website ?? "",
          String(item.leadScore),
        ]
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      );
      void links;
    }
    return new Response("\uFEFF" + lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="iranconfair-26.csv"',
      },
    });
  }

  return Response.json({
    ...exhibitionMeta,
    count: items.length,
    items: items.map((item) => ({ ...item, mapLinks: buildMapLinks(item) })),
  });
}
