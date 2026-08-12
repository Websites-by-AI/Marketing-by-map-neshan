#!/usr/bin/env python3
"""Build Returning/New/Dropped from official ICC 25 + local 26 JSON."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def norm(name: str) -> tuple[str, str]:
    compact = re.sub(r"\s+", " ", name.replace("ي", "ی").replace("ك", "ک").replace("‌", " ")).strip()
    loose = re.sub(
        r"\b(شرکت|گروه|صنایع|تولیدی|صنعتی|بازرگانی|تعاونی|مجتمع|هلدینگ)\b",
        " ",
        compact,
    )
    loose = re.sub(r"\s+", " ", loose).strip()
    return compact, loose


def main() -> None:
    names25 = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    if isinstance(names25, dict):
        names25 = names25.get("names") or names25.get("uniqueNames") or []
    data26 = json.loads((ROOT / "src/data/iranconfair-26.json").read_text(encoding="utf-8"))
    names26 = [row["name"] for row in data26["companies"]]

    map25_exact = {}
    map25_loose = {}
    for name in names25:
        exact, loose = norm(name)
        map25_exact[exact] = name
        if loose and loose not in map25_loose:
            map25_loose[loose] = name

    returning = []
    new_in_26 = []
    matched25 = set()
    for name in names26:
        exact, loose = norm(name)
        hit = map25_exact.get(exact) or (map25_loose.get(loose) if loose and len(loose) > 3 else None)
        if hit:
            returning.append(name)
            matched25.add(norm(hit)[0])
        else:
            new_in_26.append(name)

    dropped = []
    for name in names25:
        exact, _ = norm(name)
        if exact not in matched25 and name:
            dropped.append(name)

    payload = {
        "source25": "https://iccexpo.com/fa/iranconfair/25/visitors/participants",
        "source26": "https://iccexpo.com/fa/iranconfair/26/visitors/participants",
        "scrapedAt": "2026-08-12",
        "dates25": "۲۷ تا ۳۰ مرداد ۱۴۰۴",
        "event25": "بیست و پنجمین نمایشگاه بین‌المللی صنعت ساختمان",
        "count25": len(set(names25)),
        "count26": len(names26),
        "returning": returning,
        "newIn26": new_in_26,
        "droppedAfter25": dropped,
        "matchNote": "تطبیق نام رسمی iccexpo ۲۵∩۲۶. ابتدا exact، بعد loose بدون پیشوند شرکت/گروه. آرشیو Dowintech جدا است.",
        "dowintechPhoneConfirmed": ["آبنوس جام کرج", "آکپا ایران کیش"],
    }
    out = ROOT / "src/data/iranconfair-cohort.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"25={payload['count25']} 26={payload['count26']} "
        f"returning={len(returning)} new={len(new_in_26)} dropped={len(dropped)}"
    )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("usage: build_cohort.py names25.json")
    main()
