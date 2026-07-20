"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export const THEME_GALLERY = [
  {
    id: "shan-light",
    name: "🌾 ธีมพี่น้องชาวไทใหญ่ (Shan Warm)",
    subtitle: "โทนอุ่นผ้าทอไทใหญ่ ทองและครีมละมุน",
    badge: "Cultural ⭐",
    price: "ฟรี",
    avatar: "/avatar/shan.png",
    bgGradient: "from-[#FAF4ED] via-[#F5EBE0] to-[#E6D5C3]",
    textColor: "text-[#C46210]",
    accentColor: "#C46210",
    cardBorder: "border-[#DAA520]"
  },
  {
    id: "shan-dark",
    name: "🏮 ธีมพี่น้องชาวไทใหญ่ (Shan Night)",
    subtitle: "โทนราตรีหรูหรา ทองล้านนาไทใหญ่",
    badge: "Golden ⭐",
    price: "ฟรี",
    avatar: "/avatar/shan.png",
    bgGradient: "from-[#1E1711] via-[#140F0A] to-[#0A0704]",
    textColor: "text-[#D4AF37]",
    accentColor: "#D4AF37",
    cardBorder: "border-[#D4AF37]"
  },
  {
    id: "dark",
    name: "🌙 Dark Modern",
    subtitle: "โหมดมืดล้ำสมัย สบายสายตา",
    badge: "Default",
    price: "ฟรี",
    avatar: "/avatar/hello.png",
    bgGradient: "from-[#18181B] via-[#09090B] to-[#000000]",
    textColor: "text-[#5B5CEB]",
    accentColor: "#5B5CEB",
    cardBorder: "border-white/20"
  },
  {
    id: "light",
    name: "☀️ Light Modern",
    subtitle: "โหมดสว่างคลีน เรียบหรูสบายตา",
    badge: "Clean",
    price: "ฟรี",
    avatar: "/avatar/hello.png",
    bgGradient: "from-[#FFFFFF] via-[#F4F4F5] to-[#E4E4E7]",
    textColor: "text-[#5B5CEB]",
    accentColor: "#5B5CEB",
    cardBorder: "border-black/10"
  }
];

export default function ThemeStudioPage() {
  const [activeTheme, setActiveTheme] = useState("shan-light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("little_bro_theme") || "shan-light";
    setActiveTheme(saved);
    setMounted(true);
  }, []);

  const handleApplyTheme = (themeId: string) => {
    setActiveTheme(themeId);
    if ((window as any).toggleLittleBroTheme) {
      (window as any).toggleLittleBroTheme(themeId);
    } else {
      localStorage.setItem("little_bro_theme", themeId);
      const root = document.documentElement;
      root.classList.remove("theme-dark", "theme-light", "theme-shan-light", "theme-shan-dark", "light-mode");
      root.classList.add(`theme-${themeId}`);
      if (themeId === "light") root.classList.add("light-mode");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center text-text-main">
        กำลังโหลดสตูดิโอธีม...
      </div>
    );
  }

  const currentThemeObj = THEME_GALLERY.find(t => t.id === activeTheme) || THEME_GALLERY[0];

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Top Header with Back Navigation */}
        <header className="mb-6 flex items-center justify-between">
          <Link 
            href="/settings" 
            className="text-xs text-text-sub hover:text-text-main transition-colors flex items-center gap-1 font-semibold"
          >
            <span>←</span> กลับหน้าตั้งค่า
          </Link>
          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 font-bold px-2.5 py-0.5 rounded-full">
            Theme Gallery
          </span>
        </header>

        {/* Studio Title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <span>🎨 ธีมและการตกแต่ง</span>
          </h1>
          <p className="text-[11px] text-text-sub mt-0.5">
            เลือกเปลี่ยนสีสันบรรยากาศและมาสคอตน้อง Little Bro ในสไตล์ที่คุณชื่นชอบ
          </p>
        </div>

        {/* Live Mockup Mobile Screen Preview Box */}
        <div className="mb-6 p-4 bg-surface/60 border border-white/10 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-[10px] text-text-sub font-semibold">
            <span>ตัวอย่างการแสดงผลบนหน้าจอ (Live Preview)</span>
            <span className={currentThemeObj.textColor}>
              {currentThemeObj.name}
            </span>
          </div>

          <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentThemeObj.bgGradient} border ${currentThemeObj.cardBorder} shadow-lg transition-all duration-300 space-y-3`}>
            {/* Mock Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border border-white/40 shadow-inner flex items-center justify-center shrink-0">
                <Image
                  src={currentThemeObj.avatar}
                  alt="Mascot Preview"
                  width={40}
                  height={40}
                  className="object-cover scale-110"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold drop-shadow-sm">Little Bro Assistant</h4>
                <p className="text-[9px] opacity-80">พร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง</p>
              </div>
            </div>

            {/* Mock Financial Card */}
            <div className="p-3 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 text-xs flex justify-between items-center">
              <div>
                <span className="text-[9px] opacity-70 block">ยอดเงินคงเหลือเดือนนี้</span>
                <span className="font-bold font-mono text-sm">฿ 15,480.00</span>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-1 rounded-lg font-bold">
                + รายรับ ฿24,000
              </span>
            </div>
          </div>
        </div>

        {/* Theme Cards Grid (2x2 Grid Gallery matching MAKE Cloud Pocket style) */}
        <div className="grid grid-cols-2 gap-3.5 mb-8">
          {THEME_GALLERY.map((t) => {
            const isSelected = activeTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handleApplyTheme(t.id)}
                className={`p-3.5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg relative group ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/40 bg-surface scale-[1.02]"
                    : "border-white/10 bg-surface/40 hover:border-white/20 hover:scale-[1.01]"
                }`}
              >
                {/* Top Badge & Price */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[8px] bg-white/10 text-text-sub font-bold px-2 py-0.5 rounded-full border border-white/5">
                    {t.badge}
                  </span>
                  <span className="text-[8px] text-primary font-bold">
                    {t.price}
                  </span>
                </div>

                {/* Theme Avatar Card Illustration */}
                <div className={`w-full h-24 rounded-2xl mb-3 bg-gradient-to-br ${t.bgGradient} border ${t.cardBorder} flex items-center justify-center relative overflow-hidden shadow-inner`}>
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={64}
                    height={64}
                    className="object-cover scale-110 drop-shadow-md transition-transform duration-300 group-hover:scale-125"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md">
                      ✓
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="space-y-1 text-left">
                  <h3 className="text-xs font-bold text-text-main line-clamp-1 group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-[9px] text-text-sub line-clamp-2 leading-tight">
                    {t.subtitle}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTheme(t.id);
                  }}
                  className={`w-full mt-3 py-2 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-surface hover:bg-white/10 border border-white/10 text-text-sub hover:text-text-main"
                  }`}
                >
                  {isSelected ? "✓ ใช้งานอยู่" : "ใช้งานธีมนี้"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-6 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Assistant • Theme Studio Gallery v1.4.0</p>
      </footer>
    </div>
  );
}
