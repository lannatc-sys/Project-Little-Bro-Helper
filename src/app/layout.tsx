import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "Little Bro Assistant - Personal Assistant",
  description: "ระบบผู้ช่วยส่วนตัวและบันทึกการเงิน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[#09090B] text-white flex flex-col font-sans" suppressHydrationWarning>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
