"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("สวัสดีครับบอส 👔");
  const [avatar, setAvatar] = useState("/avatar/hello.png");
  const [tasks, setTasks] = useState([
    { id: 1, text: "เช็คอินลูกค้า Little Bro Hostel", time: "10:00", done: false },
    { id: 2, text: "ตอบแชทลูกค้า", time: "11:30", done: true },
    { id: 3, text: "อัพเดตสต็อกของใช้", time: "14:00", done: false },
  ]);

  useEffect(() => {
    // Check onboarding status
    const onboarded = localStorage.getItem("little_bro_onboarded");
    if (!onboarded) {
      router.push("/onboarding");
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("สวัสดีตอนเช้าบอส! ☀️");
      setAvatar("/avatar/hello.png");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("สวัสดีตอนบ่ายบอส! 🌤️");
      setAvatar("/avatar/working.png");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("สวัสดีตอนเย็นบอส! 🌙");
      setAvatar("/avatar/great.png");
    } else {
      setGreeting("ดึกแล้วครับบอส รักษาสุขภาพด้วย 💤");
      setAvatar("/avatar/ready.png");
    }
  }, [router]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white mb-1 transition-all duration-300">
              {greeting}
            </h1>
            <p className="text-xs text-[#B3B3B3]">มีอะไรให้ช่วยวันนี้?</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Icon */}
            <button className="bg-[#18181B] border border-white/5 p-2 rounded-full text-[#B3B3B3] hover:text-white transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>
            {/* Character Avatar */}
            <div className="w-10 h-10 rounded-full border border-[#5B5CEB]/30 overflow-hidden bg-[#18181B]">
              <Image
                src={avatar}
                alt="Little Bro Avatar"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* Universal Search Bar */}
        <div className="bg-[#18181B]/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 mb-6 flex items-center shadow-lg transition-all duration-300 focus-within:border-[#5B5CEB]/50">
          <span className="text-[#B3B3B3] mr-2">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาภารกิจ รายการเงิน หรือไฟล์..."
            className="bg-transparent w-full focus:outline-none text-xs placeholder-[#B3B3B3] text-white"
          />
          <button className="text-[#B3B3B3] hover:text-white px-1">🎙️</button>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => alert("ระบบบันทึกรายรับจะเปิดใช้งานในเฟสถัดไปครับบอส!")}
            className="flex flex-col items-center gap-1.5 p-2 bg-[#18181B]/40 hover:bg-[#18181B]/60 border border-white/5 rounded-xl transition-all"
          >
            <span className="text-xl bg-[#10B981]/20 p-2.5 rounded-xl text-[#10B981]">📈</span>
            <span className="text-[10px] text-[#B3B3B3]">เพิ่มรายรับ</span>
          </button>
          
          <Link
            href="/add-expense"
            className="flex flex-col items-center gap-1.5 p-2 bg-[#18181B]/40 hover:bg-[#18181B]/60 border border-white/5 rounded-xl transition-all text-center"
          >
            <span className="text-xl bg-[#EF4444]/20 p-2.5 rounded-xl text-[#EF4444]">📉</span>
            <span className="text-[10px] text-[#B3B3B3]">เพิ่มรายจ่าย</span>
          </Link>

          <button
            onClick={() => alert("ระบบสร้างงานใหม่จะเปิดใช้งานในเฟสถัดไปครับบอส!")}
            className="flex flex-col items-center gap-1.5 p-2 bg-[#18181B]/40 hover:bg-[#18181B]/60 border border-white/5 rounded-xl transition-all"
          >
            <span className="text-xl bg-[#F59E0B]/20 p-2.5 rounded-xl text-[#F59E0B]">📝</span>
            <span className="text-[10px] text-[#B3B3B3]">สร้างงาน</span>
          </button>

          <button
            onClick={() => alert("ระบบบันทึกโน้ตด่วนจะเปิดใช้งานในเฟสถัดไปครับบอส!")}
            className="flex flex-col items-center gap-1.5 p-2 bg-[#18181B]/40 hover:bg-[#18181B]/60 border border-white/5 rounded-xl transition-all"
          >
            <span className="text-xl bg-[#3B82F6]/20 p-2.5 rounded-xl text-[#3B82F6]">📁</span>
            <span className="text-[10px] text-[#B3B3B3]">บันทึกโน้ต</span>
          </button>
        </div>

        {/* Dashboard "ภาพรวมวันนี้" */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider mb-3">ภาพรวมวันนี้</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#18181B]/40 backdrop-blur-lg border border-white/5 p-3 rounded-2xl">
              <h3 className="text-[9px] text-[#B3B3B3] mb-1">รายรับ</h3>
              <p className="text-sm font-bold text-white">฿12,450</p>
              <span className="text-[8px] text-[#10B981] font-semibold">+12%</span>
            </div>
            <div className="bg-[#18181B]/40 backdrop-blur-lg border border-white/5 p-3 rounded-2xl">
              <h3 className="text-[9px] text-[#B3B3B3] mb-1">รายจ่าย</h3>
              <p className="text-sm font-bold text-white">฿8,170</p>
              <span className="text-[8px] text-[#EF4444] font-semibold">-5%</span>
            </div>
            <div className="bg-[#18181B]/40 backdrop-blur-lg border border-[#5B5CEB]/20 p-3 rounded-2xl">
              <h3 className="text-[9px] text-[#B3B3B3] mb-1">กำไรสุทธิ</h3>
              <p className="text-sm font-bold text-[#10B981]">฿4,280</p>
              <span className="text-[8px] text-[#10B981] font-semibold">+18%</span>
            </div>
          </div>
        </section>

        {/* Tasks Section "งานที่ต้องทำวันนี้" */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">งานที่ต้องทำวันนี้</h2>
            <Link href="/tasks" className="text-[10px] text-[#5B5CEB] hover:underline">ดูทั้งหมด &gt;</Link>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="flex items-center justify-between p-3.5 bg-[#18181B]/30 hover:bg-[#18181B]/50 border border-white/5 rounded-xl cursor-pointer transition-all duration-200"
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
                  <span className={`text-xs ${task.done ? "text-[#B3B3B3] line-through" : "text-white"}`}>
                    {task.text}
                  </span>
                </div>
                <span className="text-[10px] text-[#B3B3B3] font-mono">{task.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar Section "ปฏิทินวันนี้" */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">ปฏิทินวันนี้</h2>
            <Link href="/calendar" className="text-[10px] text-[#5B5CEB] hover:underline">ดูทั้งหมด &gt;</Link>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-[#18181B]/20 border-l-4 border-[#5B5CEB] rounded-r-xl">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-semibold text-white">เช็คอินลูกค้า Little Bro Hostel</h4>
                <span className="text-[9px] text-[#B3B3B3]">10:00 - 11:00</span>
              </div>
              <p className="text-[10px] text-[#B3B3B3] mt-1">Little Bro Hostel Lobby</p>
            </div>
            <div className="p-3 bg-[#18181B]/20 border-l-4 border-[#10B981] rounded-r-xl">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-semibold text-white">ประชุมทีม Google Meet</h4>
                <span className="text-[9px] text-[#B3B3B3]">14:00 - 15:30</span>
              </div>
              <p className="text-[10px] text-[#B3B3B3] mt-1">Google Meet Link in Calendar</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="mt-4 text-center text-[10px] text-[#B3B3B3]/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
