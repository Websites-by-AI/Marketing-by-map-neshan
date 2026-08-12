#!/usr/bin/env python3
"""Parse ICCEXPO markdown dumps into a clean exhibitor dataset."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
OUT_DIR = ROOT / "data"

HALL_COORDS = {
    "سالن ۸ و ۹": (35.7918, 51.4068),
    "سالن 8 و 9": (35.7918, 51.4068),
    "سالن ۲۷": (35.7909, 51.4076),
    "سالن 27": (35.7909, 51.4076),
    "سالن ۳۸B": (35.7902, 51.4088),
    "سالن 38B": (35.7902, 51.4088),
    "سالن ۴۱ همکف": (35.7896, 51.4094),
    "سالن 41 همکف": (35.7896, 51.4094),
    "سالن ۴۱ بالا": (35.7894, 51.4097),
    "سالن 41 بالا": (35.7894, 51.4097),
    "سالن ۴۴B": (35.7888, 51.4102),
    "سالن 44B": (35.7888, 51.4102),
    "سالن ۴۰ همکف": (35.7912, 51.4091),
    "سالن 40 همکف": (35.7912, 51.4091),
    "سالن ۴۰ بالا": (35.7910, 51.4094),
    "سالن 40 بالا": (35.7910, 51.4094),
    "سالن ۵": (35.7924, 51.4072),
    "سالن 5": (35.7924, 51.4072),
    "سالن ۶": (35.7921, 51.4078),
    "سالن 6": (35.7921, 51.4078),
    "سالن ۷": (35.7917, 51.4083),
    "سالن 7": (35.7917, 51.4083),
    "سالن ۴۴A": (35.7886, 51.4098),
    "سالن 44A": (35.7886, 51.4098),
    "سالن ۳۱A": (35.7906, 51.4106),
    "سالن 31A": (35.7906, 51.4106),
    "سالن ۳۱B": (35.7903, 51.4110),
    "سالن 31B": (35.7903, 51.4110),
    "سالن ۳۸": (35.7900, 51.4084),
    "سالن 38": (35.7900, 51.4084),
    "سالن ۳۸A": (35.7898, 51.4081),
    "سالن 38A": (35.7898, 51.4081),
    "سالن ۳۵": (35.7892, 51.4074),
    "سالن 35": (35.7892, 51.4074),
    "فضای باز ۵": (35.7928, 51.4062),
    "فضای باز 5": (35.7928, 51.4062),
    "فضای باز ۷": (35.7926, 51.4066),
    "فضای باز 7": (35.7926, 51.4066),
    "فضای باز ۲۷": (35.7915, 51.4060),
    "فضای باز 27": (35.7915, 51.4060),
    "فضای باز ۸ و ۹": (35.7920, 51.4058),
    "فضای باز 8 و 9": (35.7920, 51.4058),
    "فضای باز ۳۱": (35.7908, 51.4116),
    "فضای باز 31": (35.7908, 51.4116),
    "فضای باز ۳۵": (35.7890, 51.4068),
    "فضای باز 35": (35.7890, 51.4068),
    "فضای باز ۳۸": (35.7896, 51.4070),
    "فضای باز 38": (35.7896, 51.4070),
    "فضای باز ۴۴": (35.7882, 51.4106),
    "فضای باز 44": (35.7882, 51.4106),
    "فضای باز ۴۰": (35.7914, 51.4100),
    "فضای باز 40": (35.7914, 51.4100),
    "فضای باز ۴۱": (35.7892, 51.4108),
    "فضای باز 41": (35.7892, 51.4108),
}

CATEGORY_RULES = [
    (r"شیرآلات|شیرالات|سیفون|دوش|فلاش", "شیرآلات و بهداشتی"),
    (r"لوله|اتصالات|پلیکا|پلیمر|پوش.?فیت", "لوله و اتصالات"),
    (r"کابل|سیم |کلید|پریز|برق|روشنایی|چراغ", "برق و روشنایی"),
    (r"هوشمند|خانه هوشمند|اتوماسیون|اعلام حریق|دوربین", "هوشمندسازی"),
    (r"درب|پنجره|یو پی وی سی|آلومینیوم|پروفیل|شیشه", "درب و پنجره"),
    (r"کاشی|سرامیک|چینی بهداشتی|روشویی|کابین", "کاشی و چینی بهداشتی"),
    (r"عایق|چسب|نانو|رنگ |پوشش|میکروسمنت|آب.?بند", "عایق و شیمی ساختمان"),
    (r"بتن|بلوک|سیمان|والپست|میلگرد بستر|قالب", "بتن و مصالح سازه"),
    (r"فولاد|آهن|میلگرد|ساندویچ|پانل|سازه فلزی", "فولاد و سازه"),
    (r"آسانسور|بالابر|پله برقی", "آسانسور و بالابر"),
    (r"تهویه|چیلر|پکیج|دیگ|گرمایش|سرمایش", "تاسیسات مکانیکی"),
    (r"سنگ |گرانیت|تراورتن|واش بتن", "سنگ و نما"),
    (r"کابینت|آشپزخانه|هود|سینک|گاز", "آشپزخانه"),
    (r"یراق|دستگیره|قفل", "یراق‌آلات"),
    (r"بانک|صندوق|مالی", "خدمات مالی"),
    (r"انجمن|اتاق تعاون|سندیکا|اتحادیه", "تشکل صنفی"),
]


def categorize(activity: str) -> str:
    for pattern, label in CATEGORY_RULES:
        if re.search(pattern, activity):
            return label
    return "سایر صنعت ساختمان"


def lead_score(name: str, activity: str) -> int:
    score = 78
    if any(k in activity for k in ("تولید", "تولیدکننده", "تولید کننده")):
        score += 6
    if any(k in activity for k in ("دانش بنیان", "دانش‌بنیان")):
        score += 4
    if any(k in name for k in ("بانک", "انجمن", "اتاق", "سندیکا", "صندوق")):
        score -= 20
    return max(35, min(96, score))


def parse_text(text: str) -> list[dict]:
    text = text.replace("\\-", "-")
    pattern = re.compile(
        r"نام شرکت کننده:\s*(.*?)\s*زمینه فعالیت:\s*(.*?)\s*محل غرفه:\s*(.*?)(?=\nنام شرکت کننده:|\Z)",
        re.S,
    )
    rows = []
    for match in pattern.finditer(text):
        name = re.sub(r"\s+", " ", match.group(1)).strip(" -\n")
        activity = re.sub(r"\s+", " ", match.group(2)).strip(" -\n")
        place = re.sub(r"\s+", " ", match.group(3)).strip(" -\n")
        if not name:
            continue
        hall = place
        booth = ""
        if "غرفه شماره:" in place:
            hall, booth = [part.strip(" ،,") for part in place.split("غرفه شماره:", 1)]
        hall = hall.replace("محل غرفه:", "").strip(" ،,")
        rows.append(
            {
                "name": name,
                "activity": activity,
                "hall": hall,
                "booth": booth,
                "place": place,
            }
        )
    return rows


def merge(rows: list[dict]) -> list[dict]:
    merged: dict[str, dict] = {}
    for row in rows:
        key = row["name"]
        if key not in merged:
            lat, lng = HALL_COORDS.get(row["hall"], (35.7905, 51.4085))
            offset = (len(merged) % 17) * 0.00004
            merged[key] = {
                "name": row["name"],
                "activity": row["activity"],
                "category": categorize(row["activity"]),
                "halls": [row["hall"]],
                "booths": [row["booth"]] if row["booth"] else [],
                "latitude": round(lat + offset, 6),
                "longitude": round(lng + ((len(merged) % 9) - 4) * 0.00005, 6),
                "leadScore": lead_score(row["name"], row["activity"]),
            }
        else:
            if row["hall"] and row["hall"] not in merged[key]["halls"]:
                merged[key]["halls"].append(row["hall"])
            if row["booth"] and row["booth"] not in merged[key]["booths"]:
                merged[key]["booths"].append(row["booth"])
            if len(row["activity"]) > len(merged[key]["activity"]):
                merged[key]["activity"] = row["activity"]
                merged[key]["category"] = categorize(row["activity"])
    return sorted(merged.values(), key=lambda item: (item["category"], item["name"]))


def main() -> None:
    texts = []
    for path in sorted(RAW_DIR.glob("icc26-*.md")):
        texts.append(path.read_text(encoding="utf-8"))
    rows = parse_text("\n".join(texts))
    companies = merge(rows)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "iranconfair-26.json").write_text(
        json.dumps(
            {
                "event": "بیست و ششمین نمایشگاه بین‌المللی صنعت ساختمان",
                "alias": "IRAN CONFAIR 2026",
                "dates": "۱۸ تا ۲۱ اوت ۲۰۲۶ / ۲۷ تا ۳۰ مرداد ۱۴۰۵",
                "venue": "محل دائمی نمایشگاه‌های بین‌المللی تهران",
                "source": "https://iccexpo.com/fa/iranconfair/26/visitors/participants",
                "scrapedAt": "2026-08-12",
                "count": len(companies),
                "companies": companies,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    csv_lines = ["name,category,activity,halls,booths,latitude,longitude,leadScore"]
    for item in companies:
        def esc(value: str) -> str:
            return '"' + value.replace('"', '""') + '"'

        csv_lines.append(
            ",".join(
                [
                    esc(item["name"]),
                    esc(item["category"]),
                    esc(item["activity"]),
                    esc(" | ".join(item["halls"])),
                    esc(" | ".join(item["booths"])),
                    str(item["latitude"]),
                    str(item["longitude"]),
                    str(item["leadScore"]),
                ]
            )
        )
    (OUT_DIR / "iranconfair-26.csv").write_text("\ufeff" + "\n".join(csv_lines), encoding="utf-8")
    print(f"parsed raw rows={len(rows)} unique companies={len(companies)}")


if __name__ == "__main__":
    main()
