import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "Little Bro Helper",
  description: "ระบบผู้ช่วยจัดการข้อมูลและบันทึกการเงิน",
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
    >
      <body className="min-h-full bg-[#09090B] text-white flex flex-col font-sans">
        <main className="flex-1 w-full max-w-md mx-auto relative bg-[#09090B]">
          {children}
        </main>
      </body>
    </html>
  );
}
