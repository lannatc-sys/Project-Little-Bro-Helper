"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const savedTheme = localStorage.getItem("little_bro_theme") || "dark";
    
    setTheme(savedTheme);
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

    return () => {
      delete (window as any).toggleLittleBroTheme;
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
    <div className="min-h-screen w-full flex flex-col bg-background">
      <main className="flex-1 w-full relative pb-20 transition-all duration-300 max-w-2xl mx-auto bg-background min-h-screen">
        {children}
        <BottomNav />
      </main>
    </div>
  );
}
