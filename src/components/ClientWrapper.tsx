"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { SystemStatusBar } from "@/components/SystemStatusBar";

export const THEMES = [
  {
    id: "dark",
    name: "🌙 Dark Modern",
    description: "โหมดมืดล้ำสมัย สบายสายตา",
    badge: "Default",
    previewBg: "#09090B",
    previewPrimary: "#5B5CEB"
  },
  {
    id: "light",
    name: "☀️ Light Modern",
    description: "โหมดสว่างคลีน เรียบหรูสบายตา",
    badge: "Clean",
    previewBg: "#F4F4F5",
    previewPrimary: "#5B5CEB"
  },
  {
    id: "shan-light",
    name: "🌾 พี่น้องชาวไทยใหญ่ (Shan Warm)",
    description: "โทนอุ่นผ้าทอไทยใหญ่ ทองและครีมละมุน",
    badge: "Cultural ⭐",
    previewBg: "#F5EBE0",
    previewPrimary: "#C46210"
  },
  {
    id: "shan-dark",
    name: "🏮 พี่น้องชาวไทยใหญ่ (Shan Night)",
    description: "โทนราตรีหรูหรา ทองล้านนาไทใหญ่",
    badge: "Golden ⭐",
    previewBg: "#140F0A",
    previewPrimary: "#D4AF37"
  }
];

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "shan-light";
    return localStorage.getItem("little_bro_theme") || "shan-light";
  });
  const [mounted, setMounted] = useState(false);

  const applyThemeClass = (targetTheme: string) => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light", "theme-shan-light", "theme-shan-dark", "light-mode");
    root.classList.add(`theme-${targetTheme}`);
    if (targetTheme === "light") {
      root.classList.add("light-mode");
    }
  };

  useEffect(() => {
    applyThemeClass(theme);
    setMounted(true);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (newTheme: string) => {
      setTheme(newTheme);
      localStorage.setItem("little_bro_theme", newTheme);
      applyThemeClass(newTheme);
      window.dispatchEvent(new CustomEvent("little_bro_theme_updated", { detail: newTheme }));
    };

    (window as unknown as { toggleLittleBroTheme: (t: string) => void }).toggleLittleBroTheme = handleThemeChange;

    return () => {
      delete (window as unknown as { toggleLittleBroTheme?: (t: string) => void }).toggleLittleBroTheme;
    };
  }, []);

  if (!mounted) {
    return (
      <main className="flex-1 w-full max-w-2xl mx-auto relative bg-[#09090B] min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col bg-background ${theme.startsWith("shan") ? "shan-bg-pattern" : ""}`}>
      <main className="flex-1 w-full relative pb-20 transition-all duration-300 max-w-2xl mx-auto bg-background min-h-screen border-x border-white/5 shadow-2xl">
        <SystemStatusBar />
        {children}
        <BottomNav />
      </main>
    </div>
  );
}
