import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "دیدبان محلی | هوش بازار کسب‌وکارها",
  description: "داشبورد کشف، تحلیل و اولویت‌بندی فرصت‌های دیجیتال کسب‌وکارهای محلی.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
