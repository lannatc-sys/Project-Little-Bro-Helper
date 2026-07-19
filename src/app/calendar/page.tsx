"use client";

import { useState } from "react";
import Image from "next/image";

export default function CalendarScreen() {
  const [view, setView] = useState("เดือน");
  const [selectedDay, setSelectedDay] = useState<number | "">(20);
  
  // Dummy calendar days for May 2026
  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 5; // May 2026 starts on Friday (Friday index is 5)
  const calendarGrid = [
    ...Array(startOffset).fill(""),
    ...daysInMonth
  ];

  const events = [
    { id: 1, title: "เช็คอินลูกค้า Little Bro Hostel", time: "10:00 - 11:00", loc: "Lobby" },
    { id: 2, title: "ประชุมทีม Google Meet", time: "14:00 - 15:30", loc: "Google Meet Link" },
    { id: 3, title: "เตรียมเอกสารรายงานเงิน", time: "16:00 - 16:30", loc: "Office Room 1" }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">ปฏิทิน</h1>
          <button
            onClick={() => alert("ระบบบันทึกปฏิทินลง Google Calendar จะเชื่อมต่อในเฟสถัดไปครับบอส!")}
            className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/80 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
          >
            + นัดหมาย
          </button>
        </header>

        {/* View Selector */}
        <div className="flex bg-[#18181B] p-1.5 rounded-xl border border-white/5 mb-6 justify-between text-center">
          {["วัน", "สัปดาห์", "เดือน", "วาระ"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all ${
                view === v
                  ? "bg-[#5B5CEB] text-white font-bold"
                  : "text-[#B3B3B3] hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Month Title */}
        <h2 className="text-sm font-bold text-center mb-4">พฤษภาคม 2567</h2>

        {/* Calendar Grid representation */}
        <div className="bg-[#18181B]/40 border border-white/5 p-4 rounded-2xl mb-6">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#B3B3B3] mb-2 font-semibold">
            {daysOfWeek.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
            {calendarGrid.map((day, idx) => {
              const isSelected = day === selectedDay;
              const isEmpty = day === "";
              return (
                <div
                  key={idx}
                  onClick={() => !isEmpty && setSelectedDay(day)}
                  className={`py-1.5 flex items-center justify-center rounded-lg transition-all ${
                    isEmpty 
                      ? "opacity-0 pointer-events-none" 
                      : isSelected
                      ? "bg-[#5B5CEB] text-white font-bold shadow-md shadow-[#5B5CEB]/25 scale-105 cursor-pointer"
                      : "text-white hover:bg-white/5 cursor-pointer"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List Group */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-[#B3B3B3] mb-3">
            รายการนัดหมาย วันที่ {selectedDay || "--"} พฤษภาคม
          </h3>
          <div className="space-y-3">
            {selectedDay === 20 ? (
              events.map((event) => (
                <div key={event.id} className="p-3 bg-[#18181B]/20 border-l-4 border-[#5B5CEB] rounded-r-xl">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-semibold text-white">{event.title}</h4>
                    <span className="text-[9px] text-[#B3B3B3] font-mono">{event.time}</span>
                  </div>
                  <p className="text-[9px] text-[#B3B3B3] mt-1">📍 {event.loc}</p>
                </div>
              ))
            ) : (
              <div className="p-6 bg-[#18181B]/25 border border-dashed border-white/5 rounded-2xl text-center text-xs text-[#B3B3B3]/70">
                📭 ไม่มีรายการนัดหมายในวันนี้ครับบอส
              </div>
            )}
          </div>
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-[#18181B]/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#18181B] flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/inspect.png"
              alt="Inspect Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-1">ตรวจสอบตารางเวลา 🗓️</h4>
            <p className="text-[10px] text-[#B3B3B3] leading-relaxed">
              ตารางช่วงบ่ายของบอสมี "ประชุมทีม" เวลา 14:00 น. ผมจะทำการแจ้งเตือนผ่านบอท Telegram ล่วงหน้า 15 นาทีก่อนประชุมเริ่มนะครับบอส!
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-[10px] text-[#B3B3B3]/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
