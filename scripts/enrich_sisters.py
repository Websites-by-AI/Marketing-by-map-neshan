#!/usr/bin/env python3
"""Add tags, scores, stages, next steps, and download live-site screenshots."""

from __future__ import annotations

import json
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/sister-companies.json"
SHOT_DIR = ROOT / "public/sisters"

FIELD_TAGS = {
    "web": ["وب", "سئو", "لندینگ"],
    "seller": ["فروش", "B2B", "لید"],
    "finance": ["مالی", "حسابرسی", "طرح کسب‌وکار"],
    "loan": ["وام", "وثیقه", "بانک"],
    "lawyer": ["حقوقی", "قرارداد", "سند"],
    "immigration": ["ویزا", "مهاجرت"],
    "insurance": ["بیمه", "مسئولیت"],
    "logistics": ["لجستیک", "غرفه", "پسماند"],
    "hr": ["منابع انسانی", "رزومه"],
    "academy": ["آموزش", "آزمون", "RAG"],
    "environment": ["محیط‌زیست", "پاکسازی", "آب"],
    "social": ["اجتماعی", "تندرستی"],
}

DESC = {
    "neshan-m": "نقشه رسمی ۴۴۰ غرفه ساختمان ۱۴۰۵ با لید دیجیتال و اتصال به نفت.",
    "celebration": "طراحی جشن و رونمایی محصول برای غرفه‌دار.",
    "adv-seo-2": "موتور لید و آدیت سئو با ایمپورت لیست نمایشگاه.",
    "adv-seo": "داشبورد سئو نسخه اول؛ برای دمو کافی است.",
    "seo-wp": "اتوماسیون محتوا بعد از فروش سایت وردپرسی.",
    "leadfair": "جستجوی RAG روی ۱۷۳۰ شرکت نفت و صف فروش غرفه.",
    "seo-liderfer": "صف اولویت لید سئو P1 تا P3.",
    "chatredash": "CRM معرف؛ دمو عمومی پایدار ندارد.",
    "elecon": "فروش هوشمند صنعت برق برای غرفه تاسیسات.",
    "hourtash": "آزمایش غذا و کشاورزی به‌عنوان خدمت جانبی.",
    "bizplan": "سازنده طرح کسب‌وکار؛ Space الان خطا دارد.",
    "bizplan-2": "نسخه دوم طرح کسب‌وکار؛ Space خواب است.",
    "realty-finance": "برآورد قیمت ملک برای پرونده مالی.",
    "hesabras": "دستیار حسابرسی؛ مخزن اصلی الان در دسترس نیست.",
    "steel-hesabras": "جایگزین حسابرس‌یار روی استیل‌آنلاین.",
    "realty-loan": "املاک AI برای پرونده وام و وثیقه.",
    "bizplan-loan": "طرح کسب‌وکار بانکی؛ سایت وام جدا ندارد.",
    "realty-heroku": "کپی ویزارد املاک روی Heroku-elasa.",
    "arman": "دستیار وکیل و بیمه آرمان روی دامنه زنده.",
    "notary-662": "دفتر اسناد ۶۶۲ با RAG حقوقی روی کلادفلر.",
    "notary-source": "نسخه منبع همان سردفتر.",
    "haqyar": "مشاوره حقوقی آنلاین؛ دمو عمومی ندارد.",
    "arman2": "فقط نوت‌بوک اتصال نمایشگاه.",
    "dadgar-legal": "دادگر AI برای پیش‌نویس سند.",
    "arman-heroku": "همان سایت آرمان از حساب Heroku-elasa.",
    "visa-fair": "دستیار ویزای تجاری روی دامنه نمایشگاه.",
    "shahrokh": "مسیر ایران به استانبول — فقط سایت، بدون بات.",
    "arman-ins": "ماژول بیمه همان سایت آرمان.",
    "eternal-path": "پورتال خدمات ترحیم و مسیر قبر.",
    "digifair-cf": "خدمات غرفه دیجی‌فیر روی Worker.",
    "digifair-vercel": "نسخه دوم دیجی‌فیر بدون دمو پایدار.",
    "smartwaste": "پسماند هوشمند EcoSmart برای سالن.",
    "findexpert": "پیدا کردن متخصص؛ Pages الان قطع است.",
    "chatre-karname": "کارنامه کنکور وکالت و سردفتری.",
    "chatre-org": "همان چتر دانش روی سازمان.",
    "karyab": "رزومه‌ساز برای نیروی موقت غرفه.",
    "notebooks": "نوت‌بوک‌های تست‌شده RAG نفت و ساختمان.",
    "digiamoozesh": "آکادمی کسب‌وکار خانگی دیجی‌آموزش.",
    "vibelab": "بوت‌کمپ دو روزه ساخت وب‌اپ.",
    "taranom": "مدرسه روانشناسی و کنکور ترنم.",
    "dual-protocol": "پروتکل آموزشی تشخیص دوگانه؛ جایگزین پزشک نیست.",
    "dual-rag": "RAG بالینی بدون Space پایدار.",
    "azmonyar": "پلتفرم آزمون ارشد مهندسی.",
    "rooish": "شتاب‌دهنده رویش سبزوار.",
    "green-hope": "کاشت درخت و گرنت سبز.",
    "green-hope-pages": "همان امید سبز روی Cloudflare Pages.",
    "smartwaste-env": "پسماند هوشمند در حوزه محیط‌زیست.",
    "water-bankruptcy": "داشبورد کم‌آبی و آبخوان ایران.",
    "ecoai": "گزارش پایداری و پیشنهاد پروژه سبز.",
    "wildfire": "مدل ماهواره‌ای گسترش آتش جنگل.",
    "civicavita": "سلامت بشردوستانه — فقط حوزه اجتماعی.",
    "janpanah": "پناهگاه و نجات حیوان.",
    "aura-wellness": "کوچ تندرستی و زیبایی آورا.",
    "aura-music": "استودیو ایده موسیقی آورا.",
    "aura-sport": "مربی ورزش آورا.",
    "sahar-aura": "گالری شابلون و تست آرایشی.",
    "media-compassion": "تحلیل لحن و مهربانی رسانه.",
}


def score_of(startup: dict) -> tuple[int, str, str, list[str], list[str]]:
    status = startup.get("status") or "repo"
    web = startup.get("website")
    score = 18
    reasons: list[str] = []
    if web:
        score += 22
        reasons.append("آدرس عمومی دارد")
    else:
        reasons.append("سایت عمومی ندارد")
    bonus = {
        "live": 38,
        "vercel": 32,
        "hf-live": 28,
        "hf-sleeping": 12,
        "hf-error": 6,
        "down": 8,
        "repo": 10,
        "missing": 2,
        "empty": 2,
    }
    score += bonus.get(status, 8)
    reasons.append(
        {
            "live": "سایت زنده پاسخ می‌دهد",
            "vercel": "دمو روی Vercel",
            "hf-live": "Space زنده",
            "hf-sleeping": "Space خواب است",
            "hf-error": "Space خطا دارد",
            "down": "آدرس هست ولی قطع است",
            "repo": "فقط مخزن/نمونه",
            "missing": "مخزن پیدا نشد",
            "empty": "مخزن خالی",
        }.get(status, "وضعیت نامشخص")
    )
    host = web or ""
    if any(part in host for part in (".ir", "exhibition2world")):
        score += 8
        reasons.append("دامنه نمایشگاه یا .ir")
    elif "pages.dev" in host or "workers.dev" in host:
        score += 6
        reasons.append("هاست کلادفلر")
    elif "vercel.app" in host:
        score += 5
        reasons.append("دمو Vercel")
    score = max(5, min(98, score))
    if score >= 85:
        stage, stage_id = "آماده استفاده", "ready"
    elif score >= 70:
        stage, stage_id = "نزدیک به آماده", "almost"
    elif score >= 50:
        stage, stage_id = "بتا / دمو", "beta"
    elif score >= 30:
        stage, stage_id = "نمونه اولیه", "prototype"
    else:
        stage, stage_id = "ایده / نیاز به ساخت", "idea"
    steps: list[str] = []
    if not web:
        steps += ["لندینگ عمومی روی Pages بساز", "آدرس قابل کلیک بده", "صفحه فارسی با CTA تماس"]
    if status in ("repo", "empty"):
        steps += ["نسخه دمو را دیپلوی کن", "فرم واتساپ/تماس بگذار", "۳ کیس نمایشگاه اضافه کن"]
    if status == "missing":
        steps += ["مخزن را بازیابی یا جایگزین کن", "README و دمو استاتیک بساز"]
    if status == "down":
        steps += ["قطع بودن Pages را درست کن", "DNS و SSL را چک کن"]
    if status == "hf-sleeping":
        steps += ["Space را بیدار کن یا نسخه استاتیک بساز", "سقف CPU را رفع کن"]
    if status == "hf-error":
        steps += ["خطای اجرا را درست کن", "پشتیبان کلادفلر بساز"]
    if status == "live" and score < 90:
        steps += ["فرم لید نمایشگاه اضافه کن", "پکیج قیمت فارسی بنویس", "به LeadFair وصل کن"]
    if status == "live" and score >= 85:
        steps += ["قرارداد و قیمت آماده کن", "۲ کیس موفق غرفه بگذار", "آنالیتیکس و رضایت"]
    uniq: list[str] = []
    for step in steps:
        if step not in uniq:
            uniq.append(step)
    return score, stage, stage_id, uniq[:5], reasons


def extra_tags(startup: dict) -> list[str]:
    tags = []
    st = startup.get("status")
    if st == "live":
        tags.append("زنده")
    elif st == "down":
        tags.append("قطع")
    elif st in ("repo", "missing", "empty"):
        tags.append("بدون سایت")
    elif st and st.startswith("hf"):
        tags.append("Hugging Face")
    if startup.get("website") and ".ir" in startup["website"]:
        tags.append("دامنه IR")
    return tags


def download_shot(url: str, dest: Path) -> bool:
    api = "https://api.microlink.io/?" + urllib.parse.urlencode(
        {
            "url": url,
            "screenshot": "true",
            "meta": "false",
            "embed": "screenshot.url",
        }
    )
    # embed=screenshot.url returns redirect to png; better get JSON
    api = "https://api.microlink.io/?" + urllib.parse.urlencode({"url": url, "screenshot": "true", "meta": "false"})
    ctx = ssl.create_default_context()
    try:
        req = urllib.request.Request(api, headers={"User-Agent": "neshan-m-sisters"})
        with urllib.request.urlopen(req, timeout=40, context=ctx) as res:
            payload = json.loads(res.read().decode("utf-8", "ignore"))
        shot = ((payload.get("data") or {}).get("screenshot") or {}).get("url")
        if not shot:
            print("no shot", url, payload.get("status"), payload.get("message"))
            return False
        req2 = urllib.request.Request(shot, headers={"User-Agent": "neshan-m-sisters"})
        with urllib.request.urlopen(req2, timeout=40, context=ctx) as res:
            blob = res.read()
        if len(blob) < 2000:
            print("tiny", url, len(blob))
            return False
        dest.write_bytes(blob)
        print("ok", dest.name, len(blob), url)
        return True
    except Exception as exc:
        print("fail", url, exc)
        return False


def write_placeholder(dest: Path, title: str, subtitle: str) -> None:
    safe_title = title.replace("&", "و")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10263d"/>
      <stop offset="1" stop-color="#1b4a6b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="750" fill="url(#g)"/>
  <rect x="48" y="40" width="1104" height="44" rx="10" fill="#0b1a2b"/>
  <circle cx="78" cy="62" r="7" fill="#ee6748"/>
  <circle cx="102" cy="62" r="7" fill="#f5c16c"/>
  <circle cx="126" cy="62" r="7" fill="#3dbe8c"/>
  <text x="160" y="68" fill="#9fb3c8" font-size="18" font-family="Tahoma,sans-serif">سایت عمومی هنوز آماده نیست</text>
  <text x="600" y="360" text-anchor="middle" fill="#ffffff" font-size="42" font-family="Tahoma,sans-serif">{safe_title}</text>
  <text x="600" y="420" text-anchor="middle" fill="#f4b8a8" font-size="22" font-family="Tahoma,sans-serif">{subtitle}</text>
</svg>
"""
    dest.write_text(svg, encoding="utf-8")


def main() -> None:
    data = json.loads(DATA.read_text())
    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    url_to_file: dict[str, str] = {}

    unique_urls: dict[str, str] = {}
    for field in data["items"]:
        for startup in field["startups"]:
            web = startup.get("website")
            if web and startup.get("status") in {"live", "vercel", "hf-live"}:
                unique_urls.setdefault(web.rstrip("/"), startup["id"])

    for url, sid in unique_urls.items():
        dest = SHOT_DIR / f"{sid}.png"
        if dest.exists() and dest.stat().st_size > 4000:
            url_to_file[url] = f"/sisters/{sid}.png"
            print("cached", dest.name)
            continue
        if download_shot(url, dest):
            url_to_file[url] = f"/sisters/{sid}.png"
        time.sleep(0.4)

    for field in data["items"]:
        base_tags = FIELD_TAGS.get(field["slug"], [])
        for startup in field["startups"]:
            score, stage, stage_id, steps, reasons = score_of(startup)
            web = (startup.get("website") or "").rstrip("/")
            shot = url_to_file.get(web)
            if not shot:
                placeholder = SHOT_DIR / f"{startup['id']}.svg"
                write_placeholder(placeholder, startup["name"], startup.get("role") or field["name"])
                shot = f"/sisters/{startup['id']}.svg"
            startup["description"] = DESC.get(startup["id"], startup.get("role") or field["offer"])
            startup["tags"] = list(dict.fromkeys(base_tags + extra_tags(startup)))[:5]
            startup["score"] = score
            startup["stage"] = stage
            startup["stageId"] = stage_id
            startup["nextSteps"] = steps
            startup["scoreWhy"] = reasons
            startup["screenshot"] = shot
            startup["ready"] = score >= 70

    data["scoringNote"] = (
        "امتیاز آمادگی استفاده ۰–۱۰۰ از روی زنده بودن سایت، دامنه، و نوع هاست حساب شده "
        "(۱۲ اوت ۲۰۲۶). مخزن گیت‌هاب در صفحه عمومی نشان داده نمی‌شود."
    )
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print("enriched startups", sum(len(i["startups"]) for i in data["items"]))
    print("screenshots", len(url_to_file))


if __name__ == "__main__":
    main()
