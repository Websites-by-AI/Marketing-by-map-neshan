# دیدبان محلی | Marketing by Map (Neshan)

داشبورد هوش بازار برای کشف کسب‌وکارهای محلی روی نقشه، امتیازدهی حضور دیجیتال، ساخت شبکه همسایگی و تولید پرامپت ساخت سایت.

## چه کار می‌کند؟

- جمع‌آوری کسب‌وکارها از [وب‌سرویس جستجوی نشان](https://platform.neshan.org) یا از کاتالوگ نمونه غرب تهران
- نمایش خیابانی روی نقشه با رنگ‌بندی لید / بدون سایت / مرتبط
- خوشه‌بندی همسایگی تا شعاع ۹۰۰ متر و پیشنهاد اتصال خدماتی
- خروجی CSV / JSON با لینک گوگل، نشان، ویز و پرامپت طراحی سایت
- تحلیل اولیه وب‌سایت (در حالت زنده)

بدون `DATABASE_URL` و بدون `NESHAN_API_KEY` هم کامل اجرا می‌شود (حالت نمونه).

## اجرا

```bash
npm install
cp .env.example .env
npm run dev
```

اختیاری:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
NESHAN_API_KEY=service.xxxxx
```

اگر کلید نشان تنظیم شود، دکمه «جمع‌آوری نشان» نتایج زنده را از API نشان می‌گیرد و در Postgres ذخیره می‌کند.

## اسکریپت‌ها

- `npm run dev` — سرور توسعه
- `npm run build` — بیلد پروداکشن
- `npm run start` — اجرای بیلد
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript

## ساختار

```
src/app            صفحات و API
src/components     داشبورد و نقشه
src/lib            کاتالوگ نمونه، فاصله، شبکه، پرامپت
src/db             Drizzle + schema
```
