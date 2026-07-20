"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function TasksForm() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Create task modal states (Fix #4: 4 Exact fields: ชื่องาน, วันที่, เวลา, อธิบายเพิ่มเติม)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [newDetails, setNewDetails] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard_data" })
      });
      const result = await res.json();
      if (result.status === "success" && result.data) {
        setTasks(result.data.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const toggleTask = async (task: any) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    
    // Optimistic local update
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
      fetchTasks();
    } catch (err) {
      console.error("Error toggling task status:", err);
    }
  };

  // Fix #3: Fix submission response and error handling
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("กรุณากรอกชื่องานที่ต้องการบันทึกครับ");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_task",
          task_name: newTaskName.trim(),
          details: newDetails.trim(),
          due_date: dueDate,
          reminder_time: reminderTime,
          status: "Pending"
        })
      });

      const result = await res.json();

      if (result.status === "success") {
        // Optimistic UI update
        const createdTask = result.data || {
          task_id: "TASK_" + Date.now(),
          task_name: newTaskName.trim(),
          details: newDetails.trim(),
          due_date: dueDate,
          reminder_time: reminderTime,
          status: "Pending"
        };
        setTasks(prev => [createdTask, ...prev]);

        // Reset form & close modal
        setNewTaskName("");
        setNewDetails("");
        setDueDate("");
        setReminderTime("09:00");
        setShowCreateModal(false);
        fetchTasks();
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + (result.message || "ไม่สามารถบันทึกงานได้"));
      }
    } catch (err: any) {
      console.error("Error creating task:", err);
      alert("❌ ไม่สามารถเชื่อมต่อกับระบบได้: " + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const isCompleted = t.status === "Completed";
    if (activeTab === "ทั้งหมด") return true;
    if (activeTab === "วันนี้") return true;
    if (activeTab === "กำลังทำ") return !isCompleted;
    if (activeTab === "เสร็จแล้ว") return isCompleted;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-main p-6 font-sans">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-surface border border-primary/30 animate-bounce flex items-center justify-center">
          <Image src="/avatar/thinking.png" alt="Thinking" width={80} height={80} className="object-cover" />
        </div>
        <p className="text-xs text-text-sub">กำลังซิงก์รายการงาน...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-text-main">สิ่งที่ต้องทำ</h1>
            <p className="text-[10px] text-text-sub">จัดการภารกิจและแจ้งเตือนความจำส่วนตัว</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>บันทึกความจำ</span>
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
                  ? "bg-primary text-white font-bold shadow-sm"
                  : "text-text-sub hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task List Container */}
        <section className="mb-6 space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === "Completed";
              return (
                <div
                  key={task.task_id}
                  onClick={() => toggleTask(task)}
                  className="flex items-center justify-between p-3.5 bg-surface/40 hover:bg-surface/70 border border-white/5 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isCompleted ? "bg-primary border-primary" : "border-white/20 bg-background"
                    }`}>
                      {isCompleted && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`text-xs font-semibold block ${isCompleted ? "text-text-sub line-through" : "text-text-main"}`}>
                        {task.task_name}
                      </span>
                      {task.details && (
                        <p className="text-[10px] text-text-sub mt-0.5">{task.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-sub font-mono block">{task.due_date || "ด่วน"}</span>
                    {task.reminder_time && (
                      <span className="text-[9px] text-primary/80 block font-bold">⏰ {task.reminder_time}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 bg-surface/20 border border-dashed border-white/10 rounded-2xl text-center text-xs text-text-sub">
              📭 ไม่มีรายการงานค้างสะสมครับ
            </div>
          )}
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-primary/25 p-4 rounded-2xl flex items-center gap-4 mt-6 shadow-sm">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-primary/30 shadow-md">
            <Image
              src="/avatar/plan.png"
              alt="Plan Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">รายการสิ่งที่ต้องทำ 📋</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              บันทึกงานจะถูกซิงก์ลง Google Tasks และ Google Sheets อัตโนมัติ สามารถติ๊กถูกเพื่ออัปเดตสถานะเสร็จสิ้นได้ทันทีครับ!
            </p>
          </div>
        </div>
      </div>

      {/* Fix #4: Create Task Modal with 4 Exact Fields (ชื่องาน, วันที่, เวลา, อธิบายเพิ่มเติม) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <form 
            onSubmit={handleCreateTask}
            className="bg-surface border border-white/15 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col relative text-text-main space-y-4"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <h3 className="text-sm font-bold text-text-main">บันทึกความจำ / สิ่งที่ต้องทำ</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-text-sub hover:text-text-main p-1 rounded-full hover:bg-white/5 transition-all text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* 4 Form Fields */}
            <div className="space-y-3.5">
              {/* Field 1: ชื่องาน */}
              <div>
                <label className="block mb-1 text-[11px] text-text-main font-bold">
                  1. ชื่องาน <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="เช่น ซื้อของเข้าบ้าน, เคลียร์บัญชีปลายเดือน..."
                  required
                  className="w-full bg-background border border-white/10 p-3 rounded-xl text-text-main text-xs focus:border-primary focus:outline-none placeholder-text-sub/50 shadow-inner"
                />
              </div>

              {/* Field 2 & 3: วันที่ & เวลา (Side by Side) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Field 2: วันที่ */}
                <div>
                  <label className="block mb-1 text-[11px] text-text-main font-bold flex items-center gap-1">
                    <span>📅</span>
                    <span>2. วันที่</span>
                  </label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-background border border-white/10 p-2.5 rounded-xl text-text-main text-xs focus:border-primary focus:outline-none shadow-inner"
                  />
                </div>

                {/* Field 3: เวลา */}
                <div>
                  <label className="block mb-1 text-[11px] text-text-main font-bold flex items-center gap-1">
                    <span>⏰</span>
                    <span>3. เวลา</span>
                  </label>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-background border border-white/10 p-2.5 rounded-xl text-text-main text-xs focus:border-primary focus:outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Field 4: อธิบายเพิ่มเติม */}
              <div>
                <label className="block mb-1 text-[11px] text-text-main font-bold flex items-center gap-1">
                  <span>💬</span>
                  <span>4. อธิบายเพิ่มเติม</span>
                </label>
                <textarea 
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="ระบุข้อความรายละเอียดเพิ่มเติม..."
                  className="w-full bg-background border border-white/10 p-3 rounded-xl text-text-main text-xs focus:border-primary focus:outline-none placeholder-text-sub/50 h-20 resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {createLoading ? "กำลังบันทึก..." : "บันทึกรายการสิ่งที่ต้องทำ 💾"}
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Assistant v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}

export default function TasksScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center text-text-main">
        กำลังโหลดรายการภารกิจ...
      </div>
    }>
      <TasksForm />
    </Suspense>
  );
}
