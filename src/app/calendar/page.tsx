"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function CalendarScreen() {
  const [view, setView] = useState("เดือน");
  const [startDate, setStartDate] = useState<number | null>(20);
  const [endDate, setEndDate] = useState<number | null>(22);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  // Create event modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [eventDay, setEventDay] = useState(20);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Dummy calendar days for May 2026
  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startOffset = 5; // May 2026 starts on Friday
  const calendarGrid = [
    ...Array(startOffset).fill(""),
    ...daysInMonth
  ];

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard_data" })
      });
      const result = await res.json();
      if (result.status === "success" && result.data) {
        setEvents(result.data.calendar || []);
      }
    } catch (err) {
      console.error("Error fetching calendar events:", err);
    } finally {
      setView("เดือน");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleDayClick = (day: number) => {
    if (startDate === null || (startDate !== null && endDate !== null)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (day < startDate) {
        setStartDate(day);
        setEndDate(null);
      } else if (day === startDate) {
        setStartDate(null);
      } else {
        setEndDate(day);
      }
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    setCreateLoading(true);
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_event",
          event_title: newEventTitle,
          start_time: `วันที่ ${eventDay} พฤษภาคม (${startTime} - ${endTime})`,
          end_time: endTime,
          location,
          notes
        })
      });
      const result = await res.json();
      if (result.status === "success") {
        setNewEventTitle("");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setNotes("");
        setShowCreateModal(false);
        fetchCalendarEvents();
      }
    } catch (err) {
      console.error("Error creating event:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const getFilteredEvents = () => {
    if (startDate === null) return [];
    return events.filter(e => {
      const match = e.start_time ? e.start_time.match(/วันที่ (\d+)/) : null;
      const day = match ? Number(match[1]) : 20;
      if (endDate === null) {
        return day === startDate;
      }
      return day >= startDate && day <= endDate;
    });
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-main p-6 font-sans">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-surface border border-[#5B5CEB]/30 animate-bounce flex items-center justify-center">
          <Image src="/avatar/thinking.png" alt="Thinking" width={80} height={80} className="object-cover" />
        </div>
        <p className="text-xs text-text-sub">กำลังซิงก์ปฏิทินนัดหมาย...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-main">ปฏิทิน</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/80 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
          >
            + นัดหมายกิจกรรม
          </button>
        </header>

        {/* View Selector */}
        <div className="flex bg-surface p-1.5 rounded-xl border border-white/5 mb-6 justify-between text-center">
          {["วัน", "สัปดาห์", "เดือน", "วาระ"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all ${
                view === v
                  ? "bg-[#5B5CEB] text-white font-bold"
                  : "text-text-sub hover:text-text-main"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Month Title */}
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-sm font-bold">พฤษภาคม 2567</span>
          <button
            onClick={() => {
              const todayDay = new Date().getDate();
              setStartDate(todayDay);
              setEndDate(null);
            }}
            className="text-[10px] text-[#5B5CEB] bg-[#5B5CEB]/10 hover:bg-[#5B5CEB]/25 border border-[#5B5CEB]/30 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer"
          >
            กลับมาวันนี้
          </button>
        </div>

        {/* Calendar Grid representation */}
        <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl mb-6">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-text-sub mb-2 font-semibold">
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
                      : "text-text-main hover:bg-white/5 cursor-pointer"
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
          <h3 className="text-xs font-semibold text-text-sub mb-3">
            รายการนัดหมายและกิจกรรม ช่วงวันที่{" "}
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
                <div key={event.event_id} className="p-3 bg-surface/20 border-l-4 border-[#5B5CEB] rounded-r-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-[#5B5CEB]/20 text-[#5B5CEB] px-1.5 py-0.5 rounded font-mono font-bold mr-2">ซิงก์คลาวด์</span>
                      <h4 className="text-xs font-semibold text-text-main inline-block">{event.event_title}</h4>
                    </div>
                    <span className="text-[9px] text-text-sub font-mono">{event.start_time}</span>
                  </div>
                  {event.location && (
                    <p className="text-[9px] text-text-sub mt-1">📍 {event.location}</p>
                  )}
                  {event.notes && (
                    <p className="text-[9px] text-text-sub/70 mt-0.5 italic">📝 {event.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 bg-surface/25 border border-dashed border-white/5 rounded-2xl text-center text-xs text-text-sub/70">
                📭 ไม่มีกิจกรรมส่วนตัวบันทึกไว้ในช่วงวันที่เลือกครับ
              </div>
            )}
          </div>
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/inspect.png"
              alt="Inspect Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">ช่วงเวลาของกิจกรรม 🗓️</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              ตารางกิจกรรมทั้งหมดซิงก์เชื่อมโยงกับฐานข้อมูลชีต Calendar สามารถสร้างตารางนัดใหม่และกำหนดเวลาได้อย่างอิสระครับ!
            </p>
          </div>
        </div>
      </div>

      {/* Create Event Modal Overlay */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <form 
            onSubmit={handleCreateEvent}
            className="bg-surface border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col relative text-text-main"
          >
            <button 
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-text-sub hover:text-text-main"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-text-main mb-4">📅 สร้างนัดหมายกิจกรรมใหม่</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-1 text-[10px] text-text-sub font-semibold">ชื่องาน (Event Title)</label>
                <input 
                  type="text" 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="เช่น ไปวิ่งออกกำลังกายตอนเย็น..."
                  required
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] text-text-sub font-semibold">วันที่ในปฏิทิน (Day of May)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="31"
                    value={eventDay}
                    onChange={(e) => setEventDay(Number(e.target.value))}
                    required
                    className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] text-text-sub font-semibold">สถานที่ (Location)</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น สวนสาธารณะ / ฟิตเนส"
                    className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[10px] text-text-sub font-semibold">เวลาเริ่ม (Start)</label>
                  <input 
                    type="text" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="เช่น 17:30"
                    className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] text-text-sub font-semibold">เวลาสิ้นสุด (End)</label>
                  <input 
                    type="text" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="เช่น 19:00"
                    className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-text-sub font-semibold">หมายเหตุ/โน้ต (Notes)</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น เตรียมรองเท้าวิ่งและหูฟัง..."
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 disabled:bg-[#5B5CEB]/50 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {createLoading ? "กำลังบันทึก..." : "บันทึกนัดหมายกิจกรรม 💾"}
            </button>
          </form>
        </div>
      )}

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Assistant v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
