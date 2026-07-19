"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const [greeting, setGreeting] = useState("สวัสดีครับบอส 👔");
  const [time, setTime] = useState("");

  useEffect(() => {
    // Dynamic greeting based on current local time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("สวัสดีตอนเช้าบอส ☀️");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("สวัสดีตอนบ่ายบอส 🌤️");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("สวัสดีตอนเย็นบอส 🌙");
    } else {
      setGreeting("ดึกแล้วครับบอส รักษาสุขภาพด้วย 💤");
    }

    // Simple live time clock
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit"
        }) + " น."
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Header Section */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1 transition-all duration-300">
              {greeting}
            </h1>
            <p className="text-sm text-[#B3B3B3]">วันนี้มีอะไรให้ช่วยจัดการไหมครับ?</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-[#5B5CEB]/20 text-[#5B5CEB] border border-[#5B5CEB]/30 px-3 py-1 rounded-full font-mono text-sm">
              {time || "Little Bro"}
            </span>
          </div>
        </header>

        {/* Universal Search Bar */}
        <div className="bg-[#18181B]/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 mb-6 flex items-center shadow-lg transition-all duration-300 focus-within:border-[#5B5CEB]/50">
          <span className="text-[#B3B3B3] mr-2">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาภารกิจ รายการเงิน หรือไฟล์..."
            className="bg-transparent w-full focus:outline-none text-sm placeholder-[#B3B3B3] text-white"
          />
        </div>

        {/* Grid Dashboard Modules */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/add-expense" className="group">
            <div className="bg-[#18181B]/40 backdrop-blur-lg border border-white/5 hover:border-[#10B981]/30 p-4 rounded-2xl transition-all duration-300 hover:bg-[#18181B]/60 transform hover:-translate-y-1">
              <h3 className="text-xs text-[#B3B3B3] mb-1 group-hover:text-[#10B981] transition-colors">
                การเงินประจำเดือน
              </h3>
              <p className="text-lg font-bold text-[#10B981]">฿ 0.00</p>
              <span className="text-[10px] text-[#B3B3B3]/60 block mt-2">แตะเพื่อบันทึกเพิ่ม →</span>
            </div>
          </Link>
          <div className="bg-[#18181B]/40 backdrop-blur-lg border border-white/5 p-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xs text-[#B3B3B3] mb-1">งานวันนี้</h3>
            <p className="text-lg font-bold text-[#5B5CEB]">0 รายการ</p>
            <span className="text-[10px] text-[#B3B3B3]/60 block mt-2">เชื่อมต่อคลังงานแล้ว</span>
          </div>
        </div>

        {/* Quick Menu / Command Shortcuts */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider mb-2">ทางลัดคำสั่งด่วน</h2>
          
          <Link href="/add-expense" className="flex items-center justify-between p-4 bg-[#18181B]/30 hover:bg-[#18181B]/50 border border-white/5 rounded-xl transition-all duration-200">
            <div className="flex items-center gap-3">
              <span className="text-lg bg-[#EF4444]/20 p-2 rounded-lg text-[#EF4444]">💸</span>
              <div>
                <h4 className="text-sm font-semibold">บันทึกรายจ่าย</h4>
                <p className="text-xs text-[#B3B3B3]">เพิ่มธุรกรรมทางการเงินลงชีต Finance</p>
              </div>
            </div>
            <span className="text-[#B3B3B3] text-sm">➔</span>
          </Link>

          <button onClick={() => alert("ระบบกิโลงาน / Task จะเปิดให้บริการในเฟสถัดไปครับบอส!")} className="w-full flex items-center justify-between p-4 bg-[#18181B]/30 hover:bg-[#18181B]/50 border border-white/5 rounded-xl text-left transition-all duration-200">
            <div className="flex items-center gap-3">
              <span className="text-lg bg-[#5B5CEB]/20 p-2 rounded-lg text-[#5B5CEB]">📋</span>
              <div>
                <h4 className="text-sm font-semibold">เช็กงานด่วน</h4>
                <p className="text-xs text-[#B3B3B3]">ดึงภารกิจ 5 รายการล่าสุดจากปฏิทินชีต</p>
              </div>
            </div>
            <span className="text-[#B3B3B3] text-sm">➔</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-[11px] text-[#B3B3B3]/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
