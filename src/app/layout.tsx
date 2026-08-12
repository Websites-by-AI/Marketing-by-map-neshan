import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "دیدبان محلی | نمایشگاه بین‌المللی ساختمان ۱۴۰۵",
  description:
    "۴۴۰ غرفه‌دار IRAN CONFAIR روی نقشه نشان: لید دیجیتال، شبکه همسایگی، پرامپت ساخت سایت و اتصال به ماژول سئو.",
  applicationName: "دیدبان محلی",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={vazirmatn.className}>{children}</body>
    </html>
  );
}
