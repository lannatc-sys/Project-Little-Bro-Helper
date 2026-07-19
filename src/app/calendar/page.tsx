"use client";

import { useState } from "react";
import Image from "next/image";

export default function CalendarScreen() {
  const [view, setView] = useState("เดือน");
  const [startDate, setStartDate] = useState<number | null>(20);
  const [endDate, setEndDate] = useState<number | null>(22);
  
  // Dummy calendar days for May 2026
  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 5; // May 2026 starts on Friday (Friday index is 5)
  const calendarGrid = [
    ...Array(startOffset).fill(""),
    ...daysInMonth
  ];

  const handleDayClick = (day: number) => {
    if (startDate === null || (startDate !== null && endDate !== null)) {
      // Start a new range
      setStartDate(day);
      setEndDate(null);
    } else {
      // Finish the range
      if (day < startDate) {
        // If clicked day is before start day, reset start day to clicked day
        setStartDate(day);
        setEndDate(null);
      } else if (day === startDate) {
        // Toggle off if clicking the same start day
        setStartDate(null);
      } else {
        setEndDate(day);
      }
    }
  };

  const getEventsForRange = () => {
    const allEvents = [
      { id: 1, title: "เช็คอินลูกค้า Little Bro Hostel", day: 20, time: "10:00 - 11:00", loc: "Lobby" },
      { id: 2, title: "ประชุมทีม Google Meet", day: 20, time: "14:00 - 15:30", loc: "Google Meet Link" },
      { id: 3, title: "เตรียมเอกสารรายงานเงิน", day: 21, time: "16:00 - 16:30", loc: "Office Room 1" },
      { id: 4, title: "เช็คเอาท์ลูกค้า Little Bro Hostel", day: 22, time: "10:00 - 11:30", loc: "Lobby" }
    ];

    if (startDate === null) return [];
    if (endDate === null) {
      return allEvents.filter(e => e.day === startDate);
    }
    return allEvents.filter(e => e.day >= startDate && e.day <= endDate);
  };

  const filteredEvents = getEventsForRange();

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
              const isEmpty = day === "";
              const isStart = day === startDate;
              const isEnd = day === endDate;
              const isSelected = isStart || isEnd;
              const isBetween = startDate !== null && endDate !== null && day > startDate && day < endDate;

              return (
                <div
                  key={idx}
                  onClick={() => !isEmpty && handleDayClick(day)}
                  className={`py-1.5 flex items-center justify-center rounded-lg transition-all ${
                    isEmpty
                      ? "opacity-0 pointer-events-none"
                      : isSelected
                      ? "bg-[#5B5CEB] text-white font-bold shadow-md shadow-[#5B5CEB]/25 scale-105 cursor-pointer"
                      : isBetween
                      ? "bg-[#5B5CEB]/20 text-[#5B5CEB] font-semibold cursor-pointer rounded-none"
                      : "text-white hover:bg-white/5 cursor-pointer"
                  } ${isStart && endDate !== null ? "rounded-r-none" : ""} ${isEnd ? "rounded-l-none" : ""}`}
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
            รายการนัดหมาย ช่วงวันที่{" "}
            {startDate !== null
              ? endDate !== null
                ? `${startDate} - ${endDate}`
                : `${startDate}`
              : "--"}{" "}
            พฤษภาคม
          </h3>
          <div className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="p-3 bg-[#18181B]/20 border-l-4 border-[#5B5CEB] rounded-r-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-[#5B5CEB]/20 text-[#5B5CEB] px-1.5 py-0.5 rounded font-mono font-bold mr-2">วันที่ {event.day}</span>
                      <h4 className="text-xs font-semibold text-white inline-block">{event.title}</h4>
                    </div>
                    <span className="text-[9px] text-[#B3B3B3] font-mono">{event.time}</span>
                  </div>
                  <p className="text-[9px] text-[#B3B3B3] mt-1">📍 {event.loc}</p>
                </div>
              ))
            ) : (
              <div className="p-6 bg-[#18181B]/25 border border-dashed border-white/5 rounded-2xl text-center text-xs text-[#B3B3B3]/70">
                📭 ไม่มีรายการนัดหมายในช่วงวันที่เลือกครับบอส
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
            <h4 className="text-xs font-bold text-white mb-1">ช่วงเวลาของนัดหมาย 🗓️</h4>
            <p className="text-[10px] text-[#B3B3B3] leading-relaxed">
              บอสเลือกช่วงเวลาจัดตารางงานแบบเป็นช่วงวันแล้ว! ผมแสดงเฉพาะนัดหมายในช่วงที่บอสกำหนดไว้เท่านั้นครับบอส
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
