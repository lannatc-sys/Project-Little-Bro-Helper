"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("dark");
  const [layout, setLayout] = useState("mobile");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const savedTheme = localStorage.getItem("little_bro_theme") || "dark";
    const savedLayout = localStorage.getItem("little_bro_layout") || "mobile";
    
    setTheme(savedTheme);
    setLayout(savedLayout);
    
    document.documentElement.classList.toggle("light-mode", savedTheme === "light");
    setMounted(true);
  }, []);

  // Expose triggers to window so pages can call them easily
  useEffect(() => {
    (window as any).toggleLittleBroTheme = (newTheme: string) => {
      setTheme(newTheme);
      localStorage.setItem("little_bro_theme", newTheme);
      document.documentElement.classList.toggle("light-mode", newTheme === "light");
    };

    (window as any).toggleLittleBroLayout = (newLayout: string) => {
      setLayout(newLayout);
      localStorage.setItem("little_bro_layout", newLayout);
    };

    return () => {
      delete (window as any).toggleLittleBroTheme;
      delete (window as any).toggleLittleBroLayout;
    };
  }, []);

  if (!mounted) {
    return (
      <main className="flex-1 w-full max-w-md mx-auto relative bg-[#09090B] min-h-screen">
        {children}
      </main>
    );
  }

  const isMobile = layout === "mobile";

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center ${
      isMobile ? "bg-[#121214] dark:bg-[#121214] light-mode:bg-[#E4E4E7] py-8" : "bg-background"
    }`}>
      <main
        className={`flex-1 w-full relative pb-20 transition-all duration-300 ${
          isMobile
            ? "max-w-md mx-auto bg-background rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 min-h-[760px]"
            : "max-w-none bg-background min-h-screen"
        }`}
      >
        {children}
        <BottomNav />
      </main>
    </div>
  );
}
