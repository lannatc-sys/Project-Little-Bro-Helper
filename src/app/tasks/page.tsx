"use client";

import { useState } from "react";
import Image from "next/image";

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [tasks, setTasks] = useState([
    { id: 1, text: "เช็คอินลูกค้า Little Bro Hostel", time: "10:00", date: "today", done: false },
    { id: 2, text: "ตอบแชทลูกค้า", time: "11:30", date: "today", done: true },
    { id: 3, text: "อัพเดตสต็อกของใช้", time: "14:00", date: "today", done: false },
    { id: 4, text: "ตรวจสอบการกรอง", time: "15:30", date: "today", done: false },
    { id: 5, text: "สรุปรายงานประจำวัน", time: "17:00", date: "today", done: false },
    { id: 6, text: "เช็คเอาท์ลูกค้า", time: "10:00", date: "tomorrow", done: false },
    { id: 7, text: "ทำความสะอาดห้อง", time: "12:00", date: "tomorrow", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "ทั้งหมด") return true;
    if (activeTab === "วันนี้") return t.date === "today";
    if (activeTab === "กำลังทำ") return !t.done;
    if (activeTab === "เสร็จแล้ว") return t.done;
    return true;
  });

  const todayTasks = filteredTasks.filter((t) => t.date === "today");
  const tomorrowTasks = filteredTasks.filter((t) => t.date === "tomorrow");

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-main">งานของฉัน</h1>
          <button
            onClick={() => alert("ระบบสร้างงานผ่าน Apps Script จะเพิ่มในเฟสถัดไปครับบอส!")}
            className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/80 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
          >
            + สร้างงาน
          </button>
        </header>

        {/* Tab Headers */}
        <div className="flex bg-surface p-1.5 rounded-xl border border-white/5 mb-6 justify-between text-center">
          {["ทั้งหมด", "วันนี้", "กำลังทำ", "เสร็จแล้ว"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-[#5B5CEB] text-white font-bold"
                  : "text-text-sub hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Today's Tasks Group */}
        {todayTasks.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-text-sub mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B5CEB]"></span>
              วันนี้ • 20 พฤษภาคม 2567
            </h3>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-3.5 bg-surface/30 hover:bg-surface/50 border border-white/5 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      task.done ? "bg-[#5B5CEB] border-[#5B5CEB]" : "border-white/20"
                    }`}>
                      {task.done && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${task.done ? "text-text-sub line-through" : "text-text-main"}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-sub font-mono">{task.time}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tomorrow's Tasks Group */}
        {tomorrowTasks.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xs font-semibold text-text-sub mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B3B3B3]"></span>
              พรุ่งนี้ • 21 พฤษภาคม 2567
            </h3>
            <div className="space-y-2">
              {tomorrowTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-3.5 bg-surface/30 hover:bg-surface/50 border border-white/5 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      task.done ? "bg-[#5B5CEB] border-[#5B5CEB]" : "border-white/20"
                    }`}>
                      {task.done && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${task.done ? "text-text-sub line-through" : "text-text-main"}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-sub font-mono">{task.time}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4 mt-6">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/plan.png"
              alt="Plan Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">จัดการคิวงานระบบ 📋</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              งานวันนี้เคลียร์ไปแล้ว 1 รายการ เหลืออีก 4 รายการด่วน ผมเรียงลำดับเวลาการดำเนินงานของบอสตามเป้าหมายของ Google Sheets ให้เรียบร้อยครับ!
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
