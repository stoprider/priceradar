import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PriceRadar TH",
  description: "ระบบติดตามราคา รายการเฝ้าดู คะแนนความคุ้มค่า และการแจ้งเตือนผ่าน Telegram สำหรับผู้ใช้ชาวไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${manrope.variable} ${mono.variable} antialiased`}>{children}</body>
    </html>
  );
}
