#!/usr/bin/env python3
"""Parse icc25 markdown dumps in data/raw/icc25-*.md into names + cohort."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"


def main() -> None:
    texts = []
    for path in sorted(RAW.glob("icc25-*.md")):
        texts.append(path.read_text(encoding="utf-8"))
    blob = "\n".join(texts)
    names = []
    seen = set()
    for match in re.finditer(r"نام شرکت کننده:\s*(.*)", blob):
        name = re.sub(r"\s+", " ", match.group(1)).strip()
        if not name or name in seen:
            continue
        seen.add(name)
        names.append(name)
    out = RAW / "icc25-names.json"
    out.write_text(json.dumps(names, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"names={len(names)} -> {out}")
    subprocess.check_call([sys.executable, str(ROOT / "scripts" / "build_cohort.py"), str(out)])


if __name__ == "__main__":
    main()
