# بررسی فقط — همکاران نمایشگاه ساختمان

تاریخ: ۱۲ اوت ۲۰۲۶  
مرحله بعد: ساخت تمیزتر روی کلادفلر + گیت‌هاب  
این فایل ساخت یا دیپلوی نیست.

سؤال این مرحله: کدام پروژهٔ اتصال‌گر **واقعاً مال نمایشگاه ساختمان** است و باید برای بخش همکاران آماده شود؟ کدام ریپوی قدیمی را باید به کدام محصول زنده هدایت کرد؟

---

## ۱) هسته نمایشگاه ساختمان — باید در همکاران بماند

این‌ها زنجیرهٔ واقعی غرفه / لید / RAG / خدمات سالن هستند.

| # | محصول زنده | ریپوی منبع (قدیمی → هدایت به) | الان در همکاران؟ | آماده بودن |
|---|---|---|---|---|
| 1 | [دیدبان محلی](https://neshan-m.exhibition2world.ir) نقشه + ۴۴۰ غرفه CONFAIR ۱۴۰۵ | `Websites-by-AI/Marketing-by-map-neshan` | بله — حوزه وب | آماده |
| 2 | [لیدفِر UI](https://leadfair.exhibition2world.ir) اتصال‌گر هوشمند + کانفیر ۱۴۰۵ | Pages `leadfair` — سورس داخل `exhibtion-rag-test1/huggingface-static` | بله — فروش | آماده (دامنه تولید تازه درست شد) |
| 3 | [RAG API نفت/ساختمان](https://vercel-app-amber-five.vercel.app/api/health) ۱۷۳۰ شرکت | `Websites-by-AI/exhibtion-rag-test1` → پوشه `vercel-app` | غیرمستقیم (زیر لیدفِر) | آماده؛ نام ریپو غلط املایی است |
| 4 | [rag2.exhibition2world.ir](https://rag2.exhibition2world.ir/api/health) | همان API روی مسیر کلادفلر | در وضعیت اتصال‌گر هست | آماده |
| 5 | [HF RAG2 vercel](https://sosa123454321-exhibition-connector-rag2-vercel.static.hf.space/) | همان monorepo + Space `sosa123454321/...` | در شبکه HF هست، کارت جدا در همکاران فروش کم‌رنگ است | باید در همکاران فروش واضح شود |
| 6 | [دیجی‌فیر Worker](https://digifair-cloudflare-full-fa.elasa2next.workers.dev) خدمات غرفه مثل digifair.ir | `Websites-by-AI/Digifair-ai-cloadfllare` | بله — لجستیک | آماده ولی ریپو نام‌غلط (`cloadfllare`) و ساختار FOR_CLOUDFLARE/FOR_VERCEL شلوغ است |

این ۶ تا **همکار نمایشگاه ساختمان** هستند. مرحله بعد همین‌ها را روی کلادفلر/گیت تمیزتر کنید.

---

## ۲) موتور لید — مرتبط است ولی اصلش کلینیک زیبایی است

برای غرفه‌دار ساختمان قابل استفاده است، اما محصول برای کلینیک تهران نوشته شده.

| محصول | ریپو | زنده | نکته برای همکاران |
|---|---|---|---|
| Clinic Signal / Adv-seo-2 | `Websites-by-AI/Adv-seo-2` | [adv-seo-2.vercel.app](https://adv-seo-2.vercel.app) عنوان: «ایجنت لید و سئوی کلینیک‌ها» | در همکاران وب هست. برای ساختمان باید برچسب شود: «موتور لید عمومی — مبدأ کلینیک» نه «سایت غرفه» |
| Adv-seo نسخه ۱ | `Websites-by-AI/Adv-seo` | [adv-seo.vercel.app](https://adv-seo.vercel.app) همان Clinic Signal | تکراری. در همکاران نباید دو کارت جدا باشد |
| لیدفر / seo-liderfer | `Websites-by-AI/seo-liderfer` | [seo-liderfer.vercel.app](https://seo-liderfer.vercel.app) رادار فروش سئو | مرتبط با فروش لید، نه لیست غرفه. نگه دارید با برچسب فروش |
| اتوماسیون وردپرس | `Websites-by-AI/SEO-wordpress-automation` | دامنهٔ seo.* قبلاً آورا بوده نه سئو | بعد از فروش سایت؛ الان همکار نمایشگاه نیست |

**هدایت ریپو:** `Adv-seo` → آرشیو/redirect به `Adv-seo-2`. Worker نمایشگاه به Python این‌ها وصل نیست.

---

## ۳) نام گمراه‌کننده — در همکاران نمایشگاه نگذارید یا درست کنید

| ریپو / کارت فعلی | واقعیت | کار مرحله بعد |
|---|---|---|
| `Digifair-ai-vercel` در همکاران به‌نام دیجی‌فیر Vercel | README = **دیجی‌آموزش** (آکادمی خانگی) نه خدمات غرفه | از حوزه لجستیک نمایشگاه حذف شود؛ اگر لازم است برود حوزه آموزش |
| `Chatredash-CRM` | محتوای مخزن **رتبه برتر** (معرف و پورسانت) است | همکار فروش عمومی است نه نمایشگاه ساختمان |
| `Rotbe-bartar-2` | تقریباً خالی | آرشیو |
| `Rotbe-bartar-by-taranom-mehr-trash-1` | از نام مشخص است trash | وارد همکاران نشود |
| HF `leadfair-ai-iran-confair-1405` | متوقف / سهمیه CPU؛ UI واقعی روی Pages است | در همکاران به‌عنوان محصول زنده نیاید |
| HF `Expo-connector` و `Expo-connector1` | Space پیش‌فرض HF / داکر | محصول نیست |
| HF `SoSa123456/Exhibition-connector-rag2-static` | هنوز فروشگاه DigiExpo تا PR ادغام شود | زندهٔ نمایشگاه حساب نشود |
| `celebration-design-by-ai` | جشن‌ساز — رویداد خصوصی | حوزه وب هست؛ **نمایشگاه ساختمان نیست** |

---

## ۴) صنعت ساختمان هست، نمایشگاه غرفه نیست

برای بخش «ساختمان» جدا مفیدند، نه کارت غرفه.

| پروژه | ریپو | چرا نه غرفه |
|---|---|---|
| املاک AI | `Realty-State-AI-Wizard` + کپی Heroku-elasa | قیمت ملک / وام؛ غرفه CONFAIR نیست |
| الکُن برق | `Heroku-elasa/Elecon-based-of-helius-num2` | B2B برق؛ غرفه‌دار برق می‌تواند مشتری باشد |
| پسماند EcoSmart | `SmartWaste-AI...` | پاکسازی سالن ممکن است؛ محصول نمایشگاه نیست |
| ویزا روی `immigration.exhibition2world.ir` | `AI-Iimmigration-visa-assistant-` | فقط دامنهٔ نمایشگاه را قرض گرفته |

---

## ۵) عمداً همکار نمایشگاه نباشند

بات/برند دیگر. به CRM غرفه وصل نکنید.

- نگین‌جام، celeb4neginejam، `neginejam-event-service`، `NEGINJAM-COMPANY`
- ترنم، چتر دانش، dual-diagnosis، دیجی‌آموزش (بات)
- Civicavita — فقط اجتماعی/بشردوستانه
- شاهرخ — سایت مهاجرت، بات نه
- آورا تندرستی / موسیقی / ورزش
- دفتر اسناد ۶۶۲، آرمان وکیل، مسیریاب قبور
- g2ray و بیلدپک‌های ۲۰۱۶ Heroku

---

## ۶) نقشه هدایت ریپوی قدیمی

```
لیست رسمی iccexpo ۲۵/۲۶
        ↓ JSON داخل
Marketing-by-map-neshan  ===  neshan-m.exhibition2world.ir
        │
        ├── /connect  وضعیت ماژول
        ├── /cohort   ۲۵ در برابر ۲۶
        └── /sisters  همکاران (الان ۱۲ حوزه مخلوط)

داده نفت ۱۷۳۰ + جستجو
        ↓
exhibtion-rag-test1
        ├── vercel-app/     → vercel-app-amber-five + rag2.exhibition2world.ir
        └── huggingface-static/ → Space RAG2 vercel + Pages LeadFair

لید و سئو (مبدأ کلینیک)
        Adv-seo  →  Adv-seo-2 (Clinic Signal)  →  seo-liderfer (صف فروش)

خدمات غرفه
        Digifair-ai-cloadfllare  →  Worker digifair-cloudflare-full-fa
        Digifair-ai-vercel       →  در واقع دیجی‌آموزش؛ هدایت غلط است

CRM معرف
        Chatredash-CRM = رتبه برتر
        Rotbe-bartar-2 / trash  →  آرشیو
```

---

## ۷) الان بخش همکاران چه ایرادی دارد؟

صفحه `/sisters` دوازده حوزه و ۵۷ استارتاپ دارد. برای بازدیدکنندهٔ نمایشگاه ساختمان شلوغ است:

- جشن‌ساز، آورا، ترنم، Civicavita کنار لیدفِر نشسته‌اند
- دیجی‌فیر Vercel اشتباه برچسب خورده
- Adv-seo و Adv-seo-2 تکراری‌اند
- سورس RAG (`exhibtion-rag-test1`) به‌عنوان همکار واضح نیست
- HF RAG2 زنده کارت فروش جدا ندارد

پیشنهاد مرحله بعد (هنوز انجام نشود): یک بلوک جدا به نام **همکاران نمایشگاه ساختمان** با حداکثر ۸ کارت:

1. دیدبان محلی (نقشه ۴۴۰)
2. لیدفِر UI
3. RAG2 API (Vercel + rag2)
4. HF RAG2
5. دیجی‌فیر Worker (فقط نسخه کلادفلر)
6. Clinic Signal با برچسب «موتور لید — مبدأ کلینیک»
7. لیدفر صف فروش
8. اختیاری: املاک AI به‌عنوان صنعت ساختمان نه غرفه

بقیه حوزه‌ها در `/sisters` بمانند ولی «همکار غرفه ۱۴۰۵» خوانده نشوند.

---

## ۸) مرحله بعد روی کلادفلر و گیت‌هاب — فقط برنامه

وقتی گفتید بسازید، به این ترتیب:

1. ریپوی `exhibtion-rag-test1` را با نام درست آرشیو/آینه کنید؛ README بگوید ساختمان ۱۴۰۵ جدا از نفت ۲۹ است
2. Digifair را فقط از `Digifair-ai-cloadfllare` جلو ببرید؛ کارت Vercel را اصلاح کنید
3. `Adv-seo` را به `Adv-seo-2` جمع کنید
4. LeadFair را از `master.leadfair.pages.dev` به دامنه تولید `leadfair.exhibition2world.ir` در همکاران هم یکدست کنید
5. Rotbe/Chatredash را یا CRM معرف جدا کنید یا از بلوک غرفه بردارید
6. Spaceهای مرده HF را در همکاران عمومی نیاورید

---

## جمع یک خطی

**مرتبط واقعی با نمایشگاه ساختمان:** دیدبان + لیدفِر + RAG monorepo + rag2 + HF RAG2 + دیجی‌فیر کلادفلر.  
**مرتبط به‌عنوان ابزار لید:** Adv-seo-2 و seo-liderfer (مبدأ کلینیک).  
**غلط‌برچسب:** Digifair-vercel (= دیجی‌آموزش)، Chatredash (= رتبه برتر)، Expo-connector خالی.  
این مرحله فقط بررسی بود؛ کاتالوگ همکاران و کلادفلر را عوض نکردم.
