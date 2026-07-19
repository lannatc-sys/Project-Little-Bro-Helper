"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("สวัสดีครับบอส 👔");
  const [avatar, setAvatar] = useState("/avatar/hello.png");
  
  // Dashboard sync states
  const [loading, setLoading] = useState(true);
  const [incomeSum, setIncomeSum] = useState(0);
  const [expenseSum, setExpenseSum] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard_data" })
      });
      const result = await res.json();
      
      if (result.status === "success" && result.data) {
        const { finance = [], tasks = [], calendar = [] } = result.data;
        
        // Calculate finance sums
        let inc = 0;
        let exp = 0;
        finance.forEach((item: any) => {
          const amt = Number(item.amount || 0);
          if (item.transaction_type === "Income") {
            inc += amt;
          } else if (item.transaction_type === "Expense") {
            exp += amt;
          }
        });
        setIncomeSum(inc);
        setExpenseSum(exp);

        // Set tasks
        setTasks(tasks);

        // Set calendar events
        setEvents(calendar);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check onboarding status
    const onboarded = localStorage.getItem("little_bro_onboarded");
    if (!onboarded) {
      router.push("/onboarding");
      return;
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("สวัสดีตอนเช้าครับ! ☀️");
      setAvatar("/avatar/hello.png");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("สวัสดีตอนบ่ายครับ! 🌤️");
      setAvatar("/avatar/working.png");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("สวัสดีตอนเย็นครับ! 🌙");
      setAvatar("/avatar/great.png");
    } else {
      setGreeting("ดึกแล้วครับ รักษาสุขภาพด้วยนะครับ 💤");
      setAvatar("/avatar/ready.png");
    }

    fetchDashboardData();
  }, [router]);

  const toggleTask = async (task: any) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    
    // Optimistic local state update
    setTasks(prev => prev.map(t => t.task_id === task.task_id ? { ...t, status: nextStatus } : t));

    try {
      await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_task_status",
          task_id: task.task_id,
          status: nextStatus
        })
      });
      // Refresh to make sure
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  // Filter today's tasks (limit to 3 for preview)
  const todayTasksPreview = tasks.slice(0, 3);
  // Filter today's events preview
  const eventsPreview = events.slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-main p-6 font-sans">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-white border border-[#5B5CEB]/30 animate-bounce flex items-center justify-center">
          <Image src="/avatar/thinking.png" alt="Thinking" width={80} height={80} className="object-cover" />
        </div>
        <p className="text-xs text-text-sub">กำลังซิงก์ข้อมูลบัญชีส่วนตัว...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-text-main mb-1 transition-all duration-300">
              {greeting}
            </h1>
            <p className="text-xs text-text-sub">มีอะไรให้ช่วยวันนี้บ้างครับ?</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-surface border border-white/5 p-2 rounded-full text-text-sub hover:text-text-main transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full border border-[#5B5CEB]/30 overflow-hidden bg-white">
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
        <div className="bg-surface/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 mb-6 flex items-center shadow-lg transition-all duration-300 focus-within:border-[#5B5CEB]/50">
          <span className="text-text-sub mr-2">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาบันทึก รายการเงิน หรือไฟล์..."
            className="bg-transparent w-full focus:outline-none text-xs placeholder-text-sub text-text-main"
          />
          <button className="text-text-sub hover:text-text-main px-1">🎙️</button>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-5 gap-1.5 mb-6">
          <Link
            href="/add-expense?type=income"
            className="flex flex-col items-center gap-1 p-2 bg-surface/40 hover:bg-surface/60 border border-white/5 rounded-xl transition-all text-center"
          >
            <span className="text-lg bg-[#10B981]/20 p-2 rounded-xl text-[#10B981]">📈</span>
            <span className="text-[9px] text-text-sub truncate w-full">เพิ่มรายรับ</span>
          </Link>
          
          <Link
            href="/add-expense?type=expense"
            className="flex flex-col items-center gap-1 p-2 bg-surface/40 hover:bg-surface/60 border border-white/5 rounded-xl transition-all text-center"
          >
            <span className="text-lg bg-[#EF4444]/20 p-2 rounded-xl text-[#EF4444]">📉</span>
            <span className="text-[9px] text-text-sub truncate w-full">เพิ่มรายจ่าย</span>
          </Link>

          <Link
            href="/tasks?create=true"
            className="flex flex-col items-center gap-1 p-2 bg-surface/40 hover:bg-surface/60 border border-white/5 rounded-xl transition-all text-center"
          >
            <span className="text-lg bg-[#F59E0B]/20 p-2 rounded-xl text-[#F59E0B]">📝</span>
            <span className="text-[9px] text-text-sub truncate w-full">สร้างงาน</span>
          </Link>

          <Link
            href="/files"
            className="flex flex-col items-center gap-1 p-2 bg-surface/40 hover:bg-surface/60 border border-white/5 rounded-xl transition-all text-center"
          >
            <span className="text-lg bg-[#3B82F6]/20 p-2 rounded-xl text-[#3B82F6]">📁</span>
            <span className="text-[9px] text-text-sub truncate w-full">คลังไฟล์</span>
          </Link>

          <Link
            href="/customers"
            className="flex flex-col items-center gap-1 p-2 bg-surface/40 hover:bg-surface/60 border border-white/5 rounded-xl transition-all text-center"
          >
            <span className="text-lg bg-[#A855F7]/20 p-2 rounded-xl text-[#A855F7]">👤</span>
            <span className="text-[9px] text-text-sub truncate w-full">สมุดรายชื่อ</span>
          </Link>
        </div>

        {/* Dashboard "ภาพรวมวันนี้" */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">ภาพรวมการเงิน</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface/40 backdrop-blur-lg border border-white/5 p-3 rounded-2xl">
              <h3 className="text-[9px] text-text-sub mb-1">รายรับรวม</h3>
              <p className="text-xs font-bold text-text-main">฿{incomeSum.toLocaleString("th-TH")}</p>
              <span className="text-[8px] text-[#10B981] font-semibold">ซิงก์จริง</span>
            </div>
            <div className="bg-surface/40 backdrop-blur-lg border border-white/5 p-3 rounded-2xl">
              <h3 className="text-[9px] text-text-sub mb-1">รายจ่ายรวม</h3>
              <p className="text-xs font-bold text-text-main">฿{expenseSum.toLocaleString("th-TH")}</p>
              <span className="text-[8px] text-[#EF4444] font-semibold">ซิงก์จริง</span>
            </div>
            <div className="bg-surface/40 backdrop-blur-lg border border-[#5B5CEB]/20 p-3 rounded-2xl">
              <h3 className="text-[9px] text-text-sub mb-1">ยอดคงเหลือ</h3>
              <p className={`text-xs font-bold ${incomeSum - expenseSum >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                ฿{(incomeSum - expenseSum).toLocaleString("th-TH")}
              </p>
              <span className="text-[8px] text-[#5B5CEB] font-semibold">ยอดสุทธิ</span>
            </div>
          </div>
        </section>

        {/* Tasks Section "งานที่ต้องทำวันนี้" */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-text-sub uppercase tracking-wider">รายการค้างทำ</h2>
            <Link href="/tasks" className="text-[10px] text-[#5B5CEB] hover:underline">ดูทั้งหมด &gt;</Link>
          </div>
          <div className="space-y-2">
            {todayTasksPreview.length > 0 ? (
              todayTasksPreview.map((task) => {
                const isCompleted = task.status === "Completed";
                return (
                  <div
                    key={task.task_id}
                    onClick={() => toggleTask(task)}
                    className="flex items-center justify-between p-3.5 bg-surface/30 hover:bg-surface/50 border border-white/5 rounded-xl cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isCompleted ? "bg-[#5B5CEB] border-[#5B5CEB]" : "border-white/20"
                      }`}>
                        {isCompleted && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${isCompleted ? "text-text-sub line-through" : "text-text-main"}`}>
                        {task.task_name}
                      </span>
                    </div>
                    <span className="text-[9px] text-text-sub font-mono">{task.due_date || "ด่วน"}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-surface/20 border border-dashed border-white/5 rounded-xl text-center text-xs text-text-sub">
                📭 ไม่มีรายการงานค้างสะสมครับ
              </div>
            )}
          </div>
        </section>

        {/* Calendar Section "ปฏิทินวันนี้" */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-text-sub uppercase tracking-wider">กิจกรรมส่วนตัวล่าสุด</h2>
            <Link href="/calendar" className="text-[10px] text-[#5B5CEB] hover:underline">ดูทั้งหมด &gt;</Link>
          </div>
          <div className="space-y-2">
            {eventsPreview.length > 0 ? (
              eventsPreview.map((event) => (
                <div key={event.event_id} className="p-3 bg-surface/20 border-l-4 border-[#5B5CEB] rounded-r-xl">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-semibold text-text-main">{event.event_title}</h4>
                    <span className="text-[9px] text-text-sub font-mono">{event.start_time || "ทั้งวัน"}</span>
                  </div>
                  <p className="text-[10px] text-text-sub mt-1">📍 {event.location || "ไม่ได้ระบุสถานที่"}</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-surface/20 border border-dashed border-white/5 rounded-xl text-center text-xs text-text-sub">
                📅 ไม่มีกิจกรรมส่วนตัวบันทึกไว้ในระบบครับ
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="mt-4 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
