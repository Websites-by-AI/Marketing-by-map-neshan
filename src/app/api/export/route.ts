import { db } from "@/db";
import { businesses } from "@/db/schema";
import { buildMapLinks, demoBusinesses, findRelatedCompanies, toBusinessRecord, type BusinessRecord } from "@/lib/business-data";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function escapeCsv(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function loadRecords(): Promise<BusinessRecord[]> {
  if (db) {
    try {
      const rows = await db.select().from(businesses).orderBy(desc(businesses.leadScore), desc(businesses.updatedAt)).limit(1000);
      if (rows.length) return rows.map(toBusinessRecord);
    } catch {
      // demo fallback
    }
  }
  return demoBusinesses;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const records = await loadRecords();

  if (format === "csv") {
    const header = [
      "id",
      "نام",
      "دسته",
      "آدرس",
      "شهر",
      "lat",
      "lng",
      "تلفن",
      "وبسایت",
      "وضعیت",
      "امتیاز_کیفیت",
      "امتیاز_لید",
      "لینک_گوگل_مپ",
      "لینک_نشان",
      "لینک_ویز",
      "همسایگان_مرتبط",
      "پرامپت_طراحی_سایت",
    ];

    const lines = [header.map(escapeCsv).join(",")];

    for (const record of records) {
      const links = buildMapLinks(record);
      const related = findRelatedCompanies(record, records, 900, 4)
        .map((item) => `${item.name} (${item.distanceMeters}م)`)
        .join(" | ");
      lines.push(
        [
          String(record.id),
          record.name,
          record.category,
          record.address,
          record.city,
          String(record.latitude ?? ""),
          String(record.longitude ?? ""),
          record.phone ?? "",
          record.website ?? "",
          record.websiteQuality,
          String(record.qualityScore),
          String(record.leadScore),
          links.google,
          links.neshan,
          links.waze,
          related,
          (record.websitePrompt ?? "").slice(0, 8000).replace(/\n/g, " "),
        ]
          .map(escapeCsv)
          .join(","),
      );
    }

    const csv = "\uFEFF" + lines.join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="businesses-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const enriched = records.map((record) => ({
    ...record,
    mapLinks: buildMapLinks(record),
    related: findRelatedCompanies(record, records, 900, 4).map((item) => ({
      id: item.id,
      name: item.name,
      distanceMeters: item.distanceMeters,
      reason: item.connectionReason,
      type: item.connectionType,
    })),
  }));

  return Response.json(
    {
      generatedAt: new Date().toISOString(),
      count: enriched.length,
      notice: "خروجی شامل لینک‌های قابل کلیک گوگل مپ، نشان، ویز، شبکه همسایگی و پرامپت طراحی سایت است.",
      areas: {
        density: "بررسی تراکم در سعادت‌آباد، حوالی پل مدیریت و چهارراه سرو با کلاستر نقشه",
        hotspots: ["سعادت‌آباد مرکز", "میدان کاج", "پل مدیریت", "شهرک غرب دادمان", "مرزداران پل یادگار"],
      },
      items: enriched,
    },
    {
      headers: {
        "Content-Disposition": `attachment; filename="businesses-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    },
  );
}
